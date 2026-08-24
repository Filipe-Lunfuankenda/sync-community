from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.db.database import get_db
from app.models.core import User, Organization

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    org_id: Optional[str] = None

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def get_current_organization(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[Organization]:
    """
    Extracts the organization ID from the JWT token and returns the Organization object.
    Provides Multi-Tenancy isolation context.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
        
    if not token_data.org_id:
        # User is authenticated but not acting inside an organization context
        return None
        
    org = db.query(Organization).filter(Organization.id == token_data.org_id).first()
    if not org or not org.is_active:
        raise HTTPException(status_code=403, detail="Organization is inactive or not found")
        
    return org

def require_organization(
    org: Optional[Organization] = Depends(get_current_organization)
) -> Organization:
    """Dependency that strictly requires an organization context."""
    if not org:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Contexto de organização obrigatório para esta operação."
        )
    return org

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="User is inactive")
    return current_user

def get_current_organization_id(
    org: Organization = Depends(require_organization)
) -> str:
    """Dependency that returns only the ID string of the current organization."""
    return org.id
