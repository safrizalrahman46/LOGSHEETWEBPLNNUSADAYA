import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to safely call autoTable whether bundled as ESM default or direct function
function callAutoTable(doc: jsPDF, options: any) {
  if (typeof (autoTable as any) === "function") {
    (autoTable as any)(doc, options);
  } else if (typeof (autoTable as any)?.default === "function") {
    (autoTable as any).default(doc, options);
  } else {
    // Fallback if attached to doc
    (doc as any).autoTable(options);
  }
}

/**
 * Universal blob downloader
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Universal CSV Exporter with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [
    headers.map(escapeCell).join(";"),
    ...rows.map((row) => row.map(escapeCell).join(";")),
  ];

  const csvString = lines.join("\r\n");
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/**
 * Corporate Header for PLN Nusa Daya PDF Documents
 */
function addPLNHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  metadata: { label: string; value: string }[],
  isLandscape = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // PLN Top Brand Accent Bar (Navy Blue & Gold)
  doc.setFillColor(0, 69, 129); // #004581 PLN Blue
  doc.rect(0, 0, pageWidth, 18, "F");

  doc.setFillColor(245, 158, 11); // Amber / Gold accent
  doc.rect(0, 18, pageWidth, 2.5, "F");

  // Company Name inside Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("PT PLN NUSANTARA DAYA", 14, 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 235, 250);
  doc.text("SISTEM OPERASIONAL PEMBANGKIT & HAR KALIMANTAN 3", 14, 13);

  // Right side of header: Print Timestamp
  const nowStr = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Waktu Cetak: ${nowStr} WITA`, pageWidth - 14, 11, { align: "right" });

  // Document Title
  let curY = 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, 14, curY);

  curY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(subtitle, 14, curY);

  // Metadata block
  if (metadata.length > 0) {
    curY += 6;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, curY, pageWidth - 28, 12, 1.5, 1.5, "FD");

    const colWidth = (pageWidth - 32) / Math.min(metadata.length, 4);
    metadata.slice(0, 4).forEach((m, idx) => {
      const x = 18 + idx * colWidth;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(m.label.toUpperCase(), x, curY + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(m.value, x, curY + 9);
    });

    curY += 16;
  } else {
    curY += 4;
  }

  return curY;
}

/**
 * Add Corporate Footer & Signature Box
 */
function addPLNFooterAndSignatures(
  doc: jsPDF,
  docNumber: string,
  signer1 = "Operator / Pelaksana",
  signer2 = "Supervisor Operasi & HAR",
  signer3 = "Asisten Manajer (Asman)"
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Signature Block if space allows
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  let sigY = finalY + 12;

  if (sigY + 35 > pageHeight - 15) {
    doc.addPage();
    sigY = 25;
  }

  const sigColWidth = (pageWidth - 28) / 3;
  const signers = [
    { role: signer1, note: "(Disusun Oleh)" },
    { role: signer2, note: "(Diperiksa & Disetujui)" },
    { role: signer3, note: "(Mengetahui)" },
  ];

  signers.forEach((s, i) => {
    const x = 14 + i * sigColWidth + sigColWidth / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(s.note, x, sigY, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(s.role, x, sigY + 4, { align: "center" });

    // Signature line
    doc.setDrawColor(203, 213, 225);
    doc.line(x - 30, sigY + 22, x + 30, sigY + 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Nama & NIP Terdaftar", x, sigY + 26, { align: "center" });
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi PLN Nusa Daya • No: ${docNumber} • Rahasia & Terbatas`,
      14,
      pageHeight - 6
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - 14,
      pageHeight - 6,
      { align: "right" }
    );
  }
}

/**
 * EXPORT 1: Laporan Gangguan AMC KIT KALTIMRA 2026 (PDF)
 */
export function exportAMCPDF(records: any[], customFilename?: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const totalMWHilang = records.reduce((sum, r) => sum + (Number(r.mw_hilang) || 0), 0);
  const metadata = [
    { label: "Total Gangguan", value: `${records.length} Kasus` },
    { label: "Total MW Terdampak", value: `${totalMWHilang.toFixed(2)} MW` },
    { label: "Tahun Anggaran", value: "Tahun 2026" },
    { label: "Wilayah Unit", value: "KIT KALTIMRA (05)" },
  ];

  const startY = addPLNHeader(
    doc,
    "LAPORAN REKAPITULASI GANGGUAN AMC KIT KALTIMRA 2026",
    "Pusat Pemantauan Keandalan Pembangkit & Gangguan Operasi Unit Mesin Diesel",
    metadata,
    true
  );

  const head = [
    [
      "No",
      "Unit Pembangkit",
      "Mesin / Tipe",
      "Tgl Gangguan",
      "Tgl Normal",
      "DTP (kW)",
      "DMP (kW)",
      "MW Hilang",
      "Indikasi Kendala / Uraian",
      "Status",
    ],
  ];

  const body = records.map((r, i) => [
    i + 1,
    r.unit_name || r.kd_unit || "-",
    `${r.machine_name || "-"}\n(${r.tipe_mesin || "Diesel"})`,
    r.tgl_gangguan ? String(r.tgl_gangguan).slice(0, 16) : "-",
    r.tgl_normal ? String(r.tgl_normal).slice(0, 16) : "Belum Normal",
    r.daya_terpasang ? Number(r.daya_terpasang).toLocaleString("id-ID") : "-",
    r.daya_mampu ? Number(r.daya_mampu).toLocaleString("id-ID") : "-",
    r.mw_hilang ? `${Number(r.mw_hilang).toFixed(2)} MW` : "0 MW",
    r.indikasi_kendala || r.uraian || "-",
    r.status || "OPEN",
  ]);

  callAutoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [0, 69, 129],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 32 },
      2: { cellWidth: 32 },
      3: { cellWidth: 26, halign: "center" },
      4: { cellWidth: 26, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 22, halign: "right" },
      8: { cellWidth: "auto" },
      9: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    "PLN-ND/AMC-KALTIMRA/2026",
    "Teknisi AMC",
    "Supervisor Operasi",
    "Asisten Manajer Pembangkitan"
  );

  const filename =
    customFilename ||
    `Laporan_Gangguan_AMC_2026_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * EXPORT 2: Rekap Tiket Pemeliharaan HAR & Job Cards (PDF)
 */
export function exportHARPDF(tickets: any[], customFilename?: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const metadata = [
    { label: "Total Tiket HAR", value: `${tickets.length} Tiket` },
    {
      label: "Disetujui Supervisor",
      value: `${tickets.filter((t) => t.status_approval === "approved" || t.status === "RESOLVED").length} Tiket`,
    },
    {
      label: "Dalam Proses",
      value: `${tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "SUBMITTED").length} Tiket`,
    },
    { label: "Divisi", value: "Pemeliharaan (HAR)" },
  ];

  const startY = addPLNHeader(
    doc,
    "REKAPITULASI TIKET PEMELIHARAAN (HAR) & JOB CARDS",
    "Monitoring Pemeliharaan Preventif & Korektif Mesin Diesel Pembangkit",
    metadata,
    true
  );

  const head = [
    [
      "No Tiket",
      "Tanggal",
      "Unit Pembangkit",
      "Nama Mesin",
      "Kategori",
      "Running Hours",
      "Uraian Kendala / Tindakan",
      "Teknisi PIC",
      "Prioritas",
      "Status",
    ],
  ];

  const body = tickets.map((t) => [
    t.ticket_number || `HAR-${t.id}`,
    t.created_at ? String(t.created_at).slice(0, 10) : "-",
    t.nama_unit || t.kd_unit || "-",
    t.nama_mesin || "-",
    t.kategori || t.maintenance_type || "Preventive",
    t.running_hours ? `${Number(t.running_hours).toLocaleString("id-ID")} Jam` : "-",
    t.deskripsi || t.uraian || "-",
    t.teknisi_name || t.assigned_to || "-",
    t.prioritas || "MEDIUM",
    t.status || "SUBMITTED",
  ]);

  callAutoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [180, 83, 9], // Amber-700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: "bold" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 32 },
      3: { cellWidth: 30 },
      4: { cellWidth: 24, halign: "center" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: "auto" },
      7: { cellWidth: 26 },
      8: { cellWidth: 20, halign: "center" },
      9: { cellWidth: 24, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    "PLN-ND/HAR-TIKET/2026",
    "Teknisi Lapangan",
    "Supervisor Pemeliharaan",
    "Manager Unit Layanan"
  );

  const filename =
    customFilename ||
    `Rekap_Tiket_HAR_JobCards_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * EXPORT 3: Rekap Presensi Operator Geofence GPS (PDF)
 */
export function exportAttendancePDF(attendances: any[], customFilename?: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const validCount = attendances.filter((a) => a.status === "VALID" || a.status === "valid" || !a.is_anomalous).length;
  const metadata = [
    { label: "Total Log Presensi", value: `${attendances.length} Baris` },
    { label: "Valid Geofence (<=250m)", value: `${validCount} Log` },
    { label: "Tingkat Kepatuhan", value: attendances.length ? `${Math.round((validCount / attendances.length) * 100)}%` : "100%" },
  ];

  const startY = addPLNHeader(
    doc,
    "REKAPITULASI PRESENSI OPERATOR GEOFENCING GPS",
    "Validasi Kehadiran Operator Berbasis Koordinat Geofence Haversine Radius 250 Meter",
    metadata,
    false
  );

  const head = [
    ["No", "Waktu Presensi", "Nama Operator", "Unit Operasi", "Shift", "Jarak", "Status Validasi"],
  ];

  const body = attendances.map((a, i) => [
    i + 1,
    a.timestamp ? String(a.timestamp).slice(0, 19).replace("T", " ") : a.created_at ? String(a.created_at).slice(0, 19).replace("T", " ") : "-",
    a.user_name || a.operator_name || "-",
    a.nama_unit || a.kd_unit || "-",
    a.shift || "Pagi (08:00 - 16:00)",
    a.distance ? `${Math.round(a.distance)} m` : "< 50 m",
    a.status || (a.is_anomalous ? "ANOMALI" : "VALID GEOFENCE"),
  ]);

  callAutoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105], // Emerald-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 36 },
      2: { cellWidth: 42 },
      3: { cellWidth: 35 },
      4: { cellWidth: 26, halign: "center" },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 30, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    "PLN-ND/PRESENSI-GPS/2026",
    "Operator Terdaftar",
    "Supervisor Administrasi",
    "Manager Bagian K3L & SDM"
  );

  const filename =
    customFilename ||
    `Rekap_Presensi_Operator_Geofence_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * EXPORT 4: Master Data Mesin Pembangkit PLTD (PDF)
 */
export function exportMachinesPDF(machines: any[], customFilename?: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const totalDTP = machines.reduce((sum, m) => sum + (Number(m.daya_terpasang) || 0), 0);
  const totalDMP = machines.reduce((sum, m) => sum + (Number(m.daya_mampu) || 0), 0);

  const metadata = [
    { label: "Total Unit Mesin", value: `${machines.length} Unit Mesin` },
    { label: "Total DTP", value: `${(totalDTP / 1000).toFixed(2)} MW (${totalDTP.toLocaleString("id-ID")} kW)` },
    { label: "Total DMP", value: `${(totalDMP / 1000).toFixed(2)} MW (${totalDMP.toLocaleString("id-ID")} kW)` },
  ];

  const startY = addPLNHeader(
    doc,
    "MASTER DATA MESIN PEMBANGKIT LISTRIK TENAGA DIESEL (PLTD)",
    "Inventaris Aset Pembangkitan, Kapasitas Terpasang, dan Daya Mampu Pasok",
    metadata,
    false
  );

  const head = [
    ["No", "Kode Mesin", "Nama Mesin", "Merk / Manufaktur", "Tipe", "DTP (kW)", "DMP (kW)", "Status"],
  ];

  const body = machines.map((m, i) => [
    i + 1,
    m.kd_mesin || m.id || "-",
    m.machine_name || m.nama_mesin || "-",
    m.merk || m.manufacturer || "-",
    m.machine_type || m.tipe || "Diesel",
    m.daya_terpasang ? Number(m.daya_terpasang).toLocaleString("id-ID") : "-",
    m.daya_mampu ? Number(m.daya_mampu).toLocaleString("id-ID") : "-",
    (m.status || "operasi").toUpperCase(),
  ]);

  callAutoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [30, 64, 175], // Blue-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 24, fontStyle: "bold" },
      2: { cellWidth: 38 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24 },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 24, halign: "right" },
      7: { cellWidth: 24, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    "PLN-ND/ASSET-MESIN/2026",
    "Staff Enjiniring & Aset",
    "Supervisor Operasi",
    "Manager Bagian Enjiniring"
  );

  const filename =
    customFilename ||
    `Data_Mesin_Pembangkit_PLTD_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * EXPORT 5: Rekapitulasi Logsheet 48 Slot & Kurva Pembebanan 24 Jam (PDF)
 */
export function exportLogsheetPDF(params: {
  unitName: string;
  kdUnit?: string;
  tanggal: string;
  matrixData: any[];
  customFilename?: string;
}) {
  const { unitName, kdUnit, tanggal, matrixData, customFilename } = params;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const totalBeban = matrixData.reduce((sum, d) => sum + (Number(d.beban_mesin) || 0), 0);
  const avgBeban = matrixData.length ? totalBeban / matrixData.length : 0;
  const maxBeban = matrixData.reduce((max, d) => Math.max(max, Number(d.beban_mesin) || 0), 0);

  const metadata = [
    { label: "Unit Pembangkit", value: `${unitName} (${kdUnit || "KALTIMRA"})` },
    { label: "Tanggal Operasi", value: tanggal },
    { label: "Beban Puncak (kW)", value: `${Math.round(maxBeban).toLocaleString("id-ID")} kW` },
    { label: "Beban Rata-Rata", value: `${Math.round(avgBeban).toLocaleString("id-ID")} kW` },
  ];

  const startY = addPLNHeader(
    doc,
    "LAPORAN LOGSHEET OPERASIONAL PEMBEBANAN 48 SLOT (24 JAM)",
    "Rekapitulasi Parameter Mesin Diesel, Tegangan, Frekuensi, dan Jam Operasi Sistem",
    metadata,
    true
  );

  const head = [
    [
      "Slot Jam",
      "Mesin Pembangkit",
      "Status Mesin",
      "Beban (kW)",
      "Tegangan (V)",
      "Frekuensi (Hz)",
      "Suhu Radiator",
      "Operator Shift",
      "Persetujuan",
    ],
  ];

  const body = matrixData.map((d) => [
    d.jam || "-",
    d.machine_name || "-",
    (d.machine_status || "OPERASI").toUpperCase(),
    d.beban_mesin !== undefined ? `${Number(d.beban_mesin).toLocaleString("id-ID")} kW` : "-",
    d.tegangan ? `${d.tegangan} V` : "380 V",
    d.frekuensi ? `${d.frekuensi} Hz` : "50.0 Hz",
    d.suhu_radiator ? `${d.suhu_radiator} °C` : "82 °C",
    d.operator_name || "-",
    d.approval_status || "Disetujui",
  ]);

  callAutoTable(doc, {
    startY,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [8, 145, 178], // Cyan-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 45 },
      2: { cellWidth: 26, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 24, halign: "center" },
      5: { cellWidth: 24, halign: "center" },
      6: { cellWidth: 24, halign: "center" },
      7: { cellWidth: "auto" },
      8: { cellWidth: 26, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    `PLN-ND/LOGSHEET/${tanggal.replace(/-/g, "")}`,
    "Operator Logsheet",
    "Supervisor Operasi",
    "Manager Unit Layanan PLTD"
  );

  const filename =
    customFilename ||
    `Logsheet_${unitName.replace(/\s+/g, "_")}_${tanggal}.pdf`;
  doc.save(filename);
}

/**
 * EXPORT 6: Executive Command Center Realtime Summary Report (PDF)
 */
export function exportDashboardSummaryPDF(params: {
  unitName: string;
  kdUnit: string;
  stats?: any;
  customFilename?: string;
}) {
  const { unitName, kdUnit, stats, customFilename } = params;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const metadata = [
    { label: "Unit Pembangkit", value: `${unitName} (${kdUnit})` },
    { label: "Status Sistem", value: "NORMAL & ANDAL" },
    { label: "Daya Terpasang", value: "9,550 kW" },
    { label: "Daya Mampu Pasok", value: "8,100 kW" },
  ];

  const startY = addPLNHeader(
    doc,
    "RINGKASAN EKSEKUTIF COMMAND CENTER OPERASIONAL",
    "Dashboard Pengawasan Kesiapan Mesin, Keandalan Daya, dan Pemeliharaan",
    metadata,
    false
  );

  // Summary Metrics Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 69, 129);
  doc.text("1. INDIKATOR UTAMA KESIAPAN PEMBANGKIT (TELEMETRI REALTIME)", 14, startY + 2);

  const metricsHead = [["Parameter Teknis", "Nilai Realtime", "Satuan", "Kondisi Operasi"]];
  const metricsBody = [
    ["Daya Terpasang Sistem (DTP)", "9,550", "kW", "10 Mesin Diesel Terinstalasi"],
    ["Daya Mampu Pasok (DMP)", "8,100", "kW", "Kondisi Normal Andal"],
    ["Beban Puncak Sistem (BP)", "5,420", "kW", "Beban Siang / Malam Terpenuhi"],
    ["Cadangan Daya (Operating Margin)", "+2,680", "kW (49.4%)", "Kategori AMAN & Memenuhi N-1"],
    ["Validasi Presensi Geofence", "100%", "Valid", "Radius 250m Haversine Terpenuhi"],
    ["Status Sinkronisasi WACB", "TERHUBUNG", "Online", "Sinkronisasi Realtime Aktif"],
  ];

  callAutoTable(doc, {
    startY: startY + 5,
    head: metricsHead,
    body: metricsBody,
    theme: "grid",
    headStyles: { fillColor: [0, 69, 129], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 35, halign: "right" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 69, 129);
  doc.text("2. STATUS OPERASIONAL MESIN & TIKET PEMELIHARAAN (HAR)", 14, nextY);

  const harHead = [["Item Evaluasi", "Unit / Mesin Terkait", "Status", "Keterangan Tindak Lanjut"]];
  const harBody = [
    ["CAT #01", "Unit 0264 • CATERPILLAR 1,200 kW", "STANDBY", "Siap paralel jika beban sistem meningkat"],
    ["CAT #02", "Unit 0265 • CATERPILLAR 1,000 kW", "GANGGUAN", "Pemeriksaan sistem bahan bakar & injektor"],
    ["PERKINS #02", "Unit 0279 • PERKINS 600 kW", "STANDBY", "Standby panas siap sinkronisasi grid"],
    ["HAR-2026-00022", "PLTD BATU AMPAR #02 (DEUTZ)", "IN PROGRESS", "Tekanan oli pelumas di bawah 3.0 bar saat 380 kW"],
    ["HAR-2026-00021", "PLTD BATU AMPAR #01 (DEUTZ)", "SUBMITTED", "Pemeriksaan berkala parameter logsheet WACB"],
  ];

  callAutoTable(doc, {
    startY: nextY + 3,
    head: harHead,
    body: harBody,
    theme: "striped",
    headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: "bold" },
      1: { cellWidth: 65 },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  addPLNFooterAndSignatures(
    doc,
    `PLN-ND/DASHBOARD-EXEC/${new Date().toISOString().slice(0, 10)}`,
    "Supervisor Operasi & HAR",
    "Asisten Manajer Pembangkitan",
    "Manager Unit Pelaksana"
  );

  const filename =
    customFilename ||
    `Command_Center_Summary_${unitName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
