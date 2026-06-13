from fastapi import APIRouter, Depends

from app.api.deps import get_repo, require_bearer_admin
from app.db.repository import SqlRepository
from app.schemas.settings import AiSettings

router = APIRouter(prefix="/settings", tags=["settings"], dependencies=[Depends(require_bearer_admin)])


@router.get("/ai", response_model=AiSettings)
def get_ai_settings(repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.get_ai_settings()


@router.put("/ai", response_model=AiSettings)
def update_ai_settings(payload: AiSettings, repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.update_ai_settings(payload.model_dump())
