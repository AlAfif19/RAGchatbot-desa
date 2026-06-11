from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base
from app.db.repository import SqlRepository, seed_demo_data


def make_repo():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = SessionLocal()
    return session, SqlRepository(session)


def test_seed_demo_data_is_idempotent_and_creates_defaults():
    session, repo = make_repo()

    admin = seed_demo_data(session)
    second_admin = seed_demo_data(session)

    assert admin.id == second_admin.id
    assert repo.authenticate_admin("admin@desa.id", "password")["email"] == "admin@desa.id"
    assert repo.get_ai_settings()["provider"] == "gemini"


def test_crud_data_persists_across_repository_instances():
    session, repo = make_repo()
    seed_demo_data(session)

    created = repo.create(
        "chatbot_numbers",
        {
            "bot_name": "Layanan Desa Baru",
            "phone_number": "+62 811-0000-0001",
            "provider": "Meta Cloud API",
            "webhook_secret": "secret",
            "status": "active",
        },
        "bot",
    )
    assert created["connection_status"] == "connected"

    next_repo = SqlRepository(session)
    rows = next_repo.list("chatbot_numbers")

    assert any(item["id"] == created["id"] for item in rows)
    assert next_repo.delete("chatbot_numbers", created["id"]) is True
    assert all(item["id"] != created["id"] for item in next_repo.list("chatbot_numbers"))


def test_dashboard_summary_and_chat_issue_update_use_database_rows():
    session, repo = make_repo()
    seed_demo_data(session)

    summary = repo.dashboard_summary()
    chat_logs = repo.list("chat_logs")
    marked = repo.mark_chat_issue(chat_logs[0]["id"])

    assert summary["active_bot_count"] == 1
    assert summary["answered_by_faq"] >= 1
    assert marked["review_status"] == "issue"
