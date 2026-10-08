"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  FileText,
} from "lucide-react";

export default function CompanyProfilePage() {
  const totalPages = 43;
  // Current left page index (1-based). Starts at page 4 to match reference or page 2/3 spread, or page 1.
  // When at page 1, we can show cover on right or centered.
  // By default let's start at page 4 as in the user screenshot Image 3, or page 1 with smooth navigation.
  const [currentPage, setCurrentPage] = useState<number>(4);
  const [isFlipping, setIsFlipping] = useState<"next" | "prev" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage >= totalPages) return;
    setIsFlipping("next");
    setTimeout(() => {
      setCurrentPage((prev) => Math.min(totalPages, prev + 2));
      setIsFlipping(null);
    }, 280);
  };

  const handlePrev = () => {
    if (currentPage <= 1) return;
    setIsFlipping("prev");
    setTimeout(() => {
      setCurrentPage((prev) => Math.max(1, prev - 2));
      setIsFlipping(null);
    }, 280);
  };

  const toggleFullscreen = () => {
    if (!bookContainerRef.current) return;
    if (!document.fullscreenElement) {
      bookContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Determine left and right page numbers
  const leftPageNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  const rightPageNum = leftPageNum + 1 <= totalPages ? leftPageNum + 1 : null;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans selection:bg-blue-100">
      
      {/* Top Navbar matching official PLN portal */}
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
            <Link href="/company-profile" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">
              Company Profile
            </Link>
            <Link href="/wilayah-kerja" className="hover:text-blue-600 transition-colors">
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

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section matching reference Image 3 */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Profile
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            PT Pelayanan Listrik Nasional Nusa Daya
          </p>

          {/* "Buka PDF" button matching reference Image 3 */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="/company-profile.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 bg-white px-5 py-2 text-xs font-bold text-blue-600 shadow-xs hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Buka PDF</span>
            </a>
            <a
              href="/company-profile.pdf"
              download="Company-Profile-PLN-Nusa-Daya-2026.pdf"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh PDF</span>
            </a>
          </div>
        </div>

        {/* ============================================================
            FLIPBOOK CONTAINER (2-Page Open Book with Spine Shadow)
        ============================================================ */}
        <div
          ref={bookContainerRef}
          className={`relative rounded-3xl bg-slate-200/60 p-4 sm:p-8 backdrop-blur-sm border border-slate-300/70 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all ${
            isFullscreen ? "fixed inset-0 z-50 rounded-none bg-slate-900 p-6 flex flex-col justify-between" : ""
          }`}
        >
          {/* Top book toolbar */}
          <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>
                Halaman {leftPageNum} {rightPageNum ? `& ${rightPageNum}` : ""} dari {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 rounded-lg bg-white text-[11px] font-bold shadow-xs border border-slate-200 hover:bg-slate-50"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200 hover:bg-slate-50"
                title="Layar Penuh"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Book Spread Viewport */}
          <div className="relative flex items-center justify-center overflow-hidden py-2">
            
            {/* The 2-Page Book Spread */}
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
              className="relative flex flex-col md:flex-row items-center justify-center max-w-5xl w-full shadow-[0_25px_60px_rgba(0,0,0,0.22)] rounded-2xl bg-white border border-slate-300"
            >
              {/* Left Page */}
              <div className="relative w-full md:w-1/2 aspect-[1/1.414] bg-white overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl border-b md:border-b-0 md:border-r border-slate-200 select-none">
                <img
                  src={`/company-profile-pages/page-${leftPageNum}.jpg`}
                  alt={`Company Profile Page ${leftPageNum}`}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isFlipping === "prev" ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
                  }`}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/company-profile-pages/page-4.jpg";
                  }}
                />
                {/* Book Spine Crease Shadow on inner edge (right side of left page) */}
                <div className="absolute inset-y-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-black/25 via-black/10 to-transparent hidden md:block" />
                {/* Page number badge */}
                <div className="absolute bottom-3 left-4 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {leftPageNum}
                </div>
              </div>

              {/* Right Page */}
              {rightPageNum && (
                <div className="relative w-full md:w-1/2 aspect-[1/1.414] bg-white overflow-hidden rounded-b-2xl md:rounded-b-none md:rounded-r-2xl select-none">
                  <img
                    src={`/company-profile-pages/page-${rightPageNum}.jpg`}
                    alt={`Company Profile Page ${rightPageNum}`}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isFlipping === "next" ? "opacity-70 scale-[0.98]" : "opacity-100 scale-100"
                    }`}
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/company-profile-pages/page-5.jpg";
                    }}
                  />
                  {/* Book Spine Crease Shadow on inner edge (left side of right page) */}
                  <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-black/25 via-black/10 to-transparent hidden md:block" />
                  {/* Page number badge */}
                  <div className="absolute bottom-3 right-4 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {rightPageNum}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ============================================================
              NAVIGATION CONTROLS (Matching Image 3: Previous, Page X of 43, Next)
          ============================================================ */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-6">
              <button
                onClick={handlePrev}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 text-white px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-sm font-bold text-slate-800">
                Page {leftPageNum} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 text-white px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction hint matching reference Image 3 */}
            <p className="text-xs text-slate-500 font-medium text-center">
              Gunakan tombol navigasi atau tombol panah kiri dan kanan pada keyboard.
            </p>

            {/* Quick Page Slider */}
            <div className="w-full max-w-md flex items-center gap-3 mt-2">
              <span className="text-[11px] font-bold text-slate-400">1</span>
              <input
                type="range"
                min="1"
                max={totalPages}
                step="2"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 h-1.5 bg-slate-300 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-400">{totalPages}</span>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© Copyright {new Date().getFullYear()} <strong>PT Pelayanan Listrik Nasional Nusa Daya</strong>. All Rights Reserved</p>
      </footer>

    </div>
  );
}
