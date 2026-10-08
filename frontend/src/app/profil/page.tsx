"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Camera,
  Save,
  KeyRound,
  ShieldCheck,
  Mail,
  BadgeCheck,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  IdCard,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";
import { User } from "@/types";

type Notice = { type: "success" | "error"; text: string } | null;

const readStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pln_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export default function ProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<Notice>(null);

  const applyUser = useCallback((next: User) => {
    setUser(next);
    setName(next.name || "");
    setEmail(next.email || "");
    try {
      localStorage.setItem("pln_user", JSON.stringify(next));
    } catch {
      // ignore quota/storage errors
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("pln_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = readStoredUser();
    if (stored) {
      setUser(stored);
      setName(stored.name || "");
      setEmail(stored.email || "");
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get("/auth/me");
        if (!cancelled && res.data?.success && res.data.user) {
          applyUser({ ...stored, ...res.data.user } as User);
        }
      } catch {
        // token might be invalid → interceptor handles redirect
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, applyUser]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    if (!name.trim()) {
      setProfileNotice({ type: "error", text: "Nama wajib diisi." });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await apiClient.put("/auth/profile", {
        name: name.trim(),
        email: email.trim(),
      });
      if (res.data?.success) {
        if (res.data.user) applyUser({ ...user, ...res.data.user } as User);
        setProfileNotice({ type: "success", text: res.data.message || "Profil berhasil diperbarui." });
      } else {
        setProfileNotice({ type: "error", text: res.data?.message || "Gagal memperbarui profil." });
      }
    } catch (err: any) {
      setProfileNotice({
        type: "error",
        text: err.response?.data?.message || "Gagal terhubung ke server backend.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);
    if (!currentPassword || !newPassword) {
      setPasswordNotice({ type: "error", text: "Password lama dan baru wajib diisi." });
      return;
    }
    if (newPassword.length < 3) {
      setPasswordNotice({ type: "error", text: "Password baru minimal 3 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: "error", text: "Konfirmasi password baru tidak sama." });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiClient.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.data?.success) {
        setPasswordNotice({ type: "success", text: res.data.message || "Password berhasil diubah." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordNotice({ type: "error", text: res.data?.message || "Gagal mengubah password." });
      }
    } catch (err: any) {
      setPasswordNotice({
        type: "error",
        text: err.response?.data?.message || "Gagal terhubung ke server backend.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFile = async (file: File | undefined) => {
    setAvatarNotice(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarNotice({ type: "error", text: "Format foto harus JPG, PNG, atau WEBP." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarNotice({ type: "error", text: "Ukuran foto maksimal 2MB." });
      return;
    }

    const form = new FormData();
    form.append("avatar", file);
    setUploadingAvatar(true);
    try {
      const res = await apiClient.post("/auth/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        const next = { ...user, avatar: res.data.avatar } as User;
        applyUser(next);
        setAvatarNotice({ type: "success", text: res.data.message || "Foto profil berhasil diperbarui." });
      } else {
        setAvatarNotice({ type: "error", text: res.data?.message || "Gagal mengunggah foto." });
      }
    } catch (err: any) {
      setAvatarNotice({
        type: "error",
        text: err.response?.data?.message || "Gagal terhubung ke server backend.",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const NoticeBadge = ({ notice }: { notice: Notice }) =>
    notice ? (
      <div
        className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
          notice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        }`}
      >
        {notice.type === "success" ? (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        )}
        <span>{notice.text}</span>
      </div>
    ) : null;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all dark:border-gray-800 dark:bg-gray-900 dark:text-white";

  const labelClass =
    "mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Profil Saya
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kelola foto profil, data akun, dan keamanan password Anda.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <ShieldCheck className="h-4 w-4 text-brand-500" />
            <span>Terhubung dengan RBAC Lokal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Avatar + Account Identity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col items-center text-center">
              <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-4 ring-brand-50 dark:bg-gray-800 dark:ring-brand-500/20">
                {mounted && user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${user.avatar}${user.avatar.includes("?") ? "&" : "?"}t=${Date.now()}`}
                    alt={user.name || "Foto Profil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                )}
                {uploadingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </span>
                )}
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleAvatarFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                <span>{uploadingAvatar ? "Mengunggah..." : "Ganti Foto"}</span>
              </button>
              <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                JPG/PNG/WEBP, maksimal 2MB.
              </p>

              {avatarNotice && (
                <div className="mt-3 w-full">
                  <NoticeBadge notice={avatarNotice} />
                </div>
              )}

              <div className="mt-6 w-full space-y-3 border-t border-gray-100 pt-5 text-left dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Username
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {mounted ? user?.username || "-" : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <BadgeCheck className="h-4 w-4 text-brand-500" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Role Akses
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {mounted ? user?.role || "GUEST" : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Unit Kerja
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {mounted ? user?.nama_unit || user?.kd_unit || "Kalimantan 3" : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Data Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 xl:col-span-2">
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Data Akun
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Perbarui nama tampilan dan alamat email yang terdaftar.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profil-name" className={labelClass}>
                    <UserRound className="h-3.5 w-3.5" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    id="profil-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="profil-email" className={labelClass}>
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </label>
                  <input
                    id="profil-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@nusadaya.pln.co.id"
                    className={inputClass}
                  />
                </div>
              </div>

              {profileNotice && <NoticeBadge notice={profileNotice} />}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{savingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>

            {/* Change Password */}
            <div className="mt-7 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="mb-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                  <KeyRound className="h-4 w-4 text-brand-500" />
                  Ubah Password
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Gunakan password minimal 4 karakter. Password lama wajib benar.
                </p>
              </div>

              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="pw-current" className={labelClass}>
                      <span>Password Lama</span>
                    </label>
                    <input
                      id="pw-current"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="pw-new" className={labelClass}>
                      <span>Password Baru</span>
                    </label>
                    <input
                      id="pw-new"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="pw-confirm" className={labelClass}>
                      <span>Konfirmasi Password Baru</span>
                    </label>
                    <input
                      id="pw-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>

                {passwordNotice && <NoticeBadge notice={passwordNotice} />}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-theme-xs transition-colors hover:bg-gray-800 active:scale-98 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
                  >
                    {savingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    <span>{savingPassword ? "Menyimpan..." : "Ubah Password"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
