from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.core import generate_uuid

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String) # 'announcement', 'poll', 'workflow'
    link = Column(String, nullable=True) # Ex: /workflow/instances/ID
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    organization = relationship("Organization")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    # Relationships
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)

    author = relationship("User")
    organization = relationship("Organization")
    comments = relationship("Comment", back_populates="announcement", cascade="all, delete-orphan")

class Poll(Base):
    __tablename__ = "polls"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    question = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True) # If null, runs until manually closed
    is_active = Column(Boolean, default=True)

    # Relationships
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    author = relationship("User")
    organization = relationship("Organization")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")

class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    poll_id = Column(String, ForeignKey("polls.id"), nullable=False, index=True)
    text = Column(String, nullable=False)
    
    poll = relationship("Poll", back_populates="options")
    votes = relationship("Vote", back_populates="option", cascade="all, delete-orphan")

class Vote(Base):
    """
    Tracks which user voted for which option in a poll.
    """
    __tablename__ = "votes"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    poll_id = Column(String, ForeignKey("polls.id"), nullable=False)
    option_id = Column(String, ForeignKey("poll_options.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    poll = relationship("Poll", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")
    user = relationship("User")

class Comment(Base):
    """
    Comments on Anouncements (or even Polls, but mapping only to Announcements for now)
    """
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    announcement_id = Column(String, ForeignKey("announcements.id"), nullable=False, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)

    announcement = relationship("Announcement", back_populates="comments")
    author = relationship("User")
