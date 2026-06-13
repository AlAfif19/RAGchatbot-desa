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

## Auto Reply WhatsApp

Pesan inbound dari WA connector masuk melalui `POST /api/internal/whatsapp/inbound`. Backend akan:

1. memvalidasi `X-Internal-Token`;
2. memastikan `chatbot_number_id` terdaftar;
3. membuat atau melanjutkan sesi chat warga;
4. memilih jawaban dari FAQ aktif, potongan sumber data, atau `fallback_answer`;
5. menyimpan chat log dan mengirim jawaban balik lewat WA connector.

Tahap ini memakai pencocokan teks lokal agar sistem bisa berjalan tanpa API LLM eksternal. Integrasi LLM penuh dapat ditambahkan di atas alur yang sama.

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
19. `POST /api/internal/whatsapp/inbound`

Endpoint dashboard dan CRUD membutuhkan `Authorization: Bearer <token>`. Endpoint internal dari WA connector membutuhkan `X-Internal-Token`.
