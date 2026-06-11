from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_chats_today: int
    answered_by_faq: int
    answered_by_rag: int
    active_data_sources: int
    active_bot_count: int
