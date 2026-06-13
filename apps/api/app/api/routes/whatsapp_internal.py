from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_repo, get_wa_connector_client, verify_internal_token
from app.db.repository import SqlRepository
from app.schemas.whatsapp_connection import WhatsappInboundMessage
from app.services.wa_connector import WaConnectorClient, WaConnectorError

router = APIRouter(prefix="/internal/whatsapp", tags=["whatsapp-internal"], dependencies=[Depends(verify_internal_token)])


@router.post("/inbound")
def receive_whatsapp_message(
    payload: WhatsappInboundMessage,
    repo: SqlRepository = Depends(get_repo),
    connector: WaConnectorClient = Depends(get_wa_connector_client),
) -> dict:
    reply = repo.handle_whatsapp_inbound(payload.chatbot_number_id, payload.from_, payload.body)
    if reply is None:
        raise HTTPException(status_code=404, detail="Nomor chatbot tidak ditemukan")

    sent = False
    try:
        connector.send_message(payload.chatbot_number_id, payload.from_, reply.answer)
        sent = True
    except WaConnectorError:
        sent = False

    return {
        "ok": True,
        "answer": reply.answer,
        "source": reply.source,
        "sent": sent,
    }
