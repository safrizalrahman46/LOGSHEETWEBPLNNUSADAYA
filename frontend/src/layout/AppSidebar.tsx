"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/utils";
import {
  LayoutDashboard,
  Clock,
  FileSpreadsheet,
  Wrench,
  CloudUpload,
  Building2,
  LogOut,
  Zap,
  MapPin,
  BarChart3,
  FileText,
  Edit3,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { User } from "@/types";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
  badgeColor?: string;
};

export const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // invalid JSON
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pln_token");
    localStorage.removeItem("pln_user");
    router.push("/login");
  };

  const navGroups: { groupTitle: string; items: NavItem[] }[] = [
    {
      groupTitle: "OPERASIONAL",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
        {
          title: "Matriks 24 Jam",
          href: "/logsheet/matrix",
          icon: Clock,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
          badge: "48 Slot",
          badgeColor: "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400",
        },
        {
          title: "Input Logsheet",
          href: "/logsheet/input",
          icon: FileSpreadsheet,
          roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR", "OPERATOR"],
          badge: "Batch 1-6",
          badgeColor: "bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-400",
        },
      ],
    },
    {
      groupTitle: "PEMELIHARAAN & SISTEM",
      items: [
        {
          title: "Modul HAR & AMC",
          href: "/har",
          icon: Wrench,
          roles: ["SUPERADMIN", "ADMIN", "SUPERVISOR", "TEKNISI"],
          badge: "Preventive",
          badgeColor: "bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400",
        },
        {
          title: "Antrean Offline",
          href: "/sync",
          icon: CloudUpload,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
        {
          title: "Ganti Unit PLTD",
          href: "/pilih-unit",
          icon: Building2,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
      ],
    },
    {
      groupTitle: "LAYANAN & PUBLIK",
      items: [
        {
          title: "Web Publik & Landing",
          href: "/",
          icon: Globe,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
        {
          title: "Statistik Publik",
          href: "/guest",
          icon: BarChart3,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
        {
          title: "Presensi GPS",
          href: "/presensi",
          icon: MapPin,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
          badge: "250m",
          badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        },
        {
          title: "Berita & Edukasi",
          href: "/berita",
          icon: FileText,
          roles: ["SUPERADMIN", "ADMIN", "MANAGER", "SUPERVISOR", "TEKNISI", "OPERATOR"],
        },
        {
          title: "Kelola Artikel",
          href: "/admin/articles",
          icon: Edit3,
          roles: ["SUPERADMIN", "ADMIN"],
        },
      ],
    },
  ];

  const roleBadgeColors: Record<string, string> = {
    SUPERADMIN: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    ADMIN: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    MANAGER: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    SUPERVISOR: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    TEKNISI: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    OPERATOR: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
  };

  const isWide = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 select-none",
        isMobileOpen ? "translate-x-0 w-[290px]" : "-translate-x-full xl:translate-x-0",
        isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-18 items-center px-4 sm:px-5 border-b border-gray-200 dark:border-gray-800 justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 border border-gray-100 dark:border-gray-800 dark:bg-gray-800 shadow-theme-xs">
            <img src="/images/logo/LOGO-PLN.png" alt="PLN Logo" className="h-8 w-auto object-contain" />
          </div>
          {isWide && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-black tracking-wider text-gray-900 dark:text-white leading-tight">
                PLN NUSA DAYA
              </h1>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                WACB Kalimantan 3
              </p>
            </div>
          )}
        </Link>
        {isWide && (
          <button
            onClick={toggleSidebar}
            title={isExpanded ? "Perkecil Sidebar (Minimize)" : "Perbesar Sidebar"}
            className="hidden xl:flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            {isWide && (
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.groupTitle}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isAllowed =
                  !user ||
                  user.role === "SUPERADMIN" ||
                  item.roles.includes(user.role);

                if (!isAllowed) return null;

                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "menu-item group",
                        isActive ? "menu-item-active" : "menu-item-inactive",
                        !isWide && "justify-center px-0"
                      )}
                      title={!isWide ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive
                            ? "menu-item-icon-active"
                            : "menu-item-icon group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        )}
                      />
                      {isWide && (
                        <div className="flex flex-1 items-center justify-between">
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "menu-dropdown-badge",
                                item.badgeColor ||
                                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Card Widget & Logout */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
        <div
          className={cn(
            "flex items-center rounded-xl border border-gray-200 bg-white p-3 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-all",
            !isWide ? "justify-center" : "justify-between gap-3"
          )}
        >
          {isWide ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                    {user?.name || "Operator Shift"}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[9px] font-extrabold uppercase",
                      roleBadgeColors[user?.role || "OPERATOR"]
                    )}
                  >
                    {user?.role || "OPERATOR"}
                  </span>
                  <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                    {user?.nama_unit || "Kalimantan 3"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Keluar dari Sistem"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              title="Keluar dari Sistem"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
