"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDashed,
  FileSpreadsheet,
  LocateFixed,
  MapPin,
  Navigation,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/layout/AppLayout";
import { TimeSlotMatrix } from "@/components/matrix/TimeSlotMatrix";
import { apiClient } from "@/lib/api";
import { WACBFormatResponse, WACBUnitItem } from "@/types";

interface UnitLocation {
  id?: number;
  kd_unit: string;
  nama_unit: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  is_active?: boolean;
}

type Slots = Record<string, { status: string; id_beban?: string | null }>;

const axisTick = { fontSize: 10, fill: "#9ca3af" };

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function UnitDetailPage() {
  const params = useParams<{ kd_unit: string }>();
  const kdUnit = String(params?.kd_unit || "");
  const router = useRouter();

  const [unit, setUnit] = useState<WACBUnitItem | null>(null);
  const [location, setLocation] = useState<UnitLocation | null>(null);
  const [slots, setSlots] = useState<Slots>({});
  const [tanggal, setTanggal] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await apiClient.get<WACBFormatResponse>("/wacb/units", {
        params: { kd_region: "05" },
      });
      const found = (res.data?.units || []).find((u) => u.kd_unit === kdUnit);
      if (found) setUnit(found);
      else setNotFound(true);
    } catch {
      setNotFound(false);
    }
  }, [kdUnit]);

  const fetchLocation = useCallback(async () => {
    try {
      const res = await apiClient.get("/attendance/units");
      const list: UnitLocation[] = res.data?.data || [];
      const found = list.find((u) => u.kd_unit === kdUnit);
      if (found) setLocation(found);
    } catch {
      // opsional
    }
  }, [kdUnit]);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/wacb/matrix", {
        params: { kd_region: "05", tanggal, kd_unit: kdUnit },
      });
      const data = res.data?.data;
      if (data && data.length > 0) {
        setSlots(data[0].logsheet_pltd || {});
        setMatrixError(null);
      } else {
        setSlots({});
        setMatrixError("Tidak ada data matriks untuk tanggal ini");
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setSlots({});
      setMatrixError(
        status === 401
          ? "Sesi berakhir — login kembali untuk melihat matriks unit ini."
          : "Gagal memuat matriks unit dari server WACB."
      );
    } finally {
      setLoading(false);
    }
  }, [kdUnit, tanggal]);

  useEffect(() => {
    fetchIdentity();
    fetchLocation();
  }, [fetchIdentity, fetchLocation]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const makeActive = () => {
    localStorage.setItem(
      "pln_selected_unit",
      JSON.stringify({
        kd_unit: kdUnit,
        nama_unit: unit?.nama_unit || kdUnit,
        kd_area: unit?.kd_area,
        nama_area: unit?.nama_area,
      })
    );
  };

  const goDashboard = () => {
    makeActive();
    router.push("/dashboard");
  };

  const goMatrix = () => {
    makeActive();
    router.push("/logsheet/matrix");
  };

  const allSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    allSlots.push(`${hh}:00`);
    allSlots.push(`${hh}:30`);
  }

  const doneCount = allSlots.filter((s) => slots[s]?.status === "done").length;
  const percentage = Math.round((doneCount / allSlots.length) * 100);

  const donutData = [
    { name: "Terisi", value: doneCount },
    { name: "Belum Diisi", value: allSlots.length - doneCount },
  ].filter((d) => d.value > 0);

  const perHour = Array.from({ length: 24 }, (_, h) => {
    const hh = h.toString().padStart(2, "0");
    const done = [`${hh}:00`, `${hh}:30`].filter((s) => slots[s]?.status === "done").length;
    return { jam: `${hh}:00`, terisi: done, belum: 2 - done };
  });

  const cards = [
    {
      label: "Kode Unit",
      value: unit?.kd_unit || kdUnit,
      icon: Building2,
      tone: "brand",
    },
    {
      label: "Area / Site",
      value: unit?.nama_area || "-",
      icon: MapPin,
      tone: "success",
    },
    {
      label: "Wilayah",
      value: "Regional Kalimantan 3 (05)",
      icon: Navigation,
      tone: "warning",
    },
    {
      label: "Slot Terisi Hari Ini",
      value: `${doneCount}/48 (${percentage}%)`,
      icon: CheckCircle2,
      tone: doneCount === 48 ? "success" : "error",
    },
  ];

  const toneCls: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
    error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  };

  if (notFound) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Unit tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Kode unit <b>{kdUnit}</b> tidak ada di daftar WACB Regional 05.
          </p>
          <Link
            href="/pilih-unit"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilih Unit
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/pilih-unit"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Semua Unit
            </Link>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              {unit?.nama_unit || `Unit ${kdUnit}`}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Kode {unit?.kd_unit || kdUnit} • {unit?.nama_area || "KAL-3"} • Regional
              Kalimantan 3
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <Calendar className="h-4 w-4 text-brand-500" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value || todayStr())}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-hidden dark:text-gray-200"
              />
            </div>
            <button
              onClick={goMatrix}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Lihat Matriks <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={goDashboard}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600"
            >
              Jadikan Unit Aktif
            </button>
          </div>
        </div>

        {/* Kartu info unit */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {c.label}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneCls[c.tone]}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <p className="mt-3 truncate text-lg font-bold text-gray-900 dark:text-white">
                  {c.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lokasi geofence */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <LocateFixed className="h-4 w-4 text-brand-500" />
              Lokasi & Geofence Unit
            </h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {location ? "Terdaftar" : "Belum ada titik geofence"}
            </span>
          </div>
          {location ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoBox label="Latitude" value={String(location.latitude)} />
              <InfoBox label="Longitude" value={String(location.longitude)} />
              <InfoBox label="Radius Presensi" value={`${location.radius_meter} meter`} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Unit ini belum memiliki titik koordinat geofence, sehingga presensi GPS tidak
              diverifikasi otomatis.
            </p>
          )}
        </div>

        {/* Chart keterisian slot */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Chart Keterisian Logsheet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                48 slot (interval 30 menit) untuk {tanggal}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                percentage === 100
                  ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
                  : percentage >= 60
                    ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400"
                    : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"
              }`}
            >
              {doneCount}/48 slot terisi ({percentage}%)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> Rasio Keterisian
              </p>
              {loading ? (
                <ChartPlaceholder text="Memuat rasio keterisian..." />
              ) : matrixError ? (
                <ChartPlaceholder text={matrixError} />
              ) : donutData.length === 0 ? (
                <ChartPlaceholder text="Belum ada data slot" />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                <CircleDashed className="h-3.5 w-3.5 text-brand-500" /> Slot per Jam
                (Terisi vs Kosong)
              </p>
              {loading ? (
                <ChartPlaceholder text="Memuat sebaran slot..." />
              ) : matrixError ? (
                <ChartPlaceholder text={matrixError} />
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perHour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="jam" tick={axisTick} interval={2} />
                      <YAxis allowDecimals={false} tick={axisTick} width={26} domain={[0, 2]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="terisi" name="Terisi" stackId="a" fill="#10b981" />
                      <Bar dataKey="belum" name="Belum" stackId="a" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Matriks 48 slot unit ini */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <TimeSlotMatrix kdUnit={kdUnit} tanggal={tanggal} />
        </div>

        {/* Aksi cepat */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/logsheet/input"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FileSpreadsheet className="h-4 w-4 text-brand-500" /> Input Logsheet Unit Ini
          </Link>
          <Link
            href="/presensi"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <MapPin className="h-4 w-4 text-emerald-500" /> Presensi di Unit Ini
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ChartPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex h-72 items-center justify-center px-4 text-center text-xs text-gray-400 dark:text-gray-500">
      {text}
    </div>
  );
}
