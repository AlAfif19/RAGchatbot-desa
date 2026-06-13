# Chatbot Warga API

Backend FastAPI untuk dashboard Chatbot Warga WhatsApp AI RAG.

## Perintah

```powershell
python -m pip install -r apps/api/requirements.txt
python -m pytest apps/api
python -m compileall apps/api/app
python -m uvicorn app.main:app --app-dir apps/api --reload --port 8002
```

## Environment Penting

```txt
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisAdminPassword123!
JWT_SECRET=change_this_secret
INTERNAL_API_TOKEN=change_this_internal_token
WA_CONNECTOR_URL=http://127.0.0.1:3010
```

Ganti nilai rahasia sebelum deployment produksi.

## Endpoint

1. `GET /health`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/dashboard/summary`
5. `GET|POST /api/chatbot-numbers`
6. `PUT|DELETE /api/chatbot-numbers/{id}`
7. `POST /api/chatbot-numbers/{id}/connect`
8. `GET /api/chatbot-numbers/{id}/connection`
9. `POST /api/chatbot-numbers/{id}/disconnect`
10. `GET|POST /api/data-sources`
11. `PUT|DELETE /api/data-sources/{id}`
12. `POST /api/data-sources/{id}/reindex`
13. `GET|POST /api/faqs`
14. `PUT|DELETE /api/faqs/{id}`
15. `POST /api/faqs/{id}/toggle`
16. `GET /api/chat-logs`
17. `POST /api/chat-logs/{id}/mark-issue`
18. `GET|PUT /api/settings/ai`

Endpoint dashboard dan CRUD membutuhkan `Authorization: Bearer <token>`. Endpoint internal dari WA connector membutuhkan `X-Internal-Token`.
