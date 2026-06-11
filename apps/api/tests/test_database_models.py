from app.db.models import Base


def test_prd_tables_are_declared():
    expected_tables = {
        "admins",
        "chatbot_numbers",
        "data_sources",
        "document_chunks",
        "faqs",
        "chat_sessions",
        "chat_messages",
        "faq_match_logs",
        "ai_settings",
    }

    assert expected_tables.issubset(set(Base.metadata.tables))


def test_ai_settings_has_api_key_column():
    columns = Base.metadata.tables["ai_settings"].columns

    assert "api_key" in columns
    assert "provider" in columns
    assert "fallback_answer" in columns
