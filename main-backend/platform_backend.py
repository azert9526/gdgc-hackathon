import os
import time
import requests
import base64
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query, Cookie, Request
from fastapi.responses import RedirectResponse, JSONResponse, FileResponse
from pydantic import BaseModel, Field

app = FastAPI()

# CONFIG
CLIENT_ID = os.getenv("OAUTH_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("OAUTH_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8080/oauth/callback")
PLATFORM_URL = os.getenv("PLATFORM_URL", "http://localhost:8080")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

print("\n=== SYSTEM STARTUP CONFIG CHECK ===")
print(f"OAUTH_CLIENT_ID:     {'[SET]' if CLIENT_ID else '[MISSING!]'}")
print(f"OAUTH_CLIENT_SECRET: {'[SET]' if CLIENT_SECRET else '[MISSING!]'}")
print(f"REDIRECT_URI:        {REDIRECT_URI}")
print(f"SUPABASE_URL:        {SUPABASE_URL if SUPABASE_URL else '[MISSING!]'}")
print(f"SUPABASE_KEY:        {'[SET]' if SUPABASE_KEY else '[MISSING!]'}")
print("===================================\n")

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"
OAUTH_SCOPE = "openid email profile https://www.googleapis.com/auth/cloud-platform"

supabase = None
try:
    from supabase import create_client, Client
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("DEBUG: Supabase client initialized successfully.")
    else:
        print("DEBUG: Supabase credentials missing. Client set to None.")
except Exception as e:
    print(f"DEBUG: Failed to initialize Supabase client: {e}")

def _ensure_supabase():
    if supabase is None:
        print("DEBUG ERROR: _ensure_supabase failed. Client is None.")
        raise HTTPException(status_code=500, detail="Supabase client not configured")

def create_user(email: str):
    _ensure_supabase()
    print(f"DEBUG: Attempting to INSERT user into Supabase: {email}")
    try:
        res = supabase.table("users").insert({"email": email}).execute()
        print(f"DEBUG: create_user result: {res}")
        if not res.data:
            print("DEBUG: create_user returned no data.")
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"DEBUG ERROR: Supabase insert failed: {e}")
        raise HTTPException(status_code=400, detail=f"Supabase error: {str(e)}")

def get_user_by_email(email: str):
    _ensure_supabase()
    print(f"DEBUG: Querying Supabase for user email: {email}")
    try:
        res = supabase.table("users").select("*").eq("email", email).execute()
        print(f"DEBUG: get_user_by_email response data: {res.data}")
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"DEBUG ERROR: Supabase select failed: {e}")
        return None

def get_email_from_token(access_token: str) -> str:
    print("DEBUG: Fetching user info from Google via access_token...")
    resp = requests.get(
        USERINFO_ENDPOINT,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if resp.status_code != 200:
        print(f"DEBUG ERROR: Google userinfo failed. Status: {resp.status_code}, Text: {resp.text}")
        raise Exception(f"Failed to fetch user info: {resp.text}")
    email = resp.json().get("email")
    print(f"DEBUG: Identified user email: {email}")
    return email

# Cloud Run helpers
def region_run_endpoint(region: str) -> str:
    return f"https://{region}-run.googleapis.com"

def auth_headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def create_knative_service_body(service_name: str, container_image: str, env: Dict[str, str], memory: str = "2048Mi", cpu: str = "1") -> Dict:
    env_items = [{"name": k, "value": v} for k, v in env.items()]
    return {
        "apiVersion": "serving.knative.dev/v1",
        "kind": "Service",
        "metadata": {"name": service_name},
        "spec": {
            "template": {
                "spec": {
                    "containers": [
                        {
                            "image": container_image,
                            "env": env_items,
                            # --- NEW RESOURCE LIMITS BLOCK ---
                            "resources": {
                                "limits": {
                                    "memory": memory
                                }
                            }
                            # ---------------------------------
                        }
                    ]
                }
            }
        },
    }

def poll_for_service_link(region: str, project_id: str, service_name: str, token: str, timeout: int = 60) -> Optional[str]:
    endpoint = f"{region_run_endpoint(region)}/apis/serving.knative.dev/v1/namespaces/{project_id}/services/{service_name}"
    headers = auth_headers(token)
    print(f"DEBUG: Polling for service URL at {endpoint}")
    for i in range(timeout):
        r = requests.get(endpoint, headers=headers)
        if r.status_code == 200:
            url = r.json().get("status", {}).get("url")
            if url:
                print(f"DEBUG: Service URL found after {i} seconds: {url}")
                return url
        time.sleep(1)
    return None

class DeployRequest(BaseModel):
    project_id: str = Field(min_length=3)
    region: str = Field(min_length=3)
    service_name: str = Field(min_length=3, max_length=63)
    container_image: str
    env: Dict[str, str] = Field(default_factory=dict)
    allowed_ips: List[str] = Field(default_factory=list)
    access_token: Optional[str] = None
    memory: str = "2048Mi"

@app.get("/oauth-login")
def login():
    from urllib.parse import urlencode
    print("DEBUG: /oauth-login hit, redirecting to Google...")
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

# @app.get("/oauth/callback")
# def oauth_callback(code: Optional[str] = None):
#     print(f"DEBUG: /oauth/callback received code: {code[:5]}..." if code else "DEBUG: No code in callback!")
#     if not code:
#         raise HTTPException(status_code=400, detail="missing code")

#     data = {
#         "code": code,
#         "client_id": CLIENT_ID,
#         "client_secret": CLIENT_SECRET,
#         "redirect_uri": REDIRECT_URI,
#         "grant_type": "authorization_code"
#     }
#     r = requests.post(TOKEN_ENDPOINT, data=data)
#     print(f"DEBUG: Token exchange status: {r.status_code}")
#     if r.status_code != 200:
#         print(f"DEBUG ERROR: {r.text}")
#         raise HTTPException(status_code=500, detail=f"token exchange failed: {r.text}")

#     token_resp = r.json()
#     access_token = token_resp.get("access_token")
    
#     # User Identification
#     email = get_email_from_token(access_token)
    
#     # Supabase User logic
#     user_row = None
#     if supabase:
#         print(f"DEBUG: Checking/Creating user {email} in database...")
#         existing = get_user_by_email(email)
#         if existing:
#             print(f"DEBUG: User exists with ID: {existing.get('id')}")
#             user_row = existing
#         else:
#             print(f"DEBUG: New user, calling create_user...")
#             user_row = create_user(email)
#             print(f"DEBUG: User created successfully: {user_row}")
#     else:
#         print("DEBUG: Skipping Supabase User check (Supabase not configured).")

#     return JSONResponse({"token": token_resp, "user": user_row})


@app.get("/oauth/callback")
def oauth_callback(code: Optional[str] = None):
    print(f"DEBUG: /oauth/callback received code: {code[:5]}..." if code else "DEBUG: No code in callback!")
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
    print(f"DEBUG: Token exchange status: {r.status_code}")
    if r.status_code != 200:
        print(f"DEBUG ERROR: {r.text}")
        raise HTTPException(status_code=500, detail=f"token exchange failed: {r.text}")

    token_resp = r.json()
    access_token = token_resp.get("access_token")
    expires_in = token_resp.get("expires_in", 3599)
    
    # User Identification
    email = get_email_from_token(access_token)
    
    # Supabase User logic
    user_row = None
    if supabase:
        print(f"DEBUG: Checking/Creating user {email} in database...")
        existing = get_user_by_email(email)
        if existing:
            print(f"DEBUG: User exists with ID: {existing.get('id')}")
            user_row = existing
        else:
            print(f"DEBUG: New user, calling create_user...")
            user_row = create_user(email)
            print(f"DEBUG: User created successfully: {user_row}")
    else:
        print("DEBUG: Skipping Supabase User check (Supabase not configured).")

    # --- SECURE REDIRECT LOGIC ---
    
    # Create the redirect response pointing to your frontend dashboard
    response = RedirectResponse(url="/dashboard")

    # Set the secure HttpOnly cookie for the access token
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,   # Prevents JavaScript from reading the token (XSS protection)
        secure=False,    # Set to True in production with HTTPS!
        samesite="lax",  # CSRF protection
        max_age=expires_in
    )

    # Set a readable cookie for the frontend to know who is logged in
    response.set_cookie(
        key="user_email",
        value=email,
        httponly=False,  # React CAN read this one (e.g., to display "Welcome, phymax!")
        secure=False,
        samesite="lax",
        max_age=expires_in
    )

    return response

@app.post("/deploy")
def deploy(req: DeployRequest, request: Request):
    print("\n--- DEPLOYMENT START ---")
    token = req.access_token or request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=400, detail="access_token not provided")

    # Cloud Run Deployment logic
    region_endpoint = region_run_endpoint(req.region)
    create_url = f"{region_endpoint}/apis/serving.knative.dev/v1/namespaces/{req.project_id}/services"
    
    env = dict(req.env or {})
    env["ALLOWED_IPS"] = ",".join(req.allowed_ips or [])
    body = create_knative_service_body(req.service_name, req.container_image, env)
    headers = auth_headers(token)

    print(f"DEBUG: Posting to Google Run API: {create_url}")
    r = requests.post(create_url, headers=headers, json=body)
    print(f"DEBUG: Google Run response: {r.status_code}")

    if r.status_code not in [200, 201, 202]:
        print(f"DEBUG ERROR: Deploy failed: {r.text}")
        raise HTTPException(status_code=500, detail=f"create service failed: {r.text}")

    service_link = poll_for_service_link(req.region, req.project_id, req.service_name, token)
    
    # Set IAM Policy
    if service_link:
        iam_url = f"https://run.googleapis.com/v1/projects/{req.project_id}/locations/{req.region}/services/{req.service_name}:setIamPolicy"
        policy_body = {"policy": {"bindings": [{"role": "roles/run.invoker", "members": ["allUsers"]}]}}
        p = requests.post(iam_url, headers=headers, json=policy_body)
        print(f"DEBUG: IAM policy set status: {p.status_code}")

    # Supabase Save logic
    if supabase and service_link:
        try:
            email = get_email_from_token(token)
            user = get_user_by_email(email)
            if not user:
                print(f"DEBUG: User {email} missing during deploy. Creating...")
                user = create_user(email)
            
            print(f"DEBUG: Saving project to Supabase: user_id={user['id']}, project_id={req.project_id}")
            res = supabase.table("projects").insert({
                "user_id": user["id"],
                "project_id": req.project_id,
                "service_link": service_link
            }).execute()
            print(f"DEBUG: Supabase project insert result: {res.data}")
        except Exception as e:
            print(f"DEBUG ERROR: Supabase Project save failed: {e}")

    print("--- DEPLOYMENT FINISHED ---\n")
    return {"status": "success", "service_link": service_link}


@app.get("/my-deployments")
def get_my_deployments(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        print("DEBUG: No token found. Returning empty deployments.")
        return []

    try:
        # Identify the user
        email = get_email_from_token(token)
        user = get_user_by_email(email)
        
        if not user:
            return []

        # Fetch their specific deployments from Supabase
        if supabase:
            res = supabase.table("projects").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
            return res.data
        else:
            return []
            
    except Exception as e:
        print(f"DEBUG ERROR fetching deployments: {e}")
        return []


@app.get("/projects")
def list_projects(request: Request):
    # Retrieve the token securely from the HttpOnly cookie
    token = request.cookies.get("access_token")
    
    if not token:
        # For local testing, if you don't have a token yet, just return the dummy data
        # so the UI doesn't crash while you are building it.
        print("DEBUG: No token found. Returning fallback projects.")
        return ["mate-tester-hak", "prod-cluster-01"]

    headers = {"Authorization": f"Bearer {token}"}
    url = "https://cloudresourcemanager.googleapis.com/v1/projects"
    r = requests.get(url, headers=headers)
    
    if r.status_code != 200:
        print(f"DEBUG ERROR: projects.list failed: {r.status_code} {r.text}")
        return ["mate-tester-hak"] # Fallback

    data = r.json().get("projects", [])
    
    # Return just a flat list of strings (project IDs) 
    # because that is what your React dropdown code expects: projData.map(proj => <option>)
    simplified = [p.get("projectId") for p in data if p.get("projectId")]
    
    return simplified

@app.get("/regions")
def list_regions():
    # Return a flat array of strings so React can map over it easily
    return [
        "europe-west1", 
        "us-central1", 
        "asia-northeast1", 
        "australia-southeast1", 
        "northamerica-northeast1"
    ]

@app.get("/health")
def health():
    return {"ok": True, "supabase_ready": supabase is not None}


@app.get("/{catchall:path}")
def serve_react_app(catchall: str):
    # 1. Build the path to the requested file within the 'dist' folder
    file_path = os.path.join("dist", catchall)
    
    # 2. If the exact file exists (e.g., /assets/main.js, /favicon.ico), serve it
    if catchall and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 3. Otherwise, serve index.html to let React Router handle the URL
    index_path = os.path.join("dist", "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
        
    # 4. Fallback if the dist folder is missing entirely
    return JSONResponse(
        {"error": "Frontend build not found. Make sure 'dist' directory exists."}, 
        status_code=404
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
