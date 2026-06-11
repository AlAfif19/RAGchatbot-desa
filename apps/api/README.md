# Chatbot Warga API

Backend MVP untuk dashboard Chatbot Warga WhatsApp AI RAG.

## Scope Saat Ini

Tahap ini membuat kontrak API FastAPI dengan in-memory repository agar frontend bisa mulai disambungkan tanpa menunggu database. Belum ada MySQL, Alembic, Docker Compose, file upload sungguhan, RAG, LLM, atau webhook WhatsApp.

## Perintah

```powershell
python -m pip install -r apps/api/requirements.txt
python -m pytest apps/api
python -m compileall apps/api/app
python -m uvicorn app.main:app --app-dir apps/api --reload --port 8000
```

## Endpoint

1. `GET /health`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/dashboard/summary`
5. `GET|POST /api/chatbot-numbers`
6. `PUT|DELETE /api/chatbot-numbers/{id}`
7. `GET|POST /api/data-sources`
8. `PUT|DELETE /api/data-sources/{id}`
9. `POST /api/data-sources/{id}/reindex`
10. `GET|POST /api/faqs`
11. `PUT|DELETE /api/faqs/{id}`
12. `POST /api/faqs/{id}/toggle`
13. `GET /api/chat-logs`
14. `POST /api/chat-logs/{id}/mark-issue`
15. `GET|PUT /api/settings/ai`

`/api/settings/ai` menyimpan `api_key` untuk provider AI pada MVP repository. Pada production nanti nilai ini sebaiknya dienkripsi atau dikelola lewat secret manager/environment.

## Demo Login

```json
{
  "email": "admin@desa.id",
  "password": "password"
}
```

## Tahap Berikutnya

1. Sambungkan frontend ke API ini melalui adapter.
2. Tambahkan persistence MySQL dengan SQLAlchemy dan Alembic.
3. Tambahkan Docker Compose.
4. Tambahkan pipeline file, RAG, LLM, dan webhook WhatsApp.
