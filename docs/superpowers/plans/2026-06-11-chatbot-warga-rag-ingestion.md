# Chatbot Warga RAG Ingestion Implementation Plan

**Goal:** Add the first usable RAG ingestion path: upload a text-based document from the web, extract text, create document chunks, and persist metadata/chunks in MySQL.

**Scope:** This phase supports TXT, Markdown, and CSV files. PDF/DOCX/image/video extraction, embeddings, vector search, and WhatsApp answering are intentionally deferred.

## Checklist

- [x] Confirm FastAPI multipart upload pattern using current documentation.
- [x] Add backend document processing service for text-file validation, UTF-8 decoding, chunking, and token estimation.
- [x] Add `DocumentChunkPublic` schema.
- [x] Add `python-multipart` backend dependency.
- [x] Add `POST /api/data-sources/upload`.
- [x] Add `GET /api/data-sources/{id}/chunks`.
- [x] Persist uploaded source metadata and generated chunks with SQLAlchemy.
- [x] Add backend upload test covering upload, indexing status, and chunk retrieval.
- [x] Add frontend multipart API client method.
- [x] Add Data Source page file picker for TXT/MD/CSV upload.
- [x] Connect frontend store action to upload endpoint with local fallback.
- [x] Verify backend, frontend tests, lint, build, Docker API upload smoke test, and Docker web route.

## Verification Log

- [x] 2026-06-11: RED test confirmed upload endpoint did not exist: `405 Method Not Allowed`.
- [x] 2026-06-11: Upload test passed after implementation.
- [x] 2026-06-11: Backend suite passed: `14 passed`.
- [x] 2026-06-11: Frontend test suite passed: `12 passed`.
- [x] 2026-06-11: Frontend lint passed: `eslint .`.
- [x] 2026-06-11: Frontend production build passed: `next build`.
- [x] 2026-06-11: Docker API recreated with `python-multipart` and `/health` returned OK.
- [x] 2026-06-11: Docker upload smoke test created a completed data source and 1 document chunk, then deleted the smoke data.
- [x] 2026-06-11: Docker web `/data-source` returned HTTP 200.

## Next Steps

- [ ] Add PDF/DOCX extraction.
- [ ] Store original uploaded files in a local/volume-backed uploads directory.
- [ ] Add embeddings provider abstraction using AI settings.
- [ ] Store vector IDs from an embedding/vector database.
- [ ] Add retrieval endpoint for previewing top chunks.
