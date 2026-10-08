"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Plus,
  Activity,
  ShieldAlert,
  Zap,
  TrendingUp,
  Cpu,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/layout/AppLayout";
import { TimeSlotMatrix } from "@/components/matrix/TimeSlotMatrix";
import { apiClient } from "@/lib/api";
import { StatsData } from "@/types";

const PIE_COLORS = {
  operasi: "#10b981",
  standby: "#f59e0b",
  "gangguan-rusak": "#ef4444",
};

export default function DashboardPage() {
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pln_selected_unit");
    if (saved) {
      try {
        setActiveUnit(JSON.parse(saved));
      } catch {
        // default
      }
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("pln_token")) return;
    apiClient
      .get("/admin/stats")
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.data);
          setStatsError(false);
        } else {
          setStatsError(true);
        }
      })
      .catch(() => setStatsError(true));
  }, []);

  const machineCounts = stats?.machines.counts || {};
  const operasiCount = machineCounts["operasi"] || 0;
  const standbyCount = machineCounts["standby"] || 0;
  const gangguanCount = machineCounts["gangguan-rusak"] || 0;
  const machineAlerts = stats?.machines.alerts || [];
  const harAlerts = stats?.har.alerts || [];

  const pieData = [
    { name: "Operasi", value: operasiCount },
    { name: "Standby", value: standbyCount },
    { name: "Gangguan", value: gangguanCount },
  ].filter((d) => d.value > 0);

  const hourData = (stats?.logsheet.per_hour || []).map((h) => ({
    jam: h.jam ? `${h.jam}:00` : "-",
    jumlah: h.jumlah,
  }));

  const bebanData = (stats?.logsheet.beban_per_mesin || []).map((b) => ({
    mesin: b.mesin.replace(/\s*\(.*\)$/, ""),
    beban: Number(b.beban) || 0,
  }));

  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      const res = await apiClient.get("/export/excel", {
        params: {
          kd_unit: activeUnit.kd_unit,
          unit_name: activeUnit.nama_unit,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Logsheet_${activeUnit.nama_unit.replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export Excel failed:", err);
      alert("Gagal mengunduh file Excel dari server");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & Top Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Pusat Kendali Operasi PLTD
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitoring Kesiapan Pembangkit & Pelaporan DIGIKIT Kalimantan 3 • {activeUnit.nama_unit} ({activeUnit.kd_unit})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{downloading ? "Merakit Excel..." : "Download Excel"}</span>
            </button>

            <Link
              href="/logsheet/input"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Input Logsheet</span>
            </Link>
          </div>
        </div>

        {/* TailAdmin Metric Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {/* Card 1: DT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daya Terpasang (DT)
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">800 kW</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                6 Unit Mesin Diesel Terinstal
              </p>
            </div>
          </div>

          {/* Card 2: DMP */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daya Mampu Pasok
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-success-600 dark:text-success-400">650 kW</h3>
              <p className="mt-1 text-xs font-medium text-success-600 dark:text-success-400">
                Kondisi Suplai Aman & Andal
              </p>
            </div>
          </div>

          {/* Card 3: Operasi */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mesin Operasi
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats ? `${operasiCount} Mesin` : "..."}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                dari {stats?.machines.total ?? "-"} mesin terdaftar
              </p>
            </div>
          </div>

          {/* Card 4: Standby & Gangguan */}
          <div
            className={`rounded-2xl border p-5 shadow-theme-xs ${
              standbyCount + gangguanCount > 0
                ? "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-error-600 dark:text-error-400">
                Standby / Gangguan
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-error-700 dark:text-error-400">
                {stats ? `${standbyCount} / ${gangguanCount}` : "..."}
              </h3>
              <p className="mt-1 text-xs text-error-600/80 dark:text-error-400/80">
                {stats ? `${standbyCount} Siaga • ${gangguanCount} Gangguan` : "Memuat data mesin"}
              </p>
            </div>
          </div>
        </div>

        {/* Peringatan merah: mesin & HAR bermasalah */}
        {!statsError && stats && machineAlerts.length + harAlerts.length > 0 && (
          <div className="rounded-2xl border-2 border-error-300 bg-error-50/70 p-5 shadow-theme-xs dark:border-error-500/40 dark:bg-error-500/10">
            <div className="mb-4 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error-500" />
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-error-700 dark:text-error-400">
                Peringatan Operasional
              </h2>
              <span className="ml-auto rounded-full bg-error-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {machineAlerts.length + harAlerts.length} Masalah
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {machineAlerts.length > 0 && (
                <div className="rounded-xl border border-error-200 bg-white p-4 dark:border-error-500/30 dark:bg-gray-900/70">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    <Cpu className="h-4 w-4 text-error-500" />
                    Mesin Tidak Normal ({machineAlerts.length})
                  </h3>
                  <ul className="space-y-2">
                    {machineAlerts.slice(0, 6).map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-error-50 px-3 py-2 dark:bg-error-500/10"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                            {m.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Unit {m.unit_id} • {m.capacity || "kapasitas -"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            m.status === "gangguan-rusak"
                              ? "bg-error-600 text-white"
                              : "bg-warning-500 text-white"
                          }`}
                        >
                          {m.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {harAlerts.length > 0 && (
                <div className="rounded-xl border border-error-200 bg-white p-4 dark:border-error-500/30 dark:bg-gray-900/70">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    <Wrench className="h-4 w-4 text-error-500" />
                    Tiket HAR Terbuka ({harAlerts.length})
                  </h3>
                  <ul className="space-y-2">
                    {harAlerts.slice(0, 6).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-error-50 px-3 py-2 dark:bg-error-500/10"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                            {t.ticket_number} — {t.machine_name}
                          </p>
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                            {t.fault_description || t.maintenance_type || "-"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-error-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                          {t.status || "OPEN"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/har"
                    className="mt-3 block text-center text-[11px] font-bold text-error-600 hover:underline dark:text-error-400"
                  >
                    Buka Modul HAR & AMC →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {!statsError && stats && machineAlerts.length + harAlerts.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-success-200 bg-success-50 px-5 py-4 dark:border-success-500/30 dark:bg-success-500/10">
            <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
            <div>
              <p className="text-sm font-bold text-success-700 dark:text-success-400">
                Tidak ada peringatan operasional
              </p>
              <p className="text-xs text-success-600/80 dark:text-success-400/80">
                Seluruh mesin beroperasi normal dan tidak ada tiket HAR terbuka.
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Status Mesin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Distribusi status operasi seluruh mesin
            </p>
            <div className="mt-4 h-64">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-xs text-gray-400">
                  Belum ada data mesin
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            PIE_COLORS[
                              entry.name === "Operasi"
                                ? "operasi"
                                : entry.name === "Standby"
                                  ? "standby"
                                  : "gangguan-rusak"
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Logsheet per Jam (7 Hari)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Jumlah logsheet terkirim per jam
            </p>
            <div className="mt-4 h-64">
              {hourData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-xs text-gray-400">
                  Belum ada logsheet 7 hari terakhir
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="jam" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                    <Tooltip />
                    <Bar dataKey="jumlah" name="Logsheet" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Beban Rata-rata per Mesin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rata-rata beban (kW) 7 hari terakhir
            </p>
            <div className="mt-4 h-64">
              {bebanData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-xs text-gray-400">
                  Belum ada data beban
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bebanData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      type="category"
                      dataKey="mesin"
                      width={110}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip />
                    <Bar dataKey="beban" name="Beban (kW)" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {statsError && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Statistik live tidak tersedia (login diperlukan untuk memuat data mesin & HAR).
          </p>
        )}

        {/* 48-Slot Matrix Card Container */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <TimeSlotMatrix kdUnit={activeUnit.kd_unit} />
        </div>
      </div>
    </AppLayout>
  );
}
