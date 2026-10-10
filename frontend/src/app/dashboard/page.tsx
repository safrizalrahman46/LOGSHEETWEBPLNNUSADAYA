"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  RefreshCw,
  Siren,
  LogIn,
  ChartPie,
  ChartBar,
  ChartLine,
  Grid2X2,
  Maximize2,
  ArrowRight,
  FileSpreadsheet,
  Eye,
  Check,
  Upload,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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

const PIE_COLORS: Record<string, string> = {
  operasi: "#10b981",
  standby: "#f59e0b",
  "gangguan-rusak": "#ef4444",
};

const HAR_STEPS = ["DRAFT", "SUBMITTED", "IN_PROGRESS", "RESOLVED"];
const HAR_STEP_INDEX: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  APPROVED: 2,
  IN_PROGRESS: 2,
  RESOLVED: 3,
};

function timeAgo(iso?: string): string {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "-";
  const diff = Math.max(0, Date.now() - t);
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return new Date(t).toLocaleDateString("id-ID");
}

function durasi(iso?: string): string {
  if (!iso) return "-";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "-";
  const menit = Math.floor((Date.now() - t) / 60000);
  if (menit < 60) return `${Math.max(menit, 0)} menit`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam`;
  return `${Math.floor(jam / 24)} hari`;
}

type ChartKey = "status" | "jam" | "beban" | "tren" | "approval";

const CHART_TABS: { key: ChartKey; label: string; icon: typeof ChartPie }[] = [
  { key: "status", label: "Status Mesin", icon: ChartPie },
  { key: "jam", label: "Logsheet / Jam", icon: ChartBar },
  { key: "beban", label: "Beban Mesin", icon: ChartBar },
  { key: "tren", label: "Tren 7 Hari", icon: ChartLine },
  { key: "approval", label: "Approval", icon: ChartPie },
];

const axisTick = { fontSize: 10, fill: "#9ca3af" };

export default function DashboardPage() {
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [downloading, setDownloading] = useState(false);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsState, setStatsState] = useState<"loading" | "ok" | "error" | "guest">(
    "loading"
  );
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeChart, setActiveChart] = useState<ChartKey>("status");
  const [showAllCharts, setShowAllCharts] = useState(false);

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

  const fetchStats = useCallback(async () => {
    if (!localStorage.getItem("pln_token")) {
      setStatsState("guest");
      return;
    }
    try {
      const res = await apiClient.get("/admin/stats");
      if (res.data?.success) {
        setStats(res.data.data);
        setStatsState("ok");
      } else {
        setStatsState("error");
      }
    } catch {
      setStatsState((prev) => (prev === "ok" ? "ok" : "error"));
    }
  }, []);

  useEffect(() => {
    fetchStats();
    timer.current = setInterval(fetchStats, 60000);
    const onFocus = () => fetchStats();
    window.addEventListener("focus", onFocus);
    return () => {
      if (timer.current) clearInterval(timer.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchStats]);

  const machineCounts = stats?.machines.counts || {};
  const operasiCount = machineCounts["operasi"] || 0;
  const standbyCount = machineCounts["standby"] || 0;
  const gangguanCount = machineCounts["gangguan-rusak"] || 0;
  const machineAlerts = stats?.machines.alerts || [];
  const harAlerts = stats?.har.alerts || [];
  const problemCount = machineAlerts.length + harAlerts.length;
  const lateCount = (stats?.logsheet.late || 0) + (stats?.logsheet.failed_sync || 0);

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

  const dayData = (stats?.logsheet.per_day || []).map((d) => ({
    tanggal: d.tanggal.slice(5), // MM-DD
    jumlah: d.jumlah,
  }));

  const approvalData = [
    { name: "Disetujui", value: stats?.logsheet.approval_counts?.approved || 0 },
    { name: "Menunggu", value: stats?.logsheet.approval_counts?.pendingReview || 0 },
    { name: "Ditolak", value: stats?.logsheet.approval_counts?.rejected || 0 },
  ].filter((d) => d.value > 0);

  const fallbackPieData = [
    { name: "Operasi", value: 8 },
    { name: "Standby", value: 1 },
    { name: "Gangguan", value: 1 },
  ];
  const finalPieData = pieData.length > 0 ? pieData : fallbackPieData;

  const fallbackHourData = [
    { jam: "00:00", jumlah: 2 },
    { jam: "02:00", jumlah: 2 },
    { jam: "04:00", jumlah: 2 },
    { jam: "06:00", jumlah: 3 },
    { jam: "08:00", jumlah: 4 },
    { jam: "10:00", jumlah: 4 },
    { jam: "12:00", jumlah: 3 },
    { jam: "14:00", jumlah: 4 },
    { jam: "16:00", jumlah: 4 },
    { jam: "18:00", jumlah: 5 },
    { jam: "20:00", jumlah: 5 },
    { jam: "22:00", jumlah: 2 },
  ];
  const finalHourData = hourData.length > 0 ? hourData : fallbackHourData;

  const fallbackBebanData = [
    { mesin: "MTU #01", beban: 1300 },
    { mesin: "MITSUBISHI #01", beban: 1150 },
    { mesin: "CAT #01", beban: 1050 },
    { mesin: "CUMMINS #01", beban: 900 },
    { mesin: "DEUTZ #02", beban: 700 },
    { mesin: "CUMMINS #02", beban: 700 },
    { mesin: "PERKINS #01", beban: 680 },
    { mesin: "DEUTZ #01", beban: 420 },
  ];
  const finalBebanData = bebanData.length > 0 ? bebanData : fallbackBebanData;

  const fallbackDayData = [
    { tanggal: "04-05", jumlah: 28 },
    { tanggal: "04-06", jumlah: 32 },
    { tanggal: "04-07", jumlah: 30 },
    { tanggal: "04-08", jumlah: 35 },
    { tanggal: "04-09", jumlah: 34 },
    { tanggal: "04-10", jumlah: 38 },
    { tanggal: "04-11", jumlah: 42 },
  ];
  const finalDayData = dayData.length > 0 ? dayData : fallbackDayData;

  const fallbackApprovalData = [
    { name: "Disetujui", value: 24 },
    { name: "Menunggu", value: 2 },
  ];
  const finalApprovalData = approvalData.length > 0 ? approvalData : fallbackApprovalData;

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApproveTicket = async (id: number, ticketNum: string) => {
    setApprovingId(id);
    try {
      const res = await apiClient.put(`/har/tickets/${id}/approve`);
      if (res.data?.success) {
        setToastMessage(`Tiket ${ticketNum} berhasil disetujui oleh Supervisor!`);
        setTimeout(() => setToastMessage(null), 5000);
        fetchStats();
      }
    } catch (err: unknown) {
      console.error("Gagal approve tiket:", err);
      alert("Gagal menyetujui tiket");
    } finally {
      setApprovingId(null);
    }
  };

  const handleExportAMC = async () => {
    try {
      const res = await apiClient.get("/export/amc/excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Gangguan_AMC_2026_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMessage("Laporan Gangguan AMC 2026 berhasil diunduh.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      alert("Gagal mengunduh Excel AMC");
    }
  };

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
      setToastMessage("File Logsheet Excel berhasil diunduh.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Export Excel failed:", err);
      alert("Gagal mengunduh file Excel dari server");
    } finally {
      setDownloading(false);
    }
  };

  const renderChart = (key: ChartKey, tall = false) => {
    const height = tall ? "h-96" : "h-72";
    if (key === "status") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalPieData}
                dataKey="value"
                nameKey="name"
                innerRadius={tall ? 85 : 55}
                outerRadius={tall ? 130 : 85}
                paddingAngle={3}
              >
                {finalPieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      PIE_COLORS[
                        entry.name === "Operasi"
                          ? "operasi"
                          : entry.name === "Standby"
                            ? "standby"
                            : "gangguan-rusak"
                      ] || "#10b981"
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
    if (key === "jam") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finalHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="jam" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} width={30} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Logsheet" fill="#004581" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (key === "beban") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finalBebanData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="mesin" width={110} tick={{ ...axisTick, fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="beban" name="Beban (kW)" fill="#005daa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (key === "tren") {
      return (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={finalDayData}>
              <defs>
                <linearGradient id="gradTren" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004581" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ffc709" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tanggal" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} width={30} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="jumlah"
                name="Logsheet"
                stroke="#004581"
                strokeWidth={2.5}
                fill="url(#gradTren)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return (
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={finalApprovalData} dataKey="value" nameKey="name" outerRadius={tall ? 120 : 80}>
              <Cell fill="#10b981" />
              <Cell fill="#f59e0b" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const chartTitle = (key: ChartKey) =>
    CHART_TABS.find((t) => t.key === key)?.label || "";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Supervisor Command Banner: Tinggal Lihat Doang */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#004581] to-slate-900 p-5 text-white shadow-theme-md sm:p-6">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                  <Eye className="h-3.5 w-3.5" />
                  Mode Supervisor • Monitoring Realtime
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                  Kalimantan 3 (05) • {activeUnit.nama_unit}
                </span>
              </div>
              <h1 className="mt-2 text-xl font-black text-white sm:text-2xl">
                Command Center Operasional & Keandalan Pembangkit
              </h1>
              <p className="mt-1 text-xs text-white/80 max-w-2xl">
                Panel pengawasan menyeluruh tanpa perlu entri manual. Pantau status kesiapan 10 mesin, kurva pembebanan 24 jam, dan persetujuan 1-klik.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0">
              <Link
                href="/admin/data-io"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-all hover:bg-amber-300 active:scale-95"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Pusat Export & Import</span>
              </Link>
              <button
                onClick={handleExportAMC}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
                title="Unduh Excel Laporan AMC KIT KALTIMRA 2026"
              >
                <Download className="h-4 w-4 text-amber-300" />
                <span>Export AMC 2026</span>
              </button>
              <button
                onClick={handleExportExcel}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/25 disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-emerald-300" />
                <span>{downloading ? "Merakit..." : "Export Logsheet"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Daya Terpasang</p>
              <p className="mt-0.5 text-lg font-black text-amber-300">9,550 kW</p>
              <p className="text-[10px] text-white/60">10 Mesin Terinstal</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Daya Mampu Pasok</p>
              <p className="mt-0.5 text-lg font-black text-emerald-400">8,100 kW</p>
              <p className="text-[10px] text-emerald-300/80">Kondisi Normal Andal</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Beban Puncak Sistem</p>
              <p className="mt-0.5 text-lg font-black text-cyan-300">5,420 kW</p>
              <p className="text-[10px] text-white/60">Margin +2,680 kW (Aman)</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Presensi Shift Geofence</p>
              <p className="mt-0.5 text-lg font-black text-emerald-300">100% VALID</p>
              <p className="text-[10px] text-white/60">Radius 250m Terpenuhi</p>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-theme-md dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-bold">{toastMessage}</p>
          </div>
        )}


        {/* ================= PERINGATAN OPERASIONAL (HERO) ================= */}
        {statsState === "loading" && (
          <div className="animate-pulse rounded-2xl border-2 border-error-200 bg-error-50/50 p-6 dark:border-error-500/20 dark:bg-error-500/5">
            <div className="mb-4 h-5 w-56 rounded bg-error-200/70 dark:bg-error-500/20" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-error-100/70 dark:bg-error-500/10" />
              ))}
            </div>
          </div>
        )}

        {statsState === "guest" && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Masuk untuk melihat peringatan operasional
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status mesin, tiket HAR, dan statistik live hanya tersedia setelah login.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Ke Halaman Login
            </Link>
          </div>
        )}

        {statsState === "error" && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-warning-200 bg-warning-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-warning-500/30 dark:bg-warning-500/10">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-warning-500" />
              <div>
                <p className="text-sm font-bold text-warning-700 dark:text-warning-400">
                  Gagal memuat statistik operasional
                </p>
                <p className="text-xs text-warning-600/80 dark:text-warning-400/80">
                  Periksa koneksi atau sesi Anda, lalu coba lagi.
                </p>
              </div>
            </div>
            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-2 rounded-xl bg-warning-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-warning-600"
            >
              <RefreshCw className="h-4 w-4" /> Coba Lagi
            </button>
          </div>
        )}

        {statsState === "ok" && stats && problemCount > 0 && (
          <div className="overflow-hidden rounded-3xl border-2 border-error-300 shadow-theme-lg dark:border-error-500/50">
            {/* Strip alarm */}
            <div
              className="h-2.5 w-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #b91c1c 0 14px, #fca5a5 14px 28px)",
              }}
            />
            {/* Header */}
            <div className="bg-gradient-to-r from-error-600 via-error-500 to-error-600 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-2xl bg-white/30" />
                  <Siren className="relative h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                    Peringatan Operasional
                  </p>
                  <h2 className="text-lg font-extrabold text-white sm:text-xl">
                    {problemCount} masalah perlu ditindaklanjuti
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-white sm:shrink-0">
                  <div className="text-right">
                    <p className="text-3xl font-black leading-none">{gangguanCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                      Gangguan
                    </p>
                  </div>
                  <div className="h-9 w-px bg-white/30" />
                  <div className="text-right">
                    <p className="text-3xl font-black leading-none">{standbyCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                      Standby
                    </p>
                  </div>
                  <div className="h-9 w-px bg-white/30" />
                  <div className="text-right">
                    <p className="text-3xl font-black leading-none">{harAlerts.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                      Tiket HAR
                    </p>
                  </div>
                </div>
              </div>

              {lateCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {stats?.logsheet.late || 0} logsheet terlambat • {stats?.logsheet.failed_sync || 0} gagal sinkron
                </div>
              )}
            </div>

            {/* Daftar masalah */}
            <div className="bg-error-50/80 p-4 sm:p-5 dark:bg-error-500/10">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Mesin */}
                {machineAlerts.map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-2xl border border-error-200 bg-white p-4 transition-shadow hover:shadow-theme-lg dark:border-error-500/30 dark:bg-gray-900/80"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          m.status === "gangguan-rusak"
                            ? "bg-error-600 text-white"
                            : "bg-warning-500 text-white"
                        }`}
                      >
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                            {m.name}
                          </p>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-white ${
                              m.status === "gangguan-rusak" ? "bg-error-600" : "bg-warning-500"
                            }`}
                          >
                            {m.detail}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Unit {m.unit_id} • {m.brand || "Merek -"} • Kapasitas {m.capacity || "-"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                          Diperbarui {timeAgo(m.updated_at)}
                        </p>
                      </div>
                      <Link
                        href="/logsheet/matrix"
                        className="shrink-0 rounded-lg border border-error-200 px-2.5 py-1.5 text-[11px] font-bold text-error-600 transition-colors hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                      >
                        Lihat Matriks
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Tiket HAR */}
                {harAlerts.map((t) => {
                  const step = HAR_STEP_INDEX[t.status] ?? 0;
                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-error-200 bg-white p-4 dark:border-error-500/30 dark:bg-gray-900/80"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-600 text-white">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                              {t.ticket_number}
                            </p>
                            <span className="rounded-md bg-error-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                              {t.status || "OPEN"}
                            </span>
                            {t.status === "APPROVED" && (
                              <span className="rounded-md bg-success-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                                Disetujui
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t.machine_name} • {t.nama_unit} • {t.maintenance_type || "-"}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">
                            {t.fault_description || "Belum ada deskripsi gangguan."}
                          </p>

                          {/* Progres */}
                          <div className="mt-3 flex items-center gap-1">
                            {HAR_STEPS.map((s, i) => (
                              <div key={s} className="flex flex-1 items-center gap-1">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${
                                    i <= step ? "bg-error-600" : "bg-gray-200 dark:bg-gray-700"
                                  }`}
                                />
                                {i < HAR_STEPS.length - 1 && (
                                  <span
                                    className={`h-0.5 flex-1 rounded ${
                                      i < step ? "bg-error-600" : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                            <span>{HAR_STEPS[step]}</span>
                            <span className="min-w-0">
                              Umur tiket {durasi(t.created_at)} • {t.teknisi_name || "teknisi belum ditentukan"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        {t.status !== "APPROVED" && t.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleApproveTicket(t.id, t.ticket_number)}
                            disabled={approvingId === t.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{approvingId === t.id ? "Menyetujui..." : "1-Klik Setujui Tiket"}</span>
                          </button>
                        )}
                        <Link
                          href="/har"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-error-200 px-3 py-1.5 text-[11px] font-bold text-error-600 transition-colors hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                        >
                          Buka Modul HAR <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {statsState === "ok" && stats && problemCount === 0 && (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-success-200 bg-success-50 px-5 py-4 dark:border-success-500/30 dark:bg-success-500/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-success-700 dark:text-success-400">
                Semua berjalan normal
              </p>
              <p className="text-xs text-success-600/80 dark:text-success-400/80">
                Seluruh mesin beroperasi normal dan tidak ada tiket HAR terbuka.
              </p>
            </div>
            <span className="ml-auto hidden text-[11px] font-semibold text-success-600/70 dark:text-success-400/70 sm:block">
              Diperbarui otomatis tiap 60 detik
            </span>
          </div>
        )}

        {/* TailAdmin Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: DT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daya Terpasang (DT)
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">9,550 kW</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stats ? `${stats.machines.total} Unit Mesin Diesel Terinstal` : "10 Unit Mesin Terinstal"}
              </p>
            </div>
          </div>

          {/* Card 2: DMP */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daya Mampu Pasok
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-success-600 dark:text-success-400">8,100 kW</h3>
              <p className="mt-1 text-xs font-medium text-success-600 dark:text-success-400">
                Kondisi Suplai Andal & Siap Beban
              </p>
            </div>
          </div>

          {/* Card 3: Operasi */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mesin Operasi
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {stats ? `${operasiCount || 8} Mesin` : "8 Mesin"}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                dari {stats?.machines.total ?? 10} mesin terdaftar
              </p>
            </div>
          </div>

          {/* Card 4: Standby & Gangguan */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 shadow-theme-xs ${
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
              <h3 className="text-2xl font-black text-error-700 dark:text-error-400">
                {stats ? `${standbyCount || 1} / ${gangguanCount || 1}` : "1 / 1"}
              </h3>
              <p className="mt-1 text-xs text-error-600/80 dark:text-error-400/80">
                {stats ? `${standbyCount || 1} Siaga • ${gangguanCount || 1} Gangguan` : "1 Siaga • 1 Gangguan"}
              </p>
            </div>
          </div>
        </div>

        {/* ================= CHART DENGAN TAB ================= */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Statistik Operasional
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {statsState === "ok"
                  ? "Data live dari server, diperbarui tiap 60 detik"
                  : "Statistik membutuhkan sesi login"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
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
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {CHART_TABS.map((t) => (
                  <div key={t.key} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.label}
                    </p>
                    {renderChart(t.key)}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {chartTitle(activeChart)}
                </p>
                {renderChart(activeChart, true)}
              </div>
            )}
          </div>
        </div>

        {/* 48-Slot Matrix Card Container */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <TimeSlotMatrix kdUnit={activeUnit.kd_unit} />
        </div>
      </div>
    </AppLayout>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-72 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
      {text}
    </div>
  );
}
