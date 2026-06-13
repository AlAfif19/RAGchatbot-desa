import os
from dataclasses import dataclass

DEFAULT_ADMIN_PASSWORD = "ChangeThisAdminPassword123!"
DEFAULT_JWT_SECRET = "change_this_secret"
DEFAULT_INTERNAL_API_TOKEN = "change_this_internal_token"


@dataclass(frozen=True)
class Settings:
    app_name: str = "Chatbot Warga API"
    app_env: str = os.getenv("APP_ENV", "local")
    admin_name: str = os.getenv("ADMIN_NAME", "Administrator")
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password: str = os.getenv("ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD)
    jwt_secret: str = os.getenv("JWT_SECRET", DEFAULT_JWT_SECRET)
    internal_api_token: str = os.getenv("INTERNAL_API_TOKEN", DEFAULT_INTERNAL_API_TOKEN)
    wa_connector_url: str = os.getenv("WA_CONNECTOR_URL", "http://wa-connector:3010")
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if origin.strip()
    )


def _validate_settings(value: Settings) -> Settings:
    if value.app_env.lower() in {"production", "prod"}:
        default_values = {
            "ADMIN_PASSWORD": DEFAULT_ADMIN_PASSWORD,
            "JWT_SECRET": DEFAULT_JWT_SECRET,
            "INTERNAL_API_TOKEN": DEFAULT_INTERNAL_API_TOKEN,
        }
        configured_values = {
            "ADMIN_PASSWORD": value.admin_password,
            "JWT_SECRET": value.jwt_secret,
            "INTERNAL_API_TOKEN": value.internal_api_token,
        }
        insecure = [name for name, default in default_values.items() if configured_values[name] == default]
        if insecure:
            raise RuntimeError(f"Production environment requires custom values for: {', '.join(insecure)}")
    return value


settings = _validate_settings(Settings())
