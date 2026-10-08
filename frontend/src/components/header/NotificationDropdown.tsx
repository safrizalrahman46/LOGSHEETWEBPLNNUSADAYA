"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  MapPin,
  CloudUpload,
  CheckCheck,
} from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { apiClient } from "@/lib/api";
import { AppNotification } from "@/types";

const TYPE_META: Record<
  string,
  { icon: typeof Clock; color: string; href: string }
> = {
  logsheet: {
    icon: Clock,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-500/15 dark:text-brand-400",
    href: "/logsheet/input",
  },
  sync: {
    icon: CloudUpload,
    color:
      "text-success-600 bg-success-50 dark:bg-success-500/15 dark:text-success-400",
    href: "/sync",
  },
  approval: {
    icon: Wrench,
    color:
      "text-warning-600 bg-warning-50 dark:bg-warning-500/15 dark:text-warning-400",
    href: "/har",
  },
  error: {
    icon: AlertTriangle,
    color:
      "text-error-600 bg-error-50 dark:bg-error-500/15 dark:text-error-400",
    href: "/dashboard",
  },
  presensi: {
    icon: MapPin,
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400",
    href: "/presensi",
  },
  general: {
    icon: CheckCircle2,
    color:
      "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
    href: "/dashboard",
  },
};

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit yang lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam yang lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari yang lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem("pln_token")) return;
    try {
      const res = await apiClient.get("/notifications", {
        params: { limit: 15 },
      });
      if (res.data?.success) {
        setItems(res.data.notifications || []);
        setUnread(res.data.unread || 0);
      }
    } catch {
      // diamkan; dropdown tetap memakai data terakhir
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    timer.current = setInterval(fetchNotifications, 45000);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      if (timer.current) clearInterval(timer.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  function toggleDropdown() {
    setIsOpen((v) => !v);
    if (!isOpen) fetchNotifications();
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((v) => Math.max(0, v - 1));
    try {
      const res = await apiClient.post(`/notifications/${id}/read`);
      if (typeof res.data?.unread === "number") setUnread(res.data.unread);
    } catch {
      // abaikan
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await apiClient.post("/notifications/read-all");
    } catch {
      // abaikan
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Notifikasi"
      >
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white shadow">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="mt-3 flex w-80 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Notifikasi Kontrol
          </h4>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                {unread} Baru
              </span>
            )}
            <button
              onClick={markAllRead}
              title="Tandai semua sudah dibaca"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto py-2 dark:divide-gray-800">
          {items.length === 0 && (
            <li className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <Bell className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Belum ada notifikasi
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Aktivitas logsheet, presensi, dan HAR akan muncul di sini.
              </p>
            </li>
          )}
          {items.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.general;
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <Link
                  href={meta.href}
                  onClick={() => {
                    if (!n.is_read) markRead(n.id);
                    closeDropdown();
                  }}
                  className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                    n.is_read ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">
                      {n.description}
                    </p>
                    <span className="mt-1 block text-[10px] text-gray-400">
                      {timeAgo(n.time || n.created_at)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-gray-100 pt-2 text-center dark:border-gray-800">
          <Link
            href="/dashboard"
            onClick={closeDropdown}
            className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Lihat Semua Aktivitas
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
