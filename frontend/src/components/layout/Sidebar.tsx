"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  FileSpreadsheet,
  Wrench,
  CloudUpload,
  Building2,
  LogOut,
  MapPin,
  FileText,
  BarChart3,
  Globe,
} from "lucide-react";
import { User } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // invalid
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pln_token");
    localStorage.removeItem("pln_user");
    router.push("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "Matriks 24 Jam",
      href: "/logsheet/matrix",
      icon: Clock,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "Input Logsheet",
      href: "/logsheet/input",
      icon: FileSpreadsheet,
      roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR", "OPERATOR"],
    },
    {
      label: "Presensi GPS",
      href: "/presensi",
      icon: MapPin,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "Modul HAR & Gangguan",
      href: "/har",
      icon: Wrench,
      roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR", "TEKNISI"],
    },
    {
      label: "Antrean Offline",
      href: "/sync",
      icon: CloudUpload,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "CMS Berita",
      href: "/admin/articles",
      icon: FileText,
      roles: ["SUPERADMIN", "ADMIN"],
    },
    {
      label: "Ganti Unit",
      href: "/pilih-unit",
      icon: Building2,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "Statistik Tamu (Guest)",
      href: "/guest",
      icon: BarChart3,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
    {
      label: "Landing Page Publik",
      href: "/",
      icon: Globe,
      roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
    },
  ];

  const roleBadgeColors: Record<string, string> = {
    SUPERADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    ADMIN: "bg-blue-100 text-blue-800 border-blue-200",
    MANAGER: "bg-amber-100 text-amber-800 border-amber-200",
    SUPERVISOR: "bg-indigo-100 text-indigo-800 border-indigo-200",
    TEKNISI: "bg-emerald-100 text-emerald-800 border-emerald-200",
    OPERATOR: "bg-sky-100 text-sky-800 border-sky-200",
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-pln-gold flex items-center justify-center font-black text-pln-primary text-sm shadow-md shadow-pln-gold/20">
          ⚡
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white">PLN NUSA DAYA</h1>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            WACB Control Room
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAllowed =
            !user ||
            user.role === "SUPERADMIN" ||
            item.roles.includes(user.role);

          if (!isAllowed) return null;

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-pln-primary text-white shadow-md shadow-pln-primary/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-pln-gold" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Role Card Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between shadow-2xs">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || "Operator Shift"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                  roleBadgeColors[user?.role || "OPERATOR"]
                }`}
              >
                {user?.role || "OPERATOR"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.nama_unit || "Kalimantan 3"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
