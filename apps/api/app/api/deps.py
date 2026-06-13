from collections.abc import Generator

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.security import verify_access_token
from app.db.models import Base
from app.db.repository import SqlRepository
from app.db.session import SessionLocal, engine
from app.services.wa_connector import WaConnectorClient

bearer_scheme = HTTPBearer(auto_error=False)


def ensure_database_ready() -> None:
    if engine.url.get_backend_name() == "sqlite":
        Base.metadata.create_all(bind=engine)


def get_repo() -> Generator[SqlRepository, None, None]:
    ensure_database_ready()
    db = SessionLocal()
    try:
        from app.db.repository import bootstrap_system_data

        bootstrap_system_data(db)
        yield SqlRepository(db)
    finally:
        db.close()


def get_wa_connector_client() -> WaConnectorClient:
    return WaConnectorClient(settings.wa_connector_url)


def require_bearer_admin(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token akses wajib dikirim")
    payload = verify_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token akses tidak valid")
    return payload


def verify_internal_token(x_internal_token: str | None = Header(default=None, alias="X-Internal-Token")) -> None:
    if not x_internal_token or x_internal_token != settings.internal_api_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token internal tidak valid")
