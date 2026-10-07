"use client";

import { useEffect, useState } from "react";
import { Calendar, Building2 } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { TimeSlotMatrix } from "@/components/matrix/TimeSlotMatrix";

export default function MatrixPage() {
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    const saved = localStorage.getItem("pln_selected_unit");
    if (saved) {
      try {
        setActiveUnit(JSON.parse(saved));
      } catch {}
    }
  }, []);

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

        {/* Matrix Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <TimeSlotMatrix kdUnit={activeUnit.kd_unit} tanggal={tanggal} />
        </div>
      </div>
    </AppLayout>
  );
}
