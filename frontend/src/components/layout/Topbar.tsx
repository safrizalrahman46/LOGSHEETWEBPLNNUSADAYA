"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Wifi, WifiOff, RefreshCw, Calendar } from "lucide-react";
import { useNetwork } from "@/hooks/useNetwork";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Topbar() {
  const { isOnline, isSyncing, pendingCount, syncPendingDrafts } = useNetwork();
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const savedUnit = localStorage.getItem("pln_selected_unit");
    if (savedUnit) {
      try {
        setActiveUnit(JSON.parse(savedUnit));
      } catch {
        // default
      }
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WITA"
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-xs select-none transition-colors">
      {/* Unit Indicator */}
      <div className="flex items-center gap-3">
        <Link
          href="/pilih-unit"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all text-xs font-bold text-slate-800 dark:text-slate-100"
        >
          <Building2 className="w-4 h-4 text-pln-primary dark:text-pln-gold" />
          <span>{activeUnit.nama_unit}</span>
          <span className="px-1.5 py-0.5 rounded bg-pln-primary/10 dark:bg-pln-gold/20 text-pln-primary dark:text-pln-gold text-[10px] font-extrabold">
            {activeUnit.kd_unit}
          </span>
        </Link>
      </div>

      {/* Right Tools: Time & Network Status & Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{currentTime}</span>
        </div>

        {/* Theme Switcher Toggle */}
        <ThemeToggle />

        {/* Network & Offline Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Mode Offline</span>
            </div>
          )}

          {/* Pending Draft Counter */}
          {pendingCount > 0 && (
            <button
              onClick={syncPendingDrafts}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition-all animate-pulse"
              title="Klik untuk sinkronisasi sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-amber-600" : ""}`} />
              <span>{pendingCount} Draft Pending</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
