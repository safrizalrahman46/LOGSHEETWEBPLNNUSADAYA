"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Camera,
  UserCheck,
  ShieldCheck,
  X,
  Plus,
  Building2,
  Download,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { AttendanceItem } from "@/types";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function PresensiRiwayatPage() {
  const [history, setHistory] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("ALL");
  const [selectedShift, setSelectedShift] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [selectedItem, setSelectedItem] = useState<AttendanceItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: AttendanceItem[] }>(
        "/attendance/history"
      );
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat presensi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchSearch =
        search === "" ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.username.toLowerCase().includes(search.toLowerCase()) ||
        h.nama_unit.toLowerCase().includes(search.toLowerCase());

      const matchUnit = selectedUnit === "ALL" || h.kd_unit === selectedUnit;
      const matchShift = selectedShift === "ALL" || h.shift === selectedShift;
      const matchStatus = selectedStatus === "ALL" || h.status === selectedStatus;

      return matchSearch && matchUnit && matchShift && matchStatus;
    });
  }, [history, search, selectedUnit, selectedShift, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = history.length;
    const valid = history.filter((h) => h.status === "VALID" || h.is_within_geofence).length;
    const anomaly = history.filter((h) => h.status === "ANOMALY" || !h.is_within_geofence).length;
    const avgDistance =
      total > 0 ? history.reduce((acc, h) => acc + (h.distance_meter || 0), 0) / total : 0;
    return { total, valid, anomaly, avgDistance };
  }, [history]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nama Pegawai",
      "Username",
      "Peran (Role)",
      "Unit PLTD",
      "Shift",
      "Waktu Presensi",
      "Jarak ke Site (Meter)",
      "Dalam Radius 250m",
      "Status Geofence",
      "Latitude",
      "Longitude",
      "Akurasi (Meter)",
      "Keterangan",
    ];

    const rows = filteredHistory.map((h) => [
      h.id,
      `"${h.name}"`,
      `"${h.username}"`,
      `"${h.role}"`,
      `"${h.nama_unit}"`,
      `"${h.shift}"`,
      `"${h.created_at}"`,
      h.distance_meter?.toFixed(1) || 0,
      h.is_within_geofence ? "YA" : "TIDAK",
      `"${h.status}"`,
      h.latitude,
      h.longitude,
      h.accuracy_meter?.toFixed(1) || 0,
      `"${(h.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `REKAP_PRESENSI_GPS_${todayStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  Geofencing 250m
                </span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  Haversine Engine GPS
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Rekap Presensi GPS & Validasi Geofencing Pegawai
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Log pergantian shift operator & teknisi lapangan di site sentral PLTD Kalimantan 3
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ekspor Rekap (CSV)</span>
              </button>

              <Link
                href="/presensi"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
              >
                <MapPin className="h-4 w-4" />
                <span>Absen Shift Sekarang</span>
              </Link>
            </div>
          </div>

          {/* Bento Summary Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Presensi
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Pegawai
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-theme-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Dalam Radius (&lt;250m)
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.valid}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Valid
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-theme-xs dark:border-rose-900/50 dark:bg-rose-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Anomali Lokasi (&gt;250m)
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {stats.anomaly}
                </span>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Di Luar Site
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-theme-xs dark:border-blue-900/50 dark:bg-blue-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Rata-Rata Jarak Site
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats.avgDistance.toFixed(0)}
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Meter
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama pegawai, username, unit PLTD..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Shift</option>
                <option value="PAGI">Shift Pagi</option>
                <option value="SIANG">Shift Siang</option>
                <option value="MALAM">Shift Malam</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Status</option>
                <option value="VALID">Valid (&lt;250m)</option>
                <option value="ANOMALY">Anomali Lokasi</option>
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
                <UserCheck className="h-4 w-4 text-brand-500" />
                Daftar Riwayat Presensi Masuk Shift
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Total: {filteredHistory.length} Log Presensi
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Memuat riwayat presensi GPS...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Belum ada rekaman presensi yang sesuai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-5 py-3.5">Pegawai</th>
                      <th className="px-5 py-3.5">Peran</th>
                      <th className="px-5 py-3.5">Unit PLTD</th>
                      <th className="px-5 py-3.5">Shift</th>
                      <th className="px-5 py-3.5">Waktu Absen</th>
                      <th className="px-5 py-3.5">Jarak ke Site</th>
                      <th className="px-5 py-3.5">Status Geofence</th>
                      <th className="px-5 py-3.5">Foto</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredHistory.map((item) => {
                      const isValid = item.status === "VALID" || item.is_within_geofence;
                      return (
                        <tr key={item.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-gray-400">@{item.username}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {item.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">
                            {item.nama_unit}
                          </td>
                          <td className="px-5 py-4 font-bold text-brand-600 dark:text-brand-400">
                            {item.shift}
                          </td>
                          <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-4 font-bold">
                            <span className={isValid ? "text-emerald-600" : "text-rose-600"}>
                              {item.distance_meter?.toFixed(0) || 0} m
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                isValid
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {isValid ? "VALID (<250M)" : "DI LUAR SITE"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {item.photo_url ? (
                              <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200">
                                <img src={item.photo_url} alt="Foto" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setDetailModalOpen(true);
                              }}
                              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 shadow-theme-xs"
                            >
                              Detail Koordinat
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DETAIL MODAL */}
          {detailModalOpen && selectedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                      Rincian Log Presensi GPS
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedItem.name} — Shift {selectedItem.shift}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50/70 p-3 dark:bg-gray-800/40">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Unit Pembangkit</span>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedItem.nama_unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Jarak ke Pusat Site</span>
                      <p className="font-bold text-brand-600">{selectedItem.distance_meter?.toFixed(1)} Meter</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Koordinat GPS Browser</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Latitude:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedItem.latitude}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Longitude:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedItem.longitude}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Akurasi Perangkat:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        ±{selectedItem.accuracy_meter?.toFixed(1)} meter
                      </span>
                    </div>
                  </div>

                  {selectedItem.remarks && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan Pegawai</span>
                      <p className="mt-1 rounded-xl bg-gray-50 p-2.5 font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {selectedItem.remarks}
                      </p>
                    </div>
                  )}

                  {selectedItem.photo_url && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Foto Selfie Lokasi</span>
                      <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
                        <img
                          src={selectedItem.photo_url}
                          alt="Selfie Presensi"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

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
