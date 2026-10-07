"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, AlertTriangle, Clock, Wrench } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const notifications = [
    {
      id: 1,
      title: "Jadwal Logsheet Siap Diinput",
      desc: "Slot jam 19:30 WITA belum diisi untuk unit ULD BATU AMPAR.",
      time: "5 menit yang lalu",
      icon: Clock,
      color: "text-brand-500 bg-brand-50 dark:bg-brand-500/15",
      href: "/logsheet/input",
    },
    {
      id: 2,
      title: "Tiket HAR Disetujui",
      desc: "Supervisor menyetujui pemeliharaan Mesin #01 (Injektor).",
      time: "25 menit yang lalu",
      icon: Wrench,
      color: "text-success-500 bg-success-50 dark:bg-success-500/15",
      href: "/har",
    },
    {
      id: 3,
      title: "Sinkronisasi Offline Selesai",
      desc: "3 draft logsheet berhasil dikirimkan ke server WACB DIGIKIT.",
      time: "1 jam yang lalu",
      icon: CheckCircle2,
      color: "text-success-500 bg-success-50 dark:bg-success-500/15",
      href: "/sync",
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
    setNotifying(false);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Notifikasi"
      >
        {notifying && (
          <span className="absolute right-1 top-1 z-10 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-warning-500" />
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
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifikasi Kontrol</h4>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
            {notifications.length} Baru
          </span>
        </div>

        <ul className="divide-y divide-gray-100 py-2 dark:divide-gray-800">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={closeDropdown}
                  className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{n.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
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
