import importlib

import pytest

from app.core import config


def reload_config(monkeypatch: pytest.MonkeyPatch):
    module = importlib.reload(config)
    monkeypatch.setattr(config, "settings", module.settings)
    return module


def test_production_rejects_default_secrets(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "production")

    with pytest.raises(RuntimeError, match="Production environment requires custom values"):
        importlib.reload(config)

    monkeypatch.delenv("APP_ENV")
    importlib.reload(config)


def test_production_accepts_custom_secrets(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("ADMIN_PASSWORD", "custom-admin-password")
    monkeypatch.setenv("JWT_SECRET", "custom-jwt-secret")
    monkeypatch.setenv("INTERNAL_API_TOKEN", "custom-internal-token")

    module = reload_config(monkeypatch)

    assert module.settings.app_env == "production"
    assert module.settings.jwt_secret == "custom-jwt-secret"

    monkeypatch.delenv("APP_ENV")
    monkeypatch.delenv("ADMIN_PASSWORD")
    monkeypatch.delenv("JWT_SECRET")
    monkeypatch.delenv("INTERNAL_API_TOKEN")
    importlib.reload(config)
