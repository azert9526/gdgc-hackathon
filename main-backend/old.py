# platform_backend.py
"""
Platform backend that:
- Redirects users to Google OAuth (/login)
- Handles OAuth callback and exchanges code for access_token (/oauth/callback)
- Lists the user's projects (/projects)
- Deploys a Cloud Run service in the user's project (/deploy)
- Optionally stores users and projects in Supabase (single-file)
Run: uvicorn platform_backend:app --host 0.0.0.0 --port 8080
"""

import os
import time
from typing import Dict, List, Optional

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel, Field

app = FastAPI()

# CONFIG (set these in container env)
CLIENT_ID = os.getenv("OAUTH_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("OAUTH_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8080/oauth/callback")
PLATFORM_URL = os.getenv("PLATFORM_URL", "http://localhost:8080")

# Supabase config (optional)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# print envs
print("CONFIG:")
print(f"CLIENT_ID: {'set' if CLIENT_ID else 'NOT SET'}")
print(f"CLIENT_SECRET: {'set' if CLIENT_SECRET else 'NOT SET'}")
print(f"REDIRECT_URI: {REDIRECT_URI}")
print(f"PLATFORM_URL: {PLATFORM_URL}")
print(f"SUPABASE_URL: {'set' if SUPABASE_URL else 'NOT SET'}")
print(f"SUPABASE_KEY: {'set' if SUPABASE_KEY else 'NOT SET'}")

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"
OAUTH_SCOPE = "openid email profile https://www.googleapis.com/auth/cloud-platform"


# Supabase client (optional)
supabase = None
try:
    from supabase import create_client, Client  # type: ignore
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
except Exception:
    supabase = None


def _ensure_supabase():
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase client not configured (SUPABASE_URL / SUPABASE_KEY)")


# Supabase helpers
def create_user(email: str):
    _ensure_supabase()
    res = supabase.table("users").insert({"email": email}).execute()
    if getattr(res, "status_code", None) and res.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=str(res.data))
    return res.data[0] if res.data else None


def get_user_by_email(email: str):
    _ensure_supabase()
    res = supabase.table("users").select("*").eq("email", email).execute()
    if not res.data:
        return None
    return res.data[0]


def add_project(user_id: str, project_id: str):
    _ensure_supabase()
    existing = get_projects_by_user(user_id)
    if project_id in [p.get("project_id") for p in existing]:
        for p in existing:
            if p.get("project_id") == project_id:
                return p
    res = supabase.table("projects").insert({"user_id": user_id, "project_id": project_id}).execute()
    if getattr(res, "status_code", None) and res.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=str(res.data))
    return res.data[0] if res.data else None


def get_projects_by_user(user_id: str):
    _ensure_supabase()
    res = supabase.table("projects").select("*").eq("user_id", user_id).execute()
    return res.data if res.data else []


def get_email_from_token(access_token: str) -> str:
    resp = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if resp.status_code != 200:
        raise Exception(f"Failed to fetch user info: {resp.status_code} {resp.text}")
    return resp.json().get("email")


# Cloud Run helpers
def region_run_endpoint(region: str) -> str:
    return f"https://{region}-run.googleapis.com"


def auth_headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def create_knative_service_body(service_name: str, container_image: str, env: Dict[str, str]) -> Dict:
    env_items = [{"name": k, "value": v} for k, v in env.items()]
    return {
        "apiVersion": "serving.knative.dev/v1",
        "kind": "Service",
        "metadata": {"name": service_name},
        "spec": {
            "template": {
                "metadata": {"annotations": {}},
                "spec": {"containers": [{"image": container_image, "env": env_items}]},
            }
        },
    }


def poll_for_service_link(region: str, project_id: str, service_name: str, token: str, timeout: int = 60) -> Optional[str]:
    endpoint = f"{region_run_endpoint(region)}/apis/serving.knative.dev/v1/namespaces/{project_id}/services/{service_name}"
    headers = auth_headers(token)
    for _ in range(timeout):
        r = requests.get(endpoint, headers=headers)
        if r.status_code == 200:
            j = r.json()
            url = j.get("status", {}).get("url")
            if url:
                return url
        time.sleep(1)
    return None


# Models
class DeployRequest(BaseModel):
    project_id: str = Field(min_length=3)
    region: str = Field(min_length=3)
    service_name: str = Field(min_length=3, max_length=63)
    container_image: str
    env: Dict[str, str] = Field(default_factory=dict)
    allowed_ips: List[str] = Field(default_factory=list)
    access_token: Optional[str] = None
    user_email: Optional[str] = None


@app.get("/login")
def login():
    from urllib.parse import urlencode

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": OAUTH_SCOPE,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = AUTH_ENDPOINT + "?" + urlencode(params)
    return RedirectResponse(url)


@app.get("/oauth/callback")
def oauth_callback(code: Optional[str] = None):
    """
    Exchange authorization code for access_token and create user in Supabase (by email).
    Returns JSON with token info and stored user row (if Supabase configured).
    """
    if not code:
        raise HTTPException(status_code=400, detail="missing code")

    # Exchange code for token
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    r = requests.post(TOKEN_ENDPOINT, data=data)
    if r.status_code != 200:
        raise HTTPException(status_code=500, detail=f"token exchange failed: {r.status_code} {r.text}")

    token_resp = r.json()
    access_token = token_resp.get("access_token")
    id_token = token_resp.get("id_token")

    # Try userinfo via access_token first
    user_info = None
    user_info_resp = None
    if access_token:
        user_info_resp = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_resp.status_code == 200:
            user_info = user_info_resp.json()

    # Fallback: parse id_token payload to extract email if userinfo fails
    if user_info is None and id_token:
        try:
            import base64, json
            parts = id_token.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * (-len(parts[1]) % 4)
                payload = base64.urlsafe_b64decode(padded.encode("utf-8"))
                claims = json.loads(payload.decode("utf-8"))
                user_info = {"email": claims.get("email"), "sub": claims.get("sub"), "name": claims.get("name")}
        except Exception:
            user_info = None

    if user_info is None:
        detail = user_info_resp.text if user_info_resp is not None else "no id_token or access_token"
        raise HTTPException(status_code=500, detail=f"failed to fetch user info: {detail}")

    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=500, detail="no email returned from userinfo")

    # If Supabase configured, create or get user row
    user_row = None
    try:
        if SUPABASE_URL and SUPABASE_KEY:
            existing = get_user_by_email(email)
            if not existing:
                user_row = create_user(email)
            else:
                user_row = existing
    except HTTPException:
        user_row = None

    return JSONResponse({"token": token_resp, "user": user_row, "userinfo": user_info})

@app.get("/projects")
def list_projects(access_token: Optional[str] = Query(None, description="OAuth access token")):
    if not access_token:
        raise HTTPException(status_code=400, detail="missing access_token")
    headers = {"Authorization": f"Bearer {access_token}"}
    url = "https://cloudresourcemanager.googleapis.com/v1/projects"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        raise HTTPException(status_code=500, detail=f"projects.list failed: {r.status_code} {r.text}")

    data = r.json().get("projects", [])
    simplified = [{"projectId": p.get("projectId"), "name": p.get("name")} for p in data]
    return {"projects": simplified}

@app.post("/deploy")
def deploy(req: DeployRequest):
    print("Starting deploy endpoint")
    token = req.access_token
    if not token:
        raise HTTPException(status_code=400, detail="access_token not provided")
    print(f"Using token: {token[:10]}...")

    # Deploy to Cloud Run
    region_endpoint = region_run_endpoint(req.region)
    create_url = f"{region_endpoint}/apis/serving.knative.dev/v1/namespaces/{req.project_id}/services"
    env = dict(req.env or {})
    env["ALLOWED_IPS"] = ",".join(req.allowed_ips or [])
    body = create_knative_service_body(req.service_name, req.container_image, env)
    headers = auth_headers(token)

    print(f"Creating service at {create_url} with env {env}")
    r = requests.post(create_url, headers=headers, json=body)
    print(f"Create service response: {r.status_code} {r.text[:200]}")
    if not (200 <= r.status_code < 300):
        raise HTTPException(status_code=500, detail=f"create service failed: {r.status_code} {r.text}")

    service_link = poll_for_service_link(req.region, req.project_id, req.service_name, token, timeout=90)
    print(f"Polled service link: {service_link}")
    if not service_link:
        return {"status": "partial", "message": "service created but not ready"}

    # Make service public
    iam_url = f"https://run.googleapis.com/v1/projects/{req.project_id}/locations/{req.region}/services/{req.service_name}:setIamPolicy"
    policy_body = {"policy": {"bindings": [{"role": "roles/run.invoker", "members": ["allUsers"]}]}}
    p = requests.post(iam_url, headers=headers, json=policy_body)
    print(f"IAM policy set response: {p.status_code} {p.text[:200]}")
    if not (200 <= p.status_code < 300):
        return {"status": "partial", "service_link": service_link, "iam_error": p.text}

    # Supabase save
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            print("Supabase is configured, attempting to save project")


            email = get_email_from_token(token)
            user = get_user_by_email(email)

            if not user:
                print(f"User {email} not found, creating...")
                user = create_user(email)

            print(f"Supabase insert parameters: user_id={user['id']}, project_id={req.project_id}, service_link={service_link}")

            res = supabase.table("projects").insert({
                "user_id": user["id"],
                "project_id": req.project_id,
                "service_link": service_link
            }).execute()

            print(f"Supabase insert response: {getattr(res, 'status_code', None)}, {getattr(res, 'data', None)}")
        except Exception as e:
            print("Supabase save failed:", e)

    print("Deploy endpoint finished")
    return {"status": "success", "service_link": service_link}

@app.get("/regions")
def list_regions():
    return ["europe-west1", "us-central1", "asia-northeast1", "australia-southeast1", "northamerica-northeast1"]


@app.get("/health")
def health():
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("platform_backend:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
