"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  CloudUpload,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  Eye,
  MapPin,
  Camera,
  Trash2,
  Crosshair,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  FileText,
  X,
  Building2,
  ChevronDown,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { MachineForm } from "@/components/logsheet/MachineForm";
import { CameraCaptureModal } from "@/components/logsheet/CameraCaptureModal";
import { apiClient } from "@/lib/api";
import { saveOfflineDraft } from "@/db/offlineDb";
import { useNetwork } from "@/hooks/useNetwork";
import { fileToDataUrl } from "@/lib/media";
import {
  WACBFormatResponse,
  MachineFormEntry,
  BatchLogsheetRequest,
  LogsheetHistoryItem,
  WACBUnitItem,
} from "@/types";

// Standard 41 PLTD Units Kalimantan 3 (Sesuai Data Kinerja Real)
const DEFAULT_PLTD_UNITS: WACBUnitItem[] = [
  { kd_unit: "0264", nama_unit: "ULD BATU AMPAR", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0265", nama_unit: "ULD BIDUK-BIDUK", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0266", nama_unit: "ULD DATAH BILANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0267", nama_unit: "ULD DILANG PUTI", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0268", nama_unit: "ULD GEMAR BARU", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0269", nama_unit: "ULD JANTUR", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0270", nama_unit: "ULD KARANGAN DALAM", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0271", nama_unit: "ULD KAYAN HULU", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0272", nama_unit: "ULD KELAY", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0273", nama_unit: "ULD KELUMPANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0274", nama_unit: "ULD KRAYAN", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0275", nama_unit: "ULD LONG APARI", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0276", nama_unit: "ULD LONG LAYU", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0277", nama_unit: "ULD LONG PAHANGAI", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0278", nama_unit: "ULD LONG PESO", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0279", nama_unit: "ULD LONG SEGAR", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0280", nama_unit: "ULD LUMBIS OGONG", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0281", nama_unit: "ULD MARATUA", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0282", nama_unit: "ULD MERASA", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0283", nama_unit: "ULD MUARA PAHU", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0284", nama_unit: "ULD MUARA PANTUAN", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0285", nama_unit: "ULD MUARA SIRAN", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0286", nama_unit: "ULD DERAWAN", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0287", nama_unit: "ULD PA UPAN", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0288", nama_unit: "ULD PENYINGGAHAN", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0289", nama_unit: "ULD SEDULANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0290", nama_unit: "ULD SEI MENGGARIS", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0291", nama_unit: "ULD MUARA KEDANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0292", nama_unit: "ULD SENYIUR", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0293", nama_unit: "ULD TABANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0294", nama_unit: "ULD TANAH MERAH", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0295", nama_unit: "ULD PENGANDAN", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0296", nama_unit: "ULD LABANG", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0297", nama_unit: "ULD MUARA PANTUN", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0298", nama_unit: "ULD SEKATAK BUJI", kd_region: "05", kd_area: "40", nama_area: "AREA KALTARA" },
  { kd_unit: "0299", nama_unit: "ULD SEMAYANG", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0300", nama_unit: "ULD TABISAQ", kd_region: "05", kd_area: "40", nama_area: "AREA SAMARINDA" },
  { kd_unit: "0301", nama_unit: "ULD TANJUNG BATU", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "0934", nama_unit: "ULD SANDARAN", kd_region: "05", kd_area: "40", nama_area: "SITE BONTANG" },
  { kd_unit: "0935", nama_unit: "PLTD TAU LUMBIS", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
  { kd_unit: "1168", nama_unit: "PLTD SUNGAI BOH", kd_region: "05", kd_area: "40", nama_area: "SITE BERAU" },
];

// Kotak foto seperti versi mobile (Absen Petugas / Foto Mesin)
function PhotoBox({
  title,
  note,
  value,
  onOpenCamera,
  onPick,
  onClear,
}: {
  title: string;
  note: string;
  value: string;
  onOpenCamera: () => void;
  onPick: (file?: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const canUseLiveCamera =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    (typeof window === "undefined" || window.isSecureContext);

  const handleCameraClick = () => {
    if (canUseLiveCamera) onOpenCamera();
    else inputRef.current?.click();
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{title}</p>
      <p className="mt-1 text-[11px] font-medium leading-snug text-gray-500 dark:text-gray-400">{note}</p>

      <div className="mt-2 aspect-[1.2] w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-brand-50/50 dark:bg-brand-500/5">
            <Camera className="h-8 w-8 text-brand-500/70" />
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">Belum ada foto</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCameraClick}
          className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
            value
              ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Camera className="h-3.5 w-3.5" />
            {value ? "Ulangi Foto" : "Ambil Foto"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Galeri
        </button>
        {value && (
          <button
            type="button"
            onClick={onClear}
            title="Hapus foto"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-error-500 hover:bg-error-50 dark:border-gray-700 dark:bg-gray-900 dark:text-error-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Daftar logsheet (default tampilan halaman)
const SYNC_STYLES: Record<string, string> = {
  SYNCED: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
  PENDING: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
  FAILED: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
};

function LogsheetList({ onAdd, refreshToken }: { onAdd: () => void; refreshToken: number }) {
  const [records, setRecords] = useState<LogsheetHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [detail, setDetail] = useState<LogsheetHistoryItem | null>(null);
  const [serverStats, setServerStats] = useState<{ total: number; today: number; pending: number } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: LogsheetHistoryItem[];
        total_count?: number;
        today_count?: number;
        pending_count?: number;
      }>("/wacb/history?limit=500");
      setRecords(res.data?.data || []);
      if (res.data?.total_count !== undefined) {
        setServerStats({
          total: res.data.total_count,
          today: res.data.today_count ?? 0,
          pending: res.data.pending_count ?? 0,
        });
      }
    } catch {
      setError("Gagal memuat daftar logsheet. Tekan tombol muat ulang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? records.filter((r) =>
        [r.nama_unit, r.kd_unit, r.operator_name, r.tanggal, r.jam, r.status_mesin_summary]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : records;

  const today = new Date().toISOString().substring(0, 10);
  const fallbackTodayCount = records.filter((r) => r.tanggal === today).length;
  const fallbackPendingCount = records.filter((r) => r.sync_status !== "SYNCED").length;

  const totalDisplay = serverStats ? serverStats.total : records.length;
  const todayDisplay = serverStats ? serverStats.today : fallbackTodayCount;
  const pendingDisplay = serverStats ? serverStats.pending : fallbackPendingCount;

  const chips = [
    { label: "Total Logsheet", value: totalDisplay, tone: "text-gray-900 dark:text-white" },
    { label: "Hari Ini", value: todayDisplay, tone: "text-brand-600 dark:text-brand-400" },
    { label: "Belum Sinkron", value: pendingDisplay, tone: "text-warning-600 dark:text-warning-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Header + Aksi */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Daftar Logsheet
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Riwayat logsheet yang sudah dikirim ke WACB DIGIKIT. Tekan{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">Tambah Logsheet</span>{" "}
              untuk mengisi laporan baru.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
              title="Muat ulang"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Logsheet</span>
            </button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {chips.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {c.label}
              </p>
              <p className={`mt-1 text-lg font-extrabold ${c.tone}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Pencarian */}
        <div className="mt-4 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari unit, operator, tanggal, atau status..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3.5 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
            <p className="text-xs font-semibold text-gray-400">Memuat daftar logsheet...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-xs font-semibold text-error-500">{error}</p>
            <button
              type="button"
              onClick={fetchHistory}
              className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
            >
              Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {records.length === 0 ? "Belum ada logsheet" : "Tidak ada data yang cocok"}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {records.length === 0
                  ? "Mulai isi laporan pertama Anda."
                  : "Coba ubah kata kunci pencarian."}
              </p>
            </div>
            {records.length === 0 && (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> Tambah Logsheet
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:text-gray-500">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jam</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3 text-center">Mesin</th>
                  <th className="px-4 py-3">Rangkuman Status</th>
                  <th className="px-4 py-3 text-center">GPS</th>
                  <th className="px-4 py-3 text-center">Sinkron</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    onClick={() => setDetail(r)}
                    className="cursor-pointer border-b border-gray-100 transition-colors last:border-b-0 hover:bg-brand-50/50 dark:border-gray-800/70 dark:hover:bg-brand-500/5"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                      {r.tanggal}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-700 dark:text-gray-300">
                      {r.jam}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 dark:text-white">{r.nama_unit}</p>
                      <p className="text-[10px] font-semibold text-gray-400">ID {r.kd_unit}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {r.operator_name}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-gray-800 dark:text-gray-200">
                      {r.machine_count}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      {r.status_mesin_summary || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.location_lat || r.location_lng ? (
                        <span title="Lokasi GPS tercatat">
                          <MapPin className="inline h-4 w-4 text-success-500" />
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-extrabold ${
                          SYNC_STYLES[r.sync_status] || SYNC_STYLES.SYNCED
                        }`}
                      >
                        {r.sync_status || "SYNCED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        title="Lihat detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetail(r);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detail */}
      {detail && (
        <div
          className="fixed inset-0 z-[9400] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Detail Logsheet
                </h3>
                <p className="text-xs font-semibold text-gray-400">
                  {detail.tanggal} • {detail.jam} WITA • {detail.nama_unit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                <dt className="text-[10px] font-bold uppercase text-gray-400">Operator</dt>
                <dd className="mt-0.5 font-bold text-gray-800 dark:text-gray-200">
                  {detail.operator_name}
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                <dt className="text-[10px] font-bold uppercase text-gray-400">Jumlah Mesin</dt>
                <dd className="mt-0.5 font-bold text-gray-800 dark:text-gray-200">
                  {detail.machine_count} mesin
                </dd>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
                <dt className="text-[10px] font-bold uppercase text-gray-400">Status WACB</dt>
                <dd className="mt-0.5 font-bold text-gray-800 dark:text-gray-200">
                  {detail.sync_status || "SYNCED"}
                  {detail.wacb_id ? ` (ID ${detail.wacb_id})` : ""}
                </dd>
              </div>
            </dl>

            {detail.status_mesin_summary && (
              <p className="mt-3 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2.5 text-xs font-bold text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                {detail.status_mesin_summary}
              </p>
            )}

            {!!(detail.location_lat || detail.location_lng) && (
              <p className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {detail.location_lat.toFixed(6)}, {detail.location_lng.toFixed(6)} (±
                {Math.round(detail.location_accuracy || 0)} m)
              </p>
            )}

            {(detail.selfie_url || detail.foto_mesin_url) && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {detail.selfie_url && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                      Absen Petugas
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detail.selfie_url}
                      alt="Absen petugas"
                      className="h-36 w-full rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                    />
                  </div>
                )}
                {detail.foto_mesin_url && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">Foto Mesin</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detail.foto_mesin_url}
                      alt="Foto mesin"
                      className="h-36 w-full rounded-xl border border-gray-200 object-cover dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            )}

            {detail.message_text && (
              <div className="mt-3">
                <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                  Pesan WACB (message_text)
                </p>
                <pre className="max-h-56 overflow-auto rounded-xl bg-gray-950 p-3.5 text-[11px] leading-relaxed text-gray-300">
                  {detail.message_text}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InputLogsheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnline } = useNetwork();

  // Unit List State (all 30 units available)
  const [unitsList, setUnitsList] = useState<WACBUnitItem[]>(DEFAULT_PLTD_UNITS);

  // Unit State
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string; kd_area?: string; nama_area?: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
    kd_area: "40",
    nama_area: "SITE BONTANG",
  });

  // Form Header State
  const [tanggal, setTanggal] = useState<string>(
    searchParams.get("tanggal") || new Date().toISOString().substring(0, 10)
  );

  const defaultJam = () => {
    const paramJam = searchParams.get("jam");
    if (paramJam) return paramJam;
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() < 30 ? "00" : "30"}`;
  };

  const [jam, setJam] = useState<string>(defaultJam());
  const [operatorName, setOperatorName] = useState<string>("Operator Shift");

  // Machines State
  const [machines, setMachines] = useState<MachineFormEntry[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loadingFormat, setLoadingFormat] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tampilan halaman: form langsung jika dipanggil dengan param add=1 atau dibuka dari operator
  const [view, setView] = useState<"list" | "form">(
    searchParams.get("add") ? "form" : "list"
  );
  const [refreshToken, setRefreshToken] = useState<number>(0);

  // Lampiran seperti versi mobile: absen petugas, foto mesin, dan lokasi GPS
  const [selfie, setSelfie] = useState<string>("");
  const [fotoMesin, setFotoMesin] = useState<string>("");
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>("");

  // Kamera live (getUserMedia) untuk absen petugas & foto mesin
  const [cameraTarget, setCameraTarget] = useState<"selfie" | "mesin" | null>(null);

  // Generate 48 Slots
  const timeSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  // Fetch Machines Format for a specific unit
  const fetchFormatForUnit = useCallback(async (targetUnit: { kd_unit: string; nama_unit: string; kd_area?: string }) => {
    setLoadingFormat(true);
    try {
      const queryParams: Record<string, string> = {
        kd_region: "05",
        kd_unit: targetUnit.kd_unit,
      };
      if (targetUnit.kd_area && targetUnit.kd_area !== "40" && targetUnit.kd_area !== "ALL") {
        queryParams.kd_area = targetUnit.kd_area;
      }
      const res = await apiClient.get<WACBFormatResponse>("/wacb/format", {
        params: queryParams,
      });

      let machinesData = res.data?.format?.mesin;
      if (!machinesData || machinesData.length === 0) {
        const uName = targetUnit.nama_unit || "PLTD Unit";
        machinesData = [
          {
            nomor: 1,
            id_mesin: `${targetUnit.kd_unit}01`,
            nama_mesin: `${uName} #01 (CATERPILLAR 3512B)`,
            kode_mesin_silm: `225551403${targetUnit.kd_unit}1`,
            sn: `CAT-${targetUnit.kd_unit}-01`,
            dt: 1000,
            kd_jenis_bahan_bakar: "B35",
          },
          {
            nomor: 2,
            id_mesin: `${targetUnit.kd_unit}02`,
            nama_mesin: `${uName} #02 (DEUTZ TBD 620)`,
            kode_mesin_silm: `225551403${targetUnit.kd_unit}2`,
            sn: `DEU-${targetUnit.kd_unit}-02`,
            dt: 800,
            kd_jenis_bahan_bakar: "B35",
          },
        ];
      }

      const list: MachineFormEntry[] = machinesData.map((m, idx) => {
        let initialStatus: "OPERASI" | "STANDBY" | "GANGGUAN" = "OPERASI";
        let initialKet = "Beroperasi Normal";
        if (m.status_mesin) {
          const sm = m.status_mesin.toUpperCase();
          if (sm.includes("STANDBY")) {
            initialStatus = "STANDBY";
            initialKet = "Mesin Siaga / Standby";
          } else if (sm.includes("GANGGUAN") || sm.includes("RUSAK") || sm.includes("PEMELIHARAAN")) {
            initialStatus = "GANGGUAN";
            initialKet = "Gangguan / Pemeliharaan";
          } else {
            initialStatus = "OPERASI";
            initialKet = "Beroperasi Normal";
          }
        }
        const isOp = initialStatus === "OPERASI";
        const cap = m.dt > 0 ? m.dt : 1000;
        return {
          nomor: m.nomor || idx + 1,
          id_mesin: m.id_mesin || `${targetUnit.kd_unit}0${idx + 1}`,
          nama_mesin: m.nama_mesin,
          kode_mesin_silm: m.kode_mesin_silm || "",
          sn: m.sn || "",
          dt: cap,
          daya_mampu: String(cap),
          status_mesin: initialStatus,
          beban: isOp ? Math.min(cap, Math.round(cap * 0.7)) : 0,
          stand_kwh: 12450.5 + idx * 100,
          stand_bbm: 2800.0 + idx * 50,
          phasa_r: isOp ? 380.0 : 0,
          phasa_s: isOp ? 380.0 : 0,
          phasa_t: isOp ? 380.0 : 0,
          tek_oli: isOp ? 4.2 : 0,
          temp_air: isOp ? 78.0 : 0,
          tegangan: isOp ? 380.0 : 0,
          frequency: isOp ? 50.0 : 0,
          cos_phi: isOp ? 0.85 : 0,
          jam_kerja_mesin: 1420.0 + idx * 250,
          kd_jenis_bahan_bakar: m.kd_jenis_bahan_bakar || "B35",
          keterangan: initialKet,
        };
      });
      setMachines(list);
    } catch (err) {
      console.error("Failed to load unit format:", err);
      const uName = targetUnit.nama_unit || "PLTD Unit";
      setMachines([
        {
          nomor: 1,
          id_mesin: `${targetUnit.kd_unit}01`,
          nama_mesin: `${uName} #01 (CATERPILLAR 3512B)`,
          kode_mesin_silm: `225551403${targetUnit.kd_unit}1`,
          sn: `CAT-${targetUnit.kd_unit}-01`,
          dt: 1000,
          daya_mampu: "1000",
          status_mesin: "OPERASI",
          beban: 80.0,
          stand_kwh: 12450.5,
          stand_bbm: 2800.0,
          phasa_r: 380.0,
          phasa_s: 380.0,
          phasa_t: 380.0,
          tek_oli: 4.2,
          temp_air: 78.0,
          tegangan: 380.0,
          frequency: 50.0,
          cos_phi: 0.85,
          jam_kerja_mesin: 1420.0,
          kd_jenis_bahan_bakar: "B35",
          keterangan: "Beroperasi Normal",
        },
        {
          nomor: 2,
          id_mesin: `${targetUnit.kd_unit}02`,
          nama_mesin: `${uName} #02 (DEUTZ TBD 620)`,
          kode_mesin_silm: `225551403${targetUnit.kd_unit}2`,
          sn: `DEU-${targetUnit.kd_unit}-02`,
          dt: 800,
          daya_mampu: "800",
          status_mesin: "OPERASI",
          beban: 75.0,
          stand_kwh: 11200.0,
          stand_bbm: 2400.0,
          phasa_r: 380.0,
          phasa_s: 380.0,
          phasa_t: 380.0,
          tek_oli: 4.0,
          temp_air: 76.0,
          tegangan: 380.0,
          frequency: 50.0,
          cos_phi: 0.85,
          jam_kerja_mesin: 1200.0,
          kd_jenis_bahan_bakar: "B35",
          keterangan: "Beroperasi Normal",
        },
      ]);
    } finally {
      setLoadingFormat(false);
    }
  }, []);

  // Fetch all units from API and merge with defaults
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await apiClient.get<WACBFormatResponse>("/wacb/units", {
          params: { kd_region: "05" },
        });
        if (res.data?.units && res.data.units.length > 0) {
          const map = new Map<string, WACBUnitItem>();
          DEFAULT_PLTD_UNITS.forEach((u) => map.set(u.kd_unit, u));
          res.data.units.forEach((u) => map.set(u.kd_unit, u));
          setUnitsList(Array.from(map.values()));
        }
      } catch (err) {
        console.warn("Using offline fallback units:", err);
      }
    };
    fetchUnits();
  }, []);

  // Initialize selected unit from query params, localStorage, or user profile
  useEffect(() => {
    let initialUnit = activeUnit;
    const qUnit = searchParams.get("kd_unit") || searchParams.get("unit");

    if (qUnit) {
      const match = DEFAULT_PLTD_UNITS.find((u) => u.kd_unit === qUnit);
      if (match) {
        initialUnit = match;
      }
    } else {
      const savedUnit = localStorage.getItem("pln_selected_unit");
      if (savedUnit) {
        try {
          initialUnit = JSON.parse(savedUnit);
        } catch {}
      }
    }

    setActiveUnit(initialUnit);

    const savedUser = localStorage.getItem("pln_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setOperatorName(u.name);
      } catch {}
    }

    fetchFormatForUnit(initialUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle unit change from dropdown selector
  const handleUnitChange = (newKdUnit: string) => {
    const found = unitsList.find((u) => u.kd_unit === newKdUnit);
    if (!found) return;

    const nextUnit = {
      kd_unit: found.kd_unit,
      nama_unit: found.nama_unit,
      kd_area: found.kd_area || "40",
      nama_area: found.nama_area || "KAL-3",
    };

    setActiveUnit(nextUnit);
    localStorage.setItem("pln_selected_unit", JSON.stringify(nextUnit));
    fetchFormatForUnit(nextUnit);
    setActiveTab(0);

    setSuccessToast(`Unit aktif berganti ke: ${nextUnit.nama_unit}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleMachineChange = (index: number, updated: Partial<MachineFormEntry>) => {
    setMachines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleCopyParameters = (fromIdx: number) => {
    const src = machines[fromIdx];
    setMachines((prev) =>
      prev.map((m, idx) => {
        if (idx === fromIdx || m.status_mesin !== "OPERASI") return m;
        return {
          ...m,
          tegangan: src.tegangan,
          frequency: src.frequency,
          cos_phi: src.cos_phi,
          tek_oli: src.tek_oli,
          temp_air: src.temp_air,
        };
      })
    );
    alert(`Parameter kelistrikan Mesin #${src.nomor} berhasil disalin ke semua mesin yang beroperasi!`);
  };

  const handlePickPhoto = async (file: File | undefined, target: "selfie" | "mesin") => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      if (target === "selfie") setSelfie(dataUrl);
      else setFotoMesin(dataUrl);
    } catch {
      alert("Gagal membaca file foto. Pastikan format JPG/PNG/WEBP.");
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Perangkat ini tidak mendukung GPS.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Gagal mengambil lokasi. Izinkan akses lokasi lalu coba lagi.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const localId = `LOG-${activeUnit.kd_unit}-${tanggal.replace(/-/g, "")}-${jam.replace(":", "")}-${Date.now()}`;
    const payload: BatchLogsheetRequest = {
      local_id: localId,
      kd_region: "05",
      kd_unit: activeUnit.kd_unit,
      nama_unit: activeUnit.nama_unit,
      tanggal,
      jam,
      operator_name: operatorName,
      machines,
      selfie_url: selfie || "",
      foto_mesin_url: fotoMesin || "",
      foto_urls: [selfie, fotoMesin].filter(Boolean),
      location: gps,
    };

    if (!isOnline) {
      // Offline -> Save to IndexedDB (Dexie)
      try {
        await saveOfflineDraft(payload);
        setSuccessToast("Perangkat offline: Logsheet disimpan ke antrean lokal dan akan dikirim otomatis saat online.");
        setTimeout(() => router.push("/sync"), 2000);
      } catch (err) {
        alert("Gagal menyimpan ke penyimpanan offline: " + err);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Online -> Submit to Go Backend (which relays to WACB)
    try {
      const res = await apiClient.post("/wacb/submit-logsheet", payload);
      if (res.data?.success) {
        setSuccessToast("Logsheet berhasil terkirim dan disimpan di WACB DIGIKIT!");
        setRefreshToken((r) => r + 1);
        setTimeout(() => setView("list"), 1200);
      } else {
        alert("Gagal mengirim laporan: " + res.data?.message);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      await saveOfflineDraft(payload);
      setSuccessToast("Koneksi gagal: Logsheet diamankan ke antrean lokal.");
      setTimeout(() => router.push("/sync"), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-success-600 px-4 py-3 text-xs font-bold text-white shadow-theme-md animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="min-w-0">{successToast}</span>
        </div>
      )}

      {/* Form Container / Daftar Logsheet */}
      {view === "list" ? (
        <LogsheetList onAdd={() => setView("form")} refreshToken={refreshToken} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                  Formulir Logsheet PLTD
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-brand-600 dark:text-brand-400">{activeUnit.nama_unit}</span> •
                  Penginputan Multi-Mesin Sekaligus (1 s/d {machines.length || 6} Mesin)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                >
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{previewOpen ? "Tutup Preview" : "Preview Payload WACB"}</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || loadingFormat}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
                >
                  {isOnline ? (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{submitting ? "Mengirim ke WACB..." : "Submit Logsheet (Online)"}</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="h-4 w-4" />
                      <span>{submitting ? "Menyimpan..." : "Simpan Antrean (Offline)"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Header Fields: Unit Switcher, Tanggal, Jam Bebas, Operator */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800">
              {/* Unit PLTD Dropdown Selector (Can Choose Any of the 30 Units) */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-brand-500" />
                    <span>Pilih Unit PLTD:</span>
                  </span>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {unitsList.length} Unit
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={activeUnit.kd_unit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-brand-300 bg-brand-50/50 py-2 pl-3.5 pr-8 text-xs font-bold text-brand-900 focus:border-brand-500 focus:outline-hidden dark:border-brand-700 dark:bg-gray-800 dark:text-brand-200"
                  >
                    {unitsList.map((u) => (
                      <option key={u.kd_unit} value={u.kd_unit}>
                        [{u.kd_unit}] {u.nama_unit} ({u.nama_area || "PLTD"})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="h-3.5 w-3.5 text-brand-500" />
                  <span>Tanggal Laporan:</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className="h-3.5 w-3.5 text-brand-500" />
                  <span>Jam Laporan (48 Slot):</span>
                </label>
                <select
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                >
                  {timeSlots.map((s) => (
                    <option key={s} value={s}>
                      {s} WITA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <UserCheck className="h-3.5 w-3.5 text-brand-500" />
                  <span>Nama Operator Shift:</span>
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* WACB Payload Preview Box */}
          {previewOpen && (
            <div className="space-y-2 rounded-2xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-gray-200 shadow-theme-sm">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-400">
                <span>Standard Message Text Payload (WACB v1.0)</span>
                <span>{machines.length} Mesin Siap Terkirim</span>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-gray-900 p-3.5 text-[11px] leading-relaxed text-gray-300">
{`LAPORAN LOGSHEET PLTD
${activeUnit.nama_unit}
id unit: ${activeUnit.kd_unit}
tgl : ${tanggal}
jam : ${jam}
nama operator: ${operatorName}

${machines
  .map(
    (m) =>
      `${m.nomor}. ${m.nama_mesin}\nid mesin: ${m.id_mesin}\nkode mesin: ${m.kode_mesin_silm}\nsn: ${m.sn}\ndt: ${m.dt}\ndaya mampu: ${m.daya_mampu}\nbeban: ${m.beban}\nstand kwh: ${m.stand_kwh}\nstand bbm: ${m.stand_bbm}\ntek oli: ${m.tek_oli}\ntemp air: ${m.temp_air}\ntegangan: ${m.tegangan}\nfrequency: ${m.frequency}\ncos phi: ${m.cos_phi}\njam kerja mesin: ${m.jam_kerja_mesin}\nstatus mesin: ${m.status_mesin}\njenis bahan bakar: ${m.kd_jenis_bahan_bakar}\nket: ${m.keterangan}`
  )
  .join("\n\n")}`}
              </pre>
            </div>
          )}

          {/* Machine Tabs & Form: PROMINENTLY AT TOP FOR IMMEDIATE ACCESS */}
          <MachineForm
            machines={machines}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onChange={handleMachineChange}
            onCopyParametersToAll={handleCopyParameters}
          />

          {/* Lampiran Pendukung (Lokasi Unit GPS & Absen Petugas / Foto Mesin) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Lokasi Unit (GPS) &amp; Lampiran Foto (Opsional)
                </h2>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  Data pendukung laporan seperti di aplikasi mobile — lokasi GPS dan foto petugas/mesin.
                </p>
              </div>
            </div>

            {/* GPS Section */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-800/40">
              {gps ? (
                <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div>Lat: {gps.lat.toFixed(6)}</div>
                  <div>Lng: {gps.lng.toFixed(6)}</div>
                  <div>Akurasi: ±{Math.round(gps.accuracy)} m</div>
                </div>
              ) : (
                <p className="min-w-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                  {gpsError || "Belum ada lokasi GPS (opsional — disarankan untuk verifikasi shift)."}
                </p>
              )}

              <button
                type="button"
                onClick={captureLocation}
                disabled={gpsLoading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              >
                <Crosshair className={`h-4 w-4 ${gpsLoading ? "animate-spin" : ""}`} />
                <span>{gpsLoading ? "Mengambil GPS..." : gps ? "Ambil Ulang Lokasi" : "Ambil Lokasi Unit"}</span>
              </button>
            </div>

            {/* Photo Section */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PhotoBox
                title="Absen Petugas"
                note="Selfie operator cukup sekali untuk seluruh mesin dalam unit ini."
                value={selfie}
                onOpenCamera={() => setCameraTarget("selfie")}
                onPick={(file) => handlePickPhoto(file, "selfie")}
                onClear={() => setSelfie("")}
              />
              <PhotoBox
                title="Foto Mesin"
                note={
                  machines[activeTab]?.status_mesin === "GANGGUAN"
                    ? "Status Gangguan-Rusak: ambil 1 foto khusus untuk mesin ini."
                    : "Foto mesin umum cukup sekali dan bisa dipakai ulang untuk mesin lain pada unit ini."
                }
                value={fotoMesin}
                onOpenCamera={() => setCameraTarget("mesin")}
                onPick={(file) => handlePickPhoto(file, "mesin")}
                onClear={() => setFotoMesin("")}
              />
            </div>
          </div>

          {/* Bottom Submit Action Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Siap Kirim: <span className="text-brand-600 dark:text-brand-400">{activeUnit.nama_unit}</span>
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {machines.length} Mesin • Tanggal {tanggal} • Slot {jam} WITA • Operator {operatorName}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingFormat}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-xs font-extrabold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
            >
              {isOnline ? (
                <>
                  <Send className="h-4 w-4" />
                  <span>{submitting ? "Mengirim ke WACB..." : `Submit Logsheet (${activeUnit.nama_unit})`}</span>
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" />
                  <span>{submitting ? "Menyimpan..." : "Simpan Antrean (Offline)"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Kamera live untuk absen petugas & foto mesin */}
      <CameraCaptureModal
        open={cameraTarget !== null}
        title={cameraTarget === "selfie" ? "Absen Petugas" : "Foto Mesin"}
        onCapture={(dataUrl) => {
          if (cameraTarget === "selfie") setSelfie(dataUrl);
          else if (cameraTarget === "mesin") setFotoMesin(dataUrl);
          setCameraTarget(null);
        }}
        onClose={() => setCameraTarget(null)}
      />
    </div>
  );
}

export default function InputLogsheetPage() {
  return (
    <AppLayout>
      <RoleGuard
        allowedRoles={["SUPERADMIN", "ADMIN", "SUPERVISOR", "OPERATOR"]}
        moduleName="Input Logsheet Mesin PLTD"
      >
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-500" />
            </div>
          }
        >
          <InputLogsheetContent />
        </Suspense>
      </RoleGuard>
    </AppLayout>
  );
}
