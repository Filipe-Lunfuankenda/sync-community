from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.core import Organization, User, Role, Membership
from app.schemas.organization import OrganizationCreate, OrganizationResponse, OrganizationUpdate
from app.api import deps

router = APIRouter()

@router.post("/", response_model=OrganizationResponse)
def create_organization(
    *,
    db: Session = Depends(get_db),
    org_in: OrganizationCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Create new organization.
    The user who creates the organization becomes the Super Admin of that organization.
    """
    # Create Organization
    org = Organization(
        name=org_in.name,
        subdomain=org_in.subdomain,
        is_active=org_in.is_active
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    
    # Generate default "Admin" Role for this new Organization
    admin_role = Role(
        name="Admin",
        description="Administrador Geral da Organização",
        organization_id=org.id
    )
    db.add(admin_role)
    db.commit()
    db.refresh(admin_role)

    # Generate default "Member" Role
    member_role = Role(
        name="Member",
        description="Membro Regular",
        organization_id=org.id
    )
    db.add(member_role)
    db.commit()

    # Assign Creator as Admin
    membership = Membership(
        user_id=current_user.id,
        organization_id=org.id,
        role_id=admin_role.id
    )
    db.add(membership)
    db.commit()
    
    return org

@router.get("/", response_model=List[OrganizationResponse])
def read_organizations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve user organizations.
    For now, return all (simplified). Later filter by Membership via current_user.
    """
    orgs = db.query(Organization).offset(skip).limit(limit).all()
    return orgs
