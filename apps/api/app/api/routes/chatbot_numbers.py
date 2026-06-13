from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import get_repo, get_wa_connector_client, require_bearer_admin
from app.db.repository import SqlRepository
from app.schemas.chatbot_number import ChatbotNumberCreate, ChatbotNumberPublic, ChatbotNumberUpdate
from app.schemas.whatsapp_connection import WhatsappConnectionPublic, WhatsappOutboundMessage
from app.services.wa_connector import WaConnectorClient, WaConnectorError

router = APIRouter(prefix="/chatbot-numbers", tags=["chatbot-numbers"], dependencies=[Depends(require_bearer_admin)])


@router.get("", response_model=list[ChatbotNumberPublic])
def list_chatbot_numbers(repo: SqlRepository = Depends(get_repo)) -> list[dict]:
    return repo.list("chatbot_numbers")


@router.post("", response_model=ChatbotNumberPublic, status_code=status.HTTP_201_CREATED)
def create_chatbot_number(payload: ChatbotNumberCreate, repo: SqlRepository = Depends(get_repo)) -> dict:
    return repo.create("chatbot_numbers", payload.model_dump(), "bot")


@router.put("/{item_id}", response_model=ChatbotNumberPublic)
def update_chatbot_number(item_id: str, payload: ChatbotNumberUpdate, repo: SqlRepository = Depends(get_repo)) -> dict:
    item = repo.update("chatbot_numbers", item_id, payload.model_dump(exclude={"id", "connection_status", "updated_at"}))
    if item is None:
        raise HTTPException(status_code=404, detail="Nomor chatbot tidak ditemukan")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chatbot_number(item_id: str, repo: SqlRepository = Depends(get_repo)) -> Response:
    if not repo.delete("chatbot_numbers", item_id):
        raise HTTPException(status_code=404, detail="Nomor chatbot tidak ditemukan")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{item_id}/connect", response_model=WhatsappConnectionPublic)
def connect_chatbot_number(
    item_id: str,
    repo: SqlRepository = Depends(get_repo),
    connector: WaConnectorClient = Depends(get_wa_connector_client),
) -> dict:
    try:
        connection = connector.start_session(item_id)
        repo.update_chatbot_connection_status(item_id, connection["status"])
        return connection
    except WaConnectorError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/{item_id}/connection", response_model=WhatsappConnectionPublic)
def get_chatbot_number_connection(
    item_id: str,
    repo: SqlRepository = Depends(get_repo),
    connector: WaConnectorClient = Depends(get_wa_connector_client),
) -> dict:
    try:
        connection = connector.get_session(item_id)
        repo.update_chatbot_connection_status(item_id, connection["status"])
        return connection
    except WaConnectorError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/{item_id}/disconnect", response_model=WhatsappConnectionPublic)
def disconnect_chatbot_number(
    item_id: str,
    repo: SqlRepository = Depends(get_repo),
    connector: WaConnectorClient = Depends(get_wa_connector_client),
) -> dict:
    try:
        connection = connector.logout_session(item_id)
        repo.update_chatbot_connection_status(item_id, connection["status"])
        return connection
    except WaConnectorError as exc:
        repo.update_chatbot_connection_status(item_id, "disconnected")
        return {
            "chatbot_number_id": item_id,
            "status": "disconnected",
            "qr": None,
            "message": "WhatsApp diputuskan dari dashboard. Connector sedang tidak dapat dihubungi.",
        }


@router.post("/{item_id}/send")
def send_chatbot_number_message(
    item_id: str,
    payload: WhatsappOutboundMessage,
    connector: WaConnectorClient = Depends(get_wa_connector_client),
) -> dict:
    try:
        return connector.send_message(item_id, payload.to, payload.message)
    except WaConnectorError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
