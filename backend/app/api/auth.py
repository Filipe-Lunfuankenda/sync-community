from datetime import timedelta
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core import security
from app.db.database import get_db
from app.models.core import User, Membership
from app.schemas.token import Token
from app.api import deps

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="E-mail ou password incorretos")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Utilizador inativo")
        
    # By default, login does not inject an org_id context.
    # The client can request a specific org token on a different endpoint if needed,
    # or the UI can handle the org selection and ask for a context-bound token.
    # For now, we issue a broad user token.
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/switch-org/{org_id}", response_model=Token)
def switch_organization_token(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> dict:
    """
    Returns a new token containing the Organization Context, 
    allowing access to tenant-isolated endpoints.
    """
    # Verify if user belongs to this org
    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.organization_id == org_id
    ).first()
    
    if not membership and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Não tem acesso a esta organização.")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            subject=current_user.id, expires_delta=access_token_expires, organization_id=org_id
        ),
        "token_type": "bearer",
    }
