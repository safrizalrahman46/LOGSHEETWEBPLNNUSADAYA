"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Building2, CloudUpload, Wrench, Clock, UserCheck, UserRound } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { User } from "@/types";

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("pln_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    closeDropdown();
    localStorage.removeItem("pln_token");
    localStorage.removeItem("pln_user");
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center gap-2.5 rounded-xl p-1.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          {user?.avatar ? (
            <Image
              width={40}
              height={40}
              src={user.avatar}
              alt={user.name || "User Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </span>

        <div className="hidden text-left xl:block">
          <span className="block text-xs font-bold text-gray-800 dark:text-white">
            {user?.name || "Guest"}
          </span>
          <span className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400">
            {user?.role || "GUEST"}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="mt-3 flex w-64 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
      >
        {/* User Card Header */}
        <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
          <span className="block text-sm font-bold text-gray-900 dark:text-white">
            {user?.name || "Guest"}
          </span>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {user?.role || "GUEST"}
            </span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.nama_unit || "Kalimantan 3"}
            </span>
          </div>
        </div>

        {/* Quick Menu Links */}
        <ul className="flex flex-col gap-1 border-b border-gray-100 py-2 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profil"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            >
              <UserRound className="h-4 w-4 text-gray-400" />
              <span>Profil Saya</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/pilih-unit"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            >
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>Ganti Unit PLTD</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/logsheet/matrix"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Matriks 24 Jam</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/sync"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
            >
              <CloudUpload className="h-4 w-4 text-gray-400" />
              <span>Antrean Offline</span>
            </DropdownItem>
          </li>
        </ul>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
