from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def auth_headers() -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "ChangeThisAdminPassword123!"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_dashboard_summary_has_prd_metrics():
    response = client.get("/api/dashboard/summary", headers=auth_headers())

    assert response.status_code == 200
    data = response.json()
    assert set(data) == {
        "total_chats_today",
        "answered_by_faq",
        "answered_by_rag",
        "active_data_sources",
        "active_bot_count",
    }
    assert data["active_bot_count"] >= 0


def test_chatbot_number_crud_flow():
    create_response = client.post(
        "/api/chatbot-numbers",
        headers=auth_headers(),
        json={
            "bot_name": "Bot Test",
            "phone_number": "+62 812-9999-0000",
            "provider": "Meta Cloud API",
            "webhook_secret": "secret-test",
            "status": "active",
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()

    update_response = client.put(
        f"/api/chatbot-numbers/{created['id']}",
        headers=auth_headers(),
        json={**created, "bot_name": "Bot Test Updated", "status": "inactive"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["connection_status"] == "disconnected"

    delete_response = client.delete(f"/api/chatbot-numbers/{created['id']}", headers=auth_headers())
    assert delete_response.status_code == 204


def test_data_source_reindex_sets_processing():
    source = client.post(
        "/api/data-sources",
        headers=auth_headers(),
        json={
            "title": "Panduan Reindex Test",
            "category": "Administrasi",
            "source_type": "text",
            "content_text": "Konten layanan warga.",
            "file_name": None,
            "mime_type": None,
            "original_size": 22,
        },
    ).json()

    response = client.post(f"/api/data-sources/{source['id']}/reindex", headers=auth_headers())

    assert response.status_code == 200
    assert response.json()["indexing_status"] == "processing"


def test_data_source_upload_text_file_creates_chunks():
    response = client.post(
        "/api/data-sources/upload",
        headers=auth_headers(),
        data={"title": "Panduan Upload Test", "category": "Administrasi"},
        files={
            "file": (
                "panduan.txt",
                b"Kalimat pertama untuk warga desa.\nKalimat kedua menjelaskan layanan surat.",
                "text/plain",
            )
        },
    )

    assert response.status_code == 201
    created = response.json()
    assert created["source_type"] == "file"
    assert created["file_name"] == "panduan.txt"
    assert created["indexing_status"] == "completed"

    chunks_response = client.get(f"/api/data-sources/{created['id']}/chunks", headers=auth_headers())
    assert chunks_response.status_code == 200
    chunks = chunks_response.json()
    assert len(chunks) >= 1
    assert chunks[0]["chunk_text"].startswith("Kalimat pertama")


def test_faq_create_toggle_delete_flow():
    create_response = client.post(
        "/api/faqs",
        headers=auth_headers(),
        json={
            "question": "Apa jam layanan kantor desa?",
            "answer": "Jam layanan kantor desa 08.00 sampai 15.00 WIB.",
            "keywords": "jam layanan,kantor desa",
            "threshold": 0.8,
            "is_active": True,
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()

    toggle_response = client.post(f"/api/faqs/{created['id']}/toggle", headers=auth_headers())
    assert toggle_response.status_code == 200
    assert toggle_response.json()["is_active"] is False

    delete_response = client.delete(f"/api/faqs/{created['id']}", headers=auth_headers())
    assert delete_response.status_code == 204


def test_ai_settings_update_roundtrip():
    payload = {
        "provider": "openai-compatible",
        "model_name": "gpt-compatible",
        "system_prompt": "Jawab berdasarkan data resmi desa.",
        "top_k": 4,
        "faq_threshold": 0.75,
        "api_key": "sk-test-desa",
        "fallback_answer": "Informasi belum tersedia.",
    }

    response = client.put("/api/settings/ai", headers=auth_headers(), json=payload)

    assert response.status_code == 200
    assert response.json() == payload
