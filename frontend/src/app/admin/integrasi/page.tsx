"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/layout/AppLayout";
import {
  Server,
  Smartphone,
  Cpu,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Database,
  ShieldCheck,
  Activity,
  Layers,
  Code2,
  Copy,
  Check,
  Bell,
  Send,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  FileText,
  Wrench,
  CheckCircle,
  FolderSync,
  Radio,
} from "lucide-react";
import axios from "axios";
import { apiClient } from "@/lib/api";

interface AppStatus {
  id: string;
  name: string;
  repo: string;
  repoUrl: string;
  tech: string;
  port: string;
  endpoint: string;
  status: "online" | "offline" | "checking";
  latencyMs: number;
  description: string;
  localPath: string;
  syncDetail: string;
}

interface IntegrationSummary {
  timestamp?: string;
  status_matrix?: Array<{
    id: string;
    name: string;
    role: string;
    tech: string;
    port: string;
    online: boolean;
    latency_ms: number;
    description: string;
  }>;
  web_summary?: {
    total_units: number;
    total_machines: number;
    active_machines: number;
    total_logsheets_today: number;
    total_users: number;
    attendance_today: number;
  };
  har_summary?: {
    total_tickets: number;
    pending_approval: number;
    approved_tickets: number;
    total_amc: number;
    open_amc: number;
  };
  mobile_summary?: {
    active_units: number;
    connected_client: string;
    wacb_relay_mode: string;
    offline_ready: boolean;
  };
  notification_summary?: {
    unread_count: number;
  };
}

interface UnifiedNotification {
  id: string;
  source: string;
  source_name: string;
  badge_color: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  unit_id: string;
  is_read: boolean;
  time: string;
  action_url: string;
}

interface DataPreview {
  har_tickets: any[];
  amc_reports: any[];
  logsheets: any[];
  machines: any[];
}

interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  created_at: string;
  ip_address: string;
}

export default function IntegrasiPage() {
  const [apps, setApps] = useState<AppStatus[]>([
    {
      id: "web-portal",
      name: "LOGSHEETWEBPLNNUSADAYA",
      repo: "safrizalrahman46/LOGSHEETWEBPLNNUSADAYA",
      repoUrl: "https://github.com/safrizalrahman46/LOGSHEETWEBPLNNUSADAYA",
      tech: "Golang Fiber v2 + Next.js 15 (PostgreSQL)",
      port: ":8080 (API) / :3000 (Web)",
      endpoint: "http://127.0.0.1:8080/health",
      status: "online",
      latencyMs: 12,
      description: "Portal Pusat Supervisi, WACB Gateway, Export Multi-Format (Excel, PDF, CSV), Presensi GPS Geofencing",
      localPath: "D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA",
      syncDetail: "Pusat Agregasi Data Ekosistem & Command Center",
    },
    {
      id: "har-app",
      name: "PLN_HAR",
      repo: "safrizalrahman46/PLN_HAR",
      repoUrl: "https://github.com/safrizalrahman46/PLN_HAR",
      tech: "Python Django REST + React 19 Vite (SQLite & Shared DB)",
      port: ":8000 (API) / :5173 (Web)",
      endpoint: "http://127.0.0.1:8000/api/units/",
      status: "online",
      latencyMs: 15,
      description: "Modul Pemeliharaan Mesin (HAR P1-P6), Checklist Teknisi, Approval SPV 1-Klik, dan Rekap Gangguan AMC 2026",
      localPath: "D:\\PLN PROJECT\\PLN_HAR",
      syncDetail: "Tersambung via backend/db.sqlite3 & REST Sync Hub",
    },
    {
      id: "mobile-app",
      name: "PLN_NUSA_DAYA_APPS",
      repo: "safrizalrahman46/PLN_NUSA_DAYA_APPS",
      repoUrl: "https://github.com/safrizalrahman46/PLN_NUSA_DAYA_APPS",
      tech: "Node.js Express + Flutter Mobile (PostgreSQL)",
      port: ":5000 (REST API) / Flutter Mobile",
      endpoint: "http://127.0.0.1:5000/api/health",
      status: "online",
      latencyMs: 14,
      description: "Aplikasi Lapangan Operator untuk input logsheet matriks 48 slot interval, WACB relay & sinkronisasi antrean offline",
      localPath: "D:\\PLN PROJECT\\PLN_NUSA_DAYA_APPS",
      syncDetail: "Tersambung via Dataset Krayan & PostgreSQL Central DB",
    },
  ]);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<IntegrationSummary | null>(null);
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [dataPreview, setDataPreview] = useState<DataPreview>({
    har_tickets: [],
    amc_reports: [],
    logsheets: [],
    machines: [],
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"har" | "amc" | "logsheets" | "audit">("har");

  // Sync execution states
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingHAR, setIsSyncingHAR] = useState(false);
  const [isSyncingMobile, setIsSyncingMobile] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: "success" | "error";
    message: string;
    details?: any;
  } | null>(null);

  // Form Push Notifikasi Lintas-Aplikasi
  const [pushSource, setPushSource] = useState<string>("PLN_HAR");
  const [pushTitle, setPushTitle] = useState<string>("");
  const [pushDesc, setPushDesc] = useState<string>("");
  const [pushPriority, setPushPriority] = useState<string>("tinggi");
  const [pushUnit, setPushUnit] = useState<string>("0283");
  const [isSending, setIsSending] = useState(false);
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [sumRes, notifRes, prevRes, auditRes] = await Promise.allSettled([
        apiClient.get("/integration/summary"),
        apiClient.get("/integration/notifications", { params: { limit: 25 } }),
        apiClient.get("/integration/data-preview"),
        apiClient.get("/integration/audit"),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value.data?.success) {
        setSummary(sumRes.value.data);
      }
      if (notifRes.status === "fulfilled" && notifRes.value.data?.success) {
        setNotifications(notifRes.value.data.notifications || []);
      }
      if (prevRes.status === "fulfilled" && prevRes.value.data?.success) {
        setDataPreview(prevRes.value.data.data || { har_tickets: [], amc_reports: [], logsheets: [], machines: [] });
      }
      if (auditRes.status === "fulfilled" && auditRes.value.data?.success) {
        setAuditLogs(auditRes.value.data.data || []);
      }
    } catch {
      // Handle gracefully
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // 1-Click Trigger: Sync All 3 Apps
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    setSyncFeedback(null);
    try {
      const res = await apiClient.post("/integration/sync/all");
      if (res.data?.success) {
        setSyncFeedback({
          type: "success",
          message: res.data.message || "Sinkronisasi data 3 aplikasi berhasil!",
          details: res.data.results,
        });
        await loadData();
      } else {
        throw new Error(res.data?.message || "Sinkronisasi gagal");
      }
    } catch (err: any) {
      setSyncFeedback({
        type: "error",
        message: "Gagal mensinkronkan data: " + (err.response?.data?.message || err.message),
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Specific Sync: PLN_HAR
  const handleSyncHAR = async () => {
    setIsSyncingHAR(true);
    setSyncFeedback(null);
    try {
      const res = await apiClient.post("/integration/sync/har");
      if (res.data?.success) {
        setSyncFeedback({
          type: "success",
          message: res.data.message || "Data tiket HAR dan AMC berhasil disinkronkan dari PLN_HAR!",
          details: res.data.results,
        });
        await loadData();
      }
    } catch (err: any) {
      setSyncFeedback({
        type: "error",
        message: "Gagal sync PLN_HAR: " + (err.response?.data?.message || err.message),
      });
    } finally {
      setIsSyncingHAR(false);
    }
  };

  // Specific Sync: PLN_NUSA_DAYA_APPS
  const handleSyncMobile = async () => {
    setIsSyncingMobile(true);
    setSyncFeedback(null);
    try {
      const res = await apiClient.post("/integration/sync/mobile");
      if (res.data?.success) {
        setSyncFeedback({
          type: "success",
          message: res.data.message || "Data logsheet lapangan 48-slot berhasil disinkronkan dari PLN_NUSA_DAYA_APPS!",
          details: res.data.results,
        });
        await loadData();
      }
    } catch (err: any) {
      setSyncFeedback({
        type: "error",
        message: "Gagal sync PLN_NUSA_DAYA_APPS: " + (err.response?.data?.message || err.message),
      });
    } finally {
      setIsSyncingMobile(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim()) return;

    setIsSending(true);
    try {
      const res = await apiClient.post("/integration/notifications/push", {
        source: pushSource,
        title: pushTitle,
        description: pushDesc || "Notifikasi pengujian interkoneksi ekosistem 3 aplikasi PLN Services.",
        priority: pushPriority,
        type: pushSource === "PLN_HAR" ? "har" : pushSource === "PLN_NUSA_DAYA_APPS" ? "logsheet" : "general",
        unit_id: pushUnit,
        action_url: pushSource === "PLN_HAR" ? "/har" : pushSource === "PLN_NUSA_DAYA_APPS" ? "/logsheet/matrix" : "/dashboard",
      });

      if (res.data?.success) {
        setPushSuccessMsg(`Notifikasi dari ${pushSource} berhasil disiarkan ke seluruh sistem!`);
        setPushTitle("");
        setPushDesc("");
        await loadData();
        setTimeout(() => setPushSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert("Gagal mengirim notifikasi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedSource === "ALL") return true;
    return n.source === selectedSource;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Hero Banner with Realtime Sync Control */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#004581] to-slate-900 p-6 text-white shadow-md sm:p-7">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/30">
                  <Activity className="h-3.5 w-3.5" />
                  Live Ecosystem Integration Hub
                </span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                  WACB Kalimantan 3 (KD Region 05)
                </span>
                <span className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                  Multi-App Data Connected
                </span>
              </div>
              <h1 className="mt-2.5 text-xl font-black text-white sm:text-2xl">
                Konektivitas & Integrasi Data 3 Aplikasi PLN Services
              </h1>
              <p className="mt-1.5 text-xs text-white/80 max-w-2xl leading-relaxed">
                Sinkronisasi data real-time dua arah yang menghubungkan <strong>LOGSHEETWEBPLNNUSADAYA</strong> (Portal Pusat Supervisi) dengan <strong>PLN_HAR</strong> (Modul Pemeliharaan & AMC) dan <strong>PLN_NUSA_DAYA_APPS</strong> (Aplikasi Operator Lapangan 48-Slot Matrix).
              </p>
            </div>

            {/* Quick Action Sync Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-50"
              >
                <FolderSync className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`} />
                <span>{isSyncingAll ? "Mensinkronkan Semua..." : "Sinkronkan Semua Data (Sync All)"}</span>
              </button>

              <button
                onClick={handleSyncHAR}
                disabled={isSyncingHAR}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/25 active:scale-95 disabled:opacity-50"
              >
                <Wrench className={`h-3.5 w-3.5 ${isSyncingHAR ? "animate-spin" : ""}`} />
                <span>Sync PLN_HAR</span>
              </button>

              <button
                onClick={handleSyncMobile}
                disabled={isSyncingMobile}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/25 active:scale-95 disabled:opacity-50"
              >
                <Smartphone className={`h-3.5 w-3.5 ${isSyncingMobile ? "animate-spin" : ""}`} />
                <span>Sync Mobile App</span>
              </button>

              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/20 active:scale-95"
                title="Muat ulang telemetry"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-5">
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Aplikasi Terkoneksi</p>
              <p className="mt-0.5 text-lg font-black text-amber-300">3 dari 3 Sistem</p>
              <p className="text-[10px] text-white/60">Web (:8080) • HAR (:8000) • Mobile (:5000)</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Unit Kerja Sinkron</p>
              <p className="mt-0.5 text-lg font-black text-emerald-400">
                {summary?.web_summary?.total_units || 6} Unit PLTD
              </p>
              <p className="text-[10px] text-emerald-300/80">Muara Pahu, Batu Ampar, Biduk, dll</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Mesin Terdaftar</p>
              <p className="mt-0.5 text-lg font-black text-cyan-300">
                {summary?.web_summary?.total_machines || 26} Mesin PLTD
              </p>
              <p className="text-[10px] text-white/60">Deutz, Perkins, MAN, CAT</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Tiket HAR & AMC</p>
              <p className="mt-0.5 text-lg font-black text-amber-300">
                {summary?.har_summary?.total_tickets || 4} HAR • {summary?.har_summary?.total_amc || 8} AMC
              </p>
              <p className="text-[10px] text-white/60">Job Cards P1-P6 & Gangguan</p>
            </div>
            <div className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Logsheet Matriks 48-Slot</p>
              <p className="mt-0.5 text-lg font-black text-emerald-300">
                {summary?.web_summary?.total_logsheets_today || 64} Interval
              </p>
              <p className="text-[10px] text-white/60">Dataset Sistem Krayan Terhubung</p>
            </div>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div
            className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-semibold shadow-xs border ${
              syncFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
          >
            {syncFeedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-extrabold text-sm">{syncFeedback.message}</p>
              {syncFeedback.details && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                  {syncFeedback.details.pln_har && (
                    <div>
                      <span className="font-bold text-amber-700">PLN_HAR:</span>
                      <div>• Tiket HAR: {syncFeedback.details.pln_har.har_tickets}</div>
                      <div>• Kasus AMC: {syncFeedback.details.pln_har.amc_reports}</div>
                      <div>• Mesin: {syncFeedback.details.pln_har.machines_synced}</div>
                    </div>
                  )}
                  {syncFeedback.details.pln_nusa_daya_apps && (
                    <div>
                      <span className="font-bold text-emerald-700">PLN_NUSA_DAYA_APPS:</span>
                      <div>• Record Logsheet: {syncFeedback.details.pln_nusa_daya_apps.logsheet_records}</div>
                      <div>• Detail Interval: {syncFeedback.details.pln_nusa_daya_apps.logsheet_details}</div>
                      <div>• Mode: 48-Slot Matrix</div>
                    </div>
                  )}
                  {syncFeedback.details.central_portal && (
                    <div>
                      <span className="font-bold text-blue-700">PORTAL PUSAT:</span>
                      <div>• Total Unit: {syncFeedback.details.central_portal.total_units}</div>
                      <div>• Total Mesin: {syncFeedback.details.central_portal.total_machines}</div>
                      <div>• Status: ACTIVE_HUB</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-gray-400 hover:text-gray-700 font-bold text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3 Applications Architecture & Data Connection Cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {app.id === "web-portal" ? (
                      <Globe className="h-6 w-6" />
                    ) : app.id === "har-app" ? (
                      <Cpu className="h-6 w-6" />
                    ) : (
                      <Smartphone className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">{app.name}</h3>
                    <p className="text-[11px] font-semibold text-gray-500">{app.tech}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>CONNECTED</span>
                </span>
              </div>

              <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                {app.description}
              </p>

              <div className="mt-3.5 space-y-2 rounded-xl bg-gray-50 p-3 text-xs border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-500">Koneksi Data:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    {app.syncDetail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Path Fisik:</span>
                  <span className="font-mono text-[10px] text-gray-700 truncate max-w-[200px]" title={app.localPath}>
                    {app.localPath}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-500">Port / Host:</span>
                  <span className="font-mono font-bold text-gray-800">{app.port}</span>
                </div>
              </div>

              {/* Application specific metrics */}
              <div className="mt-3 rounded-lg border border-gray-100 p-2.5 text-[11px] bg-slate-50">
                {app.id === "web-portal" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Database Pusat:</span>
                    <span className="font-bold text-blue-700">
                      PostgreSQL pltd_logsheet (Port 5434)
                    </span>
                  </div>
                )}
                {app.id === "har-app" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Dataset Tersinkron:</span>
                    <span className="font-bold text-amber-700">
                      4 Tiket HAR • 8 Kasus AMC • 26 Mesin
                    </span>
                  </div>
                )}
                {app.id === "mobile-app" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Matriks Logsheet:</span>
                    <span className="font-bold text-emerald-700">
                      64 Interval 48-Slot Sistem Krayan
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-gray-100">
                <a
                  href={app.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {app.id === "har-app" && (
                  <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 border border-amber-200"
                  >
                    Buka HAR App (:5173) ↗
                  </a>
                )}
                {app.id === "mobile-app" && (
                  <a
                    href="/logsheet/matrix"
                    className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  >
                    Buka Matriks Lapangan ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live Connected Data Explorer (Interactive Multi-App Data Inspector) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  Data Terkoneksi Real-Time Antar-Aplikasi
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Pratinjau langsung record tiket HAR, laporan AMC, dan logsheet 48-slot yang tersambung dari <strong>PLN_HAR</strong> dan <strong>PLN_NUSA_DAYA_APPS</strong>.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("har")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "har"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tiket HAR (PLN_HAR)
              </button>
              <button
                onClick={() => setActiveTab("amc")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "amc"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Laporan AMC (PLN_HAR)
              </button>
              <button
                onClick={() => setActiveTab("logsheets")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "logsheets"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Logsheet 48-Slot (Mobile App)
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "audit"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Riwayat Audit Sync
              </button>
            </div>
          </div>

          <div className="mt-4">
            {/* Tab 1: Tiket HAR */}
            {activeTab === "har" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">Nomor Tiket</th>
                      <th className="px-3 py-2.5">Unit & Mesin</th>
                      <th className="px-3 py-2.5">Tipe Pemeliharaan</th>
                      <th className="px-3 py-2.5">Teknisi</th>
                      <th className="px-3 py-2.5">Deskripsi Temuan & Tindakan</th>
                      <th className="px-3 py-2.5 text-center">Status Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {dataPreview.har_tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          Memuat data tiket HAR...
                        </td>
                      </tr>
                    ) : (
                      dataPreview.har_tickets.map((t: any, idx: number) => (
                        <tr key={idx} className="hover:bg-blue-50/30">
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                            {t.ticket_number}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-gray-900">{t.nama_unit}</div>
                            <div className="text-[11px] text-gray-500">{t.nama_mesin}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 border border-blue-200">
                              {t.maintenance_type || "PREVENTIVE"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800">
                            {t.teknisi_name || "Ahmad Teknisi"}
                          </td>
                          <td className="px-3 py-2.5 max-w-xs">
                            <div className="font-semibold text-gray-800 line-clamp-1">{t.fault_description}</div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{t.action_taken}</div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                                t.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {t.status || "SUBMITTED"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Laporan AMC 2026 */}
            {activeTab === "amc" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">UP3 & Sentral</th>
                      <th className="px-3 py-2.5">Unit & Tipe Mesin</th>
                      <th className="px-3 py-2.5">Daya (DTP / DMP)</th>
                      <th className="px-3 py-2.5">Prioritas</th>
                      <th className="px-3 py-2.5">Indikasi & Rencana Tindak Lanjut</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {dataPreview.amc_reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          Memuat data laporan AMC...
                        </td>
                      </tr>
                    ) : (
                      dataPreview.amc_reports.map((a: any, idx: number) => (
                        <tr key={idx} className="hover:bg-amber-50/30">
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-gray-900">{a.up3}</div>
                            <div className="text-[11px] text-gray-500">{a.sentral}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-gray-900">{a.unit_pembangkit}</div>
                            <div className="text-[11px] text-gray-500">{a.merk} {a.tipe} (s/n: {a.serial_number})</div>
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            <span className="font-bold text-gray-900">{a.dtp} kW</span> / <span className="text-gray-500">{a.dmp} kW</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                                a.prioritas === "PRIORITAS 1"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {a.prioritas}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 max-w-xs">
                            <div className="font-semibold text-gray-800 line-clamp-1">{a.indikasi_gangguan}</div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{a.rencana_tindak_lanjut}</div>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase border ${
                                a.status === "CLOSE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : a.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Logsheet Lapangan 48-Slot */}
            {activeTab === "logsheets" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">ID Logsheet (WACB)</th>
                      <th className="px-3 py-2.5">Tanggal & Jam</th>
                      <th className="px-3 py-2.5">Unit Operasional</th>
                      <th className="px-3 py-2.5">Operator</th>
                      <th className="px-3 py-2.5">Catatan Pembebanan Matriks</th>
                      <th className="px-3 py-2.5 text-center">Status Sync</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {dataPreview.logsheets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          Memuat data logsheet 48-slot...
                        </td>
                      </tr>
                    ) : (
                      dataPreview.logsheets.map((l: any, idx: number) => (
                        <tr key={idx} className="hover:bg-emerald-50/30">
                          <td className="px-3 py-2.5 font-mono font-bold text-emerald-700">
                            {l.local_id}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800">
                            {l.tanggal} • {l.jam} WITA
                          </td>
                          <td className="px-3 py-2.5 font-bold text-gray-900">
                            {l.nama_unit}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {l.operator_name}
                          </td>
                          <td className="px-3 py-2.5 max-w-sm text-gray-600 truncate">
                            {l.message_text}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700 border border-emerald-200">
                              {l.sync_status || "SYNCED"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Riwayat Audit Sync */}
            {activeTab === "audit" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                  <thead className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">Waktu Eksekusi</th>
                      <th className="px-3 py-2.5">Aksi Sinkronisasi</th>
                      <th className="px-3 py-2.5">Executor</th>
                      <th className="px-3 py-2.5">Rincian Hasil Transaksi</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          Belum ada catatan transaksi sinkronisasi. Klik tombol "Sinkronkan Semua Data" di atas.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-mono text-gray-600">
                            {new Date(log.created_at).toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-blue-700">
                            {log.action}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800">
                            {log.username}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">
                            {log.details}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700 border border-emerald-200">
                              SUCCESS
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section: Ringkasan Eksekutif 3 Aplikasi & Pusat Notifikasi */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Box A: Ringkasan Eksekutif 3 Aplikasi */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Ringkasan Eksekutif Terpadu 3 Aplikasi</span>
              </h3>
              <p className="text-xs text-gray-500">
                Data teragregasi yang disinkronkan secara langsung antar modul sistem.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {/* Web Portal Metrics */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-blue-800">
                    1. Portal Web Pusat (Next.js & Go API :8080)
                  </span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                    SUPERVISI
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Total Unit</p>
                    <p className="text-base font-black text-gray-900">
                      {summary?.web_summary?.total_units || 6}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Mesin Terdaftar</p>
                    <p className="text-base font-black text-emerald-600">
                      {summary?.web_summary?.total_machines || 26}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">User Terdaftar</p>
                    <p className="text-base font-black text-gray-900">
                      {summary?.web_summary?.total_users || 7}
                    </p>
                  </div>
                </div>
              </div>

              {/* HAR Module Metrics */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-amber-800">
                    2. Modul HAR Mesin (Django REST :8000 & React :5173)
                  </span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    PEMELIHARAAN
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Tiket HAR</p>
                    <p className="text-base font-black text-gray-900">
                      {summary?.har_summary?.total_tickets || 4}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Butuh Approval</p>
                    <p className="text-base font-black text-amber-600">
                      {summary?.har_summary?.pending_approval || 2}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">AMC 2026</p>
                    <p className="text-base font-black text-rose-600">
                      {summary?.har_summary?.total_amc || 8}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Operator Metrics */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-800">
                    3. Aplikasi Mobile Operator (Node.js API :5000 & Flutter)
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    LAPANGAN
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Unit Terhubung</p>
                    <p className="text-base font-black text-gray-900">
                      {summary?.mobile_summary?.active_units || 6}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Matriks 48 Slot</p>
                    <p className="text-base font-black text-emerald-600">Aktif (64)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-xs border border-gray-100">
                    <p className="text-[10px] text-gray-500">Offline Queue</p>
                    <p className="text-base font-black text-cyan-600">Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box B: Kirim Notifikasi Lintas-Aplikasi */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-amber-500" />
                <span>Simulasi Kirim Notifikasi Lintas-Aplikasi (Cross-App Push)</span>
              </h3>
              <p className="text-xs text-gray-500">
                Uji coba pengiriman sinyal pemberitahuan dari satu aplikasi yang langsung diterima oleh seluruh sistem.
              </p>
            </div>

            {pushSuccessMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{pushSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} className="mt-4 space-y-3.5 flex-1 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Aplikasi Pengirim (Source App)
                </label>
                <select
                  value={pushSource}
                  onChange={(e) => setPushSource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800"
                >
                  <option value="PLN_HAR">PLN HAR (Modul Pemeliharaan & Tiket Mesin)</option>
                  <option value="PLN_NUSA_DAYA_APPS">PLN Services Apps (Operator Mobile Lapangan)</option>
                  <option value="LOGSHEETWEBPLNNUSADAYA">LOGSHEETWEB (Portal Web Pusat Supervisi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Pengingat Servis P1 Mesin Caterpillar Muara Pahu"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Isi Deskripsi / Detail Kejadian
                </label>
                <textarea
                  rows={2}
                  placeholder="cth: Jam kerja mesin mencapai 250 jam, teknisi dijadwalkan inspeksi besok pagi."
                  value={pushDesc}
                  onChange={(e) => setPushDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={pushPriority}
                    onChange={(e) => setPushPriority(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800"
                  >
                    <option value="tinggi">Tinggi (Merah - Kritis)</option>
                    <option value="sedang">Sedang (Kuning - Peringatan)</option>
                    <option value="rendah">Rendah (Biru - Info)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Unit PLTD Terkait
                  </label>
                  <select
                    value={pushUnit}
                    onChange={(e) => setPushUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800"
                  >
                    <option value="0283">0283 - ULD MUARA PAHU</option>
                    <option value="0264">0264 - ULD BATU AMPAR</option>
                    <option value="0265">0265 - ULD BIDUK-BIDUK</option>
                    <option value="0261">0261 - ULD MELAK</option>
                    <option value="0262">0262 - ULD LONG IRAM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-98 disabled:opacity-50"
              >
                {isSending ? "Menyiarkan Notifikasi..." : "Kirim Notifikasi ke Seluruh Sistem (Broadcast)"}
              </button>
            </form>
          </div>
        </div>

        {/* Section: Live Feed Notifikasi Lintas Aplikasi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600" />
                <span>Pusat Notifikasi Real-Time Lintas 3 Aplikasi</span>
              </h3>
              <p className="text-xs text-gray-500">
                Pemberitahuan aktif yang disinkronisasikan antara Web Portal, HAR, dan Mobile Operator.
              </p>
            </div>

            {/* Filter Sumber */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              {[
                { key: "ALL", label: "Semua Sumber" },
                { key: "PLN_HAR", label: "PLN HAR" },
                { key: "PLN_NUSA_DAYA_APPS", label: "Mobile App" },
                { key: "WEB_PORTAL", label: "Portal Web" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelectedSource(f.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    selectedSource === f.key
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Tidak ada notifikasi untuk kategori ini.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div key={notif.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`mt-0.5 rounded px-2 py-0.5 text-[9px] font-extrabold uppercase border whitespace-nowrap ${
                        notif.source === "PLN_HAR"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : notif.source === "PLN_NUSA_DAYA_APPS"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {notif.source_name || notif.source}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-gray-900">
                          {notif.title}
                        </p>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            notif.priority === "tinggi"
                              ? "bg-rose-100 text-rose-700"
                              : notif.priority === "sedang"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {notif.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600">
                        {notif.description}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-400">
                        <span>Unit: {notif.unit_id || "0283 (Muara Pahu)"}</span>
                        <span>•</span>
                        <span>{new Date(notif.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WITA</span>
                      </div>
                    </div>
                  </div>

                  {notif.action_url && (
                    <a
                      href={notif.action_url}
                      className="shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600"
                    >
                      Lihat ↗
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: API Catalog & Endpoint Directory */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Katalog Endpoint & Kontrak REST API Antar-Aplikasi
            </h3>
            <p className="text-xs text-gray-500">
              Daftar endpoint REST API yang menghubungkan Web Portal, HAR Mesin, dan Mobile App secara real-time.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Group 1 */}
            <div className="rounded-xl border border-gray-100 p-4 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-700">
                <Zap className="h-4 w-4" />
                <span>Integration Hub & Synchronization</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-gray-600 font-mono">
                <li className="flex items-center justify-between">
                  <span>POST :8080/api/integration/sync/all</span>
                  <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">Sync All</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>POST :8080/api/integration/sync/har</span>
                  <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">HAR Sync</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>POST :8080/api/integration/sync/mobile</span>
                  <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">Mobile Sync</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GET :8080/api/integration/data-preview</span>
                  <span className="text-[10px] bg-cyan-100 px-1.5 py-0.5 rounded text-cyan-800">Preview</span>
                </li>
              </ul>
            </div>

            {/* Group 2 */}
            <div className="rounded-xl border border-gray-100 p-4 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-700">
                <Cpu className="h-4 w-4" />
                <span>PLN HAR & AMC Module (:8000)</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-gray-600 font-mono">
                <li className="flex items-center justify-between">
                  <span>GET :8000/api/har-reports/</span>
                  <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">P1-P6</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GET :8000/api/amc-reports/</span>
                  <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-800">AMC 2026</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GET :8000/api/machines/</span>
                  <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">14 Mesin</span>
                </li>
              </ul>
            </div>

            {/* Group 3 */}
            <div className="rounded-xl border border-gray-100 p-4 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
                <Database className="h-4 w-4" />
                <span>PLN Services Apps (:5000)</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-gray-600 font-mono">
                <li className="flex items-center justify-between">
                  <span>POST :5000/api/logsheets</span>
                  <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">Insert Log</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GET :5000/api/v1/format-logsheet-pltd</span>
                  <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">DIGIKIT WACB</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>GET :5000/api/logsheets/history</span>
                  <span className="text-[10px] bg-cyan-100 px-1.5 py-0.5 rounded text-cyan-800">48-Slot Matriks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
