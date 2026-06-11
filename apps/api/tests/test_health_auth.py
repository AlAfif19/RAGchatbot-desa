from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "chatbot-warga-api"}


def test_login_accepts_demo_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@desa.id", "password": "password"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["admin"]["email"] == "admin@desa.id"


def test_login_rejects_wrong_password():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@desa.id", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Email atau password salah"
