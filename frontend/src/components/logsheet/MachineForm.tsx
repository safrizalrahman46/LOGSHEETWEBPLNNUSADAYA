"use client";

import { MachineFormEntry } from "@/types";
import { AlertTriangle, Cpu, Activity, ShieldAlert, PauseCircle } from "lucide-react";

interface MachineFormProps {
  machines: MachineFormEntry[];
  activeTab: number;
  onTabChange: (index: number) => void;
  onChange: (index: number, updated: Partial<MachineFormEntry>) => void;
  onCopyParametersToAll?: (fromIndex: number) => void;
}

export function MachineForm({
  machines,
  activeTab,
  onTabChange,
  onChange,
  onCopyParametersToAll,
}: MachineFormProps) {
  if (machines.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs font-semibold text-gray-400 dark:border-gray-800 dark:bg-gray-900">
        Memuat data mesin unit...
      </div>
    );
  }

  const current = machines[activeTab] || machines[0];

  // Abnormal Warnings
  const warnings: string[] = [];
  if (current.status_mesin === "OPERASI") {
    if (current.frequency > 0 && (current.frequency < 49.5 || current.frequency > 50.5)) {
      warnings.push(`Frekuensi (${current.frequency} Hz) berada di luar batas normal PLN (49.5 - 50.5 Hz).`);
    }
    if (current.temp_air > 85) {
      warnings.push(`Suhu air pendingin (${current.temp_air} °C) tinggi (Batas normal: ≤ 85 °C).`);
    }
    if (current.tek_oli > 0 && current.tek_oli < 2.5) {
      warnings.push(`Tekanan oli (${current.tek_oli} bar) rendah (Batas aman: ≥ 2.5 bar).`);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition-colors dark:border-gray-800 dark:bg-gray-900">
      {/* Machine Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/60 overflow-x-auto no-scrollbar">
        {machines.map((m, idx) => {
          const isActive = idx === activeTab;
          const statusColors: Record<string, string> = {
            OPERASI: "bg-success-500",
            STANDBY: "bg-warning-500",
            GANGGUAN: "bg-error-500",
          };

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onTabChange(idx)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "border-brand-500 bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${statusColors[m.status_mesin] || "bg-success-500"}`} />
              <span>Mesin #{m.nomor || idx + 1}</span>
              <span className="max-w-[90px] truncate text-[10px] font-normal text-gray-400">
                {m.nama_mesin.split("(")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6 p-6">
        {/* Machine Info Bar & Status Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-500" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">{current.nama_mesin}</h4>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              ID Mesin: <span className="font-semibold text-gray-700 dark:text-gray-200">{current.id_mesin}</span> • SN:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{current.sn}</span> • Daya Terpasang:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{current.dt} kW</span>
            </p>
          </div>

          {/* Toggle Status Mesin Mutlak */}
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Status Mesin:</span>
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => onChange(activeTab, { status_mesin: "OPERASI" })}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  current.status_mesin === "OPERASI"
                    ? "bg-success-600 text-white shadow-theme-xs"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>OPERASI</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(activeTab, {
                    status_mesin: "STANDBY",
                    beban: 0,
                    phasa_r: 0,
                    phasa_s: 0,
                    phasa_t: 0,
                    tek_oli: 0,
                    temp_air: 0,
                    tegangan: 0,
                    frequency: 0,
                    cos_phi: 0,
                  })
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  current.status_mesin === "STANDBY"
                    ? "bg-warning-500 text-white shadow-theme-xs"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <PauseCircle className="h-3.5 w-3.5" />
                <span>STANDBY</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(activeTab, {
                    status_mesin: "GANGGUAN",
                    beban: 0,
                    phasa_r: 0,
                    phasa_s: 0,
                    phasa_t: 0,
                    tek_oli: 0,
                    temp_air: 0,
                    tegangan: 0,
                    frequency: 0,
                    cos_phi: 0,
                  })
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                  current.status_mesin === "GANGGUAN"
                    ? "bg-error-600 text-white shadow-theme-xs"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>GANGGUAN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Abnormal Warnings Banner */}
        {warnings.length > 0 && (
          <div className="space-y-1 rounded-xl border border-warning-300 bg-warning-50 p-3.5 text-warning-900 dark:border-warning-800 dark:bg-warning-950/50 dark:text-warning-300">
            <div className="flex items-center gap-2 text-xs font-bold text-warning-800 dark:text-warning-300">
              <AlertTriangle className="h-4 w-4 text-warning-600 dark:text-warning-400" />
              <span>Perhatian Parameter Operasi Abnormal:</span>
            </div>
            <ul className="list-inside list-disc space-y-0.5 pl-1 text-xs text-warning-800 dark:text-warning-300">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 11 Parameters Form */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Beban Mesin (kW) <span className="text-error-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.beban}
              onChange={(e) => onChange(activeTab, { beban: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Stand KWH (kWh)</label>
            <input
              type="number"
              step="0.1"
              value={current.stand_kwh}
              onChange={(e) => onChange(activeTab, { stand_kwh: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Stand BBM (Liter)</label>
            <input
              type="number"
              step="0.1"
              value={current.stand_bbm}
              onChange={(e) => onChange(activeTab, { stand_bbm: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Tekanan Oli (bar)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.tek_oli}
              onChange={(e) => onChange(activeTab, { tek_oli: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Suhu Air Pendingin (°C)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.temp_air}
              onChange={(e) => onChange(activeTab, { temp_air: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Tegangan (Volt)</label>
            <input
              type="number"
              step="1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.tegangan}
              onChange={(e) => onChange(activeTab, { tegangan: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Frekuensi (Hz)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.frequency}
              onChange={(e) => onChange(activeTab, { frequency: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Cos Phi</label>
            <input
              type="number"
              step="0.01"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.cos_phi}
              onChange={(e) => onChange(activeTab, { cos_phi: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Arus Phasa R (A)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.phasa_r}
              onChange={(e) => onChange(activeTab, { phasa_r: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Arus Phasa S (A)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.phasa_s}
              onChange={(e) => onChange(activeTab, { phasa_s: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Arus Phasa T (A)</label>
            <input
              type="number"
              step="0.1"
              disabled={current.status_mesin !== "OPERASI"}
              value={current.phasa_t}
              onChange={(e) => onChange(activeTab, { phasa_t: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Jam Kerja Mesin (JKM)</label>
            <input
              type="number"
              step="0.1"
              value={current.jam_kerja_mesin}
              onChange={(e) => onChange(activeTab, { jam_kerja_mesin: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            />
          </div>
        </div>

        {/* Keterangan & Catatan */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Catatan Mesin / Kendala Operasi
          </label>
          <input
            type="text"
            placeholder={
              current.status_mesin === "GANGGUAN"
                ? "Wajib diisi: contoh kerusakan injektor bahan bakar / trip overcurrent"
                : "Contoh: Kondisi mesin normal dan stabil"
            }
            value={current.keterangan}
            onChange={(e) => onChange(activeTab, { keterangan: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
          />
        </div>

        {/* Action Button Quick Copy */}
        {onCopyParametersToAll && machines.length > 1 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => onCopyParametersToAll(activeTab)}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              <span>Salin tegangan & frekuensi mesin ini ke semua mesin lainnya</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
