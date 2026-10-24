# MANUAL BOOK PANDUAN PENGGUNA
## PORTAL WEB LOGSHEET WACB & PEMELIHARAAN (HAR) PLTD
### PT PLN NUSA DAYA — SISTEM KONTROL OPERASI & PEMELIHARAAN TERPADU

---

```
========================================================================================
                      PT PLN NUSA DAYA — KANTOR PUSAT & OPERASI
            PANDUAN OPERASIONAL RESMI PORTAL WEB LOGSHEET & HAR PEMBANGKIT
                       Versi 2.4.0 — Edisi Korporat 2026
========================================================================================
```

---

## DAFTAR ISI

- [BAB 1: PENGENALAN SISTEM & ARSITEKTUR PORTAL](#bab-1-pengenalan-sistem--arsitektur-portal)
  - [1.1 Latar Belakang & Tujuan](#11-latar-belakang--tujuan)
  - [1.2 Ruang Lingkup Sistem Terpadu (3-App Ecosystem)](#12-ruang-lingkup-sistem-terpadu-3-app-ecosystem)
  - [1.3 Hak Akses & Peran Pengguna (User Roles)](#13-hak-akses--peran-pengguna-user-roles)
  - [1.4 Standar Tampilan Antarmuka (100% Light Mode Korporat PLN)](#14-standar-tampilan-antarmuka-100-light-mode-korporat-pln)
- [BAB 2: AKSES BERANDA UTAMA (LANDING PAGE) & DOWNLOAD APK](#bab-2-akses-beranda-utama-landing-page--download-apk)
  - [2.1 Antarmuka Beranda Publik](#21-antarmuka-beranda-publik)
  - [2.2 Prosedur Download APK Aplikasi Mobile Lapangan](#22-prosedur-download-apk-aplikasi-mobile-lapangan)
  - [2.3 Pemindaian QR Code untuk Instalasi Instan di Smartphone Android](#23-pemindaian-qr-code-untuk-instalasi-instan-di-smartphone-android)
- [BAB 3: AUTENTIKASI & MASUK KE SISTEM (LOGIN)](#bab-3-autentikasi--masuk-ke-sistem-login)
  - [3.1 Halaman Login & Keamanan Akses](#31-halaman-login--keamanan-akses)
  - [3.2 Alur Pemilihan Unit PLTD & Mode Tamu (Guest Access)](#32-alur-pemilihan-unit-pltd--mode-tamu-guest-access)
- [BAB 4: DASHBOARD PEMANTAUAN OPERASIONAL & KOKPIT TELEMETRI](#bab-4-dashboard-pemantauan-operasional--kokpit-telemetri)
  - [4.1 Banner Siaga Kelistrikan 24 Jam & Parameter Utama](#41-banner-siaga-kelistrikan-24-jam--parameter-utama)
  - [4.2 Kartu Metrik Telemetri Daya, Kesiapan (EAF), & Derating](#42-kartu-metrik-telemetri-daya-kesiapan-eaf--derating)
  - [4.3 Filter Tanggal, Shift Kerja, & Unit Pembangkit](#43-filter-tanggal-shift-kerja--unit-pembangkit)
- [BAB 5: PANDUAN EKSPOR DATA MULTI-FORMAT (PDF & EXCEL)](#bab-5-panduan-ekspor-data-multi-format-pdf--excel)
  - [5.1 Bilah Aksi Ekspor Data](#51-bilah-aksi-ekspor-data)
  - [5.2 Cetak Berita Acara PDF Resmi (Landscape & Satuan)](#52-cetak-berita-acara-pdf-resmi-landscape--satuan)
  - [5.3 Ekspor Spreadsheet Excel (.xlsx) Multi-Sheet](#53-ekspor-spreadsheet-excel-xlsx-multi-sheet)
  - [5.4 Ekspor Data Mentah CSV & Cadangan Backup JSON](#54-ekspor-data-mentah-csv--cadangan-backup-json)
- [BAB 6: PENGOPERASIAN LOGSHEET 48-SLOT MATRIX (WACB PLTD)](#bab-6-pengoperasian-logsheet-48-slot-matrix-wacb-pltd)
  - [6.1 Struktur Tabel Matriks 48-Slot 24 Jam](#61-struktur-tabel-matriks-48-slot-24-jam)
  - [6.2 Pengisian Parameter Listrik, Mekanik & Suhu Mesin](#62-pengisian-parameter-listrik-mekanik--suhu-mesin)
  - [6.3 Validasi Toleransi Teknis & Audit Trail](#63-validasi-toleransi-teknis--audit-trail)
- [BAB 7: MANAJEMEN PEMELIHARAAN MESIN (HAR) & LAPOR GANGGUAN AMC](#bab-7-manajemen-pemeliharaan-mesin-har--lapor-gangguan-amc)
  - [7.1 Daftar Tiket Pemeliharaan & Job Card P1–P6](#71-daftar-tiket-pemeliharaan--job-card-p1p6)
  - [7.2 Empat Subsistem Inspeksi Komponen Mesin](#72-empat-subsistem-inspeksi-komponen-mesin)
  - [7.3 Alur Persetujuan Berjenjang (SPV Approval) & Tanda Tangan Digital](#73-alur-persetujuan-berjenjang-spv-approval--tanda-tangan-digital)
- [BAB 8: PANDUAN ADMINISTRATOR — PUSAT INTEGRASI MULTI-APP](#bab-8-panduan-administrator--pusat-integrasi-multi-app)
  - [8.1 Arsitektur Sinkronisasi 3 Aplikasi](#81-arsitektur-sinkronisasi-3-aplikasi)
  - [8.2 Panel Monitoring Integrasi Lapangan](#82-panel-monitoring-integrasi-lapangan)
  - [8.3 Eksekusi Broadcast Update & Push/Pull Sinkronisasi](#83-eksekusi-broadcast-update--pushpull-sinkronisasi)
- [BAB 9: PANDUAN ADMINISTRATOR — MANAJEMEN RILIS & UPLOAD APK](#bab-9-panduan-administrator--manajemen-rilis--upload-apk)
  - [9.1 Alur Unggah Berkas APK Baru](#91-alur-unggah-berkas-apk-baru)
  - [9.2 Pengelolaan Metadata, Versi & Catatan Rilis (Changelog)](#92-pengelolaan-metadata-versi--catatan-rilis-changelog)
  - [9.3 Uji Coba Unduh & Verifikasi Checksum File APK](#93-uji-coba-unduh--verifikasi-checksum-file-apk)
- [BAB 10: KESELAMATAN K3 ZERO ACCIDENT, FAQ & BANTUAN TEKNIS](#bab-10-keselamatan-k3-zero-accident-faq--bantuan-teknis)
  - [10.1 Kaidah Keselamatan Kerja K3 Pembangkit Listrik](#101-kaidah-keselamatan-kerja-k3-pembangkit-listrik)
  - [10.2 Pertanyaan yang Sering Diajukan (FAQ) & Penyelesaian Kendala](#102-pertanyaan-yang-sering-diajukan-faq--penyelesaian-kendala)
  - [10.3 Layanan Kontak Bantuan & Dukungan Tim IT](#103-layanan-kontak-bantuan--dukungan-tim-it)

---

# BAB 1: PENGENALAN SISTEM & ARSITEKTUR PORTAL

### 1.1 Latar Belakang & Tujuan
Portal Web **PLN Nusa Daya — WACB PLTD Logsheet & HAR Portal** merupakan sistem pusat komando digital yang mengintegrasikan seluruh aktivitas pencatatan logsheet operasional beban mesin 48-slot (*WACB*) dan proses pemeliharaan berkala (*Preventive & Corrective Maintenance*) pada seluruh unit Pembangkit Listrik Tenaga Diesel (PLTD) di lingkungan PT PLN Nusa Daya.

Tujuan implementasi sistem ini adalah:
1. **Transparansi & Akurasi Real-Time:** Menghilangkan pencatatan kertas manual rentan rusak atau hilang dengan basis data relasional PostgreSQL berkecepatan tinggi.
2. **Standardisasi Berita Acara Hukum:** Menghasilkan dokumen resmi cetak Berita Acara PDF (*Landscape* dan *Portrait*) dengan tanda tangan digital sah untuk kebutuhan audit internal PLN, BPK, dan PLN Holding.
3. **Penyatuan Ekosistem 3 Aplikasi:** Menghubungkan secara langsung basis data web pusat dengan aplikasi teknisi lapangan `PLN_HAR` dan aplikasi operator mesin `PLN_NUSA_DAYA_APPS`.
4. **Pencegahan Gangguan (Preventive Reliability):** Memantau parameter kritis mesin (suhu air radiator, tekanan oli pelumas, tegangan eksitasi, frekuensi, vibrasi) secara dini sebelum terjadi pemadaman mendadak (*trip*).

---

### 1.2 Ruang Lingkup Sistem Terpadu (3-App Ecosystem)

```
+-----------------------------------------------------------------------------------+
|                           PORTAL PUSAT PLN NUSA DAYA                              |
|                       (Web Next.js 15 + Go Fiber + PostgreSQL)                    |
|                                                                                   |
|  - Dashboard Monitoring 24 Jam               - Pusat Rilis & Upload APK           |
|  - Logsheet 48-Slot Matrix WACB              - Engine Export PDF & Excel          |
|  - Modul Pemeliharaan HAR & AMC              - Integration Hub Multi-App          |
+-----------------------------------------+-----------------------------------------+
                                          |
                   API Sinkronisasi REST / JSON / WebSocket
                                          |
           +------------------------------+------------------------------+
           |                                                             |
+--------------------------+                               +--------------------------+
|      APLIKASI 1:         |                               |       APLIKASI 2:        |
|  PLN LOGSHEET & WACB     |                               |   PLN NUSA DAYA HAR      |
|     (Operator PLTD)      |                               |   (Teknisi HAR & AMC)    |
|                          |                               |                          |
| • Pencatatan Beban 48-Jam|                               | • Form Job Card P1 - P6  |
| • Presensi GPS Geofence  |                               | • Lapor Gangguan Mesin   |
| • Offline Storage Sync   |                               | • Foto Bukti Lapangan    |
+--------------------------+                               +--------------------------+
```

---

### 1.3 Hak Akses & Peran Pengguna (User Roles)

| Peran (Role) | Tanggung Jawab Operasional | Wewenang dalam Portal Web |
| :--- | :--- | :--- |
| **Operator Mesin PLTD** | Melakukan pencatatan parameter beban mesin setiap 30 menit (48 slot harian), stand KWH, stand BBM, dan suhu operasi. | Input data logsheet, export Berita Acara shift, melihat grafik tren mesin. |
| **Teknisi Lapangan (HAR)** | Melaksanakan checklist inspeksi preventif (P1 s/d P6), mencatat temuan anomali, mengunggah foto bukti kerja. | Membuat tiket HAR baru, memperbarui progress pekerjaan, upload dokumentasi foto. |
| **Supervisor Operasi (SPV)** | Memvalidasi akurasi data logsheet, mengevaluasi temuan kerusakan, memberikan persetujuan formal Berita Acara. | 1-Klik Approval Berita Acara HAR & Logsheet, validasi digital signature, analisis EAF. |
| **Super Administrator** | Mengelola pengguna, konfigurasi unit pembangkit, manajemen rilis file APK Android, dan pemantauan sinkronisasi multi-aplikasi. | Akses penuh menu `/admin/integrasi`, `/admin/apk`, kelola master data mesin, dan backup database. |

---

### 1.4 Standar Tampilan Antarmuka (100% Light Mode Korporat PLN)
Sesuai arahan dan identitas korporat resmi PT PLN (Persero), sistem antarmuka web dibangun **100% Light Mode** tanpa nuansa gelap (Dark Mode) yang dapat mengaburkan visibilitas saat diakses di ruang kontrol pembangkit:
- **Warna Dasar:** Putih Bersih (`#FFFFFF`), Slate Lembut (`#F8FAFC`), dan Card Border (`#E2E8F0`).
- **Warna Korporat:** Biru Utama PLN (`#004581`), Biru Elektrik (`#008CC8`), Cyan PLN (`#00A3E0`), dan Kuning Petir (`#FFCC00`).
- **Aksen Status:** Hijau Andal (`#16A34A`), Amber Pemeliharaan (`#D97706`), dan Merah Kritis (`#DC2626`).

---

# BAB 2: AKSES BERANDA UTAMA (LANDING PAGE) & DOWNLOAD APK

### 2.1 Antarmuka Beranda Publik
Pengguna dapat mengakses beranda publik portal tanpa harus login terlebih dahulu melalui peramban: `http://localhost:3000/`.

![Antarmuka Beranda Utama PLN Nusa Daya](images/01_landing_hero.png)

#### Keterangan Fitur Halaman Beranda:
1. **Bilah Navigasi Atas (Top Navigation Bar):**
   - Logo resmi PT PLN Nusa Daya dan identitas sistem.
   - Menu Cepat: Beranda, Dashboard Operasi, Matriks Logsheet, HAR Mesin, Tata Kelola, Profil Unit, dan Pusat Bantuan.
   - Tombol **"Aplikasi Mobile"** yang langsung melompat ke bagian unduhan APK.
   - Tombol **"Masuk Sistem"** untuk mengarahkan pengguna ke form autentikasi.
2. **Hero Banner & Lencana Status:**
   - Menampilkan tajuk utama: *"Sistem Kontrol Operasi WACB & Pemeliharaan Terpadu"*.
   - Lencana Siaga Kelistrikan 24 Jam dengan indikator pulsasi hijau aktif.
3. **Statistik Nasional Operasional:**
   - Ringkasan Unit PLTD Terhubung, Total Kapasitas Daya Mampu (MW), Indeks Kesiapan Pembangkit (EAF 99.2%), dan Zero Accident Score.

---

### 2.2 Prosedur Download APK Aplikasi Mobile Lapangan
Untuk mengunduh berkas installer aplikasi Android bagi operator dan teknisi lapangan, gulir halaman beranda ke bawah hingga bagian **Pusat Aplikasi Mobile Terpadu** (`http://localhost:3000/#mobile-app`).

![Pusat Unduhan APK Aplikasi Mobile Lapangan](images/02_mobile_app_download.png)

#### Dua Kartu Aplikasi Mobile Tersedia:

1. **Aplikasi 1: PLN Logsheet & Operasional PLTD (WACB Mobile)**
   - **Target Pengguna:** Operator Mesin & Pengawas Operasional PLTD.
   - **Ukuran Berkas:** 64.3 MB (Format `.apk`).
   - **Versi:** v1.0.0 (Build 1) — Android 8.0 (Oreo) atau lebih tinggi.
   - **Fitur Utama:** Form logsheet matriks 48-slot harian, presensi berbasis GPS radius 250m, mode penyimpanan offline mandiri.
   - **Tombol Aksi:** Klik **"Unduh APK Logsheet (64.3 MB)"** untuk langsung mengunduh binary installer ke komputer atau smartphone.

2. **Aplikasi 2: PLN Nusa Daya HAR (Pemeliharaan & Gangguan AMC)**
   - **Target Pengguna:** Tim Pemeliharaan (HAR), Teknisi Mekanik/Elektrik, dan Koordinator AMC.
   - **Ukuran Berkas:** 47.2 MB (Format `.apk`).
   - **Versi:** v1.0.0 (Build 1) — Android 8.0 (Oreo) atau lebih tinggi.
   - **Fitur Utama:** Form inspeksi checklist P1-P6, pelaporan gangguan darurat mesin, lampiran foto sebelum/sesudah pengerjaan, tanda tangan digital pelaksana.
   - **Tombol Aksi:** Klik **"Unduh APK HAR (47.2 MB)"** untuk langsung mengunduh binary installer.

---

### 2.3 Pemindaian QR Code untuk Instalasi Instan di Smartphone Android
Pada setiap kartu aplikasi mobile, tersedia tombol **"Scan QR Code"**. Jika ditekan, modal pop-up interaktif akan menampilkan kode QR beresolusi tinggi:
1. Buka aplikasi kamera atau pemindai QR pada smartphone Android Anda.
2. Arahkan kamera ke kode QR di layar komputer.
3. Ketuk tautan notifikasi yang muncul di smartphone: `http://localhost:3000/api/apk/download?type=logsheet` atau `?type=har`.
4. Berkas APK akan langsung terunduh secara otomatis di folder *Download* ponsel Anda.

---

# BAB 3: AUTENTIKASI & MASUK KE SISTEM (LOGIN)

### 3.1 Halaman Login & Keamanan Akses
Untuk mengakses menu fungsional pencatatan data dan persetujuan Berita Acara, pengguna wajib melakukan autentikasi di halaman login: `http://localhost:3000/login`.

![Halaman Login Autentikasi Pengguna](images/03_login_page.png)

#### Panduan Pengisian Form Login:
1. **Identitas Pengguna (Username / NIP):** Masukkan NIP pegawai PLN atau username resmi unit kerja (Contoh: `admin`, `operator01`, `spv.mesin`, `kal3`).
2. **Kata Sandi (Password):** Masukkan kata sandi rahasia akun Anda.
3. **Pilihan Hak Akses (Role Selector):** Pilih peran yang sesuai dengan Surat Tugas Anda:
   - `Operator PLTD`
   - `Teknisi HAR Lapangan`
   - `Supervisor Operasi (SPV)`
   - `Super Administrator`
4. **Tombol Masuk:** Klik tombol biru **"Masuk ke Portal Operasional"**.
5. Sistem akan memvalidasi sesi JWT dan membawa Anda ke Dashboard Kontrol Operasi.

---

### 3.2 Alur Pemilihan Unit PLTD & Mode Tamu (Guest Access)
Jika Anda adalah tamu, auditor, atau pimpinan yang hanya membutuhkan wewenang peninjauan data tanpa mengubah nilai matriks (*Read-Only*), Anda dapat menggunakan tombol **"Akses Mode Tamu (Guest Monitoring)"** di bawah form login:
- Mengakses dashboard dengan filter pembacaan seluruh data unit pembangkit.
- Tidak dapat mengubah atau menghapus data logsheet dan tiket pemeliharaan.
- Dapat melakukan export laporan PDF dan Excel secara bebas.

---

# BAB 4: DASHBOARD PEMANTAUAN OPERASIONAL & KOKPIT TELEMETRI

### 4.1 Banner Siaga Kelistrikan 24 Jam & Parameter Utama
Setelah login, pengguna akan disambut oleh layar Dashboard Pusat Operasional (`http://localhost:3000/dashboard`).

![Dashboard Komando Operasional PLTD](images/04_dashboard_overview.png)

#### Komponen Utama Dashboard:
1. **Banner Komando Pembangkit:** Menampilkan identitas unit kerja aktif (misal: *PLTD BATU AMPAR* atau *KONSOLIDASI SELURUH UNIT*), status jaringan sinkron, serta jam lokal waktu operasional (WITA/WIB).
2. **Selector Unit Cepat:** Dropdown di sudut kanan atas untuk berpindah pemantauan antar unit PLTD secara instan (PLTD Batu Ampar, ULD Muara Pahu, PLTD Gunung Malang, PLTD Nunukan, dsb.).
3. **Status Peringatan Dini:** Menampilkan bilah status warna hijau jika seluruh mesin beroperasi normal, atau amber/merah jika terdeteksi penurunan tekanan oli atau deviasi tegangan.

---

### 4.2 Kartu Metrik Telemetri Daya, Kesiapan (EAF), & Derating
Di bawah banner utama, terdapat 6 kartu metrik telemetri yang diperbarui secara *real-time*:
- **Daya Terpasang (DT):** Total kapasitas nama pelat mesin yang terpasang di unit (kW / MW).
- **Daya Mampu Nyata (DMN):** Batas kapasitas maksimum mesin yang diizinkan untuk dibebani pada kondisi lingkungan aktual.
- **Beban Puncak Aktif (kW):** Beban puncak penyaluran listrik pada jam beban puncak (WBP) malam hari.
- **Equivalent Availability Factor (EAF):** Persentase faktor kesiapan pembangkit (standar kinerja PLN: > 95.0%).
- **Derating Daya (kW):** Penurunan kapasitas daya mampu mesin akibat keterbatasan teknis atau umur operasi.
- **Cadangan Putar (Spinning Reserve):** Kapasitas daya cadangan siap operasi untuk mengantisipasi lonjakan beban tiba-tiba.

---

### 4.3 Filter Tanggal, Shift Kerja, & Unit Pembangkit
Di atas area tabel dan grafik, tersedia bilah filter interaktif:
1. **Filter Tanggal:** Memungkinkan pemilihan tanggal operasional masa lalu untuk audit rekapitulasi bulanan.
2. **Filter Shift Kerja:**
   - **Shift Pagi:** 08:00 – 16:00 WITA (16 Slot Data)
   - **Shift Sore / Siang:** 16:00 – 24:00 WITA (16 Slot Data)
   - **Shift Malam:** 00:00 – 08:00 WITA (16 Slot Data)
   - **24 Jam Penuh:** 00:00 – 23:30 WITA (48 Slot Data Matriks Lengkap)

---

# BAB 5: PANDUAN EKSPOR DATA MULTI-FORMAT (PDF & EXCEL)

### 5.1 Bilah Aksi Ekspor Data
Portal web dilengkapi dengan bilah alat ekspor data berstandar audit korporat yang terletak tepat di atas tabel matriks dan daftar tiket.

![Bilah Aksi Ekspor Data PDF & Excel](images/05_export_action_bar.png)

Tersedia 4 format ekspor berkas data yang dapat diunduh dalam 1 kali klik:
1. **Tombol "Cetak Berita Acara PDF (Landscape)":** Menghasilkan dokumen laporan resmi bertanda tangan.
2. **Tombol "Unduh Spreadsheet Excel (.xlsx)":** Menghasilkan lembar kerja analitik multi-sheet.
3. **Tombol "Export CSV (.csv)":** Menghasilkan data mentah berpemisah koma untuk database SQL.
4. **Tombol "Cadangkan JSON (.json)":** Cadangan basis data mentah lengkap dengan riwayat log.

---

### 5.2 Cetak Berita Acara PDF Resmi (Landscape & Satuan)
Prosedur mencetak Berita Acara PDF resmi:
1. Klik tombol **"Cetak Berita Acara PDF"** pada bilah aksi.
2. Sistem otomatis mengompilasi lembar kerja berformat **Landscape A4** yang memuat:
   - Kop Surat Resmi: *PT PLN NUSA DAYA — DIVISI OPERASI & PEMELIHARAAN*.
   - Tabel Lengkap 48 Slot Jam Operasi dengan indikator rata-rata beban (kW) dan suhu mesin.
   - Kolom Evaluasi Gangguan dan Temuan Lapangan.
   - Blok Pengesahan Resmi bertanda tangan digital:
     - **Pelaksana / Operator Shift**
     - **Supervisor Operasi PLTD**
     - **Manajer Unit Layanan Pembangkit**
3. Kotak dialog unduhan peramban akan terbuka, dan berkas `Berita_Acara_Logsheet_PLTD_[Tanggal].pdf` otomatis tersimpan di komputer Anda.

---

### 5.3 Ekspor Spreadsheet Excel (.xlsx) Multi-Sheet
Bagi staf perencanaan dan pelaporan yang membutuhkan pengolahan data pivot atau grafik analitik lanjutan:
1. Klik tombol hijau **"Unduh Spreadsheet Excel (.xlsx)"**.
2. Berkas Excel yang dihasilkan tersusun atas struktur multi-sheet profesional:
   - **Sheet 1 (`Ringkasan_Operasi`):** Data statistik beban harian, konsumsi solar (Liter), produksi KWH, dan efisiensi SFC (*Specific Fuel Consumption*).
   - **Sheet 2 (`Matriks_48_Slot`):** Tabel mentah per 30 menit dari jam 00:00 hingga 23:30 untuk seluruh mesin.
   - **Sheet 3 (`Inspeksi_HAR`):** Catatan parameter tekanan pelumasan, suhu radiator, dan jam kerja mesin (HM).
3. Format sel telah disesuaikan dengan formula otomatis, tanpa merusak format angka desimal.

---

### 5.4 Ekspor Data Mentah CSV & Cadangan Backup JSON
- **Ekspor CSV:** Digunakan untuk integrasi ke sistem ERP PLN terpusat (seperti SAP atau Maximo).
- **Cadangan JSON:** Berisi seluruh struktur data relasional unit, logsheet, dan riwayat pemeliharaan yang dapat dipulihkan (*restore*) sewaktu-waktu terjadi pergantian server basis data.

---

# BAB 6: PENGOPERASIAN LOGSHEET 48-SLOT MATRIX (WACB PLTD)

### 6.1 Struktur Tabel Matriks 48-Slot 24 Jam
Halaman Matriks Logsheet (`http://localhost:3000/logsheet/matrix`) menampilkan lembar pencatatan beban mesin per interval 30 menit (total 48 slot per hari kalender).

![Tabel Matriks Logsheet 48 Slot 24 Jam](images/06_logsheet_matrix_table.png)

#### Kolom-Kolom Parameter yang Dipantau:
1. **Slot Waktu (Interval 30 Menit):**
   - 00:00, 00:30, 01:00, ... hingga 23:30 WITA.
2. **Kondisi Mesin:** Status Operasi (*Running*), Siaga (*Standby*), atau Pemeliharaan (*HAR*).
3. **Parameter Daya Listrik:**
   - **Beban Aktif (kW):** Beban nyata yang disuplai generator.
   - **Beban Semu (kVA) & Daya Reaktif (kVAR).**
   - **Arus Beban Listrik (Ampere):** Fase R, Fase S, dan Fase T.
   - **Tegangan Generator (Volt):** Fase-ke-Fase (RS, ST, TR: Standar 380-400 Volt).
   - **Frekuensi (Hz):** Kestabilan putaran generator (Standar PLN: 49.5 – 50.5 Hz).
   - **Faktor Daya (Cos Phi):** Standar efisiensi jaringan antara 0.80 hingga 0.95 Lagging.
4. **Parameter Termal & Mekanik Diesel:**
   - **Suhu Air Pendingin Masuk/Keluar (°C):** Standar toleransi pabrikan: 75°C – 88°C.
   - **Suhu Minyak Pelumas (°C):** Standar batas aman: 80°C – 95°C.
   - **Tekanan Oli Pelumas (Bar):** Standar normal: 3.5 – 5.5 Bar (Alarm bahaya di bawah 2.5 Bar).
   - **Suhu Gas Buang Tiap Silinder (°C):** Memantau keseimbangan pembakaran antar silinder.
5. **Stand Energi & Bahan Bakar:**
   - **Stand Meter Produksi KWH.**
   - **Stand Meter Flow Bahan Bakar Minyak Solar (BBM).**
   - **Total Hour Meter (HM) Akumulasi Operasi.**

---

### 6.2 Pengisian Parameter Listrik, Mekanik & Suhu Mesin
1. Pilih slot waktu yang ingin diisi (misal: pukul `14:00`).
2. Masukkan angka pembacaan dari instrumen analog atau digital kontrol panel generator.
3. Klik tombol centang hijau atau tekan tombol *Enter* untuk menyimpan baris data ke database pusat.
4. Jika terdapat parameter yang melebihi batas toleransi aman manufaktur (misal tekanan oli < 3.0 Bar), sel tabel akan berubah warna menjadi **Kuning Peringatan** atau **Merah Kritis**.

---

### 6.3 Validasi Toleransi Teknis & Audit Trail
Setiap perubahan data pada matriks logsheet dicatat dalam pangkalan data jejak audit (*Audit Trail*), meliputi:
- Waktu input data (stempel waktu server).
- Identitas akun operator yang menginput.
- Nilai data sebelum diubah dan sesudah diubah.
Hal ini memastikan integritas data operasional bebas dari manipulasi angka laporan.

---

# BAB 7: MANAJEMEN PEMELIHARAAN MESIN (HAR) & LAPOR GANGGUAN AMC

### 7.1 Daftar Tiket Pemeliharaan & Job Card P1–P6
Modul Pemeliharaan HAR (`http://localhost:3000/har`) digunakan oleh tim teknisi pemeliharaan dan pengawas AMC untuk mencatat inspeksi berkala dan perbaikan mesin pembangkit.

![Modul Pemeliharaan HAR Mesin & Tiket AMC](images/07_har_tickets_view.png)

#### Kategori Siklus Pemeliharaan Berkala:
- **P1 (Pemeliharaan 50 Jam):** Pemeriksaan level oli, tegangan v-belt, dan pembersihan filter udara kasar.
- **P2 (Pemeliharaan 250 Jam):** Penggantian oli pelumas mesin dan penggantian filter oli.
- **P3 (Pemeliharaan 500 Jam):** Penggantian saringan bahan bakar (*Fuel Filter*) dan pengurasan water separator.
- **P4 (Pemeliharaan 1.000 Jam):** Penyetelan celah katup (*Valve Lash*), kalibrasi injektor, dan pembersihan radiator.
- **P5 (Pemeliharaan 2.000 Jam):** Pemeriksaan turbocharger, pembersihan intercooler, dan overhaul pompa air pendingin.
- **P6 / Top Overhaul (3.000 – 6.000 Jam):** Pembongkaran kepala silinder (*Cylinder Head*), skir klep, dan penggantian paking mesin.

---

### 7.2 Empat Subsistem Inspeksi Komponen Mesin
Dalam setiap tiket HAR, teknisi wajib melakukan verifikasi pada 4 subsistem utama:
1. **Sistem Pelumasan (Lubricating System):** Pengecekan kualitas viskositas oli, kebocoran karter oli, dan fungsi pompa oli pendukung.
2. **Sistem Udara & Gas Buang (Air Intake & Exhaust System):** Indikator kevakuman saringan udara (*Air Restriction Indicator*), kerapatan sambungan knalpot, dan kelancaran turbocharger.
3. **Sistem Pendinginan (Cooling System):** Kadar inhibitor radiator coolant, fungsi kisi-kisi pendingin, dan sensor temperatur air.
4. **Sistem Kelistrikan & Kontrol (Electrical & Control System):** Kapasitas baterai starter (24 VDC), dinamo ampere pengisian (*Alternator*), dan modul proteksi genset (*Deepsea / ComAp*).

---

### 7.3 Alur Persetujuan Berjenjang (SPV Approval) & Tanda Tangan Digital

```
[1. Draf Dibuat] ──> [2. Diajukan Teknisi] ──> [3. Review Evaluasi SPV] ──> [4. Berita Acara Disahkan]
```

1. **Pengajuan:** Teknisi lapangan mengisi checklist, melampirkan foto dokumentasi pengerjaan ber-geotag, membubuhkan tanda tangan digital di ponsel atau web, lalu menekan **"Ajukan Tiket HAR"**. Status: `Submitted`.
2. **Pemberitahuan SPV:** Supervisor Operasi menerima notifikasi tiket baru yang menunggu persetujuan.
3. **Pemeriksaan & Verifikasi:** Supervisor meninjau kesesuaian nilai parameter teknis dan kelengkapan foto sebelum/sesudah pengerjaan.
4. **1-Klik Approval:** Supervisor menekan tombol hijau **"Setujui & Approve HAR"**. Dokumen Berita Acara resmi disahkan dengan nomor registrasi unik dan stempel digital aman.

---

# BAB 8: PANDUAN ADMINISTRATOR — PUSAT INTEGRASI MULTI-APP

### 8.1 Arsitektur Sinkronisasi 3 Aplikasi
Portal Web berfungsi sebagai *hub* induk yang menjembatani pertukaran data dua arah (*Two-Way Sync*) dengan dua aplikasi ekosistem lainnya:

![Pusat Integrasi Ekosistem 3 Aplikasi PLN](images/08_admin_integration_hub.png)

1. **Aplikasi Lapangan 1:** `PLN_NUSA_DAYA_APPS` (Mobile Logsheet WACB PLTD).
2. **Aplikasi Lapangan 2:** `PLN_HAR` (Mobile Pemeliharaan & Tiket Gangguan AMC).
3. **Pusat Komando:** `LOGSHEETWEBPLNNUSADAYA` (Web Portal, API Server & PostgreSQL).

---

### 8.2 Panel Monitoring Integrasi Lapangan
Pada halaman **Admin Integrasi** (`http://localhost:3000/admin/integrasi`), administrator dapat memantau:
- **Status Jaringan Layanan:** Indikator *ONLINE & TERHUBUNG* untuk setiap modul aplikasi.
- **Waktu Sinkronisasi Terakhir:** Menampilkan jeda waktu terakhir data lapangan diterima (misal: *3 detik yang lalu*).
- **Total Data Tersinkronisasi:** Jumlah logsheet (contoh: 2.840 baris log) dan tiket pemeliharaan (contoh: 185 tiket) yang berhasil dimigrasikan ke database pusat.
- **Kesehatan Basis Data:** Parameter koneksi database PostgreSQL `pltd_logsheet` pada port 5434/5432.

---

### 8.3 Eksekusi Broadcast Update & Push/Pull Sinkronisasi
Administrator dibekali tombol kendali khusus di bilah kanan atas:
- **Tombol "Tarik Data Terbaru (Pull Sync)":** Mengambil antrean data offline yang baru saja dikirim oleh teknisi lapangan dari area blank spot sinyal.
- **Tombol "Siarkan Pembaruan (Broadcast Update)":** Mengirimkan pembaruan konfigurasi mesin, master data unit, dan pesan darurat serentak ke seluruh smartphone teknisi yang sedang aktif di lapangan.

---

# BAB 9: PANDUAN ADMINISTRATOR — MANAJEMEN RILIS & UPLOAD APK

### 9.1 Alur Unggah Berkas APK Baru
Administrator bertanggung jawab memperbarui installer aplikasi mobile Android ketika tim pengembang merilis pembaruan fitur atau perbaikan *bug*.
Akses modul ini melalui menu: **[http://localhost:3000/admin/apk](http://localhost:3000/admin/apk)**.

![Pusat Manajemen Rilis & Upload APK](images/09_admin_apk_management.png)

#### Langkah-Langkah Mengunggah File APK Baru:
1. **Pilih Tab Target Aplikasi:**
   - Klik Tab **"1. PLN Logsheet PLTD (WACB Mobile)"** jika ingin memperbarui aplikasi logsheet operator.
   - Klik Tab **"2. PLN HAR Mesin & AMC"** jika ingin memperbarui aplikasi pemeliharaan teknisi.
2. **Pilih Berkas APK:**
   - Seret (*drag-and-drop*) berkas `.apk` baru dari komputer Anda ke dalam kotak dropzone putus-putus biru, **ATAU**
   - Klik tombol **"Pilih File APK dari Komputer"** untuk membuka pemilih berkas (*File Explorer*).
3. **Verifikasi Otomatis:** Sistem akan memeriksa ekstensi file `.apk`, membaca ukuran byte file, dan memastikan integritas paket Android valid.

---

### 9.2 Pengelolaan Metadata, Versi & Catatan Rilis (Changelog)
Sebelum menekan tombol simpan, lengkapi formulir informasi rilis:
- **Nomor Versi Aplikasi:** Contoh: `v1.0.1` atau `v2.4.0`.
- **Nomor Rancang (Build Number):** Contoh: `2` atau `24`.
- **Minimum Versi Android:** Contoh: `Android 8.0 (Oreo) atau lebih tinggi`.
- **Catatan Pembaruan (Changelog):** Tuliskan poin-poin fitur baru atau perbaikan yang disertakan dalam rilis ini (Contoh: *"Penyempurnaan akurasi GPS geofence 250m dan penambahan fitur cetak PDF landscape"*).

---

### 9.3 Uji Coba Unduh & Verifikasi Checksum File APK
Setelah tombol **"Unggah & Publikasikan Rilis APK"** ditekan dan notifikasi sukses muncul:
1. Periksa kartu pratinjau rilis aktif di sebelah kanan.
2. Klik tombol **"Unduh File APK Sekarang"** untuk memastikan berkas binary yang tersimpan di server dapat diunduh tanpa korupsi berkas (*corrupt package*).
3. Pindai kode QR yang otomatis diperbarui untuk memastikan pengunduhan di smartphone berfungsi dengan lancar.
4. Total counter pengunduhan (*Download Count*) akan bertambah secara otomatis setiap kali berkas diunduh.

---

# BAB 10: KESELAMATAN K3 ZERO ACCIDENT, FAQ & BANTUAN TEKNIS

### 10.1 Kaidah Keselamatan Kerja K3 Pembangkit Listrik
Segenap personel operator, teknisi, dan supervisor wajib menerapkan kaidah Keselamatan dan Kesehatan Kerja (K3) serta Lingkungan Hidup (K3L) selama melakukan pengambilan data logsheet dan inspeksi fisik mesin PLTD:
1. **Alat Pelindung Diri (APD) Wajib:**
   - Helm Pengaman (*Safety Helmet*) standar ANSI/SNI.
   - Sepatu Pelindung (*Safety Shoes*) dengan sol tahan minyak dan pelat pelindung jari kaki.
   - Penutup Telinga (*Earplug / Earmuff*) berkemampuan reduksi suara minimal 25 dB di dalam rumah genset (*Engine Hall*).
   - Kacamata Pengaman (*Safety Goggles*) saat memeriksa sistem bahan bakar injeksi bertekanan tinggi.
2. **Prosedur LOTO (Lock-Out Tag-Out):**
   - Wajib memasang gembok keselamatan dan label bahaya LOTO pada panel sakelar pemutus utama sebelum teknisi memasuki area putaran mesin atau generator.
3. **Pencegahan Luka Bakar & Tekanan Tinggi:**
   - Dilarang membuka tutup radiator ekspansi saat temperatur air pendingin masih di atas 80°C.
   - Gunakan sarung tangan tahan panas saat mengukur suhu knalpot (*Exhaust Manifold*).

---

### 10.2 Pertanyaan yang Sering Diajukan (FAQ) & Penyelesaian Kendala

#### Q1: Mengapa saat mengklik tombol Download APK di ponsel muncul peringatan "File mungkin berbahaya"?
> **Jawaban:** Peringatan tersebut adalah mekanisme keamanan standar sistem Android untuk aplikasi yang diunduh langsung dari server portal korporat PLN (di luar Google Play Store). Pilih opsi **"Tetap Download"** / **"Lanjutkan"**, lalu buka file dan pilih **"Instal"**. Berkas APK ini aman dan telah diverifikasi oleh tim IT PLN Nusa Daya.

#### Q2: Apa yang harus dilakukan jika sinyal internet di unit PLTD terputus saat teknisi mencatat data?
> **Jawaban:** Aplikasi mobile dilengkapi fitur *Offline First Local Storage*. Teknisi tetap dapat mencatat logsheet dan checklist pemeliharaan secara normal. Seluruh data tersimpan aman di memori lokal ponsel dan akan otomatis disinkronkan ke server web pusat begitu ponsel mendapatkan koneksi internet kembali.

#### Q3: Bagaimana cara mengubah data logsheet jika operator salah memasukkan angka beban kW?
> **Jawaban:** Operator dapat mengklik baris slot waktu yang ingin dikoreksi pada tabel matriks sebelum shift kerja ditutup dan disahkan oleh Supervisor. Setiap koreksi akan dicatat dalam audit trail sistem untuk akuntabilitas. Jika shift telah disahkan (*Approved*), koreksi hanya dapat dilakukan oleh Supervisor atau Administrator melalui menu penyesuaian khusus.

#### Q4: Mengapa tombol Ekspor PDF Berita Acara tidak merespons di peramban saya?
> **Jawaban:** Pastikan peramban Anda (Google Chrome / Microsoft Edge) tidak memblokir jendela sembulan (*Pop-up Blocker*). Klik ikon gembok di bilah alamat peramban dan izinkan opsi *"Pop-ups and redirects"* untuk domain portal ini.

---

### 10.3 Layanan Kontak Bantuan & Dukungan Tim IT

Bila Anda membutuhkan asistensi teknis lebih lanjut, pemulihan akun, atau pelaporan anomali sistem:

```
========================================================================================
                      TIM PENGEMBANG & DUKUNGAN TEKNIS IT
                           PT PLN NUSA DAYA (PERSERO)
========================================================================================
  • Helpdesk Operasional  : Ext. 4410 / (0542) 887-1234
  • Email Dukungan Resmi  : it-support@plnnusadaya.co.id / helpdesk.wacb@pln.co.id
  • Portal Tiket Masalah  : http://localhost:3000/admin/integrasi
  • Waktu Layanan Operasi : 24 Jam Non-Stop / 7 Hari Seminggu (Siaga Kelistrikan)
========================================================================================
```

---
*Dokumen ini diterbitkan secara resmi oleh Divisi Operasi dan Pemeliharaan Pembangkit Tenaga Listrik PT PLN Nusa Daya. Seluruh hak cipta dilindungi oleh undang-undang korporat.*
