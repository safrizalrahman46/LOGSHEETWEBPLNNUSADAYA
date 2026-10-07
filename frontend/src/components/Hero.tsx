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
      className="hero relative w-full overflow-hidden min-h-[90vh] md:min-h-[85vh] lg:min-h-screen flex items-center bg-white"
    >
      {/* 1. FULLSCREEN VIDEO BACKGROUND (Hardware-accelerated Crisp 1080p) */}
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

      {/* 2. VERTICAL GRADIENT OVERLAY (Bawah 100% ke Atas 0% Jernih - Kurangi Opacity) */}
      <div
        className="hero-overlay absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(255, 255, 255, 1.0) 0%, rgba(255, 255, 255, 0.78) 18%, rgba(255, 255, 255, 0.35) 42%, rgba(255, 255, 255, 0.10) 65%, rgba(255, 255, 255, 0.0) 85%, rgba(255, 255, 255, 0.0) 100%)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      />

      {/* 3. HERO CONTENT CONTAINER (Centered max-width, left-aligned typography) */}
      <div className="hero-container relative z-10 mx-auto flex w-full max-w-[1280px] items-center px-6 sm:px-8 lg:px-12 pt-[90px] pb-14 min-h-[90vh] md:min-h-[85vh] lg:min-h-screen">
        <div className="hero-content w-full max-w-[720px] lg:max-w-[55%] text-left">
          {/* Main Title */}
          <h1
            className="hero-title text-[#17182D] text-[36px] sm:text-[46px] lg:text-[54px] xl:text-[60px] font-extrabold leading-[1.12] tracking-[-0.02em] mb-6 animate-hero-title"
            style={{ textShadow: "0 1px 12px rgba(255, 255, 255, 0.85), 0 0 2px rgba(255, 255, 255, 0.9)" }}
          >
            PT Pelayanan Listrik<br />
            Nasional Nusa Daya
          </h1>

          {/* Subtitle Description */}
          <p
            className="hero-subtitle text-[#1e293b] text-[16px] sm:text-[17px] lg:text-[18px] leading-[1.72] mb-9 font-medium animate-hero-desc"
            style={{ textShadow: "0 1px 8px rgba(255, 255, 255, 0.85)" }}
          >
            Perusahaan Pengelola Aset Ketenagalistrikan<br className="hidden sm:inline" />
            Terkemuka di Wilayah Tengah dan Timur Indonesia dan<br className="hidden sm:inline" />
            tumbuh berkelanjutan
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
              className="btn-hero-outline inline-flex items-center justify-center px-9 py-3.5 rounded-full border-2 border-[#1a9de1] text-[#1a9de1] bg-white/85 hover:bg-[#1a9de1] hover:text-white font-semibold text-[15px] tracking-wide transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#1a9de1]/25 hover:-translate-y-0.5 cursor-pointer text-center"
              id="getStartedBtn"
            >
              Get Started
            </a>

            <Link
              href="/dashboard"
              className="btn-hero-portal inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1a9de1] to-[#005daa] hover:from-[#1588c4] hover:to-[#004a88] text-white font-semibold text-[15px] tracking-wide transition-all duration-300 shadow-lg shadow-[#1a9de1]/25 hover:shadow-xl hover:shadow-[#1a9de1]/40 hover:-translate-y-0.5 text-center"
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
