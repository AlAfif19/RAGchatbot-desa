# Chatbot Warga Web

Frontend admin dashboard untuk PRD Chatbot Warga WhatsApp AI RAG.

## Scope Saat Ini

Tahap awal frontend-only sudah selesai. Saat ini frontend sudah memiliki API adapter ke FastAPI backend MVP dan tetap menyediakan fallback mock data lokal jika API tidak tersedia. Belum ada database MySQL, Docker, RAG, LLM, atau webhook WhatsApp.

## Perintah

```powershell
npm --prefix apps/web install
npm --prefix apps/web run dev
npm --prefix apps/web test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

Default API backend:

```txt
NEXT_PUBLIC_API_URL=http://127.0.0.1:8002
```

Jika backend hidup, topbar dashboard menampilkan `Terhubung ke FastAPI`. Jika backend mati, frontend tetap memakai fallback mock data lokal.

## Mock Login

Form login memakai backend jika tersedia. Nilai demo:

```txt
Email: admin@desa.id
Password: password
```

Login akan masuk ke `/dashboard`. Jika API tersedia, data dashboard dan CRUD diambil dari FastAPI backend MVP.

## Halaman

1. `/login` - login admin mock.
2. `/dashboard` - ringkasan chat, FAQ, RAG, sumber data, dan nomor aktif.
3. `/chatbot-number` - CRUD nomor WhatsApp chatbot.
4. `/data-source` - CRUD sumber data dan simulasi re-index.
5. `/faq` - CRUD FAQ prioritas.
6. `/chat-log` - filter chat, detail konteks RAG mock, dan flag jawaban.
7. `/settings` - pengaturan AI mock.

Halaman pengaturan AI menyediakan input `API Key AI` bertipe password. Nilai dikirim ke FastAPI field `api_key` jika backend tersedia, dan tetap tersimpan di fallback state lokal saat API tidak tersedia.

## Catatan Lanjutan

Tahap berikutnya adalah persistence MySQL dengan SQLAlchemy/Alembic dan Docker Compose, lalu RAG dan WhatsApp webhook.
