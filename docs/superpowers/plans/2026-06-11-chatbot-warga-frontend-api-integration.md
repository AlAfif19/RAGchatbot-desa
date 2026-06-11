# Chatbot Warga Frontend API Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the approved frontend dashboard to the FastAPI backend MVP while preserving mock fallback behavior if the API is unavailable.

**Architecture:** Add a small API adapter in `apps/web/lib/api-client.ts` to map backend snake_case JSON to frontend camelCase types. Extend the existing frontend store with async actions that call backend endpoints and then update reducer state. Keep UI components mostly unchanged by preserving the current `useMockStore()` contract and adding `actions`, `apiStatus`, and `refreshFromApi`.

**Tech Stack:** Next.js, TypeScript, Fetch API, Vitest, FastAPI backend at `NEXT_PUBLIC_API_URL` defaulting to `http://127.0.0.1:8002`.

---

## Checklist

- [x] Add `NEXT_PUBLIC_API_URL` support and document it.
- [x] Add API client with mapping helpers.
- [x] Add tests for API mapping helpers.
- [x] Extend store with `hydrateFromApi` reducer action and async action methods.
- [x] Update login to use backend `/api/auth/login`.
- [x] Update dashboard and CRUD pages to call async actions instead of local-only dispatch.
- [x] Verify frontend tests, lint, and build.
- [x] Verify API routes are reachable from browser.

## Scope

Included:

- Dashboard summary/list hydration from backend.
- Login via backend.
- CRUD actions for chatbot numbers, data sources, FAQ.
- Chat issue marking.
- AI settings update.
- AI provider API key input from web settings.
- Mock fallback if backend is offline.

Excluded:

- MySQL persistence.
- Frontend auth route guards.
- File upload binary transfer.
- RAG/WhatsApp.

## Verification Log

- [x] 2026-06-11: `npm --prefix apps/web test` passed with 3 files and 12 tests.
- [x] 2026-06-11: `npm --prefix apps/web run lint` passed.
- [x] 2026-06-11: `npm --prefix apps/web run build` passed after stopping the dev server and cleaning `.next`.
- [x] 2026-06-11: `GET http://127.0.0.1:8002/health` returned 200.
- [x] 2026-06-11: `GET http://127.0.0.1:3000/dashboard` returned 200 with CSS links.
- [x] 2026-06-11: AI settings now include `api_key` on backend and `apiKey` in frontend, with tests covering mapper and backend roundtrip.
