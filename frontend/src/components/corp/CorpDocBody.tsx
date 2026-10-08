"use client";

import Link from "next/link";
import { CorpDoc } from "@/lib/corp-content";

/* ============================================================
   Corporate document body — renders the authentic PLN Nusa Daya
   layout for a single doc (visi-misi, tata-nilai, standard, ...)
   ============================================================ */

interface CorpDocBodyProps {
  doc: CorpDoc;
}

export default function CorpDocBody({ doc }: CorpDocBodyProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* 1. TENTANG KAMI */}
              {doc.type === "tentang-kami" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>
                        Dasar Pembentukan (2003)
                      </span>
                      <p style={{ fontSize: "12px", color: "#1e3a8a", marginTop: 4, lineHeight: 1.5 }}>
                        {doc.sk1}
                      </p>
                    </div>

                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                        Transformasi Strategis (2016)
                      </span>
                      <p style={{ fontSize: "12px", color: "#14532d", marginTop: 4, lineHeight: 1.5 }}>
                        {doc.sk2}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#334155",
                      lineHeight: 1.8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      background: "#f8fafc",
                      padding: "20px 22px",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p>{doc.paragraph1}</p>
                    <p>{doc.paragraph2}</p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                      Mandat Operasional Wilayah Timur Indonesia:
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                      {[
                        { title: "KIT", desc: "O&M Pembangkit Listrik" },
                        { title: "Transmisi", desc: "O&M Saluran Transmisi & GI" },
                        { title: "YANTEK", desc: "O&M Distribusi & Respon Gangguan" },
                        { title: "BILLMAN", desc: "Pelayanan Pelanggan & Penagihan" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: "12px 14px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                          }}
                        >
                          <strong style={{ display: "block", color: "#0284c7", fontSize: "13px" }}>{item.title}</strong>
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VISI & MISI */}
              {doc.type === "visi-misi" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                      color: "#ffffff",
                      borderRadius: 16,
                      padding: "24px 26px",
                      boxShadow: "0 8px 24px rgba(2, 132, 199, 0.25)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.85, marginBottom: 6 }}>
                      VISI PERUSAHAAN
                    </div>
                    <blockquote style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                      "{doc.visi}"
                    </blockquote>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
                      MISI PERUSAHAAN (5 PILAR UTAMA)
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {doc.misi.map((m: string, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 14,
                            padding: "16px 18px",
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "#e0f2fe",
                              color: "#0284c7",
                              fontWeight: 800,
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            0{idx + 1}
                          </span>
                          <p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: 1.65 }}>
                            {m}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TATA NILAI (AKHLAK) */}
              {doc.type === "tata-nilai" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: "16px 20px",
                      fontSize: "13.5px",
                      color: "#475569",
                      lineHeight: 1.7,
                    }}
                  >
                    <p style={{ margin: 0 }}>{doc.intro}</p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 14,
                    }}
                  >
                    {doc.values.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: "16px 18px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 5,
                            height: "100%",
                            background: v.color,
                          }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: v.color,
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {v.code}
                          </span>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                            {v.title}
                          </h4>
                        </div>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#475569", lineHeight: 1.6 }}>
                          {v.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: 12,
                      padding: "14px 18px",
                      fontSize: "12.5px",
                      color: "#065f46",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    💡 {doc.closing}
                  </div>
                </div>
              )}

              {/* 4. PROFIL DIREKSI */}
              {doc.type === "direksi" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {doc.direksiList.map((dir: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: "20px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <img
                          src={dir.photo}
                          alt={dir.name}
                          style={{
                            width: 110,
                            height: 140,
                            borderRadius: 12,
                            objectFit: "cover",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/user/owner.jpg";
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <span
                            style={{
                              background: "#e0f2fe",
                              color: "#0284c7",
                              fontSize: "10.5px",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {dir.role}
                          </span>
                          <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", marginTop: 4, marginBottom: 8 }}>
                            {dir.name}
                          </h3>
                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", flexDirection: "column", gap: 3 }}>
                            <p style={{ margin: 0 }}>
                              <strong>Kewarganegaraan:</strong> {dir.citizenship}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Tempat &amp; Tanggal Lahir:</strong> {dir.pobDob}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        <div>
                          <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "#0284c7", display: "block", marginBottom: 6 }}>
                            Riwayat Pendidikan:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: 4 }}>
                            {dir.education.map((edu: string, eIdx: number) => (
                              <li key={eIdx}>{edu}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "#0284c7", display: "block", marginBottom: 6 }}>
                            Riwayat Pekerjaan:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: 4 }}>
                            {dir.careers.map((car: string, cIdx: number) => (
                              <li key={cIdx}>{car}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. PROFIL KOMISARIS */}
              {doc.type === "komisaris" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {doc.komisarisList.map((kom: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: "20px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <img
                          src={kom.photo}
                          alt={kom.name}
                          style={{
                            width: 110,
                            height: 140,
                            borderRadius: 12,
                            objectFit: "cover",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/user/owner.jpg";
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              fontSize: "10.5px",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {kom.role}
                          </span>
                          <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", marginTop: 4, marginBottom: 8 }}>
                            {kom.name}
                          </h3>
                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", flexDirection: "column", gap: 3 }}>
                            <p style={{ margin: 0 }}>
                              <strong>Kewarganegaraan:</strong> {kom.citizenship}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Tempat &amp; Tanggal Lahir:</strong> {kom.pobDob}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        <div>
                          <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "#b45309", display: "block", marginBottom: 6 }}>
                            Riwayat Pendidikan:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: 4 }}>
                            {kom.education.map((edu: string, eIdx: number) => (
                              <li key={eIdx}>{edu}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong style={{ fontSize: "11.5px", textTransform: "uppercase", color: "#b45309", display: "block", marginBottom: 6 }}>
                            Riwayat Pekerjaan:
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: 4 }}>
                            {kom.careers.map((car: string, cIdx: number) => (
                              <li key={cIdx}>{car}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. WILAYAH KERJA */}
              {doc.type === "wilayah-kerja" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <img
                      src={doc.mapImg}
                      alt="Peta Wilayah Kerja"
                      style={{ width: "100%", maxHeight: 320, objectFit: "contain", display: "block" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                    <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#b45309" }}>🟨 KANTOR PUSAT</span>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 700, color: "#78350f" }}>{doc.kantorPusat}</p>
                    </div>

                    <div style={{ background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: 12, padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1" }}>🟦 KANTOR OPERASIONAL</span>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 700, color: "#0c4a6e" }}>{doc.kantorOperasional}</p>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", marginBottom: 8 }}>
                      🟥 9 KANTOR UNIT PELAKSANA (UP)
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                      {doc.units.map((u: string, idx: number) => (
                        <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                          • {u}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", paddingTop: 10 }}>
                    <Link
                      href="/wilayah-kerja"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#0284c7",
                        color: "#ffffff",
                        padding: "10px 24px",
                        borderRadius: 9999,
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Buka Halaman Wilayah Kerja &amp; Kontak Lengkap ↗
                    </Link>
                  </div>
                </div>
              )}

              {/* 7. COMPANY PROFILE */}
              {doc.type === "company-profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", maxWidth: 640, width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", borderRadius: 10, overflow: "hidden" }}>
                      <img
                        src="/company-profile-pages/page-4.jpg"
                        alt="Left Page"
                        style={{ width: "50%", height: "auto", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/cards/card-01.jpg";
                        }}
                      />
                      <img
                        src="/company-profile-pages/page-5.jpg"
                        alt="Right Page"
                        style={{ width: "50%", height: "auto", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/cards/card-02.jpg";
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Company Profile resmi PT PLN Nusa Daya edisi 2026 (43 Halaman Komprehensif)
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", paddingTop: 8 }}>
                    <Link
                      href="/company-profile"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#0284c7",
                        color: "#ffffff",
                        padding: "11px 26px",
                        borderRadius: 12,
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                      }}
                    >
                      📖 Buka Buku Flipbook Interaktif
                    </Link>

                    <a
                      href="/company-profile.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#ffffff",
                        color: "#0284c7",
                        border: "1.5px solid #0284c7",
                        padding: "10px 22px",
                        borderRadius: 12,
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      📄 Buka Dokumen PDF
                    </a>
                  </div>
                </div>
              )}

              {/* 8. STANDARD DOCUMENT VIEW */}
              {doc.type === "standard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {doc.content &&
                    doc.content.map((para: string, pIdx: number) => (
                      <div
                        key={pIdx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          background: "#f8fafc",
                          padding: "16px 18px",
                          borderRadius: "12px",
                          borderLeft: "4px solid #1a9de1",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.7, margin: 0 }}>
                          {para}
                        </p>
                      </div>
                    ))}
                </div>
              )}
    </div>
  );
}