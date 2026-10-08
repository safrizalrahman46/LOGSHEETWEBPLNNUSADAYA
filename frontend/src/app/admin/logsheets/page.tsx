"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { MasterCrud, CrudColumn, CrudField } from "@/components/admin/MasterCrud";
import { apiClient } from "@/lib/api";
import { MasterMachine, MasterUnit } from "@/types";

const columns: CrudColumn[] = [
  { key: "unit_name", label: "Unit" },
  {
    key: "machine_name",
    label: "Mesin",
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          {String(row.machine_name || "-")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {String(row.operator_name || "-")}
        </p>
      </div>
    ),
  },
  {
    key: "machine_status",
    label: "Status Mesin",
    render: (row) => (
      <span className="uppercase">{String(row.machine_status || "-")}</span>
    ),
  },
  {
    key: "beban_mesin",
    label: "Beban (kW)",
    render: (row) => String(row.beban_mesin ?? "-"),
  },
  {
    key: "sync_status",
    label: "Sinkron",
    render: (row) => {
      const v = String(row.sync_status || "-");
      const cls =
        v === "synced"
          ? "bg-success-50 text-success-600 border-success-200 dark:bg-success-500/15 dark:text-success-400"
          : v === "failed"
            ? "bg-error-50 text-error-600 border-error-200 dark:bg-error-500/15 dark:text-error-400"
            : "bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-500/15 dark:text-warning-400";
      return (
        <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${cls}`}>
          {v}
        </span>
      );
    },
  },
  {
    key: "approval_status",
    label: "Approval",
    render: (row) => {
      const v = String(row.approval_status || "-");
      const cls =
        v === "approved"
          ? "bg-success-50 text-success-600 border-success-200 dark:bg-success-500/15 dark:text-success-400"
          : v === "rejected"
            ? "bg-error-50 text-error-600 border-error-200 dark:bg-error-500/15 dark:text-error-400"
            : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
      return (
        <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold ${cls}`}>
          {v}
        </span>
      );
    },
  },
  {
    key: "submitted_at",
    label: "Dikirim",
    render: (row) => {
      const d = new Date(String(row.submitted_at || ""));
      return Number.isNaN(d.getTime())
        ? "-"
        : d.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    },
  },
];

const baseFields: CrudField[] = [
  {
    name: "unit_id",
    label: "Unit",
    type: "select",
    required: true,
    options: [],
  },
  {
    name: "machine_id",
    label: "Mesin",
    type: "select",
    required: true,
    options: [],
  },
  { name: "tanggal", label: "Tanggal", type: "date", required: true },
  { name: "jam", label: "Jam", placeholder: "14:00", hint: "Format 24 jam, contoh 14:00" },
  { name: "operator_name", label: "Operator" },
  {
    name: "machine_status",
    label: "Status Mesin",
    type: "select",
    options: [
      { value: "operasi", label: "Operasi" },
      { value: "standby", label: "Standby" },
      { value: "gangguan-rusak", label: "Gangguan / Rusak" },
    ],
  },
  { name: "beban_mesin", label: "Beban Mesin (kW)", type: "number" },
  { name: "stand_kwh", label: "Stand Papan Energy (kWh)", type: "number" },
  { name: "stand_bbm", label: "Stand BBM (Liter)", type: "number" },
  {
    name: "sync_status",
    label: "Status Sinkron",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "pendingSync", label: "Menunggu Sinkron" },
      { value: "pendingEdit", label: "Menunggu Revisi" },
      { value: "synced", label: "Tersinkron" },
      { value: "failed", label: "Gagal" },
    ],
  },
  {
    name: "approval_status",
    label: "Status Approval",
    type: "select",
    options: [
      { value: "pendingReview", label: "Menunggu Review" },
      { value: "approved", label: "Disetujui" },
      { value: "rejected", label: "Ditolak" },
    ],
  },
  {
    name: "report_status",
    label: "Status Pelaporan",
    type: "select",
    options: [
      { value: "onTime", label: "Tepat Waktu" },
      { value: "late", label: "Terlambat" },
      { value: "missing", label: "Tidak Ada" },
      { value: "abnormal", label: "Abnormal" },
    ],
  },
  { name: "notes", label: "Catatan", type: "textarea" },
];

export default function AdminLogsheetsPage() {
  const [units, setUnits] = useState<MasterUnit[]>([]);
  const [machines, setMachines] = useState<MasterMachine[]>([]);
  const [fields, setFields] = useState<CrudField[]>(baseFields);

  useEffect(() => {
    apiClient
      .get("/admin/units")
      .then((res) => {
        if (res.data?.success) {
          const list: MasterUnit[] = res.data.units || [];
          setUnits(list);
          setFields((prev) =>
            prev.map((f) =>
              f.name === "unit_id"
                ? {
                    ...f,
                    options: list.map((u) => ({
                      value: u.id,
                      label: `${u.id} — ${u.name}`,
                    })),
                  }
                : f
            )
          );
        }
      })
      .catch(() => {});

    apiClient
      .get("/admin/machines")
      .then((res) => {
        if (res.data?.success) {
          const list: MasterMachine[] = res.data.data || [];
          setMachines(list);
          setFields((prev) =>
            prev.map((f) =>
              f.name === "machine_id"
                ? {
                    ...f,
                    options: list.map((m) => ({
                      value: m.id,
                      label: `${m.machine_name} (${m.id})`,
                    })),
                  }
                : f
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // Sinkronkan nama unit & mesin otomatis saat id-nya dipilih.
  const handleFieldChange = (
    name: string,
    value: string
  ): Record<string, string> | void => {
    if (name === "unit_id") {
      const unit = units.find((u) => u.id === value);
      if (unit) return { unit_name: unit.name };
    }
    if (name === "machine_id") {
      const m = machines.find((x) => x.id === value);
      if (m) return { machine_name: m.machine_name };
    }
    return undefined;
  };

  // Saat mengubah baris, isi tanggal/jam dari submitted_at dan bawa nama unit/mesin.
  const mapRow = (row: Record<string, unknown>): Record<string, string> => {
    const submitted = String(row.submitted_at || "");
    const d = new Date(submitted);
    const tanggal = Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    const jam = Number.isNaN(d.getTime())
      ? ""
      : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return {
      tanggal,
      jam,
      unit_name: String(row.unit_name || ""),
      machine_name: String(row.machine_name || ""),
      operator_name: String(row.operator_name || ""),
      notes: String(row.notes || ""),
    };
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <MasterCrud
          title="Data Master Logsheet"
          subtitle="Rekap baris logsheet per mesin: status sinkron, approval, dan pelaporan."
          endpoint="/admin/logsheets"
          columns={columns}
          fields={fields}
          onFieldChange={handleFieldChange}
          mapRow={mapRow}
          createLabel="Tambah Logsheet"
          tableMinWidth="min-w-[1040px]"
        />
      </AppLayout>
    </RoleGuard>
  );
}
