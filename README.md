# Web Logsheet & HAR Portal PLN Nusa Daya

Portal Sistem Manajemen Operasional PLTD & Pemeliharaan (HAR) PLN Nusa Daya terintegrasi penuh dengan **API WACB DIGIKIT Kalimantan 3 (`kd_region: 05`)**.

---

## 🌟 Fitur Unggulan

1. **Landing Page Berkelas Dunia (Inspirasi Pertamina & Halliburton)** (`/`):
   - Desain visual industri energi modern dengan warna resmi PLN Corporate Blue (`#004581`, `#005daa`) dan Aksen Emas (`#ffc709`).
   - Hero section megah dengan running telemetry counter (Total MW Daya Mampu, Kesiapan EAF 99.4%, Zero Accident K3).
   - 4 Pilar Operasional Pembangkitan dan showcase artikel/berita korporat terintegrasi CMS.
2. **Halaman Guest / Public Dashboard (Visualisasi Chart Agregat)** (`/guest`):
   - Akses publik tanpa perlu login untuk meninjau data agregat keandalan listrik Kalimantan 3.
   - Donut Chart komposisi status mesin (Operasi, Standby, HAR, Gangguan).
   - Area Chart kurva pembebanan sistem 24 jam (00:00 - 23:30 WITA).
   - Tabel komparasi kapasitas daya dan status siaga seluruh Unit Layanan PLTD (ULD).
3. **Presensi Geolocation GPS & Peta Geofencing Radius 250M** (`/presensi`):
   - Peta interaktif Leaflet / OpenStreetMap yang mendeteksi koordinat latitude/longitude browser operator/teknisi.
   - Perhitungan jarak real-time dengan titik pusat fisik site PLTD menggunakan **Formula Haversine**.
   - Validasi otomatis status: 🟢 **VALID (Di dalam radius 250m)** atau 🔴 **ANOMALI (Di luar area site PLTD)**.
   - Pencatatan riwayat kehadiran per shift (Pagi, Siang, Malam) ke database backend.
4. **CMS Admin Berita, Artikel, & Pengumuman** (`/admin/articles`):
   - Panel khusus Admin & Superadmin untuk mengelola berita kegiatan, pemeliharaan, dan edukasi K3.
   - Form editor dengan thumbnail image, excerpt, kategori, dan status Draft / Published.
   - Terhubung langsung ke Landing Page, halaman arsip `/berita`, dan halaman baca `/berita/[slug]`.
5. **Bebas Pilih Waktu (48 Slot Jam 00:00 - 23:30)** (`/logsheet/input`):
   - Bebas memilih slot 30 menit mana pun tanpa pembatasan waktu sistem real-time.
6. **Batch Multi-Mesin (1 s/d 6 Mesin)**:
   - Form cerdas dengan tab mesin interaktif (#01 s/d #06).
   - Status mutlak: **OPERASI**, **STANDBY**, atau **GANGGUAN**.
   - 11 Parameter teknis lengkap WACB v1.0 Kalimantan 3 (`kd_region: 05`).
7. **Penyimpanan Offline-First & Auto-Sync (Dexie.js IndexedDB)** (`/sync`):
   - Pelaporan tetap dapat diinput saat jaringan internet site putus dan otomatis tersinkronisasi saat koneksi pulih.
8. **Matriks Keterisian 24 Jam Interaktif** (`/logsheet/matrix`):
   - Tampilan visual 48 slot per unit (Hijau = Terisi, Abu-abu = Belum).
   - Modal detail laporan per jam via `/getLogsheet/{idBebanUld}`.
9. **Modul HAR & Gangguan Mesin AMC KIT KALTIMRA 2026** (`/har`):
   - Pencatatan preventive maintenance (P1-P6), overhaul, dan penanganan gangguan mesin.
10. **Ekspor Excel Multi-Sheet Cepat & PDF A4**:
    - Dihasilkan via library native Go `excelize` (<50ms) dengan 3 sheet analisis dan dokumen PDF siap cetak.
11. **Role-Based Access Control (RBAC 6 Tingkatan)**:
    - Otorisasi ganda di sisi backend (JWT middleware) dan frontend (RoleGuard): Superadmin, Admin, Manager, Supervisor, Operator, Teknisi.

---

## 👥 Akun Pengguna Bawaan (6 Roles)

Semua akun awal diinisialisasi otomatis oleh Database Seeder:

| Peran (Role) | Username | Password | Deskripsi Hak Akses |
|---|---|---|---|
| **SUPERADMIN** | `superadmin` | `123` | Akses penuh, audit log sistem, reset antrean sync, bypass unit |
| **ADMIN** | `admin` | `123` | Master data unit, mesin, manajemen pengguna & pembagian shift |
| **MANAGER** | `manager` | `123` | Dashboard eksekutif, analisis kesiapan mesin (EAF/SOF), approval |
| **SUPERVISOR** | `supervisor` | `123` | Monitoring control room 24 jam, approval tiket HAR, verifikasi logsheet |
| **OPERATOR** | `operator` | `123` | Input logsheet 48 slot, status mesin, draft antrean offline |
| **TEKNISI** | `teknisi` | `123` | Input laporan gangguan HAR, status perbaikan mesin PLTD |

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menggunakan Script Cepat (Windows)
Cukup jalankan salah satu file:
- **`start_dev.bat`** : Menjalankan backend (`:8080`) dan frontend Next.js development server (`:3000`).
- **`start_prod.bat`** : Menjalankan backend (`:8080`) dan frontend Next.js production build (`:3000`).

### Opsi 2: Manual via Terminal

#### 1. Backend (Go Fiber)
Pastikan PostgreSQL berjalan (`localhost:5432`, user: `postgres`, password: `viera`).
```bash
cd backend
server.exe
# atau jika menggunakan Go compiler:
go run cmd/server/main.go
```
Backend akan aktif di: **`http://localhost:8080`**

#### 2. Frontend (Next.js 15)
```bash
cd frontend
npm run dev
# atau untuk production:
npm start
```
Frontend web akan aktif di: **`http://localhost:3000`**

---

## 🐳 Opsi 3: Menjalankan via Docker Compose
```bash
docker-compose up -d
```
Container yang dijalankan:
- `pln-postgres`: Database PostgreSQL 16
- `pln-backend`: Go Fiber API Server
- `pln-frontend`: Next.js 15 Web Server

---

## 📡 Daftar Endpoint Backend API

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/health` | Healthcheck server & status koneksi database |
| `POST` | `/api/v1/auth/login` | Login user & penerbitan token JWT |
| `GET` | `/api/v1/wacb/units` | Mengambil daftar unit PLTD WACB |
| `GET` | `/api/v1/wacb/format` | Mengambil template & daftar mesin unit PLTD |
| `POST` | `/api/v1/wacb/submit-batch` | Mengirim batch 1-6 mesin & generate message_text WACB |
| `GET` | `/api/v1/wacb/matrix` | Data keterisian 48 slot matriks harian |
| `GET` | `/api/v1/wacb/detail/:idBebanUld` | Rincian data beban mesin per jam |
| `GET` | `/api/v1/har/tickets` | Mengambil daftar tiket pemeliharaan HAR |
| `POST` | `/api/v1/har/tickets` | Membuat tiket pemeliharaan baru |
| `PUT` | `/api/v1/har/tickets/:id/approve` | Approval tiket HAR oleh Supervisor |
| `GET` | `/api/v1/export/excel` | Download laporan spreadsheet Excel (.xlsx) |

---

## 🏢 Palet Desain PLN Corporate
- **Primary Blue**: `#004581`
- **Secondary Blue**: `#005daa`
- **Accent Yellow/Gold**: `#ffc709`
- **Dark Slate**: `#1e293b`
- **Light Slate**: `#f8fafc`