from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from api.middleware.auth_guard import get_current_user
from services.bigquery_pipeline import BigQueryPipeline
from services.report_generator import ReportGenerator
from models.user_report import UserReport

router = APIRouter()
db_pipeline = BigQueryPipeline()
report_gen = ReportGenerator(db_pipeline)

@router.get("/report", response_model=UserReport)
async def get_monthly_report(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    user_id: str = Depends(get_current_user)
):
    try:
        report = report_gen.generate_monthly_report(user_id, month)
        return report
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate monthly report due to an internal server error."
        )
