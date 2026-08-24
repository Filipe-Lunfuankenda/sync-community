from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.core import generate_uuid

class ProcessState(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class ProcessTemplate(Base):
    """
    Defines the skeleton of a workflow (e.g., 'Purchase Request', 'Vacation Request').
    """
    __tablename__ = "process_templates"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    organization = relationship("Organization")
    
    steps = relationship("ProcessStep", back_populates="template", cascade="all, delete-orphan", order_by="ProcessStep.step_order")
    instances = relationship("ProcessInstance", back_populates="template", cascade="all, delete-orphan")

class ProcessStep(Base):
    """
    Defines the individual steps for a specific template.
    e.g., Step 1: Requires Role 'Manager', Step 2: Requires Role 'Treasurer'
    """
    __tablename__ = "process_steps"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    template_id = Column(String, ForeignKey("process_templates.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Financial Approval"
    step_order = Column(Integer, nullable=False)  # 1, 2, 3...
    
    # Who can approve this step? (Can be a specific Role, or a specific User)
    required_role_id = Column(String, ForeignKey("roles.id"), nullable=True)

    # Relationships
    template = relationship("ProcessTemplate", back_populates="steps")
    required_role = relationship("Role")

class ProcessInstance(Base):
    """
    A concrete request/process instantiated by a user.
    """
    __tablename__ = "process_instances"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    template_id = Column(String, ForeignKey("process_templates.id"), nullable=False)
    title = Column(String, nullable=False) # e.g., "Request to buy new laptops"
    description = Column(String, nullable=True)
    
    status = Column(Enum(ProcessState), default=ProcessState.PENDING, nullable=False)
    current_step_order = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    requester_id = Column(String, ForeignKey("users.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    management_area_id = Column(String, ForeignKey("management_areas.id"), nullable=True, index=True)

    requester = relationship("User")
    organization = relationship("Organization")
    management_area = relationship("ManagementArea")
    template = relationship("ProcessTemplate", back_populates="instances")
    logs = relationship("ApprovalLog", back_populates="instance", cascade="all, delete-orphan")

class ApprovalAction(str, enum.Enum):
    APPROVE = "approve"
    REJECT = "reject"
    COMMENT = "comment"

class ApprovalLog(Base):
    """
    Audit log of everything that happens to an instance.
    """
    __tablename__ = "approval_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    instance_id = Column(String, ForeignKey("process_instances.id"), nullable=False)
    actor_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    action = Column(Enum(ApprovalAction), nullable=False)
    step_order = Column(Integer, nullable=False) # Context: at what step did they act?
    comments = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    instance = relationship("ProcessInstance", back_populates="logs")
    actor = relationship("User")
