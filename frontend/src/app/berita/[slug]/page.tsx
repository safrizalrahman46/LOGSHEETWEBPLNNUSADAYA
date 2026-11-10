"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Share2,
  Tag,
  Clock,
  Check,
  Newspaper,
  Sparkles,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { apiClient } from "@/lib/api";

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
  author: string;
  views: number;
}

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image_url: string;
  created_at: string;
  views: number;
}

export default function DetailBeritaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    // 1. Fetch Article Detail
    apiClient
      .get(`/public/articles/${slug}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setArticle(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat artikel:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch Related / Recent Articles
    apiClient
      .get("/public/articles?limit=6")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const others = res.data.data
            .filter((a: RelatedArticle) => a.slug !== slug)
            .slice(0, 3);
          setRelatedArticles(others);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined" && article) {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${article.title} - Baca selengkapnya di: ${window.location.href}`
      )}`;
      window.open(url, "_blank");
    }
  };

  const getCategoryBadgeClass = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes("pemeliharaan") || cat.includes("har")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
    }
    if (cat.includes("operasional") || cat.includes("mesin")) {
      return "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-800/60";
    }
    if (cat.includes("k3") || cat.includes("lingkungan")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800/60";
    }
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Memuat publikasi artikel...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg py-20 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400">
            <Newspaper className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Artikel Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Publikasi berita yang Anda cari mungkin telah diarsipkan atau alamat URL telah berubah.
          </p>
          <div className="pt-2">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Wawasan &amp; Berita</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* 1. BREADCRUMBS & TOP NAVIGATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex-wrap">
            <Link
              href="/"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Portal
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <Link
              href="/berita"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Berita &amp; Wawasan
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-200 font-bold truncate max-w-[200px] sm:max-w-[280px]">
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-theme-xs transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Semua Berita</span>
            </Link>

            <button
              onClick={handleCopyLink}
              title="Salin tautan artikel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-theme-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success-600" />
                  <span className="text-success-600 font-bold">Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. ARTICLE HEADER CARD */}
        <article className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-10 shadow-theme-xs space-y-6">
          {/* Category & Read Time Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${getCategoryBadgeClass(
                article.category
              )}`}
            >
              <Tag className="h-3 w-3" />
              <span>{article.category}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
              <Clock className="h-3 w-3 text-brand-500" />
              <span>± {readingTimeMin} menit baca</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold">
              <Eye className="h-3 w-3 text-sky-500" />
              <span>{article.views.toLocaleString("id-ID")} pembaca</span>
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-gray-900 dark:text-white leading-[1.2] tracking-tight">
            {article.title}
          </h1>

          {/* Author & Publication Timestamp Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 dark:border-gray-800 py-3.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 ring-2 ring-brand-100 dark:ring-brand-500/30 font-black">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-xs">
                  {article.author || "Divisi Pemeliharaan KIT Kalimantan 3"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Tim Publikasi Operasional PLTD
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  {new Date(article.created_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <button
                onClick={handleShareWhatsApp}
                title="Bagikan ke WhatsApp"
                className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Featured Cover Image */}
          {article.image_url && (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 shadow-theme-xs">
              <img
                src={article.image_url}
                alt={article.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/portfolio-5.jpg";
                }}
                className="w-full max-h-[500px] object-cover object-center transition-transform duration-500 hover:scale-101"
              />
              <div className="p-3 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800 italic flex items-center justify-between">
                <span>Dokumentasi Pelaksanaan Lapangan • PT PLN Services</span>
                <span className="font-mono text-[10px]">WACB DIGIKIT</span>
              </div>
            </div>
          )}

          {/* Executive Summary / Excerpt Callout */}
          {article.excerpt && (
            <div className="p-5 rounded-2xl bg-brand-50/50 dark:bg-brand-500/10 border-l-4 border-brand-500 text-gray-700 dark:text-gray-200 text-sm leading-relaxed font-medium">
              <span className="font-bold text-brand-700 dark:text-brand-300 block mb-1">
                Ringkasan Eksekutif:
              </span>
              {article.excerpt}
            </div>
          )}

          {/* 3. ARTICLE CONTENT BODY */}
          <div className="article-body prose max-w-none text-gray-700 dark:text-gray-300 text-base sm:text-[17px] leading-[1.8] space-y-5 font-normal pt-2">
            {article.content.split("\n\n").map((para, pIdx) => {
              if (!para.trim()) return null;

              // Deteksi sub-heading
              if (para.startsWith("### ") || para.startsWith("## ")) {
                const headingText = para.replace(/^#+\s*/, "");
                return (
                  <h3
                    key={pIdx}
                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-4 pb-1 border-b border-gray-100 dark:border-gray-800"
                  >
                    {headingText}
                  </h3>
                );
              }

              // Deteksi daftar poin (-)
              if (para.includes("\n- ") || para.startsWith("- ")) {
                const items = para.split("\n").filter((l) => l.trim().startsWith("-"));
                return (
                  <ul key={pIdx} className="list-disc pl-5 space-y-1.5 text-gray-700 dark:text-gray-300">
                    {items.map((item, iIdx) => (
                      <li key={iIdx}>{item.replace(/^-\s*/, "")}</li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="leading-relaxed">
                  {para}
                </p>
              );
            })}
          </div>

          {/* Article Footer & Action Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Bagikan artikel:</span>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success-600" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin" : "Salin URL"}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>Bagikan WhatsApp</span>
              </button>
            </div>

            <Link
              href="/berita"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors text-center justify-center"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Indeks Berita</span>
            </Link>
          </div>
        </article>

        {/* 4. BERITA TERKAIT & TERKINI (RELATED ARTICLES) */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-500" />
                  Wawasan &amp; Berita Terkait Lainnya
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Publikasi terbaru seputar sistem operasional dan pemeliharaan pembangkit
                </p>
              </div>

              <Link
                href="/berita"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/berita/${rel.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-theme-xs hover:shadow-theme-md transition-all hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    {rel.image_url ? (
                      <div className="overflow-hidden rounded-xl h-36 bg-gray-100 dark:bg-gray-800">
                        <img
                          src={rel.image_url}
                          alt={rel.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/portfolio-5.jpg";
                          }}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : null}

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {rel.category}
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {rel.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      {new Date(rel.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      Baca <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
