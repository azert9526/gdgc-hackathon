import requests
import time
from typing import Dict, Optional, List
from config import USERINFO_ENDPOINT

def get_email_from_token(access_token: str) -> str:
    resp = requests.get(
        USERINFO_ENDPOINT,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if resp.status_code != 200:
        raise Exception(f"Failed to fetch user info: {resp.text}")
    return resp.json().get("email")

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
                            "resources": {
                                "limits": {
                                    "memory": memory
                                }
                            }
                        }
                    ]
                }
            }
        },
    }

def poll_for_service_link(region: str, project_id: str, service_name: str, token: str, timeout: int = 60) -> Optional[str]:
    endpoint = f"{region_run_endpoint(region)}/apis/serving.knative.dev/v1/namespaces/{project_id}/services/{service_name}"
    headers = auth_headers(token)
    for _ in range(timeout):
        r = requests.get(endpoint, headers=headers)
        if r.status_code == 200:
            url = r.json().get("status", {}).get("url")
            if url:
                return url
        time.sleep(1)
    return None

def set_iam_policy(project_id: str, region: str, service_name: str, token: str):
    iam_url = f"https://run.googleapis.com/v1/projects/{project_id}/locations/{region}/services/{service_name}:setIamPolicy"
    policy_body = {"policy": {"bindings": [{"role": "roles/run.invoker", "members": ["allUsers"]}]}}
    return requests.post(iam_url, headers=auth_headers(token), json=policy_body)

def list_google_projects(token: str) -> List[str]:
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://cloudresourcemanager.googleapis.com/v1/projects"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return []
    data = r.json().get("projects", [])
    return [p.get("projectId") for p in data if p.get("projectId")]
