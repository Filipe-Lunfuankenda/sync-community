from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool = False

class NotificationCreate(NotificationBase):
    user_id: str
    organization_id: str

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: str
    created_at: datetime
    user_id: str
    organization_id: str

    class Config:
        from_attributes = True
