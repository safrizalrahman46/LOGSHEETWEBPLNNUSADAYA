"use client";

import { useEffect, useState, ReactNode } from "react";
import { Role } from "@/types";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    if (!userStr) {
      setHasPermission(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role === "SUPERADMIN" || allowedRoles.includes(user.role)) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    } catch {
      setHasPermission(false);
    }
  }, [allowedRoles]);

  if (hasPermission === null) return null;

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800">
        <div className="inline-flex p-3 bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 rounded-full mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Akses Dibatasi</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Peran akun Anda tidak memiliki hak akses untuk membuka modul ini.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
