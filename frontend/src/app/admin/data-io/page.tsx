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
} from "lucide-react";
import { apiClient } from "@/lib/api";

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
    format: "Excel (.xlsx)",
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
    format: "Excel (.xlsx)",
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
    format: "Excel (.xlsx)",
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
    format: "Excel (.xlsx)",
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
    format: "Excel (.xlsx)",
    icon: FileText,
    color: "from-cyan-600 to-blue-700",
  },
];

export default function DataIOPage() {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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

  const handleDownloadExport = async (item: ExportCategory) => {
    setDownloadingId(item.id);
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
      showNotification("success", `File ${item.title} berhasil diunduh.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification("error", `Gagal mengunduh file ${item.title}. Periksa izin akses akun.`);
    } finally {
      setDownloadingId(null);
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
              <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                Data Management
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">PLN Nusantara Daya</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
              Pusat Export & Import Data
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ekspor laporan resmi berformat spreadsheet Excel (.xlsx) dan integrasi impor data mesin, logsheet, dan gangguan AMC 2026.
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab("export")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "export"
                  ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Download className="h-4 w-4" />
              <span>Export Data ({EXPORT_LIST.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "import"
                  ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-900 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {EXPORT_LIST.map((item) => {
                const Icon = item.icon;
                const isDownloading = downloadingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all hover:border-brand-500 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {item.format}
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-extrabold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => handleDownloadExport(item)}
                        disabled={isDownloading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-all hover:bg-brand-600 active:scale-98 disabled:opacity-60"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Mengunduh File...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span>Download Excel (.xlsx)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Petunjuk Ekspor */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-500/20 dark:bg-blue-500/5">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="text-xs text-blue-900 dark:text-blue-300">
                  <p className="font-bold">Format Standar PLN Nusantara Daya (WACB DIGIKIT)</p>
                  <p className="mt-1">
                    Semua file spreadsheet yang diekspor menggunakan header dan styling standar resmi korporat, kompatibel langsung dengan Microsoft Excel, Google Sheets, dan LibreOffice Calc.
                  </p>
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
