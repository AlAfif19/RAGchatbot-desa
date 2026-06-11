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
