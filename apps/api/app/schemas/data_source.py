from pydantic import BaseModel, Field


class DataSourceBase(BaseModel):
    title: str = Field(min_length=1)
    category: str = Field(min_length=1)
    source_type: str
    content_text: str | None = None
    file_name: str | None = None
    mime_type: str | None = None
    original_size: int = 0


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceUpdate(DataSourceBase):
    id: str
    compressed_size: int | None = None
    indexing_status: str | None = None
    updated_at: str | None = None


class DataSourcePublic(DataSourceBase):
    id: str
    compressed_size: int
    indexing_status: str
    updated_at: str
