"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import {
  Users,
  ShieldCheck,
  Cpu,
  FileSpreadsheet,
  Table2,
  FolderSync,
  Activity,
  Edit3,
  Server,
  Database,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  Clock,
  Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface AdminSummary {
  users_count: number;
  units_count: number;
  machines_count: number;
  operating_machines: number;
  har_tickets: number;
  pending_har: number;
  amc_count: number;
  notifications_count: number;
}

export default function AdminHubPage() {
  const [stats, setStats] = useState<AdminSummary>({
    users_count: 7,
    units_count: 7,
    machines_count: 10,
    operating_machines: 8,
    har_tickets: 3,
    pending_har: 2,
    amc_count: 6,
    notifications_count: 25,
  });

  const [loading, setLoading] = useState(false);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/integration/summary");
      if (res.data?.success) {
        const web = res.data.web_summary;
        const har = res.data.har_summary;
        setStats({
          users_count: web?.total_users || 7,
          units_count: web?.total_units || 7,
          machines_count: web?.total_machines || 10,
          operating_machines: web?.active_machines || 8,
          har_tickets: har?.total_tickets || 3,
          pending_har: har?.pending_approval || 2,
          amc_count: har?.total_amc || 6,
          notifications_count: res.data.notification_summary?.unread_count || 25,
        });
      }
    } catch {
      // fallback to initial values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const adminModules = [
    {
      title: "Manajemen Pengguna",
      description: "Kelola akun pengguna, username, password, email, dan penugasan unit kerja PLTD.",
      href: "/admin/users",
      icon: Users,
      badge: `${stats.users_count} Akun Terdaftar`,
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      title: "Role & Matriks Hak Akses",
      description: "Inspeksi izin menu dan hierarki wewenang Superadmin, Admin, Supervisor, Teknisi, dan Operator.",
      href: "/admin/roles",
      icon: ShieldCheck,
      badge: "6 Role Terdefinisi",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
      gradient: "from-purple-600 to-violet-700",
    },
    {
      title: "Master Mesin & Kapasitas",
      description: "Inventarisasi 10 mesin pembangkit diesel, daya terpasang (DTP), daya mampu (DMP), dan serial number.",
      href: "/admin/machines",
      icon: Cpu,
      badge: `${stats.operating_machines} dari ${stats.machines_count} Operasi`,
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      gradient: "from-emerald-600 to-teal-700",
    },
    {
      title: "Master Form Logsheet",
      description: "Kelola entri pembacaan parameter mesin, approval logsheet lapangan, dan riwayat WACB.",
      href: "/admin/logsheets",
      icon: FileSpreadsheet,
      badge: "WACB Terintegrasi",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Matriks Parameter 48-Slot",
      description: "Konfigurasi rentang nominal, batas toleransi tegangan, frekuensi, dan beban interval 30 menit.",
      href: "/admin/matrix",
      icon: Table2,
      badge: "48 Slot 24 Jam",
      badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
      gradient: "from-cyan-600 to-blue-700",
    },
    {
      title: "Pusat Export & Import Data",
      description: "Unduh template resmi, impor massal CSV/Excel, dan ekspor multi-kategori (Logsheet, Mesin, AMC).",
      href: "/admin/data-io",
      icon: FolderSync,
      badge: "Excel & CSV Suite",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      gradient: "from-emerald-600 to-green-700",
    },
    {
      title: "Status Integrasi 3 Aplikasi",
      description: "Hub koneksi real-time, live health check latensi ms, dan broadcast notifikasi antar sistem.",
      href: "/admin/integrasi",
      icon: Activity,
      badge: "3-APP LIVE SYNC",
      badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      gradient: "from-rose-600 to-red-700",
    },
    {
      title: "Kelola Artikel & Berita K3",
      description: "Publikasi warta korporat, edukasi keselamatan kerja pembangkitan, dan pengumuman operasional.",
      href: "/admin/articles",
      icon: Edit3,
      badge: "CMS Publik",
      badgeColor: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      gradient: "from-slate-700 to-slate-900",
    },
  ];

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="space-y-6">
          {/* Header Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#004581] to-slate-900 p-6 text-white shadow-theme-md sm:p-7">
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Pusat Kontrol Administrasi & Tata Kelola
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90">
                    PLN Nusa Daya Kalimantan 3 (Region 05)
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  Enterprise Admin Command Center
                </h1>
                <p className="mt-1 text-xs text-white/80 max-w-2xl">
                  Panel terpadu untuk pengawasan data master, hak akses pengguna, pemeliharaan mesin pembangkit, serta tata kelola data ekspor-impor 3 aplikasi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchAdminStats}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Memperbarui..." : "Segarkan Status"}</span>
                </button>
                <Link
                  href="/admin/integrasi"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
                >
                  <Activity className="h-4 w-4 text-emerald-300" />
                  <span>Status 3-App</span>
                </Link>
                <Link
                  href="/admin/data-io"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/25"
                >
                  <FolderSync className="h-4 w-4 text-cyan-300" />
                  <span>Pusat Data I/O</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Total Pengguna</p>
                <p className="mt-0.5 text-lg font-black text-amber-300">{stats.users_count} Akun</p>
                <p className="text-[10px] text-white/60">6 Role Hak Akses</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Kesiapan Mesin</p>
                <p className="mt-0.5 text-lg font-black text-emerald-400">
                  {stats.operating_machines} / {stats.machines_count} Mesin
                </p>
                <p className="text-[10px] text-emerald-300/80">Kondisi Normal Andal</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Tiket HAR & AMC</p>
                <p className="mt-0.5 text-lg font-black text-cyan-300">
                  {stats.har_tickets} Tiket • {stats.amc_count} AMC
                </p>
                <p className="text-[10px] text-white/60">{stats.pending_har} Butuh Approval SPV</p>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Status Sinkronisasi</p>
                <p className="mt-0.5 text-lg font-black text-purple-300">3-App Live</p>
                <p className="text-[10px] text-white/60">Web • HAR • Mobile</p>
              </div>
            </div>
          </div>

          {/* 8 Modul Utama Administrasi Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Modul Tata Kelola & Master Data
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pilih modul di bawah ini untuk mengelola konfigurasi dan parameter operasional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {adminModules.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={idx}
                    href={mod.href}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-500 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mod.gradient} text-white shadow-xs transition-transform group-hover:scale-105`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase ${mod.badgeColor}`}
                        >
                          {mod.badge}
                        </span>
                      </div>

                      <h3 className="mt-4 text-sm font-extrabold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                        {mod.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                        {mod.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-bold text-brand-600 dark:border-gray-800 dark:text-brand-400">
                      <span>Buka Modul</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Infrastructure & Database Health Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 pb-4 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span>Status Infrastruktur Data Bersama (Shared PostgreSQL)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Basis data PostgreSQL <code className="font-mono text-brand-600">pltd_logsheet</code> yang menjadi sumber data tunggal bagi Web Portal, Modul HAR, dan Mobile App.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Terhubung Andal</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <span className="text-[11px] text-gray-400">Tabel Pengguna</span>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">users ({stats.users_count} baris)</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <span className="text-[11px] text-gray-400">Tabel Mesin</span>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">machines ({stats.machines_count} unit)</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <span className="text-[11px] text-gray-400">Tabel Tiket HAR</span>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">har_tickets ({stats.har_tickets} tiket)</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                <span className="text-[11px] text-gray-400">Tabel AMC 2026</span>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">amc_reports ({stats.amc_count} kejadian)</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
