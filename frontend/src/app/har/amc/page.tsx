"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Wrench,
  Activity,
  Layers,
  ShieldAlert,
  UserCheck,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { AMCReport } from "@/types";

export default function AmcModulePage() {
  const [reports, setReports] = useState<AMCReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUp3, setSelectedUp3] = useState("ALL");
  const [selectedPrioritas, setSelectedPrioritas] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AMCReport | null>(null);

  // New Report State
  const [newReport, setNewReport] = useState<Partial<AMCReport>>({
    periode: "Setelah AMC",
    up3: "BERAU",
    sentral: "ULD BATU AMPAR",
    unit_pembangkit: "PLTD BATU AMPAR #01 (DEUTZ)",
    merk: "DEUTZ",
    tipe: "BF6M 1013 E",
    serial_number: "000344",
    dtp: 450,
    dmp: 380,
    prioritas: "PRIORITAS 1",
    indikasi_gangguan: "",
    dampak_mesin: "",
    rencana_tindak_lanjut: "",
    list_material: "",
    progres: "",
    pic: "Teknisi Pemeliharaan",
    lama_gangguan_jam: 0,
    status: "OPEN",
  });

  // Update Report State
  const [updateData, setUpdateData] = useState({
    status: "OPEN",
    progres: "",
    rencana_tindak_lanjut: "",
    list_material: "",
    pic: "",
    lama_gangguan_jam: 0,
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: AMCReport[] }>("/har/amc");
      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat laporan AMC:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/har/amc", newReport);
      setCreateModalOpen(false);
      fetchReports();
      alert("Laporan Gangguan AMC 2026 berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal mencatat gangguan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await apiClient.put(`/har/amc/${selectedReport.id}`, updateData);
      setUpdateModalOpen(false);
      fetchReports();
      alert("Progres gangguan AMC berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal update gangguan: " + (err.response?.data?.message || err.message));
    }
  };

  const openUpdateModal = (report: AMCReport) => {
    setSelectedReport(report);
    setUpdateData({
      status: report.status,
      progres: report.progres,
      rencana_tindak_lanjut: report.rencana_tindak_lanjut,
      list_material: report.list_material,
      pic: report.pic,
      lama_gangguan_jam: report.lama_gangguan_jam,
    });
    setUpdateModalOpen(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        search === "" ||
        r.unit_pembangkit.toLowerCase().includes(search.toLowerCase()) ||
        r.indikasi_gangguan.toLowerCase().includes(search.toLowerCase()) ||
        r.sentral.toLowerCase().includes(search.toLowerCase()) ||
        r.pic.toLowerCase().includes(search.toLowerCase());

      const matchesUp3 = selectedUp3 === "ALL" || r.up3.toUpperCase() === selectedUp3.toUpperCase();
      const matchesPrioritas = selectedPrioritas === "ALL" || r.prioritas === selectedPrioritas;
      const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;

      return matchesSearch && matchesUp3 && matchesPrioritas && matchesStatus;
    });
  }, [reports, search, selectedUp3, selectedPrioritas, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const open = reports.filter((r) => r.status === "OPEN").length;
    const inProgress = reports.filter((r) => r.status === "IN_PROGRESS").length;
    const closed = reports.filter((r) => r.status === "CLOSE").length;
    const totalDowntime = reports.reduce((acc, r) => acc + (r.lama_gangguan_jam || 0), 0);
    return { total, open, inProgress, closed, totalDowntime };
  }, [reports]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "PERIODE",
      "UP3",
      "SENTRAL",
      "UNIT PEMBANGKIT",
      "MERK",
      "TIPE",
      "S/N",
      "DTP (kW)",
      "DMP (kW)",
      "PRIORITAS",
      "INDIKASI GANGGUAN",
      "DAMPAK MESIN",
      "WAKTU KEJADIAN",
      "RENCANA TINDAK LANJUT",
      "LIST MATERIAL",
      "PROGRES",
      "PIC",
      "LAMA GANGGUAN (JAM)",
      "STATUS",
    ];

    const rows = filteredReports.map((r) => [
      r.id,
      `"${r.periode}"`,
      `"${r.up3}"`,
      `"${r.sentral}"`,
      `"${r.unit_pembangkit}"`,
      `"${r.merk}"`,
      `"${r.tipe}"`,
      `"${r.serial_number}"`,
      r.dtp,
      r.dmp,
      `"${r.prioritas}"`,
      `"${(r.indikasi_gangguan || "").replace(/"/g, '""')}"`,
      `"${(r.dampak_mesin || "").replace(/"/g, '""')}"`,
      `"${r.waktu_kejadian}"`,
      `"${(r.rencana_tindak_lanjut || "").replace(/"/g, '""')}"`,
      `"${(r.list_material || "").replace(/"/g, '""')}"`,
      `"${(r.progres || "").replace(/"/g, '""')}"`,
      `"${r.pic}"`,
      r.lama_gangguan_jam,
      `"${r.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LAPORAN_GANGGUAN_AMC_KIT_KALTIMRA_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI"]}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  KIT KALTIMRA 2026
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Regional Kalimantan 3
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Pencatatan Gangguan AMC & Pemeliharaan Terencana
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Data resmi Laporan Gangguan AMC Sentral PLTD (Batu Ampar, Biduk-Biduk, Tabang, Kelay, Maratua, Tanah Merah)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Gangguan Baru</span>
              </button>
            </div>
          </div>

          {/* Bento Summary Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Gangguan
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Kejadian
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-theme-xs dark:border-rose-900/50 dark:bg-rose-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Status Open
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.open}</span>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Perlu Aksi
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-theme-xs dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                In Progress
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {stats.inProgress}
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Sedang Dikerjakan
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-theme-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Closed / Normal
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.closed}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Terselesaikan
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-theme-xs dark:border-blue-900/50 dark:bg-blue-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Total Downtime
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {stats.totalDowntime.toFixed(1)}
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Jam Kerja
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari mesin, indikasi kerusakan, sentral, atau teknisi..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedUp3}
                onChange={(e) => setSelectedUp3(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua UP3</option>
                <option value="BERAU">UP3 BERAU</option>
                <option value="SAMARINDA">UP3 SAMARINDA</option>
                <option value="KALTARA">UP3 KALTARA</option>
              </select>

              <select
                value={selectedPrioritas}
                onChange={(e) => setSelectedPrioritas(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="PRIORITAS 1">PRIORITAS 1</option>
                <option value="PRIORITAS 2">PRIORITAS 2</option>
                <option value="PRIORITAS 3">PRIORITAS 3</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Status</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="CLOSE">CLOSE</option>
              </select>

              <button
                onClick={fetchReports}
                title="Refresh Data"
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <FileSpreadsheet className="h-4 w-4 text-brand-500" />
                Matriks Laporan Gangguan Mesin Pembangkit Diesel (PLTD)
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Menampilkan {filteredReports.length} dari {reports.length} rekaman
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Memuat data gangguan AMC...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Tidak ada data gangguan yang sesuai dengan filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3.5">#</th>
                      <th className="px-4 py-3.5">UP3 / Sentral</th>
                      <th className="px-4 py-3.5">Unit Pembangkit</th>
                      <th className="px-4 py-3.5">Merk / Tipe</th>
                      <th className="px-4 py-3.5">DTP / DMP</th>
                      <th className="px-4 py-3.5">Prioritas</th>
                      <th className="px-4 py-3.5">Indikasi Gangguan</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">PIC</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredReports.map((r, idx) => {
                      const isExpanded = expandedId === r.id;
                      return (
                        <tr key={r.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                          <td className="px-4 py-4 font-bold text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900 dark:text-white">{r.sentral}</p>
                            <p className="text-[10px] text-gray-400">UP3 {r.up3}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-brand-600 dark:text-brand-400">{r.unit_pembangkit}</p>
                            <p className="text-[10px] text-gray-400">S/N: {r.serial_number || "-"}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{r.merk}</span>
                            <span className="text-[10px] text-gray-400 block">{r.tipe}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-gray-900 dark:text-white">{r.dtp}</span>
                            <span className="text-gray-400"> / </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.dmp} kW</span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                r.prioritas === "PRIORITAS 1"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                                  : r.prioritas === "PRIORITAS 2"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                              }`}
                            >
                              {r.prioritas}
                            </span>
                          </td>
                          <td className="px-4 py-4 max-w-[240px] truncate" title={r.indikasi_gangguan}>
                            <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                              {r.indikasi_gangguan}
                            </p>
                            <p className="truncate text-[10px] text-gray-400">{r.dampak_mesin}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                r.status === "CLOSE"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : r.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                            {r.pic || "-"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                title="Detail Gangguan"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => openUpdateModal(r)}
                                className="rounded-lg bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-600 transition-colors shadow-theme-xs"
                              >
                                Update Progres
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expandable Details Modal / Section */}
          {expandedId && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/20 p-5 shadow-theme-xs dark:border-brand-900/50 dark:bg-brand-950/20">
              {(() => {
                const item = reports.find((x) => x.id === expandedId);
                if (!item) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400">
                          Detail Kronologi & Rencana Perbaikan
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {item.unit_pembangkit} — {item.sentral}
                        </h3>
                      </div>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-[11px] font-bold uppercase text-gray-500">Rencana Tindak Lanjut</p>
                        <p className="mt-1.5 whitespace-pre-line text-xs font-medium text-gray-800 dark:text-gray-200">
                          {item.rencana_tindak_lanjut || "Belum ada rencana tindak lanjut tercatat."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-[11px] font-bold uppercase text-gray-500">List Kebutuhan Material</p>
                        <p className="mt-1.5 whitespace-pre-line text-xs font-medium text-gray-800 dark:text-gray-200">
                          {item.list_material || "Tidak memerlukan material pengganti / belum didata."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-[11px] font-bold uppercase text-gray-500">Progres Penanganan Terkini</p>
                        <p className="mt-1.5 whitespace-pre-line text-xs font-medium text-gray-800 dark:text-gray-200">
                          {item.progres || "Sedang dalam tahap investigasi awal."}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] text-gray-400 dark:border-gray-800">
                          <span>Downtime: {item.lama_gangguan_jam} Jam</span>
                          <span>PIC: {item.pic}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Modal: Catat Gangguan Baru */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                    Catat Laporan Gangguan AMC 2026
                  </h3>
                  <button
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        UP3 Wilayah
                      </label>
                      <select
                        value={newReport.up3}
                        onChange={(e) => setNewReport({ ...newReport, up3: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        <option value="BERAU">UP3 BERAU</option>
                        <option value="SAMARINDA">UP3 SAMARINDA</option>
                        <option value="KALTARA">UP3 KALTARA</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Sentral / Unit Layanan
                      </label>
                      <input
                        type="text"
                        required
                        value={newReport.sentral}
                        onChange={(e) => setNewReport({ ...newReport, sentral: e.target.value })}
                        placeholder="Contoh: ULD BATU AMPAR"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Prioritas Gangguan
                      </label>
                      <select
                        value={newReport.prioritas}
                        onChange={(e) => setNewReport({ ...newReport, prioritas: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        <option value="PRIORITAS 1">PRIORITAS 1 (Kritis)</option>
                        <option value="PRIORITAS 2">PRIORITAS 2 (Sedang)</option>
                        <option value="PRIORITAS 3">PRIORITAS 3 (Ringan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Nama Unit Pembangkit
                      </label>
                      <input
                        type="text"
                        required
                        value={newReport.unit_pembangkit}
                        onChange={(e) => setNewReport({ ...newReport, unit_pembangkit: e.target.value })}
                        placeholder="PLTD BATU AMPAR #01"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Merk & Tipe Mesin
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newReport.merk}
                          onChange={(e) => setNewReport({ ...newReport, merk: e.target.value })}
                          placeholder="DEUTZ"
                          className="w-1/2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                        <input
                          type="text"
                          required
                          value={newReport.tipe}
                          onChange={(e) => setNewReport({ ...newReport, tipe: e.target.value })}
                          placeholder="BF6M 1013 E"
                          className="w-1/2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        DTP & DMP (kW)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="DTP"
                          value={newReport.dtp}
                          onChange={(e) => setNewReport({ ...newReport, dtp: parseFloat(e.target.value) || 0 })}
                          className="w-1/2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                        <input
                          type="number"
                          placeholder="DMP"
                          value={newReport.dmp}
                          onChange={(e) => setNewReport({ ...newReport, dmp: parseFloat(e.target.value) || 0 })}
                          className="w-1/2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Indikasi Kerusakan & Anomali
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={newReport.indikasi_gangguan}
                      onChange={(e) => setNewReport({ ...newReport, indikasi_gangguan: e.target.value })}
                      placeholder="Jelaskan anomali suara, getaran, kebocoran pelumas, dsb..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Dampak ke Mesin Sendiri
                    </label>
                    <textarea
                      rows={2}
                      value={newReport.dampak_mesin}
                      onChange={(e) => setNewReport({ ...newReport, dampak_mesin: e.target.value })}
                      placeholder="Daya mampu tidak maksimal / trip proteksi / mesin mati..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Rencana Tindak Lanjut
                      </label>
                      <textarea
                        rows={2}
                        value={newReport.rencana_tindak_lanjut}
                        onChange={(e) => setNewReport({ ...newReport, rencana_tindak_lanjut: e.target.value })}
                        placeholder="Langkah investigasi / perbaikan..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Kebutuhan Spare Part / Material
                      </label>
                      <textarea
                        rows={2}
                        value={newReport.list_material}
                        onChange={(e) => setNewReport({ ...newReport, list_material: e.target.value })}
                        placeholder="Liner, Gasket, Filter, Sensor..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Teknisi Penanggung Jawab (PIC)
                      </label>
                      <input
                        type="text"
                        value={newReport.pic}
                        onChange={(e) => setNewReport({ ...newReport, pic: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Estimasi Lama Gangguan (Jam)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={newReport.lama_gangguan_jam}
                        onChange={(e) =>
                          setNewReport({ ...newReport, lama_gangguan_jam: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600"
                    >
                      Simpan Laporan Gangguan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Update Progres */}
          {updateModalOpen && selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <Activity className="h-5 w-5 text-brand-500" />
                    Update Progres Gangguan — #{selectedReport.id}
                  </h3>
                  <button
                    onClick={() => setUpdateModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
                  <div className="rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">{selectedReport.unit_pembangkit}</p>
                    <p className="text-gray-500">{selectedReport.indikasi_gangguan}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Status Gangguan
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    >
                      <option value="OPEN">OPEN (Menunggu Penanganan)</option>
                      <option value="IN_PROGRESS">IN PROGRESS (Sedang Dikerjakan)</option>
                      <option value="CLOSE">CLOSE (Selesai & Normal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Laporan Progres & Kronologi Penanganan
                    </label>
                    <textarea
                      rows={3}
                      value={updateData.progres}
                      onChange={(e) => setUpdateData({ ...updateData, progres: e.target.value })}
                      placeholder="Jelaskan progres tahapan pembongkaran, pergantian spare part, running test..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Teknisi PIC
                      </label>
                      <input
                        type="text"
                        value={updateData.pic}
                        onChange={(e) => setUpdateData({ ...updateData, pic: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Lama Gangguan Akumulatif (Jam)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={updateData.lama_gangguan_jam}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            lama_gangguan_jam: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setUpdateModalOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600"
                    >
                      Update Progres
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
