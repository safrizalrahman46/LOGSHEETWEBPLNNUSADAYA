"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, X, Cpu } from "lucide-react";
import { apiClient } from "@/lib/api";
import { WACBMatrixResponse, WACBDetailReportResponse } from "@/types";

interface TimeSlotMatrixProps {
  kdUnit?: string;
  tanggal?: string;
  onSlotClick?: (slot: string, status: string) => void;
}

export function TimeSlotMatrix({
  kdUnit = "0264",
  tanggal = new Date().toISOString().substring(0, 10),
}: TimeSlotMatrixProps) {
  const router = useRouter();
  const [matrixData, setMatrixData] = useState<Record<string, { status: string; id_beban?: string | null }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlotDetail, setSelectedSlotDetail] = useState<{
    jam: string;
    idBeban: string;
    data?: WACBDetailReportResponse["data"];
    loading: boolean;
  } | null>(null);

  // Generate 48 slots
  const allSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hh = h.toString().padStart(2, "0");
    allSlots.push(`${hh}:00`);
    allSlots.push(`${hh}:30`);
  }

  // Current slot
  const now = new Date();
  const currentSlot = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes() < 30 ? "00" : "30"}`;

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<WACBMatrixResponse>("/wacb/matrix", {
        params: { kd_region: "05", tanggal, kd_unit: kdUnit },
      });
      if (res.data?.data && res.data.data.length > 0) {
        setMatrixData(res.data.data[0].logsheet_pltd || {});
      }
    } catch (err) {
      console.error("Failed to load matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [kdUnit, tanggal]);

  const handleSlotClick = async (slot: string, item?: { status: string; id_beban?: string | null }) => {
    if (item && item.status === "done" && item.id_beban) {
      setSelectedSlotDetail({
        jam: slot,
        idBeban: item.id_beban,
        loading: true,
      });

      try {
        const res = await apiClient.get<WACBDetailReportResponse>(`/wacb/detail/${item.id_beban}`, {
          params: { kd_unit: kdUnit, tanggal, jam: `${slot}:00` },
        });
        setSelectedSlotDetail({
          jam: slot,
          idBeban: item.id_beban,
          data: res.data.data,
          loading: false,
        });
      } catch {
        setSelectedSlotDetail((prev) => (prev ? { ...prev, loading: false } : null));
      }
    } else {
      router.push(`/logsheet/input?jam=${slot}&tanggal=${tanggal}`);
    }
  };

  const doneCount = Object.values(matrixData).filter((v) => v.status === "done").length;
  const percentage = Math.round((doneCount / 48) * 100);

  return (
    <div className="space-y-4">
      {/* Header Metric Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40 transition-colors">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <Clock className="h-4 w-4 text-brand-500" />
            Matriks Pembebanan 24 Jam (48 Interval)
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Unit Layanan PLTD • Tanggal: {tanggal}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold uppercase text-gray-400">Keterisian Hari Ini</div>
            <div className="text-base font-extrabold text-brand-600 dark:text-brand-400">
              {doneCount} / 48 Slot <span className="text-xs font-bold text-gray-500 dark:text-gray-400">({percentage}%)</span>
            </div>
          </div>
          <div className="h-2.5 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-success-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid 48 Slots */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 transition-colors">
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-gray-400">
            Memuat status slot pembebanan...
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
            {allSlots.map((slot) => {
              const item = matrixData[slot];
              const isDone = item?.status === "done";
              const isCurrent = slot === currentSlot;

              return (
                <button
                  key={slot}
                  onClick={() => handleSlotClick(slot, item)}
                  className={`relative flex flex-col items-center justify-between gap-1.5 rounded-xl border p-2.5 text-center transition-all active:scale-95 ${
                    isDone
                      ? "border-success-300/80 bg-success-50/70 text-success-900 shadow-theme-xs hover:bg-success-100 dark:border-success-800 dark:bg-success-950/40 dark:text-success-300 dark:hover:bg-success-900/50"
                      : "border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400 dark:hover:bg-gray-800"
                  } ${isCurrent ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-gray-900" : ""}`}
                >
                  {isCurrent && (
                    <span className="absolute -top-1.5 -right-1 rounded-full bg-brand-500 px-1 py-0.2 text-[8px] font-extrabold uppercase text-white shadow-theme-xs">
                      NOW
                    </span>
                  )}
                  <span className="text-xs font-extrabold tracking-tight">{slot}</span>
                  {isDone ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-success-700 dark:text-success-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                      <span>Done</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400">Kosong</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal (/getLogsheet) */}
      {selectedSlotDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-brand-500" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Rincian Logsheet Beban Mesin</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Jam: {selectedSlotDetail.jam} WITA • ID Beban: {selectedSlotDetail.idBeban}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlotDetail(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              {selectedSlotDetail.loading ? (
                <div className="py-12 text-center text-xs font-semibold text-gray-500">
                  Mengambil detail laporan mesin dari server...
                </div>
              ) : selectedSlotDetail.data?.beban_mesin && selectedSlotDetail.data.beban_mesin.length > 0 ? (
                <div className="space-y-3">
                  {selectedSlotDetail.data.beban_mesin.map((m, idx) => (
                    <div
                      key={idx}
                      className="space-y-2.5 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-brand-500" />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{m.nama_mesin}</span>
                        </div>
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-black uppercase ${
                            m.kd_status === "01"
                              ? "border-success-300 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-950/60 dark:text-success-300"
                              : m.kd_status === "02"
                              ? "border-warning-300 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-950/60 dark:text-warning-300"
                              : "border-error-300 bg-error-50 text-error-700 dark:border-error-800 dark:bg-error-950/60 dark:text-error-300"
                          }`}
                        >
                          {m.kd_status === "01" ? "OPERASI" : m.kd_status === "02" ? "STANDBY" : "GANGGUAN"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] sm:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Beban</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.beban ?? 0} kW</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Tegangan</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.teg ?? 0} V</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Frekuensi</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.frequency ?? 0} Hz</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Tek Oli</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.tek_oli ?? 0} Bar</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Temp Air</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.tem_air ?? 0} °C</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Stand kWh</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.stand_kwh ?? 0}</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Stand BBM</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.stand_bbm ?? 0}</span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                          <span className="block text-[9px] font-bold uppercase text-gray-400">Cos Phi</span>
                          <span className="font-black text-gray-900 dark:text-white">{m.cos_phi ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-semibold text-gray-400">
                  Tidak ada data beban mesin tersimpan pada slot ini.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
              <button
                onClick={() => setSelectedSlotDetail(null)}
                className="rounded-xl bg-gray-800 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
