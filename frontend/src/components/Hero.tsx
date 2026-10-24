"use client";

import React from "react";
import Link from "next/link";

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section
      id="home"
      className="hero relative w-full overflow-hidden min-h-[90vh] md:min-h-[85vh] lg:min-h-screen flex items-center bg-white dark:bg-[#0c111d]"
    >
      {/* 1. FULLSCREEN VIDEO BACKGROUND */}
      <video
        className="hero-bg-video absolute inset-0 h-full w-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          transform: "translate3d(0, 0, 0)",
          WebkitTransform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <source src="/videos/hero-corp.mp4" type="video/mp4" />
        <source src="/images/hero-corp.mp4" type="video/mp4" />
        <source src="/images/GIF1.mp4" type="video/mp4" />
      </video>

      {/* 2. SEAMLESS NATURAL DIRECTIONAL GRADIENT OVERLAY (No box, smooth left-to-right fade) */}
      <div
        className="hero-overlay absolute inset-0 z-[1] pointer-events-none transition-all duration-300"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 32%, rgba(255, 255, 255, 0.60) 55%, rgba(255, 255, 255, 0.15) 75%, rgba(255, 255, 255, 0.0) 90%), linear-gradient(0deg, rgba(255, 255, 255, 1.0) 0%, rgba(255, 255, 255, 0.3) 15%, rgba(255, 255, 255, 0.0) 40%)",
        }}
      />
      <div
        className="hero-overlay-dark absolute inset-0 z-[1] pointer-events-none hidden dark:block transition-all duration-300"
        style={{
          background:
            "linear-gradient(90deg, rgba(12, 17, 29, 0.97) 0%, rgba(12, 17, 29, 0.90) 32%, rgba(12, 17, 29, 0.60) 55%, rgba(12, 17, 29, 0.15) 75%, rgba(12, 17, 29, 0.0) 90%), linear-gradient(0deg, rgba(12, 17, 29, 1.0) 0%, rgba(12, 17, 29, 0.4) 15%, rgba(12, 17, 29, 0.0) 40%)",
        }}
      />

      {/* 3. HERO CONTENT CONTAINER (Natural left-aligned layout, NOT in a card box) */}
      <div className="hero-container relative z-10 mx-auto flex w-full max-w-[1320px] items-center px-6 sm:px-10 lg:px-16 pt-[90px] pb-14 min-h-[90vh] md:min-h-[85vh] lg:min-h-screen">
        <div className="hero-content relative w-full max-w-[680px] lg:max-w-[55%] text-left">
          {/* Corporate Mini Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            TRANSFORMASI ENERGI &amp; DIGITALISASI PEMBANGKIT
          </div>

          {/* Main Title - Solid, crisp colors without white text-shadow artifacts */}
          <h1 className="hero-title text-[38px] sm:text-[48px] lg:text-[56px] xl:text-[62px] font-black leading-[1.12] tracking-[-0.03em] mb-6 animate-hero-title">
            <span className="block text-[#002747] dark:text-white">
              PT Pelayanan Listrik
            </span>
            <span className="block text-[#005daa] dark:text-[#38bdf8] mt-1">
              Nasional Nusa Daya
            </span>
          </h1>

          {/* Subtitle Description - Clean readable slate */}
          <p className="hero-subtitle text-[#334155] dark:text-[#cbd5e1] text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.7] mb-9 font-normal animate-hero-desc max-w-[560px]">
            Perusahaan Pengelola Aset Ketenagalistrikan Terkemuka di Wilayah Tengah dan Timur Indonesia dan tumbuh berkelanjutan.
          </p>

          {/* CTA Action Buttons */}
          <div className="hero-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-hero-actions">
            <a
              href="#about"
              onClick={(e) => {
                if (onGetStarted) {
                  e.preventDefault();
                  onGetStarted();
                }
              }}
              className="btn-hero-outline inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[#0284c7] text-[#0284c7] dark:text-[#38bdf8] bg-white/90 dark:bg-slate-900/80 hover:bg-[#0284c7] hover:text-white dark:hover:bg-[#0284c7] dark:hover:text-white font-bold text-[15px] tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-sky-500/20 hover:-translate-y-0.5 cursor-pointer text-center"
              id="getStartedBtn"
            >
              Get Started
            </a>

            <Link
              href="/dashboard"
              className="btn-hero-portal inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#0284c7] to-[#004581] hover:from-[#0369a1] hover:to-[#003366] text-white font-bold text-[15px] tracking-wide transition-all duration-300 shadow-md shadow-sky-900/20 hover:shadow-lg hover:shadow-sky-900/30 hover:-translate-y-0.5 text-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Portal Logsheet
            </Link>
          </div>
        </div>
      </div>

      {/* Component Styles & Animations */}
      <style jsx>{`
        .hero-title,
        .hero-title span,
        .hero-subtitle {
          text-shadow: none !important;
        }
        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-hero-title {
          animation: heroFadeUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-hero-desc {
          animation: heroFadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        .hero-bg-video {
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          image-rendering: auto;
        }
        .animate-hero-actions {
          animation: heroFadeUp 0.95s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
      `}</style>
    </section>
  );
}
