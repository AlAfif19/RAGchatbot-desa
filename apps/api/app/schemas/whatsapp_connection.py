from pydantic import BaseModel, Field


class WhatsappConnectionPublic(BaseModel):
    chatbot_number_id: str
    status: str
    qr: str | None = None
    message: str


class WhatsappOutboundMessage(BaseModel):
    to: str
    message: str


class WhatsappInboundMessage(BaseModel):
    chatbot_number_id: str
    from_: str = Field(alias="from")
    message_id: str | None = None
    body: str

    model_config = {"populate_by_name": True}
