# Rencana Kerja & Spesifikasi Teknis: Web Logsheet, HAR Portal, & Corporate Web PLN Nusa Daya
**Repositori**: `D:\PLN PROJECT\LOGSHEETWEBPLNNUSADAYA`  
**Sistem**: WACB DIGIKIT PLTD Logsheet, HAR Portal, & Corporate Energy Web Platform  
**Target Arsitektur**: **Golang (Fiber v2 API Gateway & Service)** + **Next.js 15 (App Router, TypeScript) & Tailwind CSS Frontend**  
**Inspirasi Desain Publik**: Kelas Korporat Energi Internasional ([Pertamina](https://www.pertamina.com/en) & [Halliburton](https://www.halliburton.com/))  
**Versi Dokumen**: 3.0 (Enterprise Control Room, Geolocation Attendance, CMS News, & Guest Analytics)

---

## 1. Latar Belakang & Analisis Kebutuhan Sistem

Aplikasi mobile Flutter PLN Nusa Daya di `D:\PLN PROJECT\PLN_NUSA_DAYA_APPS` telah berhasil mengintegrasikan pelaporan operasional PLTD dengan API WACB DIGIKIT Kalimantan 3 (`kd_region: 05`).
Untuk kebutuhan ruang kontrol (Control Room), kantor Unit Layanan PLTD (ULD), manajemen, serta keterbukaan informasi publik dan kehadiran tim di lapangan, dikembangkan **Web Platform Terpadu** yang mencakup:

1. **Landing Page Berkelas Dunia (Inspirasi Pertamina & Halliburton)**:
   - Desain visual industri energi modern dengan warna resmi PLN Blue (`#004581`, `#005daa`, `#075fac`) dan aksen Gold (`#ffc709`).
   - Hero section berwibawa, statistik langsung (*Live Telemetry Counter*), pilar operasional pembangkitan, dan showcase berita korporat.
2. **Peta Interaktif & Presensi Geofencing (GPS Attendance)**:
   - Peta interaktif (Leaflet / OpenStreetMap) yang mendeteksi koordinat latitude/longitude operator & teknisi saat melakukan absensi pergantian shift / input logsheet.
   - Geofencing otomatis radius 250 meter dari titik koordinat resmi site PLTD (seperti PLTD Batu Ampar, Biduk-Biduk, Long Segar) berbasis formula Haversine untuk mencegah *fake GPS*.
3. **CMS Admin untuk Artikel, Berita, & Pengumuman**:
   - Panel khusus Admin / Superadmin untuk mengelola berita operasional, artikel transisi energi, dan pengumuman K3.
   - Ditampilkan langsung di landing page dan halaman portal berita publik.
4. **Halaman Guest / Public Dashboard (Visualisasi Chart Agregat)**:
   - Rute publik tanpa login (`/guest` atau `/monitoring`) bagi pimpinan, tamu, dan stakeholder.
   - Menampilkan metrik agregat dalam bentuk grafik interaktif: Donut Chart status mesin, Area Chart kurva beban 24 jam Kalimantan 3, Bar Chart perbandingan daya unit, dan GIS Map sebaran PLTD.
5. **Kepatuhan Mutlak Kontrak API WACB v1.0**:
   - `GET /login`: Autentikasi Bearer Token WACB.
   - `GET /v1/format-logsheet-pltd`: Master unit dan mesin PLTD Kalimantan 3.
   - `POST /v1/logsheet-pltd?kd_region=05`: Submit laporan multi-mesin dalam parameter `message_text`.
   - `POST /logsheet?kd_region=05&tanggal=...`: Matriks 48 slot jam (00:00 - 23:30) per unit.
   - `POST /getLogsheet/{idBebanUld}`: Detail operasional per mesin di jam terkait.
6. **Multi-Mesin Batch Input & Bebas Pilih Jam**:
   - Input 1 hingga 6 mesin serentak dalam satu unit.
   - Bebas memilih 48 slot jam (00:00 - 23:30) untuk memudahkan pengisian susulan.
7. **Offline-First PWA & Background Auto-Sync**:
   - IndexedDB (Dexie.js) lokal di browser untuk menjamin penginputan data tetap lancar di site pelosok meski koneksi internet terputus.
8. **Ekspor Cepat Berstandar Resmi**:
   - Spreadsheet Excel `.xlsx` multi-sheet (Raw Data, Pivot Beban 24 Jam, SFC BBM) dan dokumen PDF A4 Landscape.

---

## 2. Matriks Hak Akses & Pembagian Peran (RBAC 6 Roles + Mode Tamu/Guest)

Sistem menerapkan pengamanan berbasis JWT Token dengan 6 peran terverifikasi serta 1 mode publik:

```
+-----------------------------------------------------------------------------------------------+
|                                      STRUKTUR HAK AKSES                                       |
|                                                                                               |
|   [ PUBLIK / GUEST ] --> Landing Page Korporat, Berita & Artikel, Dashboard Chart Agregat    |
|            │                                                                                  |
|   [ SUPERADMIN ] ------> Master Konfigurasi, Bypass WACB, Audit Trail, Kelola CMS Global      |
|            │                                                                                  |
|   [ ADMIN ] -----------> Kelola Master Unit/Mesin, Akun User, CMS Artikel, Shift Roster       |
|            │                                                                                  |
|   [ MANAGER ] ---------> Monitoring Eksekutif, KPI Wilayah, Approval Akhir, Rekapitulasi     |
|            │                                                                                  |
|   [ SUPERVISOR ] ------> Validasi Presensi GPS, Verifikasi Logsheet Shift, Approval HAR      |
|            │                                                                                  |
|   [ OPERATOR ] --------> Absensi GPS, Input Logsheet 48 Slot (Batch 1-6 Mesin), Offline Sync  |
|            │                                                                                  |
|   [ TEKNISI ] ---------> Absensi GPS, Modul HAR, Catat Gangguan AMC, Parameter Pemeliharaan  |
+-----------------------------------------------------------------------------------------------+
```

### Tabel Matriks Hak Akses (Permission Matrix)

| Fitur / Modul | Guest (Tamu) | Operator | Teknisi | Supervisor | Manager | Admin | Superadmin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Landing Page & Berita Publik** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Guest Chart & Agregat Publik** | ✅ (Agregat) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Absensi GPS & Peta Geofencing**| ❌ | ✅ Absen | ✅ Absen | ✅ Verifikasi | 👁️ Rekap | 👁️ Rekap | ✅ Full |
| **Input Logsheet 48 Slot Jam**   | ❌ | ✅ Full | ❌ | 👁️ / ✏️ Edit | ❌ (View) | ✅ | ✅ |
| **Bebas Pilih Jam (00:00-23:30)**| ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Approval Logsheet Shift**      | ❌ | ❌ | ❌ | ✅ Approval | ❌ (Review) | ✅ | ✅ |
| **Modul HAR & Gangguan AMC**     | ❌ | 👁️ Status | ✅ Full | ✅ Approval | 👁️ Review | ✅ | ✅ |
| **CMS Artikel & Blog (CRUD)**    | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full | ✅ Full |
| **Offline-First & Auto-Sync**    | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Ekspor Excel & PDF Resmi**     | ❌ | ✅ Shift | ✅ HAR | ✅ Unit | ✅ Full | ✅ Full | ✅ Full |
| **Master Data & Akun Pengguna**  | ❌ | ❌ | ❌ | 👁️ Shift | ❌ | ✅ Full | ✅ Full |
| **Konektivitas WACB & Audit Log**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |

---

## 3. Arsitektur Teknologi Terpadu: Go + Next.js + Tailwind CSS

```
+---------------------------------------------------------------------------------------+
|                       Browser Desktop, Laptop, & Tablet                               |
|                                                                                       |
|         [ Next.js 15 (App Router) + TypeScript + Tailwind CSS + Lucide Icons ]        |
|                                                                                       |
|  ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────────────────────┐  |
|  │ Pertamina-Style   │  │ Interactive Maps   │  │ Control Room & Guest UI          │  |
|  │ Landing Page      │  │ (Leaflet + GPS)    │  │ (Recharts Dynamic Analytics)     │  |
|  └─────────┬─────────┘  └─────────┬──────────┘  └────────────────┬─────────────────┘  |
|            │                      │                              │                    |
|            │            ┌─────────▼──────────┐                   │                    |
|            │            │ Dexie.js IndexedDB │                   │                    |
|            │            │ (Offline Queue)    │                   │                    |
|            │            └─────────┬──────────┘                   │                    |
+────────────┼──────────────────────┼──────────────────────────────┼────────────────────+
             │                      │                              │
             ▼                      ▼                              ▼
+---------------------------------------------------------------------------------------+
|                    Golang Backend Service (Fiber v2 / fasthttp)                       |
|                                                                                       |
|  ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────────────────────┐  |
|  │ API Gateway       │  │ RBAC 6-Role Guard  │  │ Geofencing Haversine Validator   │  |
|  │ Zero-CORS Proxy   │  │ JWT Authentication │  │ (Radius 250m Engine)             │  |
|  └─────────┬─────────┘  └─────────┬──────────┘  └────────────────┬─────────────────┘  |
|            │                      │                              │                    |
|  ┌─────────▼─────────┐  ┌─────────▼──────────┐  ┌────────────────▼─────────────────┐  |
|  │ CMS News Service  │  │ Excelize Exporter  │  │ Background Sync Worker           │  |
|  │ & Public Guest API│  │ & PDF Generator    │  │ & Retry Queue                    │  |
|  └─────────┬─────────┘  └────────────────────┘  └────────────────┬─────────────────┘  |
|            │                                                     │                    |
|  ┌─────────▼─────────────────────────────────┐                   │                    |
|  │ SQLite / PostgreSQL Storage (GORM)        │                   │                    |
|  │ (Users, Presensi GPS, Articles, Cache)    │                   │                    |
|  └───────────────────────────────────────────┘                   │                    |
+------------------------------------------------------------------┼--------------------+
                                                                   │ (Secure HTTPS)
                                                                   ▼
                                   +-----------------------------------------------+
                                   |              Server WACB DIGIKIT              |
                                   |      https://wacb.nusadaya.net/api/           |
                                   |             (Region 05 Kal 3)                 |
                                   +-----------------------------------------------+
```

---

## 4. Struktur Proyek (`D:\PLN PROJECT\LOGSHEETWEBPLNNUSADAYA`)

```
LOGSHEETWEBPLNNUSADAYA/
├── backend/                            # Service Golang (API Gateway, CMS, Geofence, WACB Proxy)
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                 # Entrypoint server Go Fiber
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go               # Konfigurasi port, JWT secret, WACB URL
│   │   ├── database/
│   │   │   ├── db.go                   # Koneksi SQLite / PostgreSQL via GORM
│   │   │   └── migrations.go           # Skema tabel: users, attendances, articles, logsheet_cache
│   │   ├── handlers/
│   │   │   ├── auth_handler.go         # Login WACB & token JWT RBAC
│   │   │   ├── logsheet_handler.go     # Proxy WACB format, submit, 48 slot
│   │   │   ├── attendance_handler.go   # Verifikasi absensi GPS & geofencing radius 250m
│   │   │   ├── article_handler.go      # CRUD CMS Berita & Artikel untuk Admin
│   │   │   ├── guest_handler.go        # Agregat publik untuk Guest Dashboard
│   │   │   ├── har_handler.go          # Modul HAR & gangguan AMC KIT KALTIMRA
│   │   │   └── export_handler.go       # Generator Excelize .xlsx & PDF
│   │   ├── middleware/
│   │   │   ├── jwt_auth.go             # Validasi JWT Bearer
│   │   │   ├── rbac.go                 # Guard 6 Peran Pengguna
│   │   │   └── cors.go                 # Header CORS
│   │   ├── models/
│   │   │   ├── user.go                 # Model User & UserRole enum
│   │   │   ├── attendance.go           # Model Absensi GPS (Lat, Long, Distance, Status)
│   │   │   ├── article.go              # Model Berita/Blog (Title, Slug, Content, Image)
│   │   │   ├── unit_location.go        # Koordinat resmi PLTD Kalimantan 3
│   │   │   └── logsheet.go             # Payload logsheet & cache WACB
│   │   ├── services/
│   │   │   ├── wacb_client.go          # HTTP Client ke wacb.nusadaya.net
│   │   │   ├── geofence_service.go     # Perhitungan jarak Haversine formula
│   │   │   ├── message_builder.go      # Format string message_text WACB v1.0
│   │   │   └── sync_worker.go          # Worker background retry
│   │   └── utils/
│   │       └── response.go             # Standarisasi JSON Response
│   ├── go.mod
│   └── go.sum
│
├── frontend/                           # Next.js 15 (App Router, Tailwind CSS, Recharts, Leaflet)
│   ├── public/
│   │   ├── images/
│   │   │   ├── pln-nusadaya-hero.jpg   # Hero visual industrial
│   │   │   └── pln-logo.png
│   │   └── icons/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root Layout dengan Navigasi Korporat
│   │   │   ├── page.tsx                # Landing Page Utama (Gaya Pertamina/Halliburton)
│   │   │   ├── guest/
│   │   │   │   └── page.tsx            # Public / Guest Dashboard (Chart & GIS Map)
│   │   │   ├── berita/
│   │   │   │   ├── page.tsx            # Halaman Indeks Berita & Artikel Publik
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx        # Halaman Detail Baca Artikel
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Portal Login Internal WACB & Multi-Role
│   │   │   ├── presensi/
│   │   │   │   ├── page.tsx            # Halaman Absen GPS dengan Peta Interaktif
│   │   │   │   └── riwayat/
│   │   │   │       └── page.tsx        # Rekap Absensi Operator & Teknisi
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Dashboard Internal Control Room
│   │   │   ├── logsheet/
│   │   │   │   ├── input/
│   │   │   │   │   └── page.tsx        # Form Multi-Mesin (1-6 Mesin, Bebas 48 Slot Jam)
│   │   │   │   ├── matrix/
│   │   │   │   │   └── page.tsx        # Matriks 48 Slot Jam Interaktif
│   │   │   │   └── riwayat/
│   │   │   │       └── page.tsx        # Riwayat Logsheet & Filter Lengkap
│   │   │   ├── har/
│   │   │   │   ├── page.tsx            # Modul HAR & Pemeliharaan Mesin
│   │   │   │   └── amc/
│   │   │   │       └── page.tsx        # Pencatatan Gangguan AMC KIT KALTIMRA 2026
│   │   │   ├── sync/
│   │   │   │   └── page.tsx            # Offline Queue & Sync Viewer (Dexie.js)
│   │   │   └── admin/
│   │   │       ├── articles/
│   │   │       │   ├── page.tsx        # CMS Admin: Tabel Daftar Berita
│   │   │       │   └── create/
│   │   │       │       └── page.tsx    # CMS Admin: Form Tambah/Edit Artikel
│   │   │       ├── users/
│   │   │       │   └── page.tsx        # Manajemen Akun & Shift
│   │   │       └── master-data/
│   │   │           └── page.tsx        # Master Unit, Titik Koordinat GPS, & Mesin
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── HeroSection.tsx     # Hero megah industrial dengan dual CTA
│   │   │   │   ├── LiveCounterBar.tsx  # Counter statistik (MW Daya Mampu, Jam Andal)
│   │   │   │   ├── OperationalPillars.tsx # Pilar bisnis pembangkitan
│   │   │   │   ├── NewsCarousel.tsx    # Carousel artikel terbaru dari CMS
│   │   │   │   └── CorporateFooter.tsx # Footer korporat bergaya Pertamina
│   │   │   ├── maps/
│   │   │   │   ├── InteractiveMap.tsx  # Peta Leaflet (Pin Operator, Pin PLTD, Radius)
│   │   │   │   └── GeofenceBadge.tsx   # Badge status "Dalam Radius" / "Di Luar Site"
│   │   │   ├── guest/
│   │   │   │   ├── SystemPowerGauge.tsx# Gauge daya mampu pasok vs beban puncak
│   │   │   │   ├── MachineStatusDonut.tsx # Donut chart operasi/standby/gangguan
│   │   │   │   ├── LoadCurveAreaChart.tsx # Kurva pembebanan 24 jam agregat
│   │   │   │   └── UnitsGisMap.tsx     # Peta sebaran PLTD se-Kalimantan 3
│   │   │   ├── logsheet/
│   │   │   │   ├── MachineTabs.tsx     # Multi-mesin batch input (#01 s/d #06)
│   │   │   │   ├── ParameterGrid.tsx   # 11 parameter teknis WACB
│   │   │   │   └── Matrix48Grid.tsx    # Grid 48 slot warna interaktif
│   │   │   └── cms/
│   │   │       └── RichArticleEditor.tsx# Editor penulisan artikel untuk Admin
│   │   ├── db/
│   │   │   └── offlineDb.ts            # Dexie.js schema offline storage
│   │   └── lib/
│   │       ├── api.ts                  # Axios client ke Go Backend
│   │       └── messageBuilder.ts       # Generator string WACB v1.0
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── docker-compose.yml
├── README.md
└── plan.md
```

---

## 5. Rincian Fungsionalitas & Spesifikasi Fitur Baru

### A. Landing Page Berkelas Dunia (Inspirasi Pertamina & Halliburton)
- **Karakter Visual**:
  - Tema elegan industri energi modern: dominan warna biru PLN (`#004581`, `#005daa`), aksen kuning emas energi (`#ffc709`), latar belakang industrial bersih dengan efek *subtle glassmorphism*.
  - Desain navigasi atas (*sticky navbar*) dengan logo resmi PLN Nusa Daya, tautan ke *Tentang Kami*, *Operasional PLTD*, *Berita & Publikasi*, *Monitoring Publik (Guest)*, dan tombol khusus *Portal Operator / Login Internal*.
- **Hero Section**:
  - Judul Megah: *"Energizing Kalimantan 3 with Reliable & Sustainable Power Generation"*.
  - Subjudul: *"Portal Manajemen Terpadu Operasi PLTD, Pemeliharaan Mesin, & Monitoring Keandalan Energi PLN Nusa Daya"*.
  - Dual Tombol Aksi:
    - `[ Pantau Statistik Publik (Guest View) ]` (Aksen Outlined Gold).
    - `[ Masuk Ruang Kontrol (Portal Pegawai) ]` (Solid PLN Blue).
- **Live Operational Counter (Running Telemetry)**:
  - Total Daya Mampu Pasok: **XX.X MW**
  - Unit PLTD Beroperasi: **XX Unit Layanan**
  - Mesin Pembangkit Terhubung: **XX Mesin**
  - Indeks Keandalan EAF: **XX.X %**
  - Jam Operasi Aman: **Zero Accident K3**
- **Showcase Berita & Artikel Terkini**:
  - Menampilkan 3-4 artikel terhangat yang diinput oleh Admin melalui modul CMS secara otomatis.
- **Corporate Footer**:
  - Tautan regulasi, informasi kontak Call Center 24/7, hotline Control Room, dan hak cipta resmi PLN Nusa Daya.

---

### B. Peta Interaktif & Presensi Geofencing (GPS Attendance Lapangan)
- **Tujuan**:
  - Memastikan operator dan teknisi benar-benar berada di lokasi fisik PLTD saat memulai jam kerja (absen shift) dan melakukan penyerahan laporan operasional.
- **Spesifikasi Teknis Geofencing**:
  - Peta interaktif menggunakan **Leaflet / OpenStreetMap** (bebas lisensi berbayar, ringan, dan cepat).
  - Browser membaca koordinat GPS perangkat operator (`navigator.geolocation.getCurrentPosition`) dengan opsi `enableHighAccuracy: true`.
  - Backend Golang dan Frontend menghitung jarak antara posisi operator dengan koordinat resmi unit PLTD menggunakan **Haversine Formula**:
    $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{long}}{2}\right)}\right)$$
  - **Ambang Batas Geofencing**: Radius default **250 meter** dari pusat koordinat site PLTD (misal: ULD Batu Ampar `0264`, ULD Biduk-Biduk `0265`, ULD Long Segar `0279`).
- **Komponen Tampilan Peta**:
  - Lingkaran biru transparan menandai zona aman 250m.
  - Pin merah/biru menandai titik fisik PLTD.
  - Pin bergerak menandai posisi real-time operator.
  - Indikator Status Visual:
    - 🟢 **Lokasi Valid**: *"Anda berada di dalam radius 120m dari PLTD Batu Ampar. Presensi siap dikirim."*
    - 🔴 **Di Luar Radius**: *"Anda berada 1.4 km di luar area PLTD. Presensi ditandai anomali lokasi."*
- **Keamanan**:
  - Dilengkapi deteksi akurasi sinyal GPS (akurasi > 100m diberi peringatan) dan penanda waktu server (*server timestamp*) untuk mencegah manipulasi jam perangkat.

---

### C. CMS Admin untuk Artikel, Berita, & Blog
- **Tujuan**:
  - Memberikan hak kepada **Admin** dan **Superadmin** untuk mempublikasikan artikel kegiatan, pemeliharaan mesin, edukasi K3, dan pengumuman shift langsung ke web publik tanpa perlu menyentuh kode program.
- **Fitur CMS Admin (`/admin/articles`)**:
  - **Tabel Daftar Artikel**: Menampilkan judul, kategori, penulis, jumlah pembaca (*views*), tanggal dibuat, dan status (*Draft* / *Published*).
  - **Form Tambah / Edit Artikel**:
    - Judul Artikel (*Headline*).
    - Slug URL otomatis ramah SEO (misal: `perawatan-major-overhaul-pltd-batu-ampar`).
    - Kategori: *Operasional PLTD*, *Info Pemeliharaan HAR*, *K3 & Lingkungan*, *Corporate News*.
    - Gambar Sampul (*Thumbnail Upload* atau URL gambar).
    - Ringkasan Singkat (*Excerpt*) untuk preview kartu di landing page.
    - Konten Lengkap: *Rich Text / Markdown Editor* yang mendukung formatting tebal, miring, list, kutipan, dan penyisipan foto dokumentasi teknis.
    - Tombol Simpan Draft & Publikasikan Langsung.
- **Halaman Tampilan Publik**:
  - Menampilkan grid kartu berita di Landing Page.
  - Halaman arsip berita lengkap di `/berita`.
  - Halaman pembaca artikel di `/berita/[slug]` dengan tipografi elegan dan navigasi artikel terkait.

---

### D. Halaman Guest / Public Dashboard (Visualisasi Chart Interaktif)
- **Tujuan**:
  - Menyediakan akses instan bagi tamu, stakeholder dinas terkait, manajemen pusat, atau publik untuk meninjau performa penyediaan listrik PLN Nusa Daya secara transparan tanpa membuka parameter rahasia internal.
- **Akses**:
  - Rute publik `/guest` atau `/monitoring` (dapat diakses tanpa token login).
- **Komponen Visual & Grafik (Menggunakan Recharts)**:
  1. **Statistik Kartu Rangkuman (Header KPI)**:
     - Total Daya Terpasang (DMN): e.g. **48.5 MW**
     - Daya Mampu Pasok Total (DMP): e.g. **42.3 MW**
     - Beban Puncak Wilayah: e.g. **34.8 MW**
     - Cadangan Daya Operasi (*Operating Reserve*): e.g. **7.5 MW (Aman)**
  2. **Donut Chart Status Mesin Real-Time**:
     - Diagram lingkaran interaktif pembagian kondisi mesin seluruh unit Kalimantan 3:
       - 🟢 **Operasi**: 72%
       - 🟡 **Standby Siaga**: 18%
       - 🔵 **Pemeliharaan Terencana (HAR)**: 6%
       - 🔴 **Gangguan (Outage)**: 4%
  3. **Area Chart: Kurva Pembebanan 24 Jam Agregat**:
     - Grafik kurva pembebanan dinamis dari jam 00:00 hingga 23:30 dengan arsiran gradasi biru PLN, menampilkan fluktuasi beban siang vs beban puncak malam (*Peak Hours 18:00 - 22:00*).
  4. **Bar Chart: Komparasi Pembebanan per Unit Layanan (ULD)**:
     - Grafik batang vertikal membandingkan kapasitas terpasang vs beban puncak antara ULD Batu Ampar, ULD Biduk-Biduk, ULD Long Segar, dll.
  5. **Peta GIS Sebaran Unit Pembangkit**:
     - Peta interaktif se-Kalimantan 3 yang menampilkan pin titik-titik PLTD:
       - Pin Hijau: Sistem Normal & Cadangan Cukup.
       - Pin Kuning: Sistem Siaga (Beban mendekati daya mampu).
       - Pin Merah: Sistem Defisit / Perbaikan Darurat.
     - Mengklik pin akan menampilkan kartu info umum: Nama Unit, Jumlah Mesin, dan Daya Mampu Pasok.

---

## 6. Tahapan Eksekusi Pembangunan (Roadmap Terperinci)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP PEMBANGUNAN WEB TERPADU                          │
└─────────────────────────────────────────────────────────────────────────────┘
  Tahap 1: Inisialisasi Monorepo (Go Fiber Backend + Next.js 15 Frontend)           [SELESAI]
  Tahap 2: Landing Page Korporat & Replikasi Resmi https://plnnusadaya.co.id       [SELESAI]
  Tahap 3: Halaman Guest / Public Dashboard (Chart Interaktif & Peta Sebaran)       [SELESAI]
  Tahap 4: CMS Admin Artikel & Berita (CRUD, Editor, Publikasi Otomatis)           [SELESAI]
  Tahap 5: Presensi GPS Lapangan & Peta Geofencing (Radius 250m)                   [SELESAI]
  Tahap 6: Autentikasi WACB & RBAC 6 Roles (Superadmin, Admin, Manager, dll)       [SELESAI]
  Tahap 7: Form Input Logsheet Multi-Mesin (1-6 Mesin, Bebas Jam 48 Slot)          [SELESAI]
  Tahap 8: Dashboard Matriks 48 Slot Jam & Offline-First Dexie.js Auto-Sync        [SELESAI]
  Tahap 9: Modul HAR & Gangguan AMC KIT KALTIMRA 2026                              [SELESAI]
  Tahap 10: Ekspor Resmi Excelize .xlsx & Dokumen PDF A4                           [SELESAI]
  Tahap 11: Pengujian End-to-End, Optimasi Kecepatan, & Production Build           [SELESAI]
```

---

## 7. Catatan Pembaruan Terakhir (Status Replikasi & Perbaikan Aset Landing Page)

- **Replikasi 1:1 Resmi PLN Nusa Daya ([plnnusadaya.co.id](https://plnnusadaya.co.id/))**:
  - Navbar: Danantara Indonesia, Menu Profil, Tata Kelola, Layanan, Laporan Manajemen, Pengadaan, Media, Privacy Policy, Maskot Aku Jago, Logo PLN Nusa Daya, Tombol Portal Logsheet.
  - Hero: 2 Kolom (Putih bersih, Tipografi resmi, Pill button "Get Started" & "Portal Operasional", Video/Poster 3D Pembangkit Listrik Isometrik).
  - About Us: Teks resmi pendirian 2003 & RUPS 2016 wilayah Indonesia Timur.
  - Telemetri Statistik: 335+ Proyek, 25.547+ Tenaga Kerja, 9 Unit Pelaksana, 22+ Tahun Pengalaman.
  - Layanan: 6 Kartu Layanan Korporat dengan kurva aksen dan carousel otomatis.
  - Berita Terbaru: Cover resmi poster berita (`news-186` s.d. `news-190`).
  - Portofolio: Filter kategori (Pembangkit, Transmisi, Distribusi, Layanan, Beyond kWh) dengan foto proyek riil.
  - Profil Direksi: Foto resmi Direktur Utama (Agung Nugraha), Direktur Keuangan (Herry Ristiawan), dan Direktur Operasi (Chaidar Syaifullah).
  - Kontak: Alamat Balikpapan, Email, Telepon, Ikon Sosial Media, dan Formulir Pesan interaktif.
- **Resolusi Masalah 404 & Pengalihan Aset**:
  - Rewrite Next.js untuk URL gambar dengan karakter spasi dan koma.
  - Semua aset disimpan lokal di `frontend/public/images/` dan `landing-page/images/`.
  - HTTP Status: Seluruh endpoint aset mengembalikan status `200 OK`.
- **Redesain Hero Section (Fullscreen Video Background + Directional Ambient Light Overlay)**:
  - Video pembangkit listrik (`hero-corp.mp4` / `GIF1.mp4`) diintegrasikan sebagai background layar penuh (`object-cover`, `inset-0`).
  - Lapisan overlay ganda: base light slate (`rgba(248, 250, 252, 0.72)`) + gradien directional putih di sisi kiri (tingkat keterbacaan teks maksimal) dan transparan di sisi kanan (video pembangkit 3D terlihat jelas dan hidup).
  - Konten teks rata kiri berwibawa: `#17182D` bold typography, deskripsi korporat `#36506A`, serta tombol aksi pill (*Get Started* & *Portal Logsheet*).
  - Komponen modular React reusable di [frontend/src/components/Hero.tsx](file:///d:/PLN%20PROJECT/LOGSHEETWEBPLNNUSADAYA/frontend/src/components/Hero.tsx) dan tersinkronisasi di [landing-page/index.html](file:///d:/PLN%20PROJECT/LOGSHEETWEBPLNNUSADAYA/landing-page/index.html).


