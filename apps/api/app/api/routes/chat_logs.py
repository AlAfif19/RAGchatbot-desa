from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_repo
from app.db.repository import SqlRepository
from app.schemas.chat_log import ChatLogPublic

router = APIRouter(prefix="/chat-logs", tags=["chat-logs"])


@router.get("", response_model=list[ChatLogPublic])
def list_chat_logs(repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    return repo.list("chat_logs")


@router.post("/{item_id}/mark-issue", response_model=ChatLogPublic)
def mark_issue(item_id: str, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.mark_chat_issue(item_id)
    if item is not None:
        return item
    raise HTTPException(status_code=404, detail="Chat log tidak ditemukan")
