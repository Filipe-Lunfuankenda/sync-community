from pydantic import BaseModel
from typing import List, Optional

class DashboardStatsResponse(BaseModel):
    total_members: int
    active_polls: int
    pending_processes: int
    avg_approval_time_hours: float
    engagement_score: float

class ChartDataPoint(BaseModel):
    label: str
    series1: float
    series2: Optional[float] = None

class DashboardChartsResponse(BaseModel):
    # series1 = members, series2 = new_members (growth)
    growth_chart: List[ChartDataPoint] 
    # series1 = completed, series2 = pending
    workflow_chart: List[ChartDataPoint]
