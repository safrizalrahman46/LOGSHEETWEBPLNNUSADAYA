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
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { TimeSlotMatrix } from "@/components/matrix/TimeSlotMatrix";
import { apiClient } from "@/lib/api";

export default function DashboardPage() {
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [downloading, setDownloading] = useState(false);

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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4 Mesin</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Beban Rata-rata Unit: 78%
              </p>
            </div>
          </div>

          {/* Card 4: Standby & Gangguan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Standby / Gangguan
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1 / 1</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                1 Siaga • 1 Gangguan Injektor
              </p>
            </div>
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
