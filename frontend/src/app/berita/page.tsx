"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Search, Calendar, User, Plus, X, ImagePlus } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";
import { fileToDataUrl } from "@/lib/media";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image_url: string;
  created_at: string;
  author: string;
  views: number;
}

export default function BeritaPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Form tambah berita (khusus ADMIN / SUPERADMIN)
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Operasional",
    excerpt: "",
    content: "",
    image_url: "",
    status: "PUBLISHED",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  // Kategori diambil dari database (fallback ke daftar bawaan bila API kosong)
  const [categories, setCategories] = useState<string[]>([
    "Semua",
    "Operasional",
    "Pemeliharaan",
    "K3 & Lingkungan",
    "Corporate News",
  ]);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("pln_user") || "null");
      setIsAdmin(u?.role === "ADMIN" || u?.role === "SUPERADMIN");
    } catch {}
  }, []);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; categories?: string[] }>("/public/article-categories")
      .then((res) => {
        const cats = (res.data?.categories || []).filter(Boolean);
        if (cats.length > 0) setCategories(["Semua", ...cats]);
      })
      .catch(() => {});
  }, []);

  const fetchArticles = () => {
    setLoading(true);
    const catParam = selectedCategory === "Semua" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
    apiClient.get(`/public/articles${catParam}`)
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat berita:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const categoryOptions = categories.filter((c) => c !== "Semua");

  const handlePickCover = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file, 1600, 0.8);
      setForm((f) => ({ ...f, image_url: dataUrl }));
    } catch {
      alert("Gagal membaca file gambar.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        excerpt: form.excerpt.trim() || form.content.slice(0, 160).trim(),
      };
      const res = await apiClient.post("/admin/articles", payload);
      if (res.data?.success) {
        setModalOpen(false);
        setForm({
          title: "",
          category: categoryOptions[0] || "Operasional",
          excerpt: "",
          content: "",
          image_url: "",
          status: "PUBLISHED",
        });
        setSelectedCategory("Semua");
        fetchArticles();
        setSuccessMsg(
          form.status === "PUBLISHED"
            ? "Berita berhasil diterbitkan dan langsung tampil di halaman landing."
            : "Berita disimpan sebagai draf."
        );
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        alert(res.data?.message || "Gagal menyimpan berita.");
      }
    } catch (err) {
      alert("Gagal menyimpan berita: " + err);
    } finally {
      setSaving(false);
    }
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              Wawasan & Berita Operasional
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Publikasi resmi seputar keandalan sistem PLTD, pemeliharaan HAR, dan implementasi K3 Kalimantan 3.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-theme-xs transition-colors hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Berita</span>
            </button>
          )}
        </div>

        {/* Toast sukses */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-success-600 px-4 py-3 text-xs font-bold text-white shadow-theme-md">
            <span className="min-w-0">{successMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-colors">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-500 text-white shadow-theme-xs"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-gray-200 bg-white p-5 animate-pulse dark:border-gray-800 dark:bg-gray-900" />
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition-all hover:border-brand-500/50 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={article.image_url || "/images/portfolio-5.jpg"}
                    alt={article.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/portfolio-5.jpg";
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-700 dark:bg-gray-950/80 dark:text-brand-300">
                    {article.category}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(article.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                      <span>•</span>
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[120px]">{article.author}</span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-brand-500 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {article.excerpt}
                    </p>
                  </div>
                  <Link
                    href={`/berita/${article.slug}`}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-sm font-semibold text-gray-500">Tidak ada artikel yang cocok dengan pencarian.</p>
          </div>
        )}
        {/* Modal Tambah Berita (Admin) */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-[9000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg sm:p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Tambah Berita Baru
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Berita terbit akan langsung tampil di halaman landing.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Judul Berita
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Pemeliharaan Preventif PLTD Tarakan"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Kategori
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                    >
                      <option value="PUBLISHED">Terbitkan</option>
                      <option value="DRAFT">Simpan sebagai Draf</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Ringkasan
                  </label>
                  <input
                    type="text"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Ringkasan singkat (opsional — diambil otomatis dari konten)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Konten Lengkap
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Tulis isi berita lengkap..."
                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Gambar Sampul
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                      {form.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.image_url} alt="Sampul" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImagePlus className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Pilih Foto
                      </button>
                      {form.image_url && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image_url: "" })}
                          className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handlePickCover(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-3.5 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Publikasikan Berita"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
