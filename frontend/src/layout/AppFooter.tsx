"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const AppFooter: React.FC = () => {
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  const healthUrl = "http://127.0.0.1:8080/health";

  useEffect(() => {
    // Health check ping to Go backend (IPv4 127.0.0.1 avoids Windows ::1 CORS conflict)
    fetch(healthUrl)
      .then((res) => {
        if (res.ok) setApiOnline(true);
        else setApiOnline(false);
      })
      .catch(() => setApiOnline(false));
  }, [healthUrl]);

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-5 transition-colors sm:px-6 lg:px-8 dark:border-gray-800 dark:bg-gray-900 select-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs">
        {/* Left Side: Brand and Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-theme-xs ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 overflow-hidden">
              <img
                src="/images/logo/LOGO-PLN.png"
                alt="Logo PLN"
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.includes("plnt.png")) img.src = "/images/plnt.png";
                }}
              />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200">PT PLN NUSA DAYA</span>
          </div>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
          <p className="text-[11px]">
            © {new Date().getFullYear()} Unit Pelaksana Pembangkitan Kalimantan 3 (Region 05). WACB DIGIKIT v2.4 Enterprise.
          </p>
        </div>

        {/* Right Side: Quick Links & Backend Status */}
        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
          <Link
            href="/"
            className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Landing Page
          </Link>
          <Link
            href="/guest"
            className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Dashboard Tamu
          </Link>
          <Link
            href="/presensi"
            className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Presensi GPS
          </Link>
          <Link
            href="/berita"
            className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            Berita
          </Link>
          <a
            href="http://127.0.0.1:8080/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-700"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span>Backend Go :8080</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
