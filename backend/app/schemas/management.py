from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ManagementAreaBase(BaseModel):
    name: str
    type: str = "other"
    description: Optional[str] = None

class ManagementAreaCreate(ManagementAreaBase):
    pass

class ManagementAreaUpdate(ManagementAreaBase):
    name: Optional[str] = None
    type: Optional[str] = "other"

class ManagementAreaResponse(ManagementAreaBase):
    id: str
    organization_id: str

    class Config:
        from_attributes = True
