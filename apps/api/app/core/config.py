from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "Chatbot Warga API"
    demo_admin_email: str = "admin@desa.id"
    demo_admin_password: str = "password"
    demo_token: str = "demo-admin-token"


settings = Settings()
