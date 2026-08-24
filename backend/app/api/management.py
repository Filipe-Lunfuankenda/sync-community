from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.core import User, Organization, ManagementArea
from app.schemas.management import ManagementAreaCreate, ManagementAreaResponse, ManagementAreaUpdate
from app.api import deps

router = APIRouter()

@router.post("/", response_model=ManagementAreaResponse)
def create_management_area(
    *,
    db: Session = Depends(get_db),
    area_in: ManagementAreaCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Create a new management area for the organization.
    """
    area = ManagementArea(
        name=area_in.name,
        type=area_in.type,
        description=area_in.description,
        organization_id=current_org.id
    )
    db.add(area)
    db.commit()
    db.refresh(area)
    return area

@router.get("/", response_model=List[ManagementAreaResponse])
def read_management_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Retrieve management areas for the current organization.
    """
    areas = db.query(ManagementArea).filter(ManagementArea.organization_id == current_org.id).all()
    return areas

@router.delete("/{area_id}")
def delete_management_area(
    area_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Delete a management area.
    """
    area = db.query(ManagementArea).filter(
        ManagementArea.id == area_id, 
        ManagementArea.organization_id == current_org.id
    ).first()
    
    if not area:
        raise HTTPException(status_code=404, detail="Área de gestão não encontrada")
        
    db.delete(area)
    db.commit()
    return {"message": "Área removida com sucesso"}
