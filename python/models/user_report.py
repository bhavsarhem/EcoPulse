from pydantic import BaseModel
from typing import Dict, List

class DailyDataPoint(BaseModel):
    date: str
    co2e_kg: float

class UserReport(BaseModel):
    user_id: str
    month: str
    total_co2e_kg: float
    scan_count: int
    category_breakdown: Dict[str, float]
    savings_co2e_kg: float
    comparison_vs_average_pct: float
    daily_history: List[DailyDataPoint]
