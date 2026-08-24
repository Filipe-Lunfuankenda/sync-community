import sys
import os
from app.db.database import SessionLocal, engine, Base
from app.models.core import User, Organization, Membership, Role
from app.models.workflow import ProcessTemplate, ProcessStep
from app.core.security import get_password_hash

# Don't drop and recreate tables here, let Alembic handle schema migrations.
# Base.metadata.drop_all(bind=engine)
# Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("== Seeding Database with CommuCore Demo Accounts ==")

# 1. Create a Global Superuser
admin_email = "admin@comunidade.pt"
admin_user = db.query(User).filter(User.email == admin_email).first()
if not admin_user:
    admin_user = User(
        email=admin_email,
        hashed_password=get_password_hash("Sync@Sec!2026"),
        full_name="Administrador Global",
        is_superuser=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    print(f"Created Superuser: {admin_user.email}")
else:
    print(f"Superuser already exists: {admin_user.email}")

# 2. Create the Organization
org_name = "Nova Ordem de Fenix"
org = db.query(Organization).filter(Organization.name == org_name).first()
if not org:
    org = Organization(
        name=org_name,
        subdomain="fenix"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    print(f"Created Organization: {org.name}")
else:
    print(f"Organization already exists: {org.name}")

# 3. Create Specific Roles for this Org
admin_role = db.query(Role).filter(Role.name == "Admin", Role.organization_id == org.id).first()
if not admin_role:
    admin_role = Role(name="Admin", description="Administrador Total", organization_id=org.id)
    manager_role = Role(name="Manager", description="Gestor de Conteúdo e Processos", organization_id=org.id)
    member_role = Role(name="Member", description="Membro Regular", organization_id=org.id)
    db.add(admin_role)
    db.add(manager_role)
    db.add(member_role)
    db.commit()
    db.refresh(admin_role)
    db.refresh(manager_role)
    db.refresh(member_role)
else:
    manager_role = db.query(Role).filter(Role.name == "Manager", Role.organization_id == org.id).first()
    member_role = db.query(Role).filter(Role.name == "Member", Role.organization_id == org.id).first()

# 4. Create Standard Example Users and Assign Memberships
# Associate Superuser with the Organization as well
if not db.query(Membership).filter_by(user_id=admin_user.id, organization_id=org.id).first():
    db.add(Membership(user_id=admin_user.id, organization_id=org.id, role_id=admin_role.id))

# User: Admin Fenix
user_admin_org = db.query(User).filter_by(email="admin_fenix@comunidade.pt").first()
if not user_admin_org:
    user_admin_org = User(
        email="admin_fenix@comunidade.pt",
        hashed_password=get_password_hash("Sync@Sec!2026"),
        full_name="Mestre Fenix",
        is_superuser=False
    )
    db.add(user_admin_org)
    db.commit()
    db.refresh(user_admin_org)
    db.add(Membership(user_id=user_admin_org.id, organization_id=org.id, role_id=admin_role.id))

# User: Manager Fenix
user_manager = db.query(User).filter_by(email="gestor_fenix@comunidade.pt").first()
if not user_manager:
    user_manager = User(
        email="gestor_fenix@comunidade.pt",
        hashed_password=get_password_hash("Sync@Sec!2026"),
        full_name="Gestor Eficiente",
        is_superuser=False
    )
    db.add(user_manager)
    db.commit()
    db.refresh(user_manager)
    db.add(Membership(user_id=user_manager.id, organization_id=org.id, role_id=manager_role.id))

# User: Member Fenix
user_member = db.query(User).filter_by(email="membro_fenix@comunidade.pt").first()
if not user_member:
    user_member = User(
        email="membro_fenix@comunidade.pt",
        hashed_password=get_password_hash("Sync@Sec!2026"),
        full_name="Membro Valente",
        is_superuser=False
    )
    db.add(user_member)
    db.commit()
    db.refresh(user_member)
    db.add(Membership(user_id=user_member.id, organization_id=org.id, role_id=member_role.id))

# 5. Create Sample Workflow Templates
print("Seeding Workflow Templates...")
refund_template = db.query(ProcessTemplate).filter_by(name="Pedido de Reembolso", organization_id=org.id).first()
if not refund_template:
    refund_template = ProcessTemplate(
        name="Pedido de Reembolso",
        description="Processo para solicitação de reembolso de despesas profissionais.",
        organization_id=org.id
    )
    db.add(refund_template)
    db.flush()
    db.add(ProcessStep(template_id=refund_template.id, name="Revisão Financeira", step_order=1, required_role_id=admin_role.id))
    db.add(ProcessStep(template_id=refund_template.id, name="Aprovação de Direção", step_order=2, required_role_id=admin_role.id))

report_template = db.query(ProcessTemplate).filter_by(name="Relatório de Evento", organization_id=org.id).first()
if not report_template:
    report_template = ProcessTemplate(
        name="Relatório de Evento",
        description="Submissão de relatório após eventos da comunidade.",
        organization_id=org.id
    )
    db.add(report_template)
    db.flush()
    db.add(ProcessStep(template_id=report_template.id, name="Validar Conteúdo", step_order=1, required_role_id=member_role.id))

db.commit()

print("== Seed Completed Successfully! ==")
print("Default Passwords: 'admin123'")
db.close()
