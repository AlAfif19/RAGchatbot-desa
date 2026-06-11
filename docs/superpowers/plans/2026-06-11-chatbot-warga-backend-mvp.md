# Chatbot Warga Backend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tested FastAPI backend MVP for the approved frontend dashboard, covering auth-ready login, dashboard summary, and CRUD APIs for chatbot numbers, data sources, FAQ, chat logs, and AI settings.

**Architecture:** Create `apps/api` as a modular FastAPI app with routers under `app/api/routes`, Pydantic schemas under `app/schemas`, and an in-memory repository for the first backend MVP so tests run without MySQL. Keep URL and response contracts close to the PRD endpoints and frontend mock data. MySQL, SQLAlchemy, Alembic, Docker Compose, RAG, and WhatsApp webhook are separate follow-up tasks after this API contract is stable.

**Tech Stack:** Python 3.11+, FastAPI, Pydantic v2, Pytest, HTTPX/TestClient, Uvicorn.

---

## Phase Gate

- [x] Frontend MVP approved to proceed to backend.
- [x] Backend MVP API contract complete and tested.
- [ ] Frontend connected to backend API.
- [ ] MySQL/SQLAlchemy/Alembic/Docker Compose.
- [ ] RAG and WhatsApp webhook.
- [ ] End-to-end tests.

## Scope

Backend MVP includes:

- [x] `GET /health`
- [x] `POST /api/auth/login`
- [x] `POST /api/auth/logout`
- [x] `GET /api/dashboard/summary`
- [x] CRUD `/api/chatbot-numbers`
- [x] CRUD `/api/data-sources`
- [x] `POST /api/data-sources/{id}/reindex`
- [x] CRUD `/api/faqs`
- [x] `GET /api/chat-logs`
- [x] `POST /api/chat-logs/{id}/mark-issue`
- [x] `GET /api/settings/ai`
- [x] `PUT /api/settings/ai`

Backend MVP does not include:

- [ ] Real JWT verification middleware.
- [ ] MySQL persistence.
- [ ] File upload storage/compression.
- [ ] Vector database.
- [ ] LLM calls.
- [ ] WhatsApp webhook.

## File Structure

- `apps/api/requirements.txt` - Python dependencies.
- `apps/api/pytest.ini` - pytest path config.
- `apps/api/app/main.py` - FastAPI app factory.
- `apps/api/app/core/config.py` - settings.
- `apps/api/app/core/security.py` - password/token helpers for MVP.
- `apps/api/app/db/memory.py` - in-memory seeded repository.
- `apps/api/app/schemas/common.py` - shared API types.
- `apps/api/app/schemas/auth.py` - auth request/response.
- `apps/api/app/schemas/chatbot_number.py` - chatbot number schemas.
- `apps/api/app/schemas/data_source.py` - data source schemas.
- `apps/api/app/schemas/faq.py` - FAQ schemas.
- `apps/api/app/schemas/chat_log.py` - chat log schemas.
- `apps/api/app/schemas/settings.py` - AI settings schemas.
- `apps/api/app/api/deps.py` - dependency helpers.
- `apps/api/app/api/routes/auth.py` - auth endpoints.
- `apps/api/app/api/routes/dashboard.py` - dashboard summary.
- `apps/api/app/api/routes/chatbot_numbers.py` - chatbot number CRUD.
- `apps/api/app/api/routes/data_sources.py` - data source CRUD and reindex.
- `apps/api/app/api/routes/faqs.py` - FAQ CRUD.
- `apps/api/app/api/routes/chat_logs.py` - chat log list/detail actions.
- `apps/api/app/api/routes/settings.py` - AI settings.
- `apps/api/tests/test_health_auth.py` - health/auth tests.
- `apps/api/tests/test_dashboard_and_crud.py` - CRUD and dashboard tests.
- `apps/api/README.md` - backend scope and commands.

## Task Checklist

### Task 1: Scaffold

- [x] Create `apps/api` structure.
- [x] Add `requirements.txt`.
- [x] Add FastAPI app factory in `app/main.py`.
- [x] Add `/health`.
- [x] Add pytest config.

### Task 2: TDD Auth and Health

- [x] Write failing tests for `/health`, login success, and login failure.
- [x] Run tests and confirm failure.
- [x] Implement config/security/auth route.
- [x] Run tests and confirm pass.

### Task 3: TDD Dashboard and CRUD

- [x] Write failing tests for dashboard summary.
- [x] Write failing tests for chatbot number create/update/delete.
- [x] Write failing tests for data source reindex.
- [x] Write failing tests for FAQ toggle/delete.
- [x] Write failing tests for AI settings update.
- [x] Implement schemas, memory repository, and routers.
- [x] Run tests and confirm pass.

### Task 4: Verification

- [x] Run `python -m pytest apps/api`.
- [x] Run `python -m compileall apps/api/app`.
- [x] Start API with `python -m uvicorn app.main:app --app-dir apps/api --port 8002`.
- [x] Verify `http://127.0.0.1:8002/health`.
- [x] Update this plan status.

## API Contract Notes

MVP responses use camel-like JSON names close to frontend state:

- `bot_name`, `phone_number`, `webhook_secret`, `connection_status`.
- `source_type`, `indexing_status`, `original_size`, `compressed_size`.
- `is_active`, `threshold`.
- `answer_source`, `confidence_score`, `retrieved_context`, `review_status`.

The frontend can map these fields directly or through a small API adapter in the next phase.

## Verification Log

- [x] 2026-06-11: Initial RED confirmed with `ModuleNotFoundError: No module named 'app.main'`.
- [x] 2026-06-11: `python -m pytest apps/api -q` passed with 8 tests.
- [x] 2026-06-11: `python -m compileall apps/api/app` passed.
- [x] 2026-06-11: API started on `http://127.0.0.1:8002` because port 8000 was already occupied.
- [x] 2026-06-11: `GET http://127.0.0.1:8002/health` returned `{"status":"ok","service":"chatbot-warga-api"}`.
