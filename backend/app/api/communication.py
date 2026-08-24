from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.core import User, Organization, Membership
from app.models.communication import Announcement, Poll, PollOption, Vote, Notification
from app.schemas.communication import (
    AnnouncementCreate, AnnouncementResponse,
    PollCreate, PollResponse, VoteCreate
)
from app.api import deps

router = APIRouter()

# --- ANNOUNCEMENTS ---

@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_in: AnnouncementCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Create a new announcement for the current organization.
    """
    announcement = Announcement(
        title=announcement_in.title,
        content=announcement_in.content,
        is_active=announcement_in.is_active,
        author_id=current_user.id,
        organization_id=current_org.id
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # 📣 Notify all members
    members = db.query(Membership).filter(
        Membership.organization_id == current_org.id,
        Membership.user_id != current_user.id
    ).all()

    for mem in members:
        db.add(Notification(
            user_id=mem.user_id,
            organization_id=current_org.id,
            title="Novo Anúncio",
            message=f"{current_user.full_name} publicou: {announcement.title}",
            type="announcement",
            link="/communication"
        ))
    db.commit()

    return announcement

@router.get("/announcements", response_model=List[AnnouncementResponse])
def read_announcements(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Retrieve announcements for the current organization.
    """
    announcements = db.query(Announcement)\
        .filter(Announcement.organization_id == current_org.id)\
        .order_by(Announcement.created_at.desc())\
        .offset(skip).limit(limit).all()
    return announcements

# --- POLLS ---

@router.post("/polls", response_model=PollResponse)
def create_poll(
    *,
    db: Session = Depends(get_db),
    poll_in: PollCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Create a new poll for the current organization.
    """
    poll = Poll(
        question=poll_in.question,
        expires_at=poll_in.expires_at,
        is_active=poll_in.is_active,
        author_id=current_user.id,
        organization_id=current_org.id
    )
    db.add(poll)
    db.flush() # Flush to get poll.id for options

    for option_in in poll_in.options:
        option = PollOption(
            poll_id=poll.id,
            text=option_in.text
        )
        db.add(option)
        
    db.commit()
    db.refresh(poll)

    # 📊 Notify all members
    members = db.query(Membership).filter(
        Membership.organization_id == current_org.id,
        Membership.user_id != current_user.id
    ).all()

    for mem in members:
        db.add(Notification(
            user_id=mem.user_id,
            organization_id=current_org.id,
            title="Nova Votação",
            message=f"Nova votação disponível: {poll.question}",
            type="poll",
            link="/communication"
        ))
    db.commit()

    return poll

@router.get("/polls", response_model=List[PollResponse])
def read_polls(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Retrieve polls for the current organization.
    """
    polls = db.query(Poll)\
        .filter(Poll.organization_id == current_org.id)\
        .order_by(Poll.created_at.desc())\
        .offset(skip).limit(limit).all()
    return polls

@router.post("/polls/{poll_id}/vote")
def cast_vote(
    *,
    db: Session = Depends(get_db),
    poll_id: str,
    vote_in: VoteCreate,
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Cast a vote on a specific poll option.
    """
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.organization_id == current_org.id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
        
    if not poll.is_active:
        raise HTTPException(status_code=400, detail="Poll is closed")
        
    # Check if user already voted
    existing_vote = db.query(Vote).filter(Vote.poll_id == poll.id, Vote.user_id == current_user.id).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="User already voted on this poll")
        
    # Verify option belongs to poll
    option = db.query(PollOption).filter(PollOption.id == vote_in.option_id, PollOption.poll_id == poll.id).first()
    if not option:
        raise HTTPException(status_code=400, detail="Invalid option for this poll")
        
    vote = Vote(
        poll_id=poll.id,
        option_id=option.id,
        user_id=current_user.id
    )
    db.add(vote)
    db.commit()
    return {"message": "Vote successfully cast"}
