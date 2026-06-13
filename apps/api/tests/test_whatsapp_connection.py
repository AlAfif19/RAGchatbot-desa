from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.deps import get_wa_connector_client
from app.main import app


class FakeWaConnectorClient:
    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    def start_session(self, chatbot_number_id: str) -> dict:
        self.calls.append(("start", chatbot_number_id))
        return {
            "chatbot_number_id": chatbot_number_id,
            "status": "pending_qr",
            "qr": "data:image/png;base64,qr-test",
            "message": "Scan QR WhatsApp untuk menghubungkan nomor.",
        }

    def get_session(self, chatbot_number_id: str) -> dict:
        self.calls.append(("status", chatbot_number_id))
        return {
            "chatbot_number_id": chatbot_number_id,
            "status": "connected",
            "qr": None,
            "message": "WhatsApp terhubung.",
        }

    def logout_session(self, chatbot_number_id: str) -> dict:
        self.calls.append(("logout", chatbot_number_id))
        return {
            "chatbot_number_id": chatbot_number_id,
            "status": "disconnected",
            "qr": None,
            "message": "WhatsApp diputuskan.",
        }

    def send_message(self, chatbot_number_id: str, to: str, message: str) -> dict:
        self.calls.append(("send", chatbot_number_id, to, message))
        return {"ok": True}


client = TestClient(app)


def auth_headers() -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "ChangeThisAdminPassword123!"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def create_chatbot_number() -> dict:
    response = client.post(
        "/api/chatbot-numbers",
        headers=auth_headers(),
        json={
            "bot_name": "Bot WA Test",
            "phone_number": f"+62 812-{uuid4().hex[:10]}",
            "provider": "WhatsApp Web JS",
            "webhook_secret": "secret-test",
            "status": "active",
        },
    )
    return response.json()


def test_chatbot_number_can_start_whatsapp_qr_pairing():
    fake = FakeWaConnectorClient()
    item = create_chatbot_number()
    app.dependency_overrides[get_wa_connector_client] = lambda: fake
    try:
        response = client.post(f"/api/chatbot-numbers/{item['id']}/connect", headers=auth_headers())
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {
        "chatbot_number_id": item["id"],
        "status": "pending_qr",
        "qr": "data:image/png;base64,qr-test",
        "message": "Scan QR WhatsApp untuk menghubungkan nomor.",
    }
    assert fake.calls == [("start", item["id"])]


def test_start_whatsapp_pairing_updates_chatbot_number_connection_status():
    fake = FakeWaConnectorClient()
    item = create_chatbot_number()
    app.dependency_overrides[get_wa_connector_client] = lambda: fake
    try:
        response = client.post(f"/api/chatbot-numbers/{item['id']}/connect", headers=auth_headers())
        numbers = client.get("/api/chatbot-numbers", headers=auth_headers()).json()
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert next(candidate for candidate in numbers if candidate["id"] == item["id"])["connection_status"] == "pending_qr"


def test_chatbot_number_connection_status_returns_connector_state():
    fake = FakeWaConnectorClient()
    item = create_chatbot_number()
    app.dependency_overrides[get_wa_connector_client] = lambda: fake
    try:
        response = client.get(f"/api/chatbot-numbers/{item['id']}/connection", headers=auth_headers())
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "connected"
    assert response.json()["qr"] is None
    assert fake.calls == [("status", item["id"])]


def test_chatbot_number_can_disconnect_whatsapp_session():
    fake = FakeWaConnectorClient()
    item = create_chatbot_number()
    app.dependency_overrides[get_wa_connector_client] = lambda: fake
    try:
        response = client.post(f"/api/chatbot-numbers/{item['id']}/disconnect", headers=auth_headers())
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["status"] == "disconnected"
    assert fake.calls == [("logout", item["id"])]


def test_chatbot_number_can_send_whatsapp_message_through_connector():
    fake = FakeWaConnectorClient()
    item = create_chatbot_number()
    app.dependency_overrides[get_wa_connector_client] = lambda: fake
    try:
        response = client.post(
            f"/api/chatbot-numbers/{item['id']}/send",
            headers=auth_headers(),
            json={"to": "6281299990000", "message": "Halo warga"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert fake.calls == [("send", item["id"], "6281299990000", "Halo warga")]


def test_internal_whatsapp_inbound_accepts_connector_messages():
    response = client.post(
        "/api/internal/whatsapp/inbound",
        headers={"X-Internal-Token": "change_this_internal_token"},
        json={
            "chatbot_number_id": "1",
            "from": "6281299990000@c.us",
            "message_id": "wamid-test",
            "body": "Syarat surat domisili apa?",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "ok": True,
        "answer": "Pesan WhatsApp diterima. Modul FAQ/RAG akan memproses balasan pada fase berikutnya.",
    }


def test_internal_whatsapp_inbound_rejects_missing_token():
    response = client.post(
        "/api/internal/whatsapp/inbound",
        json={
            "chatbot_number_id": "1",
            "from": "6281299990000@c.us",
            "message_id": "wamid-test",
            "body": "Syarat surat domisili apa?",
        },
    )

    assert response.status_code == 401
