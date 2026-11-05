"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Download,
  Trash2,
  ArrowLeft,
  X,
  Cpu,
  ChevronDown,
  Layers,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { PeakLoadReport } from "@/types";

const UP3_LIST = ["BONTANG", "BERAU", "SAMARINDA", "KALTARA"];

const UP3_SENTRALS: Record<string, string[]> = {
  BONTANG: [
    "ULD BATU AMPAR",
    "PLTD LONG SEGAR",
    "PLTD SENYIUR",
    "PLTD MUARA PANTUN",
    "PLTD SANDARAN",
    "PLTD SANGATA",
    "PLTD GEMAR BARU",
    "PLTD KARANGAN DALAM",
    "PLTD PENGANDAN",
  ],
  BERAU: [
    "ULD KELAY",
    "ULD BIDUK-BIDUK",
    "ULD MARATUA",
    "ULD MERASA",
    "ULD DERAWAN",
    "PLTD LABANG",
    "PLTD LUMBIS OGONG",
    "PLTD GUNUNG SARI",
    "PLTD KAYAN HULU",
  ],
  SAMARINDA: [
    "ULD DATAH BILANG",
    "ULD LONG APARI",
    "ULD LONG PAHANGAI",
    "ULD MUARA PAHU",
    "ULD MUARA PANTUAN",
    "ULD MUARA SIRAN",
    "ULD PENYINGGAHAN",
    "ULD SEDULANG",
    "ULD TABANG",
    "PLTD DILANG PUTI",
    "PLTD JANTUR",
    "PLTD KELUMPANG",
    "PLTD MUARA KEDANG",
  ],
  KALTARA: [
    "ULD KRAYAN",
    "ULD LONG LAYU",
    "ULD LONG PESO",
    "ULD PA UPAN",
    "ULD SEI MENGGARIS",
    "ULD TANAH MERAH",
    "PLTD SUNGAI BOH",
    "PLTD TAU LUMBIS",
    "PLTD LONG BELUAH",
    "PLTD SEKATAK BUJI",
  ],
};

export default function LaporanBebanPuncakPage() {
  const [reports, setReports] = useState<PeakLoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUp3, setSelectedUp3] = useState("ALL");
  const [selectedKondisi, setSelectedKondisi] = useState("ALL");
  const [selectedTanggal, setSelectedTanggal] = useState("");

  // Modal Input
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<PeakLoadReport | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    waktu_beban: "WBP_MALAM (18:00 - 22:00)",
    up3: "BONTANG",
    unit_id: "0264",
    unit_name: "ULD BATU AMPAR",
    dtp: 900,
    dmp: 760,
    beban_puncak: 540,
    mesin_operasi: 2,
    mesin_standby: 1,
    mesin_gangguan: 0,
    daftar_gangguan: "",
    operator_name: "",
    catatan: "",
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: PeakLoadReport[] }>("/beban-puncak");
      if (res.data?.success) {
        setReports(res.data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat laporan beban puncak:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.unit_name.toLowerCase().includes(q) ||
        r.up3.toLowerCase().includes(q) ||
        (r.daftar_gangguan && r.daftar_gangguan.toLowerCase().includes(q)) ||
        (r.operator_name && r.operator_name.toLowerCase().includes(q));

      const matchUp3 = selectedUp3 === "ALL" || r.up3.toUpperCase() === selectedUp3.toUpperCase();
      const matchKondisi = selectedKondisi === "ALL" || r.kondisi === selectedKondisi;
      const matchTanggal = !selectedTanggal || r.tanggal === selectedTanggal;

      return matchSearch && matchUp3 && matchKondisi && matchTanggal;
    });
  }, [reports, search, selectedUp3, selectedKondisi, selectedTanggal]);

  // Ringkasan KPI
  const kpi = useMemo(() => {
    let totDTP = 0;
    let totDMP = 0;
    let totBP = 0;
    let totGangguan = 0;
    let defisitCount = 0;
    let siagaCount = 0;
    let normalCount = 0;

    filteredReports.forEach((r) => {
      totDTP += r.dtp || 0;
      totDMP += r.dmp || 0;
      totBP += r.beban_puncak || 0;
      totGangguan += r.mesin_gangguan || 0;
      if (r.kondisi === "DEFISIT") defisitCount++;
      else if (r.kondisi === "SIAGA") siagaCount++;
      else normalCount++;
    });

    const totCadangan = totDMP - totBP;
    const persenCadangan = totDMP > 0 ? (totCadangan / totDMP) * 100 : 0;

    let statusSistem: "NORMAL" | "SIAGA" | "DEFISIT" = "NORMAL";
    if (defisitCount > 0 || totBP > totDMP) statusSistem = "DEFISIT";
    else if (siagaCount > 0 || persenCadangan < 15) statusSistem = "SIAGA";

    return {
      totDTP,
      totDMP,
      totBP,
      totCadangan,
      persenCadangan,
      totGangguan,
      statusSistem,
      normalCount,
      siagaCount,
      defisitCount,
    };
  }, [filteredReports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post("/beban-puncak", formData);
      if (res.data?.success) {
        alert("Laporan Beban Puncak berhasil dicatat dan status mesin disinkronkan!");
        setModalOpen(false);
        fetchReports();
      }
    } catch (err: any) {
      alert("Gagal menyimpan laporan: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await apiClient.delete(`/beban-puncak/${reportToDelete.id}`);
      alert("Laporan berhasil dihapus");
      setDeleteModalOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (err: any) {
      alert("Gagal menghapus laporan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = [
      "Tanggal",
      "Waktu Beban",
      "UP3",
      "Unit Sentral",
      "DTP (kW)",
      "DMP (kW)",
      "Beban Puncak (kW)",
      "Cadangan (kW)",
      "% Cadangan",
      "Kondisi",
      "Mesin Operasi",
      "Mesin Standby",
      "Mesin Gangguan",
      "Daftar Gangguan",
      "Operator",
    ];
    const rows = filteredReports.map((r) => [
      r.tanggal,
      r.waktu_beban,
      r.up3,
      r.unit_name,
      r.dtp,
      r.dmp,
      r.beban_puncak,
      r.cadangan_daya,
      r.persen_cadangan.toFixed(1) + "%",
      r.kondisi,
      r.mesin_operasi,
      r.mesin_standby,
      r.mesin_gangguan,
      `"${(r.daftar_gangguan || "").replace(/"/g, '""')}"`,
      r.operator_name || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Beban_Puncak_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["OPERATOR", "TEKNISI", "SUPERVISOR", "ADMIN", "SUPERADMIN"]}>
        <div className="space-y-6 pb-16">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-gray-200 bg-white p-1 text-gray-400 hover:text-gray-600 dark:border-gray-800 dark:bg-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">
                  Pelaporan Operasional & Neraca Daya
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Laporan Beban Puncak (WBP) Pembangkit PLTD
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Pencatatan resmi realisasi Beban Puncak, Kesiapan Mesin, Cadangan Daya, dan Status Gangguan KIT KALTIMRA
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 active:scale-98 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Beban Puncak Baru</span>
              </button>
            </div>
          </div>

          {/* KPI BENTO CARDS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* Status Sistem */}
            <div
              className={`rounded-2xl border p-4 shadow-theme-xs ${
                kpi.statusSistem === "NORMAL"
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  : kpi.statusSistem === "SIAGA"
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
                  : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Status Sistem
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-black ${
                    kpi.statusSistem === "NORMAL"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : kpi.statusSistem === "SIAGA"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {kpi.statusSistem}
                </span>
                <span className="rounded-md bg-white/70 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {kpi.statusSistem === "NORMAL" ? "Aman" : kpi.statusSistem === "SIAGA" ? "Siaga Daya" : "Defisit"}
                </span>
              </div>
            </div>

            {/* Total Beban Puncak */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Beban Puncak
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {kpi.totBP.toLocaleString("id-ID")}
                </span>
                <span className="text-xs font-semibold text-gray-400">kW</span>
              </div>
            </div>

            {/* Daya Mampu Pasok */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Daya Mampu (DMP)
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                  {kpi.totDMP.toLocaleString("id-ID")}
                </span>
                <span className="text-xs font-semibold text-gray-400">kW</span>
              </div>
            </div>

            {/* Cadangan Daya */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Cadangan Daya (Margin)
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-black ${
                    kpi.totCadangan >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {kpi.totCadangan > 0 ? `+${kpi.totCadangan.toLocaleString("id-ID")}` : kpi.totCadangan.toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  ({kpi.persenCadangan.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Total Mesin Gangguan */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-theme-xs dark:border-rose-900/50 dark:bg-rose-950/20">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Mesin Gangguan
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {kpi.totGangguan}
                </span>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Unit Mesin
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari sentral, UP3, gangguan, atau operator..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedUp3}
                onChange={(e) => setSelectedUp3(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua UP3</option>
                {UP3_LIST.map((u) => (
                  <option key={u} value={u}>
                    UP3 {u}
                  </option>
                ))}
              </select>

              <select
                value={selectedKondisi}
                onChange={(e) => setSelectedKondisi(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ALL">Semua Kondisi</option>
                <option value="NORMAL">NORMAL (Hijau)</option>
                <option value="SIAGA">SIAGA (Kuning)</option>
                <option value="DEFISIT">DEFISIT (Merah)</option>
              </select>

              <button
                type="button"
                onClick={fetchReports}
                title="Refresh Data"
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <Zap className="h-4 w-4 text-brand-500" />
                Daftar Pelaporan Beban Puncak Waktu Beban Puncak (WBP)
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {filteredReports.length} rekaman ditampilkan
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-xs font-semibold text-gray-400">
                Memuat data beban puncak...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-16 text-center px-4">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Belum Ada Laporan Beban Puncak
                </p>
                <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                  Gunakan tombol <span className="font-semibold text-brand-600">Catat Beban Puncak Baru</span> di atas untuk menginput laporan beban puncak sentral PLTD.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs [&_td]:whitespace-nowrap">
                  <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3.5">#</th>
                      <th className="px-4 py-3.5">Tanggal & Waktu</th>
                      <th className="px-4 py-3.5">Sentral / UP3</th>
                      <th className="px-4 py-3.5">DTP / DMP</th>
                      <th className="px-4 py-3.5">Beban Puncak</th>
                      <th className="px-4 py-3.5">Margin Cadangan</th>
                      <th className="px-4 py-3.5">Status Kondisi</th>
                      <th className="px-4 py-3.5">Kesiapan Mesin</th>
                      <th className="px-4 py-3.5">Kendala / Gangguan</th>
                      <th className="px-4 py-3.5">Operator</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredReports.map((r, idx) => (
                      <tr key={r.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-4 font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">{r.tanggal}</p>
                          <p className="text-[10px] text-gray-400">{r.waktu_beban}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">{r.unit_name}</p>
                          <p className="text-[10px] text-gray-400">UP3 {r.up3}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-900 dark:text-white">{r.dtp} kW</span>
                          <span className="text-gray-400"> / </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.dmp} kW</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-black text-brand-600 dark:text-brand-400">
                            {r.beban_puncak} kW
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`font-bold ${
                              r.cadangan_daya >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {r.cadangan_daya > 0 ? `+${r.cadangan_daya}` : r.cadangan_daya} kW
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            ({r.persen_cadangan?.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              r.kondisi === "NORMAL"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : r.kondisi === "SIAGA"
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}
                          >
                            {r.kondisi}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-emerald-600 font-bold">{r.mesin_operasi} Op</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-amber-600 font-bold">{r.mesin_standby} Stby</span>
                            {r.mesin_gangguan > 0 && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-rose-600 font-bold">{r.mesin_gangguan} Gg</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px] truncate" title={r.daftar_gangguan}>
                          <span className="text-gray-600 dark:text-gray-300 truncate block">
                            {r.daftar_gangguan || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {r.operator_name || "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setReportToDelete(r);
                              setDeleteModalOpen(true);
                            }}
                            className="rounded-lg border border-rose-200 bg-rose-50/70 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors shadow-theme-xs"
                            title="Hapus Laporan Beban Puncak"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MODAL INPUT BEBAN PUNCAK */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Catat Laporan Beban Puncak (WBP)
                      </h3>
                      <p className="text-xs text-gray-500">
                        Input realisasi beban puncak dan sinkronkan kesiapan mesin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Tanggal Laporan
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Waktu Beban Puncak
                      </label>
                      <select
                        value={formData.waktu_beban}
                        onChange={(e) => setFormData({ ...formData, waktu_beban: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        <option value="WBP_MALAM (18:00 - 22:00)">WBP MALAM (18:00 - 22:00)</option>
                        <option value="WBP_SIANG (10:00 - 14:00)">WBP SIANG (10:00 - 14:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        UP3 Wilayah
                      </label>
                      <select
                        value={formData.up3}
                        onChange={(e) => {
                          const val = e.target.value;
                          const defaultSentral = UP3_SENTRALS[val]?.[0] || "";
                          setFormData({ ...formData, up3: val, unit_name: defaultSentral });
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      >
                        {UP3_LIST.map((u) => (
                          <option key={u} value={u}>
                            UP3 {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Sentral / Unit Layanan
                      </label>
                      <input
                        type="text"
                        required
                        list="sentral-wbp-options"
                        value={formData.unit_name}
                        onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                      <datalist id="sentral-wbp-options">
                        {(UP3_SENTRALS[formData.up3] || []).map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Daya & Beban */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        DTP (kW)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.dtp}
                        onChange={(e) => setFormData({ ...formData, dtp: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        DMP (kW)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.dmp}
                        onChange={(e) => setFormData({ ...formData, dmp: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-emerald-600 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Beban Puncak (kW)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.beban_puncak}
                        onChange={(e) => setFormData({ ...formData, beban_puncak: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-bold text-brand-600 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-brand-400"
                      />
                    </div>
                  </div>

                  {/* Kesiapan Mesin */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Mesin Operasi
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.mesin_operasi}
                        onChange={(e) => setFormData({ ...formData, mesin_operasi: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-xs font-bold text-emerald-700 focus:border-emerald-500 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Mesin Standby
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.mesin_standby}
                        onChange={(e) => setFormData({ ...formData, mesin_standby: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs font-bold text-amber-700 focus:border-amber-500 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-rose-700 dark:text-rose-400">
                        Mesin Gangguan
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.mesin_gangguan}
                        onChange={(e) => setFormData({ ...formData, mesin_gangguan: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-bold text-rose-700 focus:border-rose-500 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                      />
                    </div>
                  </div>

                  {formData.mesin_gangguan > 0 && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-rose-700 dark:text-rose-400">
                        Daftar Mesin Gangguan & Kronologi Kendala
                      </label>
                      <textarea
                        rows={2}
                        value={formData.daftar_gangguan}
                        onChange={(e) => setFormData({ ...formData, daftar_gangguan: e.target.value })}
                        placeholder="Sebutkan nama mesin dan jenis kendala (contoh: DEUTZ #02 kebocoran seal water pump, MTU #06 overhaul)"
                        className="w-full rounded-xl border border-rose-200 bg-rose-50/30 px-3 py-2 text-xs font-medium text-gray-800 focus:border-rose-500 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-gray-200"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Nama Petugas / Operator
                      </label>
                      <input
                        type="text"
                        value={formData.operator_name}
                        onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
                        placeholder="Nama operator"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Catatan Sistem
                      </label>
                      <input
                        type="text"
                        value={formData.catatan}
                        onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                        placeholder="Kondisi cuaca / sistem"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50 shadow-theme-xs transition-colors"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Laporan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL DELETE */}
          {deleteModalOpen && reportToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Hapus Laporan Beban Puncak
                    </h3>
                    <p className="text-xs text-gray-500">
                      Tindakan ini permanen dan menghapus dari database.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/40">
                  <p className="font-bold">{reportToDelete.unit_name} • UP3 {reportToDelete.up3}</p>
                  <p className="text-gray-500">{reportToDelete.tanggal} ({reportToDelete.waktu_beban})</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setReportToDelete(null);
                    }}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-theme-xs"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
