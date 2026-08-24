from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.core import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.organization import MembershipResponse
from app.api import deps
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
) -> Any:
    """
    Create new user. (Open signup for now, or restricted by superuser).
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user_obj = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=user_in.is_active
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=UserResponse)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/me/organizations", response_model=List[MembershipResponse])
def read_user_me_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get all organizations the current user belongs to.
    """
    memberships = []
    for m in current_user.memberships:
        m_dict = {
            "id": m.id,
            "user_id": m.user_id,
            "organization_id": m.organization_id,
            "role_id": m.role_id,
            "role_name": m.role.name if m.role else "Member",
            "joined_at": m.joined_at
        }
        memberships.append(m_dict)
    return memberships
