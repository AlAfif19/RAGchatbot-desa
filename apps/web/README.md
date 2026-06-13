# Chatbot Warga Web

Frontend admin dashboard untuk Chatbot Warga WhatsApp AI RAG.

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

Dashboard membutuhkan login admin dari backend. Atur kredensial awal di backend melalui `ADMIN_NAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD`.

## Halaman

1. `/login` - login admin.
2. `/dashboard` - ringkasan chat, FAQ, RAG, sumber data, dan nomor aktif.
3. `/chatbot-number` - CRUD nomor WhatsApp chatbot dan pairing QR WhatsApp Web JS.
4. `/data-source` - CRUD sumber data dan re-index.
5. `/faq` - CRUD FAQ prioritas.
6. `/chat-log` - filter chat, detail konteks RAG, dan flag jawaban.
7. `/settings` - pengaturan AI.
