from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties
class OrganizationBase(BaseModel):
    name: str
    subdomain: Optional[str] = None
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class OrganizationCreate(OrganizationBase):
    pass

# Properties to receive via API on update
class OrganizationUpdate(OrganizationBase):
    pass

# Properties shared by models stored in DB
class OrganizationInDBBase(OrganizationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class OrganizationResponse(OrganizationInDBBase):
    pass

class MembershipResponse(BaseModel):
    id: str
    user_id: str
    organization_id: str
    role_id: str
    role_name: Optional[str] = None
    joined_at: datetime

    class Config:
        from_attributes = True
