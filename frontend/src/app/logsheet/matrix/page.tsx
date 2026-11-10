"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid2X2,
  Layers,
  Maximize2,
  PieChart as PieIcon,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  X,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { exportLogsheetPDF, exportToCSV } from "@/lib/exportUtils";
import {
  WACBMatrixResponse,
  WACBMatrixUnit,
  WACBTimeSlotStatus,
  WACBDetailReportResponse,
} from "@/types";

// 48 interval waktu
const ALL_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, "0");
  ALL_SLOTS.push(`${hh}:00`);
  ALL_SLOTS.push(`${hh}:30`);
}

const AREA_OPTIONS = [
  { key: "ALL", label: "Semua Area (30 Unit)" },
  { key: "SITE BONTANG", label: "SITE BONTANG (4 Unit)" },
  { key: "SITE BERAU", label: "SITE BERAU (9 Unit)" },
  { key: "AREA SAMARINDA", label: "AREA SAMARINDA (9 Unit)" },
  { key: "AREA KALTARA", label: "AREA KALTARA (6 Unit)" },
  { key: "AREA BERAU & TARAKAN", label: "BERAU & TARAKAN (1 Unit)" },
  { key: "AREA BALIKPAPAN", label: "AREA BALIKPAPAN (1 Unit)" },
];

const UNIT_AREA_MAP: Record<string, string> = {
  "0264": "SITE BONTANG",
  "0279": "SITE BONTANG",
  "0292": "SITE BONTANG",
  "0297": "SITE BONTANG",
  "0265": "SITE BERAU",
  "0271": "SITE BERAU",
  "0272": "SITE BERAU",
  "0280": "SITE BERAU",
  "0281": "SITE BERAU",
  "0282": "SITE BERAU",
  "0286": "SITE BERAU",
  "0296": "SITE BERAU",
  "1168": "SITE BERAU",
  "0266": "AREA SAMARINDA",
  "0275": "AREA SAMARINDA",
  "0277": "AREA SAMARINDA",
  "0283": "AREA SAMARINDA",
  "0284": "AREA SAMARINDA",
  "0285": "AREA SAMARINDA",
  "0288": "AREA SAMARINDA",
  "0289": "AREA SAMARINDA",
  "0293": "AREA SAMARINDA",
  "0274": "AREA KALTARA",
  "0276": "AREA KALTARA",
  "0278": "AREA KALTARA",
  "0287": "AREA KALTARA",
  "0290": "AREA KALTARA",
  "0294": "AREA KALTARA",
  "0934": "AREA BERAU & TARAKAN",
  "0935": "AREA BALIKPAPAN",
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function MatrixPage() {
  const router = useRouter();

  // State navigasi & filter
  const [activeTab, setActiveTab] = useState<"wacb" | "analytics">("wacb");
  const [tanggal, setTanggal] = useState<string>(todayStr());
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data matrix WACB
  const [matrixUnits, setMatrixUnits] = useState<WACBMatrixUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Detail Modal state
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    unitName: string;
    kdUnit: string;
    jam: string;
    idBeban: string;
    loading: boolean;
    data?: WACBDetailReportResponse["data"];
  } | null>(null);

  // Quick Action Modal (untuk slot merah/belum lapor)
  const [emptySlotModal, setEmptySlotModal] = useState<{
    open: boolean;
    unitName: string;
    kdUnit: string;
    jam: string;
  } | null>(null);

  // Current timeslot
  const now = new Date();
  const currentSlot = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() < 30 ? "00" : "30"}`;

  // Fetch Matrix dari Backend
  const fetchMatrix = useCallback(async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<WACBMatrixResponse>("/wacb/matrix", {
        params: {
          kd_region: "05",
          tanggal: targetDate,
          kd_unit: "ALL", // minta seluruh unit region 05
        },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        setMatrixUnits(res.data.data);
        setLastRefreshed(new Date().toLocaleTimeString("id-ID"));
      } else {
        setMatrixUnits([]);
      }
    } catch (err: any) {
      console.error("Gagal memuat matriks WACB:", err);
      setError(err?.response?.data?.message || "Gagal menghubungi server WACB");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatrix(tanggal);
  }, [tanggal, fetchMatrix]);

  // Auto refresh tiap 30 detik jika aktif
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMatrix(tanggal);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, tanggal, fetchMatrix]);

  // Filter unit berdasarkan Area & Search Query
  const filteredUnits = useMemo(() => {
    return matrixUnits.filter((u) => {
      const area = UNIT_AREA_MAP[u.kd_unit] || "SITE BONTANG";
      const matchesArea = selectedArea === "ALL" || area === selectedArea;
      const matchesSearch =
        searchQuery === "" ||
        u.nama_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.kd_unit.includes(searchQuery);
      return matchesArea && matchesSearch;
    });
  }, [matrixUnits, selectedArea, searchQuery]);

  // Hitung total statistik
  const stats = useMemo(() => {
    let totalSlots = 0;
    let filledSlots = 0;
    let unitsCompleted = 0;

    filteredUnits.forEach((u) => {
      const slots = u.logsheet_pltd || {};
      let uDone = 0;
      ALL_SLOTS.forEach((s) => {
        totalSlots++;
        if (slots[s]?.status === "done") {
          filledSlots++;
          uDone++;
        }
      });
      if (uDone === 48) unitsCompleted++;
    });

    const percent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
    return {
      totalSlots,
      filledSlots,
      unitsCount: filteredUnits.length,
      unitsCompleted,
      percent,
    };
  }, [filteredUnits]);

  // Handler klik cell slot
  const handleCellClick = async (u: WACBMatrixUnit, slot: string, statusInfo?: WACBTimeSlotStatus) => {
    if (statusInfo?.status === "done" && statusInfo.id_beban) {
      // Buka Detail Modal
      setDetailModal({
        open: true,
        unitName: u.nama_unit,
        kdUnit: u.kd_unit,
        jam: slot,
        idBeban: statusInfo.id_beban,
        loading: true,
      });

      try {
        const res = await apiClient.get<WACBDetailReportResponse>(
          `/wacb/detail/${encodeURIComponent(statusInfo.id_beban)}`,
          {
            params: {
              kd_unit: u.kd_unit,
              tanggal,
              jam: `${slot}:00`,
            },
          }
        );
        setDetailModal((prev) =>
          prev
            ? {
                ...prev,
                loading: false,
                data: res.data?.data,
              }
            : null
        );
      } catch (err) {
        setDetailModal((prev) => (prev ? { ...prev, loading: false } : null));
      }
    } else {
      // Slot merah / not done -> buka aksi cepat
      setEmptySlotModal({
        open: true,
        unitName: u.nama_unit,
        kdUnit: u.kd_unit,
        jam: slot,
      });
    }
  };

  return (
    <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "OPERATOR", "TEKNISI"]}>
      <AppLayout>
        <div className="space-y-5">
          {/* Top Bar Header & Navigation Tabs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  WACB DIGIKIT LIVE
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Region 05 (Kalimantan 3)
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Data Laporan Logsheet/Pembebanan
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monitoring Matriks 48 Interval (00:00 s/d 23:30) • Mirroring Real-time dengan Server WACB
              </p>
            </div>

            {/* Quick Actions & Tab Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => setActiveTab("wacb")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "wacb"
                      ? "bg-white text-brand-600 shadow-sm dark:bg-gray-900 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  Matriks 48 Slot (Mirroring WACB)
                </button>
                <button
                  onClick={() => router.push("/logsheet/input")}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 shadow-sm transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  + Input Logsheet
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar (Metronic / WACB Style) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Kolom Filter */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Unit Pelaksana */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Unit Pelaksana
                  </label>
                  <div className="mt-1 flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    UP KALIMANTAN 3
                  </div>
                </div>

                {/* Area Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Area Kerja
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="mt-1 h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {AREA_OPTIONS.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Tanggal Laporan
                  </label>
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                    <button
                      onClick={() => setTanggal(todayStr())}
                      className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-[11px] font-bold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Hari Ini
                    </button>
                  </div>
                </div>

                {/* Search Unit */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Cari Unit PLTD
                  </label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau kode unit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-xs font-semibold text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Refresh / Sinkronkan */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchMatrix(tanggal)}
                  disabled={loading}
                  className="flex h-9 items-center gap-2 rounded-lg bg-brand-500 px-4 text-xs font-bold text-white shadow hover:bg-brand-600 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Menyinkronkan..." : "Pilih / Refresh"}
                </button>
              </div>
            </div>

            {/* Status Summary & Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    Total Slot Terisi:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.filledSlots} / {stats.totalSlots} ({stats.percent}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    Menampilkan:
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {filteredUnits.length} Unit PLTD
                  </span>
                </div>
                {lastRefreshed && (
                  <div className="text-[11px] text-gray-400">
                    Terakhir diperbarui: {lastRefreshed}
                  </div>
                )}
              </div>

              {/* Legend Identik WACB */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#00a65a] shadow-xs" />
                  <span className="text-gray-700 dark:text-gray-300">Sudah Lapor (Done)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-5 rounded bg-[#d9214e] shadow-xs" />
                  <span className="text-gray-700 dark:text-gray-300">Belum Lapor (Not Done)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border-2 border-amber-400 bg-amber-400" />
                  <span className="text-gray-700 dark:text-gray-300">Jam Saat Ini ({currentSlot})</span>
                </div>
              </div>
            </div>
          </div>

          {/* WACB Mirroring Matrix Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
            {error && (
              <div className="p-4 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40">
                Perhatian: {error}. Menampilkan data sinkronisasi lokal/terakhir.
              </div>
            )}

            <div className="overflow-x-auto max-h-[72vh] relative">
              <table className="w-full text-left text-xs border-collapse">
                {/* Header Table */}
                <thead className="sticky top-0 z-20 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 select-none shadow-xs">
                  <tr>
                    <th className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-800 px-3 py-2.5 font-bold border-b border-r border-gray-200 dark:border-gray-700 text-center w-12">
                      NO
                    </th>
                    <th className="sticky left-12 z-30 bg-gray-100 dark:bg-gray-800 px-4 py-2.5 font-bold border-b border-r border-gray-200 dark:border-gray-700 min-w-[220px]">
                      NAMA UNIT
                    </th>
                    {ALL_SLOTS.map((slot) => {
                      const isNow = slot === currentSlot;
                      return (
                        <th
                          key={slot}
                          className={`px-1.5 py-2 text-center font-bold border-b border-r border-gray-200 dark:border-gray-700 min-w-[42px] whitespace-nowrap text-[11px] ${
                            isNow
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 ring-2 ring-amber-400 ring-inset"
                              : ""
                          }`}
                        >
                          {slot}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Body Table */}
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading && matrixUnits.length === 0 ? (
                    <tr>
                      <td colSpan={50} className="py-16 text-center text-gray-400">
                        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                        Mengambil data matriks dari WACB DIGIKIT...
                      </td>
                    </tr>
                  ) : filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={50} className="py-12 text-center text-gray-400">
                        Tidak ada unit PLTD yang cocok dengan filter atau pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit, idx) => {
                      const slots = unit.logsheet_pltd || {};
                      const doneInUnit = Object.values(slots).filter((v) => v.status === "done").length;
                      const areaName = UNIT_AREA_MAP[unit.kd_unit] || "SITE BONTANG";

                      return (
                        <tr
                          key={unit.kd_unit}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {/* Kolom 1: Nomor */}
                          <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-2 py-2 text-center font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800 text-[11px]">
                            {idx + 1}
                          </td>

                          {/* Kolom 2: Nama Unit & Badge */}
                          <td className="sticky left-12 z-10 bg-white dark:bg-gray-900 px-3 py-2 border-r border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold leading-tight">
                                  {unit.nama_unit}
                                </div>
                                <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                                  Kode: {unit.kd_unit} • {areaName}
                                </div>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  doneInUnit > 0
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {doneInUnit}/48
                              </span>
                            </div>
                          </td>

                          {/* 48 Kolom Interval Slot */}
                          {ALL_SLOTS.map((slot) => {
                            const statusInfo = slots[slot];
                            const isDone = statusInfo?.status === "done";
                            const isNow = slot === currentSlot;

                            return (
                              <td
                                key={slot}
                                onClick={() => handleCellClick(unit, slot, statusInfo)}
                                title={`${unit.nama_unit} • ${slot} WITA: ${
                                  isDone ? "Sudah Diisi (Klik untuk Detail)" : "Belum Diisi (Klik untuk Input)"
                                }`}
                                className={`p-1 border-r border-gray-200 dark:border-gray-800 text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                                  isNow ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                                }`}
                              >
                                <div
                                  className={`h-7 w-full rounded flex items-center justify-center font-bold text-[10px] text-white shadow-xs transition-all ${
                                    isDone
                                      ? "bg-[#00a65a] hover:bg-[#008d4c] ring-1 ring-[#00a65a]/30"
                                      : "bg-[#d9214e] hover:bg-[#c11c43] ring-1 ring-[#d9214e]/30"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="text-[10px] font-black tracking-tighter">✓</span>
                                  ) : null}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Detail Logsheet (Ketika klik Cell Hijau) */}
        {detailModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800">
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      STATUS: DONE / TERISI
                    </span>
                    <span className="text-xs text-gray-500">ID Beban: {detailModal.idBeban}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    Detail Logsheet {detailModal.unitName} • Jam {detailModal.jam} WITA
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tanggal: {tanggal} • Kode Unit: {detailModal.kdUnit}
                  </p>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Isi Detail Mesin */}
              <div className="p-6 overflow-y-auto space-y-4">
                {detailModal.loading ? (
                  <div className="py-12 text-center text-gray-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-brand-500 mb-2" />
                    Memuat rincian parameter mesin dari server WACB...
                  </div>
                ) : detailModal.data?.beban_mesin && detailModal.data.beban_mesin.length > 0 ? (
                  <div className="space-y-4">
                    {/* Alert Ringkasan Catatan Gangguan Mesin jika ada */}
                    {detailModal.data.beban_mesin.some((bm) => bm.kd_status !== "01" && bm.kd_status !== "02") && (
                      <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-4 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/40 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-rose-900 dark:text-rose-200">
                          <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse shrink-0" />
                          <span>Peringatan Gangguan Mesin pada Jam Ini ({detailModal.data.beban_mesin.filter((bm) => bm.kd_status !== "01" && bm.kd_status !== "02").length} Unit Gangguan):</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1.5">
                          {detailModal.data.beban_mesin
                            .filter((bm) => bm.kd_status !== "01" && bm.kd_status !== "02")
                            .map((gm, i) => (
                              <div key={i} className="rounded-lg bg-white p-3 border border-rose-200 shadow-xs dark:bg-gray-800 dark:border-rose-800">
                                <div className="flex items-center justify-between font-bold text-xs text-gray-900 dark:text-white">
                                  <span className="truncate pr-2">{gm.nama_mesin}</span>
                                  <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                                    GANGGUAN
                                  </span>
                                </div>
                                <div className="mt-1.5 text-xs text-rose-800 dark:text-rose-200 font-semibold bg-rose-50/90 dark:bg-rose-950/70 p-2 rounded border border-rose-100 dark:border-rose-900/40">
                                  <span className="text-gray-500 dark:text-gray-400 font-normal">Catatan / Alasan Gangguan: </span>
                                  <span className="font-bold underline decoration-rose-400">{gm.keterangan && gm.keterangan !== "-" ? gm.keterangan : "Gangguan Operasional Mesin (Daya 0 kW)"}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-gray-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-3 py-2.5">Mesin</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5 min-w-[180px]">Catatan / Keterangan Gangguan</th>
                            <th className="px-3 py-2.5 text-right">Beban (kW)</th>
                            <th className="px-3 py-2.5 text-right">Stand kWh</th>
                            <th className="px-3 py-2.5 text-right">Stand BBM (L)</th>
                            <th className="px-3 py-2.5 text-right">Tek. Oli</th>
                            <th className="px-3 py-2.5 text-right">Suhu Air</th>
                            <th className="px-3 py-2.5 text-right">Tegangan</th>
                            <th className="px-3 py-2.5 text-right">Hz</th>
                            <th className="px-3 py-2.5">Operator</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {detailModal.data.beban_mesin.map((bm, mIdx) => {
                            const isOp = bm.kd_status === "01";
                            const isSt = bm.kd_status === "02";
                            const isGg = !isOp && !isSt;
                            return (
                              <tr
                                key={mIdx}
                                className={
                                  isGg
                                    ? "bg-rose-50/60 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border-l-4 border-l-rose-500"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                                }
                              >
                                <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">
                                  {bm.nama_mesin}
                                  <div className="text-[10px] font-normal text-gray-400">
                                    ID: {bm.id_mesin} {bm.no_seri ? `• SN: ${bm.no_seri}` : ""}
                                  </div>
                                  {isGg && (
                                    <div className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3 inline text-rose-500 shrink-0" />
                                      <span>{bm.keterangan && bm.keterangan !== "-" ? bm.keterangan : "Gangguan"}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                      isOp
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                        : isSt
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                    }`}
                                  >
                                    {isOp ? "OPERASI" : isSt ? "STANDBY" : "GANGGUAN"}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  {isGg ? (
                                    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-900 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900">
                                      <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />
                                      <span>{bm.keterangan && bm.keterangan !== "-" ? bm.keterangan : "Gangguan Operasional Mesin"}</span>
                                    </div>
                                  ) : isSt ? (
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                      {bm.keterangan && bm.keterangan !== "-" ? bm.keterangan : "Standby Siap Operasi"}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {bm.keterangan && bm.keterangan !== "-" ? bm.keterangan : "Beroperasi Normal"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-right font-bold text-gray-800 dark:text-gray-200">
                                  {bm.beban ?? 0}
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.stand_kwh ?? "-"}
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.stand_bbm ?? "-"}
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.tek_oli ?? "-"} bar
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.tem_air ?? "-"} °C
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.teg ?? "-"} V
                                </td>
                                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-300">
                                  {bm.frequency ?? "-"}
                                </td>
                                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                                  {bm.operator || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    Informasi detail untuk beban ini belum tersedia di server WACB.
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="border-t border-gray-100 px-6 py-3 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setDetailModal(null)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Quick Action (Ketika klik Cell Merah/Belum Lapor) */}
        {emptySlotModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-2 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Slot Belum Dilaporkan
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {emptySlotModal.unitName} (Kode: {emptySlotModal.kdUnit})
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/60 dark:text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-400">Interval Waktu:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{emptySlotModal.jam} WITA</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-400">Tanggal:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-400">Status WACB:</span>
                  <span className="font-bold text-red-600">NOT DONE (Merah)</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEmptySlotModal(null)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const u = emptySlotModal;
                    setEmptySlotModal(null);
                    router.push(
                      `/logsheet/input?kd_unit=${u.kdUnit}&jam=${u.jam}&tanggal=${tanggal}`
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  Isi Logsheet Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </RoleGuard>
  );
}
