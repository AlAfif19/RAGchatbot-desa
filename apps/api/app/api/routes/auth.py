from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_repo
from app.core.security import create_access_token
from app.db.repository import SqlRepository
from app.schemas.auth import AdminPublic, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, repo: SqlRepository = Depends(get_repo)) -> LoginResponse:
    admin = repo.authenticate_admin(payload.email, payload.password)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah")
    return LoginResponse(
        access_token=create_access_token(admin),
        token_type="bearer",
        admin=AdminPublic(**admin),
    )


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"status": "ok"}
