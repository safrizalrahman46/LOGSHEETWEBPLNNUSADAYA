"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, ArrowLeft, Info, BarChart3, MapPin, Clock3 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "1") {
      setSessionExpired(true);
      const next = window.location.pathname + "?";
      window.history.replaceState({}, "", next.replace(/\?$/, ""));
    }
  }, []);

  const validateField = (name: "username" | "password", value: string): string => {
    const v = value.trim();
    if (name === "username") {
      if (!v) return "Username wajib diisi.";
      if (v.length < 3) return "Username minimal 3 karakter.";
      if (v.length > 64) return "Username maksimal 64 karakter.";
      if (!/^[a-zA-Z0-9._@-]+$/.test(v))
        return "Username hanya boleh huruf, angka, titik, underscore, minus, atau @.";
      return "";
    }
    if (!value) return "Password wajib diisi.";
    if (value.length < 3) return "Password minimal 3 karakter.";
    if (value.length > 128) return "Password maksimal 128 karakter.";
    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSessionExpired(false);

    const errs = {
      username: validateField("username", username),
      password: validateField("password", password),
    };
    setFieldErrors(errs);
    if (errs.username || errs.password) return;

    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", {
        username: username.trim(),
        password,
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
        setErrorMsg(res.data?.message || "Login gagal, silakan periksa username & password.");
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          "Gagal terhubung ke server backend (Pastikan backend aktif di port 8080)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f3f8fc] dark:bg-gray-950 px-4 py-8 overflow-hidden">
      {/* Ambient background soft glow effects matching reference */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#cce4fd]/70 to-[#dceeff]/30 blur-[120px] dark:from-blue-900/30 dark:to-indigo-950/40" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-[#b8ddfe]/60 to-[#e4f2ff]/20 blur-[130px] dark:from-blue-950/40 dark:to-slate-900/60" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-white/60 blur-[90px] dark:bg-white/[0.04]" />

      {/* Main container: 2-column layout matching reference Image 1 */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Side: Illustration + PLN Nusadaya Title */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
          <div className="relative mb-4 drop-shadow-sm flex justify-center">
            <img
              src="/images/wacb-illustration-transparent.png"
              alt="PLN Nusadaya Illustration"
              className="w-48 sm:w-56 h-auto object-contain transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/wacb-illustration.png";
              }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">
            PLN Nusadaya
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
            Platform untuk mendukung pelaporan operasional pembangkit PLN Nusa Daya.
          </p>

          {/* Quick links to guest monitoring & GPS Attendance */}
          <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-gray-400">
            <Link
              href="/guest"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Monitoring Tamu</span>
            </Link>
            <span className="text-slate-300 dark:text-gray-600">•</span>
            <Link
              href="/presensi"
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Presensi GPS</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Clean White Floating Login Card */}
        <div className="w-full max-w-[400px]">
          <div className="rounded-[28px] bg-white p-8 sm:p-9 shadow-[0_20px_50px_rgba(20,50,90,0.07)] border border-slate-100/90 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none relative">
            
            {/* Header: PLN Nusa Daya Logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/images/logo/LOGO-PLN.png"
                alt="PLN Nusa Daya"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/plnt.png";
                }}
              />
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white tracking-tight">
              Selamat Datang
            </h2>
            <p className="mt-1 text-xs text-center text-slate-500 dark:text-gray-400">
              Silakan login untuk melanjutkan akses ke sistem PLN Nusa Daya.
            </p>

            {/* Session Expired Notice */}
            {sessionExpired && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.</span>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 mt-5" noValidate>
              {/* Username Input */}
              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-gray-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }));
                    }}
                    onBlur={() => setFieldErrors((p) => ({ ...p, username: validateField("username", username) || undefined }))}
                    aria-invalid={Boolean(fieldErrors.username)}
                    className={`w-full rounded-xl border bg-white dark:bg-gray-950 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:outline-none transition-all shadow-xs ${
                      fieldErrors.username
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1.5 pl-1 text-[11px] font-semibold text-rose-500">{fieldErrors.username}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-gray-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    onBlur={() => setFieldErrors((p) => ({ ...p, password: validateField("password", password) || undefined }))}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full rounded-xl border bg-white dark:bg-gray-950 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:outline-none transition-all shadow-xs ${
                      fieldErrors.password
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 pl-1 text-[11px] font-semibold text-rose-500">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button: Masuk Sekarang (Blue) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2b85ff] hover:bg-[#1a75f0] active:scale-[0.99] py-3 text-xs font-semibold text-white transition-all shadow-[0_4px_12px_rgba(43,133,255,0.25)] disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? "Memproses..." : "Masuk Sekarang"}
              </button>

              {/* Back Button: Kembali */}
              <Link
                href="/"
                className="w-full rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] active:scale-[0.99] py-2.5 text-xs font-semibold text-slate-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-1.5 border border-slate-100 dark:border-gray-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Link>
            </form>

            {/* Quick Testing Hint Dropdown */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 text-center">
              <button
                type="button"
                onClick={() => setShowAccountsGuide(!showAccountsGuide)}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                <span>Petunjuk Akun Pengujian (Klik untuk melihat)</span>
              </button>

              {showAccountsGuide && (
                <div className="mt-2 text-left rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[10px] text-slate-600 space-y-1 dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-slate-700 dark:text-gray-200">Akun pengujian:</p>
                  <p>• <strong>admin</strong> / <strong>admin123</strong> (Role: ADMIN)</p>
                  <p>• <strong>operator</strong> (Role: OPERATOR)</p>
                  <p>• <strong>teknisi</strong> (Role: TEKNISI)</p>
                  <p>• <strong>supervisor</strong> (Role: SUPERVISOR)</p>
                  <p className="font-semibold text-slate-700 dark:text-gray-200 pt-1">Password lainnya: 123</p>
                  <p className="text-slate-400 dark:text-gray-500 italic text-[9px] pt-1">
                    * Mendukung akun WACB resmi (wacb.nusadaya.net)
                  </p>
                </div>
              )}
            </div>

            {/* Footer Copyright inside card */}
            <div className="mt-6 text-center">
              <p className="text-[10.5px] text-slate-400 dark:text-gray-500">
                © {new Date().getFullYear()} PLN Nusa Daya. All rights reserved.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
