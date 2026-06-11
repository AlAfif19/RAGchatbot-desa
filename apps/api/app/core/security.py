from app.core.config import settings


def verify_demo_admin(email: str, password: str) -> bool:
    return email == settings.demo_admin_email and password == settings.demo_admin_password


def create_demo_token(email: str) -> str:
    return f"{settings.demo_token}:{email}"
