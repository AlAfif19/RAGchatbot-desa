from pydantic import BaseModel


class RetrievedContext(BaseModel):
    title: str
    snippet: str
    score: float


class ChatLogPublic(BaseModel):
    id: str
    session_id: str
    citizen_phone: str
    message_text: str
    answer_text: str
    answer_source: str
    confidence_score: float | None = None
    retrieved_context: list[RetrievedContext] = []
    faq_match_score: float | None = None
    review_status: str
    created_at: str
