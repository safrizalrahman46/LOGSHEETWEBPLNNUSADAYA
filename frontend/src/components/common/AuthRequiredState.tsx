"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lock,
  LogIn,
  ArrowLeft,
  ShieldAlert,
  Home,
  UserCheck,
  HelpCircle,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
} from "lucide-react";

interface AuthRequiredStateProps {
  title?: string;
  description?: string;
  moduleName?: string;
  redirectUrl?: string;
  isInline?: boolean;
}

export function AuthRequiredState({
  title = "Mohon Login Terlebih Dahulu",
  description = "Akses Terkunci — Halaman atau fitur ini khusus untuk personil resmi PT PLN Services (Operator Pembangkit, Teknisi HAR, Supervisor, atau Administrator).",
  moduleName,
  redirectUrl,
  isInline = false,
}: AuthRequiredStateProps) {
  const currentPath = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalRedirect = redirectUrl || (mounted ? currentPath : "/dashboard");

  return (
    <div
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center text-center select-none ${
        isInline
          ? "py-12 px-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-xl"
          : "min-h-[75vh] py-16 px-4 sm:px-6 lg:px-8"
      }`}
    >
      {/* Decorative Background Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Stylized Error Badge (401 / AKSES TERKUNCI) */}
      <div className="relative mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300 text-xs font-black tracking-wider uppercase shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          401 • AKSES DIBATASI (LOGIN REQUIRED)
        </div>
      </div>

      {/* Big Visual Lock Icon Circle (404/Error Style) */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Giant ghost number behind */}
        <span
          className="absolute font-black text-gray-100 dark:text-gray-800/50 select-none pointer-events-none leading-none tracking-tighter"
          style={{ fontSize: "clamp(110px, 20vw, 190px)" }}
        >
          401
        </span>

        {/* Foreground Glow Shield Icon */}
        <div className="relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 p-0.5 shadow-2xl shadow-amber-500/30">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white dark:bg-gray-900">
            <Lock className="h-11 w-11 sm:h-12 sm:w-12 text-amber-500 dark:text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Heading & Module Name */}
      <div className="relative z-10 max-w-xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>

        {moduleName && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-700">
            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
            <span>Modul Terkunci:</span>
            <span className="font-mono text-brand-600 dark:text-brand-400">{moduleName}</span>
          </div>
        )}

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal pt-1">
          {description}
        </p>

        {/* Helpful Security Info Card */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 text-xs text-left text-gray-700 dark:text-gray-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-gray-900 dark:text-white">Perlindungan Integritas Data Sistem:</strong>
              <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                Pencatatan parameter beban mesin, pelaporan tiket pemeliharaan HAR, dan absensi GPS hanya dapat diisi oleh petugas berwenang yang telah terotentikasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md">
        <Link
          href={`/login?redirect=${encodeURIComponent(finalRedirect)}`}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all text-center"
        >
          <LogIn className="h-4 w-4" />
          <span>Masuk ke Akun (Login)</span>
        </Link>

        <Link
          href="/guest"
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm shadow-sm hover:-translate-y-0.5 transition-all text-center"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dasbor Publik (Guest)</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-all text-center"
          title="Ke Beranda Utama Portal"
        >
          <Home className="h-4 w-4" />
          <span className="sm:hidden">Beranda</span>
        </Link>
      </div>

      {/* Footer Support Info */}
      <div className="relative z-10 mt-8 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Belum memiliki akun resmi? Hubungi Administrator IT Unit Pelaksana PLN Services.</span>
      </div>
    </div>
  );
}
