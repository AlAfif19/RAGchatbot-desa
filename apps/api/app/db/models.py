from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


class Admin(TimestampMixin, Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="admin")

    chatbot_numbers: Mapped[list["ChatbotNumber"]] = relationship(back_populates="admin", cascade="all, delete-orphan")
    data_sources: Mapped[list["DataSource"]] = relationship(back_populates="admin", cascade="all, delete-orphan")
    faqs: Mapped[list["Faq"]] = relationship(back_populates="admin", cascade="all, delete-orphan")
    ai_settings: Mapped[list["AiSetting"]] = relationship(back_populates="admin", cascade="all, delete-orphan")


class ChatbotNumber(TimestampMixin, Base):
    __tablename__ = "chatbot_numbers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    bot_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    webhook_secret: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="inactive")
    connection_status: Mapped[str] = mapped_column(String(30), nullable=False, default="disconnected")

    admin: Mapped["Admin"] = relationship(back_populates="chatbot_numbers")
    chat_sessions: Mapped[list["ChatSession"]] = relationship(back_populates="chatbot_number", cascade="all, delete-orphan")


class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    source_type: Mapped[str] = mapped_column(String(30), nullable=False)
    content_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    original_size: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    compressed_size: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    indexing_status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")

    admin: Mapped["Admin"] = relationship(back_populates="data_sources")
    document_chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="data_source", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    data_source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    vector_id: Mapped[str] = mapped_column(String(150), nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    data_source: Mapped["DataSource"] = relationship(back_populates="document_chunks")


class Faq(TimestampMixin, Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    question: Mapped[str] = mapped_column(String(255), nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)

    admin: Mapped["Admin"] = relationship(back_populates="faqs")
    match_logs: Mapped[list["FaqMatchLog"]] = relationship(back_populates="faq", cascade="all, delete-orphan")


class ChatSession(TimestampMixin, Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    chatbot_number_id: Mapped[int] = mapped_column(ForeignKey("chatbot_numbers.id", ondelete="CASCADE"), nullable=False)
    citizen_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    citizen_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="active")
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    chatbot_number: Mapped["ChatbotNumber"] = relationship(back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship(back_populates="chat_session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    chat_session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    direction: Mapped[str] = mapped_column(String(30), nullable=False)
    message_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_source: Mapped[str] = mapped_column(String(30), nullable=False, default="system")
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    retrieved_context: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    review_status: Mapped[str] = mapped_column(String(30), nullable=False, default="normal")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    chat_session: Mapped["ChatSession"] = relationship(back_populates="messages")
    faq_match_logs: Mapped[list["FaqMatchLog"]] = relationship(back_populates="chat_message", cascade="all, delete-orphan")


class FaqMatchLog(Base):
    __tablename__ = "faq_match_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    faq_id: Mapped[int] = mapped_column(ForeignKey("faqs.id", ondelete="CASCADE"), nullable=False)
    chat_message_id: Mapped[int] = mapped_column(ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    faq: Mapped["Faq"] = relationship(back_populates="match_logs")
    chat_message: Mapped["ChatMessage"] = relationship(back_populates="faq_match_logs")


class AiSetting(TimestampMixin, Base):
    __tablename__ = "ai_settings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(100), nullable=False, default="gemini")
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    faq_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    api_key: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    fallback_answer: Mapped[str] = mapped_column(Text, nullable=False)

    admin: Mapped["Admin"] = relationship(back_populates="ai_settings")


Index("idx_document_chunks_vector_id", DocumentChunk.vector_id)
Index("idx_chat_sessions_phone", ChatSession.citizen_phone)
Index("idx_chat_messages_created_at", ChatMessage.created_at)
