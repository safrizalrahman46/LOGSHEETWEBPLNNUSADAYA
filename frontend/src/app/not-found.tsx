"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/15 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 text-xs font-black tracking-wider uppercase shadow-sm mb-6">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        404 • HALAMAN TIDAK DITEMUKAN
      </div>

      {/* Big 404 Number */}
      <div className="relative mb-6 flex items-center justify-center">
        <span
          className="font-black text-gray-200 dark:text-gray-800/60 select-none pointer-events-none leading-none tracking-tighter"
          style={{ fontSize: "clamp(120px, 22vw, 220px)" }}
        >
          404
        </span>

        <div className="absolute flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-2xl shadow-rose-500/25">
          <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white dark:bg-gray-900">
            <Search className="h-11 w-11 sm:h-12 sm:w-12 text-rose-500 dark:text-rose-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Title & Desc */}
      <div className="relative z-10 max-w-md mx-auto space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Tautan yang Anda tuju mungkin salah ketik, telah dipindahkan, atau memerlukan izin khusus personil PLN.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md">
        <Link
          href="/guest"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dasbor Publik (Guest)</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm shadow-sm transition-all hover:scale-102"
        >
          <Home className="h-4 w-4" />
          <span>Beranda Portal</span>
        </Link>
      </div>

      {/* Support footer */}
      <div className="relative z-10 mt-8 text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Sistem Informasi Logsheet & Operasional PLTD • PT PLN Nusa Daya</span>
      </div>
    </div>
  );
}
