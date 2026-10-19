"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import {
  Smartphone,
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  FileText,
  AlertCircle,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Info,
  Calendar,
  HardDrive,
  Eye,
  Sliders,
  Send,
} from "lucide-react";
import axios from "axios";

interface ApkReleaseData {
  appName: string;
  packageName: string;
  version: string;
  buildNumber: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  releaseDate: string;
  minAndroid: string;
  isActive: boolean;
  developer: string;
  changelog: string[];
  downloadCount: number;
}

export default function AdminApkPage() {
  const [data, setData] = useState<ApkReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Form states
  const [appName, setAppName] = useState("");
  const [version, setVersion] = useState("");
  const [buildNumber, setBuildNumber] = useState("");
  const [minAndroid, setMinAndroid] = useState("");
  const [changelogText, setChangelogText] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchApkData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/apk");
      if (res.data?.success && res.data?.data) {
        const item: ApkReleaseData = res.data.data;
        setData(item);
        setAppName(item.appName);
        setVersion(item.version);
        setBuildNumber(item.buildNumber);
        setMinAndroid(item.minAndroid);
        setChangelogText((item.changelog || []).join("\n"));
        setIsActive(item.isActive !== false);
      }
    } catch {
      setErrorMsg("Gagal memuat informasi rilis APK");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApkData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".apk")) {
        setErrorMsg("Harap pilih file dengan ekstensi .apk");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleUploadNewApk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Pilih file APK terlebih dahulu untuk di-upload");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("apkFile", selectedFile);
      formData.append("appName", appName);
      formData.append("version", version);
      formData.append("buildNumber", buildNumber);
      formData.append("minAndroid", minAndroid);
      formData.append("changelog", changelogText);
      formData.append("isActive", String(isActive));

      const res = await axios.post("/api/apk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setSuccessMsg(`File APK ${selectedFile.name} berhasil di-upload dan dipublikasikan!`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchApkData();
      } else {
        setErrorMsg(res.data?.message || "Upload gagal");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Gagal mengupload APK");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMetadata = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const changelog = changelogText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await axios.post("/api/apk", {
        appName,
        version,
        buildNumber,
        minAndroid,
        changelog,
        isActive,
      });

      if (res.data?.success) {
        setSuccessMsg("Metadata rilis berhasil diperbarui!");
        await fetchApkData();
      } else {
        setErrorMsg(res.data?.message || "Gagal menyimpan");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Gagal menyimpan metadata");
    } finally {
      setSaving(false);
    }
  };

  const copyDownloadUrl = () => {
    if (!data?.fileUrl) return;
    const fullUrl = window.location.origin + data.fileUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullDownloadUrl = typeof window !== "undefined" && data?.fileUrl ? window.location.origin + data.fileUrl : "";
  const qrCodeUrl = fullDownloadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullDownloadUrl)}&bgcolor=ffffff&color=0f172a&qzone=2`
    : "";

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <AppLayout>
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#004581] to-slate-900 p-6 text-white shadow-theme-md sm:p-7">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                    <Smartphone className="h-3.5 w-3.5" />
                    Distribusi Aplikasi Android Resmi
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                    PLN Nusa Daya Mobile App Hub
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Rilis &amp; Upload APK Mobile
                </h1>
                <p className="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">
                  Kelola file paket instalasi Android (.apk) resmi dari tim developer, perbarui nomor versi, catatan rilis, dan pantau ketersediaan unduhan di Halaman Landing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/#mobile-app"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20 active:scale-98"
                >
                  <Eye className="h-4 w-4" />
                  Lihat di Landing Page
                </Link>
                <button
                  onClick={fetchApkData}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-theme-xs transition-colors hover:bg-slate-100 active:scale-98 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Versi Aktif</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Check className="h-3 w-3" /> Published
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{data?.version || "v1.0.0"}</span>
                <span className="text-xs font-semibold text-gray-400">Build #{data?.buildNumber || "1"}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{data?.fileName || "pln-nusadaya-mobile.apk"}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Ukuran File</span>
                <HardDrive className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{data?.fileSize || "64.3 MB"}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{data?.minAndroid || "Android 8.0+"}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Tanggal Rilis</span>
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-xl font-black text-gray-900 dark:text-white">{data?.releaseDate || "Terbaru"}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rilis Resmi Korporat</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Total Unduhan</span>
                <Download className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{data?.downloadCount || 142}</span>
              </div>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Tautan Aktif</p>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Column Left: Upload APK Form & Metadata Editor (7 cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Form Upload File APK Baru */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-500 dark:bg-brand-500/15">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Upload File APK Baru</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pilih file build .apk Android dari folder build Flutter</p>
                  </div>
                </div>

                <form onSubmit={handleUploadNewApk} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Pilih File APK (.apk)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                        selectedFile
                          ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20"
                          : "border-gray-300 hover:border-brand-500 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-800/40"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".apk,application/vnd.android.package-archive"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Smartphone className={`h-10 w-10 ${selectedFile ? "text-emerald-600" : "text-gray-400"}`} />
                      {selectedFile ? (
                        <div className="mt-3">
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap di-upload
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Klik untuk memilih file APK atau seret ke sini
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Contoh: app-release.apk (Maks. 150 MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      File akan disimpan ke <code className="text-[11px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">/public/downloads/apk/</code>
                    </span>
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
                    >
                      <Upload className={`h-4 w-4 ${uploading ? "animate-bounce" : ""}`} />
                      {uploading ? "Sedang Mengupload..." : "Upload & Publikasikan APK"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Form Metadata & Changelog Editor */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">Pengaturan &amp; Catatan Rilis</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Konfigurasi informasi yang tampil di halaman landing</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tampilkan di Landing:</span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                  </label>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Nama Aplikasi
                      </label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        placeholder="Contoh: PLN Nusa Daya Mobile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Nomor Versi
                      </label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        placeholder="Contoh: v1.0.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Build Number / Code
                      </label>
                      <input
                        type="text"
                        value={buildNumber}
                        onChange={(e) => setBuildNumber(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        placeholder="Contoh: 1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Persyaratan Minimum Android
                      </label>
                      <input
                        type="text"
                        value={minAndroid}
                        onChange={(e) => setMinAndroid(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        placeholder="Contoh: Android 8.0 (Oreo) ke atas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Catatan Pembaruan (Changelog) — 1 Baris per Poin
                    </label>
                    <textarea
                      rows={4}
                      value={changelogText}
                      onChange={(e) => setChangelogText(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 leading-relaxed font-mono"
                      placeholder="Masukkan poin pembaruan, satu per baris..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveMetadata}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-purple-700 active:scale-98 disabled:opacity-50"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                      {saving ? "Menyimpan..." : "Simpan Metadata Rilis"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Right: Live Preview & QR Code Distribution (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Card Pratinjau Tampilan Unduhan */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Pratinjau Unduhan Publik</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tampilan dan link unduhan resmi untuk petugas</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Mockup Card */}
                  <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 p-5 dark:border-gray-800 dark:from-gray-800/60 dark:via-gray-900 dark:to-gray-800/40 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004581] to-[#0284c7] text-white shadow-md">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{data?.appName || appName}</h3>
                          <span className="inline-block mt-0.5 rounded-full bg-sky-100 px-2 py-0.5 text-[10.5px] font-bold text-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                            Versi {data?.version || version}
                          </span>
                        </div>
                      </div>

                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Official APK
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3 dark:border-gray-800">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Ukuran File:</span>
                        <strong className="text-gray-700 dark:text-gray-200">{data?.fileSize || "64.3 MB"}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Sistem Operasi:</span>
                        <strong className="text-gray-700 dark:text-gray-200">{data?.minAndroid || "Android 8.0+"}</strong>
                      </div>
                    </div>

                    <div className="mt-4">
                      <a
                        href={data?.fileUrl || "#"}
                        download
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#004581] py-3 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-98"
                      >
                        <Download className="h-4 w-4" />
                        Unduh APK Langsung
                      </a>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-800/40">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <QrCode className="h-4 w-4 text-brand-500" />
                      Scan QR Code Dari Ponsel
                    </span>
                    <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-1">
                      Arahkan kamera HP Android untuk langsung mengunduh file APK ke perangkat
                    </p>

                    <div className="mt-3 inline-block rounded-xl bg-white p-2.5 shadow-sm border border-gray-200 dark:border-gray-700">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code Download APK"
                          className="h-36 w-36 object-contain"
                        />
                      ) : (
                        <div className="flex h-36 w-36 items-center justify-center text-xs text-gray-400">
                          Membuat QR...
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={fullDownloadUrl}
                        className="w-full max-w-[260px] rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600 font-mono select-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      />
                      <button
                        onClick={copyDownloadUrl}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                        title="Salin Link"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>

                  {/* Field Operator Guide */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Info className="h-3.5 w-3.5 text-amber-600" />
                      Petunjuk untuk Teknisi / Operator Lapangan:
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-[11.5px] leading-relaxed">
                      <li>Buka file yang telah diunduh di aplikasi File Manager HP.</li>
                      <li>Jika muncul peringatan keamanan, pilih <em>&quot;Izinkan dari sumber ini&quot;</em>.</li>
                      <li>Lanjutkan instalasi dan login dengan akun WACB / PLN Nusa Daya.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
