"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import CorpNavbar from "@/components/corp/CorpNavbar";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { apiClient } from "@/lib/api";

/* ============================================================
   PT PLN NUSA DAYA — Official Web Portal & Corporate Landing
   Pixel-perfect replica matching https://plnnusadaya.co.id
   ============================================================ */

// Nilai default counter (dipakai bila API statistik belum siap/ gagal)
const DEFAULT_STATS_TARGETS = {
  projects: 335,
  workers: 25547,
  units: 9,
  years: 22,
};

interface CorpStats {
  logsheet_total: number;
  user_count: number;
  total_units: number;
  years_active: number;
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [selectedPortfolio, setSelectedPortfolio] = useState<any | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  // Services carousel index
  const [serviceIdx, setServiceIdx] = useState(0);
  // News carousel index
  const [newsIdx, setNewsIdx] = useState(0);

  // Full article viewer (Latest News reading modal)
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Default Curated News Items
  const defaultNews = [
    {
      id: 190,
      img: "/images/news-190.jpg",
      category: "KORPORAT",
      date: "04 Jun 2026",
      author: "Humas PLN Nusa Daya",
      title: "Amandemen Kontrak Transmisi dan Distribusi Wilayah Maluku",
      excerpt: "Pada 4 Juni 2026, PLN Nusa Daya bersama PLN UIW Maluku dan Maluku Utara menandatangani amandemen kontrak strategis guna memperkuat keandalan pasokan energi dan optimasi mutu layanan pelanggan di Maluku.",
      content: "Pada 4 Juni 2026, PT PLN Nusa Daya bersama PLN UIW Maluku dan Maluku Utara resmi melaksanakan penandatanganan amandemen kontrak strategis operasional jaringan transmisi dan distribusi tenaga listrik.\n\nLangkah ini merupakan bagian dari peta jalan transformasi keandalan sistem interkoneksi di wilayah Maluku, memastikan kontinuitas pasokan listrik 24 jam tanpa padam bagi sektor industri, pariwisata, dan pemukiman warga.",
      href: "https://plnnusadaya.co.id/190/new",
    },
    {
      id: 189,
      img: "/images/news-189.jpg",
      category: "CSR & KEBERLANJUTAN",
      date: "02 Jun 2026",
      author: "CSR PLN Nusa Daya",
      title: "Qurban Berkelanjutan PLN Nusa Daya Berbagi Keberkahan",
      excerpt: "Program “Qurban Berkelanjutan” menjadi wujud kepedulian sosial PLN Nusa Daya dalam berbagi berkah dan menyejahterakan masyarakat di sekitar ring-1 pembangkit listrik wilayah kerja Kalimantan & Indonesia Timur.",
      content: "Melalui inisiatif 'Qurban Berkelanjutan', PT PLN Nusa Daya mendistribusikan ratusan paket hewan qurban ke berbagai desa binaan di sekitar instalasi pembangkit.\n\nProgram ini mengintegrasikan kepedulian sosial dengan pemberdayaan peternak lokal serta pemanfaatan kemasan ramah lingkungan nir-plastik sebagai komitmen ESG perusahaan.",
      href: "https://plnnusadaya.co.id/189/new",
    },
    {
      id: 188,
      img: "/images/news-188.jpg",
      category: "OPERASIONAL",
      date: "28 Mei 2026",
      author: "Divisi Operasi KIT",
      title: "Siaga Idul Adha: PLN Nusa Daya Pastikan Keandalan Pembangkit",
      excerpt: "Siaga Penuh untuk Terangnya Hari Raya Idul Adha 1447 H. Tim teknis PLN Nusa Daya menyiagakan 25.000+ personil dan posko siaga 24 jam untuk menjamin kontinuitas pasokan listrik tanpa padam selama perayaan.",
      content: "Menyambut perayaan Idul Adha 1447 H, PT PLN Nusa Daya menetapkan masa siaga kelistrikan dengan posko kontrol 24 jam di 9 Unit Pelaksana.\n\nSeluruh armada Pelayanan Teknik (Yantek) dan teknisi pembangkit dilengkapi peralatan diagnostik digital WACB untuk mitigasi dini anomali sistem secara real-time.",
      href: "https://plnnusadaya.co.id/188/new",
    },
    {
      id: 187,
      img: "/images/news-187.jpg",
      category: "PENGHARGAAN",
      date: "20 Mei 2026",
      author: "Sekretariat Perusahaan",
      title: "Top CSR Awards 2026: Dedikasi Terbaik Energi Berkelanjutan",
      excerpt: "PT PLN Nusa Daya meraih dua penghargaan bergengsi dalam Top CSR Awards 2026 atas komitmen kuat dalam elektrifikasi hijau, pemberdayaan UMKM lokal, dan tata kelola lingkungan terpadu.",
      content: "Apresiasi Top CSR Awards 2026 menegaskan keberhasilan PLN Nusa Daya dalam menyelaraskan pertumbuhan bisnis ketenagalistrikan dengan prinsip keberlanjutan global.\n\nDewan juri mengapresiasi inovasi program elektrifikasi pedesaan terpencil berbasis energi bersih dan konservasi keanekaragaman hayati sekitar PLTD.",
      href: "https://plnnusadaya.co.id/187/new",
    },
    {
      id: 186,
      img: "/images/news-186.jpg",
      category: "SUMBER DAYA MANUSIA",
      date: "15 Mei 2026",
      author: "Divisi SDM & Budaya",
      title: "Hari Kebangkitan Nasional ke-118: Bangkit Menuju Kemandirian Energi",
      excerpt: "Upacara Hari Kebangkitan Nasional ke-118 diikuti seluruh insan PT PLN Nusa Daya dengan semangat transformasi digital dan penguatan tata nilai AKHLAK dalam mengawal ketahanan energi nasional.",
      content: "Memperingati Hari Kebangkitan Nasional, segenap jajaran PT PLN Nusa Daya meneguhkan komitmen sebagai pelopor keandalan energi di Kalimantan dan Kawasan Timur Indonesia.\n\nPengembangan talenta muda, sertifikasi kompetensi ketenagalistrikan berstandar internasional, dan adopsi digital logsheet menjadi pilar utama kebangkitan korporasi.",
      href: "https://plnnusadaya.co.id/186/new",
    },
  ];

  const [newsList, setNewsList] = useState<any[]>(defaultNews);

  // Stats counters — angka diambil dari database lewat /public/corporate-stats
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState({ projects: 0, workers: 0, units: 0, years: 0 });
  const [statsTargets, setStatsTargets] = useState(DEFAULT_STATS_TARGETS);
  const targetsRef = useRef(DEFAULT_STATS_TARGETS);
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    targetsRef.current = statsTargets;
    if (counted) setCounts(statsTargets);
  }, [statsTargets, counted]);

  /* ---- Scroll effects & Scroll Reveal ---- */
  useEffect(() => {
    const onScroll = () => {
      setScrollTopVisible(window.scrollY > 400);

      const sections = ["home", "about", "stats", "services", "news", "portfolio", "direksi", "contact"];
      let current = "home";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= window.scrollY + 120) current = id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- Scroll Reveal Intersection Observer ---- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [newsList, serviceIdx]);

  /* ---- Dynamic Articles Fetch from API (Admin Integration) ---- */
  useEffect(() => {
    apiClient
      .get("/public/articles")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiArticles = res.data.data.map((a: any) => ({
            id: a.id,
            img: a.image_url || "/images/news-190.jpg",
            category: (a.category || "OPERASIONAL").toUpperCase(),
            date: new Date(a.created_at || Date.now()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            author: a.author || "Admin PLN Nusa Daya",
            title: a.title,
            excerpt: a.excerpt || (a.content ? a.content.slice(0, 150) + "..." : ""),
            content: a.content || a.excerpt,
            href: `/berita/${a.slug || a.id}`,
            isCustom: true,
          }));
          // Data dari database menjadi daftar utama; berita contoh hanya cadangan
          setNewsList(apiArticles);
        }
      })
      .catch((err) => {
        console.log("Memuat default artikel PLN:", err.message);
      });
  }, []);

  /* ---- Statistik korporat dari database (landing dinamis) ---- */
  useEffect(() => {
    apiClient
      .get<{ success: boolean; stats?: CorpStats }>("/public/corporate-stats")
      .then((res) => {
        const s = res.data?.stats;
        if (res.data?.success && s) {
          setStatsTargets({
            projects: s.logsheet_total || DEFAULT_STATS_TARGETS.projects,
            workers: s.user_count || DEFAULT_STATS_TARGETS.workers,
            units: s.total_units || DEFAULT_STATS_TARGETS.units,
            years: s.years_active || DEFAULT_STATS_TARGETS.years,
          });
        }
      })
      .catch((err) => {
        console.log("Memuat statistik korporat:", err.message);
      });
  }, []);

  /* ---- Counter animation ---- */
  useEffect(() => {
    if (counted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCounted(true);
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [counted]);

  function animateCounters() {
    const duration = 2000;
    const steps = 80;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      const targets = targetsRef.current;
      setCounts({
        projects: Math.round(progress * targets.projects),
        workers: Math.round(progress * targets.workers),
        units: Math.round(progress * targets.units),
        years: Math.round(progress * targets.years),
      });
      if (step >= steps) {
        clearInterval(timer);
        setCounts(targetsRef.current);
      }
    }, duration / steps);
  }

  /* ---- Services Carousel Autoplay ---- */
  const totalServices = 6;
  // Default sama dengan nilai SSR (4) agar tidak terjadi hydration mismatch;
  // nilai sesungguhnya dihitung setelah mount dan saat resize.
  const [visibleServices, setVisibleServices] = useState(4);
  const calcVisibleServices = (w: number) => (w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
  const maxServiceIdx = Math.max(0, totalServices - visibleServices);

  useEffect(() => {
    const update = () => setVisibleServices(calcVisibleServices(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ---- Langkah carousel & jumlah kartu terlihat (diukur dari DOM, responsif) ---- */
  const [serviceStep, setServiceStep] = useState(311);
  const [newsStep, setNewsStep] = useState(384);
  const [newsVisible, setNewsVisible] = useState(3);

  useEffect(() => {
    const measure = (
      sel: string,
      gap: number,
      setStep: (n: number) => void,
      setVisible?: (n: number) => void
    ) => {
      const card = document.querySelector<HTMLElement>(sel);
      const track = card?.parentElement;
      if (!card || !track || card.offsetWidth === 0) return;
      setStep(card.offsetWidth + gap);
      if (setVisible) {
        setVisible(Math.max(1, Math.round((track.offsetWidth + gap) / (card.offsetWidth + gap))));
      }
    };
    const update = () => {
      measure(".service-card-corp", 26, setServiceStep);
      measure(".news-card-corp", 24, setNewsStep, setNewsVisible);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setServiceIdx((prev) => Math.min(prev, maxServiceIdx));
    const t = setInterval(() => {
      setServiceIdx((prev) => (prev >= maxServiceIdx ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(t);
  }, [maxServiceIdx]);

  /* ---- News Carousel Autoplay ---- */
  const maxNewsIdx = Math.max(0, newsList.length - newsVisible);
  useEffect(() => {
    setNewsIdx((prev) => Math.min(prev, maxNewsIdx));
    const t = setInterval(() => {
      setNewsIdx((prev) => (prev >= maxNewsIdx ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(t);
  }, [maxNewsIdx]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const navH = 76;
    window.scrollTo({ top: el.offsetTop - navH, behavior: "smooth" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTimeout(() => setFormSubmitted(true), 800);
  }

  const services = [
    {
      num: "01",
      badge: "⚡ O&M Pembangkit",
      link: "https://plnnusadaya.co.id/amc-pembangkit",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      title: "Asset Management Contract (AMC) Pembangkit",
      desc: "Pengoperasian dan pemeliharaan mesin pembangkit listrik secara andal, optimalisasi pemakaian BBM, penanganan gangguan cepat, dan pengelolaan limbah K3L berstandar tinggi.",
      features: [
        "Operasi & Pemeliharaan Rutin",
        "Efisiensi & Rekonsiliasi BBM",
        "Pengelolaan Limbah & K3L",
      ],
    },
    {
      num: "02",
      badge: "🌐 Grid Transmisi",
      link: "https://plnnusadaya.co.id/amc-transmisi",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      ),
      title: "Asset Management Contract (AMC) Transmisi",
      desc: "Jasa Operasi dan Pemeliharaan gardu induk menyangkut pencatatan, kontrol dan penyetelan kondisi operasi peralatan, patroli jalur transmisi, dan mitigasi darurat gangguan.",
      features: [
        "Operasi Gardu Induk (GI)",
        "Patroli Jalur Transmisi",
        "Tindakan Tanggap Darurat 24 Jam",
      ],
    },
    {
      num: "03",
      badge: "🔌 Jaringan Distribusi",
      link: "https://plnnusadaya.co.id/amc-distribusi",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: "Asset Management Contract (AMC) Distribusi",
      desc: "Pengoperasian, pemeliharaan, serta inspeksi jaringan distribusi tegangan menengah & rendah, perbaikan jaringan cepat, dan perbaikan KwH meter di seluruh wilayah kerja.",
      features: [
        "Inspeksi JTM & JTR Berkala",
        "Perbaikan & Tera KwH Meter",
        "Keandalan Jaringan Distribusi",
      ],
    },
    {
      num: "04",
      badge: "🏭 Power Supply IPP",
      link: "https://plnnusadaya.co.id/drups",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      ),
      title: "Penyedia Pembangkit Listrik (<100 MW)",
      desc: "Penyediaan energi listrik mandiri dan andal dengan skema IPP berkapasitas hingga 100 MW untuk mendukung ketahanan energi dan industri di wilayah Timur Indonesia.",
      features: [
        "Kapasitas Pembangkit s.d 100 MW",
        "Skema IPP Cepat & Efisien",
        "Fokus Kawasan Timur Indonesia",
      ],
    },
    {
      num: "05",
      badge: "👥 Customer Care",
      link: "https://plnnusadaya.co.id/listriqu",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Pelayanan Pelanggan & Yantek",
      desc: "Layanan pelanggan profesional dan responsif 24/7 melalui armada Pelayanan Teknik (Yantek) serta manajemen penagihan (Billman) yang berorientasi kepuasan konsumen.",
      features: [
        "Pelayanan Teknik (YANTEK)",
        "Billing Management (BILLMAN)",
        "Respon Cepat Siaga 24 Jam",
      ],
    },
    {
      num: "06",
      badge: "🌱 Beyond kWh",
      link: "https://plnnusadaya.co.id/beyond-kwh",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "Inovasi Beyond kWh",
      desc: "Layanan inovatif melampaui kebutuhan energi dasar, menghadirkan energi baru terbarukan, solusi dekarbonisasi, serta digitalisasi aset ketenagalistrikan masa depan.",
      features: [
        "Green & Renewable Energy",
        "Digital Asset Management",
        "Efisiensi & Dekarbonisasi",
      ],
    },
  ];

  const portfolioItems = [
    {
      id: 1,
      cat: "pembangkit",
      categoryName: "PEMBANGKIT",
      categoryColor: "#0284c7",
      img: "/images/portfolio-10.jpg",
      title: "O&M Pembangkit Listrik Wilayah Timur",
      subtitle: "Pembangkitan Terdistribusi & Mesin Diesel-Gas",
      desc: "Pengelolaan dan pemeliharaan mesin pembangkit listrik secara andal dan berkesinambungan di Pulau Kalimantan, Sulawesi, Maluku, dan Papua. Mengoptimalkan SFC efisiensi bahan bakar serta menjamin ketersediaan pasokan daya listrik 24/7.",
      badges: ["Kawasan Timur", "SLA 99.8%", "Standar ISO 9001"],
      specs: [
        { label: "Cakupan", val: "Kalimantan & Wilayah Timur" },
        { label: "Keandalan EAF", val: "99.8%" },
        { label: "Standar Mutu", val: "ISO 9001, 14001, 45001" },
      ]
    },
    {
      id: 2,
      cat: "pembangkit",
      categoryName: "PEMBANGKIT",
      categoryColor: "#0284c7",
      img: "/images/portfolio-9.jpg",
      title: "Pembangkit Listrik Tenaga Gas Modern",
      subtitle: "Teknologi Turbin Siklus Cepat (Fast Peaker)",
      desc: "Operasional pembangkit berbahan bakar gas alam ramah lingkungan dengan efisiensi termal tinggi, waktu start-up cepat untuk memikul beban puncak (peaker), dan kepatuhan baku mutu emisi gas buang.",
      badges: ["Low Emission", "Siklus Tertutup", "Fast Peaker"],
      specs: [
        { label: "Teknologi", val: "Gas Turbine Generator" },
        { label: "Waktu Respon", val: "< 15 Menit ke Grid" },
        { label: "Status Emisi", val: "Sesuai Baku Mutu KLHK" },
      ]
    },
    {
      id: 3,
      cat: "distribusi",
      categoryName: "DISTRIBUSI",
      categoryColor: "#10b981",
      img: "/images/portfolio-8.jpg",
      title: "Pemeliharaan Jaringan Distribusi & Yantek",
      subtitle: "Jaringan Tegangan Menengah & Rendah (JTM/JTR)",
      desc: "Armada Pelayanan Teknik (Yantek) responsif 24 jam untuk pemeliharaan preventif jaringan distribusi, perbaikan trafo distribusi, dan penanganan gangguan demi memastikan pasokan listrik ke pelanggan andal tanpa jeda.",
      badges: ["Respon 24/7", "PDKB Bertegangan", "Siaga Gangguan"],
      specs: [
        { label: "Armada Yantek", val: "25.000+ Personil Lapangan" },
        { label: "Wilayah Unit", val: "9 Unit Pelaksana Regional" },
        { label: "Respon Time SLA", val: "< 45 Menit di Lokasi" },
      ]
    },
    {
      id: 4,
      cat: "transmisi",
      categoryName: "TRANSMISI",
      categoryColor: "#f59e0b",
      img: "/images/portfolio-7.jpg",
      title: "Operasi & Pemeliharaan Gardu Induk Transmisi",
      subtitle: "Sistem Saluran Udara Tegangan Tinggi (SUTT 150 kV)",
      desc: "Pengawasan, pengoperasian, dan inspeksi menyeluruh peralatan switchyard gardu induk 70 kV dan 150 kV. Meliputi patroli right-of-way (ROW), uji thermovision infra merah berkala, dan pemeliharaan isolator transmisi.",
      badges: ["Tegangan Tinggi 150 kV", "Patroli ROW", "Switchyard O&M"],
      specs: [
        { label: "Tegangan Kerja", val: "70 kV - 150 kV" },
        { label: "Metode Inspeksi", val: "Thermovision & Drone Patrol" },
        { label: "Kinerja Trip", val: "Zero Unplanned Outage" },
      ]
    },
    {
      id: 5,
      cat: "distribusi",
      categoryName: "DISTRIBUSI",
      categoryColor: "#10b981",
      img: "/images/portfolio-6.jpg",
      title: "Inspeksi & Sertifikasi Jaringan Kelistrikan",
      subtitle: "Audit Teknis & Pemeliharaan Tera kWh Meter",
      desc: "Pemeriksaan dan peremajaan kWh meter presisi, tera meter pelanggan industri dan komersial, perbaikan sambungan rumah, serta implementasi standar keselamatan K3L ketenagalistrikan terpadu.",
      badges: ["Tera Presisi", "Manajemen Billman", "Audit Mutu"],
      specs: [
        { label: "Akurasi Meter", val: "Kelas Presisi 0.5S / 0.2S" },
        { label: "Standar Uji", val: "SNI / Standar PLN (SPLN)" },
        { label: "Keselamatan", val: "K3L Zero Accident" },
      ]
    },
    {
      id: 6,
      cat: "pembangkit",
      categoryName: "PEMBANGKIT",
      categoryColor: "#0284c7",
      img: "/images/portfolio-5.jpg",
      title: "Pembangkit Listrik Tenaga Uap (PLTU) Terpadu",
      subtitle: "Penyangga Beban Dasar (Base Load System)",
      desc: "Penyediaan pasokan daya listrik skala besar untuk menopang sistem interkoneksi kelistrikan regional dan kawasan industri, didukung manajemen handling batubara dan pemanfaatan abu FABA ramah lingkungan.",
      badges: ["Base Load", "Pemanfaatan FABA", "Sistem Interkoneksi"],
      specs: [
        { label: "Fungsi Grid", val: "Penyangga Beban Dasar" },
        { label: "Siklus Termal", val: "Boiler Sirkulasi Batubara" },
        { label: "Program FABA", val: "100% Sirkular Ramah Lingkungan" },
      ]
    },
    {
      id: 7,
      cat: "pelayanan",
      categoryName: "PELAYANAN",
      categoryColor: "#8b5cf6",
      img: "/images/portfolio-8.jpg",
      title: "Layanan Pelanggan & Billing Management (BILLMAN)",
      subtitle: "Pelayanan Terpadu & Digital Meter Reading",
      desc: "Pencatatan angka meter secara digital dan real-time menggunakan aplikasi terintegrasi WACB & PLN Mobile, penanganan permintaan teknis pelanggan, dan evaluasi kepuasan pelanggan secara berkala.",
      badges: ["Digital Billing", "Aplikasi WACB", "Kepuasan Pelanggan"],
      specs: [
        { label: "Platform", val: "WACB Terintegrasi" },
        { label: "Akurasi Billing", val: "99.9% Tepat Waktu" },
        { label: "Kepuasan Konsumen", val: "Indeks Sangat Puas" },
      ]
    },
    {
      id: 8,
      cat: "beyond",
      categoryName: "BEYOND KWH",
      categoryColor: "#06b6d4",
      img: "/images/portfolio-9.jpg",
      title: "Inovasi Beyond kWh & Transisi Energi Hijau",
      subtitle: "Dekarbonisasi & Manajemen Energi Bersih",
      desc: "Pengembangan solusi energi modern melampaui pasokan listrik konvensional, meliputi implementasi PLTS Atap komersial, penerbitan sertifikat energi terbarukan (REC), dan optimalisasi efisiensi konsumsi daya.",
      badges: ["Green Energy", "Renewable REC", "Dekarbonisasi"],
      specs: [
        { label: "Inisiatif Hijau", val: "Solar PV Rooftop & REC" },
        { label: "Mitigasi Karbon", val: "Reduksi Emisi GRK Terukur" },
        { label: "Target ESG", val: "Net Zero Emission Roadmap" },
      ]
    }
  ];
  const filteredPortfolio = portfolioFilter === "all" ? portfolioItems : portfolioItems.filter((i) => i.cat === portfolioFilter);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
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
        body { font-family: 'Inter', system-ui, sans-serif; color: var(--text); background: #ffffff; }

        /* Hero */
        .hero, .hero-corp {
          position: relative;
          width: 100%;
          min-height: calc(100vh - var(--nav-h));
          display: flex;
          align-items: center;
          background: #ffffff;
          padding: calc(var(--nav-h) + 40px) 0 60px;
          overflow: hidden;
        }

        /* Full Background Video — 1080p Crisp Acceleration */
        .hero-bg-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 1;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Vertical Gradient Overlay: Bawah 100% ke Atas 0% Jernih */
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 1.0) 0%,
            rgba(255, 255, 255, 0.78) 18%,
            rgba(255, 255, 255, 0.35) 42%,
            rgba(255, 255, 255, 0.10) 65%,
            rgba(255, 255, 255, 0.0) 85%,
            rgba(255, 255, 255, 0.0) 100%
          ) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          z-index: 2;
          pointer-events: none;
        }

        /* Foreground Container */
        .hero-container {
          position: relative;
          z-index: 3;
          max-width: 1340px;
          width: 100%;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
        }

        .hero-content {
          max-width: 720px;
        }

        .hero-title {
          font-size: clamp(34px, 4.4vw, 56px);
          font-weight: 800;
          line-height: 1.18;
          color: #0f172a;
          margin-bottom: 22px;
          letter-spacing: -0.5px;
          text-shadow: 0 1px 12px rgba(255, 255, 255, 0.95), 0 0 2px rgba(255, 255, 255, 0.9);
        }

        .hero-subtitle {
          font-size: 18px;
          color: #1e293b;
          line-height: 1.7;
          margin-bottom: 36px;
          font-weight: 600;
          text-shadow: 0 1px 8px rgba(255, 255, 255, 0.95);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .btn-hero-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 38px;
          border: 2px solid var(--primary);
          border-radius: 9999px;
          font-weight: 700;
          font-size: 15px;
          color: var(--primary);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          text-decoration: none;
          cursor: pointer;
          transition: all .25s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
        }
        .btn-hero-outline:hover {
          background: var(--primary);
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(26, 157, 225, 0.4);
          transform: translateY(-2px);
        }

        .btn-hero-portal {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 30px;
          background: linear-gradient(135deg, #1a9de1, #1178b5);
          color: #ffffff;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(26, 157, 225, 0.35);
          transition: all .25s ease;
        }
        .btn-hero-portal:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(26, 157, 225, 0.5);
        }

        /* Trademark Section Title */
        .section-header-corp { text-align: center; margin-bottom: 50px; }
        .section-title-wrapper-corp { display: inline-flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px 16px; }
        .section-line-corp { display: block; width: 38px; height: 2px; background: #1a9de1; border-radius: 2px; }
        .section-title-corp { font-size: 26px; font-weight: 800; color: #1a1a2e; letter-spacing: 1.5px; text-transform: uppercase; }

        /* About */
        .about-section-corp { padding: 70px 0 80px; background: #ffffff; }
        .about-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start;
        }
        .about-text-corp { font-size: 15px; color: #475569; line-height: 1.8; text-align: justify; }

        /* Stats */
        .stats-section-corp { padding: 60px 0 80px; background: #ffffff; }
        .stats-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1fr 1.2fr; align-items: center; gap: 60px;
        }
        .stats-grid-corp { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px 32px; }
        .stat-item-corp { display: flex; align-items: center; gap: 18px; }
        .stat-icon-corp {
          width: 54px; height: 54px; border-radius: 12px; background: #e8f6fd;
          color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-number-corp { font-size: 34px; font-weight: 800; color: #1a1a2e; line-height: 1.1; }
        .stat-label-corp { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500; }

        /* Services (Clean, Minimalist & Professional Corporate Showcase) */
        .services-section-corp {
          padding: 80px 0 90px;
          background: #ffffff;
          position: relative;
        }
        .section-subtitle-corp {
          font-size: 15px;
          color: #64748b;
          margin-top: 10px;
          font-weight: 400;
          text-align: center;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .service-card-corp {
          position: relative;
          background: #ffffff;
          border-radius: 14px;
          padding: 28px 22px 24px;
          text-align: left;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          transition: all .25s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 0 0 285px;
          min-width: 285px;
          z-index: 1;
        }
        .service-card-corp:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .service-card-header-corp {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .service-badge-corp {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .service-num-corp {
          font-size: 16px;
          font-weight: 700;
          color: #94a3b8;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .service-icon-box-corp {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f0f7fc;
          color: #1a9de1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          transition: all .25s ease;
        }
        .service-card-corp:hover .service-icon-box-corp {
          background: #1a9de1;
          color: #ffffff;
        }

        .service-title-corp {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
          line-height: 1.4;
          min-height: 44px;
        }
        .service-desc-corp {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
          flex-grow: 1;
        }

        .service-features-corp {
          list-style: none;
          padding: 0;
          margin: 0 0 18px 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
        }
        .service-feature-item-corp {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #334155;
          font-weight: 500;
        }
        .service-check-icon-corp {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .service-action-link-corp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #1a9de1;
          text-decoration: none;
          margin-top: auto;
          transition: gap .25s ease;
          cursor: pointer;
        }
        .service-card-corp:hover .service-action-link-corp {
          gap: 10px;
          color: #0d84c1;
        }

        .carousel-btn-corp {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #ffffff;
          color: #1a9de1;
          border: 1px solid #e2e8f0;
          font-size: 24px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
          transition: all .25s ease;
        }
        .carousel-btn-corp:hover {
          background: #1a9de1;
          color: #ffffff;
          border-color: #1a9de1;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 24px rgba(26, 157, 225, 0.35);
        }
        .carousel-prev-corp { left: 6px; }
        .carousel-next-corp { right: 6px; }

        /* News — Expanded Readable Cards with Meta & Badges */
        .news-section-corp { padding: 80px 0 90px; background: #ffffff; }
        .news-card-corp {
          background: #ffffff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
          transition: all .35s ease; display: flex; flex-direction: column;
          flex: 0 0 calc(33.333% - 18px); min-width: 360px;
        }
        .news-card-corp:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.1); border-color: #cbd5e1; }
        .news-img-wrapper-corp { position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #f8fafc; }
        .news-img-wrapper-corp img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .news-card-corp:hover .news-img-wrapper-corp img { transform: scale(1.05); }
        .news-content-corp { padding: 22px 20px; display: flex; flex-direction: column; flex-grow: 1; }
        .news-badge-corp {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700;
          color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 6px;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; align-self: flex-start;
        }
        .news-meta-corp { display: flex; align-items: center; gap: 14px; font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
        .news-title-corp {
          font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 10px;
          transition: color .2s;
        }
        .news-card-corp:hover .news-title-corp { color: var(--primary); }
        .news-excerpt-corp {
          font-size: 13.5px; color: #475569; line-height: 1.65; margin-bottom: 18px; flex-grow: 1;
        }
        .news-read-btn-corp {
          display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;
          color: #1a9de1; text-decoration: none; cursor: pointer; transition: gap .2s ease;
          border: none; background: transparent; padding: 0;
        }
        .news-read-btn-corp:hover { gap: 10px; color: #0d84c1; }

        /* Portfolio — Enhanced Large Image Cards with Rich Hover Explanations */
        .portfolio-section-corp { padding: 90px 0 100px; background: #ffffff; }
        .filter-btn-corp {
          background: #f8fafc; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 700;
          color: #475569; padding: 10px 22px; border-radius: 9999px; cursor: pointer;
          letter-spacing: .5px; transition: all .25s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }
        .filter-btn-corp:hover { color: #0284c7; border-color: #38bdf8; background: #f0f9ff; }
        .filter-btn-corp.active { background: #0284c7; color: #ffffff; border-color: #0284c7; box-shadow: 0 4px 14px rgba(2,132,199,0.35); }
        .portfolio-grid-corp {
          max-width: 1360px; margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(390px, 1fr)); gap: 32px;
        }
        .portfolio-item-corp {
          position: relative; border-radius: 20px; overflow: hidden; height: 380px; min-height: 380px;
          background: #0f172a; border: 1px solid #e2e8f0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08); cursor: pointer;
          transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .4s cubic-bezier(0.16, 1, 0.3, 1), border-color .4s ease;
        }
        .portfolio-item-corp:hover {
          transform: translateY(-8px);
          box-shadow: 0 22px 50px rgba(2, 132, 199, 0.2), 0 8px 24px rgba(0,0,0,0.12);
          border-color: #38bdf8;
        }
        .portfolio-img-bg {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .7s cubic-bezier(0.16, 1, 0.3, 1), filter .7s ease;
        }
        .portfolio-item-corp:hover .portfolio-img-bg {
          transform: scale(1.1);
          filter: brightness(0.75);
        }
        /* Bottom resting preview bar */
        .portfolio-bottom-bar-corp {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 65%, transparent 100%);
          padding: 28px 22px 18px;
          display: flex; flex-direction: column; gap: 6px;
          transition: opacity .35s ease, transform .35s ease;
          z-index: 2;
        }
        .portfolio-item-corp:hover .portfolio-bottom-bar-corp {
          opacity: 0; transform: translateY(12px); pointer-events: none;
        }
        .portfolio-badge-pill {
          display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 800;
          color: #ffffff; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;
          letter-spacing: 0.6px; align-self: flex-start;
        }
        .portfolio-title-rest {
          font-size: 17px; font-weight: 800; color: #ffffff; line-height: 1.35;
        }
        .portfolio-hint-rest {
          font-size: 11.5px; color: #94a3b8; display: flex; align-items: center; gap: 4px;
        }

        /* Hover Overlay — Smooth sliding information and full description */
        .portfolio-overlay-corp {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.96) 90%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 26px 24px;
          display: flex; flex-direction: column; justify-content: flex-end;
          opacity: 0; transform: translateY(14px);
          transition: opacity .35s cubic-bezier(0.16, 1, 0.3, 1), transform .35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3;
        }
        .portfolio-item-corp:hover .portfolio-overlay-corp {
          opacity: 1; transform: translateY(0);
        }
        .portfolio-overlay-title {
          font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.35; margin-bottom: 3px;
        }
        .portfolio-overlay-sub {
          font-size: 11.5px; font-weight: 700; color: #38bdf8; text-transform: uppercase;
          letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .portfolio-overlay-desc {
          font-size: 12.5px; color: #e2e8f0; line-height: 1.6; margin-bottom: 12px;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .portfolio-specs-row {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;
        }
        .portfolio-spec-chip {
          background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 6px; padding: 3px 8px; font-size: 10.5px; color: #cbd5e1;
        }
        .portfolio-spec-chip strong { color: #ffffff; margin-right: 4px; }
        .portfolio-action-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #0284c7; color: #ffffff; padding: 9px 18px; border-radius: 10px;
          font-size: 12px; font-weight: 700; border: none; cursor: pointer;
          transition: all .2s ease; box-shadow: 0 4px 12px rgba(2,132,199,0.3);
          align-self: flex-start;
        }
        .portfolio-action-btn:hover { background: #0ea5e9; transform: translateY(-2px); }

        /* Lightbox Preview Modal */
        .portfolio-lightbox-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: modalFadeIn .25s ease-out;
        }
        .portfolio-lightbox-card {
          background: #ffffff; border-radius: 24px; max-width: 920px; width: 100%;
          max-height: 92vh; overflow-y: auto;
          box-shadow: 0 30px 70px rgba(0,0,0,0.35); border: 1px solid #e2e8f0;
          display: flex; flex-direction: column; position: relative;
        }
        .portfolio-lightbox-close {
          position: absolute; top: 16px; right: 16px; width: 38px; height: 38px;
          border-radius: 50%; background: rgba(15, 23, 42, 0.65); color: #ffffff;
          border: none; font-size: 22px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; z-index: 20; transition: all .2s;
        }
        .portfolio-lightbox-close:hover { background: #0f172a; transform: scale(1.08); }

        /* Scroll Reveal Animation */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Direksi */
        .direksi-section-corp { padding: 80px 0 90px; background: #ffffff; }
        .direksi-grid-corp {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
          max-width: 1180px; margin: 0 auto; padding: 0 32px;
        }
        .direksi-card-corp {
          background: #ffffff; border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
          transition: all .35s ease; display: flex; flex-direction: column;
        }
        .direksi-card-corp:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .direksi-photo-wrapper-corp { position: relative; width: 100%; aspect-ratio: 4/5; background: #f8fafc; overflow: hidden; }
        .direksi-photo-corp { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform .5s ease; }
        .direksi-card-corp:hover .direksi-photo-corp { transform: scale(1.04); }

        /* Contact */
        .contact-section-corp { padding: 80px 0 40px; background: #ffffff; }
        .contact-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1.1fr 1fr 1.3fr; gap: 40px; align-items: start;
        }
        .social-link-corp {
          width: 38px; height: 38px; border-radius: 50%; border: 1px solid #1a9de1;
          color: #1a9de1; display: flex; align-items: center; justify-content: center;
          transition: all .25s ease;
        }
        .social-link-corp:hover { background: #1a9de1; color: #ffffff; transform: translateY(-2px); }

        /* Carousel controls */
        .carousel-btn-corp {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%; background: #1a9de1;
          color: white; border: none; font-size: 24px; line-height: 1;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          z-index: 20; box-shadow: 0 4px 14px rgba(26,157,225,0.4); transition: all .25s ease;
        }
        .carousel-btn-corp:hover { background: #1178b5; transform: translateY(-50%) scale(1.08); }
        .carousel-prev-corp { left: 6px; }
        .carousel-next-corp { right: 6px; }

        /* ============ DARK / LIGHT THEME VARS (inline styles landing) ============ */
        :root {
          --corp-card: #ffffff;
          --corp-surface2: #f8fafc;
          --corp-surface: #f1f5f9;
          --corp-heading: #1a1a2e;
          --corp-strong: #0f172a;
          --corp-body: #334155;
          --corp-body2: #475569;
          --corp-muted: #64748b;
          --corp-meta: #94a3b8;
          --corp-border: #cbd5e1;
          --corp-border-line: #e2e8f0;
          --corp-border2: #f1f5f9;
          --corp-icon-bg: #e8f6fd;
          --corp-icon-border: #bae6fd;
          --corp-badge-bg: #e0f2fe;
          --corp-accent: #0284c7;
          --corp-dot: #cbd5e1;
          --corp-input-bg: #ffffff;
        }
        .dark {
          --primary-lt: rgba(26, 157, 225, 0.12);
          --text: #cbd5e1;
          --text-light: #94a3b8;
          --bg: #0c111d;
          --corp-card: #0f172a;
          --corp-surface2: #111827;
          --corp-surface: #1e293b;
          --corp-heading: #f1f5f9;
          --corp-strong: #f8fafc;
          --corp-body: #cbd5e1;
          --corp-body2: #94a3b8;
          --corp-muted: #94a3b8;
          --corp-meta: #94a3b8;
          --corp-border: #334155;
          --corp-border-line: #1e293b;
          --corp-border2: #1e293b;
          --corp-icon-bg: rgba(26, 157, 225, 0.14);
          --corp-icon-border: rgba(26, 157, 225, 0.4);
          --corp-badge-bg: rgba(56, 189, 248, 0.15);
          --corp-accent: #38bdf8;
          --corp-dot: #475569;
          --corp-input-bg: #0f172a;
        }

        /* ============ DARK MODE — LANDING ============ */
        .dark body { background: #0c111d; color: #cbd5e1; }

        /* Hero */
        .dark .hero, .dark .hero-corp { background: #0c111d; }
        .dark .hero-overlay {
          background: linear-gradient(
            to top,
            rgba(12, 17, 29, 1.0) 0%,
            rgba(12, 17, 29, 0.85) 18%,
            rgba(12, 17, 29, 0.45) 42%,
            rgba(12, 17, 29, 0.12) 65%,
            rgba(12, 17, 29, 0.0) 85%,
            rgba(12, 17, 29, 0.0) 100%
          ) !important;
        }
        .dark .hero-title {
          color: #f1f5f9 !important;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.65), 0 0 2px rgba(0, 0, 0, 0.5) !important;
        }
        .dark .hero-subtitle {
          color: #cbd5e1 !important;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6) !important;
        }
        .dark .btn-hero-outline {
          background: rgba(12, 17, 29, 0.72);
          color: #7dd3fc;
          border-color: #38bdf8;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .dark .btn-hero-outline:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        /* Section shells */
        .dark .about-section-corp, .dark .stats-section-corp, .dark .services-section-corp,
        .dark .news-section-corp, .dark .portfolio-section-corp, .dark .direksi-section-corp,
        .dark .contact-section-corp { background: #0c111d; }
        .dark .section-title-corp { color: #f1f5f9; }
        .dark .section-subtitle-corp { color: #94a3b8; }

        /* About + Stats */
        .dark .about-text-corp { color: #94a3b8; }
        .dark .stat-icon-corp { background: rgba(26, 157, 225, 0.14); }
        .dark .stat-number-corp { color: #f1f5f9; }
        .dark .stat-label-corp { color: #94a3b8; }

        /* Services */
        .dark .service-card-corp {
          background: #0f172a; border-color: #1e293b;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        .dark .service-card-corp:hover {
          border-color: #334155;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55);
        }
        .dark .service-badge-corp { color: #94a3b8; background: #1e293b; border-color: #334155; }
        .dark .service-icon-box-corp { background: rgba(26, 157, 225, 0.14); }
        .dark .service-title-corp { color: #f1f5f9; }
        .dark .service-desc-corp { color: #94a3b8; }
        .dark .service-features-corp { border-top-color: #1e293b; }
        .dark .service-feature-item-corp { color: #cbd5e1; }
        .dark .service-check-icon-corp { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .dark .service-action-link-corp { color: #38bdf8; }
        .dark .service-card-corp:hover .service-action-link-corp { color: #7dd3fc; }

        /* News */
        .dark .news-card-corp {
          background: #0f172a; border-color: #1e293b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        }
        .dark .news-card-corp:hover {
          border-color: #334155;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
        }
        .dark .news-img-wrapper-corp { background: #111827; }
        .dark .news-badge-corp { color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
        .dark .news-title-corp { color: #f1f5f9; }
        .dark .news-excerpt-corp { color: #94a3b8; }
        .dark .news-read-btn-corp { color: #38bdf8; }
        .dark .news-read-btn-corp:hover { color: #7dd3fc; }

        /* Portfolio */
        .dark .filter-btn-corp {
          background: #111827; border-color: #334155; color: #94a3b8; box-shadow: none;
        }
        .dark .filter-btn-corp:hover {
          color: #38bdf8; border-color: #0ea5e9; background: rgba(56, 189, 248, 0.08);
        }
        .dark .filter-btn-corp.active {
          background: #0284c7; color: #ffffff; border-color: #0284c7;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }
        .dark .portfolio-item-corp {
          border-color: #1e293b;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }
        .dark .portfolio-lightbox-card {
          background: #0f172a; border-color: #1e293b;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
        }
        .dark .portfolio-lightbox-close:hover { background: #334155; }

        /* Direksi */
        .dark .direksi-card-corp {
          background: #0f172a; border-color: #1e293b;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        }
        .dark .direksi-card-corp:hover { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6); }
        .dark .direksi-photo-wrapper-corp { background: #111827; }

        /* Contact + social */
        .dark .social-link-corp { border-color: #38bdf8; color: #38bdf8; }
        .dark .social-link-corp:hover { background: var(--primary); color: #ffffff; }

        /* Navbar (style tag ini hanya terpasang selama landing ter-mount) */
        .dark .navbar-corp {
          background: linear-gradient(to bottom, rgba(12, 17, 29, 0.94) 0%, rgba(12, 17, 29, 0.72) 65%, rgba(12, 17, 29, 0.35) 100%);
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }
        .dark .navbar-corp.scrolled {
          background: rgba(12, 17, 29, 0.97);
          border-bottom-color: rgba(30, 41, 59, 0.9);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        }
        .dark .navbar-corp .nav-link-corp { color: #cbd5e1; }
        .dark .navbar-corp .nav-link-corp:hover,
        .dark .navbar-corp .nav-item-corp.active .nav-link-corp { color: #38bdf8; }
        .dark .navbar-corp .dropdown-corp {
          background: #0f172a; border-color: #1e293b;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
        }
        .dark .navbar-corp .dropdown-corp li a,
        .dark .navbar-corp .dropdown-corp li span { color: #cbd5e1; }
        .dark .navbar-corp .dropdown-corp li a:hover,
        .dark .navbar-corp .dropdown-corp li span:hover {
          background: rgba(26, 157, 225, 0.14); color: #38bdf8;
        }

        /* Floating theme toggle */
        .landing-theme-fab {
          position: fixed; right: 22px; bottom: 22px; z-index: 950;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
        }

        /* Logo Danantara (teks hitam) → plate putih agar terbaca di navbar gelap */
        .dark .navbar-corp .logo-danantara-corp {
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 8px;
        }

        @media (max-width: 1024px) {
          .hero-container, .hero-container-corp { grid-template-columns: 1fr; text-align: center; }
          .hero-content { margin: 0 auto; }
          .hero-actions { justify-content: center; }
          .about-container-corp { grid-template-columns: 1fr; }
          .stats-container-corp { grid-template-columns: 1fr; }
          .service-card-corp { flex: 0 0 calc(50% - 12px); min-width: 0; }
          .news-card-corp { flex: 0 0 calc(50% - 12px); min-width: 0; }
          .portfolio-grid-corp { grid-template-columns: repeat(2, 1fr); }
          .direksi-grid-corp { grid-template-columns: repeat(2, 1fr); }
          .contact-container-corp { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .service-card-corp { flex: 0 0 100%; min-width: 0; }
          .news-card-corp { flex: 0 0 100%; min-width: 0; }
          .portfolio-grid-corp { grid-template-columns: 1fr; }
          .direksi-grid-corp { grid-template-columns: 1fr; }
          .stats-grid-corp { grid-template-columns: 1fr; }
          .section-title-corp { font-size: clamp(18px, 5vw, 26px); }
          .section-line-corp { width: 26px; }
        }
      `}</style>

      <ThemeToggleButton className="landing-theme-fab" />

      {/* ================================================================
          NAVBAR (shared component: nav-container-corp)
      ================================================================ */}
      <CorpNavbar activeSection={activeSection} />

      {/* ============================================================
           HERO SECTION — Reusable Component with Full Background Video
      ============================================================ */}
      <Hero onGetStarted={() => scrollTo("about")} />

      {/* ================================================================
          ABOUT US SECTION
      ================================================================ */}
      <section className="about-section-corp" id="about">
        <div className="section-header-corp">
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">ABOUT US</h2>
            <span className="section-line-corp"></span>
          </div>
        </div>

        <div className="about-container-corp">
          <div className="about-text-corp">
            <p>
              PT Pelayanan Listrik Nasional Nusa Daya (PT PLN Nusa Daya) atau disingkat PLN ND adalah salah satu Anak
              Perusahaan PT PLN (Persero) yang berkedudukan di Pulau Tarakan Provinsi Kalimantan Utara, dibentuk berdasarkan
              Surat Keputusan Direksi PT PLN (Persero) No. 258-1/010/DIR/2003 tanggal 17 Oktober 2003 dan disahkan
              berdasarkan Akta Notaris H Haryanto SH, MBA No. 18 tanggal 15 Desember 2003. PT PLN Nusa Daya telah
              menjalankan bisnis penyediaan dan penjualan tenaga listrik yang terintegrasi mulai dari tahun 2003 sampai dengan
              tahun 2016 dengan menerapkan tarif regional yang berbeda dari tarif dasar listrik (TDL) Nasional di Pulau Tarakan.
            </p>
          </div>
          <div className="about-text-corp">
            <p>
              Mengantisipasi dinamika bisnis PT PLN Nusa Daya, maka berdasarkan Keputusan RUPS Sirkuler No. 109/DIR/2016
              pada tanggal 30 November 2016 dan berdasarkan keputusan RUPS tersebut yang dikukuhkan dalam Anggaran
              Dasar PT PLN Nusa Daya Perubahan No. 5 tanggal 7 Desember 2016, pemegang saham menugaskan PT PLN Nusa
              Daya untuk melaksanakan pengelolaan Jasa Operasi &amp; Pemeliharaan Pembangkit (KIT), Jasa Operasi &amp; Pemeliharaan
              Transmisi, Jasa Operasi &amp; Pemeliharaan Distribusi (YANTEK) serta Pelayanan Pelanggan (BILLMAN) di Wilayah
              Indonesia Timur yang mencakup Kalimantan, Sulawesi, Nusa Tenggara, Maluku dan Papua, dengan Kedudukan
              Kantor pusat PT PLN Nusa Daya di Kota Balikpapan Kalimantan Timur.
            </p>
            <a
              href="https://plnnusadaya.co.id/#about"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginTop: 24,
                padding: "10px 32px",
                border: "1.5px solid var(--primary)",
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: 14,
                color: "var(--primary)",
                textDecoration: "none",
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATS SECTION (3D Power Assets Left, 2x2 Counters Right)
      ================================================================ */}
      <section className="stats-section-corp" id="stats" ref={statsRef}>
        <div className="stats-container-corp">
          <div>
            <img
              src="/images/hero-img3.png"
              alt="PLN Nusa Daya Power Assets"
              style={{ width: "100%", maxWidth: 460, height: "auto", display: "block", margin: "0 auto", filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.06))" }}
            />
          </div>

          <div className="stats-grid-corp">
            <div className="stat-item-corp">
              <div className="stat-icon-corp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28 }}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <div>
                <div className="stat-number-corp">{counts.projects.toLocaleString("id-ID")}</div>
                <div className="stat-label-corp">Rekap Logsheet</div>
              </div>
            </div>

            <div className="stat-item-corp">
              <div className="stat-icon-corp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div className="stat-number-corp">{counts.workers.toLocaleString("id-ID")}</div>
                <div className="stat-label-corp">Pengguna Sistem</div>
              </div>
            </div>

            <div className="stat-item-corp">
              <div className="stat-icon-corp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28 }}><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"/></svg>
              </div>
              <div>
                <div className="stat-number-corp">{counts.units.toLocaleString("id-ID")}</div>
                <div className="stat-label-corp">Unit Pembangkit</div>
              </div>
            </div>

            <div className="stat-item-corp">
              <div className="stat-icon-corp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28 }}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div>
                <div className="stat-number-corp">{counts.years.toLocaleString("id-ID")}</div>
                <div className="stat-label-corp">Tahun Pengalaman</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SERVICES SECTION (Modern Corporate Showcase)
      ================================================================ */}
      <section className="services-section-corp" id="services">
        <div className="section-header-corp">
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">SERVICES</h2>
            <span className="section-line-corp"></span>
          </div>
          <p className="section-subtitle-corp">
            Solusi Komprehensif Operasi, Pemeliharaan Aset, dan Inovasi Ketenagalistrikan Terintegrasi
          </p>
        </div>

        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 20px", position: "relative" }}>
          <button
            className="carousel-btn-corp carousel-prev-corp"
            onClick={() => setServiceIdx((prev) => Math.max(0, prev - 1))}
            aria-label="Previous"
          >
            ‹
          </button>

          <div style={{ width: "100%", overflow: "hidden", padding: "16px 0" }}>
            <div
              style={{
                display: "flex",
                gap: 26,
                transition: "transform .45s cubic-bezier(.4,0,.2,1)",
                transform: `translateX(-${serviceIdx * serviceStep}px)`,
              }}
            >
              {services.map((s, idx) => (
                <div key={idx} className="service-card-corp scroll-reveal">
                  <div className="service-card-header-corp">
                    <span className="service-badge-corp">{s.badge}</span>
                    <span className="service-num-corp">{s.num}</span>
                  </div>
                  <div className="service-icon-box-corp">{s.icon}</div>
                  <h3 className="service-title-corp">{s.title}</h3>
                  <p className="service-desc-corp">{s.desc}</p>
                  <ul className="service-features-corp">
                    {s.features.map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="service-feature-item-corp">
                        <span className="service-check-icon-corp">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <a href={s.link} target="_blank" rel="noreferrer" className="service-action-link-corp">
                    Pelajari Layanan <span>→</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-btn-corp carousel-next-corp"
            onClick={() => setServiceIdx((prev) => (prev >= maxServiceIdx ? 0 : prev + 1))}
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Carousel indicator dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {Array.from({ length: maxServiceIdx + 1 }).map((_, i) => (
            <span
              key={i}
              onClick={() => setServiceIdx(i)}
              style={{
                width: serviceIdx === i ? 28 : 10,
                height: 10,
                borderRadius: 9999,
                background: serviceIdx === i ? "#1a9de1" : "var(--corp-dot)",
                cursor: "pointer",
                transition: "all .3s ease",
              }}
            />
          ))}
        </div>
      </section>

      {/* ================================================================
          LATEST NEWS SECTION (Expanded Readable UI + Admin Integration)
      ================================================================ */}
      <section className="news-section-corp" id="news">
        <div className="section-header-corp" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">LATEST NEWS</h2>
            <span className="section-line-corp"></span>
          </div>
          <p className="section-subtitle-corp" style={{ margin: 0 }}>
            Kabar Terkini, Agenda Korporasi, dan Informasi Strategis Ketenagalistrikan PT PLN Nusa Daya
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            <Link
              href="/admin/articles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 20px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                background: "var(--corp-icon-bg)",
                color: "#1a9de1",
                border: "1.5px solid var(--corp-icon-border)",
                textDecoration: "none",
                transition: "all .2s ease",
              }}
            >
              <span>✏️</span> Tulis / Kelola Berita (Admin)
            </Link>
            <Link
              href="/berita"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 20px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                background: "var(--corp-surface2)",
                color: "var(--corp-body2)",
                border: "1.5px solid var(--corp-border-line)",
                textDecoration: "none",
                transition: "all .2s ease",
              }}
            >
              Lihat Semua Berita →
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 20px", position: "relative" }}>
          <button
            className="carousel-btn-corp carousel-prev-corp"
            onClick={() => setNewsIdx((prev) => Math.max(0, prev - 1))}
            aria-label="Previous"
          >
            ‹
          </button>

          <div style={{ width: "100%", overflow: "hidden", padding: "16px 0" }}>
            <div
              style={{
                display: "flex",
                gap: 24,
                transition: "transform .45s cubic-bezier(.4,0,.2,1)",
                transform: `translateX(-${newsIdx * newsStep}px)`,
              }}
            >
              {newsList.map((item, idx) => (
                <div key={item.id || idx} className="news-card-corp scroll-reveal">
                  <div className="news-img-wrapper-corp">
                    <img
                      src={item.img}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/news-190.jpg";
                      }}
                    />
                  </div>
                  <div className="news-content-corp">
                    <span className="news-badge-corp">{item.category || "BERITA"}</span>
                    <div className="news-meta-corp">
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {item.date}
                      </span>
                      <span>•</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {item.author}
                      </span>
                    </div>
                    <h3
                      className="news-title-corp"
                      onClick={() => setSelectedArticle(item)}
                      style={{ cursor: "pointer" }}
                    >
                      {item.title}
                    </h3>
                    <p className="news-excerpt-corp">
                      {item.excerpt}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--corp-border2)" }}>
                      <button
                        onClick={() => setSelectedArticle(item)}
                        className="news-read-btn-corp"
                      >
                        Baca Selengkapnya <span>→</span>
                      </button>
                      {item.href && item.href.startsWith("http") && (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: "var(--corp-meta)", textDecoration: "none" }}
                          title="Buka sumber resmi PLN Nusa Daya"
                        >
                          🌐 Sumber
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-btn-corp carousel-next-corp"
            onClick={() => setNewsIdx((prev) => (prev >= maxNewsIdx ? 0 : prev + 1))}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </section>

      {/* ================================================================
          PORTFOLIO SECTION
      ================================================================ */}
      <section className="portfolio-section-corp" id="portfolio">
        <div className="section-header-corp">
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">PORTOFOLIO</h2>
            <span className="section-line-corp"></span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          {[
            { id: "all", label: "ALL" },
            { id: "pembangkit", label: "PEMBANGKIT" },
            { id: "transmisi", label: "TRANSMISI" },
            { id: "distribusi", label: "DISTRIBUSI" },
            { id: "pelayanan", label: "PELAYANAN PELANGGAN" },
            { id: "beyond", label: "BEYOND KWH" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPortfolioFilter(btn.id)}
              className={`filter-btn-corp${portfolioFilter === btn.id ? " active" : ""}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="portfolio-grid-corp">
          {filteredPortfolio.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="portfolio-item-corp scroll-reveal"
              onClick={() => setSelectedPortfolio(item)}
              title="Klik untuk melihat foto HD & keterangan lengkap"
            >
              <img src={item.img} alt={item.title} className="portfolio-img-bg" />

              {/* Resting preview bar (hidden on hover) */}
              <div className="portfolio-bottom-bar-corp">
                <span className="portfolio-badge-pill" style={{ background: item.categoryColor || "#0284c7" }}>
                  {item.categoryName || "PROYEK"}
                </span>
                <h3 className="portfolio-title-rest">{item.title}</h3>
                <span className="portfolio-hint-rest">Arahkan kursor atau klik untuk keterangan lengkap &rarr;</span>
              </div>

              {/* Rich Hover Overlay with detailed description */}
              <div className="portfolio-overlay-corp">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span className="portfolio-badge-pill" style={{ background: item.categoryColor || "#0284c7" }}>
                    {item.categoryName || "PROYEK"}
                  </span>
                  {item.badges && item.badges.slice(0, 2).map((b: string, bIdx: number) => (
                    <span key={bIdx} style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", background: "rgba(56,189,248,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                      {b}
                    </span>
                  ))}
                </div>

                <h3 className="portfolio-overlay-title">{item.title}</h3>
                <p className="portfolio-overlay-sub">{item.subtitle}</p>

                {/* Keterangan Detail Operasional */}
                <p className="portfolio-overlay-desc">{item.desc}</p>

                {/* Spesifikasi / Highlights */}
                {item.specs && (
                  <div className="portfolio-specs-row">
                    {item.specs.map((sp: any, spIdx: number) => (
                      <div key={spIdx} className="portfolio-spec-chip">
                        <strong>{sp.label}:</strong> {sp.val}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="portfolio-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPortfolio(item);
                  }}
                >
                  <span>&#128269; Lihat Foto HD &amp; Keterangan Lengkap</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          PROFIL DIREKSI (Agung Nugraha, Herry Ristiawan, Chaidar Syaifullah)
      ================================================================ */}
      <section className="direksi-section-corp" id="direksi">
        <div className="section-header-corp">
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">PROFIL DIREKSI</h2>
            <span className="section-line-corp"></span>
          </div>
        </div>

        <div className="direksi-grid-corp">
          {[
            {
              name: "Agung Nugraha",
              title: "DIREKTUR UTAMA",
              img: "/images/agung-nugraha.jpg",
            },
            {
              name: "Herry Ristiawan",
              title: "DIREKTUR KEUANGAN, MANAJEMEN RISIKO, DAN HUMAN CAPITAL",
              img: "/images/herry-ristiawan.png",
            },
            {
              name: "Chaidar Syaifullah",
              title: "DIREKTUR OPERASI DAN PENGEMBANGAN USAHA",
              img: "/images/chaidar-syaifullah.png",
            },
          ].map((d) => (
            <div key={d.name} className="direksi-card-corp scroll-reveal">
              <div className="direksi-photo-wrapper-corp">
                <img
                  src={d.img}
                  alt={d.name}
                  className="direksi-photo-corp"
                  onError={(e) => {
                    // Fallback to placeholder if not loaded
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='180' r='70' fill='%23cbd5e1'/%3E%3Cpath d='M100 420 C100 310, 300 310, 300 420 Z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div style={{ padding: "22px 18px 24px", textAlign: "center", background: "var(--corp-card)", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--corp-heading)", marginBottom: 6 }}>{d.name}</h3>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--corp-muted)", letterSpacing: 0.5, lineHeight: 1.5, textTransform: "uppercase" }}>
                  {d.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          CONTACT US
      ================================================================ */}
      <section className="contact-section-corp" id="contact">
        <div className="section-header-corp">
          <div className="section-title-wrapper-corp">
            <span className="section-line-corp"></span>
            <h2 className="section-title-corp">CONTACT US</h2>
            <span className="section-line-corp"></span>
          </div>
        </div>

        <div className="contact-container-corp">
          {/* Column 1: Info & Socials */}
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--corp-heading)", lineHeight: 1.3, marginBottom: 14 }}>
              PT Pelayanan Listrik<br />Nasional Nusa Daya
            </h3>
            <p style={{ fontSize: 14, color: "var(--corp-muted)", lineHeight: 1.7, marginBottom: 24 }}>
              Perusahaan Pengelola Aset Ketenagalistrikan Terkemuka di Wilayah Tengah dan Timur Indonesia dan tumbuh berkelanjutan
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Instagram", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                { label: "X", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "Facebook", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { label: "TikTok", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.08a4.85 4.85 0 01-1-.39z"/></svg> },
                { label: "YouTube", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
                { label: "LinkedIn", svg: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              ].map((s) => (
                <a key={s.label} href="#" className="social-link-corp" aria-label={s.label}>
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Details */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, fontSize: 14, color: "var(--corp-body)", lineHeight: 1.6 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--corp-icon-bg)", color: "#1a9de1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <div>
                <p>Jln. Letjen ZA Maulani RT 41 No 78</p>
                <p>Damai Bahagia, Kec.Balikpapan Selatan</p>
                <p>Balikpapan - Kalimantan Timur</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, fontSize: 14, color: "var(--corp-body)" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--corp-icon-bg)", color: "#1a9de1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <p>plnnd@plnnusadaya.co.id</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 14, color: "var(--corp-body)" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--corp-icon-bg)", color: "#1a9de1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h-3.08z" /></svg>
              </div>
              <p>Telp (0542) 8975052</p>
            </div>
          </div>

          {/* Column 3: Form */}
          <div>
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--corp-border)", borderRadius: 8, fontSize: 14, background: "var(--corp-input-bg)", color: "var(--corp-body)" }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--corp-border)", borderRadius: 8, fontSize: 14, background: "var(--corp-input-bg)", color: "var(--corp-body)" }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--corp-border)", borderRadius: 8, fontSize: 14, background: "var(--corp-input-bg)", color: "var(--corp-body)" }}
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--corp-border)", borderRadius: 8, fontSize: 14, background: "var(--corp-input-bg)", color: "var(--corp-body)" }}
                />
                <button
                  type="submit"
                  style={{
                    alignSelf: "flex-start",
                    padding: "12px 36px",
                    background: "#1a9de1",
                    color: "white",
                    border: "none",
                    borderRadius: 9999,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 12, padding: 24, textAlign: "center", color: "#065f46" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <p style={{ fontWeight: 600 }}>Pesan Anda telah terkirim!</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Tim PLN Nusa Daya akan segera menghubungi Anda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer copyright */}
        <div style={{ borderTop: "1px solid var(--corp-border2)", marginTop: 60, paddingTop: 28, textAlign: "center", fontSize: 13.5, color: "var(--corp-muted)" }}>
          <p>© Copyright {new Date().getFullYear()} <strong>PT Pelayanan Listrik Nasional Nusa Daya</strong>. All Rights Reserved</p>
        </div>
      </section>

      {/* Floating Scroll to Top Button */}
      <button
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 44,
          height: 44,
          borderRadius: 8,
          background: "#1a9de1",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(26,157,225,0.4)",
          opacity: scrollTopVisible ? 1 : 0,
          pointerEvents: scrollTopVisible ? "auto" : "none",
          transition: "all .3s ease",
          zIndex: 99,
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 20, height: 20 }}>
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>


      {/* ============================================================
          2. ARTICLE READER MODAL (For Full Latest News Reading)
      ============================================================ */}
      {selectedArticle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            style={{
              background: "var(--corp-card)",
              borderRadius: "18px",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--corp-border-line)",
              padding: "0 0 32px 0",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: "relative", width: "100%", height: "280px", overflow: "hidden", borderTopLeftRadius: "18px", borderTopRightRadius: "18px", background: "var(--corp-surface)" }}>
              <img
                src={selectedArticle.img}
                alt={selectedArticle.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/news-190.jpg";
                }}
              />
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "28px 32px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "var(--corp-badge-bg)",
                    color: "var(--corp-accent)",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {selectedArticle.category || "BERITA"}
                </span>
                <span style={{ fontSize: "12.5px", color: "var(--corp-muted)" }}>
                  📅 {selectedArticle.date}
                </span>
                <span style={{ fontSize: "12.5px", color: "var(--corp-muted)" }}>
                  ✍️ {selectedArticle.author || "Redaksi PLN Nusa Daya"}
                </span>
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--corp-strong)",
                  lineHeight: 1.35,
                  marginBottom: 18,
                }}
              >
                {selectedArticle.title}
              </h2>

              <div
                style={{
                  fontSize: "15px",
                  color: "var(--corp-body)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  marginBottom: 28,
                  borderTop: "1px solid var(--corp-border2)",
                  paddingTop: 18,
                }}
              >
                {selectedArticle.content || selectedArticle.excerpt}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  paddingTop: 16,
                  borderTop: "1px solid var(--corp-border2)",
                }}
              >
                {selectedArticle.href && selectedArticle.href.startsWith("http") ? (
                  <a
                    href={selectedArticle.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "13px",
                      color: "#1a9de1",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Buka Halaman Resmi plnnusadaya.co.id ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "12.5px", color: "var(--corp-meta)" }}>
                    Publikasi Resmi PLN Nusa Daya
                  </span>
                )}

                <button
                  onClick={() => setSelectedArticle(null)}
                  style={{
                    padding: "9px 22px",
                    borderRadius: "9999px",
                    background: "#1a9de1",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Tutup Bacaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ================================================================
          PORTFOLIO LIGHTBOX / DETAIL MODAL
      ================================================================ */}
      {selectedPortfolio && (
        <div
          className="portfolio-lightbox-overlay"
          onClick={() => setSelectedPortfolio(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="portfolio-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="portfolio-lightbox-close"
              onClick={() => setSelectedPortfolio(null)}
              aria-label="Tutup"
            >
              &times;
            </button>

            <div style={{ position: "relative", width: "100%", maxHeight: "480px", overflow: "hidden", background: "#0f172a" }}>
              <img
                src={selectedPortfolio.img}
                alt={selectedPortfolio.title}
                style={{ width: "100%", maxHeight: "480px", objectFit: "contain", background: "#0b1329", display: "block" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)", padding: "30px 24px 16px" }}>
                <span className="portfolio-badge-pill" style={{ background: selectedPortfolio.categoryColor || "#0284c7" }}>
                  {selectedPortfolio.categoryName || "PROYEK"}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginTop: 6, lineHeight: 1.3 }}>
                  {selectedPortfolio.title}
                </h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#38bdf8", marginTop: 2 }}>
                  {selectedPortfolio.subtitle}
                </p>
              </div>
            </div>

            <div style={{ padding: "28px 30px" }}>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--corp-accent)", marginBottom: 8 }}>
                  KETERANGAN OPERASIONAL &amp; CAKUPAN KERJA:
                </h4>
                <p style={{ fontSize: 14.5, color: "var(--corp-body)", lineHeight: 1.8 }}>
                  {selectedPortfolio.desc}
                </p>
              </div>

              {selectedPortfolio.specs && (
                <div style={{ marginBottom: 24, background: "var(--corp-surface2)", border: "1px solid var(--corp-border-line)", borderRadius: 14, padding: "16px 20px" }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--corp-body2)", marginBottom: 12 }}>
                    SPESIFIKASI &amp; INDIKATOR KINERJA:
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                    {selectedPortfolio.specs.map((sp: any, i: number) => (
                      <div key={i} style={{ background: "var(--corp-card)", border: "1px solid var(--corp-border-line)", borderRadius: 10, padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--corp-muted)", textTransform: "uppercase", display: "block" }}>{sp.label}</span>
                        <strong style={{ fontSize: 13.5, color: "var(--corp-strong)", marginTop: 2, display: "block" }}>{sp.val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 16, borderTop: "1px solid var(--corp-border2)" }}>
                <span style={{ fontSize: 12, color: "var(--corp-muted)" }}>
                  &#128274; Portofolio Operasional Resmi PT PLN Nusa Daya
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPortfolio(null)}
                  style={{ padding: "9px 24px", borderRadius: 9999, background: "#0284c7", color: "#ffffff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  Tutup Tampilan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
