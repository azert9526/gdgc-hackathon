from fastapi import HTTPException
from config import SUPABASE_URL, SUPABASE_KEY

supabase = None
try:
    from supabase import create_client
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception:
    pass

def _ensure_supabase():
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

def create_user(email: str):
    _ensure_supabase()
    try:
        res = supabase.table("users").insert({"email": email}).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Supabase error: {str(e)}")

def get_user_by_email(email: str):
    _ensure_supabase()
    try:
        res = supabase.table("users").select("*").eq("email", email).execute()
        return res.data[0] if res.data else None
    except Exception:
        return None

def save_project(user_id: str, project_id: str, service_link: str):
    _ensure_supabase()
    try:
        res = supabase.table("projects").insert({
            "user_id": user_id,
            "project_id": project_id,
            "service_link": service_link
        }).execute()
        return res.data
    except Exception:
        return None

def get_user_deployments(user_id: str):
    _ensure_supabase()
    try:
        res = supabase.table("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    except Exception:
        return []
