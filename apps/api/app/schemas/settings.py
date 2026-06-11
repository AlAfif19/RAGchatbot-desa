from pydantic import BaseModel, Field


class AiSettings(BaseModel):
    provider: str = Field(min_length=1)
    model_name: str = Field(min_length=1)
    system_prompt: str = Field(min_length=1)
    top_k: int = Field(ge=1)
    faq_threshold: float = Field(ge=0, le=1)
    api_key: str = ""
    fallback_answer: str = Field(min_length=1)
