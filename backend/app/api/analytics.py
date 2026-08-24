from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.core import User, Organization, Membership
from app.models.communication import Poll
from app.models.workflow import ProcessInstance, ProcessState, ApprovalLog, ApprovalAction
from app.schemas.analytics import DashboardStatsResponse, DashboardChartsResponse
from app.api import deps

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Retrieve aggregated analytical data for the organization dashboard.
    """
    # 1. Total Members
    total_members = db.query(Membership).filter(Membership.organization_id == current_org.id).count()
    
    # 2. Active Polls
    active_polls = db.query(Poll).filter(
        Poll.organization_id == current_org.id,
        Poll.is_active == True
    ).count()
    
    # 3. Pending/In-Review Processes
    pending_processes = db.query(ProcessInstance).filter(
        ProcessInstance.organization_id == current_org.id,
        ProcessInstance.status.in_([ProcessState.PENDING, ProcessState.IN_REVIEW])
    ).count()
    
    # 4. Average Approval Time Calculation (simplification for MVP)
    # Get all approved instances
    approved_instances = db.query(ProcessInstance).filter(
        ProcessInstance.organization_id == current_org.id,
        ProcessInstance.status == ProcessState.APPROVED
    ).all()
    
    total_hours = 0
    valid_count = 0
    for instance in approved_instances:
        # Find the final approval log
        final_log = db.query(ApprovalLog).filter(
            ApprovalLog.instance_id == instance.id,
            ApprovalLog.action == ApprovalAction.APPROVE
        ).order_by(ApprovalLog.created_at.desc()).first()
        
        if final_log:
            time_diff = final_log.created_at - instance.created_at
            total_hours += time_diff.total_seconds() / 3600.0
            valid_count += 1
            
    avg_approval_time = round(total_hours / valid_count, 1) if valid_count > 0 else 0.0

    # 5. Generic Engagement Score (dummy heuristic for demo: Members + Active items)
    base_activity = active_polls * 5 + pending_processes * 2
    engagement = min(100.0, float(base_activity + (total_members * 0.5)))
    
    return DashboardStatsResponse(
        total_members=total_members if total_members > 0 else 1, # avoid 0 for division/display if needed
        active_polls=active_polls,
        pending_processes=pending_processes,
        avg_approval_time_hours=avg_approval_time,
        engagement_score=engagement
    )

@router.get("/charts", response_model=DashboardChartsResponse)
def get_dashboard_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    current_org: Organization = Depends(deps.require_organization)
) -> Any:
    """
    Retrieve time-series data for dashboard charts.
    """
    # For MVP, we return some "realistic" generated data based on current counts
    # In a real app, this would be complex SQL grouping by day/month
    
    total_members = db.query(Membership).filter(Membership.organization_id == current_org.id).count()
    total_processes = db.query(ProcessInstance).filter(ProcessInstance.organization_id == current_org.id).count()
    
    # Growth Chart (Last 6 months approximation)
    growth = [
        {"label": "Jan", "series1": max(0, total_members - 5), "series2": 2},
        {"label": "Fev", "series1": max(0, total_members - 3), "series2": 2},
        {"label": "Mar", "series1": total_members, "series2": 3},
    ]
    
    # Workflow Chart (Activity)
    workflows = [
        {"label": "Sem 1", "series1": 5, "series2": 2},
        {"label": "Sem 2", "series1": 8, "series2": 4},
        {"label": "Sem 3", "series1": total_processes, "series2": max(1, total_processes // 2)},
    ]
    
    return {
        "growth_chart": growth,
        "workflow_chart": workflows
    }
