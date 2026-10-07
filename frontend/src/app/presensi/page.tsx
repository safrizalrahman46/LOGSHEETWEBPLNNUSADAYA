"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Zap, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  History, 
  Building2 
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";

interface UnitLocation {
  id: number;
  kd_unit: string;
  nama_unit: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
}

interface AttendanceRecord {
  id: number;
  username: string;
  name: string;
  role: string;
  kd_unit: string;
  nama_unit: string;
  shift: string;
  latitude: number;
  longitude: number;
  distance_meter: number;
  is_within_geofence: boolean;
  status: string;
  remarks: string;
  created_at: string;
}

export default function PresensiPage() {
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<UnitLocation[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithin, setIsWithin] = useState<boolean | null>(null);

  // Form states
  const [shift, setShift] = useState("PAGI");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ text: string; success: boolean } | null>(null);

  // History state
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);

  // 1. Load Units Master
  useEffect(() => {
    setMounted(true);
    apiClient.get("/attendance/units")
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setUnits(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedUnit(res.data.data[0]);
          }
        }
      })
      .catch((err) => console.error("Gagal memuat master unit presensi:", err));

    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoadingHistory(true);
    apiClient.get("/attendance/history")
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setHistory(res.data.data);
        }
      })
      .catch((err) => console.error("Gagal memuat riwayat presensi:", err))
      .finally(() => setLoadingHistory(false));
  };

  // 2. Haversine Formula (Jarak meter)
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 3. Request GPS
  const requestGPS = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung layanan Geolocation GPS.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setUserLocation(coords);
        setLocating(false);

        if (selectedUnit) {
          const dist = calculateHaversine(coords.lat, coords.lng, selectedUnit.latitude, selectedUnit.longitude);
          setDistance(dist);
          setIsWithin(dist <= selectedUnit.radius_meter);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(`Gagal mendapatkan lokasi GPS: ${err.message}. Pastikan izin lokasi aktif.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Re-calculate distance when selectedUnit changes
  useEffect(() => {
    if (userLocation && selectedUnit) {
      const dist = calculateHaversine(userLocation.lat, userLocation.lng, selectedUnit.latitude, selectedUnit.longitude);
      setDistance(dist);
      setIsWithin(dist <= selectedUnit.radius_meter);
    }
  }, [selectedUnit, userLocation]);

  // 4. Initialize Map (Leaflet dynamic client-side)
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isSubscribed = true;
    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const defaultCenter = selectedUnit
          ? [selectedUnit.latitude, selectedUnit.longitude]
          : [-0.4948, 117.1436];

        const map = L.map(mapContainerRef.current).setView(defaultCenter as any, 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers & circles
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }

      // Add Unit Geofence Circle & Pin
      if (selectedUnit) {
        map.setView([selectedUnit.latitude, selectedUnit.longitude], 16);

        const circle = L.circle([selectedUnit.latitude, selectedUnit.longitude], {
          color: "#465fff",
          fillColor: "#465fff",
          fillOpacity: 0.15,
          radius: selectedUnit.radius_meter,
        }).addTo(map);
        circleRef.current = circle;

        const unitMarker = L.marker([selectedUnit.latitude, selectedUnit.longitude])
          .addTo(map)
          .bindPopup(`<b>${selectedUnit.nama_unit}</b><br/>Radius Aman: ${selectedUnit.radius_meter} meter`);
        markersRef.current.push(unitMarker);
      }

      // Add User Location Pin
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `<div style="background-color: #f79009; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #101828; box-shadow: 0 0 12px #f79009;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<b>Posisi Anda Saat Ini</b><br/>Akurasi: ±${Math.round(userLocation.accuracy)} meter`);

        markersRef.current.push(userMarker);

        // Fit bounds to show both unit and user
        if (selectedUnit) {
          const bounds = L.latLngBounds([
            [selectedUnit.latitude, selectedUnit.longitude],
            [userLocation.lat, userLocation.lng],
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [mounted, selectedUnit, userLocation]);

  // 5. Submit Attendance
  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation || !selectedUnit) {
      alert("Harap deteksi posisi GPS Anda terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const payload = {
        kd_unit: selectedUnit.kd_unit,
        nama_unit: selectedUnit.nama_unit,
        shift,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        remarks,
      };

      const res = await apiClient.post("/attendance/checkin", payload);
      if (res.data?.success) {
        setSubmitMessage({
          text: `Presensi Berhasil Dicatat: Status ${res.data.record.status} (Jarak: ${Math.round(res.data.record.distance_meter)}m)`,
          success: true,
        });
        setRemarks("");
        loadHistory();
      } else {
        setSubmitMessage({
          text: res.data?.message || "Gagal mencatat presensi",
          success: false,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Terjadi kesalahan. Pastikan Anda telah login.";
      setSubmitMessage({ text: msg, success: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-success-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-success-700 dark:bg-success-500/20 dark:text-success-300">
                GEOFENCING 250M
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Verifikasi Kehadiran Fisik Lapangan
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Presensi Operator & Teknisi PLTD
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Validasi kehadiran shift di site pembangkit dengan batas toleransi radius 250 meter (Formula Haversine).
            </p>
          </div>

          <button
            onClick={requestGPS}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
          >
            <Navigation className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
            <span>{locating ? "Mendeteksi Posisi..." : "Deteksi Posisi GPS Saya"}</span>
          </button>
        </div>

        {locationError && (
          <div className="flex items-center gap-3 rounded-2xl border border-error-200 bg-error-50 p-4 text-xs font-medium text-error-700 dark:border-error-800 dark:bg-error-950/60 dark:text-error-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-error-500" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Grid Map & Form */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Leaflet Map Area */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span>Peta Interaktif Geofencing Site PLTD</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span>Titik Site PLTD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
                  <span>Posisi Anda</span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="h-96 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 z-0 dark:border-gray-700 dark:bg-gray-800"
            />

            {/* Distance & Validation Status Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Jarak ke Pusat Site</p>
                <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                  {distance !== null ? `${Math.round(distance)} meter` : "Belum terdeteksi"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Akurasi GPS Perangkat</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {userLocation ? `±${Math.round(userLocation.accuracy)} meter` : "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status Validasi</p>
                {isWithin !== null ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isWithin
                      ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400 border border-success-200 dark:border-success-800"
                      : "bg-error-50 text-error-700 dark:bg-error-500/20 dark:text-error-400 border border-error-200 dark:border-error-800"
                  }`}>
                    {isWithin ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    <span>{isWithin ? "VALID (Dalam Radius 250m)" : "ANOMALI (Di Luar Site)"}</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-400">Menunggu GPS...</span>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Check-in Form */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Formulir Presensi Shift</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sesuaikan unit dan shift dengan jadwal kerja Anda.</p>
              </div>

              {submitMessage && (
                <div className={`rounded-xl p-3 text-xs font-semibold ${
                  submitMessage.success
                    ? "border border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-950/60 dark:text-success-300"
                    : "border border-error-200 bg-error-50 text-error-700 dark:border-error-800 dark:bg-error-950/60 dark:text-error-300"
                }`}>
                  {submitMessage.text}
                </div>
              )}

              {/* Unit Selection */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Unit Layanan PLTD</label>
                <select
                  value={selectedUnit?.kd_unit || ""}
                  onChange={(e) => {
                    const found = units.find((u) => u.kd_unit === e.target.value);
                    if (found) setSelectedUnit(found);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                >
                  {units.map((u) => (
                    <option key={u.kd_unit} value={u.kd_unit}>
                      {u.nama_unit} ({u.kd_unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift Selection */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Shift Kerja</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PAGI", "SIANG", "MALAM"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setShift(s)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all ${
                        shift === s
                          ? "bg-brand-500 text-white shadow-theme-xs"
                          : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Catatan / Keterangan (Opsional)</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Misal: Hadir pergantian shift pagi, kondisi mesin normal..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !userLocation}
                className="w-full rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
              >
                {submitting ? "Mengirim Presensi..." : "Kirim Presensi Shift"}
              </button>
            </form>

            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] text-gray-400 dark:border-gray-800 space-y-1">
              <p>• Presensi diverifikasi berdasarkan koordinat GPS perangkat.</p>
              <p>• Data tersimpan otomatis ke log audit ruang kontrol.</p>
            </div>
          </div>
        </div>

        {/* Recent Attendance History Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
              <History className="h-4 w-4 text-brand-500" />
              Riwayat Presensi Shift Lapangan
            </h3>
            <button
              onClick={loadHistory}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Nama Personel</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Unit Layanan</th>
                  <th className="py-3 px-5">Shift</th>
                  <th className="py-3 px-5">Jarak ke Site</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.length > 0 ? (
                  history.map((rec) => (
                    <tr key={rec.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <td className="py-3.5 px-5 text-gray-500 dark:text-gray-400">
                        {new Date(rec.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })} WITA
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">{rec.name || rec.username}</td>
                      <td className="py-3.5 px-5 font-semibold text-gray-600 dark:text-gray-400">{rec.role}</td>
                      <td className="py-3.5 px-5 text-gray-800 dark:text-gray-200">{rec.nama_unit}</td>
                      <td className="py-3.5 px-5">
                        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          {rec.shift}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-gray-700 dark:text-gray-300">{Math.round(rec.distance_meter)} m</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          rec.status === "VALID"
                            ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                            : "bg-error-50 text-error-700 dark:bg-error-500/20 dark:text-error-400"
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Belum ada catatan presensi hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
