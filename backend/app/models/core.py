import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID # Using standard str for uuid in SQLite but preparing for PG

from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

# Many-to-Many association table for Roles and Permissions
role_permission_table = Table(
    "role_permission",
    Base.metadata,
    Column("role_id", String, ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", String, ForeignKey("permissions.id"), primary_key=True),
)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, index=True, nullable=False)
    subdomain = Column(String, unique=True, index=True, nullable=True) # Optional white-label feature
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    memberships = relationship("Membership", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="organization", cascade="all, delete-orphan")
    management_areas = relationship("ManagementArea", back_populates="organization", cascade="all, delete-orphan")

class ManagementArea(Base):
    __tablename__ = "management_areas"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False) # e.g. "Financeiro", "Eventos", "Educação"
    type = Column(String, default="other") # e.g. "finance", "communication", "events", "other"
    description = Column(String, nullable=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)

    # Relationships
    organization = relationship("Organization", back_populates="management_areas")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False) # Global super admin across the platform
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False) # e.g. "Admin", "Member", "Treasurer"
    description = Column(String, nullable=True)
    
    # Tenant isolation
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="roles")
    permissions = relationship("Permission", secondary=role_permission_table, back_populates="roles")
    memberships = relationship("Membership", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, unique=True, nullable=False, index=True) # e.g. "workflow:approve", "users:create"
    description = Column(String, nullable=True)

    # Relationships
    roles = relationship("Role", secondary=role_permission_table, back_populates="permissions")

class Membership(Base):
    """
    Pivot table mapping Users to Organizations, and defining what Role they have.
    """
    __tablename__ = "memberships"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="memberships")
    role = relationship("Role", back_populates="memberships")
