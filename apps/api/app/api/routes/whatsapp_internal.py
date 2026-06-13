from fastapi import APIRouter, Depends

from app.api.deps import verify_internal_token
from app.schemas.whatsapp_connection import WhatsappInboundMessage

router = APIRouter(prefix="/internal/whatsapp", tags=["whatsapp-internal"], dependencies=[Depends(verify_internal_token)])


@router.post("/inbound")
def receive_whatsapp_message(_payload: WhatsappInboundMessage) -> dict:
    return {
        "ok": True,
        "answer": "Pesan WhatsApp diterima. Modul FAQ/RAG akan memproses balasan pada fase berikutnya.",
    }
