"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Search, Calendar, User } from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";

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

  // Kategori diambil dari database (fallback ke daftar bawaan bila API kosong)
  const [categories, setCategories] = useState<string[]>([
    "Semua",
    "Operasional",
    "Pemeliharaan",
    "K3 & Lingkungan",
    "Corporate News",
  ]);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; categories?: string[] }>("/public/article-categories")
      .then((res) => {
        const cats = (res.data?.categories || []).filter(Boolean);
        if (cats.length > 0) setCategories(["Semua", ...cats]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
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
  }, [selectedCategory]);

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
        </div>

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
      </div>
    </AppLayout>
  );
}
