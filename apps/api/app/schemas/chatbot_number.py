from pydantic import BaseModel, Field


class ChatbotNumberBase(BaseModel):
    bot_name: str = Field(min_length=1)
    phone_number: str = Field(min_length=8)
    provider: str = Field(min_length=1)
    webhook_secret: str = Field(min_length=6)
    status: str


class ChatbotNumberCreate(ChatbotNumberBase):
    pass


class ChatbotNumberUpdate(ChatbotNumberBase):
    id: str
    connection_status: str | None = None
    updated_at: str | None = None


class ChatbotNumberPublic(ChatbotNumberBase):
    id: str
    connection_status: str
    updated_at: str
