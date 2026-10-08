"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { MasterCrud, CrudColumn, CrudField } from "@/components/admin/MasterCrud";
import { apiClient } from "@/lib/api";
import { MasterUnit } from "@/types";

const statusBadge: Record<string, string> = {
  operasi:
    "bg-success-50 text-success-600 border-success-200 dark:bg-success-500/15 dark:text-success-400 dark:border-success-500/30",
  standby:
    "bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-500/15 dark:text-warning-400 dark:border-warning-500/30",
  "gangguan-rusak":
    "bg-error-50 text-error-600 border-error-200 dark:bg-error-500/15 dark:text-error-400 dark:border-error-500/30",
};

const columns: CrudColumn[] = [
  {
    key: "machine_name",
    label: "Mesin",
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          {String(row.machine_name || "-")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {String(row.brand || "")} {String(row.machine_type || "")} • SN{" "}
          {String(row.serial_number || "-")}
        </p>
      </div>
    ),
  },
  { key: "unit_id", label: "Unit" },
  {
    key: "capacity",
    label: "Kapasitas",
    render: (row) => String(row.capacity || "-"),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
          statusBadge[String(row.status)] || statusBadge.operasi
        }`}
      >
        {String(row.status || "-")}
      </span>
    ),
  },
  { key: "up3", label: "UP3" },
  { key: "id", label: "ID" },
];

const baseFields: CrudField[] = [
  { name: "machine_name", label: "Nama Mesin", required: true, placeholder: "PLTD TARAKAN #01 (DEUTZ)" },
  { name: "unit_id", label: "Unit", type: "select", required: true, options: [] },
  {
    name: "status",
    label: "Status Operasi",
    type: "select",
    required: true,
    options: [
      { value: "operasi", label: "Operasi" },
      { value: "standby", label: "Standby" },
      { value: "gangguan-rusak", label: "Gangguan / Rusak" },
    ],
  },
  { name: "brand", label: "Merek" },
  { name: "machine_type", label: "Tipe Mesin" },
  { name: "serial_number", label: "Serial Number" },
  { name: "generator_code", label: "Kode Generator" },
  { name: "capacity", label: "Kapasitas", placeholder: "2x3,5 MW" },
  { name: "available_capacity", label: "Kapasitas Tersedia" },
  { name: "dispatch_capacity", label: "Kapasitas Dispatch" },
  { name: "up3", label: "UP3" },
  { name: "condition_label", label: "Kondisi", placeholder: "Baik / Perlu Perbaikan" },
];

export default function AdminMachinesPage() {
  const [units, setUnits] = useState<MasterUnit[]>([]);
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
                    options: list.map((u) => ({ value: u.id, label: `${u.id} — ${u.name}` })),
                  }
                : f
            )
          );
        }
      })
      .catch(() => {
        // opsi unit kosong; form tetap dapat dikirim dengan unit_id manual
      });
  }, []);

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <MasterCrud
          title="Data Master Mesin"
          subtitle={`Kelola mesin pembangkit (${units.length} unit terdaftar), status operasi, dan kapasitas.`}
          endpoint="/admin/machines"
          columns={columns}
          fields={fields}
          createLabel="Tambah Mesin"
          tableMinWidth="min-w-[960px]"
        />
      </AppLayout>
    </RoleGuard>
  );
}
