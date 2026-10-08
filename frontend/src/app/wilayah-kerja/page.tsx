"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  Navigation,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
} from "lucide-react";

interface RegionalOffice {
  id: string;
  name: string;
  type: "pusat" | "operasional" | "unit";
  badgeColor: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  email: string;
  phone?: string;
  region: string;
  pinCoordinates?: { top: string; left: string };
}

export default function WilayahKerjaPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string | null>("pusat");

  const kantorPusat = {
    name: "PT Pelayanan Listrik Nasional Nusa Daya",
    subtitle: "Kantor Pusat",
    address: "Jln. Letjen ZA Maulani RT 41 No 78, Damai Bahagia, Kec. Balikpapan Selatan",
    city: "Kota Balikpapan",
    province: "Kalimantan Timur",
    phone: "(0542) 8975052",
    email: "plnnd@plnnusadaya.co.id",
  };

  const regionalOffices: RegionalOffice[] = [
    {
      id: "kal-1",
      name: "Unit Pelaksana Kalimantan 1",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Parit H. Husin II, Bangka Belitung Darat, Kec. Pontianak Tenggara",
      city: "Kota Pontianak",
      province: "Kalimantan Barat",
      postalCode: "78116",
      email: "kal1@plnnusadaya.co.id",
      region: "Kalimantan",
    },
    {
      id: "kal-2",
      name: "Unit Pelaksana Kalimantan 2",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Pangeran Hidayatullah No.22, Loktabat Utara, Kec. Banjarbaru Utara",
      city: "Kota Banjar Baru",
      province: "Kalimantan Selatan",
      postalCode: "70714",
      email: "kal2@plnnusadaya.co.id",
      region: "Kalimantan",
    },
    {
      id: "kal-3",
      name: "Unit Pelaksana Kalimantan 3",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. RE Martadinata, Gunungsari Ilir, Kec. Balikpapan Tengah",
      city: "Kota Balikpapan",
      province: "Kalimantan Timur",
      postalCode: "76113",
      email: "kal3@plnnusadaya.co.id",
      region: "Kalimantan",
    },
    {
      id: "sul-1",
      name: "Unit Pelaksana Sulawesi 1",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Tikala Ares No.32, Dikrama, Guntur, Kec. Tikala",
      city: "Kota Manado",
      province: "Sulawesi Utara",
      postalCode: "95123",
      email: "sul1@plnnusadaya.co.id",
      region: "Sulawesi",
    },
    {
      id: "sul-2",
      name: "Unit Pelaksana Sulawesi 2",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Bonto Ramba No.9, Mannuruki, Kec. Tamalate",
      city: "Kota Makassar",
      province: "Sulawesi Selatan",
      postalCode: "90223",
      email: "sul2@plnnusadaya.co.id",
      region: "Sulawesi",
    },
    {
      id: "nusra",
      name: "Unit Pelaksana Nusa Tenggara",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Bung Karno No. 26, Mataram Timur, Mataram",
      city: "Kota Mataram",
      province: "Nusa Tenggara Barat",
      postalCode: "83127",
      email: "nusra@plnnusadaya.co.id",
      region: "Nusa Tenggara",
    },
    {
      id: "maluku",
      name: "Unit Pelaksana Maluku",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Said Perintah No. 53, Kel. Ahusen, Kec. Sirimau",
      city: "Kota Ambon",
      province: "Maluku",
      postalCode: "97127",
      email: "maluku@plnnusadaya.co.id",
      region: "Maluku",
    },
    {
      id: "malut",
      name: "Unit Pelaksana Maluku Utara",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Bandara Sultan Babullah, Kelurahan Tabam, Kec. Kota Ternate Utara",
      city: "Kota Ternate",
      province: "Maluku Utara",
      postalCode: "97728",
      email: "malut@plnnusadaya.co.id",
      region: "Maluku",
    },
    {
      id: "papua",
      name: "Unit Pelaksana Papua",
      type: "unit",
      badgeColor: "#ef4444",
      address: "Jl. Perum Jaya Asri, Entrop, Distrik Jayapura Selatan",
      city: "Kota Jayapura",
      province: "Papua",
      postalCode: "99223",
      email: "papua@plnnusadaya.co.id",
      region: "Papua",
    },
    {
      id: "jakarta",
      name: "Kantor Operasional Jakarta",
      type: "operasional",
      badgeColor: "#38bdf8",
      address: "Jl. Tirtayasa II No.12, RT.3/RW.2, Melawai, Kec. Kby. Baru",
      city: "Kota Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12160",
      email: "plnnd@plnnusadaya.co.id",
      region: "Jawa",
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/danantara.png"
                alt="Danantara Indonesia"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/DANANTARA1.png";
                }}
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/#about" className="hover:text-blue-600 transition-colors">
              Profil
            </Link>
            <Link href="/company-profile" className="hover:text-blue-600 transition-colors">
              Company Profile
            </Link>
            <Link href="/wilayah-kerja" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">
              Wilayah Kerja
            </Link>
            <Link href="/#services" className="hover:text-blue-600 transition-colors">
              Layanan
            </Link>
            <Link href="/#contact" className="hover:text-blue-600 transition-colors">
              Kontak Kami
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <img
              src="/images/aku-jago.png"
              alt="Aku Jago"
              className="h-8 w-auto object-contain hidden sm:block"
            />
            <img
              src="/images/logo/LOGO-PLN.png"
              alt="PLN Nusa Daya"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/plnt.png";
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb & Title Section matching reference Image 4 */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kontak Kami
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Profil &gt; Kontak Kami &amp; Wilayah Kerja
          </p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Jaringan operasional aset ketenagalistrikan PT PLN Nusa Daya tersebar strategis di Kawasan Tengah dan Timur Indonesia.
          </p>
        </div>

        {/* ============================================================
            SECTION 1: 3D ISOMETRIC MAP OF INDONESIA (Matching Image 2)
        ============================================================ */}
        <div className="mb-14 rounded-3xl bg-white p-6 sm:p-10 shadow-[0_12px_40px_rgba(20,50,90,0.06)] border border-slate-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Legend: Categories & Unit List matching Image 2 */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Kantor Pusat Balikpapan (Yellow) */}
              <div
                onClick={() => setSelectedOffice("pusat")}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedOffice === "pusat"
                    ? "bg-amber-50/70 border-amber-300 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-amber-400 flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-wide uppercase">
                      KANTOR PUSAT
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">Balikpapan</p>
                  </div>
                </div>
              </div>

              {/* Kantor Operasional Jakarta (Blue) */}
              <div
                onClick={() => setSelectedOffice("jakarta")}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedOffice === "jakarta"
                    ? "bg-sky-50/70 border-sky-300 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-sky-400 flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-wide uppercase">
                      KANTOR OPERASIONAL
                    </h3>
                    <p className="text-sm font-semibold text-slate-600">Jakarta</p>
                  </div>
                </div>
              </div>

              {/* Kantor Unit (Red Pins) */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-wide uppercase">
                    KANTOR UNIT
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  {[
                    { id: "kal-1", label: "UP KALIMANTAN 1" },
                    { id: "kal-2", label: "UP KALIMANTAN 2" },
                    { id: "kal-3", label: "UP KALIMANTAN 3" },
                    { id: "sul-1", label: "UP SULAWESI 1" },
                    { id: "sul-2", label: "UP SULAWESI 2" },
                    { id: "nusra", label: "UP NUSA TENGGARA" },
                    { id: "maluku", label: "UP MALUKU" },
                    { id: "malut", label: "UP MALUKU UTARA" },
                    { id: "papua", label: "UP PAPUA" },
                  ].map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedOffice(unit.id)}
                      className={`flex items-center gap-2 text-left py-1 px-2.5 rounded-lg transition-colors ${
                        selectedOffice === unit.id
                          ? "bg-red-500 text-white font-extrabold"
                          : "hover:bg-slate-200/80 text-slate-700"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{unit.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: 3D Isometric Map Graphic matching reference Image 2 */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 p-2 sm:p-4 border border-sky-100/80">
                <img
                  src="/images/peta-wilayah-kerja.png"
                  alt="Peta Wilayah Kerja PT PLN Nusa Daya"
                  className="w-full h-auto object-contain max-h-[460px] drop-shadow-md rounded-xl"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/hero-img3.png";
                  }}
                />
                
                {/* Floating caption badge */}
                <div className="absolute bottom-4 right-4 left-4 sm:left-auto max-w-[calc(100%-32px)] bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs text-[11px] font-bold text-slate-600 flex flex-wrap items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  <span>Cakupan 9 Unit Pelaksana &amp; Kantor Pusat</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================
            SECTION 2: KANTOR PUSAT FEATURED CARD (Matching Image 4)
        ============================================================ */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-[0_10px_35px_rgba(20,50,90,0.05)] border border-slate-200/90 relative overflow-hidden">
            {/* Top curved brand accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full pointer-events-none" />

            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {kantorPusat.name}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-1">
                {kantorPusat.subtitle}
              </p>
            </div>

            <div className="space-y-4 max-w-xl mx-auto text-sm text-slate-700">
              {/* Address */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{kantorPusat.address}</p>
                  <p className="text-xs text-slate-500">{kantorPusat.city} - {kantorPusat.province}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                  <Phone className="w-4 h-4" />
                </div>
                <a
                  href={`tel:${kantorPusat.phone.replace(/[^0-9]/g, "")}`}
                  className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  Telp {kantorPusat.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href={`mailto:${kantorPusat.email}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {kantorPusat.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 3: KANTOR REGIONAL GRID CARDS (Matching Image 4)
        ============================================================ */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Kantor Regional PT Pelayanan Listrik Nasional Nusa Daya
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Unit Pelaksana Pengelolaan Aset Ketenagalistrikan Wilayah Tengah dan Timur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionalOffices.map((office) => {
              const isSelected = selectedOffice === office.id;
              return (
                <div
                  key={office.id}
                  id={office.id}
                  className={`rounded-2xl bg-white p-6 shadow-sm border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                      : "border-slate-200/90 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  {/* Subtle top-right corner curve aesthetic matching screenshot */}
                  <div className="absolute top-0 right-0 w-14 h-14 bg-sky-50 rounded-bl-3xl pointer-events-none" />

                  <div>
                    {/* Blue Pin Icon in Circle */}
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
                      <MapPin className="w-6 h-6 stroke-[1.8]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-3">
                      {office.name}
                    </h3>

                    {/* Address Text */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {office.address}, {office.city}, {office.province} {office.postalCode}
                    </p>
                  </div>

                  {/* Email & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`mailto:${office.email}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[200px]"
                      title={office.email}
                    >
                      {office.email}
                    </a>

                    <button
                      onClick={() => handleCopy(`${office.address}, ${office.city}, ${office.province}`, office.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Salin Alamat"
                    >
                      {copiedId === office.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Link to Landing */}
        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© Copyright {new Date().getFullYear()} <strong>PT Pelayanan Listrik Nasional Nusa Daya</strong>. All Rights Reserved</p>
      </footer>

    </div>
  );
}
