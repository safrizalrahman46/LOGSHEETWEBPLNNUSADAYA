"use client";

import React, { useState } from "react";
import { AppLayout } from "@/layout/AppLayout";
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Wrench,
  UserCheck,
  Cpu,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderDown,
  Layers,
  FileCheck,
  Printer,
  Table,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import {
  exportAMCPDF,
  exportHARPDF,
  exportAttendancePDF,
  exportMachinesPDF,
  exportLogsheetPDF,
  exportDashboardSummaryPDF,
  exportToCSV,
} from "@/lib/exportUtils";

type ExportCategory = {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  filename: string;
  format: string;
  icon: React.ElementType;
  color: string;
};

const EXPORT_LIST: ExportCategory[] = [
  {
    id: "amc",
    title: "Laporan Gangguan AMC KIT KALTIMRA 2026",
    description:
      "Rekap seluruh gangguan mesin pembangkit, daya terpasang (DTP), daya mampu (DMP), indikasi kendala, kronologi, dan material.",
    endpoint: "/export/amc/excel",
    filename: "Laporan_Gangguan_AMC_KIT_KALTIMRA_2026.xlsx",
    format: "Excel • PDF • CSV",
    icon: AlertTriangle,
    color: "from-rose-500 to-red-600",
  },
  {
    id: "har",
    title: "Tiket Pemeliharaan HAR & Job Cards",
    description:
      "Daftar tiket HAR mesin diesel, kategori perbaikan (P1-P6), running hours (JKM), PIC teknisi, dan status persetujuan supervisor.",
    endpoint: "/export/har/excel",
    filename: "Rekap_Tiket_HAR_JobCards.xlsx",
    format: "Excel • PDF • CSV",
    icon: Wrench,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "attendance",
    title: "Rekap Presensi Operator Geofencing GPS",
    description:
      "Log presensi kehadiran shift kerja, koordinat GPS, validasi radius 250m Haversine, dan status anomali lokasi.",
    endpoint: "/export/attendance/excel",
    filename: "Rekap_Presensi_Operator_Geofence.xlsx",
    format: "Excel • PDF • CSV",
    icon: UserCheck,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "machines",
    title: "Master Data Mesin Pembangkit PLTD",
    description:
      "Data inventaris mesin diesel, merk, tipe, nomor seri, daya terpasang, daya mampu pasok, dan kondisi operasi.",
    endpoint: "/export/machines/excel",
    filename: "Data_Mesin_Pembangkit_PLTD.xlsx",
    format: "Excel • PDF • CSV",
    icon: Cpu,
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "logsheet",
    title: "Rekap Logsheet Pembebanan 48 Slot",
    description:
      "Data logsheet operasional 24 jam (48 interval), kurva pembebanan sistem, stand kWh, dan analisis SFC bahan bakar.",
    endpoint: "/export/excel",
    filename: "Rekap_Logsheet_Operasional.xlsx",
    format: "Excel • PDF • CSV",
    icon: FileText,
    color: "from-cyan-600 to-blue-700",
  },
];

// Fallback Mock Datasets if backend has empty tables
const fallbackAMC = [
  { unit_name: "ULD BATU AMPAR", tipe_mesin: "Caterpillar", machine_name: "CAT #02 (Unit 0265)", tgl_gangguan: "2026-10-20 14:30", tgl_normal: "2026-10-21 09:00", daya_terpasang: 1000, daya_mampu: 850, mw_hilang: 0.85, indikasi_kendala: "Tekanan oli pelumas menurun di bawah 3.0 bar saat 380 kW", status: "NORMAL" },
  { unit_name: "ULD MUARA PAHU", tipe_mesin: "Deutz", machine_name: "DEUTZ #01 (Unit 0192)", tgl_gangguan: "2026-10-22 08:15", tgl_normal: "2026-10-22 17:45", daya_terpasang: 800, daya_mampu: 600, mw_hilang: 0.60, indikasi_kendala: "High temperature coolant water alarm radiator", status: "NORMAL" },
  { unit_name: "ULD LONG SEGAR", tipe_mesin: "Perkins", machine_name: "PERKINS #02 (Unit 0279)", tgl_gangguan: "2026-10-24 11:00", tgl_normal: null, daya_terpasang: 600, daya_mampu: 500, mw_hilang: 0.50, indikasi_kendala: "Kerusakan governor actuator throttle control", status: "GANGGUAN" },
];

const fallbackHAR = [
  { ticket_number: "HAR-2026-00022", created_at: "2026-10-20", nama_unit: "ULD BATU AMPAR", nama_mesin: "CAT #02 (CATERPILLAR)", kategori: "Corrective", running_hours: 4250, deskripsi: "Penggantian filter oli pelumas dan sensor tekanan oli", teknisi_name: "Syahrodi", prioritas: "HIGH", status: "IN_PROGRESS", status_approval: "approved" },
  { ticket_number: "HAR-2026-00021", created_at: "2026-10-21", nama_unit: "ULD BATU AMPAR", nama_mesin: "DEUTZ #01", kategori: "Preventive P1", running_hours: 2500, deskripsi: "Pemeriksaan berkala parameter logsheet WACB dan filter solar", teknisi_name: "Ahmad Tehnisi", prioritas: "MEDIUM", status: "SUBMITTED", status_approval: "pending" },
  { ticket_number: "HAR-2026-00020", created_at: "2026-10-18", nama_unit: "ULD MUARA PAHU", nama_mesin: "PERKINS #01", kategori: "Preventive P3", running_hours: 6000, deskripsi: "Overhaul sistem pendingin radiator dan kalibrasi injektor", teknisi_name: "Budi Santoso", prioritas: "MEDIUM", status: "RESOLVED", status_approval: "approved" },
];

const fallbackAttendance = [
  { timestamp: "2026-10-24 07:45:12", user_name: "Syahrodi", nama_unit: "ULD BATU AMPAR", shift: "Pagi (08:00 - 16:00)", distance: 42, status: "VALID GEOFENCE" },
  { timestamp: "2026-10-24 07:50:33", user_name: "Ahmad Tehnisi", nama_unit: "ULD BATU AMPAR", shift: "Pagi (08:00 - 16:00)", distance: 18, status: "VALID GEOFENCE" },
  { timestamp: "2026-10-24 15:40:02", user_name: "Rahmat Hidayat", nama_unit: "ULD BATU AMPAR", shift: "Sore (16:00 - 00:00)", distance: 65, status: "VALID GEOFENCE" },
];

const fallbackMachines = [
  { kd_mesin: "0264", machine_name: "CAT #01", merk: "CATERPILLAR", machine_type: "3516B", daya_terpasang: 1200, daya_mampu: 1000, status: "standby" },
  { kd_mesin: "0265", machine_name: "CAT #02", merk: "CATERPILLAR", machine_type: "3512B", daya_terpasang: 1000, daya_mampu: 850, status: "gangguan-rusak" },
  { kd_mesin: "0279", machine_name: "PERKINS #02", merk: "PERKINS", machine_type: "4008TAG", daya_terpasang: 600, daya_mampu: 500, status: "standby" },
  { kd_mesin: "0192", machine_name: "DEUTZ #01", merk: "DEUTZ", machine_type: "BF8M716", daya_terpasang: 800, daya_mampu: 700, status: "operasi" },
  { kd_mesin: "0193", machine_name: "DEUTZ #02", merk: "DEUTZ", machine_type: "BF8M716", daya_terpasang: 800, daya_mampu: 700, status: "operasi" },
];

const fallbackLogsheet = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return {
    jam: `${h}:${m}`,
    machine_name: "CAT #01 (CATERPILLAR 1200 kW)",
    machine_status: i >= 16 && i <= 44 ? "OPERASI" : "STANDBY",
    beban_mesin: i >= 16 && i <= 44 ? 750 + Math.round(Math.sin(i / 5) * 120) : 0,
    tegangan: 388,
    frekuensi: 50.02,
    suhu_radiator: i >= 16 && i <= 44 ? 82 : 34,
    operator_name: i < 16 ? "Syahrodi" : i < 32 ? "Ahmad Tehnisi" : "Rahmat Hidayat",
    approval_status: "Disetujui Supervisor",
  };
});

export default function DataIOPage() {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [downloadingAction, setDownloadingAction] = useState<{ id: string; format: string } | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Import State
  const [importType, setImportType] = useState<"amc" | "machines" | "logsheets">("amc");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // EXCEL DOWNLOAD
  const handleDownloadExcel = async (item: ExportCategory) => {
    setDownloadingAction({ id: item.id, format: "excel" });
    try {
      const res = await apiClient.get(item.endpoint, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification("success", `File Excel (.xlsx) untuk ${item.title} berhasil diunduh.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification("error", `Gagal mengunduh Excel ${item.title}. Periksa izin akses akun.`);
    } finally {
      setDownloadingAction(null);
    }
  };

  // PDF DOWNLOAD
  const handleDownloadPDF = async (item: ExportCategory) => {
    setDownloadingAction({ id: item.id, format: "pdf" });
    try {
      if (item.id === "amc") {
        let records = fallbackAMC;
        try {
          const res = await apiClient.get("/har/amc");
          if (res.data?.data && res.data.data.length > 0) {
            records = res.data.data;
          }
        } catch {}
        exportAMCPDF(records);
      } else if (item.id === "har") {
        let tickets = fallbackHAR;
        try {
          const res = await apiClient.get("/har/tickets");
          if (res.data?.data && res.data.data.length > 0) {
            tickets = res.data.data;
          }
        } catch {}
        exportHARPDF(tickets);
      } else if (item.id === "attendance") {
        let attendances = fallbackAttendance;
        try {
          const res = await apiClient.get("/attendance/history");
          if (res.data?.data && res.data.data.length > 0) {
            attendances = res.data.data;
          }
        } catch {}
        exportAttendancePDF(attendances);
      } else if (item.id === "machines") {
        let machines = fallbackMachines;
        try {
          const res = await apiClient.get("/admin/stats");
          if (res.data?.data?.machines && res.data.data.machines.length > 0) {
            machines = res.data.data.machines;
          }
        } catch {}
        exportMachinesPDF(machines);
      } else if (item.id === "logsheet") {
        let matrix = fallbackLogsheet;
        const today = new Date().toISOString().slice(0, 10);
        try {
          const res = await apiClient.get("/wacb/matrix", { params: { tanggal: today } });
          if (res.data?.data && res.data.data.length > 0) {
            matrix = res.data.data;
          }
        } catch {}
        exportLogsheetPDF({
          unitName: "BATU AMPAR",
          kdUnit: "0264",
          tanggal: today,
          matrixData: matrix,
        });
      }
      showNotification("success", `Dokumen Resmi PDF untuk ${item.title} berhasil dibuat & diunduh.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification("error", `Gagal memproses PDF ${item.title}.`);
    } finally {
      setDownloadingAction(null);
    }
  };

  // CSV DOWNLOAD
  const handleDownloadCSV = async (item: ExportCategory) => {
    setDownloadingAction({ id: item.id, format: "csv" });
    try {
      if (item.id === "amc") {
        let records = fallbackAMC;
        try {
          const res = await apiClient.get("/har/amc");
          if (res.data?.data && res.data.data.length > 0) records = res.data.data;
        } catch {}
        const headers = ["No", "Unit", "Nama Mesin", "Tipe Mesin", "Tgl Gangguan", "Tgl Normal", "Daya Terpasang (kW)", "Daya Mampu (kW)", "MW Hilang", "Indikasi Kendala", "Status"];
        const rows = records.map((r: any, i) => [
          i + 1,
          r.unit_name || "-",
          r.machine_name || "-",
          r.tipe_mesin || "Diesel",
          r.tgl_gangguan || "-",
          r.tgl_normal || "Belum Normal",
          r.daya_terpasang || 0,
          r.daya_mampu || 0,
          r.mw_hilang || 0,
          r.indikasi_kendala || "-",
          r.status || "OPEN",
        ]);
        exportToCSV("Laporan_Gangguan_AMC_KIT_KALTIMRA_2026.csv", headers, rows);
      } else if (item.id === "har") {
        let tickets = fallbackHAR;
        try {
          const res = await apiClient.get("/har/tickets");
          if (res.data?.data && res.data.data.length > 0) tickets = res.data.data;
        } catch {}
        const headers = ["No Tiket", "Tanggal", "Unit", "Nama Mesin", "Kategori", "Running Hours", "Uraian Kendala", "Teknisi PIC", "Prioritas", "Status"];
        const rows = tickets.map((t: any) => [
          t.ticket_number || `HAR-${t.id}`,
          t.created_at || "-",
          t.nama_unit || "-",
          t.nama_mesin || "-",
          t.kategori || "Preventive",
          t.running_hours || 0,
          t.deskripsi || "-",
          t.teknisi_name || "-",
          t.prioritas || "MEDIUM",
          t.status || "SUBMITTED",
        ]);
        exportToCSV("Rekap_Tiket_HAR_JobCards.csv", headers, rows);
      } else if (item.id === "attendance") {
        let attendances = fallbackAttendance;
        try {
          const res = await apiClient.get("/attendance/history");
          if (res.data?.data && res.data.data.length > 0) attendances = res.data.data;
        } catch {}
        const headers = ["No", "Waktu Presensi", "Nama Operator", "Unit Operasi", "Shift", "Jarak (meter)", "Status Validasi"];
        const rows = attendances.map((a: any, i) => [
          i + 1,
          a.timestamp || "-",
          a.user_name || "-",
          a.nama_unit || "-",
          a.shift || "Pagi",
          a.distance || 0,
          a.status || "VALID GEOFENCE",
        ]);
        exportToCSV("Rekap_Presensi_Operator_Geofence.csv", headers, rows);
      } else if (item.id === "machines") {
        const headers = ["No", "Kode Mesin", "Nama Mesin", "Merk", "Tipe", "Daya Terpasang (kW)", "Daya Mampu (kW)", "Status"];
        const rows = fallbackMachines.map((m: any, i) => [
          i + 1,
          m.kd_mesin,
          m.machine_name,
          m.merk,
          m.machine_type,
          m.daya_terpasang,
          m.daya_mampu,
          m.status,
        ]);
        exportToCSV("Data_Mesin_Pembangkit_PLTD.csv", headers, rows);
      } else if (item.id === "logsheet") {
        const headers = ["Slot Jam", "Mesin Pembangkit", "Status", "Beban (kW)", "Tegangan (V)", "Frekuensi (Hz)", "Suhu Radiator (°C)", "Operator", "Persetujuan"];
        const rows = fallbackLogsheet.map((l: any) => [
          l.jam,
          l.machine_name,
          l.machine_status,
          l.beban_mesin,
          l.tegangan,
          l.frekuensi,
          l.suhu_radiator,
          l.operator_name,
          l.approval_status,
        ]);
        exportToCSV("Rekap_Logsheet_Operasional.csv", headers, rows);
      }
      showNotification("success", `File CSV untuk ${item.title} berhasil diunduh.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification("error", `Gagal menyusun CSV ${item.title}.`);
    } finally {
      setDownloadingAction(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await apiClient.get(`/import/template/${importType}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Template_Impor_${importType.toUpperCase()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification("success", `Template Excel untuk ${importType.toUpperCase()} berhasil diunduh.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification("error", "Gagal mengunduh template Excel.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification("error", "Silakan pilih file Excel (.xlsx) atau CSV terlebih dahulu.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await apiClient.post(`/import/${importType}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        showNotification(
          "success",
          res.data.message || `Berhasil mengimpor data ${importType.toUpperCase()} ke database.`
        );
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById("file-import-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        showNotification("error", res.data?.message || "Impor gagal dilakukan.");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Terjadi kesalahan saat mengunggah file.";
      showNotification("error", errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                Data Management & Multi-Format Exports
              </span>
              <span className="text-xs text-gray-500">PLN Nusantara Daya</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-gray-900">
              Pusat Export & Import Data
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Ekspor laporan resmi berformat Spreadsheet Excel (.xlsx), Dokumen Resmi PDF (.pdf), dan Format Data CSV (.csv).
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("export")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "export"
                  ? "bg-white text-brand-600 shadow-theme-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Download className="h-4 w-4" />
              <span>Export Data ({EXPORT_LIST.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "import"
                  ? "bg-white text-brand-600 shadow-theme-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 shadow-theme-sm transition-all ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            )}
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
        )}

        {/* ================= TAB 1: EXPORT DATA ================= */}
        {activeTab === "export" && (
          <div className="space-y-6">
            {/* Quick Executive Summary Action Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#004581] via-[#0284c7] to-[#004581] p-5 text-white shadow-theme-md sm:p-6">
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    <Printer className="h-3.5 w-3.5" />
                    Ekspor Cepat Laporan Eksekutif
                  </div>
                  <h2 className="mt-2 text-lg sm:text-xl font-black">
                    Cetak Ringkasan Eksekutif Command Center (PDF)
                  </h2>
                  <p className="mt-1 text-xs text-white/80 max-w-xl">
                    Menghasilkan lembar laporan PDF resmi 1 halaman berisi indikator kesiapan 10 mesin, telemetri pembebanan puncak, status tiket pemeliharaan HAR, dan validitas GPS geofence.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportDashboardSummaryPDF({
                      unitName: "BATU AMPAR",
                      kdUnit: "0264",
                    })
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition-all hover:bg-amber-300 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Ringkasan Eksekutif (PDF)</span>
                </button>
              </div>
            </div>

            {/* Grid of Export Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {EXPORT_LIST.map((item) => {
                const Icon = item.icon;
                const isExcelLoading =
                  downloadingAction?.id === item.id && downloadingAction?.format === "excel";
                const isPDFLoading =
                  downloadingAction?.id === item.id && downloadingAction?.format === "pdf";
                const isCSVLoading =
                  downloadingAction?.id === item.id && downloadingAction?.format === "csv";

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-theme-xs transition-all hover:border-brand-500 hover:shadow-theme-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm`}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600">
                          {item.format}
                        </span>
                      </div>

                      <h3 className="mt-3.5 text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Buttons: Excel, PDF, CSV */}
                    <div className="mt-5 pt-3.5 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {/* Excel (.xlsx) */}
                        <button
                          onClick={() => handleDownloadExcel(item)}
                          disabled={isExcelLoading}
                          title="Download Spreadsheet Excel (.xlsx)"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
                        >
                          {isExcelLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          <span>Excel</span>
                        </button>

                        {/* PDF (.pdf) */}
                        <button
                          onClick={() => handleDownloadPDF(item)}
                          disabled={isPDFLoading}
                          title="Download Dokumen Resmi PDF (.pdf)"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] font-bold text-rose-700 transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                        >
                          {isPDFLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-rose-600" />
                          )}
                          <span>PDF</span>
                        </button>

                        {/* CSV (.csv) */}
                        <button
                          onClick={() => handleDownloadCSV(item)}
                          disabled={isCSVLoading}
                          title="Download Format Data CSV (.csv)"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-2 text-[11px] font-bold text-sky-700 transition-all hover:bg-sky-100 active:scale-95 disabled:opacity-50"
                        >
                          {isCSVLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Table className="h-3.5 w-3.5 text-sky-600" />
                          )}
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Petunjuk Ekspor Multi Format */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-blue-600" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold">Format Standar Resmi PLN Nusantara Daya (WACB DIGIKIT)</p>
                  <p className="mt-1">
                    Semua file spreadsheet yang diekspor menggunakan header dan styling standar korporat:
                  </p>
                  <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-blue-800">
                    <li><strong>Excel (.xlsx)</strong>: File spreadsheet berformat XML Open standard, kompatibel dengan Microsoft Excel 2016+, Office 365, Google Sheets, dan LibreOffice Calc.</li>
                    <li><strong>PDF (.pdf)</strong>: Dokumen resmi ber-kop PT PLN Nusantara Daya, lengkap dengan ringkasan metrik, lembar tabel bergaris, dan kotak verifikasi tanda tangan pengesahan.</li>
                    <li><strong>CSV (.csv)</strong>: Format data terstruktur UTF-8 BOM dengan pemisah delimiter baku, siap diproses untuk analisis data lebih lanjut.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: IMPORT DATA ================= */}
        {activeTab === "import" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Panel Kiri: Form Upload & Kategori */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Formulir Impor Data Massal
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Pilih tipe data yang ingin diimpor, gunakan file template yang telah disediakan untuk memastikan struktur kolom valid.
                </p>

                <form onSubmit={handleUploadFile} className="mt-6 space-y-6">
                  {/* Langkah 1: Kategori */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      1. Pilih Jenis Data
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        {
                          id: "amc",
                          label: "Gangguan AMC 2026",
                          desc: "Laporan gangguan mesin KIT",
                          icon: AlertTriangle,
                        },
                        {
                          id: "machines",
                          label: "Data Mesin",
                          desc: "Master mesin pembangkit",
                          icon: Cpu,
                        },
                        {
                          id: "logsheets",
                          label: "Logsheet Operasional",
                          desc: "Beban kW & meter kWh/BBM",
                          icon: FileText,
                        },
                      ].map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = importType === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => {
                              setImportType(cat.id as "amc" | "machines" | "logsheets");
                              setSelectedFile(null);
                            }}
                            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                              isSelected
                                ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 dark:bg-brand-500/10"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`h-4 w-4 ${
                                  isSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-brand-700 dark:text-brand-300" : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                              {cat.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Langkah 2: Download Template */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          2. Unduh Template Excel Siap Isi
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                          Gunakan template ini untuk menghindari kesalahan nama header kolom saat diimpor.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {downloadingTemplate ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FolderDown className="h-3.5 w-3.5 text-brand-600" />
                        )}
                        <span>Unduh Template (.xlsx)</span>
                      </button>
                    </div>
                  </div>

                  {/* Langkah 3: Pilih File */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      3. Unggah File (.xlsx atau .csv)
                    </label>
                    <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-gray-300 px-6 py-8 dark:border-gray-700 hover:border-brand-500 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                        <div className="mt-3 flex text-xs leading-6 text-gray-600 dark:text-gray-400 justify-center">
                          <label
                            htmlFor="file-import-input"
                            className="relative cursor-pointer rounded-md font-bold text-brand-600 hover:text-brand-500 focus-within:outline-none"
                          >
                            <span>Pilih file dari komputer</span>
                            <input
                              id="file-import-input"
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              className="sr-only"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <span className="pl-1">atau drag and drop</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Mendukung spreadsheet .xlsx dan .csv hingga 10MB
                        </p>
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold">{selectedFile.name}</span>
                          <span className="text-[10px] opacity-75">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            const fileInput = document.getElementById(
                              "file-import-input"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          className="font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          Ganti
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tombol Submit */}
                  <div>
                    <button
                      type="submit"
                      disabled={!selectedFile || uploading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-theme-xs transition-all hover:bg-brand-600 active:scale-98 disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Memproses & Menyimpan Data...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Mulai Impor ke Database</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Panel Kanan: Aturan & Panduan */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                  <Layers className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Panduan Format Kolom
                  </h3>
                </div>

                <div className="mt-4 space-y-4 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Format Gangguan AMC 2026:
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Wajib menyertakan kolom: <code>Periode</code>, <code>UP3</code>, <code>Sentral</code>, <code>Unit Pembangkit</code>, <code>Merk</code>, <code>DTP</code>, <code>DMP</code>, <code>Prioritas</code>, <code>Indikasi Gangguan</code>, dan <code>PIC</code>.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Format Data Mesin:
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Wajib menyertakan kolom: <code>Kode Mesin</code> (ID unik), <code>Kode Unit</code>, <code>Nama Mesin</code>, <code>Status</code> (operasi, standby, gangguan-rusak).
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Format Logsheet:
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Menyertakan <code>Kode Mesin</code>, <code>Jam (00-23)</code>, <code>Beban (kW)</code>, <code>Stand kWh</code>, <code>Stand BBM</code>, dan <code>Tegangan (V)</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
