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

const UNIT_OPTIONS = [
  { value: "", label: "-- Pilih Unit PLTD / ULD (Wajib untuk Operator) --" },
  { value: "0264", label: "0264 - ULD BATU AMPAR" },
  { value: "0265", label: "0265 - ULD BIDUK-BIDUK" },
  { value: "0266", label: "0266 - ULD DATAH BILANG" },
  { value: "0267", label: "0267 - ULD DILANG PUTI" },
  { value: "0268", label: "0268 - ULD GEMAR BARU" },
  { value: "0269", label: "0269 - ULD JANTUR" },
  { value: "0270", label: "0270 - ULD KARANGAN DALAM" },
  { value: "0271", label: "0271 - ULD KAYAN HULU" },
  { value: "0272", label: "0272 - ULD KELAY" },
  { value: "0273", label: "0273 - ULD KELUMPANG" },
  { value: "0274", label: "0274 - ULD KRAYAN" },
  { value: "0275", label: "0275 - ULD LONG APARI" },
  { value: "0276", label: "0276 - ULD LONG LAYU" },
  { value: "0277", label: "0277 - ULD LONG PAHANGAI" },
  { value: "0278", label: "0278 - ULD LONG PESO" },
  { value: "0279", label: "0279 - ULD LONG SEGAR" },
  { value: "0280", label: "0280 - ULD LUMBIS OGONG" },
  { value: "0281", label: "0281 - ULD MARATUA" },
  { value: "0282", label: "0282 - ULD MERASA" },
  { value: "0283", label: "0283 - ULD MUARA PAHU" },
  { value: "0284", label: "0284 - ULD MUARA PANTUAN" },
  { value: "0285", label: "0285 - ULD MUARA SIRAN" },
  { value: "0286", label: "0286 - ULD DERAWAN" },
  { value: "0287", label: "0287 - ULD PA UPAN" },
  { value: "0288", label: "0288 - ULD PENYINGGAHAN" },
  { value: "0289", label: "0289 - ULD SEDULANG" },
  { value: "0290", label: "0290 - ULD SEI MENGGARIS" },
  { value: "0291", label: "0291 - ULD MUARA KEDANG" },
  { value: "0292", label: "0292 - ULD SENYIUR" },
  { value: "0293", label: "0293 - ULD TABANG" },
  { value: "0294", label: "0294 - ULD TANAH MERAH" },
  { value: "0295", label: "0295 - ULD PENGANDAN" },
  { value: "0296", label: "0296 - ULD LABANG" },
  { value: "0297", label: "0297 - ULD MUARA PANTUN" },
  { value: "0298", label: "0298 - ULD SEKATAK BUJI" },
  { value: "0299", label: "0299 - ULD SEMAYANG" },
  { value: "0300", label: "0300 - ULD TABISAQ" },
  { value: "0301", label: "0301 - ULD TANJUNG BATU" },
  { value: "0934", label: "0934 - ULD SANDARAN" },
  { value: "0935", label: "0935 - PLTD TAU LUMBIS" },
  { value: "1168", label: "1168 - PLTD SUNGAI BOH" },
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
          Username: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{String(row.username || "-")}</span>
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
  { 
    name: "username", 
    label: "Username", 
    required: true, 
    placeholder: "Contoh: bidukbiduk atau ULD BIDUK-BIDUK",
    hint: "Bisa huruf kecil/kapital, boleh dengan/tanpa spasi. Login sangat fleksibel."
  },
  { name: "name", label: "Nama Lengkap", required: true, placeholder: "Contoh: ULD BIDUK-BIDUK" },
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
    hint: "Saat mengubah data, biarkan kosong jika password tidak diganti. Minimal 3 karakter.",
    placeholder: "min. 3 karakter",
  },
  {
    name: "kd_unit",
    label: "Unit PLTD / ULD (Wajib Sinkron WACB)",
    type: "select",
    options: UNIT_OPTIONS,
    hint: "Pilih unit PLTD resmi agar otomatis sinkron ke WACB dan mesinnya terdaftar.",
  },
  { name: "nama_unit", label: "Nama Unit (Otomatis)", placeholder: "Otomatis terisi dari pilihan Unit PLTD" },
  { name: "kd_region", label: "Kode Region (Default: 05)", placeholder: "05" },
];

export default function AdminUsersPage() {
  const handleFieldChange = (name: string, value: string, current: Record<string, string>) => {
    if (name === "kd_unit") {
      const match = UNIT_OPTIONS.find((u) => u.value === value);
      if (match && match.value) {
        const cleanName = match.label.replace(/^[0-9]+\s*-\s*/, "");
        return {
          nama_unit: cleanName,
          name: !current.name || current.name.startsWith("ULD ") || current.name.startsWith("PLTD ") ? cleanName : current.name,
        };
      }
    }
    return undefined;
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <MasterCrud
          title="Data Master Pengguna"
          subtitle="Kelola akun, role, dan unit kerja pengguna aplikasi (Otomatis Sinkron WACB & DIGIKIT)."
          endpoint="/admin/users"
          listKey="users"
          itemKey="user"
          columns={columns}
          fields={fields}
          onFieldChange={handleFieldChange}
          createLabel="Tambah Pengguna"
        />
      </AppLayout>
    </RoleGuard>
  );
}
