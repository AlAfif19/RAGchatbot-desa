from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_repo
from app.db.repository import SqlRepository
from app.schemas.faq import FaqCreate, FaqPublic, FaqUpdate

router = APIRouter(prefix="/faqs", tags=["faqs"])


@router.get("", response_model=list[FaqPublic])
def list_faqs(repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    return repo.list("faqs")


@router.post("", response_model=FaqPublic, status_code=status.HTTP_201_CREATED)
def create_faq(payload: FaqCreate, repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.create("faqs", payload.model_dump(), "faq")


@router.put("/{item_id}", response_model=FaqPublic)
def update_faq(item_id: str, payload: FaqUpdate, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.update("faqs", item_id, payload.model_dump(exclude={"id", "updated_at"}))
    if item is None:
        raise HTTPException(status_code=404, detail="FAQ tidak ditemukan")
    return item


@router.post("/{item_id}/toggle", response_model=FaqPublic)
def toggle_faq(item_id: str, repo: SqlRepository = Depends(get_repo)) -> dict:
    existing = repo.get_faq(item_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="FAQ tidak ditemukan")
    return repo.update("faqs", item_id, {"is_active": not existing["is_active"]})


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(item_id: str, repo: SqlRepository = Depends(get_repo)) -> Response:
    if not repo.delete("faqs", item_id):
        raise HTTPException(status_code=404, detail="FAQ tidak ditemukan")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
