"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowRight, ShieldCheck, Zap, ArrowLeft, Info, BarChart3, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Role } from "@/types";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("OPERATOR");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiClient.post("/auth/login", {
        username,
        password,
        role: selectedRole,
      });

      if (res.data?.success && res.data.token) {
        localStorage.setItem("pln_token", res.data.token);
        localStorage.setItem("pln_user", JSON.stringify(res.data.user));
        if (res.data.user.kd_unit) {
          localStorage.setItem(
            "pln_selected_unit",
            JSON.stringify({
              kd_unit: res.data.user.kd_unit,
              nama_unit: res.data.user.nama_unit || "ULD BATU AMPAR",
            })
          );
        }
        router.push("/dashboard");
      } else {
        setErrorMsg(res.data?.message || "Login gagal");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          "Gagal terhubung ke server backend (Pastikan backend Go aktif di port 8080)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gray-50 py-12 transition-colors duration-200 dark:bg-gray-950 sm:px-6 lg:px-8 select-none">
      {/* Top Bar: Back to Landing & Theme Toggle */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-700 shadow-theme-xs backdrop-blur-md transition-all hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda Publik</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
        </div>
      </div>

      {/* Decorative Brand Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[130px] dark:bg-brand-500/20" />

      {/* Brand Header */}
      <div className="relative z-10 text-center sm:mx-auto sm:w-full sm:max-w-md space-y-2 mt-6">
        <div className="mb-3 inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-theme-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <img
            src="/images/logo/LOGO-PLN.png"
            alt="PLN Nusa Daya"
            className="h-16 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          PLN NUSA DAYA
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          WACB DIGIKIT PLTD Logsheet & HAR Control Room Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 mt-6 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-theme-md dark:border-gray-800 dark:bg-gray-900 transition-colors">
          {errorMsg && (
            <div className="rounded-xl border border-error-200 bg-error-50 p-3.5 text-xs font-semibold text-error-700 dark:border-error-800 dark:bg-error-950/80 dark:text-error-300">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Username Akun
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Contoh: operator / supervisor / manager"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
                <span>Pilih Peran Kerja (RBAC):</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    "OPERATOR",
                    "TEKNISI",
                    "SUPERVISOR",
                    "MANAGER",
                    "ADMIN",
                    "SUPERADMIN",
                  ] as Role[]
                ).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                      selectedRole === r
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 shadow-theme-xs font-extrabold"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? "Memproses Autentikasi..." : "Masuk ke Ruang Kontrol"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Reference of Available Accounts (Informational Only, NO shortcut buttons) */}
          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowAccountsGuide(!showAccountsGuide)}
              className="flex w-full items-center justify-between text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-brand-500" />
                <span>Daftar Akun Terdaftar (Sesuai Role di Aplikasi)</span>
              </span>
              <span className="text-[10px] text-brand-500">{showAccountsGuide ? "Sembunyikan" : "Tampilkan"}</span>
            </button>

            {showAccountsGuide && (
              <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[11px] dark:border-gray-800 dark:bg-gray-800/60 space-y-2">
                <p className="font-bold text-gray-700 dark:text-gray-300 text-[10px] uppercase tracking-wider">
                  Kredensial Pengujian (Password: 123) / Akun WACB:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">operator</p>
                    <p className="text-gray-500">Role: OPERATOR (Input PLTD)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">teknisi</p>
                    <p className="text-gray-500">Role: TEKNISI (Modul HAR & AMC)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">supervisor</p>
                    <p className="text-gray-500">Role: SUPERVISOR (Approval Shift)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">manager</p>
                    <p className="text-gray-500">Role: MANAGER (Executive Review)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">admin</p>
                    <p className="text-gray-500">Role: ADMIN (Master Wilayah)</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white">superadmin</p>
                    <p className="text-gray-500">Role: SUPERADMIN (Full Bypass)</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  * Kredensial resmi WACB (wacb.nusadaya.net) juga didukung secara otomatis via relay backend.
                </p>
              </div>
            )}
          </div>

          {/* Quick links to Guest & Presensi */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
            <Link
              href="/guest"
              className="flex items-center gap-1 hover:text-brand-500 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              <span>Statistik Tamu (Guest)</span>
            </Link>
            <Link
              href="/presensi"
              className="flex items-center gap-1 hover:text-brand-500 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              <span>Presensi GPS</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
