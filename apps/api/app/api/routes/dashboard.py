from fastapi import APIRouter, Depends

from app.api.deps import get_repo, require_bearer_admin
from app.db.repository import SqlRepository
from app.schemas.common import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(require_bearer_admin)])


@router.get("/summary", response_model=DashboardSummary)
def summary(repo: SqlRepository = Depends(get_repo)) -> DashboardSummary:
    return DashboardSummary(**repo.dashboard_summary())
