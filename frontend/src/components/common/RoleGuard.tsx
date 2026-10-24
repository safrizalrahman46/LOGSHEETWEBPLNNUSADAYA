"use client";

import { useEffect, useState, ReactNode } from "react";
import { Role } from "@/types";
import { AuthRequiredState } from "./AuthRequiredState";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

export function RoleGuard({ allowedRoles, children, fallback, moduleName }: RoleGuardProps) {
  const [authStatus, setAuthStatus] = useState<"checking" | "not_logged_in" | "forbidden" | "allowed">("checking");
  const [currentRole, setCurrentRole] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    const token = localStorage.getItem("pln_token");

    if (!userStr || !token) {
      setAuthStatus("not_logged_in");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentRole(user.role || "GUEST");

      if (user.role === "SUPERADMIN" || allowedRoles.includes(user.role)) {
        setAuthStatus("allowed");
      } else {
        setAuthStatus("forbidden");
      }
    } catch {
      setAuthStatus("not_logged_in");
    }
  }, [allowedRoles]);

  if (authStatus === "checking") {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Kasus 1: Belum login / Guest -> Tampilkan halaman 404/401 "Mohon Login Terlebih Dahulu"
  if (authStatus === "not_logged_in") {
    if (fallback) return <>{fallback}</>;
    return (
      <AuthRequiredState
        moduleName={moduleName}
        title="Mohon Login Terlebih Dahulu"
        description="Fitur ini memerlukan autentikasi resmi. Silakan masuk menggunakan akun personil PLN Nusa Daya untuk membuka fitur ini."
      />
    );
  }

  // Kasus 2: Sudah login tapi perannya tidak memenuhi hak akses
  if (authStatus === "forbidden") {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="py-12 px-6 max-w-lg mx-auto text-center bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 my-8">
        <div className="inline-flex p-3.5 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 rounded-2xl mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hak Akses Tidak Memadai</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Akun Anda terdaftar sebagai <span className="font-bold text-gray-900 dark:text-gray-200 uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{currentRole}</span>, namun modul ini hanya dibuka untuk peran: <span className="font-semibold text-brand-600 dark:text-brand-400">{allowedRoles.join(", ")}</span>.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/guest"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Dasbor Publik</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
