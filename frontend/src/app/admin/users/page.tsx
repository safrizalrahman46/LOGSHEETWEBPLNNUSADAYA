"use client";

import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { MasterCrud, CrudColumn, CrudField } from "@/components/admin/MasterCrud";

const ROLES = [
  { value: "OPERATOR", label: "Operator" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "TEKNISI", label: "Teknisi" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPERADMIN", label: "Super Admin" },
];

const roleBadge: Record<string, string> = {
  SUPERADMIN:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  MANAGER: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  SUPERVISOR: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  TEKNISI: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  OPERATOR: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
};

const columns: CrudColumn[] = [
  {
    key: "name",
    label: "Nama Lengkap",
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          {String(row.name || "-")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          @{String(row.username || "-")}
        </p>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <span
        className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
          roleBadge[String(row.role)] || roleBadge.OPERATOR
        }`}
      >
        {String(row.role || "-")}
      </span>
    ),
  },
  { key: "nama_unit", label: "Unit Kerja" },
  { key: "email", label: "Email" },
  { key: "id", label: "ID" },
];

const fields: CrudField[] = [
  { name: "username", label: "Username", required: true, placeholder: "min. 3 karakter" },
  { name: "name", label: "Nama Lengkap", required: true, placeholder: "Nama pengguna" },
  { name: "email", label: "Email", placeholder: "nama@pln.co.id" },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: ROLES,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    hint: "Saat mengubah data, biarkan kosong jika password tidak diganti.",
    placeholder: "min. 3 karakter",
  },
  { name: "kd_region", label: "Kode Region", placeholder: "05" },
  { name: "kd_unit", label: "Kode Unit", placeholder: "0264" },
  { name: "nama_unit", label: "Nama Unit", placeholder: "ULD BATU AMPAR" },
];

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <MasterCrud
          title="Data Master Pengguna"
          subtitle="Kelola akun, role, dan unit kerja pengguna aplikasi."
          endpoint="/admin/users"
          listKey="users"
          itemKey="user"
          columns={columns}
          fields={fields}
          createLabel="Tambah Pengguna"
        />
      </AppLayout>
    </RoleGuard>
  );
}
