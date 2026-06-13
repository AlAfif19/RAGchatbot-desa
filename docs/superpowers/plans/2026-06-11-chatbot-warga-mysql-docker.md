# Chatbot Warga MySQL Docker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MySQL, Alembic, SQLAlchemy models, and Docker Compose so backend data can move from memory repository to persistent storage.

**Architecture:** Keep current FastAPI API contract stable while adding database infrastructure under `apps/api/app/db`. Use SQLAlchemy 2.0 declarative models matching the PRD PDM, Alembic for migrations, and Docker Compose for MySQL without root password as requested in the PRD. Switch routers from memory repository to SQLAlchemy repository only after migration tests pass.

**Tech Stack:** FastAPI, SQLAlchemy 2.0, Alembic, PyMySQL, MySQL 8.4, Docker Compose.

---

## Checklist

- [x] Add `.env.example`.
- [x] Create local `.env` from `.env.example` for compose validation.
- [x] Add `docker-compose.yml` with MySQL, API, and web services.
- [x] Add database dependencies to `apps/api/requirements.txt`.
- [x] Add SQLAlchemy engine/session config.
- [x] Add SQLAlchemy models for admins, chatbot_numbers, data_sources, document_chunks, faqs, chat_sessions, chat_messages, faq_match_logs, ai_settings.
- [x] Add Alembic config and initial migration.
- [x] Add seed script for demo admin/settings.
- [x] Add DB repository implementation.
- [x] Switch routers from memory repository to DB dependency.
- [x] Add integration tests using SQLite or test MySQL.
- [x] Fix API container dependency for `EmailStr` validation.
- [x] Run Alembic migration automatically before API container starts.
- [x] Isolate web `node_modules` and `.next` in Docker volumes.
- [x] Verify Docker Compose MySQL/API/web stack.
- [ ] Add production Dockerfiles for faster repeatable image builds.

## Scope Notes

This phase persists admin dashboard data. It does not implement RAG, embeddings, file compression, worker queues, or WhatsApp webhook yet.

## Verification Log

- [x] 2026-06-11: `docker compose config` passed after creating `.env` from `.env.example`.
- [x] 2026-06-11: Backend tests still pass after adding database dependencies and AI API key setting.
- [x] 2026-06-11: Frontend tests/lint/build still pass after adding AI API key setting.
- [x] 2026-06-11: SQLAlchemy model metadata tests passed.
- [x] 2026-06-11: Alembic `upgrade head` and `downgrade base` passed against local SQLite fallback.
- [x] 2026-06-11: MySQL container reached healthy status and `mysqladmin ping` returned alive.
- [x] 2026-06-11: Alembic `upgrade head` passed against Docker MySQL and created PRD tables.
- [x] 2026-06-11: API container starts, runs Alembic, and `http://localhost:8000/health` returns `{"status":"ok","service":"chatbot-warga-api"}`.
- [x] 2026-06-11: Web container starts Next.js and `http://localhost:3000/login` plus `/dashboard` return HTTP 200.
- [x] 2026-06-11: SQL repository tests added for seed idempotency, persisted CRUD, dashboard metrics, and chat issue marking.
- [x] 2026-06-11: FastAPI routers switched from memory repository to SQLAlchemy repository while preserving response contracts.
- [x] 2026-06-11: Backend suite passed with DB repository enabled: `13 passed`.
- [x] 2026-06-11: Docker API verified against MySQL-backed repository: login, dashboard summary, AI settings, and chatbot number create/delete smoke test passed.
- [x] 2026-06-11: Final backend verification passed: `python -m pytest apps/api -q`, `python -m compileall apps/api/app`, and `docker compose config --quiet`.

---

## Follow-up Phase: WhatsApp Web JS QR Pairing

**Goal:** Allow admin to connect a chatbot WhatsApp number by scanning the QR code shown in the dashboard, without manually configuring provider tokens, webhook URLs, or other WhatsApp settings.

**Architecture:** Add a separate Node.js service under `apps/wa-connector` using `whatsapp-web.js`. Keep FastAPI as the dashboard/data/RAG API. The WA connector owns WhatsApp Web sessions, QR generation, connection state, incoming WhatsApp events, and outbound WhatsApp sends. FastAPI exposes dashboard-facing endpoints and proxies session actions/status to the WA connector. Persist WhatsApp session data in a Docker volume so connected numbers do not need to scan again after container restart.

**Tech Stack:** whatsapp-web.js, Node.js, Express, Puppeteer/Chromium, Docker Compose volume for session persistence.

### Checklist

- [x] Add `apps/wa-connector` Node.js service.
- [x] Install and configure `whatsapp-web.js` with local auth/session storage.
- [x] Add WA connector health endpoint.
- [x] Add WA connector session endpoints:
  - [x] `POST /sessions/:chatbotNumberId/start`
  - [x] `GET /sessions/:chatbotNumberId/status`
  - [x] `GET /sessions/:chatbotNumberId/qr`
  - [x] `POST /sessions/:chatbotNumberId/logout`
- [x] Emit connection states: `disconnected`, `pending_qr`, `connecting`, `connected`, `error`.
- [x] Store QR payload or QR image data temporarily while pairing is pending.
- [x] Add Dockerfile for WA connector with Chromium dependencies.
- [x] Add WA connector service and persistent session volume to `docker-compose.yml`.
- [x] Add FastAPI settings for internal WA connector base URL.
- [x] Add FastAPI dashboard endpoints:
  - [x] `POST /api/chatbot-numbers/{id}/connect`
  - [x] `GET /api/chatbot-numbers/{id}/connection`
  - [x] `POST /api/chatbot-numbers/{id}/disconnect`
- [x] Update chatbot number repository/model contract to track latest connection status from WA connector.
- [x] Update dashboard chatbot number page to show a QR pairing panel.
- [x] Add "Hubungkan" action that starts a WhatsApp Web session and displays the QR code.
- [x] Auto-refresh or poll pairing status until the number is connected.
- [x] Hide manual provider/webhook setup for the WhatsApp Web JS pairing path.
- [x] Add internal API from WA connector to FastAPI for incoming messages.
- [x] Add outbound send API from FastAPI to WA connector for chatbot replies.
- [x] Add tests for FastAPI WA connector proxy endpoints with mocked connector responses.
- [x] Add WA connector unit tests for session status mapping and QR response shape where feasible.
- [ ] Verify QR scan flow in Docker Compose with a real WhatsApp device.

### Scope Notes

This phase connects WhatsApp through WhatsApp Web QR pairing. It does not use WhatsApp Cloud API, provider tokens, or manual webhook setup. Message answering initially forwards inbound messages to a placeholder FastAPI endpoint; FAQ/RAG answer generation remains a follow-up phase.

### Verification Log

- [x] WA connector route tests pass with mocked session manager.
- [x] FastAPI WA connector proxy tests pass with mocked connector responses.
- [x] Frontend API/reducer tests pass for QR pairing state.
- [x] 2026-06-13: Backend suite passed after WA connector proxy work: `20 passed`.
- [x] 2026-06-13: Frontend suite passed after QR pairing UI state work: `15 passed`.
- [x] 2026-06-13: WA connector route tests passed: `4 passed`.
- [x] 2026-06-13: Frontend lint and production build passed; Next build still reports the existing ESLint plugin warning.
- [x] 2026-06-13: `docker compose config --quiet` passed with the WA connector service.
- [ ] 2026-06-13: `docker compose build wa-connector` did not complete within 10 minutes; Docker CLI/daemon stopped responding to `docker version` during follow-up checks.
- [x] 2026-06-13: Added manual no-Docker dev runner `scripts/dev.ps1` for API, web, and WA connector in one terminal.
- [ ] WA connector container starts and health endpoint returns ok.
- [ ] Dashboard can request a session start and display a scannable QR code.
- [ ] Scanning the QR from WhatsApp changes status to `connected`.
- [ ] Session persists after restarting the WA connector container.
- [ ] Disconnect action logs out the WhatsApp Web session and clears session state.
