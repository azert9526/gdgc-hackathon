from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class DeployRequest(BaseModel):
    project_id: str = Field(min_length=3)
    region: str = Field(min_length=3)
    service_name: str = Field(min_length=3, max_length=63)
    container_image: str
    env: Dict[str, str] = Field(default_factory=dict)
    allowed_ips: List[str] = Field(default_factory=list)
    access_token: Optional[str] = None
    memory: str = "2048Mi"
