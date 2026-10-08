"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  CloudUpload,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  Eye,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { MachineForm } from "@/components/logsheet/MachineForm";
import { apiClient } from "@/lib/api";
import { saveOfflineDraft } from "@/db/offlineDb";
import { useNetwork } from "@/hooks/useNetwork";
import {
  WACBFormatResponse,
  MachineFormEntry,
  BatchLogsheetRequest,
} from "@/types";

function InputLogsheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnline } = useNetwork();

  // Unit State
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string; kd_area?: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
    kd_area: "40",
  });

  // Form Header State
  const [tanggal, setTanggal] = useState<string>(
    searchParams.get("tanggal") || new Date().toISOString().substring(0, 10)
  );

  const defaultJam = () => {
    const paramJam = searchParams.get("jam");
    if (paramJam) return paramJam;
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() < 30 ? "00" : "30"}`;
  };

  const [jam, setJam] = useState<string>(defaultJam());
  const [operatorName, setOperatorName] = useState<string>("Operator Shift");

  // Machines State
  const [machines, setMachines] = useState<MachineFormEntry[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loadingFormat, setLoadingFormat] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Generate 48 Slots
  const timeSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  useEffect(() => {
    const savedUnit = localStorage.getItem("pln_selected_unit");
    let currentUnit = activeUnit;
    if (savedUnit) {
      try {
        currentUnit = JSON.parse(savedUnit);
        setActiveUnit(currentUnit);
      } catch {}
    }

    const savedUser = localStorage.getItem("pln_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setOperatorName(u.name);
      } catch {}
    }

    // Fetch Machines Format from WACB API via Go
    const fetchFormat = async () => {
      setLoadingFormat(true);
      try {
        const res = await apiClient.get<WACBFormatResponse>("/wacb/format", {
          params: {
            kd_region: "05",
            kd_area: currentUnit.kd_area || "40",
            kd_unit: currentUnit.kd_unit,
          },
        });

        if (res.data?.format?.mesin && res.data.format.mesin.length > 0) {
          const list: MachineFormEntry[] = res.data.format.mesin.map((m, idx) => ({
            nomor: m.nomor || idx + 1,
            id_mesin: m.id_mesin,
            nama_mesin: m.nama_mesin,
            kode_mesin_silm: m.kode_mesin_silm || "",
            sn: m.sn || "",
            dt: m.dt || 100,
            daya_mampu: String(m.dt || 100),
            status_mesin: idx === 4 ? "STANDBY" : idx === 5 ? "GANGGUAN" : "OPERASI",
            beban: idx < 4 ? 75.0 + idx * 5 : 0,
            stand_kwh: 12450.5 + idx * 100,
            stand_bbm: 2800.0 + idx * 50,
            phasa_r: idx < 4 ? 380.0 : 0,
            phasa_s: idx < 4 ? 380.0 : 0,
            phasa_t: idx < 4 ? 380.0 : 0,
            tek_oli: idx < 4 ? 4.2 : 0,
            temp_air: idx < 4 ? 78.0 : 0,
            tegangan: idx < 4 ? 380.0 : 0,
            frequency: idx < 4 ? 50.0 : 0,
            cos_phi: idx < 4 ? 0.85 : 0,
            jam_kerja_mesin: 1420.0 + idx * 250,
            kd_jenis_bahan_bakar: m.kd_jenis_bahan_bakar || "B35",
            keterangan: idx === 4 ? "Mesin Siaga" : idx === 5 ? "Kerusakan Injektor" : "Beroperasi Normal",
          }));
          setMachines(list);
        }
      } catch (err) {
        console.error("Failed to load unit format:", err);
      } finally {
        setLoadingFormat(false);
      }
    };

    fetchFormat();
  }, []);

  const handleMachineChange = (index: number, updated: Partial<MachineFormEntry>) => {
    setMachines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleCopyParameters = (fromIdx: number) => {
    const src = machines[fromIdx];
    setMachines((prev) =>
      prev.map((m, idx) => {
        if (idx === fromIdx || m.status_mesin !== "OPERASI") return m;
        return {
          ...m,
          tegangan: src.tegangan,
          frequency: src.frequency,
          cos_phi: src.cos_phi,
          tek_oli: src.tek_oli,
          temp_air: src.temp_air,
        };
      })
    );
    alert(`Parameter kelistrikan Mesin #${src.nomor} berhasil disalin ke semua mesin yang beroperasi!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const localId = `LOG-${activeUnit.kd_unit}-${tanggal.replace(/-/g, "")}-${jam.replace(":", "")}-${Date.now()}`;
    const payload: BatchLogsheetRequest = {
      local_id: localId,
      kd_region: "05",
      kd_unit: activeUnit.kd_unit,
      nama_unit: activeUnit.nama_unit,
      tanggal,
      jam,
      operator_name: operatorName,
      machines,
    };

    if (!isOnline) {
      // Offline -> Save to IndexedDB (Dexie)
      try {
        await saveOfflineDraft(payload);
        setSuccessToast("Perangkat offline: Logsheet disimpan ke antrean lokal dan akan dikirim otomatis saat online.");
        setTimeout(() => router.push("/sync"), 2000);
      } catch (err) {
        alert("Gagal menyimpan ke penyimpanan offline: " + err);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Online -> Submit to Go Backend (which relays to WACB)
    try {
      const res = await apiClient.post("/wacb/submit-logsheet", payload);
      if (res.data?.success) {
        setSuccessToast("Logsheet berhasil terkirim dan disimpan di WACB DIGIKIT!");
        setTimeout(() => router.push("/dashboard"), 1800);
      } else {
        alert("Gagal mengirim laporan: " + res.data?.message);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      // Fallback offline save on network failure
      await saveOfflineDraft(payload);
      setSuccessToast("Koneksi gagal: Logsheet diamankan ke antrean lokal.");
      setTimeout(() => router.push("/sync"), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Success Toast */}
        {successToast && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-success-600 px-4 py-3 text-xs font-bold text-white shadow-theme-md animate-bounce">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="min-w-0">{successToast}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                  Formulir Logsheet PLTD
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeUnit.nama_unit} • Penginputan Multi-Mesin Sekaligus (1 s/d {machines.length || 6} Mesin)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
                >
                  <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{previewOpen ? "Tutup Preview" : "Preview Payload WACB"}</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || loadingFormat}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
                >
                  {isOnline ? (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{submitting ? "Mengirim ke WACB..." : "Submit Logsheet (Online)"}</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="h-4 w-4" />
                      <span>{submitting ? "Menyimpan..." : "Simpan Antrean (Offline)"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Header Fields: Tanggal, Jam Bebas, Operator */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3 dark:border-gray-800">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="h-3.5 w-3.5 text-brand-500" />
                  <span>Tanggal Laporan:</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className="h-3.5 w-3.5 text-brand-500" />
                  <span>Jam Laporan (48 Slot 30 Menit):</span>
                </label>
                <select
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                >
                  {timeSlots.map((s) => (
                    <option key={s} value={s}>
                      {s} WITA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <UserCheck className="h-3.5 w-3.5 text-brand-500" />
                  <span>Nama Operator Shift:</span>
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* WACB Payload Preview Box */}
          {previewOpen && (
            <div className="space-y-2 rounded-2xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-gray-200 shadow-theme-sm">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-400">
                <span>Standard Message Text Payload (WACB v1.0)</span>
                <span>{machines.length} Mesin Siap Terkirim</span>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-gray-900 p-3.5 text-[11px] leading-relaxed text-gray-300">
{`LAPORAN LOGSHEET PLTD
${activeUnit.nama_unit}
id unit: ${activeUnit.kd_unit}
tgl : ${tanggal}
jam : ${jam}
nama operator: ${operatorName}

${machines
  .map(
    (m) =>
      `${m.nomor}. ${m.nama_mesin}\nid mesin: ${m.id_mesin}\nkode mesin: ${m.kode_mesin_silm}\nsn: ${m.sn}\ndt: ${m.dt}\ndaya mampu: ${m.daya_mampu}\nbeban: ${m.beban}\nstand kwh: ${m.stand_kwh}\nstand bbm: ${m.stand_bbm}\ntek oli: ${m.tek_oli}\ntemp air: ${m.temp_air}\ntegangan: ${m.tegangan}\nfrequency: ${m.frequency}\ncos phi: ${m.cos_phi}\njam kerja mesin: ${m.jam_kerja_mesin}\nstatus mesin: ${m.status_mesin}\njenis bahan bakar: ${m.kd_jenis_bahan_bakar}\nket: ${m.keterangan}`
  )
  .join("\n\n")}`}
              </pre>
            </div>
          )}

          {/* Machine Tabs & Form */}
          <MachineForm
            machines={machines}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onChange={handleMachineChange}
            onCopyParametersToAll={handleCopyParameters}
          />
        </form>
      </div>
    </AppLayout>
  );
}

export default function InputLogsheetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-500" />
        </div>
      }
    >
      <InputLogsheetContent />
    </Suspense>
  );
}
