"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Check,
  ShieldCheck,
  X,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { HARTicket } from "@/types";

const DEFAULT_CATEGORIES = [
  "Sistem Bahan Bakar",
  "Sistem Pelumasan",
  "Sistem Pendingin",
  "Sistem Udara & Gas Buang",
  "Sistem Elektrikal & Proteksi",
  "Sistem Mekanikal & Transmisi",
];

const DEFAULT_MAINTENANCE = [
  "PREVENTIVE (P1 - P6)",
  "CORRECTIVE",
  "TOP OVERHAUL (TO)",
  "SEMI OVERHAUL (SO)",
  "MAJOR OVERHAUL (MO)",
  "GENERAL OVERHAUL (GO)",
];

const FALLBACK_UNITS = [{ kd_unit: "0264", nama_unit: "ULD BATU AMPAR" }];

function mergeOptions(defaults: string[], fromApi: string[] = []): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of [...defaults, ...fromApi]) {
    const t = (v || "").trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export default function HarModulePage() {
  const [tickets, setTickets] = useState<HARTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("TEKNISI");

  // Opsi dinamis dari API (unit WACB, mesin unit, taksonomi HAR)
  const [unitOptions, setUnitOptions] = useState<{ kd_unit: string; nama_unit: string }[]>([]);
  const [machineOptions, setMachineOptions] = useState<{ id_mesin: string; nama_mesin: string }[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [maintenanceTypes, setMaintenanceTypes] = useState<string[]>(DEFAULT_MAINTENANCE);

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState<Partial<HARTicket>>({
    ticket_number: "",
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
    id_mesin: "000344",
    nama_mesin: "PLTD BATU AMPAR #01 (DEUTZ)",
    category: "Sistem Bahan Bakar",
    maintenance_type: "CORRECTIVE",
    running_hours: 1450,
    fault_description: "",
    action_taken: "",
    status: "SUBMITTED",
    teknisi_name: "Teknisi Pemeliharaan",
  });

  const unitList = unitOptions.length > 0 ? unitOptions : FALLBACK_UNITS;

  const loadMachines = async (kdUnit: string, namaUnit?: string) => {
    try {
      const res = await apiClient.get("/wacb/format", {
        params: { kd_region: "05", kd_unit: kdUnit },
      });
      const mesin: { id_mesin: string; nama_mesin: string }[] =
        res.data?.format?.mesin || [];
      setMachineOptions(mesin);
      if (mesin.length > 0) {
        setNewTicket((prev) => ({
          ...prev,
          kd_unit: kdUnit,
          nama_unit: namaUnit || prev.nama_unit,
          id_mesin: mesin[0].id_mesin,
          nama_mesin: mesin[0].nama_mesin,
        }));
      } else {
        setNewTicket((prev) => ({ ...prev, kd_unit: kdUnit, nama_unit: namaUnit || prev.nama_unit }));
      }
    } catch {
      setMachineOptions([]);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: HARTicket[] }>("/har/tickets");
      if (res.data?.data) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch HAR tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role);
        setNewTicket((prev) => ({ ...prev, teknisi_name: u.name }));
      } catch {}
    }
    fetchTickets();

    // Taksonomi dinamis (gabungan database + default)
    apiClient
      .get<{ success: boolean; categories?: string[]; maintenance_types?: string[] }>("/har/taxonomy")
      .then((res) => {
        if (res.data?.success) {
          setCategories(mergeOptions(DEFAULT_CATEGORIES, res.data.categories));
          setMaintenanceTypes(mergeOptions(DEFAULT_MAINTENANCE, res.data.maintenance_types));
        }
      })
      .catch(() => {});

    // Daftar unit PLTD dari WACB (fallback unit bawaan bila API gagal)
    apiClient
      .get<{ units?: { kd_unit: string; nama_unit: string }[] }>("/wacb/units", {
        params: { kd_region: "05" },
      })
      .then((res) => {
        const units = res.data?.units || [];
        if (units.length > 0) {
          setUnitOptions(units);
          loadMachines(units[0].kd_unit, units[0].nama_unit);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/har/tickets", newTicket);
      setModalOpen(false);
      fetchTickets();
      alert("Tiket pekerjaan HAR berhasil dibuat!");
    } catch (err) {
      alert("Gagal membuat tiket HAR: " + err);
    }
  };

  const handleApproveTicket = async (id?: number) => {
    if (!id) return;
    try {
      await apiClient.put(`/har/tickets/${id}/approve`);
      fetchTickets();
      alert("Tiket HAR telah disetujui oleh Supervisor Shift!");
    } catch (err) {
      alert("Gagal menyetujui tiket: " + err);
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "SUPERVISOR", "TEKNISI"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Modul Pemeliharaan (HAR) & Gangguan AMC
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Standar Taksonomi Kerusakan Kit Kaltimra 2026 • Preventive & Corrective
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Tiket HAR</span>
            </button>
          </div>

          {/* Ticket Table Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <Wrench className="h-4 w-4 shrink-0 text-brand-500" />
                Daftar Pekerjaan & Riwayat Gangguan Mesin
              </span>
              <span className="shrink-0 text-xs font-semibold text-gray-400">
                Total: {tickets.length} Tiket
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs font-semibold text-gray-400">
                Memuat data pekerjaan pemeliharaan...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-xs font-semibold text-gray-400">
                Belum ada tiket pemeliharaan HAR yang tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-xs [&_td]:whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3.5">No Tiket</th>
                      <th className="whitespace-nowrap px-5 py-3.5">Mesin</th>
                      <th className="whitespace-nowrap px-5 py-3.5">Kategori Gangguan</th>
                      <th className="whitespace-nowrap px-5 py-3.5">Tipe Pemeliharaan</th>
                      <th className="whitespace-nowrap px-5 py-3.5">JKM</th>
                      <th className="whitespace-nowrap px-5 py-3.5">Teknisi</th>
                      <th className="whitespace-nowrap px-5 py-3.5">Status</th>
                      <th className="whitespace-nowrap px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {tickets.map((t) => (
                      <tr key={t.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-5 py-4 font-bold text-brand-600 dark:text-brand-400">{t.ticket_number}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{t.nama_mesin}</td>
                        <td className="px-5 py-4 font-medium text-gray-600 dark:text-gray-300">{t.category}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {t.maintenance_type}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{t.running_hours} Jam</td>
                        <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{t.teknisi_name}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              t.status === "APPROVED"
                                ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                                : t.status === "RESOLVED"
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                                : "bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {t.status !== "APPROVED" &&
                            (userRole === "SUPERVISOR" ||
                              userRole === "ADMIN" ||
                              userRole === "SUPERADMIN") && (
                              <button
                                onClick={() => handleApproveTicket(t.id)}
                                className="rounded-lg bg-success-600 px-3 py-1 text-[11px] font-bold text-white transition-colors hover:bg-success-700 shadow-theme-xs"
                              >
                                Setujui Tiket
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Ticket Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                  <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <Wrench className="h-5 w-5 shrink-0 text-brand-500" />
                    Buat Tiket Pemeliharaan (HAR) & Gangguan
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Unit PLTD
                      </label>
                      <select
                        value={newTicket.kd_unit}
                        onChange={(e) => {
                          const kd = e.target.value;
                          const unit = unitList.find((u) => u.kd_unit === kd);
                          loadMachines(kd, unit?.nama_unit);
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        {unitList.map((u) => (
                          <option key={u.kd_unit} value={u.kd_unit}>
                            {u.nama_unit} ({u.kd_unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Mesin PLTD
                      </label>
                      {machineOptions.length > 0 ? (
                        <select
                          required
                          value={newTicket.id_mesin}
                          onChange={(e) => {
                            const m = machineOptions.find((x) => x.id_mesin === e.target.value);
                            if (m) {
                              setNewTicket({ ...newTicket, id_mesin: m.id_mesin, nama_mesin: m.nama_mesin });
                            }
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        >
                          {machineOptions.map((m) => (
                            <option key={m.id_mesin} value={m.id_mesin}>
                              {m.nama_mesin}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={newTicket.nama_mesin}
                          onChange={(e) =>
                            setNewTicket({ ...newTicket, nama_mesin: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Running Hours (JKM)
                      </label>
                      <input
                        type="number"
                        required
                        value={newTicket.running_hours}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            running_hours: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Taksonomi Kerusakan (AMC)
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) =>
                          setNewTicket({ ...newTicket, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Tipe Pemeliharaan
                      </label>
                      <select
                        value={newTicket.maintenance_type}
                        onChange={(e) =>
                          setNewTicket({ ...newTicket, maintenance_type: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        {maintenanceTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Deskripsi Kendala / Kerusakan
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Uraian temuan kendala operasional pada mesin..."
                      value={newTicket.fault_description}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, fault_description: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Tindakan Perbaikan
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Langkah perbaikan / overhaul yang dilakukan teknisi..."
                      value={newTicket.action_taken}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, action_taken: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600"
                    >
                      Simpan Tiket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
