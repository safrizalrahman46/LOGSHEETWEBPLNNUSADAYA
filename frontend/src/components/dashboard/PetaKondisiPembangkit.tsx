"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  RotateCw,
  Search,
  Maximize2,
  MapPin,
  ExternalLink,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
} from "lucide-react";
import { apiClient } from "@/lib/api";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  (typeof window !== "undefined"
    ? window.atob(
        "cGsuZXlKMUlqb2lZVzVoYzIxcGMySmhhQ0lzSW1FaU9pSmpiR3hrTkRCdGRYVXdObWx5TTNGd2EycG1ZV0prTVhOaUluMC55SmVybk5iSjdlNUt1U1g3SFlHYWln"
      )
    : "");

interface UnitFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    locationId: string;
    title: string;
    description?: string;
    url_detail?: string;
    group?: string;
    region?: string;
    area: string;
    marker_color: string;
    dmp: string | number;
    bp: string | number;
    cad: string | number;
    status: "Normal" | "Siaga" | "Defisit" | "Belum Lapor" | string;
    jumlah_mesin?: number;
  };
}

interface MapKondisiResponse {
  success?: boolean;
  tanggal?: string;
  geoJson: {
    type: "FeatureCollection";
    features: UnitFeature[];
  };
}

interface PetaKondisiProps {
  onSelectUnit?: (unit: { kd_unit: string; nama_unit: string }) => void;
}

export function PetaKondisiPembangkit({ onSelectUnit }: PetaKondisiProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [features, setFeatures] = useState<UnitFeature[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("SEMUA");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("SEMUA");
  const [activeDateStr, setActiveDateStr] = useState<string>("");

  // Format tanggal Indonesia: "Selasa, 03 November 2026"
  useEffect(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      };
      setActiveDateStr(now.toLocaleDateString("id-ID", options));
    } catch {
      setActiveDateStr("Hari ini");
    }
  }, []);

  // Ambil data peta kondisi dari backend API
  const fetchMapData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get<MapKondisiResponse>("/wacb/maps-kondisi");
      if (res.data?.geoJson?.features) {
        setFeatures(res.data.geoJson.features);
      }
    } catch (err) {
      console.error("Gagal memuat peta kondisi pembangkit:", err);
      setErrorMsg("Gagal memuat status live pembangkit. Menggunakan basis data Kalimantan 3.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 5 * 60 * 1000); // refresh tiap 5 menit
    return () => clearInterval(interval);
  }, []);

  // Filter unit berdasarkan Area & Search text
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const p = feat.properties;
      const matchSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.locationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchArea =
        selectedArea === "SEMUA" ||
        p.area.toUpperCase().includes(selectedArea.toUpperCase());

      const matchStatus =
        selectedStatusFilter === "SEMUA" ||
        p.status.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchSearch && matchArea && matchStatus;
    });
  }, [features, searchQuery, selectedArea, selectedStatusFilter]);

  // Statistik summary
  const statusStats = useMemo(() => {
    let normal = 0;
    let siaga = 0;
    let defisit = 0;
    let belumLapor = 0;

    features.forEach((f) => {
      const s = f.properties.status;
      if (s === "Normal") normal++;
      else if (s === "Siaga") siaga++;
      else if (s === "Defisit") defisit++;
      else belumLapor++;
    });

    return { total: features.length, normal, siaga, defisit, belumLapor };
  }, [features]);

  // Inisialisasi Mapbox GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const defaultCenter: [number, number] = [116.85, 1.75]; // Pusat Kalimantan Timur & Utara
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: defaultCenter,
      zoom: 5.5,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("load", () => {
      map.resize();
    });

    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Gambar / Perbarui markers pada peta saat filteredFeatures berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Bersihkan marker lama
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (filteredFeatures.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    filteredFeatures.forEach((feat) => {
      const coords = feat.geometry.coordinates;
      const p = feat.properties;

      bounds.extend(coords);

      // Buat elemen HTML custom marker persis style WACB
      const markerEl = document.createElement("div");
      markerEl.className = "custom-marker circle-marker";
      markerEl.style.width = "18px";
      markerEl.style.height = "18px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.cursor = "pointer";
      markerEl.style.border = "2px solid rgba(255, 255, 255, 0.95)";
      markerEl.style.backgroundColor = p.marker_color || "#b6bbc4";
      markerEl.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

      if (p.status === "Normal") {
        markerEl.classList.add("pulse-normal");
      } else if (p.status === "Siaga") {
        markerEl.classList.add("pulse-siaga");
      } else if (p.status === "Defisit") {
        markerEl.classList.add("pulse-defisit");
      }

      // Format nilai DMP, BP, CAD
      const dmpStr = typeof p.dmp === "number" ? `${p.dmp} kW` : p.dmp || "0 kW";
      const bpStr = typeof p.bp === "number" ? `${p.bp} kW` : p.bp || "0 kW";
      const cadStr = typeof p.cad === "number" ? `${p.cad} kW` : p.cad || "0 kW";

      // Status pill color
      let badgeBg = "#b6bbc4";
      let badgeText = "#ffffff";
      if (p.status === "Normal") {
        badgeBg = "#59ce8f";
        badgeText = "#064e3b";
      } else if (p.status === "Siaga") {
        badgeBg = "#f4ce14";
        badgeText = "#78350f";
      } else if (p.status === "Defisit") {
        badgeBg = "#ff3266";
        badgeText = "#ffffff";
      }

      // Popup HTML yang kaya fitur, bersih, dan sesuai standar Metronic WACB
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 250px; max-width: 280px; padding: 0;">
          <div style="background: #005daa; color: white; padding: 10px 14px; border-radius: 10px 10px 0 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <h4 style="margin: 0; font-size: 13px; font-weight: 800; letter-spacing: -0.01em;">${p.title}</h4>
              <span style="font-size: 10px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-weight: 700;">${p.locationId}</span>
            </div>
            <div style="font-size: 10px; opacity: 0.85; margin-top: 2px;">${p.area} • ${p.region || "KALIMANTAN 3"}</div>
          </div>
          
          <div style="padding: 12px 14px; background: #ffffff;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Kondisi:</span>
              <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; background: ${badgeBg}; color: ${badgeText};">
                ${p.status}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 4px; margin-bottom: 12px;">
              <div style="border-right: 1px solid #e2e8f0;">
                <div style="font-size: 13px; font-weight: 900; color: #10b981;">${dmpStr}</div>
                <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">DMP</div>
              </div>
              <div style="border-right: 1px solid #e2e8f0;">
                <div style="font-size: 13px; font-weight: 900; color: #f59e0b;">${bpStr}</div>
                <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">BP</div>
              </div>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #0284c7;">${cadStr}</div>
                <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">CAD</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <a href="/logsheet/matrix?unit=${p.locationId}" 
                 style="display: block; text-align: center; background: #005daa; color: white; padding: 6px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; text-decoration: none; transition: background 0.2s;">
                Buka Matriks 48 Slot Unit Ini &rarr;
              </a>
              <a href="/logsheet/input?unit=${p.locationId}" 
                 style="display: block; text-align: center; background: #f1f5f9; color: #334155; padding: 5px 10px; border-radius: 6px; font-weight: 600; font-size: 10px; text-decoration: none; border: 1px solid #cbd5e1;">
                Form Input Logsheet
              </a>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        offset: 15,
        className: "custom-mapbox-popup",
      }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      // Handler klik marker untuk sinkronisasi state unit bila ada callback
      markerEl.addEventListener("click", () => {
        if (onSelectUnit) {
          onSelectUnit({ kd_unit: p.locationId, nama_unit: p.title });
        }
      });

      markersRef.current.push(marker);
    });

    // Auto-fit zoom bila user memfilter spesifik
    if (selectedArea !== "SEMUA" || searchQuery.trim() !== "") {
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 1000 });
      }
    }
  }, [filteredFeatures, onSelectUnit, selectedArea, searchQuery]);

  // Handler fly-to area
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (area === "SEMUA") {
      map.flyTo({ center: [116.85, 1.75], zoom: 5.5, duration: 1200 });
    } else if (area === "BONTANG") {
      map.flyTo({ center: [117.2, 0.5], zoom: 7.5, duration: 1200 });
    } else if (area === "BERAU") {
      map.flyTo({ center: [117.8, 1.9], zoom: 7.2, duration: 1200 });
    } else if (area === "SAMARINDA") {
      map.flyTo({ center: [115.8, 0.2], zoom: 7.2, duration: 1200 });
    } else if (area === "KALTARA") {
      map.flyTo({ center: [116.2, 3.6], zoom: 7.2, duration: 1200 });
    } else if (area === "BALIKPAPAN") {
      map.flyTo({ center: [116.5, -0.8], zoom: 7.5, duration: 1200 });
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-theme-xs transition-colors">
      {/* CSS Pulse Animations matching WACB specification */}
      <style jsx global>{`
        .pulse-normal {
          animation: pulse-animation-normal 2s infinite;
        }
        @keyframes pulse-animation-normal {
          0% {
            box-shadow: 0 0 0 0 rgba(89, 206, 143, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(89, 206, 143, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(89, 206, 143, 0);
          }
        }

        .pulse-siaga {
          animation: pulse-animation-siaga 2s infinite;
        }
        @keyframes pulse-animation-siaga {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 206, 20, 0.5);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(244, 206, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 206, 20, 0);
          }
        }

        .pulse-defisit {
          animation: pulse-animation-defisit 1.5s infinite;
        }
        @keyframes pulse-animation-defisit {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 50, 102, 0.6);
          }
          70% {
            box-shadow: 0 0 0 16px rgba(255, 50, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 50, 102, 0);
          }
        }

        .custom-mapbox-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .custom-mapbox-popup .mapboxgl-popup-close-button {
          color: #ffffff !important;
          font-size: 16px !important;
          padding: 4px 8px !important;
          right: 4px !important;
          top: 4px !important;
        }
      `}</style>

      {/* Header Card Metronic Style */}
      <div className="border-b border-gray-100 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#005daa]">
                <MapPin className="h-4 w-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Peta Kondisi Pembangkit
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
                Live Mapbox
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Monitoring kondisi pembangkit berdasarkan data status kelistrikan unit Kalimantan 3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {/* Tanggal Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs text-gray-700 font-medium">
              <span className="font-bold text-gray-900">Data per :</span>
              <span>{activeDateStr || "Memuat..."}</span>
            </div>

            {/* Tombol Reload */}
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-theme-xs hover:bg-gray-50 active:scale-95 disabled:opacity-50"
              title="Perbarui data peta sekarang"
            >
              <RotateCw className={`h-3.5 w-3.5 text-[#005daa] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Legend Box persis WACB */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/90 bg-gray-50/80 p-3.5">
          <div>
            <div className="text-xs font-bold text-gray-800">Keterangan Status</div>
            <div className="text-[11px] text-gray-500">
              Warna marker menunjukkan kondisi pembangkit pada peta.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700">
            <button
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Normal" ? "SEMUA" : "Normal")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                selectedStatusFilter === "Normal" ? "bg-emerald-100 ring-1 ring-emerald-300" : "hover:bg-white"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(89,206,143,0.9)] ring-2 ring-emerald-200" />
              <span>Normal ({statusStats.normal})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Siaga" ? "SEMUA" : "Siaga")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                selectedStatusFilter === "Siaga" ? "bg-amber-100 ring-1 ring-amber-300" : "hover:bg-white"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(244,206,20,0.9)] ring-2 ring-amber-200" />
              <span>Siaga ({statusStats.siaga})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Defisit" ? "SEMUA" : "Defisit")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                selectedStatusFilter === "Defisit" ? "bg-rose-100 ring-1 ring-rose-300" : "hover:bg-white"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,50,102,0.9)] ring-2 ring-rose-200" />
              <span>Defisit ({statusStats.defisit})</span>
            </button>

            <button
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === "Belum Lapor" ? "SEMUA" : "Belum Lapor")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                selectedStatusFilter === "Belum Lapor" ? "bg-gray-200 ring-1 ring-gray-400" : "hover:bg-white"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(182,187,196,0.9)] ring-2 ring-gray-300" />
              <span>Belum Lapor ({statusStats.belumLapor})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Area Tabs & Search Input */}
        <div className="mt-3.5 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "SEMUA", label: "Semua Area (30)" },
              { id: "BONTANG", label: "Site Bontang" },
              { id: "BERAU", label: "Site Berau" },
              { id: "SAMARINDA", label: "Area Samarinda" },
              { id: "KALTARA", label: "Area Kaltara" },
              { id: "BALIKPAPAN", label: "Balikpapan & Lain" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleAreaChange(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  selectedArea === tab.id
                    ? "bg-[#005daa] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau kode unit..."
              className="w-full rounded-xl border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#005daa] focus:outline-none focus:ring-1 focus:ring-[#005daa]"
            />
          </div>
        </div>
      </div>

      {/* Map Container Area */}
      <div className="relative h-[480px] sm:h-[560px] w-full bg-[#f8fafc]">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-xs">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 shadow-theme-md">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#005daa]" />
              <div>
                <p className="text-xs font-extrabold text-gray-900">Mengambil data peta...</p>
                <p className="text-[11px] text-gray-500">Kondisi 30 unit pembangkit sedang dimuat.</p>
              </div>
            </div>
          </div>
        )}

        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Floating Quick Summary on Map */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 rounded-xl border border-gray-200/90 bg-white/95 p-2 shadow-theme-sm backdrop-blur-xs">
          <span className="text-[11px] font-bold text-gray-700 px-1">Total: {filteredFeatures.length} Unit</span>
          <span className="h-3 w-px bg-gray-200" />
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            ● {statusStats.normal} Normal
          </span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            ● {statusStats.siaga} Siaga
          </span>
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            ● {statusStats.defisit} Defisit
          </span>
          <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
            ● {statusStats.belumLapor} Belum Lapor
          </span>
        </div>
      </div>
    </div>
  );
}
