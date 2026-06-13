from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.db import models
from app.services.document_processing import chunk_text, estimate_token_count


DEFAULT_AI_SETTINGS = {
    "provider": "gemini",
    "model_name": "gemini-1.5-flash",
    "system_prompt": "Anda adalah chatbot layanan warga. Jawab hanya berdasarkan konteks.",
    "top_k": 5,
    "faq_threshold": 0.8,
    "api_key": "",
    "fallback_answer": "Informasi tersebut belum tersedia di sistem.",
}


MODEL_MAP = {
    "chatbot_numbers": models.ChatbotNumber,
    "data_sources": models.DataSource,
    "faqs": models.Faq,
}


def _iso(value: datetime | None) -> str:
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    return value.replace(tzinfo=timezone.utc).isoformat() if value.tzinfo is None else value.isoformat()


def _next_id(db: Session, model: type) -> int:
    return int(db.scalar(select(func.coalesce(func.max(model.id), 0))) or 0) + 1


def _connection_status(status: str) -> str:
    return "connected" if status == "active" else "disconnected"


def bootstrap_system_data(db: Session) -> models.Admin:
    admin = db.scalar(select(models.Admin).where(models.Admin.email == settings.admin_email))
    if admin is None:
        admin = models.Admin(
            id=_next_id(db, models.Admin),
            name=settings.admin_name,
            email=settings.admin_email,
            password_hash=hash_password(settings.admin_password),
            role="admin",
        )
        db.add(admin)
        db.flush()

    if db.scalar(select(models.AiSetting).where(models.AiSetting.admin_id == admin.id)) is None:
        db.add(models.AiSetting(id=_next_id(db, models.AiSetting), admin_id=admin.id, **DEFAULT_AI_SETTINGS))

    db.commit()
    db.refresh(admin)
    return admin


class SqlRepository:
    def __init__(self, db: Session) -> None:
        self.db = db
        admin = db.scalar(select(models.Admin).where(models.Admin.email == settings.admin_email))
        self.admin_id = admin.id if admin is not None else 1

    def authenticate_admin(self, email: str, password: str) -> dict[str, str] | None:
        admin = self.db.scalar(select(models.Admin).where(models.Admin.email == email))
        if admin is None or not verify_password(password, admin.password_hash):
            return None
        return {"id": str(admin.id), "name": admin.name, "email": admin.email, "role": admin.role}

    def list(self, name: str) -> list[dict[str, Any]]:
        if name == "chat_logs":
            return [self._serialize_chat_message(item) for item in self._chat_messages()]
        model = MODEL_MAP[name]
        rows = self.db.scalars(select(model).order_by(model.updated_at.desc(), model.id.desc())).all()
        return [self._serialize(name, item) for item in rows]

    def create(self, name: str, payload: dict[str, Any], prefix: str) -> dict[str, Any]:
        model = MODEL_MAP[name]
        item = model(id=_next_id(self.db, model), admin_id=self.admin_id, **payload)
        if name == "chatbot_numbers":
            item.connection_status = _connection_status(item.status)
        if name == "data_sources":
            item.compressed_size = int((item.original_size or len(item.content_text or "")) * 0.72)
            item.indexing_status = "pending"
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return self._serialize(name, item)

    def update(self, name: str, item_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        model = MODEL_MAP[name]
        item = self.db.get(model, int(item_id))
        if item is None:
            return None
        for key, value in payload.items():
            setattr(item, key, value)
        if name == "chatbot_numbers":
            item.connection_status = _connection_status(item.status)
        if name == "data_sources":
            item.compressed_size = int((item.original_size or len(item.content_text or "")) * 0.72)
        self.db.commit()
        self.db.refresh(item)
        return self._serialize(name, item)

    def update_chatbot_connection_status(self, item_id: str, connection_status: str) -> dict[str, Any] | None:
        item = self.db.get(models.ChatbotNumber, int(item_id))
        if item is None:
            return None
        item.connection_status = connection_status
        self.db.commit()
        self.db.refresh(item)
        return self._serialize("chatbot_numbers", item)

    def delete(self, name: str, item_id: str) -> bool:
        model = MODEL_MAP[name]
        item = self.db.get(model, int(item_id))
        if item is None:
            return False
        self.db.delete(item)
        self.db.commit()
        return True

    def create_uploaded_data_source(
        self,
        *,
        title: str,
        category: str,
        file_name: str,
        mime_type: str,
        original_size: int,
        content_text: str,
    ) -> dict[str, Any]:
        item = models.DataSource(
            id=_next_id(self.db, models.DataSource),
            admin_id=self.admin_id,
            title=title,
            category=category,
            source_type="file",
            content_text=content_text,
            file_name=file_name,
            mime_type=mime_type,
            original_size=original_size,
            compressed_size=len(content_text.encode("utf-8")),
            indexing_status="completed",
        )
        self.db.add(item)
        self.db.flush()

        for index, text in enumerate(chunk_text(content_text)):
            self.db.add(
                models.DocumentChunk(
                    id=_next_id(self.db, models.DocumentChunk),
                    data_source_id=item.id,
                    chunk_index=index,
                    chunk_text=text,
                    vector_id=f"source-{item.id}-chunk-{index}",
                    token_count=estimate_token_count(text),
                )
            )
        self.db.commit()
        self.db.refresh(item)
        return self._serialize("data_sources", item)

    def list_chunks(self, data_source_id: str) -> list[dict[str, Any]] | None:
        if self.db.get(models.DataSource, int(data_source_id)) is None:
            return None
        chunks = self.db.scalars(
            select(models.DocumentChunk)
            .where(models.DocumentChunk.data_source_id == int(data_source_id))
            .order_by(models.DocumentChunk.chunk_index.asc())
        ).all()
        return [self._serialize_chunk(item) for item in chunks]

    def get_ai_settings(self) -> dict[str, Any]:
        row = self.db.scalar(select(models.AiSetting).where(models.AiSetting.admin_id == self.admin_id))
        if row is None:
            row = models.AiSetting(id=_next_id(self.db, models.AiSetting), admin_id=self.admin_id, **DEFAULT_AI_SETTINGS)
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)
        return self._serialize_ai_settings(row)

    def update_ai_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.db.scalar(select(models.AiSetting).where(models.AiSetting.admin_id == self.admin_id))
        if row is None:
            row = models.AiSetting(id=_next_id(self.db, models.AiSetting), admin_id=self.admin_id, **payload)
            self.db.add(row)
        else:
            for key, value in payload.items():
                setattr(row, key, value)
        self.db.commit()
        self.db.refresh(row)
        return self._serialize_ai_settings(row)

    def dashboard_summary(self) -> dict[str, int]:
        today = datetime.now().date()
        messages = self._chat_messages()
        return {
            "total_chats_today": len([item for item in messages if item.created_at.date() == today]),
            "answered_by_faq": len([item for item in messages if item.answer_source == "faq"]),
            "answered_by_rag": len([item for item in messages if item.answer_source == "rag"]),
            "active_data_sources": int(
                self.db.scalar(select(func.count()).select_from(models.DataSource).where(models.DataSource.indexing_status == "completed"))
                or 0
            ),
            "active_bot_count": int(
                self.db.scalar(select(func.count()).select_from(models.ChatbotNumber).where(models.ChatbotNumber.status == "active"))
                or 0
            ),
        }

    def mark_chat_issue(self, item_id: str) -> dict[str, Any] | None:
        item = self.db.get(models.ChatMessage, int(item_id))
        if item is None:
            return None
        item.review_status = "issue"
        self.db.commit()
        self.db.refresh(item)
        return self._serialize_chat_message(item)

    def get_faq(self, item_id: str) -> dict[str, Any] | None:
        item = self.db.get(models.Faq, int(item_id))
        return self._serialize("faqs", item) if item else None

    def _chat_messages(self) -> list[models.ChatMessage]:
        return list(
            self.db.execute(
                select(models.ChatMessage)
                .options(joinedload(models.ChatMessage.chat_session), joinedload(models.ChatMessage.faq_match_logs))
                .order_by(models.ChatMessage.created_at.desc(), models.ChatMessage.id.desc())
            )
            .unique()
            .scalars()
            .all()
        )

    def _serialize(self, name: str, item: Any) -> dict[str, Any]:
        if name == "chatbot_numbers":
            return {
                "id": str(item.id),
                "bot_name": item.bot_name,
                "phone_number": item.phone_number,
                "provider": item.provider,
                "webhook_secret": item.webhook_secret,
                "status": item.status,
                "connection_status": item.connection_status,
                "updated_at": _iso(item.updated_at),
            }
        if name == "data_sources":
            return {
                "id": str(item.id),
                "title": item.title,
                "category": item.category,
                "source_type": item.source_type,
                "content_text": item.content_text,
                "file_name": item.file_name,
                "mime_type": item.mime_type,
                "original_size": item.original_size,
                "compressed_size": item.compressed_size,
                "indexing_status": item.indexing_status,
                "updated_at": _iso(item.updated_at),
            }
        return {
            "id": str(item.id),
            "question": item.question,
            "answer": item.answer,
            "keywords": item.keywords or "",
            "threshold": item.threshold,
            "is_active": item.is_active,
            "updated_at": _iso(item.updated_at),
        }

    def _serialize_chat_message(self, item: models.ChatMessage) -> dict[str, Any]:
        faq_score = item.faq_match_logs[0].similarity_score if item.faq_match_logs else None
        return {
            "id": str(item.id),
            "session_id": str(item.chat_session_id),
            "citizen_phone": item.chat_session.citizen_phone,
            "message_text": item.message_text or "",
            "answer_text": item.answer_text or "",
            "answer_source": item.answer_source,
            "confidence_score": item.confidence_score,
            "retrieved_context": item.retrieved_context or [],
            "faq_match_score": faq_score,
            "review_status": item.review_status,
            "created_at": _iso(item.created_at),
        }

    def _serialize_ai_settings(self, item: models.AiSetting) -> dict[str, Any]:
        return {
            "provider": item.provider,
            "model_name": item.model_name,
            "system_prompt": item.system_prompt,
            "top_k": item.top_k,
            "faq_threshold": item.faq_threshold,
            "api_key": item.api_key,
            "fallback_answer": item.fallback_answer,
        }

    def _serialize_chunk(self, item: models.DocumentChunk) -> dict[str, Any]:
        return {
            "id": str(item.id),
            "data_source_id": str(item.data_source_id),
            "chunk_index": item.chunk_index,
            "chunk_text": item.chunk_text,
            "vector_id": item.vector_id,
            "token_count": item.token_count,
            "created_at": _iso(item.created_at),
        }
