"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, RefreshCw, Table2 } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
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

const STATUS_STYLE: Record<string, string> = {
  operasi:
    "bg-success-50 text-success-700 border-success-200 dark:bg-success-500/15 dark:text-success-400",
  standby:
    "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-500/15 dark:text-warning-400",
  "gangguan-rusak":
    "bg-error-50 text-error-700 border-error-200 dark:bg-error-500/15 dark:text-error-400",
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function AdminMatrixPage() {
  const [tanggal, setTanggal] = useState(todayStr());
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (tgl: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/matrix-master", {
        params: { tanggal: tgl },
      });
      if (res.data?.success) {
        setCells(res.data.cells || []);
        setUnits(res.data.units || []);
        setError(null);
      } else {
        setError(res.data?.message || "Gagal memuat matriks");
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg || "Gagal memuat matriks dari server");
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

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Matriks Master Logsheet
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Rekap baris logsheet per jam untuk satu tanggal lintas unit.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value || todayStr())}
                  className="h-10 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                />
              </div>
              <button
                onClick={() => fetchData(tanggal)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                title="Muat ulang"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Total Baris
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {cells.length}
              </p>
            </div>
            <div className="rounded-2xl border border-success-200 bg-success-50 p-4 dark:border-success-500/30 dark:bg-success-500/10">
              <p className="text-xs font-semibold uppercase text-success-600 dark:text-success-400">
                Operasi
              </p>
              <p className="mt-1 text-2xl font-bold text-success-700 dark:text-success-400">
                {counts.operasi || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/10">
              <p className="text-xs font-semibold uppercase text-warning-600 dark:text-warning-400">
                Standby
              </p>
              <p className="mt-1 text-2xl font-bold text-warning-700 dark:text-warning-400">
                {counts.standby || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-error-200 bg-error-50 p-4 dark:border-error-500/30 dark:bg-error-500/10">
              <p className="text-xs font-semibold uppercase text-error-600 dark:text-error-400">
                Gangguan / Rusak
              </p>
              <p className="mt-1 text-2xl font-bold text-error-700 dark:text-error-400">
                {counts["gangguan-rusak"] || 0}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Table2 className="h-4 w-4 shrink-0 text-brand-500" />
                Rekap {units.length > 0 ? `${units.length} Unit` : "Logsheet"} —{" "}
                {tanggal}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[880px] divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {["Jam", "Unit", "Mesin", "Status", "Beban (kW)", "Operator", "Approval"].map(
                      (h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                        Memuat matriks...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm font-semibold text-error-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : cells.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Tidak ada data logsheet untuk tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    cells.map((c, i) => (
                      <tr
                        key={`${c.machine_id}-${c.jam}-${i}`}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {c.jam}:00
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.unit_name || c.unit_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.machine_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              STATUS_STYLE[c.machine_status] || ""
                            }`}
                          >
                            {c.machine_status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.beban_mesin}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.operator_name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {c.approval_status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
