from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.workflow import ProcessState, ApprovalAction

# Schemas para visualização e input
class ProcessStepBase(BaseModel):
    name: str
    step_order: int
    required_role_id: Optional[str] = None

class ProcessStepCreate(ProcessStepBase):
    pass

class ProcessStepResponse(ProcessStepBase):
    id: str
    template_id: str

    class Config:
        from_attributes = True

class ProcessTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True

class ProcessTemplateCreate(ProcessTemplateBase):
    steps: List[ProcessStepCreate]

class ProcessTemplateResponse(ProcessTemplateBase):
    id: str
    organization_id: str
    created_at: datetime
    steps: List[ProcessStepResponse]

    class Config:
        from_attributes = True

class ApprovalLogBase(BaseModel):
    action: ApprovalAction
    comments: Optional[str] = None
    step_order: int

class ApprovalLogCreate(BaseModel):
    action: ApprovalAction
    comments: Optional[str] = None

class ApprovalLogResponse(ApprovalLogBase):
    id: str
    actor_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProcessInstanceBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProcessInstanceCreate(ProcessInstanceBase):
    template_id: str
    management_area_id: Optional[str] = None

class ProcessInstanceResponse(ProcessInstanceBase):
    id: str
    template_id: str
    management_area_id: Optional[str] = None
    status: ProcessState
    current_step_order: int
    created_at: datetime
    updated_at: datetime
    requester_id: str
    organization_id: str
    logs: List[ApprovalLogResponse] = []

    class Config:
        from_attributes = True
