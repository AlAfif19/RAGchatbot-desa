# Chatbot Warga

## Run Manual Tanpa Docker

Salin `.env.example` ke `.env`, lalu ganti nilai rahasia seperti `ADMIN_PASSWORD`, `JWT_SECRET`, dan `INTERNAL_API_TOKEN`. Jika `APP_ENV=production`, backend akan menolak nilai rahasia bawaan.

Siapkan dependency satu kali:

```powershell
pip install -r apps/api/requirements.txt
npm --prefix apps/web install
npm --prefix apps/wa-connector install
```

`scripts/dev.ps1` akan memakai Chrome atau Edge lokal jika ditemukan. Jika tidak ada, Puppeteer dapat memakai browser yang diunduh saat `npm --prefix apps/wa-connector install`.

Jalankan backend, frontend, dan WA connector dalam satu terminal:

```powershell
.\scripts\dev.ps1
```

Jika memakai Git Bash:

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/dev.ps1
```

URL lokal:

- Web dashboard: `http://127.0.0.1:3000`
- Backend API: `http://127.0.0.1:8002`
- WA connector: `http://127.0.0.1:3010`

Alur WhatsApp:

1. Tambahkan nomor di dashboard menu `Nomor Chatbot`.
2. Klik connect, lalu scan QR WhatsApp Web JS yang tampil.
3. Saat warga mengirim chat ke nomor tersebut, backend menyimpan log chat.
4. Backend menjawab otomatis dari FAQ aktif jika cocok, dari potongan sumber data jika ada konteks, atau dari fallback answer di pengaturan AI.

Untuk stop semua service, tekan `Ctrl+C` di terminal yang menjalankan `.\scripts\dev.ps1`.

Jika port default sedang dipakai:

```powershell
.\scripts\dev.ps1 -ApiPort 8010 -WebPort 3010 -WaPort 3020
```

## Run Dengan Docker

Pastikan `.env` sudah berisi `MYSQL_ROOT_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `INTERNAL_API_TOKEN`, dan kredensial admin. Compose akan menolak secret wajib yang kosong. Lalu jalankan:

```powershell
docker compose up --build
```

Stop semua container:

```powershell
docker compose down
```
