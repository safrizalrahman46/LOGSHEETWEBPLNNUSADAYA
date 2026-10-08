"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "@/lib/corp-content";
import type { CorpNavItem } from "@/lib/corp-content";

/* ============================================================
   Corporate header — class="nav-container-corp"
   Shared by the landing page and every dedicated header page.

   href handling:
   - "/profil/visi-misi"  -> real <Link> (own page)
   - "https://..."        -> real <a target="_blank">
   - "about"/"news"/...   -> smooth scroll on the landing page
   ============================================================ */

interface CorpNavbarProps {
  activeSection?: string;
}

export default function CorpNavbar({ activeSection = "" }: CorpNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      setIsLoggedIn(Boolean(localStorage.getItem("pln_token")));
    } catch (_) {}
  }, [pathname]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return false;
    const navH = 76;
    window.scrollTo({ top: el.offsetTop - navH, behavior: "smooth" });
    return true;
  }

  function goSection(id: string) {
    if (pathname === "/") {
      if (!scrollToSection(id)) window.location.hash = id;
      return;
    }
    router.push(`/#${id}`);
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (scrollToSection(id) || tries > 12) window.clearInterval(timer);
    }, 120);
  }

  function renderLink(item: CorpNavItem, className: string, style?: CSSProperties) {
    const href = item.href;
    if (!href || href === "#") {
      return (
        <span className={className} style={style}>
          {item.label}
        </span>
      );
    }
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={className} style={style}>
          {item.label}
        </Link>
      );
    }
    if (href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
          {item.label}
        </a>
      );
    }
    return (
      <span onClick={() => goSection(href)} className={className} style={style}>
        {item.label}
      </span>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --primary: #1a9de1;
          --primary-dk: #1178b5;
          --primary-lt: #e8f6fd;
          --dark: #1a1a2e;
          --text: #334155;
          --text-light: #64748b;
          --bg: #ffffff;
          --nav-h: 76px;
        }

        .navbar-corp {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: var(--nav-h);
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 70%, transparent 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.25); transition: all .35s ease;
          box-shadow: none;
        }
        .navbar-corp.scrolled {
          background: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .nav-container-corp {
          max-width: 1400px; margin: 0 auto; height: 100%; padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .nav-container-corp a { text-decoration: none; }
        .logo-danantara-corp { height: 42px; width: auto; object-fit: contain; }
        .nav-link-corp {
          display: flex; align-items: center; gap: 4px; padding: 10px 12px;
          font-size: 14px; font-weight: 500; color: #334155; border-radius: 6px;
          transition: color .2s; white-space: nowrap; cursor: pointer;
        }
        .nav-link-corp:hover { color: var(--primary); }
        .nav-item-corp.active .nav-link-corp {
          color: var(--primary); font-weight: 600; position: relative;
        }
        .nav-item-corp.active .nav-link-corp::after {
          content: ''; position: absolute; bottom: 0; left: 12px; right: 12px;
          height: 2.5px; background: var(--primary); border-radius: 2px;
        }
        .dropdown-corp {
          display: none; position: absolute; top: calc(100% + 2px); left: 0;
          min-width: 230px; background: white; border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0,0,0,.12); border: 1px solid #e2e8f0;
          padding: 8px; z-index: 200;
        }
        .nav-item-corp:hover .dropdown-corp, .nav-item-corp:focus-within .dropdown-corp { display: block; }
        .dropdown-corp li a, .dropdown-corp li span {
          display: block; padding: 9px 14px; font-size: 13px; color: #334155;
          border-radius: 8px; transition: all .2s; cursor: pointer; text-decoration: none;
        }
        .dropdown-corp li a:hover, .dropdown-corp li span:hover { background: var(--primary-lt); color: var(--primary); }

        .logo-akujago-corp { height: 38px; width: auto; object-fit: contain; }
        .logo-pln-corp { height: 42px; width: auto; object-fit: contain; }

        .btn-login-corp {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 999px;
          font-size: 13.5px; font-weight: 700; letter-spacing: .2px;
          color: #fff; background: linear-gradient(135deg, #1a9de1 0%, #1178b5 100%);
          border: none; cursor: pointer; white-space: nowrap; text-decoration: none;
          box-shadow: 0 6px 18px rgba(17, 120, 181, 0.28);
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .btn-login-corp:hover {
          background: linear-gradient(135deg, #1178b5 0%, #0d659a 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(17, 120, 181, 0.36);
          color: #fff;
        }
        .btn-login-corp svg { width: 15px; height: 15px; }

        @media (max-width: 768px) {
          .nav-menu-corp { display: none; }
          .btn-login-corp { padding: 8px 14px; font-size: 12px; }
        }
        @media (max-width: 480px) {
          .logo-akujago-corp { display: none; }
        }
      `}</style>

      <header className={`navbar-corp${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-container-corp">
          <div className="nav-brand">
            <Link href="/#home">
              <img
                src="/images/danantara.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/DANANTARA1.png";
                }}
                alt="Danantara Indonesia"
                className="logo-danantara-corp"
              />
            </Link>
          </div>

          <nav className="nav-menu-corp">
            <ul style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none" }}>
              {navLinks.map((item) => {
                const children = item.children ?? [];
                const isActive = Boolean(activeSection) && activeSection === item.href;
                return (
                  <li key={item.label} className={`nav-item-corp relative${isActive ? " active" : ""}`}>
                    {children.length > 0 ? (
                      <span className="nav-link-corp" tabIndex={0}>
                        {item.label} <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>
                      </span>
                    ) : (
                      renderLink(item, "nav-link-corp")
                    )}

                    {children.length > 0 && (
                      <ul className="dropdown-corp" style={{ listStyle: "none" }}>
                        {children.map((sub) => (
                          <li key={sub.label}>
                            {renderLink(sub, "", {
                              display: "block",
                              padding: "8px 14px",
                              fontSize: 13,
                              color: "#334155",
                              borderRadius: 6,
                              cursor: "pointer",
                            })}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="https://plnnusadaya.co.id/aku-jago" target="_blank" rel="noreferrer" title="Aku Jago">
              <img src="/images/aku-jago.png" alt="Aku Jago" className="logo-akujago-corp" />
            </a>
            <img
              src="/images/logo/LOGO-PLN.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/plnt.png";
              }}
              alt="PLN Nusa Daya"
              className="logo-pln-corp"
            />
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="btn-login-corp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              {isLoggedIn ? "Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
