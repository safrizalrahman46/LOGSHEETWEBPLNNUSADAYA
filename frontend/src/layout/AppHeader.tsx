"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useNetwork } from "@/hooks/useNetwork";
import {
  Menu,
  X,
  Building2,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { User } from "@/types";

export const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isOnline, isSyncing, pendingCount, syncPendingDrafts } = useNetwork();
  const [activeUnit, setActiveUnit] = useState<{ kd_unit: string; nama_unit: string }>({
    kd_unit: "0264",
    nama_unit: "ULD BATU AMPAR",
  });
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const savedUnit = localStorage.getItem("pln_selected_unit");
    if (savedUnit) {
      try {
        setActiveUnit(JSON.parse(savedUnit));
      } catch {
        // default
      }
    }

    const savedUser = localStorage.getItem("pln_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // default
      }
    }

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WITA"
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md transition-colors sm:px-6 dark:border-gray-800 dark:bg-gray-900/95 select-none">
      <div className="flex w-full items-center justify-between gap-3">
        {/* Left Section: Sidebar Toggle & Active Unit Chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Unit Switcher Button */}
          <Link
            href="/pilih-unit"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs font-semibold text-gray-800 transition-all hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
          >
            <Building2 className="h-4 w-4 text-brand-500" />
            <span className="hidden sm:inline font-bold">{activeUnit.nama_unit}</span>
            <span className="sm:hidden font-bold">{activeUnit.nama_unit.slice(0, 12)}...</span>
            <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {activeUnit.kd_unit}
            </span>
          </Link>
        </div>

        {/* Right Section: Time, Theme Toggle, Network Status, Offline Drafts */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Clock Display */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span>{currentTime}</span>
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <ThemeToggleButton />

          {/* Network Status Badge */}
          {isOnline ? (
            <div className="flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-2.5 py-1 text-[11px] font-bold text-success-700 dark:border-success-800/50 dark:bg-success-950/40 dark:text-success-400">
              <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
              <Wifi className="h-3.5 w-3.5 hidden sm:inline" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-error-200 bg-error-50 px-2.5 py-1 text-[11px] font-bold text-error-700 dark:border-error-800/50 dark:bg-error-950/40 dark:text-error-400">
              <span className="h-2 w-2 rounded-full bg-error-500" />
              <WifiOff className="h-3.5 w-3.5 hidden sm:inline" />
              <span>Offline</span>
            </div>
          )}

          {/* Pending Drafts Sync Button */}
          {pendingCount > 0 && (
            <button
              onClick={syncPendingDrafts}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 rounded-full border border-warning-300 bg-warning-50 px-3 py-1 text-[11px] font-bold text-warning-800 transition-all hover:bg-warning-100 dark:border-warning-700/60 dark:bg-warning-950/50 dark:text-warning-300"
              title="Klik untuk sinkronisasi antrean ke WACB"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-warning-600 dark:text-warning-400 ${
                  isSyncing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">{pendingCount} Pending</span>
              <span className="sm:hidden">{pendingCount}</span>
            </button>
          )}

          {/* Notification Menu Area */}
          <NotificationDropdown />

          {/* User Area */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
