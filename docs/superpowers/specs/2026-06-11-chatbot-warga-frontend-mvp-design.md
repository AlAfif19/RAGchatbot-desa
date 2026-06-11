# Chatbot Warga Frontend MVP Design

Tanggal: 2026-06-11

## Keputusan

Pilihan frontend yang dipakai adalah **Opsi A: Dashboard Operasional Padat**.

Tahap pertama hanya membuat frontend dashboard admin dengan mock data lokal. Tidak ada backend, database, webhook WhatsApp, RAG, LLM, atau Docker pada tahap ini. Backend dibuat setelah tampilan dan alur admin disetujui.

## Tujuan

Membuat dashboard admin yang cepat dipresentasikan, responsif, dan mencakup semua modul utama PRD:

1. Login admin.
2. Dashboard overview.
3. Nomor chatbot.
4. Sumber data.
5. FAQ.
6. Chat log.
7. Pengaturan AI.

## Prinsip UI

Dashboard memakai gaya operasional yang padat, tenang, dan mudah dipindai. Fokusnya bukan landing page, tetapi alat kerja admin harian.

Desktop memakai sidebar tetap di kiri, topbar ringkas, area konten utama, tabel responsif, badge status, filter, dialog form, dan empty state. Mobile memakai navigasi yang tetap mudah dijangkau, konten card ringkas, dan tabel dengan horizontal scroll saat dibutuhkan.

## Arsitektur Frontend Tahap 1

Stack mengikuti PRD:

1. Next.js dengan TypeScript.
2. Tailwind CSS.
3. shadcn/ui untuk komponen dasar.
4. React Hook Form dan Zod untuk form dan validasi.
5. TanStack Table untuk tabel CRUD dan chat log.
6. Redux Toolkit atau state lokal terstruktur untuk mock data tahap awal.
7. Motion hanya untuk transisi penting.

Semua data tahap 1 berasal dari mock data lokal di frontend. Aksi tambah, edit, hapus, aktif/nonaktif, filter, dan pencarian bekerja di state frontend agar alur admin bisa diuji sebelum API tersedia.

## Struktur Halaman

### Login

Form email dan password dengan validasi wajib isi. Login mock mengarahkan admin ke dashboard jika format email valid dan password tidak kosong. Error state ditampilkan jika input tidak valid.

### Dashboard

Menampilkan kartu ringkasan:

1. Total chat hari ini.
2. Jawaban dari FAQ.
3. Jawaban dari RAG.
4. Sumber data aktif.
5. Status nomor chatbot.

Dashboard juga menampilkan grafik chat per hari dan tabel pertanyaan terbaru.

### Nomor Chatbot

Menampilkan tabel nomor WhatsApp chatbot dengan kolom nama bot, nomor, provider, status koneksi, status aktif, dan webhook secret tersamarkan. Admin dapat menambah, mengubah, menghapus, serta mengaktifkan atau menonaktifkan nomor.

### Sumber Data

Menampilkan tabel sumber data dengan judul, kategori, tipe, status indexing, ukuran asli, ukuran kompresi, dan waktu update. Form mendukung input metadata, input teks manual, dan upload file mock. Aksi re-index mengubah status lokal menjadi processing lalu completed secara simulasi.

### FAQ

Menampilkan daftar pertanyaan dan jawaban prioritas. Admin dapat menambah, mengubah, menghapus, mengaktifkan atau menonaktifkan FAQ, mengisi kata kunci, serta mengatur threshold kecocokan.

### Chat Log

Menampilkan riwayat chat warga dengan filter tanggal, nomor warga, kata kunci, dan sumber jawaban. Detail chat menampilkan pertanyaan, jawaban, sumber jawaban, confidence score, konteks RAG mock, dan tombol tandai jawaban tidak sesuai.

### Pengaturan AI

Menampilkan form provider LLM, nama model, system prompt, top K retrieval, threshold FAQ, dan jawaban fallback. Simpan pengaturan hanya mengubah state lokal.

## Data Flow Tahap 1

1. Halaman membaca mock data dari modul data lokal.
2. Form memvalidasi input dengan Zod.
3. Submit form memperbarui state frontend.
4. Tabel, badge, filter, dan ringkasan dashboard ikut berubah dari state mock.
5. Tidak ada request HTTP ke backend.

## Error Handling Tahap 1

1. Field wajib menampilkan pesan validasi.
2. Format email login divalidasi.
3. Nomor WhatsApp harus berisi angka, plus, spasi, atau strip.
4. Threshold FAQ dibatasi 0 sampai 1.
5. File upload mock membatasi tipe yang sesuai PRD: PDF, DOCX, TXT, CSV, gambar, dan video.
6. Empty state tampil saat hasil filter kosong.
7. Dialog konfirmasi tampil sebelum hapus data.

## Responsiveness

Target layout:

1. Mobile: kartu ringkasan dua kolom atau satu kolom sesuai lebar, navigasi ringkas, tabel scroll horizontal.
2. Tablet: sidebar compact atau drawer, konten dua kolom saat memungkinkan.
3. Desktop: sidebar penuh, tabel utama, filter di header konten.
4. Layar besar: konten dibatasi agar tetap nyaman dibaca dan tidak melebar berlebihan.

## Roadmap Setelah Frontend Disetujui

### Tahap 2 Backend

1. Setup FastAPI.
2. Setup MySQL melalui Docker Compose dengan root tanpa password sesuai PRD.
3. Setup SQLAlchemy dan Alembic.
4. Buat JWT auth admin.
5. Buat API dashboard summary.
6. Buat API CRUD nomor chatbot.
7. Buat API CRUD sumber data.
8. Buat API CRUD FAQ.
9. Buat API chat log.
10. Buat API pengaturan AI.

### Tahap 3 RAG dan WhatsApp

1. Setup vector database.
2. Buat pipeline validasi dan kompresi file.
3. Buat ekstraksi teks.
4. Buat chunking dokumen.
5. Buat embedding dan retrieval.
6. Buat pencarian FAQ prioritas.
7. Buat integrasi LLM provider.
8. Buat webhook WhatsApp dengan secret.
9. Simpan chat session dan chat message.

### Tahap 4 Testing

1. Unit test frontend untuk validasi form dan helper state.
2. Component test untuk form, tabel, filter, dialog, dan empty state.
3. Unit test backend untuk auth, FAQ, sumber data, RAG, webhook, dan kompresi.
4. Integration test web ke API.
5. Integration test API ke MySQL dan vector database.
6. Functional test login, CRUD, upload sumber data, FAQ, chat log, dan jawaban chatbot.
7. User acceptance test untuk admin dan warga.

## Checklist Keputusan

- [x] PRD dianalisis.
- [x] Tiga opsi frontend dibuat.
- [x] Opsi A dipilih.
- [x] Scope tahap 1 ditetapkan frontend-only.
- [x] User menyetujui dokumen desain ini.
- [x] Implementation plan/checklist teknis rinci dibuat setelah desain disetujui.
- [x] Frontend dibuat dengan mock data.
- [x] Frontend diuji dan dipresentasikan.
- [ ] Backend dibuat setelah frontend disetujui.
- [ ] RAG dan webhook WhatsApp dibuat setelah backend CRUD siap.
- [ ] Testing end-to-end dilakukan.

## Catatan Risiko

Tahap frontend-only bisa membuat API perlu sedikit menyesuaikan kontrak data setelah backend dibuat. Risiko ini dikurangi dengan menjaga nama field mock data dekat dengan PDM dan endpoint awal di PRD.

Repo saat dokumen ini dibuat belum memiliki `.git`, jadi dokumen tidak bisa dicommit.
