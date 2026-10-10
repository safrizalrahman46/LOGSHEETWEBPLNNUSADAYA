"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  MapPin,
  X,
  Plus,
  Building2,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient, API_BASE_URL } from "@/lib/api";
import { LogsheetHistoryItem } from "@/types";

const FALLBACK_UNITS = [
  { kd_unit: "0264", nama_unit: "ULD BATU AMPAR" },
  { kd_unit: "0265", nama_unit: "ULD BIDUK-BIDUK" },
  { kd_unit: "0279", nama_unit: "ULD LONG SEGAR" },
  { kd_unit: "0281", nama_unit: "ULD KELAY" },
  { kd_unit: "0288", nama_unit: "ULD MARATUA" },
];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function LogsheetRiwayatPage() {
  const [history, setHistory] = useState<LogsheetHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUnit, setSelectedUnit] = useState<string>("0264");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [unitList, setUnitList] = useState(FALLBACK_UNITS);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LogsheetHistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; history: LogsheetHistoryItem[] }>(
        "/wacb/history",
        {
          params: { kd_unit: selectedUnit, tanggal: selectedDate },
        }
      );
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat logsheet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil list unit dari WACB
    apiClient
      .get<{ units?: { kd_unit: string; nama_unit: string }[] }>("/wacb/units", {
        params: { kd_region: "05" },
      })
      .then((res) => {
        if (res.data?.units && res.data.units.length > 0) {
          setUnitList(res.data.units);
        }
      })
      .catch(() => {});

    // Cek unit tersimpan di localStorage
    const saved = localStorage.getItem("pln_selected_unit");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.kd_unit) setSelectedUnit(u.kd_unit);
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedUnit, selectedDate]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchSearch =
        search === "" ||
        h.operator_name.toLowerCase().includes(search.toLowerCase()) ||
        h.jam.toLowerCase().includes(search.toLowerCase()) ||
        (h.message_text || "").toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || h.sync_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [history, search, statusFilter]);

  const handleExportExcel = () => {
    const unitObj = unitList.find((u) => u.kd_unit === selectedUnit);
    const unitName = unitObj ? unitObj.nama_unit : "PLTD";
    const token = localStorage.getItem("pln_token") || "";
    const exportUrl = `${API_BASE_URL}/export/excel?kd_unit=${selectedUnit}&tanggal=${selectedDate}&unit_name=${encodeURIComponent(
      unitName
    )}`;

    // Buat link download dengan auth bearer
    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LOGSHEET_${selectedUnit}_${selectedDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert("Gagal mengunduh Excel: " + err));
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  WACB Logsheet Records
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Wilayah Kalimantan 3
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Riwayat & Arsip Logsheet Operasional PLTD
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Pencatatan parameter 48 slot jam (00:00 - 23:30), status sinkronisasi, & ekspor spreadsheet resmi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-theme-xs transition-colors hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Unduh Excel (.xlsx)</span>
              </button>

              <Link
                href="/logsheet/input"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Input Logsheet Baru</span>
              </Link>
            </div>
          </div>

          {/* Bento Summary Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Laporan Terisi Hari Ini
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{history.length}</span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  dari 48 Slot
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-theme-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Tersinkronisasi (WACB)
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {history.filter((h) => h.sync_status === "SYNCED").length}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  100% Valid
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-theme-xs dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending / Draft Lokal
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {history.filter((h) => h.sync_status === "PENDING").length}
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Antrean
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 shadow-theme-xs dark:border-brand-900/50 dark:bg-brand-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                Unit PLTD Terpilih
              </p>
              <div className="mt-2 flex items-baseline justify-between truncate">
                <span className="text-sm font-black text-brand-600 dark:text-brand-400 truncate">
                  {unitList.find((u) => u.kd_unit === selectedUnit)?.nama_unit || selectedUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari jam slot, operator, parameter..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {unitList.map((u) => (
                  <option key={u.kd_unit} value={u.kd_unit}>
                    {u.nama_unit} ({u.kd_unit})
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Status</option>
                <option value="SYNCED">Tersinkron (Synced)</option>
                <option value="PENDING">Pending Sync</option>
                <option value="FAILED">Gagal</option>
              </select>

              <button
                onClick={fetchHistory}
                title="Muat Ulang"
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <FileSpreadsheet className="h-4 w-4 text-brand-500" />
                Daftar Pelaporan Logsheet Slot Jam
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Total: {filteredHistory.length} Baris Data
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Memuat riwayat logsheet...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400 space-y-2">
                <p>Belum ada rekaman logsheet untuk tanggal {selectedDate} di unit ini.</p>
                <Link
                  href={`/logsheet/input?unit=${selectedUnit}&date=${selectedDate}`}
                  className="inline-flex items-center gap-1.5 text-brand-600 font-bold hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Isi Laporan Sekarang
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5">Slot Jam</th>
                      <th className="px-5 py-3.5">Tanggal</th>
                      <th className="px-5 py-3.5">Operator</th>
                      <th className="px-5 py-3.5">Jml Mesin</th>
                      <th className="px-5 py-3.5">Kondisi Mesin</th>
                      <th className="px-5 py-3.5">Status Sinkron</th>
                      <th className="px-5 py-3.5">Foto Bukti</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                            {item.jam}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                          {item.tanggal}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                          {item.operator_name}
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">
                          {item.machine_count || 1} Mesin
                        </td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                          {item.status_mesin_summary || "Normal Operasi"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              item.sync_status === "SYNCED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : item.sync_status === "PENDING"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}
                          >
                            {item.sync_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            {item.selfie_url && (
                              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                                Petugas
                              </span>
                            )}
                            {item.foto_mesin_url && (
                              <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
                                Mesin
                              </span>
                            )}
                            {!item.selfie_url && !item.foto_mesin_url && (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setDetailModalOpen(true);
                            }}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-theme-xs"
                          >
                            Detail Parameter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DETAIL MODAL */}
          {detailModalOpen && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                      Rincian Logsheet WACB v1.0
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Jam Slot {selectedItem.jam} • {selectedItem.tanggal}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50/70 p-3 text-xs dark:bg-gray-800/40">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Unit Layanan</span>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedItem.nama_unit}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Operator Input</span>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedItem.operator_name}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    String Message Text WACB (Terformat)
                  </span>
                  <pre className="mt-1.5 whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-900 p-3 font-mono text-[11px] text-emerald-400 dark:border-gray-800">
                    {selectedItem.message_text}
                  </pre>
                </div>

                {/* Foto Dokumentasi */}
                {(selectedItem.selfie_url || selectedItem.foto_mesin_url) && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      Dokumentasi Bukti Lapangan
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {selectedItem.selfie_url && (
                        <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-gray-700">
                          <p className="bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            Foto Petugas Operator
                          </p>
                          <img
                            src={selectedItem.selfie_url}
                            alt="Selfie Petugas"
                            className="h-36 w-full object-cover"
                          />
                        </div>
                      )}
                      {selectedItem.foto_mesin_url && (
                        <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-gray-700">
                          <p className="bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            Foto Mesin Pembangkit
                          </p>
                          <img
                            src={selectedItem.foto_mesin_url}
                            alt="Foto Mesin"
                            className="h-36 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
