import os
import requests
from typing import Optional
from urllib.parse import urlencode

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse, FileResponse

from config import (
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, AUTH_ENDPOINT, 
    TOKEN_ENDPOINT, OAUTH_SCOPE, PORT
)
from models import DeployRequest
from database import (
    supabase, get_user_by_email, create_user, 
    save_project, get_user_deployments
)
from google_utils import (
    get_email_from_token, region_run_endpoint, 
    create_knative_service_body, auth_headers, 
    poll_for_service_link, set_iam_policy, list_google_projects
)

app = FastAPI()

@app.get("/oauth-login")
def login():
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
    if not code:
        raise HTTPException(status_code=400, detail="missing code")

    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    r = requests.post(TOKEN_ENDPOINT, data=data)
    if r.status_code != 200:
        raise HTTPException(status_code=500, detail=f"token exchange failed: {r.text}")

    token_resp = r.json()
    access_token = token_resp.get("access_token")
    expires_in = token_resp.get("expires_in", 3599)
    
    email = get_email_from_token(access_token)
    
    if supabase:
        user_row = get_user_by_email(email)
        if not user_row:
            create_user(email)

    response = RedirectResponse(url="/dashboard")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=expires_in
    )
    response.set_cookie(
        key="user_email",
        value=email,
        httponly=False,
        secure=False,
        samesite="lax",
        max_age=expires_in
    )
    return response

@app.post("/deploy")
def deploy(req: DeployRequest, request: Request):
    token = req.access_token or request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=400, detail="access_token not provided")

    region_endpoint = region_run_endpoint(req.region)
    create_url = f"{region_endpoint}/apis/serving.knative.dev/v1/namespaces/{req.project_id}/services"
    
    env = dict(req.env or {})
    env["ALLOWED_IPS"] = ",".join(req.allowed_ips or [])
    body = create_knative_service_body(req.service_name, req.container_image, env, memory=req.memory)
    headers = auth_headers(token)

    r = requests.post(create_url, headers=headers, json=body)
    if r.status_code not in [200, 201, 202]:
        raise HTTPException(status_code=500, detail=f"create service failed: {r.text}")

    service_link = poll_for_service_link(req.region, req.project_id, req.service_name, token)
    
    if service_link:
        set_iam_policy(req.project_id, req.region, req.service_name, token)

    if supabase and service_link:
        try:
            email = get_email_from_token(token)
            user = get_user_by_email(email)
            if not user:
                user = create_user(email)
            save_project(user["id"], req.project_id, service_link)
        except Exception:
            pass

    return {"status": "success", "service_link": service_link}

@app.get("/my-deployments")
def get_my_deployments(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return []
    try:
        email = get_email_from_token(token)
        user = get_user_by_email(email)
        if not user or not supabase:
            return []
        return get_user_deployments(user["id"])
    except Exception:
        return []

@app.get("/projects")
def list_projects(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        return ["mate-tester-hak", "prod-cluster-01"]
    simplified = list_google_projects(token)
    return simplified if simplified else ["mate-tester-hak"]

@app.get("/regions")
def list_regions():
    return [
        "europe-west1", "us-central1", "asia-northeast1", 
        "australia-southeast1", "northamerica-northeast1"
    ]

@app.get("/health")
def health():
    return {"ok": True, "supabase_ready": supabase is not None}

@app.get("/{catchall:path}")
def serve_react_app(catchall: str):
    file_path = os.path.join("dist", catchall)
    if catchall and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join("dist", "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return JSONResponse(
        {"error": "Frontend build not found."}, 
        status_code=404
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
