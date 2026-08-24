from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Shared properties
class AnnouncementBase(BaseModel):
    title: str
    content: str
    is_active: Optional[bool] = True

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementInDBBase(AnnouncementBase):
    id: str
    created_at: datetime
    author_id: str
    organization_id: str

    class Config:
        from_attributes = True

class AnnouncementResponse(AnnouncementInDBBase):
    pass

# Poll Options
class PollOptionBase(BaseModel):
    text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOptionResponse(PollOptionBase):
    id: str
    poll_id: str

    class Config:
        from_attributes = True

# Polls
class PollBase(BaseModel):
    question: str
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True

class PollCreate(PollBase):
    options: List[PollOptionCreate]

class PollInDBBase(PollBase):
    id: str
    created_at: datetime
    author_id: str
    organization_id: str

    class Config:
        from_attributes = True

class PollResponse(PollInDBBase):
    options: List[PollOptionResponse] = []

class VoteCreate(BaseModel):
    option_id: str
