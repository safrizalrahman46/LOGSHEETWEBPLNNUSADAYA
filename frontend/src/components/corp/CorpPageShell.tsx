"use client";

import Link from "next/link";
import CorpNavbar from "./CorpNavbar";
import CorpDocBody from "./CorpDocBody";
import { CorpDoc } from "@/lib/corp-content";

/* ============================================================
   Shell for every dedicated header page
   (nav-container-corp header + breadcrumb + document body)
   ============================================================ */

interface Crumb {
  label: string;
  href?: string;
}

interface CorpPageShellProps {
  doc: CorpDoc;
  crumbs: Crumb[];
  related?: { label: string; href: string }[];
}

export default function CorpPageShell({ doc, crumbs, related = [] }: CorpPageShellProps) {
  return (
    <div className="corp-page">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .corp-page {
          --primary: #1a9de1;
          --primary-dk: #1178b5;
          --primary-lt: #e8f6fd;
          --text: #334155;
          --text-light: #64748b;
          --nav-h: 76px;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--text);
        }
        .corp-page h1, .corp-page h2, .corp-page h3, .corp-page h4, .corp-page p { margin: 0; }
        .corp-main {
          padding-top: calc(var(--nav-h) + 34px);
          padding-bottom: 72px;
        }
        .corp-hero {
          background: linear-gradient(135deg, #0f172a 0%, #0c4a6e 55%, #0284c7 100%);
          padding: 44px 0 76px;
          position: relative;
          overflow: hidden;
        }
        .corp-hero::after {
          content: '';
          position: absolute; inset: auto 0 -1px 0; height: 70px;
          background: linear-gradient(to bottom, transparent, #f8fafc);
          pointer-events: none;
        }
        .corp-wrap {
          max-width: 1100px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }
        .corp-crumbs {
          display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
          font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,.75);
          margin-bottom: 18px;
        }
        .corp-crumbs a { color: rgba(255,255,255,.75); text-decoration: none; transition: color .2s; }
        .corp-crumbs a:hover { color: #ffffff; }
        .corp-crumbs .sep { opacity: .5; }
        .corp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
        .corp-chip {
          font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase;
          padding: 4px 10px; border-radius: 6px;
          background: rgba(255,255,255,.14); color: #e0f2fe;
          border: 1px solid rgba(255,255,255,.22);
        }
        .corp-chip.alt { background: rgba(224,242,254,.9); color: #0369a1; border-color: transparent; }
        .corp-hero h1 {
          font-size: clamp(26px, 3.4vw, 40px); font-weight: 800; color: #ffffff;
          line-height: 1.25; max-width: 900px; letter-spacing: -.5px;
        }
        .corp-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, .07);
          padding: 34px 36px; margin-top: -44px; position: relative; z-index: 3;
        }
        .corp-note {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
          margin-top: 26px; padding-top: 20px; border-top: 1px solid #f1f5f9;
          font-size: 12.5px; color: #64748b;
        }
        .corp-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 22px; border-radius: 9999px; background: var(--primary);
          color: #fff; font-size: 13px; font-weight: 700; text-decoration: none;
          transition: all .25s ease;
        }
        .corp-btn:hover { background: var(--primary-dk); transform: translateY(-2px); }
        .corp-btn.ghost {
          background: #fff; color: var(--primary); border: 1.5px solid var(--primary);
        }
        .corp-btn.ghost:hover { background: var(--primary-lt); }
        .corp-related { margin-top: 34px; }
        .corp-related h4 {
          font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px;
          color: #94a3b8; margin-bottom: 12px;
        }
        .corp-related-list { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; }
        .corp-related-list a {
          display: block; padding: 9px 16px; border-radius: 9999px;
          background: #f1f5f9; color: #334155; font-size: 13px; font-weight: 600;
          text-decoration: none; border: 1px solid #e2e8f0; transition: all .2s;
        }
        .corp-related-list a:hover {
          background: var(--primary-lt); color: var(--primary); border-color: var(--primary);
          transform: translateY(-2px);
        }
        .corp-footer { background: #ffffff; border-top: 1px solid #e2e8f0; padding: 48px 0 0; }
        .corp-footer-grid {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 36px;
        }
        .corp-footer h5 {
          font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .7px;
          color: #0f172a; margin-bottom: 14px;
        }
        .corp-footer ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .corp-footer a { color: #64748b; font-size: 13.5px; text-decoration: none; transition: color .2s; }
        .corp-footer a:hover { color: var(--primary); }
        .corp-footer p { font-size: 13.5px; color: #64748b; line-height: 1.7; }
        .corp-copy {
          margin-top: 38px; border-top: 1px solid #f1f5f9; padding: 22px 32px; text-align: center;
          font-size: 13px; color: #64748b;
        }
        @media (max-width: 900px) {
          .corp-footer-grid { grid-template-columns: 1fr; }
          .corp-card { padding: 26px 20px; }
        }
      `}</style>

      <CorpNavbar />

      <main className="corp-main">
        <section className="corp-hero">
          <div className="corp-wrap">
            <nav className="corp-crumbs" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={`${c.label}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {i > 0 && <span className="sep">/</span>}
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span style={{ color: "#ffffff" }}>{c.label}</span>}
                </span>
              ))}
            </nav>

            <div className="corp-chips">
              {doc.category && <span className="corp-chip alt">{doc.category}</span>}
              {doc.badge && <span className="corp-chip">{doc.badge}</span>}
            </div>

            <h1>{doc.title}</h1>
          </div>
        </section>

        <div className="corp-wrap">
          <article className="corp-card">
            <CorpDocBody doc={doc} />

            <div className="corp-note">
              <span>🔒 Dokumen Resmi PT PLN Nusa Daya (PLN Group)</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/" className="corp-btn ghost">← Kembali ke Beranda</Link>
                <Link href="/berita" className="corp-btn">Lihat Berita Terkini</Link>
              </div>
            </div>

            {related.length > 0 && (
              <div className="corp-related">
                <h4>Dokumen Lainnya</h4>
                <ul className="corp-related-list">
                  {related.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href}>{r.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </main>

      <footer className="corp-footer">
        <div className="corp-footer-grid">
          <div>
            <img
              src="/images/logo/LOGO-PLN.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/plnt.png";
              }}
              alt="PLN Nusa Daya"
              style={{ height: 44, width: "auto", objectFit: "contain", marginBottom: 14 }}
            />
            <p>
              PT Pelayanan Listrik Nasional Nusa Daya — anak perusahaan PT PLN (Persero) yang mengelola aset
              ketenagalistrikan, jasa O&M pembangkit, transmisi, distribusi, dan pelayanan pelanggan di Kawasan
              Timur Indonesia.
            </p>
          </div>

          <div>
            <h5>Tautan Cepat</h5>
            <ul>
              <li><Link href="/#about">Tentang Kami</Link></li>
              <li><Link href="/#direksi">Profil Direksi</Link></li>
              <li><Link href="/wilayah-kerja">Wilayah Kerja</Link></li>
              <li><Link href="/company-profile">Company Profile</Link></li>
              <li><Link href="/berita">Berita &amp; Artikel</Link></li>
            </ul>
          </div>

          <div>
            <h5>Hubungi Kami</h5>
            <ul>
              <li>
                <a href="https://maps.google.com/?q=Jln.+Letjen+ZA+Maulani+RT+41+No+78+Balikpapan" target="_blank" rel="noreferrer">
                  Jln. Letjen ZA Maulani RT 41 No 78, Balikpapan — Kalimantan Timur
                </a>
              </li>
              <li><a href="mailto:plnnd@plnnusadaya.co.id">plnnd@plnnusadaya.co.id</a></li>
              <li><a href="tel:+625428975052">Telp (0542) 8975052</a></li>
            </ul>
          </div>
        </div>

        <div className="corp-copy">
          © Copyright {new Date().getFullYear()} <strong>PT Pelayanan Listrik Nasional Nusa Daya</strong>. All
          Rights Reserved
        </div>
      </footer>
    </div>
  );
}
