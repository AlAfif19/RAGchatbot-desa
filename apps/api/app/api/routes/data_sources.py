from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status

from app.api.deps import get_repo, require_bearer_admin
from app.db.repository import SqlRepository
from app.schemas.data_source import DataSourceCreate, DataSourcePublic, DataSourceUpdate
from app.schemas.document_chunk import DocumentChunkPublic
from app.services.document_processing import decode_text_file, is_supported_text_file

router = APIRouter(prefix="/data-sources", tags=["data-sources"], dependencies=[Depends(require_bearer_admin)])


@router.get("", response_model=list[DataSourcePublic])
def list_data_sources(repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    return repo.list("data_sources")


@router.post("", response_model=DataSourcePublic, status_code=status.HTTP_201_CREATED)
def create_data_source(payload: DataSourceCreate, repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.create("data_sources", payload.model_dump(), "source")


@router.post("/upload", response_model=DataSourcePublic, status_code=status.HTTP_201_CREATED)
async def upload_data_source(
    title: Annotated[str, Form()],
    category: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    repo: SqlRepository = Depends(get_repo),
) -> dict:
    filename = file.filename or "uploaded.txt"
    if not is_supported_text_file(filename, file.content_type):
        raise HTTPException(status_code=400, detail="Saat ini upload hanya mendukung TXT, MD, dan CSV")
    content = await file.read()
    try:
        content_text = decode_text_file(content)
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="File harus memakai encoding UTF-8") from exc
    if not content_text:
        raise HTTPException(status_code=400, detail="File tidak berisi teks")
    return repo.create_uploaded_data_source(
        title=title,
        category=category,
        file_name=filename,
        mime_type=file.content_type or "text/plain",
        original_size=len(content),
        content_text=content_text,
    )


@router.get("/{item_id}/chunks", response_model=list[DocumentChunkPublic])
def list_data_source_chunks(item_id: str, repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    chunks = repo.list_chunks(item_id)
    if chunks is None:
        raise HTTPException(status_code=404, detail="Sumber data tidak ditemukan")
    return chunks


@router.put("/{item_id}", response_model=DataSourcePublic)
def update_data_source(item_id: str, payload: DataSourceUpdate, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.update(
        "data_sources",
        item_id,
        payload.model_dump(exclude={"id", "compressed_size", "indexing_status", "updated_at"}),
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Sumber data tidak ditemukan")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_data_source(item_id: str, repo: SqlRepository = Depends(get_repo)) -> Response:
    if not repo.delete("data_sources", item_id):
        raise HTTPException(status_code=404, detail="Sumber data tidak ditemukan")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{item_id}/reindex", response_model=DataSourcePublic)
def reindex_data_source(item_id: str, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.update("data_sources", item_id, {"indexing_status": "processing"})
    if item is None:
        raise HTTPException(status_code=404, detail="Sumber data tidak ditemukan")
    return item
