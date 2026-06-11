from pydantic import BaseModel, Field


class FaqBase(BaseModel):
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    keywords: str = ""
    threshold: float = Field(ge=0, le=1)
    is_active: bool = True


class FaqCreate(FaqBase):
    pass


class FaqUpdate(FaqBase):
    id: str
    updated_at: str | None = None


class FaqPublic(FaqBase):
    id: str
    updated_at: str
