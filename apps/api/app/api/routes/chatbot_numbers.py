from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_repo
from app.db.repository import SqlRepository
from app.schemas.chatbot_number import ChatbotNumberCreate, ChatbotNumberPublic, ChatbotNumberUpdate

router = APIRouter(prefix="/chatbot-numbers", tags=["chatbot-numbers"])


@router.get("", response_model=list[ChatbotNumberPublic])
def list_chatbot_numbers(repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    return repo.list("chatbot_numbers")


@router.post("", response_model=ChatbotNumberPublic, status_code=status.HTTP_201_CREATED)
def create_chatbot_number(payload: ChatbotNumberCreate, repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.create("chatbot_numbers", payload.model_dump(), "bot")


@router.put("/{item_id}", response_model=ChatbotNumberPublic)
def update_chatbot_number(item_id: str, payload: ChatbotNumberUpdate, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.update("chatbot_numbers", item_id, payload.model_dump(exclude={"id", "connection_status", "updated_at"}))
    if item is None:
        raise HTTPException(status_code=404, detail="Nomor chatbot tidak ditemukan")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chatbot_number(item_id: str, repo: SqlRepository = Depends(get_repo)) -> Response:
    if not repo.delete("chatbot_numbers", item_id):
        raise HTTPException(status_code=404, detail="Nomor chatbot tidak ditemukan")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
