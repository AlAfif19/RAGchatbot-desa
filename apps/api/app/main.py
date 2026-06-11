from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, chat_logs, chatbot_numbers, dashboard, data_sources, faqs, settings
from app.db.repository import seed_demo_data
from app.db.session import SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Chatbot Warga API", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "chatbot-warga-api"}

    app.include_router(auth.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(chatbot_numbers.router, prefix="/api")
    app.include_router(data_sources.router, prefix="/api")
    app.include_router(faqs.router, prefix="/api")
    app.include_router(chat_logs.router, prefix="/api")
    app.include_router(settings.router, prefix="/api")
    return app


app = create_app()
