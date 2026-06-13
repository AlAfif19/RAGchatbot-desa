from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "chatbot-warga-api"}


def test_cors_allows_manual_dev_frontend_port():
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://127.0.0.1:3001",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:3001"


def test_login_accepts_bootstrap_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "ChangeThisAdminPassword123!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["admin"]["email"] == "admin@example.com"
    assert data["access_token"].count(".") == 2


def test_login_rejects_legacy_bootstrap_credentials():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin" + "@desa.id", "password": "pass" + "word"},
    )

    assert response.status_code == 401


def test_login_rejects_wrong_password():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Email atau password salah"


def test_dashboard_requires_bearer_token():
    response = client.get("/api/dashboard/summary")

    assert response.status_code == 401


def test_dashboard_accepts_valid_bearer_token():
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "ChangeThisAdminPassword123!"},
    )
    token = login.json()["access_token"]

    response = client.get("/api/dashboard/summary", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
