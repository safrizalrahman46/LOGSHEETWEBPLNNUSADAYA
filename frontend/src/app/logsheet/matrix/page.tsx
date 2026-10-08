"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChartBar,
  ChartPie,
  Grid2X2,
  LogIn,
  Maximize2,
  RefreshCw,
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

interface MatrixCell {
  jam: string;
  unit_id: string;
  unit_name: string;
  machine_id: string;
  machine_name: string;
  machine_status: string;
  beban_mesin: number;
  approval_status: string;
  operator_name: string;
}

const STATUS_COLOR: Record<string, string> = {
  operasi: "#10b981",
  standby: "#f59e0b",
  "gangguan-rusak": "#ef4444",
};

const axisTick = { fontSize: 10, fill: "#9ca3af" };

type ChartKey = "status" | "beban" | "unit";
const CHART_TABS: { key: ChartKey; label: string; icon: typeof ChartPie }[] = [
  { key: "status", label: "Status Mesin", icon: ChartPie },
  { key: "beban", label: "Beban / Jam", icon: ChartBar },
  { key: "unit", label: "Rekap Unit", icon: ChartBar },
];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function MatrixPage() {
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [tanggal, setTanggal] = useState<string>(todayStr());

  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  const [activeChart, setActiveChart] = useState<ChartKey>("status");
  const [showAllCharts, setShowAllCharts] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pln_selected_unit");
    if (saved) {
      try {
        setActiveUnit(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const fetchData = useCallback(async (tgl: string) => {
    if (!localStorage.getItem("pln_token")) {
      setNeedLogin(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/matrix-master", {
        params: { tanggal: tgl },
      });
      if (res.data?.success) {
        setCells(res.data.cells || []);
        setError(null);
        setNeedLogin(false);
      } else {
        setError(res.data?.message || "Gagal memuat data matriks");
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) setNeedLogin(true);
      else {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Gagal memuat data matriks dari server"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(tanggal);
  }, [tanggal, fetchData]);

  const counts = cells.reduce<Record<string, number>>((acc, c) => {
    acc[c.machine_status] = (acc[c.machine_status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: "Operasi", value: counts["operasi"] || 0 },
    { name: "Standby", value: counts["standby"] || 0 },
    { name: "Gangguan", value: counts["gangguan-rusak"] || 0 },
  ].filter((d) => d.value > 0);

  const bebanPerJam = Object.values(
    cells.reduce<Record<string, { jam: string; total: number; n: number }>>((acc, c) => {
      const key = c.jam || "-";
      if (!acc[key]) acc[key] = { jam: key, total: 0, n: 0 };
      acc[key].total += Number(c.beban_mesin) || 0;
      acc[key].n += 1;
      return acc;
    }, {})
  )
    .map((r) => ({ jam: `${r.jam}:00`, beban: Math.round((r.total / Math.max(r.n, 1)) * 100) / 100 }))
    .sort((a, b) => a.jam.localeCompare(b.jam));

  const perUnit = Object.values(
    cells.reduce<Record<string, { unit: string; jumlah: number }>>((acc, c) => {
      const key = c.unit_name || c.unit_id || "-";
      if (!acc[key]) acc[key] = { unit: key, jumlah: 0 };
      acc[key].jumlah += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.jumlah - a.jumlah);

  const renderChart = (key: ChartKey, tall = false) => {
    const height = tall ? "h-96" : "h-72";
    if (loading) {
      return (
        <div className={`${height} flex items-center justify-center text-xs text-gray-400`}>
          Memuat data chart...
        </div>
      );
    }
    if (needLogin) {
      return (
        <div className={`${height} flex flex-col items-center justify-center gap-2 text-xs text-gray-400`}>
          <LogIn className="h-5 w-5" />
          Login untuk melihat chart matriks
        </div>
      );
    }
    if (error || cells.length === 0) {
      return (
        <div className={`${height} flex items-center justify-center text-xs text-gray-400`}>
          {error || "Tidak ada data logsheet untuk tanggal ini"}
        </div>
      );
    }

    if (key === "status") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={tall ? 85 : 55}
                outerRadius={tall ? 130 : 85}
                paddingAngle={3}
              >
                {statusData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={
                      d.name === "Operasi"
                        ? STATUS_COLOR.operasi
                        : d.name === "Standby"
                          ? STATUS_COLOR.standby
                          : STATUS_COLOR["gangguan-rusak"]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (key === "beban") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bebanPerJam}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="jam" tick={axisTick} />
              <YAxis tick={axisTick} width={40} />
              <Tooltip />
              <Bar dataKey="beban" name="Beban rata-rata (kW)" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={perUnit} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" allowDecimals={false} tick={axisTick} />
            <YAxis type="category" dataKey="unit" width={130} tick={{ ...axisTick, fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="jumlah" name="Jumlah baris logsheet" fill="#10b981" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const chipBase =
    "rounded-2xl border p-4 shadow-theme-xs dark:bg-gray-900";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Date Picker Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Matriks Keterisian Logsheet 24 Jam
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitoring 48 Slot Laporan Beban (Interval 30 Menit) • {activeUnit.nama_unit} ({activeUnit.kd_unit})
            </p>
          </div>

          {/* Date Selector Filter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(tanggal)}
              title="Muat ulang chart"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <Calendar className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tanggal:</span>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Ringkasan singkat */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={`${chipBase} border-gray-200 bg-white`}>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Total Baris</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{cells.length}</p>
          </div>
          <div className={`${chipBase} border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10`}>
            <p className="text-xs font-semibold uppercase text-success-600 dark:text-success-400">Operasi</p>
            <p className="mt-1 text-2xl font-bold text-success-700 dark:text-success-400">{counts["operasi"] || 0}</p>
          </div>
          <div className={`${chipBase} border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10`}>
            <p className="text-xs font-semibold uppercase text-warning-600 dark:text-warning-400">Standby</p>
            <p className="mt-1 text-2xl font-bold text-warning-700 dark:text-warning-400">{counts["standby"] || 0}</p>
          </div>
          <div className={`${chipBase} border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10`}>
            <p className="text-xs font-semibold uppercase text-error-600 dark:text-error-400">Gangguan / Rusak</p>
            <p className="mt-1 text-2xl font-bold text-error-700 dark:text-error-400">{counts["gangguan-rusak"] || 0}</p>
          </div>
        </div>

        {/* Chart dengan tab switcher */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Chart Matriks {tanggal}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rekap status mesin, beban per jam, dan distribusi per unit
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                {CHART_TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeChart === t.key && !showAllCharts;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        setActiveChart(t.key);
                        setShowAllCharts(false);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                        active
                          ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAllCharts((v) => !v)}
                title={showAllCharts ? "Satu chart besar" : "Tampilkan semua chart"}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                  showAllCharts
                    ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                }`}
              >
                {showAllCharts ? <Maximize2 className="h-4 w-4" /> : <Grid2X2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            {showAllCharts ? (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {CHART_TABS.map((t) => (
                  <div key={t.key} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">{t.label}</p>
                    {renderChart(t.key)}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {CHART_TABS.find((t) => t.key === activeChart)?.label}
                </p>
                {renderChart(activeChart, true)}
              </div>
            )}
          </div>
        </div>

        {/* Matrix Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <TimeSlotMatrix kdUnit={activeUnit.kd_unit} tanggal={tanggal} />
        </div>
      </div>
    </AppLayout>
  );
}
