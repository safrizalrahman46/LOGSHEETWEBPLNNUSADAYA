"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
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
} from "@/types";

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

  // Kamera live hanya bisa di localhost/HTTPS; selain itu langsung pakai
  // kamera bawaan perangkat (input capture) agar tetap bisa dipakai di HP/tablet.
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

// Daftar logsheet (default tampilan halaman) — formulir hanya terbuka via tombol Tambah
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

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get<{ success: boolean; data: LogsheetHistoryItem[] }>(
        "/wacb/history"
      );
      setRecords(res.data?.data || []);
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
  const todayCount = records.filter((r) => r.tanggal === today).length;
  const pendingCount = records.filter((r) => r.sync_status !== "SYNCED").length;

  const chips = [
    { label: "Total Logsheet", value: records.length, tone: "text-gray-900 dark:text-white" },
    { label: "Hari Ini", value: todayCount, tone: "text-brand-600 dark:text-brand-400" },
    { label: "Belum Sinkron", value: pendingCount, tone: "text-warning-600 dark:text-warning-400" },
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

  // Unit State
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string; kd_area?: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
    kd_area: "40",
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

  // Tampilan halaman: daftar dulu (default) — formulir hanya terbuka via tombol Tambah
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

  useEffect(() => {
    const savedUnit = localStorage.getItem("pln_selected_unit");
    let currentUnit = activeUnit;
    if (savedUnit) {
      try {
        currentUnit = JSON.parse(savedUnit);
        setActiveUnit(currentUnit);
      } catch {}
    }

    const savedUser = localStorage.getItem("pln_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setOperatorName(u.name);
      } catch {}
    }

    // Fetch Machines Format from WACB API via Go
    const fetchFormat = async () => {
      setLoadingFormat(true);
      try {
        const res = await apiClient.get<WACBFormatResponse>("/wacb/format", {
          params: {
            kd_region: "05",
            kd_area: currentUnit.kd_area || "40",
            kd_unit: currentUnit.kd_unit,
          },
        });

        if (res.data?.format?.mesin && res.data.format.mesin.length > 0) {
          const list: MachineFormEntry[] = res.data.format.mesin.map((m, idx) => ({
            nomor: m.nomor || idx + 1,
            id_mesin: m.id_mesin,
            nama_mesin: m.nama_mesin,
            kode_mesin_silm: m.kode_mesin_silm || "",
            sn: m.sn || "",
            dt: m.dt || 100,
            daya_mampu: String(m.dt || 100),
            status_mesin: idx === 4 ? "STANDBY" : idx === 5 ? "GANGGUAN" : "OPERASI",
            beban: idx < 4 ? 75.0 + idx * 5 : 0,
            stand_kwh: 12450.5 + idx * 100,
            stand_bbm: 2800.0 + idx * 50,
            phasa_r: idx < 4 ? 380.0 : 0,
            phasa_s: idx < 4 ? 380.0 : 0,
            phasa_t: idx < 4 ? 380.0 : 0,
            tek_oli: idx < 4 ? 4.2 : 0,
            temp_air: idx < 4 ? 78.0 : 0,
            tegangan: idx < 4 ? 380.0 : 0,
            frequency: idx < 4 ? 50.0 : 0,
            cos_phi: idx < 4 ? 0.85 : 0,
            jam_kerja_mesin: 1420.0 + idx * 250,
            kd_jenis_bahan_bakar: m.kd_jenis_bahan_bakar || "B35",
            keterangan: idx === 4 ? "Mesin Siaga" : idx === 5 ? "Kerusakan Injektor" : "Beroperasi Normal",
          }));
          setMachines(list);
        }
      } catch (err) {
        console.error("Failed to load unit format:", err);
      } finally {
        setLoadingFormat(false);
      }
    };

    fetchFormat();
  }, []);

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
      // Fallback offline save on network failure
      await saveOfflineDraft(payload);
      setSuccessToast("Koneksi gagal: Logsheet diamankan ke antrean lokal.");
      setTimeout(() => router.push("/sync"), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
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
                  {activeUnit.nama_unit} • Penginputan Multi-Mesin Sekaligus (1 s/d {machines.length || 6} Mesin)
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

            {/* Header Fields: Tanggal, Jam Bebas, Operator */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3 dark:border-gray-800">
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
                  <span>Jam Laporan (48 Slot 30 Menit):</span>
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

          {/* Lokasi Unit (GPS) — seperti versi mobile */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Lokasi Unit (GPS)
                </h2>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  Lokasi unit cukup diambil sekali. Setelah tersimpan, GPS akan dipakai ulang
                  untuk mesin lain pada unit yang sama.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {gps ? (
                <div className="min-w-0 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div>Lat: {gps.lat.toFixed(6)}</div>
                  <div>Lng: {gps.lng.toFixed(6)}</div>
                  <div>Akurasi: ±{Math.round(gps.accuracy)} m</div>
                </div>
              ) : (
                <p className="min-w-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                  {gpsError || "Belum ada lokasi (opsional — disarankan agar laporan terverifikasi)."}
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
            {!gps && gpsError && (
              <p className="mt-2 text-[11px] font-semibold text-error-500 dark:text-error-400">{gpsError}</p>
            )}
          </div>

          {/* Absen Petugas & Foto Mesin — seperti versi mobile */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs sm:p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Camera className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Absen Petugas &amp; Foto Mesin
                </h2>
                <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Absen petugas dan foto mesin (Opsional) — sama seperti aplikasi mobile.
                </p>
              </div>
            </div>

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

          {/* Machine Tabs & Form */}
          <MachineForm
            machines={machines}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onChange={handleMachineChange}
            onCopyParametersToAll={handleCopyParameters}
          />
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
    </AppLayout>
  );
}

export default function InputLogsheetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-500" />
        </div>
      }
    >
      <InputLogsheetContent />
    </Suspense>
  );
}
