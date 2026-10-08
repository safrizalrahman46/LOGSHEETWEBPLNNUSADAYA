"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users as UsersIcon, Check } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";
import { RoleRow } from "@/types";

const MENU_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  matrix: "Matriks 24 Jam",
  logsheet_input: "Input Logsheet",
  har: "Modul HAR & AMC",
  sync: "Antrean Offline",
  unit: "Ganti Unit PLTD",
  public: "Web Publik & Landing",
  stats: "Statistik Publik",
  presensi: "Presensi GPS",
  berita: "Berita & Edukasi",
  articles: "Kelola Artikel",
  master_user: "Data Pengguna",
  master_role: "Role & Hak Akses",
  master_mesin: "Master Mesin",
  master_logsheet: "Master Logsheet",
  master_matrix: "Matriks Master",
  profil: "Profil Saya",
};

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN:
    "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/30",
  ADMIN: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30",
  MANAGER: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30",
  SUPERVISOR:
    "border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30",
  TEKNISI:
    "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30",
  OPERATOR: "border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-950/30",
};

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/admin/roles")
      .then((res) => {
        if (res.data?.success) {
          setRoles(res.data.roles || []);
          setError(null);
        } else {
          setError(res.data?.message || "Gagal memuat role");
        }
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Gagal memuat data role dari server"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = roles.reduce((sum, r) => sum + Number(r.users_count || 0), 0);

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                Data Master Role & Hak Akses
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ringkasan role sistem, jumlah pengguna, dan menu yang boleh diakses.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <UsersIcon className="h-4 w-4 text-brand-500" />
              {totalUsers} Pengguna Terdaftar
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
              Memuat data role...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm font-semibold text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {roles.map((r) => (
                <div
                  key={r.name}
                  className={`rounded-2xl border bg-white p-5 shadow-theme-xs dark:bg-gray-900 ${
                    ROLE_STYLES[r.name] || "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-theme-xs ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                        <ShieldCheck className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
                          {r.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.users_count} pengguna
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                      {r.permissions.length} menu
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {r.description}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Hak Akses
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.permissions.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
                        >
                          <Check className="h-3 w-3 text-success-500" />
                          {MENU_LABELS[p] || p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
