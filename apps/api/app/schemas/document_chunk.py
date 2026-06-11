from pydantic import BaseModel


class DocumentChunkPublic(BaseModel):
    id: str
    data_source_id: str
    chunk_index: int
    chunk_text: str
    vector_id: str
    token_count: int
    created_at: str
