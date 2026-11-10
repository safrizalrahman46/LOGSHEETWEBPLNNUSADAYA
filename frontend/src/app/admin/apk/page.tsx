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
  Layers,
  Wrench,
  Sparkles,
} from "lucide-react";
import axios from "axios";

interface ApkItem {
  id: string;
  targetRole: string;
  roleBadge: string;
  appName: string;
  badgeColor: string;
  badgeBg: string;
  themeGradient: string;
  shortDesc: string;
  version: string;
  fileSize: string;
  fileSizeBytes: number;
  fileName: string;
  fileUrl: string;
  downloadApiUrl?: string;
  minAndroid: string;
  releaseDate: string;
  features: string[];
}

interface ApkReleaseData {
  appName: string;
  packageName: string;
  version: string;
  buildNumber: string;
  fileUrl: string;
  downloadApiUrl?: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  releaseDate: string;
  minAndroid: string;
  isActive: boolean;
  developer: string;
  changelog: string[];
  downloadCount: number;
  apkList: ApkItem[];
}

export default function AdminApkPage() {
  const [data, setData] = useState<ApkReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState<string>("");

  // Target app selector: "logsheet" | "har"
  const [targetApk, setTargetApk] = useState<"logsheet" | "har">("logsheet");

  // Form states
  const [appName, setAppName] = useState("PLN Logsheet & Operasional PLTD");
  const [version, setVersion] = useState("v1.0.0");
  const [buildNumber, setBuildNumber] = useState("1");
  const [minAndroid, setMinAndroid] = useState("Android 8.0 (Oreo) ke atas");
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
        
        // Populate inputs based on selected target
        const currentTarget = item.apkList?.find((a) => a.id === targetApk);
        if (currentTarget) {
          setAppName(currentTarget.appName);
          setVersion(currentTarget.version);
        } else {
          setAppName(item.appName);
          setVersion(item.version);
        }
        setBuildNumber(item.buildNumber || "1");
        setMinAndroid(currentTarget?.minAndroid || item.minAndroid || "Android 8.0+");
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
  }, [targetApk]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".apk")) {
        setErrorMsg("Harap pilih berkas dengan ekstensi .apk");
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
      formData.append("targetApk", targetApk);
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
        setSuccessMsg(`Berkas APK ${selectedFile.name} berhasil di-upload dan siap diunduh!`);
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
        targetApk,
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

  const copyUrl = (key: string, url: string) => {
    const full = window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const currentApkItem = data?.apkList?.find((a) => a.id === targetApk);
  const activeFileUrl = currentApkItem?.fileUrl || (targetApk === "har" ? "/downloads/apk/pln-har-mobile-v1.0.0.apk" : "/downloads/apk/pln-logsheet-mobile-v1.0.0.apk");
  const directDownloadApiUrl = `/api/apk/download?type=${targetApk}`;
  const fullDownloadUrl = typeof window !== "undefined" ? window.location.origin + directDownloadApiUrl : "";
  const qrCodeUrl = fullDownloadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fullDownloadUrl)}&bgcolor=ffffff&color=004581&qzone=2`
    : "";

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <AppLayout>
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#004581] to-slate-900 p-6 text-white shadow-md sm:p-7">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                    <Smartphone className="h-3.5 w-3.5" />
                    Distribusi Aplikasi Android Resmi
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                    WACB DIGIKIT &amp; HAR Mobile Hub
                  </span>
                  <span className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                    Direct Download Ready
                  </span>
                </div>
                <h1 className="mt-2.5 text-2xl font-black tracking-tight sm:text-3xl">
                  Pusat Upload &amp; Distribusi APK Mobile
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                  Upload file paket instalasi Android (.apk) resmi untuk <strong>Operator PLTD (Logsheet 48-Slot)</strong> dan <strong>Tim Pemeliharaan (HAR &amp; AMC)</strong>. Berkas yang di-upload langsung dapat diunduh oleh petugas melalui web atau pemindaian QR Code.
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs transition-colors hover:bg-slate-100 active:scale-98 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2 Apps Switcher Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* App 1: Logsheet Operator */}
            <div
              onClick={() => setTargetApk("logsheet")}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all shadow-xs ${
                targetApk === "logsheet"
                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-800">
                  Khusus Operator PLTD
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${targetApk === "logsheet" ? "bg-blue-600" : "bg-gray-300"}`} />
              </div>
              <h3 className="mt-2 text-sm font-black text-gray-900">
                1. PLN Logsheet PLTD (WACB Mobile)
              </h3>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                Pencatatan beban mesin per jam (48 interval slot), parameter kritis, dan presensi geofencing.
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-100 pt-2 font-mono">
                <span>Versi: <strong>{data?.apkList?.[0]?.version || "v1.0.0"}</strong></span>
                <span>Ukuran: <strong>{data?.apkList?.[0]?.fileSize || "64.3 MB"}</strong></span>
              </div>
            </div>

            {/* App 2: HAR Pemeliharaan */}
            <div
              onClick={() => setTargetApk("har")}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all shadow-xs ${
                targetApk === "har"
                  ? "border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20"
                  : "border-gray-200 bg-white hover:border-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                  Khusus Tim HAR / Teknisi
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${targetApk === "har" ? "bg-amber-600" : "bg-gray-300"}`} />
              </div>
              <h3 className="mt-2 text-sm font-black text-gray-900">
                2. PLN HAR Mesin &amp; AMC
              </h3>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                Job cards pemeliharaan P1-P6, form checklist teknisi, pelaporan gangguan AMC, dan approval SPV.
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-100 pt-2 font-mono">
                <span>Versi: <strong>{data?.apkList?.[1]?.version || "v1.0.0"}</strong></span>
                <span>Ukuran: <strong>{data?.apkList?.[1]?.fileSize || "47.2 MB"}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Target Rilis</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Check className="h-3 w-3" /> Ready
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-black text-gray-900 truncate">
                  {targetApk === "logsheet" ? "Logsheet PLTD" : "PLN HAR Mesin"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 truncate font-mono">
                {currentApkItem?.fileName || (targetApk === "har" ? "pln-har-mobile-v1.0.0.apk" : "pln-logsheet-mobile-v1.0.0.apk")}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Ukuran Berkas</span>
                <HardDrive className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-gray-900">
                  {currentApkItem?.fileSize || (targetApk === "har" ? "47.2 MB" : "64.3 MB")}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{minAndroid}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Tanggal Rilis</span>
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-xl font-black text-gray-900">{currentApkItem?.releaseDate || "Terbaru"}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Rilis Resmi PT PLN Services</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Unduhan</span>
                <Download className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-gray-900">{data?.downloadCount || 286}</span>
              </div>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">Tautan Langsung Terverifikasi</p>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Column Left: Upload APK Form & Metadata Editor (7 cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Form Upload File APK Baru */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Upload Berkas APK Baru ({targetApk === "logsheet" ? "Logsheet Mobile" : "HAR Mobile"})
                    </h2>
                    <p className="text-xs text-gray-500">
                      Pilih berkas build .apk Android dari komputer untuk diperbarui dan langsung dapat diunduh
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadNewApk} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Pilih File APK Android (.apk)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                        selectedFile
                          ? "border-emerald-400 bg-emerald-50/50"
                          : "border-gray-300 hover:border-blue-500 bg-gray-50/60"
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
                          <p className="text-sm font-bold text-emerald-700">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap di-upload untuk {targetApk === "logsheet" ? "Aplikasi Logsheet" : "Aplikasi HAR"}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700">
                            Klik di sini untuk memilih berkas .apk dari perangkat
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Format didukung: .apk (Maksimal 150 MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Nama Aplikasi
                      </label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                        placeholder="Nama aplikasi mobile"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Nomor Versi Rilis
                      </label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                        placeholder="Contoh: v1.0.0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      Disimpan ke: <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">/public/downloads/apk/</code>
                    </span>
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 active:scale-98 disabled:opacity-50"
                    >
                      <Upload className={`h-4 w-4 ${uploading ? "animate-bounce" : ""}`} />
                      {uploading ? "Sedang Mengupload..." : "Upload & Publikasikan APK"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Form Metadata & Changelog Editor */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Pengaturan Catatan Rilis &amp; Fitur</h2>
                      <p className="text-xs text-gray-500">Deskripsi poin pembaruan aplikasi untuk pengguna</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700">Tampilkan di Landing:</span>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Build Number / Code
                      </label>
                      <input
                        type="text"
                        value={buildNumber}
                        onChange={(e) => setBuildNumber(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                        placeholder="Contoh: 1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Persyaratan Minimum Android
                      </label>
                      <input
                        type="text"
                        value={minAndroid}
                        onChange={(e) => setMinAndroid(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                        placeholder="Contoh: Android 8.0 (Oreo) ke atas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Catatan Pembaruan (Changelog) — 1 Baris per Poin
                    </label>
                    <textarea
                      rows={4}
                      value={changelogText}
                      onChange={(e) => setChangelogText(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 shadow-xs focus:border-blue-500 focus:outline-hidden leading-relaxed font-mono"
                      placeholder="Masukkan poin pembaruan, satu per baris..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveMetadata}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-purple-700 active:scale-98 disabled:opacity-50"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                      {saving ? "Menyimpan..." : "Simpan Metadata Rilis"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Right: Live Download Test & QR Code Distribution (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Card Pratinjau Tampilan Unduhan Langsung */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Uji Unduh Berkas APK</h2>
                    <p className="text-xs text-gray-500">Klik tombol di bawah untuk menguji download langsung berkas APK</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Mockup Card with Direct Download Action */}
                  <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 p-5 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md ${
                          targetApk === "har"
                            ? "bg-gradient-to-tr from-amber-600 to-amber-500"
                            : "bg-gradient-to-tr from-[#004581] to-[#0284c7]"
                        }`}>
                          {targetApk === "har" ? <Wrench className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-900">
                            {appName}
                          </h3>
                          <span className="inline-block mt-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10.5px] font-bold text-blue-800">
                            Versi {version}
                          </span>
                        </div>
                      </div>

                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                        Official APK
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Ukuran Berkas:</span>
                        <strong className="text-gray-800 font-mono">
                          {currentApkItem?.fileSize || (targetApk === "har" ? "47.2 MB" : "64.3 MB")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Kompatibilitas:</span>
                        <strong className="text-gray-800">{minAndroid}</strong>
                      </div>
                    </div>

                    {/* Direct Download Button (triggers real file download) */}
                    <div className="mt-4 space-y-2">
                      <a
                        href={directDownloadApiUrl}
                        download
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black text-white shadow-sm transition-all hover:shadow-md hover:brightness-105 active:scale-98 ${
                          targetApk === "har"
                            ? "bg-gradient-to-r from-amber-600 to-amber-700"
                            : "bg-gradient-to-r from-[#0284c7] to-[#004581]"
                        }`}
                      >
                        <Download className="h-4 w-4" />
                        <span>Unduh {targetApk === "har" ? "APK HAR" : "APK Logsheet"} Sekarang</span>
                      </a>

                      <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                        <span className="text-gray-500 truncate font-mono">
                          {currentApkItem?.fileName || (targetApk === "har" ? "pln-har-mobile-v1.0.0.apk" : "pln-logsheet-mobile-v1.0.0.apk")}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyUrl(targetApk, directDownloadApiUrl)}
                          className="shrink-0 font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {copiedKey === targetApk ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copiedKey === targetApk ? "Tersalin!" : "Salin Link"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <QrCode className="h-4 w-4 text-blue-600" />
                      Scan QR Code Dari Ponsel Android
                    </span>
                    <p className="text-[11.5px] text-gray-500 mt-1">
                      Arahkan kamera smartphone Android untuk langsung mengunduh file APK ke perangkat
                    </p>

                    <div className="mt-3 inline-block rounded-xl bg-white p-2.5 shadow-xs border border-gray-200">
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
                        className="w-full max-w-[260px] rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600 font-mono select-all"
                      />
                      <button
                        onClick={() => copyUrl("qr", directDownloadApiUrl)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-300"
                        title="Salin Link"
                      >
                        {copiedKey === "qr" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey === "qr" ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>

                  {/* Field Operator Guide */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Info className="h-3.5 w-3.5 text-amber-600" />
                      Petunjuk untuk Operator / Teknisi:
                    </p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-[11.5px] leading-relaxed">
                      <li>Buka file APK yang telah diunduh di aplikasi File Manager HP.</li>
                      <li>Jika muncul konfirmasi keamanan, pilih <em>&quot;Izinkan penginstalan dari sumber ini&quot;</em>.</li>
                      <li>Selesaikan proses instalasi dan login dengan kredensial WACB PLN Services.</li>
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
