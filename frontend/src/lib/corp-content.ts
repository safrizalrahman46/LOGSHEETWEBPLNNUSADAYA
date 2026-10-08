/* ============================================================
   PT PLN NUSA DAYA — Corporate navigation & document content
   Single source of truth shared by:
   - landing page (src/app/page.tsx)
   - every dedicated header page (/profil, /tata-kelola,
     /layanan, /laporan, /pengadaan, /privacy-policy)
   ============================================================ */

export type CorpDoc = Record<string, any>;

export interface CorpNavItem {
  label: string;
  href: string;
  children?: CorpNavItem[];
}

export interface CorpGroupItem {
  label: string;
  slug: string;
  docKey: string;
}

export interface CorpGroup {
  label: string;
  items: CorpGroupItem[];
}

export const corporateDocuments: Record<string, CorpDoc> = {
    "Tentang Kami": {
      type: "tentang-kami",
      breadcrumbs: "Profil > Tentang Kami",
      category: "Tentang Kami",
      badge: "Sejarah & Transformasi Korporasi",
      title: "PT Pelayanan Listrik Nasional Nusa Daya (PLN Nusa Daya)",
      sk1: "Surat Keputusan Direksi PT PLN (Persero) No. 258-1/010/DIR/2003 tanggal 17 Oktober 2003 & Akta Notaris H Haryanto SH, MBA No. 18 tanggal 15 Desember 2003",
      sk2: "Keputusan RUPS Sirkuler No. 109/DIR/2016 tanggal 30 November 2016 & Anggaran Dasar Perubahan No. 5 tanggal 7 Desember 2016",
      paragraph1:
        "PT Pelayanan Listrik Nasional Nusa Daya (PT PLN Nusa Daya) atau disingkat PLN ND adalah salah satu Anak Perusahaan PT PLN (Persero) yang berkedudukan di Pulau Tarakan Provinsi Kalimantan Utara, dibentuk berdasarkan Surat Keputusan Direksi PT PLN (Persero) No. 258-1/010/DIR/2003 tanggal 17 Oktober 2003 dan disahkan berdasarkan Akta Notaris H Haryanto SH, MBA No. 18 tanggal 15 Desember 2003. PT PLN Nusa Daya telah menjalankan bisnis penyediaan dan penjualan tenaga listrik yang terintegrasi mulai dari tahun 2003 sampai dengan tahun 2016 dengan menerapkan tarif regional yang berbeda dari tarif dasar listrik (TDL) Nasional di Pulau Tarakan.",
      paragraph2:
        "Mengantisipasi dinamika bisnis PT PLN Nusa Daya, maka berdasarkan Keputusan RUPS Sirkuler No. 109/DIR/2016 pada tanggal 30 November 2016 dan berdasarkan keputusan RUPS tersebut yang dikukuhkan dalam Anggaran Dasar PT PLN Nusa Daya Perubahan No. 5 tanggal 7 Desember 2016, pemegang saham menugaskan PT PLN Nusa Daya untuk melaksanakan pengelolaan Jasa Operasi & Pemeliharaan Pembangkit (KIT), Jasa Operasi & Pemeliharaan Transmisi, Jasa Operasi & Pemeliharaan Distribusi (YANTEK) serta Pelayanan Pelanggan (BILLMAN) di Wilayah Indonesia Timur yang mencakup Kalimantan, Sulawesi, Nusa Tenggara, Maluku dan Papua, dengan Kedudukan Kantor pusat PT PLN Nusa Daya di Kota Balikpapan Kalimantan Timur.",
    },
    "Visi Misi": {
      type: "visi-misi",
      breadcrumbs: "Profil > Visi & Misi",
      category: "Visi & Misi",
      badge: "Arah Strategis Korporasi",
      title: "Visi dan Misi PT PLN Nusa Daya",
      visi: "Menjadi Perusahaan Pengelola Aset Ketenagalistrikan Terkemuka di Wilayah Tengah dan Timur Indonesia dan tumbuh berkelanjutan.",
      misi: [
        "Memberikan nilai tambah yang optimal kepada PLN Group dengan memastikan ketersediaan layanan dan keberlangsungan usaha (securing business sustainibility), optimasi dan efisiensi biaya (optimizing cost efficiency) dan keunggulan kompetensi dalam industri ketenagalistrikan (leading industry capabilities).",
        "Menjalankan bisnis asset Operator dan Asset Manager sistem ketenagalistrikan yang berkualitas, unggul dan efisien.",
        "Berpartisipasi dalam pengembangan pembangkit listrik skala < 100 MW di Kawasan Timur Indonesia di Pulau Kalimantan, Sulawesi, Maluku, Papua dan Nusa Tenggara untuk memastikan keandalan pasokan tenaga listrik sekaligus meningkatkan kontribusi laba (increasing profit contribution) untuk PLN Group dengan memanfaatkan potensi pasar eksternal.",
        "Mengembangkan kompetensi dan profesionalisme Human Capital untuk menjamin kepuasan pelanggan.",
        "Mewujudkan citra profesionalitas dalam menunjang pelayanan penyediaan tenaga listrik.",
      ],
    },
    "Tata Nilai": {
      type: "tata-nilai",
      breadcrumbs: "Profil > Tata Nilai",
      category: "Tata Nilai",
      badge: "Budaya Korporat BUMN",
      title: "Tata Nilai Budaya Perusahaan AKHLAK",
      intro:
        "Setelah sebelumnya diluncurkan oleh Kementerian BUMN dan PT PLN (Persero), PLN ND meluncurkan ‘AKHLAK’ sebagai budaya perusahaan terbarunya. AKHLAK merupakan ratifikasi budaya korporat atau core values yang dianut oleh seluruh anak usaha PLN Group yang masih terhitung sebagai bagian dari keluarga besar BUMN. AKHLAK sendiri adalah singkatan dari AMANAH, KOMPETEN, HARMONIS, LOYAL, ADAPTIF, dan KOLABORATIF.",
      closing:
        "AKHLAK diharapkan menjadi akar yang kuat dan kokoh bagi seluruh karyawan dalam bertindak dan berperilaku, agar mendukung pertumbuhan bisnis PLN ND yang semakin berkembang.",
      values: [
        {
          code: "A",
          title: "AMANAH",
          desc: "Setiap individu akan memegang teguh kepercayaan yang diberikan dalam mengemban tugas yang telah diberikan.",
          color: "#2563eb",
        },
        {
          code: "K",
          title: "KOMPETEN",
          desc: "Semangat terus belajar dan mengembangkan kapabilitas kemampuan.",
          color: "#0891b2",
        },
        {
          code: "H",
          title: "HARMONIS",
          desc: "Rasa saling peduli dan menghargai perbedaan antar sesama individu di lingkungan kerja.",
          color: "#059669",
        },
        {
          code: "L",
          title: "LOYAL",
          desc: "Memiliki dedikasi dan mengutamakan kepentingan Bangsa dan Negara.",
          color: "#d97706",
        },
        {
          code: "A",
          title: "ADAPTIF",
          desc: "Keinginan terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan.",
          color: "#7c3aed",
        },
        {
          code: "K",
          title: "KOLABORATIF",
          desc: "Membangun kerja sama yang sinergis.",
          color: "#dc2626",
        },
      ],
    },
    "Profil Direksi": {
      type: "direksi",
      breadcrumbs: "Profil > Profil Direksi",
      category: "Kepemimpinan",
      badge: "Jajaran Direksi",
      title: "Profil Direksi PT PLN Nusa Daya",
      direksiList: [
        {
          name: "Agung Nugraha",
          role: "DIREKTUR UTAMA",
          photo: "/images/Agung Nugraha - Direktur Utama.jpg",
          citizenship: "Indonesia",
          pobDob: "Yogyakarta, 28 Desember 1969",
          education: [
            "S1 Listrik, UNIVERSITAS GADJAH MADA (1992)",
          ],
          careers: [
            "Direktur Utama - PT PLN Nusa Daya (2026-sekarang)",
            "Komisaris Utama - PT PLN Nusa Daya (2023-2026)",
            "EVP Operasi Distribusi Sumatera dan Kalimantan - PT PLN (PERSERO) KANTOR PUSAT PT PLN (PERSERO) (2022 – 2024)",
            "General Manager - PT PLN (Persero) Unit Induk Distribusi Jawa Barat (2019 - 2022)",
            "General Manager - PT PLN (Persero) Unit Induk Distribusi Jawa Tengah dan DI Yogyakarta (2017 - 2019)",
            "General Manager - PT PLN (Persero) Unit Induk Wilayah Sumatera Utara (2015 - 2017)",
          ],
        },
        {
          name: "Chaidar Syaifullah",
          role: "DIREKTUR OPERASI DAN PENGEMBANGAN USAHA",
          photo: "/images/Chaidar Syaifullah - Direktur Operasi dan Pengembangan Usaha.png",
          citizenship: "Indonesia",
          pobDob: "Rappang, 06 Agustus 1977",
          education: [
            "S1 Elektro Universitas Hasanudin (2001)",
            "S2 Bidang Ekonomi Lainnya Universitas Sam Ratulangi (2016)",
          ],
          careers: [
            "Direktur Operasi dan Pengembangan Usaha - PT PLN Nusa Daya (2026-Sekarang)",
            "Direktur Sumber Daya Manusia - PT Haleyora Powerindo (2022-2026)",
            "Manajer Unit Pelaksana Pelayanan Pelanggan Pasuruan - PT PLN (Persero) Unit Induk Distribusi Jawa Timur PT PLN (Persero) (2021-2022)",
            "Manajer Unit Pelaksana Pelayanan Pelanggan Sidoarjo - PT PLN (Persero) Unit Induk Distribusi Jawa Timur PT PLN (Persero) (2018-2021)",
            "Manajer Area Mataram - PT PLN (Persero) Wilayah Nusa Tenggara Barat PT PLN (Persero) (2016-2018)",
          ],
        },
        {
          name: "Herry Ristiawan",
          role: "DIREKTUR KEUANGAN, MANAJEMEN RISIKO, DAN HUMAN CAPITAL",
          photo: "/images/Herry Ristiawan - Direktur Keuangan, Manajemen Risiko, dan Human Capital.png",
          citizenship: "Indonesia",
          pobDob: "Padalarang, 14 Januari 1970",
          education: [
            "S1 Mesin STT - YPLN (2000)",
            "S1 Ekonomi Akutansi Universitas Batam (2006)",
            "S2 Teknik Lainnya Institut Teknologi Bandung (2011)",
          ],
          careers: [
            "Direktur Keuangan, Manajemen Risiko, dan Human Capital - PT PLN Nusa Daya (2026-Sekarang)",
            "Vice President Pembayaran Terpusat 2 - PT PLN (Persero) Kantor Pusat PT PLN (Persero) (2024-2026)",
            "Senior Manager Keuangan - PT PLN (Persero) Unit Induk Distribusi Jawa Barat PT PLN (Persero) (2022-2024)",
            "Senior Manager Keuangan, Komunikasi, dan Umum - PT PLN (Persero) Unit Induk Penyaluran dan Pusat Pengatur Beban Sumatera PT PLN (Persero) (2021-2022)",
            "Senior Manager Keuangan - PT PLN (Persero) Unit Induk Penyaluran dan Pusat Pengaturan Beban Sumatera PT PLN (Persero) (2020-2021)",
          ],
        },
      ],
    },
    "Profil Komisaris": {
      type: "komisaris",
      breadcrumbs: "Profil > Profil Komisaris",
      category: "Pengawasan",
      badge: "Dewan Komisaris",
      title: "Profil Dewan Komisaris PT PLN Nusa Daya",
      komisarisList: [
        {
          name: "PLT. Agtaria Adriana",
          role: "KOMISARIS UTAMA",
          photo: "/images/PLT. Agtaria Adriana.jpeg",
          citizenship: "Indonesia",
          pobDob: "Depok, 24 Oktober 1980",
          education: [
            "S1 Ekonomi Institut Perbanas (2003)",
            "S2 Akutansi Universitas Indonesia (2026)",
          ],
          careers: [
            "Komisaris Utama - PT PLN Nusa Daya (2026-Sekarang)",
            "Direktur Investigasi - Alchemist Group (2021-2026)",
            "Peneliti - Basel Institute for Governance (2023-2024)",
            "Co-Source Audit Internal - PT Surveyor Indonesia (2023-2024)",
            "Peneliti - Transparency International Indonesia (2022-2023)",
          ],
        },
        {
          name: "Deni Dadang Ahmad Rajab",
          role: "KOMISARIS",
          photo: "/images/Deni Dadang Ahmad Rajab.jpeg",
          citizenship: "Indonesia",
          pobDob: "Bandung, 19 Desember 1963",
          education: ["-"],
          careers: [
            "Komisaris - PT PLN Nusa Daya (2026-Sekarang)",
          ],
        },
      ],
    },
    "Wilayah Kerja": {
      type: "wilayah-kerja",
      breadcrumbs: "Profil > Wilayah Kerja",
      category: "Jangkauan Operasi",
      badge: "Peta & 9 Unit Pelaksana",
      title: "Wilayah Kerja Operasional PT PLN Nusa Daya",
      mapImg: "/images/peta-wilayah-kerja.png",
      kantorPusat: "Balikpapan (Kalimantan Timur)",
      kantorOperasional: "Jakarta Selatan (DKI Jakarta)",
      units: [
        "UP KALIMANTAN 1 (Pontianak)",
        "UP KALIMANTAN 2 (Banjarbaru)",
        "UP KALIMANTAN 3 (Balikpapan)",
        "UP SULAWESI 1 (Manado)",
        "UP SULAWESI 2 (Makassar)",
        "UP NUSA TENGGARA (Mataram)",
        "UP MALUKU (Ambon)",
        "UP MALUKU UTARA (Ternate)",
        "UP PAPUA (Jayapura)",
      ],
    },
    "Company Profile": {
      type: "company-profile",
      breadcrumbs: "Profil > Company Profile",
      category: "Publikasi Korporat",
      badge: "Dokumen Resmi 2026",
      title: "Company Profile PT PLN Nusa Daya",
      pdfUrl: "/company-profile.pdf",
      flipbookUrl: "/company-profile",
    },
    "Anak Perusahaan": {
      type: "standard",
      breadcrumbs: "Profil > Portofolio & Afiliasi",
      category: "Sinergi Korporasi",
      badge: "PLN Group",
      title: "Portofolio & Afiliasi PLN Group",
      content: [
        "Sebagai salah satu lini terdepan PT PLN (Persero), PT PLN Nusa Daya bersinergi dengan seluruh entitas subholding dan afiliasi PLN Group di seluruh Indonesia.",
        "Fokus sinergi mencakup transfer teknologi pembangkitan ramah lingkungan, penyediaan suku cadang mesin, rekayasa teknik transmisi, dan integrasi rantai pasok bahan bakar energi primer.",
      ],
    },
    "Board Manual": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Board Manual",
      category: "Tata Kelola",
      badge: "Dokumen Resmi GCG",
      title: "Board Manual PT PLN Nusa Daya",
      content: [
        "Board Manual merupakan pedoman tata kerja Direksi dan Dewan Komisaris yang mengatur hubungan kerja, pembagian tugas, fungsi koordinasi, dan wewenang pengambilan keputusan.",
        "Disusun berdasarkan prinsip transparansi, kepatuhan regulasi Kementerian BUMN, dan Anggaran Dasar Perusahaan yang sah.",
      ],
    },
    "Code of Conduct": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Code of Conduct",
      category: "Integritas & Etika",
      badge: "Etika Bisnis",
      title: "Code of Conduct (Pedoman Perilaku)",
      content: [
        "Pedoman Perilaku (Code of Conduct) memuat norma integritas, larangan benturan kepentingan (conflict of interest), pencegahan gratifikasi dan penyuapan, serta kewajiban menjaga kerahasiaan aset informasi.",
        "Wajib dipatuhi oleh seluruh jajaran Direksi, Dewan Komisaris, dan seluruh insan PT PLN Nusa Daya.",
      ],
    },
    "Pedoman GCG": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Pedoman GCG",
      category: "Tata Kelola Perusahaan",
      badge: "Prinsip TARIF",
      title: "Pedoman Good Corporate Governance (GCG)",
      content: [
        "Menerapkan prinsip Transparansi, Akuntabilitas, Responsibilitas, Independensi, dan Fairness (Kewajaran) dalam seluruh siklus bisnis.",
        "Asesmen GCG berkala dilakukan secara independen dengan pencapaian skor 'Sangat Baik' secara konsisten.",
      ],
    },
    "Annual Report": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Annual Report",
      category: "Transparansi Finansial",
      badge: "Annual Report 2025/2026",
      title: "Laporan Tahunan (Annual Report)",
      content: [
        "Laporan Tahunan menyajikan kilas kinerja komprehensif PT PLN Nusa Daya, audit laporan keuangan independen dengan opini Wajar Tanpa Pengecualian (WTP), dan tinjauan pencapaian target operasional.",
        "Dokumen ini mencerminkan komitmen keterbukaan informasi publik kepada pemegang saham dan masyarakat luas.",
      ],
    },
    "Sustainability Report": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Sustainability Report",
      category: "ESG & Keberlanjutan",
      badge: "GRI Standards",
      title: "Laporan Keberlanjutan (Sustainability Report)",
      content: [
        "Mengacu pada standar Global Reporting Initiative (GRI), memaparkan kinerja Lingkungan, Sosial, dan Tata Kelola (ESG).",
        "Termasuk roadmap dekarbonisasi, efisiensi bahan bakar pembangkit, penanganan limbah B3, program elektrifikasi hijau, dan pemberdayaan komunitas masyarakat lokal.",
      ],
    },
    "Risk Management": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Risk Management",
      category: "Mitigasi Risiko",
      badge: "ISO 31000",
      title: "Enterprise Risk Management (ERM)",
      content: [
        "Penerapan kerangka kerja manajemen risiko berbasis ISO 31000 mencakup identifikasi, evaluasi, mitigasi, dan pemantauan risiko strategis, operasional, dan kepatuhan.",
        "Memastikan keandalan pasokan listrik terlindungi dari gangguan cuaca ekstrem, fluktuasi pasokan bahan bakar, dan risiko teknis pembangkit.",
      ],
    },
    "Whistle Blowing System": {
      type: "standard",
      breadcrumbs: "Tata Kelola > Whistle Blowing System",
      category: "Integritas & Kepatuhan",
      badge: "Saluran Pelaporan Rahasia",
      title: "Whistle Blowing System (WBS)",
      content: [
        "Whistle Blowing System merupakan mekanisme pelaporan pelanggaran etika, indikasi korupsi, penipuan, atau pelanggaran hukum yang terjamin kerahasiaan dan perlindungan bagi pelapor.",
        "Saluran resmi WBS tersedia melalui portal daring, email khusus kepatuhan: wbs@plnnusadaya.co.id, dan nomor pengaduan terenkripsi.",
      ],
    },
    "Drups": {
      type: "standard",
      breadcrumbs: "Layanan > Drups",
      category: "Layanan Khusus",
      badge: "Zero-Interruption Power",
      title: "Layanan DRUPS (Diesel Rotary UPS)",
      content: [
        "Diesel Rotary Uninterruptible Power Supply (DRUPS) menyediakan perlindungan pasokan daya listrik tanpa kedip (seamless transfer) untuk fasilitas dengan toleransi kegagalan nol.",
        "Sangat ideal bagi pusat data (data center), rumah sakit rujukan, industri semikonduktor, kilang migas, dan bandar udara internasional.",
      ],
    },
    "ListriQu": {
      type: "standard",
      breadcrumbs: "Layanan > ListriQu",
      category: "Layanan Konsumen",
      badge: "Solusi Instalasi Listrik",
      title: "Layanan ListriQu",
      content: [
        "ListriQu adalah aplikasi dan layanan profesional untuk inspeksi, perbaikan, instalasi, dan sertifikasi kelistrikan rumah tangga maupun komersial.",
        "Didukung oleh teknisi berlisensi resmi dengan transparansi harga dan garansi pengerjaan berstandar keselamatan PLN.",
      ],
    },
    "Laporan Triwulan I": {
      type: "standard",
      breadcrumbs: "Laporan Manajemen > Triwulan I",
      category: "Laporan Manajemen",
      badge: "Q1 2026",
      title: "Laporan Kinerja Manajemen Triwulan I",
      content: [
        "Realisasi produksi tenaga listrik mencapai 104,2% dari RKAP triwulanan.",
        "Availability Factor (EAF) pembangkit terjaga di angka 92,8% dengan SFC (Specific Fuel Consumption) BBM yang efisien di seluruh regional kerja.",
      ],
    },
    "Semester I": {
      type: "standard",
      breadcrumbs: "Laporan Manajemen > Semester I",
      category: "Laporan Manajemen",
      badge: "Semester 1 2026",
      title: "Laporan Kinerja Tengah Tahun (Semester I)",
      content: [
        "Pencapaian target pemeliharaan preventif (Preventive Maintenance) tepat waktu sebesar 98,5%.",
        "Kesiapan cadangan daya menyambut pertengahan tahun dan mitigasi gangguan transmisi dengan respon cepat di bawah standar SLA.",
      ],
    },
    "Triwulan III": {
      type: "standard",
      breadcrumbs: "Laporan Manajemen > Triwulan III",
      category: "Laporan Manajemen",
      badge: "Q3 2026",
      title: "Laporan Kinerja Manajemen Triwulan III",
      content: [
        "Penguatan keandalan sistem interkoneksi dan evaluasi performa mesin sewa serta IPP.",
        "Penerapan digitalisasi logsheet WACB dan presensi biometrik lapangan untuk 25.000+ personil teknis.",
      ],
    },
    "Semester II": {
      type: "standard",
      breadcrumbs: "Laporan Manajemen > Semester II",
      category: "Laporan Manajemen",
      badge: "Semester 2 2026",
      title: "Laporan Kinerja Penutupan Tahun (Semester II)",
      content: [
        "Penutupan buku tahunan dengan pertumbuhan laba usaha positif dan pencapaian target Zero Fatal Accident di seluruh unit.",
        "Kesiapan siaga energi Natal & Tahun Baru dengan status siaga penuh (Full Alert) 24/7.",
      ],
    },
    "Info Pengadaan": {
      type: "standard",
      breadcrumbs: "Pengadaan > Info Pengadaan",
      category: "Pengadaan",
      badge: "E-Procurement PLN",
      title: "Informasi Pengadaan Barang & Jasa Resmi",
      content: [
        "Pengumuman tender, prakualifikasi penyedia, dan seleksi pengadaan barang/jasa PT PLN Nusa Daya diselenggarakan secara transparan melalui portal E-Procurement PLN Group.",
        "Menjunjung tinggi prinsip adil, akuntabel, bebas suap, dan mengutamakan Tingkat Komponen Dalam Negeri (TKDN).",
      ],
    },
    "Pedoman Pengadaan": {
      type: "standard",
      breadcrumbs: "Pengadaan > Pedoman Pengadaan",
      category: "Regulasi Pengadaan",
      badge: "Peraturan Direksi",
      title: "Pedoman Pengadaan Barang dan Jasa",
      content: [
        "Pedoman Pengadaan mengatur tata cara pemilihan mitra kerja, evaluasi teknis, negosiasi harga, dan monitoring kontrak berbasis integritas.",
        "Mewajibkan kepatuhan terhadap Pakta Integritas dan Standar Manajemen Anti Penyuapan (SMAP) ISO 37001.",
      ],
    },
    "Privacy Policy": {
      type: "standard",
      breadcrumbs: "Kebijakan > Privacy Policy",
      category: "Legal & Kepatuhan",
      badge: "UU No. 27/2022 PDP",
      title: "Kebijakan Privasi (Privacy Policy)",
      content: [
        "PT PLN Nusa Daya berkomitmen penuh melindungi hak privasi dan kerahasiaan data pribadi pengguna situs web dan portal logsheet.",
        "Data pengguna hanya diproses untuk kepentingan operasional resmi, autentikasi keamanan, dan pelaporan internal tanpa dibagikan kepada pihak ketiga tanpa persetujuan.",
      ],
    },
  };

/* ============================================================
   HEADER NAVIGATION
   href values:
   - "about"/"services"/...  -> section on the landing page
   - "/profil/visi-misi"     -> dedicated page with its own URL
   - "https://..."           -> external site
   ============================================================ */
export const navLinks: CorpNavItem[] = [
  { label: "Home", href: "home", children: [] },
  {
    label: "Profil",
    href: "#",
    children: [
      { label: "Tentang Kami", href: "about" },
      { label: "Visi Misi", href: "/profil/visi-misi" },
      { label: "Tata Nilai", href: "/profil/tata-nilai" },
      { label: "Profil Direksi", href: "direksi" },
      { label: "Profil Komisaris", href: "/profil/profil-komisaris" },
      { label: "Anak Perusahaan", href: "/profil/anak-perusahaan" },
      { label: "Wilayah Kerja", href: "/wilayah-kerja" },
      { label: "Company Profile", href: "/company-profile" },
      { label: "Kontak Kami", href: "contact" },
    ],
  },
  {
    label: "Tata Kelola",
    href: "#",
    children: [
      { label: "Board Manual", href: "/tata-kelola/board-manual" },
      { label: "Code of Conduct", href: "/tata-kelola/code-of-conduct" },
      { label: "Pedoman GCG", href: "/tata-kelola/pedoman-gcg" },
      { label: "Annual Report", href: "/tata-kelola/annual-report" },
      { label: "Sustainability Report", href: "/tata-kelola/sustainability-report" },
      { label: "Risk Management", href: "/tata-kelola/risk-management" },
      { label: "Whistle Blowing System", href: "/tata-kelola/whistle-blowing-system" },
    ],
  },
  {
    label: "Layanan",
    href: "#",
    children: [
      { label: "Asset Management Contract", href: "services" },
      { label: "Drups", href: "/layanan/drups" },
      { label: "ListriQu", href: "/layanan/listriqu" },
    ],
  },
  {
    label: "Laporan Manajemen",
    href: "#",
    children: [
      { label: "Laporan Triwulan I", href: "/laporan/laporan-triwulan-i" },
      { label: "Semester I", href: "/laporan/semester-i" },
      { label: "Triwulan III", href: "/laporan/triwulan-iii" },
      { label: "Semester II", href: "/laporan/semester-ii" },
    ],
  },
  {
    label: "Pengadaan",
    href: "#",
    children: [
      { label: "Info Pengadaan", href: "/pengadaan/info-pengadaan" },
      { label: "Pedoman Pengadaan", href: "/pengadaan/pedoman-pengadaan" },
    ],
  },
  {
    label: "Media",
    href: "#",
    children: [
      { label: "Berita PLN Nusa Daya", href: "news" },
      { label: "Portal Artikel & Blog", href: "/berita" },
    ],
  },
  { label: "Privacy Policy", href: "/privacy-policy", children: [] },
];

/* ============================================================
   PAGE GROUPS — every dropdown item that owns a real URL
   ============================================================ */
export const CORP_GROUPS: Record<string, CorpGroup> = {
  profil: {
    label: "Profil",
    items: [
      { label: "Visi Misi", slug: "visi-misi", docKey: "Visi Misi" },
      { label: "Tata Nilai", slug: "tata-nilai", docKey: "Tata Nilai" },
      { label: "Profil Komisaris", slug: "profil-komisaris", docKey: "Profil Komisaris" },
      { label: "Anak Perusahaan", slug: "anak-perusahaan", docKey: "Anak Perusahaan" },
    ],
  },
  "tata-kelola": {
    label: "Tata Kelola",
    items: [
      { label: "Board Manual", slug: "board-manual", docKey: "Board Manual" },
      { label: "Code of Conduct", slug: "code-of-conduct", docKey: "Code of Conduct" },
      { label: "Pedoman GCG", slug: "pedoman-gcg", docKey: "Pedoman GCG" },
      { label: "Annual Report", slug: "annual-report", docKey: "Annual Report" },
      { label: "Sustainability Report", slug: "sustainability-report", docKey: "Sustainability Report" },
      { label: "Risk Management", slug: "risk-management", docKey: "Risk Management" },
      { label: "Whistle Blowing System", slug: "whistle-blowing-system", docKey: "Whistle Blowing System" },
    ],
  },
  layanan: {
    label: "Layanan",
    items: [
      { label: "Drups", slug: "drups", docKey: "Drups" },
      { label: "ListriQu", slug: "listriqu", docKey: "ListriQu" },
    ],
  },
  laporan: {
    label: "Laporan Manajemen",
    items: [
      { label: "Laporan Triwulan I", slug: "laporan-triwulan-i", docKey: "Laporan Triwulan I" },
      { label: "Semester I", slug: "semester-i", docKey: "Semester I" },
      { label: "Triwulan III", slug: "triwulan-iii", docKey: "Triwulan III" },
      { label: "Semester II", slug: "semester-ii", docKey: "Semester II" },
    ],
  },
  pengadaan: {
    label: "Pengadaan",
    items: [
      { label: "Info Pengadaan", slug: "info-pengadaan", docKey: "Info Pengadaan" },
      { label: "Pedoman Pengadaan", slug: "pedoman-pengadaan", docKey: "Pedoman Pengadaan" },
    ],
  },
};

/* Single page outside a group */
export const CORP_SINGLE_PAGES: Record<string, { label: string; docKey: string }> = {
  "privacy-policy": { label: "Privacy Policy", docKey: "Privacy Policy" },
};

export function getCorpGroupSlugs(group: string): string[] {
  return CORP_GROUPS[group]?.items.map((i) => i.slug) ?? [];
}

export function getCorpItem(group: string, slug: string): CorpGroupItem | null {
  return CORP_GROUPS[group]?.items.find((i) => i.slug === slug) ?? null;
}

export function getCorpDoc(docKey: string): CorpDoc | null {
  return corporateDocuments[docKey] ?? null;
}

export function getCorpPage(group: string, slug: string) {
  const item = getCorpItem(group, slug);
  if (!item) return null;
  const doc = getCorpDoc(item.docKey);
  if (!doc) return null;
  return { group, slug, item, doc, groupLabel: CORP_GROUPS[group].label };
}
