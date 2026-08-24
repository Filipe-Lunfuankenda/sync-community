from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.database import get_db
from app.models.core import User
from app.models.communication import Notification
from app.schemas.notification import NotificationResponse, NotificationUpdate

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    org_id: str = Depends(deps.get_current_organization_id),
    limit: int = 20
) -> Any:
    """
    Get notifications for the current user and organization.
    """
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.organization_id == org_id
        )
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return notifications

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Mark a notification as read.
    """
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não tem permissão para alterar esta notificação")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    org_id: str = Depends(deps.get_current_organization_id)
) -> Any:
    """
    Mark all notifications as read for current user and org.
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.organization_id == org_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "Todas as notificações foram marcadas como lidas"}
