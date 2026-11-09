# Frontend

## Monitoring dan analisis

`/dashboard` menampilkan sumber pemantauan, pencarian nama/lokasi, filter lokasi,
form CCTV atau upload video, dan konfirmasi hapus. Data berasal dari
`/video-sources/`, `/locations/`, serta `/environments/`. Jenis area wajib
dipilih karena backend membutuhkan environment untuk memilih model AI aktif.
Mendaftarkan sumber tidak otomatis memulai analisis; buka Lihat Analisis lalu
pilih Mulai Analisis.

`/dashboard/monitoring/{sourceId}` menampilkan sesi yang sedang processing
(diprioritaskan) atau sesi terbaru, statistik kepatuhan per sesi, dan log deteksi
20 baris per halaman. Mulai Analisis memakai ulang sesi queued, atau membuat
sesi baru jika sesi sebelumnya selesai/gagal. Hentikan Analisis memanggil
endpoint stop. Hak akses sumber tetap diperiksa backend untuk setiap operasi.
Persentase pada diagram adalah proporsi deteksi tidak patuh dari statistik,
bukan jumlah orang unik. Tanggal/jam menggunakan Asia/Jakarta. Filter tanggal
berlaku untuk catatan pada halaman yang sedang dimuat karena endpoint log BE
belum mendukung filter tanggal.

Saat sesi processing, statistik dan log diperbarui setiap 5 detik, tanpa request
bertumpuk. Request dibatalkan saat berganti halaman/tab tersembunyi; jeda retry
read bertambah hingga 30 detik jika koneksi gagal. Mutasi tidak diulang otomatis.

Upload memakai multipart streaming melalui `/api/monitoring/upload`, bukan
Server Action yang memiliki batas body kecil. FE menerima MP4/AVI/MOV/MKV/WEBM
hingga 500 MB (default BE); BE tetap menentukan validitas dan batas akhir file.
Token hanya diteruskan dari cookie HttpOnly oleh server. URL RTSP, path berkas,
dan pesan validasi backend yang dapat memuat input sensitif tidak dikirim balik
ke browser.

BE belum menyediakan endpoint video/MJPEG/HLS maupun pemutaran file unggahan.
Karena itu kartu memakai placeholder, dan halaman analisis menampilkan snapshot
dokumentasi jika tersedia, tanpa label video Live. Foto dokumentasi ditampilkan dalam modal melalui proxy /api/monitoring/evidence/{logId}, yang meneruskan token sesi ke endpoint BE GET /detection-logs/{id}/image..
Analisis memerlukan CCTV yang dapat dijangkau dan model AI aktif di backend.

## Integrasi login

Jalankan backend sesuai README backend, lalu `npm run dev` di folder frontend.
Alamat backend default: `http://127.0.0.1:8000`. Untuk menggantinya, isi
`API_URL=http://127.0.0.1:8000` dalam `.env.local`, lalu restart Next.js.
Konfigurasi lama `NEXT_PUBLIC_API_URL` tetap didukung; `API_URL` diprioritaskan.

Frontend meneruskan login ke `POST /auth/login` sebagai form OAuth2, kemudian
mengambil profil dari `GET /auth/me`. Token disimpan dalam cookie HttpOnly
`apd_access_token` selama 8 jam sesuai default backend. Pesan akun pending,
rejected, dan inactive ditampilkan sesuai respons backend.
Gunakan akun aktif yang tersedia dalam database backend.

## Integrasi manajemen lokasi

Halaman `/dashboard/location-management` menyediakan daftar, pencarian nama
lokasi/kamera, tambah, ubah, dan hapus lokasi untuk admin. Data dibaca dari
`GET /locations/` dan `GET /video-sources/` secara paralel pada server. Jumlah
kamera menghitung hanya `cctv_stream`, termasuk kamera nonaktif; unggahan video
tidak dihitung. Browser menerima ID/nama lokasi dan nama kamera, tanpa URL stream.

Mutasi memakai Server Actions dengan pemeriksaan sesi, peran admin, UUID,
serta nama setelah trim (1–100 karakter). Endpoint yang digunakan:
`POST /locations/`, `PATCH /locations/{id}`, dan `DELETE /locations/{id}`.
PATCH hanya mengirim nama sehingga alamat lokasi tidak tertimpa.
Setelah berhasil, halaman direvalidasi; kegagalan mempertahankan modal dan
menampilkan pesan backend. Tidak ada retry otomatis untuk mutasi.

Konfirmasi hapus mengikuti backend: kamera tetap ada dan hubungan lokasinya
dilepas. Kesalahan saat mengambil data ditampilkan sebagai error dengan tombol
Coba Lagi, bukan sebagai daftar kosong atau jumlah kamera nol yang menyesatkan.

## Integrasi manajemen pengguna

Halaman `/dashboard/userManagement` hanya untuk admin. Daftar diambil dari
`GET /users/` pada server Next.js menggunakan token cookie HttpOnly; pencarian
nama/username berjalan lokal tanpa request tambahan. Form Tambah Pengguna
memanggil Server Action yang memeriksa sesi, peran admin, serta validitas input,
kemudian mengirim `POST /users/`. Setelah berhasil, `revalidatePath` memperbarui
tabel dari backend tanpa reload penuh. Kegagalan penyimpanan mempertahankan isi
form dan menampilkan pesan backend. Penyimpanan tidak diulang otomatis.

Alamat backend digunakan bersama oleh login, pemeriksaan sesi, dan manajemen
pengguna: `API_URL`, lalu `FASTAPI_URL`, lalu `NEXT_PUBLIC_API_URL`, dengan
default `http://127.0.0.1:8000`. Request pengguna memakai `cache: "no-store"`
dan timeout 15 detik. Tidak ada TanStack Query dalam dependensi proyek.

Kolom Aksi menyediakan Ubah dan Hapus. Hapus membuka konfirmasi, kemudian
Server Action mengirim `DELETE /users/{id}` (soft delete sesuai backend).
Sesi admin, format UUID, dan larangan menghapus akun sendiri diperiksa pada
server. Tabel direvalidasi hanya setelah backend berhasil; kegagalan ditampilkan
di modal. Dialog tidak dapat ditutup selama penyimpanan/penghapusan berlangsung.

Ubah membuka modal berisi data akun dan menyimpan lewat `PATCH /users/{id}`.
Nama, username, dan peran dapat diubah sesuai izin BE. Password opsional
untuk edit. Tambah pengguna dan reset password mengirim konfirmasi password.
Kontrol approve/reject/activate/deactivate belum tersedia dalam desain.

Repository ini berisi antarmuka pengguna platform deteksi kelengkapan APD.

Cakupannya meliputi autentikasi, unggah video, dashboard, edukasi keselamatan, riwayat skrining, perbandingan hasil, serta halaman hasil dan detail hasil. Antarmuka harus tetap informatif ketika data backend belum tersedia melalui mock demo fallback.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

