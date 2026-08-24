from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.core import User, Organization
from app.models.workflow import ProcessTemplate, ProcessStep, ProcessInstance, ApprovalLog, ProcessState, ApprovalAction
from app.schemas.workflow import (
    ProcessTemplateCreate, ProcessTemplateResponse,
    ProcessInstanceCreate, ProcessInstanceResponse,
    ApprovalLogCreate
)
from app.api import deps
import urllib.request
import json
import os

router = APIRouter()

# --- TEMPLATES ---
@router.post("/templates", response_model=ProcessTemplateResponse)
def create_template(
    *,
    db: Session = Depends(get_db),
    template_in: ProcessTemplateCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    # Requires Admin role (simplification: checking if user is in org is not enough for roles, 
    # but we will enforce RBAC on a separate layer later).
    
    template = ProcessTemplate(
        name=template_in.name,
        description=template_in.description,
        is_active=template_in.is_active,
        organization_id=current_org.id
    )
    db.add(template)
    db.flush()

    for step_in in template_in.steps:
        step = ProcessStep(
            template_id=template.id,
            name=step_in.name,
            step_order=step_in.step_order,
            required_role_id=step_in.required_role_id
        )
        db.add(step)
        
    db.commit()
    db.refresh(template)
    return template

@router.get("/templates", response_model=List[ProcessTemplateResponse])
def read_templates(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    templates = db.query(ProcessTemplate)\
        .filter(ProcessTemplate.organization_id == current_org.id)\
        .offset(skip).limit(limit).all()
    return templates

# --- INSTANCES & APPROVALS ---
@router.post("/instances", response_model=ProcessInstanceResponse)
def create_instance(
    *,
    db: Session = Depends(get_db),
    instance_in: ProcessInstanceCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    
    template = db.query(ProcessTemplate).filter(
        ProcessTemplate.id == instance_in.template_id,
        ProcessTemplate.organization_id == current_org.id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    instance = ProcessInstance(
        template_id=template.id,
        title=instance_in.title,
        description=instance_in.description,
        status=ProcessState.PENDING,
        current_step_order=1,
        requester_id=current_user.id,
        organization_id=current_org.id,
        management_area_id=instance_in.management_area_id
    )
    db.add(instance)
    db.commit()
    db.refresh(instance)
    return instance

@router.get("/instances", response_model=List[ProcessInstanceResponse])
def read_instances(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    # Returns instances user can see (normally depends on roles, keeping it simple for now)
    instances = db.query(ProcessInstance)\
        .filter(ProcessInstance.organization_id == current_org.id)\
        .order_by(ProcessInstance.created_at.desc())\
        .offset(skip).limit(limit).all()
    return instances

@router.post("/instances/{instance_id}/approve", response_model=ProcessInstanceResponse)
def action_instance(
    *,
    db: Session = Depends(get_db),
    instance_id: str,
    action_in: ApprovalLogCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Core Workflow Engine mechanism.
    Handles transitions between steps.
    """
    instance = db.query(ProcessInstance).filter(
        ProcessInstance.id == instance_id,
        ProcessInstance.organization_id == current_org.id
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    if instance.status in [ProcessState.APPROVED, ProcessState.REJECTED, ProcessState.ARCHIVED]:
        raise HTTPException(status_code=400, detail=f"Process is already {instance.status}")
        
    # Find current step
    current_step = db.query(ProcessStep).filter(
        ProcessStep.template_id == instance.template_id,
        ProcessStep.step_order == instance.current_step_order
    ).first()
    
    if not current_step:
        raise HTTPException(status_code=500, detail="Workflow configuration error. Step not found.")
        
    # TO-DO: Verify if current_user has the `required_role_id` to approve this step.
    
    # 1. Register Action Log
    log = ApprovalLog(
        instance_id=instance.id,
        actor_id=current_user.id,
        action=action_in.action,
        step_order=instance.current_step_order,
        comments=action_in.comments
    )
    db.add(log)
    
    # 2. State Machine Logic
    if action_in.action == ApprovalAction.REJECT:
        instance.status = ProcessState.REJECTED
    elif action_in.action == ApprovalAction.APPROVE:
        # Check if there is a next step
        next_step = db.query(ProcessStep).filter(
            ProcessStep.template_id == instance.template_id,
            ProcessStep.step_order == instance.current_step_order + 1
        ).first()
        
        if next_step:
            instance.current_step_order += 1
            instance.status = ProcessState.IN_REVIEW
        else:
            # End of workflow -> APPROVED -> Trigger Java Microservice Print
            instance.status = ProcessState.APPROVED
            
            try:
                # Fire and forget request to Java Service running in docker network (or localhost for dev)
                docs_api_url = os.getenv("DOCS_SERVICE_URL", "http://docs-service:8080/api/v1/docs/generate/workflow-report")
                
                payload = json.dumps({
                    "organization_id": current_org.id,
                    "process_id": instance.id
                }).encode('utf-8')
                
                req = urllib.request.Request(docs_api_url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
                
                # We won't block the API, if it fails, it will just log to stdout
                urllib.request.urlopen(req, timeout=2.0)
                print(f"Java Docs Service triggered for Process {instance.id}")
            except Exception as e:
                print(f"Failed to trigger Java Docs Service: {e}")

    db.commit()
    db.refresh(instance)
    
    return instance
