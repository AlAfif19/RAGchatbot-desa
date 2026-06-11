# Chatbot Warga Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend-only admin dashboard MVP for Chatbot Warga WhatsApp AI RAG using mock data, so the UI and admin workflows can be reviewed before backend work starts.

**Architecture:** Create a Next.js TypeScript app under `apps/web` with route groups for login and dashboard pages. Use local mock data and client-side state for all CRUD interactions, with no API calls in this phase. Keep feature modules small: shared UI/layout, mock data/types, forms, tables, and page-specific components.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Table, Redux Toolkit or local client state, lucide-react, Motion.

---

## Phase Gate

- [ ] **Frontend gate:** Finish all frontend tasks, run verification, and get user approval before starting backend.
- [x] **Backend gate:** Do not create FastAPI, MySQL, Docker, RAG, LLM, or WhatsApp webhook files during frontend phase.

## Execution Status

- [x] Scaffold Next.js frontend under `apps/web`.
- [x] Add TypeScript, Tailwind, ESLint, Vitest, and shadcn/ui config.
- [x] Add mock domain types, mock data, validation schemas, format helpers, and client reducer store.
- [x] Add TDD tests for validation schemas and mock reducer behavior.
- [x] Build shared app shell, sidebar, mobile drawer, metric card, status badge, responsive table, empty state, and confirm dialog.
- [x] Build login page with mock auth.
- [x] Build dashboard overview with metric cards, chart, and latest questions table.
- [x] Build Nomor Chatbot CRUD with validation and local state.
- [x] Build Sumber Data CRUD with file type validation and re-index simulation.
- [x] Build FAQ CRUD with threshold validation and active toggle.
- [x] Build Chat Log page with filters, detail view, RAG context mock, and issue flag.
- [x] Build Pengaturan AI form with validation and local save.
- [x] Add frontend README.
- [x] Run final `npm --prefix apps/web test`.
- [x] Run final `npm --prefix apps/web run lint`.
- [x] Run final `npm --prefix apps/web run build`.
- [x] Start local dev server at `http://127.0.0.1:3000`.
- [x] Check dashboard desktop, tablet, and mobile snapshots with Playwright.
- [x] Re-check styling after user report: cleaned stale `.next`, removed problematic `app/icon.svg`, moved favicon to `public/favicon.svg`, restarted dev server, and verified every frontend route returns 200 with CSS links.
- [x] Restyled login page into a more presentable two-section demo screen with preview metrics and a direct demo link.
- [ ] User approval for frontend.
- [ ] Backend implementation plan.
- [ ] Backend implementation.
- [ ] RAG and WhatsApp implementation.
- [ ] End-to-end testing after backend/RAG/WhatsApp.

### Verification Notes

Final verification on 2026-06-11:

- `npm --prefix apps/web test`: 2 test files passed, 9 tests passed.
- `npm --prefix apps/web run lint`: passed.
- `npm --prefix apps/web run build`: passed and generated 12 static app routes.

Known environment warning:

- Next.js falls back to `@next/swc-wasm-nodejs` because the native `@next/swc-win32-x64-msvc` package reports `not a valid Win32 application` in this environment. Build still exits successfully.
- The custom ESLint flat config does not load the Next.js ESLint plugin because `eslint-config-next` failed under ESLint 9 with a Rushstack patch error. Type and route correctness are still checked by `next build`.
- Do not delete `.next` while the dev server is running. Doing so causes stale dev-server chunk and manifest errors until the server is restarted.

## File Structure

Create these files during frontend implementation:

- `apps/web/package.json` - frontend dependencies and scripts.
- `apps/web/next.config.ts` - Next.js configuration.
- `apps/web/tsconfig.json` - TypeScript configuration.
- `apps/web/postcss.config.mjs` - Tailwind PostCSS setup.
- `apps/web/tailwind.config.ts` - Tailwind theme and content paths.
- `apps/web/components.json` - shadcn/ui configuration.
- `apps/web/app/globals.css` - app theme, CSS variables, base styles.
- `apps/web/app/layout.tsx` - root HTML layout.
- `apps/web/app/page.tsx` - redirect entry to login or dashboard mock flow.
- `apps/web/app/login/page.tsx` - login page.
- `apps/web/app/(dashboard)/layout.tsx` - dashboard shell.
- `apps/web/app/(dashboard)/dashboard/page.tsx` - overview dashboard.
- `apps/web/app/(dashboard)/chatbot-number/page.tsx` - chatbot number CRUD.
- `apps/web/app/(dashboard)/data-source/page.tsx` - data source CRUD and upload mock.
- `apps/web/app/(dashboard)/faq/page.tsx` - FAQ CRUD.
- `apps/web/app/(dashboard)/chat-log/page.tsx` - chat log filters and detail.
- `apps/web/app/(dashboard)/settings/page.tsx` - AI settings form.
- `apps/web/components/layout/app-shell.tsx` - sidebar, topbar, responsive navigation.
- `apps/web/components/layout/nav-items.ts` - navigation config.
- `apps/web/components/dashboard/metric-card.tsx` - compact metric card.
- `apps/web/components/shared/status-badge.tsx` - status badge variants.
- `apps/web/components/shared/confirm-dialog.tsx` - delete confirmation dialog.
- `apps/web/components/shared/empty-state.tsx` - empty state component.
- `apps/web/components/shared/page-header.tsx` - title, description, actions.
- `apps/web/components/shared/responsive-table.tsx` - horizontal-scroll table wrapper.
- `apps/web/lib/types.ts` - shared frontend domain types.
- `apps/web/lib/mock-data.ts` - seed data aligned to PRD entities.
- `apps/web/lib/mock-store.tsx` - client-side provider and reducer/actions.
- `apps/web/lib/format.ts` - date, number, file-size formatting helpers.
- `apps/web/lib/validation.ts` - Zod schemas for forms.
- `apps/web/lib/utils.ts` - className helper.
- `apps/web/tests/validation.test.ts` - schema and helper tests.
- `apps/web/tests/mock-store.test.tsx` - reducer/action tests.
- `apps/web/README.md` - frontend run and scope notes.

Modify these existing files:

- `docs/superpowers/specs/2026-06-11-chatbot-warga-frontend-mvp-design.md` - keep checklist status updated.
- `PRD_Chatbot_Warga_WhatsApp_AI_RAG.md` - do not modify unless the user explicitly asks.

## Task 1: Scaffold Next.js Frontend

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/components.json`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/lib/utils.ts`

- [ ] **Step 1: Create the frontend app folder**

Run:

```powershell
New-Item -ItemType Directory -Force -Path apps/web/app, apps/web/lib, apps/web/components | Out-Null
```

Expected: directories exist under `apps/web`.

- [ ] **Step 2: Create `apps/web/package.json`**

Use dependencies that support the PRD dashboard:

```json
{
  "name": "chatbot-warga-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.0.1",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@reduxjs/toolkit": "^2.8.2",
    "@tanstack/react-table": "^8.21.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.18.1",
    "lucide-react": "^0.468.0",
    "next": "^15.3.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.57.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.25.64"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.15.31",
    "@types/react": "^19.1.7",
    "@types/react-dom": "^19.1.6",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.29.0",
    "eslint-config-next": "^15.3.3",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vitest": "^3.2.3"
  }
}
```

- [ ] **Step 3: Create base config files**

Create minimal config for Next.js, Tailwind, TypeScript, PostCSS, and shadcn/ui.

Expected:

```powershell
npm --prefix apps/web install
npm --prefix apps/web run build
```

Build can fail only because pages are not complete yet; dependency installation must succeed.

- [ ] **Step 4: Create root layout and redirect page**

`app/layout.tsx` imports `globals.css` and renders children. `app/page.tsx` redirects to `/login`.

- [ ] **Step 5: Commit or checkpoint**

Repo currently has no `.git`. If git is initialized later:

```bash
git add apps/web docs/superpowers
git commit -m "chore: scaffold frontend dashboard"
```

## Task 2: Build Domain Types, Mock Data, and Store

**Files:**
- Create: `apps/web/lib/types.ts`
- Create: `apps/web/lib/mock-data.ts`
- Create: `apps/web/lib/mock-store.tsx`
- Create: `apps/web/lib/format.ts`
- Create: `apps/web/lib/validation.ts`
- Test: `apps/web/tests/validation.test.ts`
- Test: `apps/web/tests/mock-store.test.tsx`

- [ ] **Step 1: Define frontend domain types**

Include these types in `types.ts`: `ChatbotNumber`, `DataSource`, `FaqItem`, `ChatSession`, `ChatMessage`, `AiSettings`, `DashboardSummary`, and status unions aligned with the PRD.

- [ ] **Step 2: Add mock seed data**

Create realistic Indonesian village data in `mock-data.ts`:

- Bot: `Layanan Desa Sukamaju`.
- Categories: `Administrasi`, `Kesehatan`, `Kegiatan`, `Pengumuman`.
- FAQ examples: surat domisili, jadwal posyandu, syarat KTP, kontak kantor desa.
- Chat logs with answer sources: `faq`, `rag`, `fallback`.

- [ ] **Step 3: Add validation schemas**

Create Zod schemas for:

- Login: valid email, password required.
- Chatbot number: bot name, phone number, provider, active status.
- Data source: title, category, source type, optional content text, optional file metadata.
- FAQ: question, answer, keywords, threshold 0-1, active status.
- AI settings: provider, model name, system prompt, top K, FAQ threshold, fallback answer.

- [ ] **Step 4: Add client store**

Use a React context reducer or Redux Toolkit slice. Required actions:

- `loginMock`
- `logoutMock`
- `addChatbotNumber`
- `updateChatbotNumber`
- `deleteChatbotNumber`
- `toggleChatbotNumber`
- `addDataSource`
- `updateDataSource`
- `deleteDataSource`
- `reindexDataSource`
- `addFaq`
- `updateFaq`
- `deleteFaq`
- `toggleFaq`
- `markChatAnswerIssue`
- `updateAiSettings`

- [ ] **Step 5: Write tests first for schemas and reducer**

Test examples:

```ts
import { describe, expect, it } from "vitest";
import { faqSchema, loginSchema } from "../lib/validation";

describe("validation schemas", () => {
  it("accepts valid login input", () => {
    expect(loginSchema.parse({ email: "admin@desa.id", password: "secret" })).toEqual({
      email: "admin@desa.id",
      password: "secret"
    });
  });

  it("rejects FAQ threshold outside 0 to 1", () => {
    expect(() =>
      faqSchema.parse({
        question: "Apa syarat surat domisili?",
        answer: "Bawa KTP dan KK.",
        keywords: "domisili",
        threshold: 1.5,
        isActive: true
      })
    ).toThrow();
  });
});
```

- [ ] **Step 6: Run tests**

Run:

```powershell
npm --prefix apps/web test
```

Expected: validation and store tests pass.

## Task 3: Build Shared Layout and UI Primitives

**Files:**
- Create: `apps/web/components/layout/app-shell.tsx`
- Create: `apps/web/components/layout/nav-items.ts`
- Create: `apps/web/components/shared/page-header.tsx`
- Create: `apps/web/components/shared/status-badge.tsx`
- Create: `apps/web/components/shared/confirm-dialog.tsx`
- Create: `apps/web/components/shared/empty-state.tsx`
- Create: `apps/web/components/shared/responsive-table.tsx`
- Modify: `apps/web/app/(dashboard)/layout.tsx`
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Create navigation config**

Use lucide icons for:

- Dashboard.
- Nomor Chatbot.
- Sumber Data.
- FAQ.
- Chat Log.
- Pengaturan AI.

- [ ] **Step 2: Create app shell**

Desktop layout:

- Left sidebar.
- Topbar with page title area and admin identity.
- Main content with constrained width.

Mobile layout:

- Topbar.
- Drawer or compact nav.
- No overlapping text.

- [ ] **Step 3: Create shared components**

Components must support:

- `PageHeader` with title, description, and action slot.
- `StatusBadge` variants for active, inactive, connected, disconnected, pending, processing, completed, failed, faq, rag, fallback.
- `ConfirmDialog` for delete confirmation.
- `EmptyState` for empty filtered results.
- `ResponsiveTable` with horizontal overflow.

- [ ] **Step 4: Verify responsive shell**

Run:

```powershell
npm --prefix apps/web run dev
```

Open `http://localhost:3000` and verify:

- Desktop sidebar does not overlap content.
- Mobile width keeps navigation usable.
- Text stays inside buttons and badges.

## Task 4: Build Login Page

**Files:**
- Create/Modify: `apps/web/app/login/page.tsx`
- Use: `apps/web/lib/validation.ts`
- Use: `apps/web/lib/mock-store.tsx`

- [ ] **Step 1: Build login form**

Fields:

- Email.
- Password.
- Submit button.

Validation:

- Email must be valid.
- Password is required.

- [ ] **Step 2: Add mock auth behavior**

On valid submit, set mock auth state and navigate to `/dashboard`. On invalid submit, show field errors.

- [ ] **Step 3: Verify login**

Manual test:

- Empty submit shows validation.
- Invalid email shows email validation.
- Valid email and password routes to `/dashboard`.

## Task 5: Build Dashboard Overview

**Files:**
- Create: `apps/web/components/dashboard/metric-card.tsx`
- Create/Modify: `apps/web/app/(dashboard)/dashboard/page.tsx`
- Use: `apps/web/lib/mock-store.tsx`
- Use: `apps/web/lib/format.ts`

- [ ] **Step 1: Build metric cards**

Cards:

- Total chat hari ini.
- Total dijawab FAQ.
- Total dijawab RAG.
- Total sumber data aktif.
- Status nomor chatbot.

- [ ] **Step 2: Build chart placeholder using real mock data**

Use a simple CSS bar chart or lightweight component from local data. Do not add a heavy chart dependency in MVP unless needed.

- [ ] **Step 3: Build latest questions table**

Columns:

- Waktu.
- Nomor warga.
- Pertanyaan.
- Sumber jawaban.
- Confidence.

- [ ] **Step 4: Verify overview**

Expected:

- Dashboard loads under 3 seconds locally.
- Cards fit mobile and desktop.
- Latest questions table scrolls horizontally on small screens.

## Task 6: Build Nomor Chatbot CRUD

**Files:**
- Create/Modify: `apps/web/app/(dashboard)/chatbot-number/page.tsx`
- Use: `apps/web/lib/validation.ts`
- Use: `apps/web/components/shared/confirm-dialog.tsx`

- [ ] **Step 1: Build table**

Columns:

- Nama bot.
- Nomor WhatsApp.
- Provider.
- Status koneksi.
- Status aktif.
- Webhook secret masked.
- Aksi.

- [ ] **Step 2: Build add/edit dialog**

Fields:

- Bot name.
- Phone number.
- Provider.
- Webhook secret.
- Active status.

- [ ] **Step 3: Wire local CRUD actions**

Actions:

- Add.
- Edit.
- Delete with confirmation.
- Toggle active/inactive.

- [ ] **Step 4: Verify validation**

Expected:

- Empty required fields show errors.
- Invalid phone characters are rejected.
- Add/edit updates table immediately.

## Task 7: Build Sumber Data CRUD and Upload Mock

**Files:**
- Create/Modify: `apps/web/app/(dashboard)/data-source/page.tsx`
- Use: `apps/web/lib/validation.ts`
- Use: `apps/web/components/shared/status-badge.tsx`

- [ ] **Step 1: Build data source table**

Columns:

- Judul.
- Kategori.
- Tipe.
- Status indexing.
- Ukuran asli.
- Ukuran kompresi.
- Update terakhir.
- Aksi.

- [ ] **Step 2: Build add/edit dialog**

Fields:

- Title.
- Category.
- Source type.
- Manual text.
- File input mock.

- [ ] **Step 3: Validate file type in frontend**

Accepted mock types:

- PDF.
- DOCX.
- TXT.
- CSV.
- Image.
- Video.

- [ ] **Step 4: Wire local actions**

Actions:

- Add.
- Edit metadata.
- Delete with confirmation.
- Re-index simulation sets status to `processing`, then `completed`.

- [ ] **Step 5: Verify source data flow**

Expected:

- Empty state appears when filter has no result.
- Processing/completed badges render correctly.
- Re-index does not call backend.

## Task 8: Build FAQ CRUD

**Files:**
- Create/Modify: `apps/web/app/(dashboard)/faq/page.tsx`
- Use: `apps/web/lib/validation.ts`
- Use: `apps/web/components/shared/confirm-dialog.tsx`

- [ ] **Step 1: Build FAQ table**

Columns:

- Pertanyaan.
- Jawaban preview.
- Kata kunci.
- Threshold.
- Status.
- Aksi.

- [ ] **Step 2: Build add/edit dialog**

Fields:

- Question.
- Answer.
- Keywords.
- Threshold.
- Active status.

- [ ] **Step 3: Wire local actions**

Actions:

- Add.
- Edit.
- Delete with confirmation.
- Toggle active/inactive.

- [ ] **Step 4: Verify FAQ validation**

Expected:

- Question and answer are required.
- Threshold below 0 or above 1 is rejected.
- Toggle updates badge and dashboard counts where relevant.

## Task 9: Build Chat Log Page

**Files:**
- Create/Modify: `apps/web/app/(dashboard)/chat-log/page.tsx`
- Use: `apps/web/lib/mock-store.tsx`
- Use: `apps/web/components/shared/status-badge.tsx`
- Use: `apps/web/components/shared/empty-state.tsx`

- [ ] **Step 1: Build filters**

Filters:

- Date.
- Citizen phone.
- Keyword.
- Answer source.

- [ ] **Step 2: Build chat log table**

Columns:

- Waktu.
- Nomor warga.
- Pertanyaan.
- Jawaban preview.
- Sumber.
- Confidence.
- Status review.
- Aksi detail.

- [ ] **Step 3: Build detail panel or dialog**

Detail includes:

- Citizen phone.
- Incoming question.
- Outgoing answer.
- Answer source.
- Retrieved context mock.
- FAQ match score when available.
- Button to mark answer issue.

- [ ] **Step 4: Verify filters and issue marking**

Expected:

- Keyword filter searches question and answer.
- Source filter narrows results.
- Mark issue changes local review status.

## Task 10: Build AI Settings Page

**Files:**
- Create/Modify: `apps/web/app/(dashboard)/settings/page.tsx`
- Use: `apps/web/lib/validation.ts`
- Use: `apps/web/lib/mock-store.tsx`

- [ ] **Step 1: Build settings form**

Fields:

- Provider LLM.
- Model name.
- System prompt.
- Top K retrieval.
- FAQ threshold.
- Fallback answer.

- [ ] **Step 2: Wire local save**

On save, update local AI settings and show a non-intrusive success message.

- [ ] **Step 3: Verify settings validation**

Expected:

- Top K must be at least 1.
- FAQ threshold must be 0 to 1.
- System prompt and fallback answer are required.

## Task 11: Frontend Verification

**Files:**
- Modify: `apps/web/README.md`
- Modify: `docs/superpowers/specs/2026-06-11-chatbot-warga-frontend-mvp-design.md`

- [ ] **Step 1: Run static checks**

Run:

```powershell
npm --prefix apps/web run lint
npm --prefix apps/web test
npm --prefix apps/web run build
```

Expected: all commands pass.

- [ ] **Step 2: Run local app**

Run:

```powershell
npm --prefix apps/web run dev
```

Expected: app available at `http://localhost:3000`.

- [ ] **Step 3: Manual responsive test**

Check:

- Login.
- Dashboard.
- Nomor Chatbot.
- Sumber Data.
- FAQ.
- Chat Log.
- Settings.

Viewport widths:

- 375px mobile.
- 768px tablet.
- 1366px desktop.

- [ ] **Step 4: Update README**

Document:

- Frontend-only scope.
- Install command.
- Dev command.
- Test command.
- Build command.
- Mock login behavior.
- Backend is intentionally not included yet.

- [ ] **Step 5: Update design checklist**

In `docs/superpowers/specs/2026-06-11-chatbot-warga-frontend-mvp-design.md`, mark:

- Frontend dibuat dengan mock data.
- Frontend diuji dan dipresentasikan.

Only mark them after implementation and verification actually pass.

## Task 12: Backend Planning Gate

**Files:**
- Create later: `docs/superpowers/plans/2026-06-11-chatbot-warga-backend-mvp.md`

- [ ] **Step 1: Ask user to approve frontend**

After frontend verification, present the local URL and screenshots or notes from responsive testing.

- [ ] **Step 2: Start backend plan only after approval**

Backend plan must cover:

- FastAPI.
- MySQL Docker Compose.
- SQLAlchemy.
- Alembic.
- JWT auth.
- CRUD endpoints.
- Frontend API adapter.

- [ ] **Step 3: Keep RAG and WhatsApp separate**

RAG and WhatsApp webhook must be a later plan after backend CRUD works.

## Self-Review Checklist

- [x] Covers PRD frontend pages: login, dashboard, nomor chatbot, sumber data, FAQ, chat log, settings.
- [x] Keeps frontend phase free of backend, database, webhook, RAG, LLM, and Docker.
- [x] Includes mock data and local CRUD behavior.
- [x] Includes validation and empty/error states.
- [x] Includes responsive verification.
- [x] Includes testing commands.
- [x] Includes gate before backend work.
