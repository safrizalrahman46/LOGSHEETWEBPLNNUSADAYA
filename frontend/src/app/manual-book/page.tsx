"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Download,
  Printer,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Cpu,
  FileSpreadsheet,
  FileText,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  Maximize2,
  X,
  Share2,
} from "lucide-react";

interface ManualChapter {
  id: string;
  number: string;
  title: string;
  category: "Dasar" | "Operasional" | "Pemeliharaan" | "Admin";
  summary: string;
  image?: {
    src: string;
    alt: string;
    caption: string;
    highlights: { num: number; label: string; desc: string }[];
  };
  content: React.ReactNode;
}

export default function ManualBookPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChapter, setActiveChapter] = useState("bab-1");
  const [zoomImage, setZoomImage] = useState<{ src: string; caption: string } | null>(null);

  const chapters: ManualChapter[] = [
    {
      id: "bab-1",
      number: "BAB 1",
      title: "Pengenalan Sistem & Arsitektur Terpadu",
      category: "Dasar",
      summary: "Latar belakang, arsitektur integrasi 3-aplikasi, peran pengguna (roles), dan standar visual korporat PLN.",
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Portal Web <strong>PLN Services — WACB PLTD Logsheet & HAR Portal</strong> adalah pusat komando digital terintegrasi yang menghubungkan operasional pencatatan beban mesin pembangkit 48-slot (<em>WACB</em>) dengan manajemen pemeliharaan mesin (<em>HAR</em>) dan tiket gangguan AMC pada seluruh unit PLTD di lingkungan PT PLN Services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xs font-bold text-blue-700 uppercase">1. Transparansi Real-Time</span>
              <p className="text-xs text-blue-900 mt-1">Menggantikan kertas manual dengan basis data terenkripsi PostgreSQL.</p>
            </div>
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
              <span className="text-xs font-bold text-cyan-700 uppercase">2. Standarisasi PDF & Excel</span>
              <p className="text-xs text-cyan-900 mt-1">Berita Acara resmi sah bernomor registrasi dan tanda tangan digital SPV.</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-xs font-bold text-emerald-700 uppercase">3. Integrasi 3 Aplikasi</span>
              <p className="text-xs text-emerald-900 mt-1">Sinkronisasi otomatis dengan PLN_HAR & PLN_NUSA_DAYA_APPS.</p>
            </div>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-lg mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Peran (Role)</th>
                  <th className="p-2.5">Tanggung Jawab Lapangan</th>
                  <th className="p-2.5">Wewenang Sistem Web</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Operator PLTD</td>
                  <td className="p-2.5">Pencatatan 48 slot jam beban, stand KWH & BBM solar</td>
                  <td className="p-2.5 text-slate-600">Input matriks logsheet, export PDF shift</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Teknisi HAR Lapangan</td>
                  <td className="p-2.5">Eksekusi checklist P1-P6, foto bukti pengerjaan</td>
                  <td className="p-2.5 text-slate-600">Buat tiket HAR, submit pengerjaan</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Supervisor Operasi (SPV)</td>
                  <td className="p-2.5">Evaluasi parameter teknis, verifikasi anomali</td>
                  <td className="p-2.5 text-slate-600">1-Klik Approval Berita Acara, ttd digital</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800">Super Administrator</td>
                  <td className="p-2.5">Tata kelola unit, sinkronisasi data & rilis APK</td>
                  <td className="p-2.5 text-slate-600">Akses penuh /admin/integrasi & /admin/apk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: "bab-2",
      number: "BAB 2",
      title: "Beranda Utama & Pusat Unduhan APK Mobile",
      category: "Dasar",
      summary: "Navigasi landing page, spesifikasi APK mobile untuk operator dan teknisi, serta instalasi QR code.",
      image: {
        src: "/docs/images/01_landing_hero.png",
        alt: "Beranda Utama Portal PLN Services",
        caption: "Tampilan Beranda Utama (Landing Page) dengan Hero Banner dan Navigasi Korporat",
        highlights: [
          { num: 1, label: "Top Navigation", desc: "Akses cepat ke Dashboard, Matriks, HAR, Unit, dan Download Mobile App." },
          { num: 2, label: "Hero Banner", desc: "Informasi status siaga kelistrikan 24 jam non-stop dan kapasitas terpasang." },
          { num: 3, label: "Tombol Masuk Sistem", desc: "Pintu masuk autentikasi pengguna berdasarkan peran tugas masing-masing." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Pengguna dan operator dapat mengakses beranda publik portal melalui alamat <code>http://localhost:3000/</code>. Dari halaman ini, operator maupun teknisi pemeliharaan dapat langsung mengunduh berkas installer Android (.apk) sesuai unit tugasnya.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <h4 className="font-bold text-slate-900 text-sm">Aplikasi 1: PLN Logsheet PLTD</h4>
              </div>
              <p className="text-xs text-slate-600 mb-3">Khusus Operator Mesin PLTD untuk pencatatan matriks beban 48-slot WACB per 30 menit dan presensi GPS geofence 250m.</p>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                <span>Ukuran: 64.3 MB</span>
                <span>Android 8.0+</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-slate-900 text-sm">Aplikasi 2: PLN HAR & AMC</h4>
              </div>
              <p className="text-xs text-slate-600 mb-3">Khusus Tim Pemeliharaan (HAR) untuk formulir checklist inspeksi P1-P6, lapor gangguan mesin, dan approval berjenjang.</p>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                <span>Ukuran: 47.2 MB</span>
                <span>Android 8.0+</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <strong>Tips Instalasi Cepat Smartphone:</strong> Pada kartu aplikasi di <code>#mobile-app</code>, klik tombol <strong>"Scan QR Code"</strong> dan arahkan kamera ponsel Android Anda ke layar monitor. Berkas APK akan langsung terunduh secara instan tanpa perlu memindahkan kabel data.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "bab-3",
      number: "BAB 3",
      title: "Autentikasi & Masuk ke Sistem (Login)",
      category: "Dasar",
      summary: "Prosedur login akun, seleksi peran pengguna, dan akses pemantauan tamu (Guest Access).",
      image: {
        src: "/docs/images/03_login_page.png",
        alt: "Halaman Login Portal Web",
        caption: "Form Autentikasi Pengguna dengan Pilihan Role dan Opsi Guest Monitoring",
        highlights: [
          { num: 1, label: "Input Kredensial", desc: "Masukkan Username / NIP dan Kata Sandi resmi yang terdaftar." },
          { num: 2, label: "Role Selector", desc: "Pilih peran tugas: Operator, Teknisi HAR, Supervisor, atau Administrator." },
          { num: 3, label: "Guest Monitoring", desc: "Akses cepat mode peninjauan bagi tamu atau auditor tanpa mengubah data." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Autentikasi diperlukan untuk memastikan keamanan data operasional pembangkit. Akses halaman login di <code>http://localhost:3000/login</code>.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs">
            <li><strong>Masukkan NIP / Username:</strong> Gunakan akun resmi unit kerja PLN Anda.</li>
            <li><strong>Masukkan Kata Sandi:</strong> Masukkan password yang telah diberikan oleh Super Admin.</li>
            <li><strong>Pilih Peran:</strong> Sesuaikan dengan wewenang operasional Anda hari ini.</li>
            <li><strong>Klik Masuk:</strong> Sistem akan membuat sesi token JWT aman dan mengarahkan Anda ke Dashboard Operasi.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "bab-4",
      number: "BAB 4",
      title: "Dashboard Operasi & Kokpit Telemetri PLTD",
      category: "Operasional",
      summary: "Pemantauan beban puncak kW, EAF kesiapan unit, derating, cadangan putar, dan filter shift kerja.",
      image: {
        src: "/docs/images/04_dashboard_overview.png",
        alt: "Dashboard Pusat Komando Operasional",
        caption: "Banner Komando Siaga 24 Jam, Pemilih Unit Cepat, dan Kartu Telemetri Parameter Kritis",
        highlights: [
          { num: 1, label: "Unit Pembangkit Selector", desc: "Beralih unit PLTD (Batu Ampar, Muara Pahu, Nunukan) dalam 1 klik." },
          { num: 2, label: "6 Kartu Metrik Telemetri", desc: "Daya Terpasang, Daya Mampu, Beban Puncak, EAF, Derating, Cadangan Putar." },
          { num: 3, label: "Filter Shift & Kalender", desc: "Pilih tanggal dan shift kerja: Pagi (08-16), Siang (16-24), Malam (00-08)." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Dashboard Operasi menyajikan kokpit telemetri terpadu untuk mengevaluasi keandalan pembangkit secara seketika. Terdapat 6 parameter utama yang wajib dipantau oleh operator dan supervisor setiap pergantian shift:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">1. Daya Terpasang (DT)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">Kapasitas Pelat Nama</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">2. Daya Mampu (DMN)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">Batas Beban Nyata</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">3. Beban Puncak (kW)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">Penyaluran Maksimum</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">4. Kesiapan EAF (%)</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">Standar &gt; 95.0%</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">5. Derating Daya</span>
              <p className="font-bold text-amber-600 text-sm mt-0.5">Penurunan Kapasitas</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-semibold">6. Cadangan Putar</span>
              <p className="font-bold text-blue-600 text-sm mt-0.5">Spinning Reserve</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "bab-5",
      number: "BAB 5",
      title: "Ekspor Data Multi-Format (PDF & Excel)",
      category: "Operasional",
      summary: "Prosedur cetak Berita Acara PDF resmi (Landscape), export spreadsheet Excel multi-sheet, CSV, dan backup JSON.",
      image: {
        src: "/docs/images/05_export_action_bar.png",
        alt: "Bilah Aksi Ekspor Data Multi-Format",
        caption: "Bilah Aksi Ekspor Berita Acara PDF Resmi, Excel Multi-Sheet, CSV, dan Cadangan JSON",
        highlights: [
          { num: 1, label: "Cetak Berita Acara PDF", desc: "Format Landscape A4 resmi dengan kop PLN, tanda tangan SPV, dan tabel 48 slot." },
          { num: 2, label: "Unduh Spreadsheet Excel", desc: "Berkas .xlsx multi-sheet (Ringkasan Operasi, Matriks 48-Slot, Inspeksi HAR)." },
          { num: 3, label: "Export CSV & Cadangan JSON", desc: "Data mentah untuk pengolahan SQL atau cadangan backup database server." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Sistem menyediakan mesin ekspor multi-format satu-klik yang mematuhi standar audit korporat PT PLN (Persero):
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <FileText className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-900">1. Cetak Berita Acara PDF (Landscape A4):</strong>
                <p className="text-red-700 mt-0.5">Memuat logo PLN Services, rekapitulasi 48 slot jam operasi mesin, catatan temuan lapangan, dan blok pengesahan resmi bertanda tangan digital Operator Shift, Supervisor Operasi, dan Manajer Unit.</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900">2. Unduh Spreadsheet Excel (.xlsx Multi-Sheet):</strong>
                <p className="text-emerald-700 mt-0.5">Tersusun rapi dalam 3 lembar kerja (Sheet 1: Ringkasan Beban & Efisiensi SFC Solar, Sheet 2: Matriks Mentah 48-Slot, Sheet 3: Parameter Mesin & Pelumasan).</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "bab-6",
      number: "BAB 6",
      title: "Pengoperasian Logsheet 48-Slot Matrix WACB",
      category: "Operasional",
      summary: "Struktur tabel 48 slot interval 30 menit, input beban kW, ampere, voltase, frekuensi Hz, suhu, dan tekanan oli.",
      image: {
        src: "/docs/images/06_logsheet_matrix_table.png",
        alt: "Tabel Matriks Logsheet 48 Slot 24 Jam",
        caption: "Tabel Matriks Pencatatan Beban Per 30 Menit (48 Baris Data Harian) dengan Validasi Toleransi",
        highlights: [
          { num: 1, label: "Slot Interval 30 Menit", desc: "Pencatatan dimulai dari pukul 00:00 hingga 23:30 WITA secara berurutan." },
          { num: 2, label: "Parameter Listrik Generator", desc: "Beban kW, Ampere (R/S/T), Voltase (RS/ST/TR), Frekuensi (Hz), Cos Phi." },
          { num: 3, label: "Parameter Termal Diesel", desc: "Suhu air radiator, suhu minyak pelumas, dan tekanan oli (min 3.5 Bar)." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Matriks Logsheet WACB adalah lembar kerja inti operator pembangkit. Tabel ini memetakan kondisi mesin selama 24 jam dengan interval 30 menit.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Batas Toleransi Kritis Manufaktur:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Tekanan Oli Pelumas: Normal 3.5 – 5.5 Bar (Alarm jika &lt; 2.5 Bar).</li>
              <li>Suhu Air Pendingin Radiator: Normal 75°C – 88°C (Alarm jika &gt; 95°C).</li>
              <li>Frekuensi Generator: Normal 49.8 – 50.2 Hz (Toleransi batas 49.5 – 50.5 Hz).</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "bab-7",
      number: "BAB 7",
      title: "Manajemen Pemeliharaan (HAR) & Gangguan AMC",
      category: "Pemeliharaan",
      summary: "Pembuatan tiket inspeksi preventif P1-P6, 4 subsistem pemeriksaan mesin, dan alur approval 1-klik SPV.",
      image: {
        src: "/docs/images/07_har_tickets_view.png",
        alt: "Daftar Tiket Pemeliharaan HAR & AMC",
        caption: "Modul Manajemen Tiket Pemeliharaan Mesin Pembangkit dengan Status Approval Berjenjang",
        highlights: [
          { num: 1, label: "Kategori Siklus Servis", desc: "P1 (50 Jam), P2 (250 Jam), P3 (500 Jam), P4 (1000 Jam), s/d Top Overhaul." },
          { num: 2, label: "4 Subsistem Mesin", desc: "Pemeriksaan Pelumasan, Udara & Gas Buang, Pendinginan, dan Elektrikal." },
          { num: 3, label: "Status & Approval", desc: "Alur bertahap: Dibuat -&gt; Diajukan -&gt; Review SPV -&gt; Approved Sah." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Modul HAR memastikan setiap tindakan pemeliharaan mesin terdokumentasi lengkap dengan bukti foto sebelum dan sesudah pengerjaan.
          </p>
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-800">Prosedur 1-Klik Approval Supervisor (SPV):</span>
            <p className="text-slate-600">
              1. Buka tiket laporan berstatus <code>Submitted</code>.<br />
              2. Evaluasi kecocokan nilai jam operasi (HM), tekanan pelumas, dan foto pengerjaan ber-geotag.<br />
              3. Klik tombol hijau <strong>"Setujui & Approve HAR"</strong>. Dokumen Berita Acara langsung terbit sah secara hukum korporat.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "bab-8",
      number: "BAB 8",
      title: "Pusat Integrasi Multi-App (PLN_HAR & WACB)",
      category: "Admin",
      summary: "Monitoring sinkronisasi 3 aplikasi, kesehatan database PostgreSQL pltd_logsheet, dan siaran broadcast data.",
      image: {
        src: "/docs/images/08_admin_integration_hub.png",
        alt: "Admin Pusat Integrasi Multi-App",
        caption: "Hub Integrasi Antar-Aplikasi yang Menghubungkan Web Portal dengan PLN_HAR dan PLN_NUSA_DAYA_APPS",
        highlights: [
          { num: 1, label: "Status Koneksi 3 Aplikasi", desc: "Indikator ONLINE & TERHUBUNG untuk web portal dan dua aplikasi mobile." },
          { num: 2, label: "Statistik Sinkronisasi", desc: "Total ribuan data logsheet dan tiket pemeliharaan yang berhasil disinkronkan." },
          { num: 3, label: "Tombol Broadcast & Pull Sync", desc: "Tarik data antrean offline dan siarkan update konfigurasi serentak ke lapangan." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Halaman <code>http://localhost:3000/admin/integrasi</code> memberikan visibilitas penuh kepada Administrator terhadap aliran data dari teknisi dan operator di lapangan menuju pangkalan data pusat PostgreSQL <code>pltd_logsheet</code>.
          </p>
        </div>
      ),
    },
    {
      id: "bab-9",
      number: "BAB 9",
      title: "Manajemen Rilis & Upload Berkas APK",
      category: "Admin",
      summary: "Unggah APK baru, pengelolaan nomor versi/build, editor changelog, dan pengujian unduhan langsung.",
      image: {
        src: "/docs/images/09_admin_apk_management.png",
        alt: "Pusat Manajemen Rilis & Upload APK",
        caption: "Antarmuka Admin APK Hub dengan Tab Pemilih 2 Aplikasi, Dropzone Upload, dan QR Generator",
        highlights: [
          { num: 1, label: "Tab Switcher 2 Aplikasi", desc: "Pilih Tab 'PLN Logsheet PLTD' atau 'PLN HAR Mesin' untuk rilis terpisah." },
          { num: 2, label: "Drag & Drop Upload Dropzone", desc: "Pilih file .apk dari komputer dengan validasi ukuran dan checksum otomatis." },
          { num: 3, label: "Uji Unduh & Live QR Code", desc: "Tombol test download instan dan QR code otomatis yang diperbarui real-time." },
        ],
      },
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Admin dapat merilis pembaruan aplikasi mobile melalui <code>http://localhost:3000/admin/apk</code>:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
            <li>Pilih tab aplikasi target yang ingin diperbarui (Logsheet atau HAR).</li>
            <li>Seret file binary <code>.apk</code> ke area dropzone.</li>
            <li>Isi nomor versi (misal: <code>v1.0.1</code>), build number, dan changelog rilis.</li>
            <li>Klik tombol <strong>"Unggah & Publikasikan Rilis APK"</strong>. File binary langsung aktif dan siap diunduh oleh seluruh pegawai di beranda publik.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "bab-10",
      number: "BAB 10",
      title: "K3 Zero Accident, FAQ & Bantuan Teknis",
      category: "Dasar",
      summary: "Kepatuhan SOP keselamatan K3 pembangkit, jawaban kendala umum, dan kontak tim IT support 24 jam.",
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              SOP K3 Zero Accident Pembangkit Listrik PLTD:
            </h4>
            <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
              <li><strong>APD Wajib:</strong> Helm pengaman, sepatu safety tahan oli, kacamata pelindung, dan earplug peredam bising (&gt;25 dB).</li>
              <li><strong>Prosedur LOTO:</strong> Pasang gembok pengaman dan rambu bahaya sebelum memeriksa bagian mesin berputar.</li>
              <li><strong>Bahaya Tekanan & Panas:</strong> Dilarang membuka tutup radiator saat suhu &gt;80°C.</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm">Pertanyaan yang Sering Diajukan (FAQ):</h4>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800 mb-1">Q: Mengapa muncul peringatan "File mungkin berbahaya" saat mendownload APK di HP?</p>
              <p className="text-slate-600">A: Itu adalah notifikasi standar Android untuk file yang diunduh langsung dari server lokal/internal PLN. Pilih "Tetap Download" lalu instal berkas secara normal.</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800 mb-1">Q: Apakah data logsheet tetap tersimpan jika internet pembangkit padam?</p>
              <p className="text-slate-600">A: Ya, aplikasi mobile memiliki fitur Offline-First. Data tersimpan di memori ponsel dan otomatis terkirim saat internet kembali menyala.</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Bantuan Teknis IT PLN Services:</span>
              <p className="text-blue-700 mt-0.5">Ext. 4410 / (0542) 887-1234 — Siaga 24 Jam Non-Stop</p>
            </div>
            <Link
              href="/admin/integrasi"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors"
            >
              Buka Hub Integrasi
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                ⚡
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">MANUAL BOOK PORTAL WEB</h1>
                <p className="text-[11px] text-slate-500">PT PLN Services — WACB PLTD & HAR Pembangkit</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/docs/Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf"
              download="Buku Panduan Pengguna - LOGSHEET WEB PLN SERVICES.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
              title="Unduh Buku Panduan Resmi PDF (35 Halaman Edisi Revisi Terbaru 2026)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PDF Resmi</span>
              <span className="sm:hidden">PDF</span>
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
              title="Cetak Halaman Manual"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <a
              href="/#mobile-app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh APK</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner for Manual Book */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-blue-950 print:bg-white print:text-black print:p-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-700/60 border border-blue-500/40 text-blue-200 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>DOKUMEN RESMI PANDUAN PENGGUNA — EDISI 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Buku Panduan Operasional Web & Mobile
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Panduan lengkap langkah-demi-langkah pengoperasian Matriks Logsheet 48-Slot, Manajemen Pemeliharaan Mesin (HAR), Pusat Integrasi Multi-App, dan Unduhan APK Lapangan.
            </p>
          </div>

          <div className="w-full md:w-72 relative print:hidden">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari fitur, topik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 sticky top-20 bg-white border border-slate-200 rounded-xl p-3 shadow-sm print:hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Isi Bab</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {chapters.length} Bab
              </span>
            </div>
            <nav className="space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
              {filteredChapters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveChapter(c.id);
                    const el = document.getElementById(c.id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs font-semibold transition-all flex items-start gap-2 ${
                    activeChapter === c.id
                      ? "bg-blue-50 text-blue-800 border-l-4 border-blue-600 pl-2.5 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 shrink-0">
                    {c.number}
                  </span>
                  <span className="line-clamp-2 leading-snug">{c.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Chapters Content Flow */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-8">
            {filteredChapters.map((chapter) => (
              <section
                key={chapter.id}
                id={chapter.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md"
              >
                {/* Chapter Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    {chapter.number}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {chapter.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  {chapter.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-6 pb-4 border-b border-slate-100">
                  {chapter.summary}
                </p>

                {/* Tutorial Screenshot Card with Numbered Highlights if available */}
                {chapter.image && (
                  <div className="my-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm">
                    <div className="relative group cursor-pointer" onClick={() => setZoomImage({ src: chapter.image!.src, caption: chapter.image!.caption })}>
                      <Image
                        src={chapter.image.src}
                        alt={chapter.image.alt}
                        width={1200}
                        height={675}
                        className="w-full h-auto object-cover border-b border-slate-200"
                      />
                      <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur text-blue-900 text-xs font-bold rounded-lg shadow flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5" /> Klik untuk Perbesar Gambar
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          {chapter.image.caption}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">Tampilan Resolusi Tinggi</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                        {chapter.image.highlights.map((hl) => (
                          <div key={hl.num} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex items-center gap-1.5 mb-1 font-bold text-blue-700">
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                {hl.num}
                              </span>
                              <span>{hl.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-normal">{hl.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chapter Deep Content */}
                <div className="pt-2">{chapter.content}</div>
              </section>
            ))}
          </main>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800">{zoomImage.caption}</span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 max-h-[80vh] overflow-auto">
              <Image
                src={zoomImage.src}
                alt={zoomImage.caption}
                width={1600}
                height={900}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
