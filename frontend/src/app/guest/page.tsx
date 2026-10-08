"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  Activity, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Cpu, 
  TrendingUp, 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";

interface SummaryData {
  region_name: string;
  total_dmn_mw: number;
  total_dmp_mw: number;
  peak_load_mw: number;
  reserve_margin_mw: number;
  reserve_percent: number;
  frequency_avg_hz: number;
  system_status: string;
  total_units: number;
  total_machines: number;
  eaf_reliability_pct: number;
  peak_time?: string;
  source?: string;
}

interface MachineDonut {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface HourlyLoad {
  jam: string;
  beban_mw: number;
  daya_mampu_mw: number;
}

interface UnitPin {
  kd_unit: string;
  nama_unit: string;
  latitude: number;
  longitude: number;
  dmp_kw: number;
  beban_kw: number;
  status: string;
}

export default function GuestDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [machineStatus, setMachineStatus] = useState<MachineDonut[]>([]);
  const [loadCurve, setLoadCurve] = useState<HourlyLoad[]>([]);
  const [unitPins, setUnitPins] = useState<UnitPin[]>([]);

  const fetchGuestData = () => {
    setLoading(true);
    apiClient.get("/public/guest/summary")
      .then((res) => {
        if (res.data?.success) {
          setSummary(res.data.system_summary);
          setMachineStatus(res.data.machine_status_donut || []);
          setLoadCurve(res.data.load_curve_24h || []);
          setUnitPins(res.data.unit_pins || []);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat data guest:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setMounted(true);
    fetchGuestData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Refresh Action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                PUBLIC MONITORING
              </span>
              <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                Kondisi Real-time: {summary?.system_status || "NORMAL"}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Dasbor Pemantauan Sistem Pembangkitan PLTD
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Informasi agregat keandalan daya listrik & komposisi mesin Kalimantan 3 (Kalimantan Timur & Utara)
            </p>
          </div>

          <button
            onClick={fetchGuestData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-500" : ""}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* 1. KEY TELEMETRY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Daya Mampu Pasok (DMP)
            </span>
            <h3 className="mt-2 text-2xl font-bold text-warning-600 dark:text-warning-400">
              {summary ? summary.total_dmp_mw : "—"} <span className="text-xs font-medium text-gray-400">MW</span>
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Daya Terpasang: {summary?.total_dmn_mw || 48.5} MW
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Beban Puncak (Peak)
            </span>
            <h3 className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
              {summary ? summary.peak_load_mw : "—"} <span className="text-xs font-medium text-gray-400">MW</span>
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {summary?.peak_time ? `Puncak Pukul ${summary.peak_time}` : "Memuat data beban puncak..."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Cadangan Daya (Reserve)
            </span>
            <h3 className="mt-2 text-2xl font-bold text-success-600 dark:text-success-400">
              {summary ? summary.reserve_margin_mw : "—"} <span className="text-xs font-medium text-gray-400">MW</span>
            </h3>
            <p className="mt-1 text-xs text-success-600 dark:text-success-400 font-medium">
              Margin Cadangan: {summary ? `${summary.reserve_percent}%` : "— %"} ({summary && summary.reserve_percent >= 15 ? "Aman" : "Dipantau"})
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Kesiapan Mesin (EAF)
            </span>
            <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {summary ? summary.eaf_reliability_pct : "—"} <span className="text-xs font-medium text-brand-500">%</span>
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {summary ? `${summary.total_units} Unit • ${summary.total_machines} Mesin` : "Memuat aset..."}
            </p>
          </div>
        </div>

        {/* 2. CHARTS SECTION (24H LOAD CURVE + MACHINE STATUS DONUT) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 24-Hour Load Curve (Area Chart) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <Activity className="h-4 w-4 text-brand-500" />
                  Kurva Pembebanan Sistem 24 Jam
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Konsumsi beban (MW) vs batas daya mampu pasok</p>
              </div>
              <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                00:00 - 23:30 WITA
              </span>
            </div>

            <div className="mt-2 h-72 w-full">
              {mounted && loadCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loadCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bebanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#465fff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#465fff" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="dmpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f79009" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f79009" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" opacity={0.6} />
                    <XAxis dataKey="jam" stroke="#98a2b3" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#98a2b3" tick={{ fontSize: 11 }} domain={[15, 45]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1d2939", borderColor: "#344054", borderRadius: "12px", fontSize: "12px", color: "#ffffff" }}
                      labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="beban_mw" name="Beban Nyata (MW)" stroke="#465fff" strokeWidth={2.5} fillOpacity={1} fill="url(#bebanGrad)" />
                    <Area type="step" dataKey="daya_mampu_mw" name="Daya Mampu Pasok (MW)" stroke="#f79009" strokeDasharray="4 4" strokeWidth={2} fillOpacity={1} fill="url(#dmpGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  Memuat grafik pembebanan...
                </div>
              )}
            </div>
          </div>

          {/* Machine Status Donut Chart */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Cpu className="h-4 w-4 text-brand-500" />
                Komposisi Kesiapan Mesin
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total 86 unit mesin pembangkit</p>
            </div>

            <div className="my-auto h-56 w-full">
              {mounted && machineStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={machineStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {machineStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1d2939", borderColor: "#344054", borderRadius: "12px", fontSize: "12px", color: "#ffffff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  Memuat status mesin...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 text-xs">
              {machineStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-gray-500 dark:text-gray-400">{item.name}:</span>
                  <span className="ml-auto font-bold text-gray-900 dark:text-white">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. UNITS SUMMARY TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <MapPin className="h-4 w-4 text-brand-500" />
                Sebaran Unit Layanan PLTD (Kalimantan 3)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Status operasional dan kapasitas daya per site ULD</p>
            </div>
            <Link
              href="/presensi"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
            >
              <span>Buka Presensi GPS</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-5">Kode</th>
                  <th className="py-3 px-5">Nama Unit PLTD</th>
                  <th className="py-3 px-5">Koordinat Site (Lat, Lng)</th>
                  <th className="py-3 px-5">DMP (kW)</th>
                  <th className="py-3 px-5">Beban Aktual (kW)</th>
                  <th className="py-3 px-5 text-center">Status Keandalan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {unitPins.map((unit) => (
                  <tr key={unit.kd_unit} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                    <td className="py-3.5 px-5 font-mono font-bold text-gray-400">{unit.kd_unit}</td>
                    <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">{unit.nama_unit}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-500 dark:text-gray-400">
                      {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-warning-600 dark:text-warning-400">
                      {unit.dmp_kw.toLocaleString("id-ID")} kW
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-600 dark:text-brand-400">
                      {unit.beban_kw.toLocaleString("id-ID")} kW
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        unit.status === "NORMAL"
                          ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                          : "bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400"
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
