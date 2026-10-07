"use client";

import { useEffect, useState } from "react";
import {
  CloudUpload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Wifi,
  WifiOff,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { getPendingDrafts, deleteOfflineDraft } from "@/db/offlineDb";
import { useNetwork } from "@/hooks/useNetwork";
import { OfflineDraft } from "@/types";

export default function SyncQueuePage() {
  const { isOnline, isSyncing, syncPendingDrafts } = useNetwork();
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const list = await getPendingDrafts();
      setDrafts(list);
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [isSyncing]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm("Hapus draft offline ini dari antrean?")) {
      await deleteOfflineDraft(id);
      fetchDrafts();
    }
  };

  const handleSyncAll = async () => {
    await syncPendingDrafts();
    fetchDrafts();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Antrean Sinkronisasi Offline (Dual-Layer Sync)
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Penyimpanan Lokal IndexedDB (Dexie.js) • Otomatis Terkirim saat Terhubung Internet
            </p>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing || !isOnline || drafts.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-white" : ""}`} />
            <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan Semua Sekarang"}</span>
          </button>
        </div>

        {/* Status Box */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isOnline
                  ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
                  : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"
              }`}
            >
              {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Status Jaringan: {isOnline ? "Terhubung ke Internet" : "Mode Offline (Terputus)"}
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {isOnline
                  ? "Sistem siap mengirimkan draft logsheet ke server WACB DIGIKIT."
                  : "Data logsheet yang diinput tersimpan aman di database lokal browser."}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Antrean
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{drafts.length} Item</span>
          </div>
        </div>

        {/* Draft List Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
              <Layers className="h-4 w-4 text-brand-500" />
              Daftar Draft Menunggu Pengiriman
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-semibold text-gray-400">
              Memuat antrean lokal...
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-16 text-center text-xs font-semibold text-gray-400 space-y-1">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success-500" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Semua laporan telah tersinkronisasi 100% dengan WACB DIGIKIT.
              </p>
              <p className="text-xs text-gray-400">Tidak ada draft yang tertinggal di perangkat.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {d.nama_unit} ({d.kd_unit})
                      </span>
                      <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-warning-700 dark:bg-warning-500/20 dark:text-warning-400">
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tanggal: <span className="font-semibold text-gray-700 dark:text-gray-300">{d.tanggal}</span> • Jam:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{d.jam} WITA</span> • Operator:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{d.operator_name}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      ID: {d.local_id} • Mesin: {d.payload.machines.length} Unit
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="rounded-lg p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                      title="Hapus draft ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
