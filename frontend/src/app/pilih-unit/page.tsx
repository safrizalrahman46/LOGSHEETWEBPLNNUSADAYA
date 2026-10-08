"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, ArrowRight, Search } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";
import { WACBFormatResponse, WACBUnitItem } from "@/types";

export default function PilihUnitPage() {
  const router = useRouter();
  const [units, setUnits] = useState<WACBUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("ALL");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await apiClient.get<WACBFormatResponse>("/wacb/units", {
          params: { kd_region: "05" },
        });
        if (res.data?.units) {
          setUnits(res.data.units);
        }
      } catch (err) {
        console.error("Failed to load units:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleSelectUnit = (unit: WACBUnitItem) => {
    localStorage.setItem(
      "pln_selected_unit",
      JSON.stringify({
        kd_unit: unit.kd_unit,
        nama_unit: unit.nama_unit,
        kd_area: unit.kd_area,
        nama_area: unit.nama_area,
      })
    );
    router.push("/dashboard");
  };

  const areas = Array.from(new Set(units.map((u) => u.nama_area).filter(Boolean)));

  const filteredUnits = units.filter((u) => {
    const matchSearch =
      u.nama_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.kd_unit.includes(searchQuery);
    const matchArea = selectedArea === "ALL" || u.nama_area === selectedArea;
    return matchSearch && matchArea;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Pilih Unit Layanan PLTD (ULD)
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Wilayah Regional Kalimantan 3 (Kalimantan Timur & Kalimantan Utara)
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama unit atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Area Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedArea("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedArea === "ALL"
                ? "bg-brand-500 text-white shadow-theme-xs"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Semua Area
          </button>
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedArea(a)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedArea === a
                  ? "bg-brand-500 text-white shadow-theme-xs"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Unit Grid Cards */}
        {loading ? (
          <div className="py-20 text-center text-xs font-semibold text-gray-400">
            Mengambil daftar unit dari server WACB...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {filteredUnits.map((u) => (
              <div
                key={u.kd_unit}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition-all hover:border-brand-500/50 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      KODE: {u.kd_unit}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {u.nama_area || "KAL-3"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-brand-500 dark:text-white">
                      {u.nama_unit}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Wilayah Kalimantan 3 (kd_region: 05)
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-gray-100 pt-3.5 dark:border-gray-800">
                  <button
                    onClick={() => handleSelectUnit(u)}
                    className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/25"
                    title="Jadikan unit aktif lalu ke dashboard"
                  >
                    Pilih Unit
                  </button>
                  <Link
                    href={`/unit/${u.kd_unit}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400"
                  >
                    Lihat Detail
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
