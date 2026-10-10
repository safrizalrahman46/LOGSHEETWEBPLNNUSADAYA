"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Check,
  ShieldCheck,
  X,
  Search,
  Filter,
  Layers,
  Activity,
  Calendar,
  Gauge,
  Thermometer,
  Eye,
  FileText,
  Camera,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
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

const FALLBACK_UNITS = [
  { kd_unit: "0264", nama_unit: "ULD BATU AMPAR" },
  { kd_unit: "0265", nama_unit: "ULD BIDUK-BIDUK" },
  { kd_unit: "0279", nama_unit: "ULD LONG SEGAR" },
  { kd_unit: "0281", nama_unit: "ULD KELAY" },
  { kd_unit: "0288", nama_unit: "ULD MARATUA" },
];

// Mesin PLTD Mock / Master untuk tab Daftar Mesin & Jam Operasi
const MOCK_PLTD_MACHINES = [
  {
    id_mesin: "000344",
    nama_mesin: "PLTD BATU AMPAR #01",
    merk_tipe: "DEUTZ BF6M 1013 E",
    dt: 450,
    dmp: 380,
    running_hours: 1450,
    next_pm_hours: 1500, // P5
    pm_name: "P5 (1500 Jam)",
    status: "OPERASI",
    temp_air: 82,
    tek_oli: 4.2,
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  },
  {
    id_mesin: "000345",
    nama_mesin: "PLTD BATU AMPAR #02",
    merk_tipe: "DEUTZ BF6M 1013 E",
    dt: 450,
    dmp: 300,
    running_hours: 3120,
    next_pm_hours: 3000, // P6 Overdue
    pm_name: "P6 (3000 Jam)",
    status: "MAINTENANCE",
    temp_air: 91,
    tek_oli: 3.1,
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  },
  {
    id_mesin: "000346",
    nama_mesin: "PLTD BATU AMPAR #03",
    merk_tipe: "CATERPILLAR 3516 B",
    dt: 1200,
    dmp: 1050,
    running_hours: 820,
    next_pm_hours: 1000, // P4
    pm_name: "P4 (1000 Jam)",
    status: "OPERASI",
    temp_air: 84,
    tek_oli: 4.8,
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  },
  {
    id_mesin: "000348",
    nama_mesin: "PLTD BIDUK-BIDUK #01",
    merk_tipe: "CATERPILLAR 3406 C",
    dt: 320,
    dmp: 280,
    running_hours: 2980,
    next_pm_hours: 3000,
    pm_name: "P6 (3000 Jam)",
    status: "OPERASI",
    temp_air: 80,
    tek_oli: 4.5,
    kd_unit: "0265",
    nama_unit: "ULD BIDUK-BIDUK",
  },
  {
    id_mesin: "000349",
    nama_mesin: "PLTD BIDUK-BIDUK #02",
    merk_tipe: "DEUTZ TBD 616 V12",
    dt: 634,
    dmp: 350,
    running_hours: 4210,
    next_pm_hours: 4500,
    pm_name: "Top Overhaul (TO)",
    status: "GANGGUAN",
    temp_air: 94,
    tek_oli: 2.7,
    kd_unit: "0265",
    nama_unit: "ULD BIDUK-BIDUK",
  },
];

export default function HarModulePage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "schedule" | "runtime" | "machines">("tickets");
  const [tickets, setTickets] = useState<HARTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("TEKNISI");

  // Filter
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("ALL");

  // Options
  const [unitOptions, setUnitOptions] = useState<{ kd_unit: string; nama_unit: string }[]>(FALLBACK_UNITS);
  const [machineOptions, setMachineOptions] = useState<{ id_mesin: string; nama_mesin: string }[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [maintenanceTypes, setMaintenanceTypes] = useState<string[]>(DEFAULT_MAINTENANCE);

  // 4-Step Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newTicket, setNewTicket] = useState<Partial<HARTicket>>({
    ticket_number: "",
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
    id_mesin: "000344",
    nama_mesin: "PLTD BATU AMPAR #01 (DEUTZ)",
    category: "Sistem Bahan Bakar",
    maintenance_type: "PREVENTIVE (P1 - P6)",
    running_hours: 1450,
    priority: "NORMAL",
    start_time: "08:00",
    end_time: "11:30",
    fault_description: "Pemeriksaan berkala parameter logsheet WACB dan filter solar.",
    action_taken: "Pembersihan elemen filter & kalibrasi governor.",
    final_result: "Normal & Beban Stabil",
    status: "SUBMITTED",
    teknisi_name: "Teknisi Pemeliharaan",
    photo_before: "",
    photo_process: "",
    photo_after: "",
    checklist_data: JSON.stringify([
      { title: "Inspeksi Level Oli & Kebocoran", ok: true },
      { title: "Pemeriksaan Filter Solar & Strainer", ok: true },
      { title: "Pengecekan Radiator Coolant & Fan Belt", ok: true },
      { title: "Inspeksi Tegangan & Terminal Alternator", ok: true },
      { title: "Uji Tekanan Oli Nominal (min 3.5 bar)", ok: true },
    ]),
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HARTicket | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: HARTicket[] }>("/har/tickets");
      if (res.data?.data) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat tiket HAR:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMachines = async (kdUnit: string, namaUnit?: string) => {
    try {
      const res = await apiClient.get("/wacb/format", {
        params: { kd_region: "05", kd_unit: kdUnit },
      });
      const mesin: { id_mesin: string; nama_mesin: string }[] = res.data?.format?.mesin || [];
      setMachineOptions(mesin);
      if (mesin.length > 0) {
        setNewTicket((prev) => ({
          ...prev,
          kd_unit: kdUnit,
          nama_unit: namaUnit || prev.nama_unit,
          id_mesin: mesin[0].id_mesin,
          nama_mesin: mesin[0].nama_mesin,
        }));
      }
    } catch {
      // Fallback
      setMachineOptions([
        { id_mesin: "000344", nama_mesin: "PLTD BATU AMPAR #01 (DEUTZ)" },
        { id_mesin: "000345", nama_mesin: "PLTD BATU AMPAR #02 (DEUTZ)" },
        { id_mesin: "000346", nama_mesin: "PLTD BATU AMPAR #03 (CATERPILLAR)" },
      ]);
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

    // Ambil taksonomi & unit
    apiClient
      .get<{ success: boolean; categories?: string[]; maintenance_types?: string[] }>("/har/taxonomy")
      .then((res) => {
        if (res.data?.success) {
          if (res.data.categories) setCategories(res.data.categories);
          if (res.data.maintenance_types) setMaintenanceTypes(res.data.maintenance_types);
        }
      })
      .catch(() => {});

    apiClient
      .get<{ units?: { kd_unit: string; nama_unit: string }[] }>("/wacb/units", {
        params: { kd_region: "05" },
      })
      .then((res) => {
        const u = res.data?.units;
        if (u && u.length > 0) {
          setUnitOptions(u);
          loadMachines(u[0].kd_unit, u[0].nama_unit);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSubmit = async () => {
    try {
      await apiClient.post("/har/tickets", newTicket);
      setWizardOpen(false);
      setWizardStep(1);
      fetchTickets();
      alert("Tiket pekerjaan HAR 4-Langkah berhasil dibuat & diajukan!");
    } catch (err: any) {
      alert("Gagal membuat tiket HAR: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveTicket = async (id?: number) => {
    if (!id) return;
    try {
      await apiClient.put(`/har/tickets/${id}/approve`);
      fetchTickets();
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
      }
      alert("Tiket HAR telah disetujui (Approved) oleh Supervisor Shift!");
    } catch (err: any) {
      alert("Gagal menyetujui tiket: " + err.message);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        ticketSearch === "" ||
        t.ticket_number.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.nama_mesin.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.teknisi_name.toLowerCase().includes(ticketSearch.toLowerCase());

      const matchStatus = ticketStatusFilter === "ALL" || t.status === ticketStatusFilter;
      const matchPriority = ticketPriorityFilter === "ALL" || (t.priority || "NORMAL") === ticketPriorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, ticketSearch, ticketStatusFilter, ticketPriorityFilter]);

  // Checklist parser
  const parseChecklist = (raw?: string) => {
    try {
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { title: "Inspeksi Level Oli Pelumas", ok: true },
      { title: "Pemeriksaan Filter Solar", ok: true },
      { title: "Pengecekan Radiator Coolant", ok: true },
      { title: "Inspeksi Terminal Alternator", ok: true },
    ];
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "SUPERVISOR", "TEKNISI", "OPERATOR", "MANAGER"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  PLN HAR & AMC System
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Regional Kalimantan 3
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Modul Pemeliharaan Terpadu (HAR) & Keandalan Mesin
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Pencatatan Job Card, Workflow Approval Shift, Jadwal Preventive P1-P6, & Pemantauan Jam Operasi
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/har/amc"
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-theme-xs transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Portal Gangguan AMC 2026</span>
              </Link>

              <button
                onClick={() => {
                  setWizardStep(1);
                  setWizardOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Tiket HAR Baru</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "tickets"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Job Card & Tiket HAR ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "schedule"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Jadwal Preventive (P1 - P6)</span>
            </button>

            <button
              onClick={() => setActiveTab("runtime")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "runtime"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Gauge className="h-4 w-4" />
              <span>Jam Operasi (JKM) & Abnormal Alert</span>
            </button>

            <button
              onClick={() => setActiveTab("machines")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "machines"
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Daftar Kondisi Mesin PLTD</span>
            </button>
          </div>

          {/* TAB 1: JOB CARD & TIKET HAR */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Cari nomor tiket, nama mesin, atau kategori..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="SUBMITTED">Menunggu Approval</option>
                    <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                    <option value="APPROVED">Approved / Selesai</option>
                  </select>

                  <select
                    value={ticketPriorityFilter}
                    onChange={(e) => setTicketPriorityFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <option value="ALL">Semua Prioritas</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                  <span className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <Wrench className="h-4 w-4 text-brand-500" />
                    Daftar Job Card & Tiket Pemeliharaan
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    Total: {filteredTickets.length} Tiket
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-xs font-semibold text-gray-400">
                    Memuat data tiket pemeliharaan...
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="py-20 text-center text-xs font-semibold text-gray-400">
                    Belum ada tiket pemeliharaan HAR yang tercatat.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                      <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                        <tr>
                          <th className="px-5 py-3.5">No Tiket</th>
                          <th className="px-5 py-3.5">Unit & Mesin</th>
                          <th className="px-5 py-3.5">Kategori & Tipe</th>
                          <th className="px-5 py-3.5">JKM</th>
                          <th className="px-5 py-3.5">Prioritas</th>
                          <th className="px-5 py-3.5">Teknisi</th>
                          <th className="px-5 py-3.5">Status Workflow</th>
                          <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredTickets.map((t) => (
                          <tr key={t.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                            <td className="px-5 py-4 font-black text-brand-600 dark:text-brand-400">
                              {t.ticket_number}
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-bold text-gray-900 dark:text-white">{t.nama_mesin}</p>
                              <p className="text-[10px] text-gray-400">{t.nama_unit}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-700 dark:text-gray-300">{t.category}</p>
                              <span className="text-[10px] font-bold text-gray-500 block">{t.maintenance_type}</span>
                            </td>
                            <td className="px-5 py-4 font-bold text-gray-800 dark:text-gray-200">
                              {t.running_hours} Jam
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                  t.priority === "CRITICAL"
                                    ? "bg-rose-100 text-rose-700"
                                    : t.priority === "HIGH"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {t.priority || "NORMAL"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                              {t.teknisi_name}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  t.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : t.status === "IN_PROGRESS"
                                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                }`}
                              >
                                {t.status === "SUBMITTED" ? "MENUNGGU APPROVAL" : t.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedTicket(t);
                                    setDetailModalOpen(true);
                                  }}
                                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                  Detail Job Card
                                </button>
                                {t.status !== "APPROVED" &&
                                  (userRole === "SUPERVISOR" ||
                                    userRole === "ADMIN" ||
                                    userRole === "SUPERADMIN") && (
                                    <button
                                      onClick={() => handleApproveTicket(t.id)}
                                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-theme-xs"
                                    >
                                      Approve
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: JADWAL PREVENTIVE (P1 - P6) */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Matriks Standar Pemeliharaan Periodik (P1 s/d P6)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Berdasarkan interval Jam Kerja Mesin (JKM) Standar Pabrikan PLTD Kaltimra
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                    Preventive Maintenance Matrix
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { code: "P1", interval: "125 Jam", desc: "Pemeriksaan oli, filter solar, & water separator" },
                    { code: "P2", interval: "250 Jam", desc: "Penggantian pelumas mesin & filter oli lube oil" },
                    { code: "P3", interval: "500 Jam", desc: "Pembersihan air cleaner, fan belt, & radiator" },
                    { code: "P4", interval: "1000 Jam", desc: "Penyetelan celah katup & kalibrasi injector" },
                    { code: "P5", interval: "1500 Jam", desc: "Pembersihan turbocharger & intercooler cooling" },
                    { code: "P6", interval: "3000 Jam", desc: "Overhaul sistem pendingin, water pump, & proteksi" },
                  ].map((p, idx) => (
                    <div
                      key={p.code}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-brand-600 dark:text-brand-400">{p.code}</span>
                        <span className="text-[10px] font-bold text-gray-400">{p.interval}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Schedule Table per Mesin */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Jadwal Servis Terdekat & Jam Operasi Mesin Pembangkit
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                    <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                      <tr>
                        <th className="px-5 py-3.5">Unit / Mesin</th>
                        <th className="px-5 py-3.5">Tipe Mesin</th>
                        <th className="px-5 py-3.5">Jam Kerja Saat Ini</th>
                        <th className="px-5 py-3.5">Jadwal Servis Berikutnya</th>
                        <th className="px-5 py-3.5">Sisa Jam (Countdown)</th>
                        <th className="px-5 py-3.5">Status Jadwal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {MOCK_PLTD_MACHINES.map((m) => {
                        const sisa = m.next_pm_hours - m.running_hours;
                        const isOverdue = sisa <= 0;
                        const isNear = sisa <= 100 && sisa > 0;
                        return (
                          <tr key={m.id_mesin} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                            <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                              {m.nama_mesin}
                              <span className="block text-[10px] text-gray-400 font-normal">{m.nama_unit}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                              {m.merk_tipe}
                            </td>
                            <td className="px-5 py-4 font-black text-brand-600 dark:text-brand-400">
                              {m.running_hours} Jam
                            </td>
                            <td className="px-5 py-4 font-bold text-gray-800 dark:text-gray-200">
                              {m.pm_name} ({m.next_pm_hours} Jam)
                            </td>
                            <td className="px-5 py-4 font-bold">
                              <span className={isOverdue ? "text-rose-600" : isNear ? "text-amber-600" : "text-emerald-600"}>
                                {isOverdue ? `Overdue ${Math.abs(sisa)} Jam` : `${sisa} Jam Tersisa`}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  isOverdue
                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                    : isNear
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {isOverdue ? "PERLU SEGERA HAR" : isNear ? "MENDEKATI JADWAL" : "NORMAL"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JAM OPERASI & ABNORMAL ALERTS */}
          {activeTab === "runtime" && (
            <div className="space-y-4">
              {/* Abnormal Alert Strip */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-theme-xs dark:border-rose-900/50 dark:bg-rose-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-400">
                      Peringatan Parameter Abnormal Mesin (Berdasarkan Logsheet & Telemetri WACB)
                    </h3>
                    <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                      Mesin <b>PLTD BIDUK-BIDUK #02</b> mendeteksi temperatur air <b>94°C</b> (batas aman 85°C) dan tekanan oli <b>2.7 bar</b> (batas minimal 3.0 bar). Segera lakukan pengecekan strainer dan radiator!
                    </p>
                  </div>
                </div>
              </div>

              {/* Machine Telemetry Gauges */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_PLTD_MACHINES.map((m) => (
                  <div
                    key={m.id_mesin}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{m.nama_mesin}</h4>
                        <p className="text-[10px] text-gray-400">{m.merk_tipe}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          m.status === "OPERASI"
                            ? "bg-emerald-100 text-emerald-700"
                            : m.status === "MAINTENANCE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Jam Kerja (JKM)</span>
                        <p className="mt-1 text-xl font-black text-brand-600 dark:text-brand-400">
                          {m.running_hours} <span className="text-xs font-normal text-gray-400">Jam</span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Daya Mampu (DMP)</span>
                        <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {m.dmp} <span className="text-xs font-normal text-gray-400">kW</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                          Temperatur Pendingin:
                        </span>
                        <span className={`font-bold ${m.temp_air >= 90 ? "text-rose-600" : "text-gray-800 dark:text-gray-200"}`}>
                          {m.temp_air}°C
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Gauge className="h-3.5 w-3.5 text-blue-500" />
                          Tekanan Oli Pelumas:
                        </span>
                        <span className={`font-bold ${m.tek_oli < 3.0 ? "text-rose-600" : "text-gray-800 dark:text-gray-200"}`}>
                          {m.tek_oli} bar
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DAFTAR MESIN PLTD */}
          {activeTab === "machines" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_PLTD_MACHINES.map((m) => (
                  <div
                    key={m.id_mesin}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-gray-400">
                          {m.kd_unit} • {m.nama_unit}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            m.status === "OPERASI"
                              ? "bg-emerald-100 text-emerald-700"
                              : m.status === "MAINTENANCE"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">{m.nama_mesin}</h3>
                      <p className="text-xs text-gray-500">{m.merk_tipe}</p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/40">
                          <span className="text-[10px] text-gray-400">Daya Terpasang</span>
                          <p className="font-bold text-gray-900 dark:text-white">{m.dt} kW</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/40">
                          <span className="text-[10px] text-gray-400">Daya Mampu</span>
                          <p className="font-bold text-emerald-600">{m.dmp} kW</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {m.running_hours} Jam JKM
                      </span>
                      <button
                        onClick={() => {
                          setNewTicket((prev) => ({
                            ...prev,
                            id_mesin: m.id_mesin,
                            nama_mesin: m.nama_mesin,
                            kd_unit: m.kd_unit,
                            nama_unit: m.nama_unit,
                            running_hours: m.running_hours,
                          }));
                          setWizardStep(1);
                          setWizardOpen(true);
                        }}
                        className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-theme-xs"
                      >
                        Buat Tiket HAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4-STEP WIZARD MODAL BUAT HAR */}
          {wizardOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <Wrench className="h-5 w-5 text-brand-500" />
                    Buat Tiket HAR & Job Card (4-Step Wizard)
                  </h3>
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Stepper Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800 text-xs font-bold">
                  {[
                    { num: 1, label: "Informasi" },
                    { num: 2, label: "Checklist" },
                    { num: 3, label: "Tindakan" },
                    { num: 4, label: "Dokumentasi" },
                  ].map((s) => (
                    <div
                      key={s.num}
                      onClick={() => setWizardStep(s.num)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        wizardStep === s.num ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                          wizardStep === s.num
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {s.num}
                      </span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* STEP 1: INFORMASI */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Unit Layanan PLTD
                        </label>
                        <select
                          value={newTicket.kd_unit}
                          onChange={(e) => {
                            const kd = e.target.value;
                            const u = unitOptions.find((x) => x.kd_unit === kd);
                            loadMachines(kd, u?.nama_unit);
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        >
                          {unitOptions.map((u) => (
                            <option key={u.kd_unit} value={u.kd_unit}>
                              {u.nama_unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Mesin Pembangkit
                        </label>
                        <select
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Tipe Pemeliharaan
                        </label>
                        <select
                          value={newTicket.maintenance_type}
                          onChange={(e) => setNewTicket({ ...newTicket, maintenance_type: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        >
                          {maintenanceTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Kategori Kerusakan (AMC)
                        </label>
                        <select
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
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
                          Prioritas
                        </label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        >
                          <option value="LOW">LOW</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Running Hours (JKM)
                        </label>
                        <input
                          type="number"
                          value={newTicket.running_hours}
                          onChange={(e) =>
                            setNewTicket({ ...newTicket, running_hours: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Jam Mulai Pekerjaan
                        </label>
                        <input
                          type="text"
                          value={newTicket.start_time}
                          onChange={(e) => setNewTicket({ ...newTicket, start_time: e.target.value })}
                          placeholder="08:00"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Target Selesai
                        </label>
                        <input
                          type="text"
                          value={newTicket.end_time}
                          onChange={(e) => setNewTicket({ ...newTicket, end_time: e.target.value })}
                          placeholder="11:30"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: CHECKLIST */}
                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Verifikasi item checklist teknis pemeliharaan mesin:
                    </p>
                    {parseChecklist(newTicket.checklist_data).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/40 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" />
                          Terverifikasi
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 3: TINDAKAN */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Deskripsi Temuan / Anomali Kerusakan
                      </label>
                      <textarea
                        rows={3}
                        value={newTicket.fault_description}
                        onChange={(e) => setNewTicket({ ...newTicket, fault_description: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Tindakan Perbaikan yang Dilakukan
                      </label>
                      <textarea
                        rows={3}
                        value={newTicket.action_taken}
                        onChange={(e) => setNewTicket({ ...newTicket, action_taken: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Hasil Akhir Pekerjaan
                      </label>
                      <input
                        type="text"
                        value={newTicket.final_result}
                        onChange={(e) => setNewTicket({ ...newTicket, final_result: e.target.value })}
                        placeholder="Normal & Beban Stabil"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: DOKUMENTASI */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Lampirkan tautan atau konfirmasi bukti pengerjaan teknis:
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-gray-200 p-3 text-center dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Foto Sebelum</span>
                        <div className="mt-2 flex h-24 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="URL Foto Sebelum"
                          value={newTicket.photo_before}
                          onChange={(e) => setNewTicket({ ...newTicket, photo_before: e.target.value })}
                          className="mt-2 w-full rounded-lg border border-gray-200 p-1.5 text-[10px] dark:border-gray-700"
                        />
                      </div>

                      <div className="rounded-xl border border-gray-200 p-3 text-center dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Saat Pengerjaan</span>
                        <div className="mt-2 flex h-24 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="URL Foto Pengerjaan"
                          value={newTicket.photo_process}
                          onChange={(e) => setNewTicket({ ...newTicket, photo_process: e.target.value })}
                          className="mt-2 w-full rounded-lg border border-gray-200 p-1.5 text-[10px] dark:border-gray-700"
                        />
                      </div>

                      <div className="rounded-xl border border-gray-200 p-3 text-center dark:border-gray-800">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Setelah Pengerjaan</span>
                        <div className="mt-2 flex h-24 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="URL Foto Setelah"
                          value={newTicket.photo_after}
                          onChange={(e) => setNewTicket({ ...newTicket, photo_after: e.target.value })}
                          className="mt-2 w-full rounded-lg border border-gray-200 p-1.5 text-[10px] dark:border-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <button
                    type="button"
                    disabled={wizardStep === 1}
                    onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                  >
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-2">
                    {wizardStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep((prev) => Math.min(4, prev + 1))}
                        className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-theme-xs"
                      >
                        Lanjutkan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCreateSubmit}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-theme-xs"
                      >
                        Kirim & Ajukan Tiket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL JOB CARD MODAL */}
          {detailModalOpen && selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                      Detail Job Card HAR
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedTicket.ticket_number} — {selectedTicket.nama_mesin}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Workflow Stepper */}
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs font-bold text-center">
                    <div className="flex-1">
                      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="mt-1 block text-[10px] text-gray-700 dark:text-gray-300">1. Dibuat</span>
                    </div>

                    <div className="flex-1">
                      <div
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-white ${
                          selectedTicket.status !== "DRAFT" ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="mt-1 block text-[10px] text-gray-700 dark:text-gray-300">2. Diajukan</span>
                    </div>

                    <div className="flex-1">
                      <div
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-white ${
                          selectedTicket.status === "APPROVED" ? "bg-emerald-600" : "bg-brand-500"
                        }`}
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </div>
                      <span className="mt-1 block text-[10px] text-brand-600 font-extrabold">3. Review SPV</span>
                    </div>

                    <div className="flex-1">
                      <div
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-white ${
                          selectedTicket.status === "APPROVED" ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="mt-1 block text-[10px] text-gray-700 dark:text-gray-300">4. Approval</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50/60 p-3 dark:bg-gray-800/40">
                    <div>
                      <span className="text-[10px] text-gray-400">Tipe & Kategori</span>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedTicket.maintenance_type} • {selectedTicket.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Teknisi Penanggung Jawab</span>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedTicket.teknisi_name}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400">Deskripsi Temuan</span>
                    <p className="mt-1 rounded-xl bg-gray-50 p-2.5 font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {selectedTicket.fault_description}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400">Tindakan Perbaikan</span>
                    <p className="mt-1 rounded-xl bg-gray-50 p-2.5 font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {selectedTicket.action_taken}
                    </p>
                  </div>

                  {selectedTicket.final_result && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">Hasil Akhir</span>
                      <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedTicket.final_result}
                      </p>
                    </div>
                  )}
                </div>

                {/* Approval Action */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setDetailModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                  >
                    Tutup
                  </button>
                  {selectedTicket.status !== "APPROVED" &&
                    (userRole === "SUPERVISOR" ||
                      userRole === "ADMIN" ||
                      userRole === "SUPERADMIN") && (
                      <button
                        type="button"
                        onClick={() => handleApproveTicket(selectedTicket.id)}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-theme-xs"
                      >
                        Setujui & Approve Tiket
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
