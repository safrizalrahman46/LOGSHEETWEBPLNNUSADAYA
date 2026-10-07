"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Calendar, User, Eye, Share2, Tag } from "lucide-react";
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

export default function DetailBeritaPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient.get(`/public/articles/${slug}`)
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm font-semibold">
        Memuat artikel...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-slate-300">Artikel tidak ditemukan</p>
        <Link href="/berita" className="px-4 py-2 bg-[#004581] rounded-lg text-xs font-semibold text-white">
          Kembali ke Daftar Berita
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/berita"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ffc709]" />
            <span className="font-extrabold text-sm tracking-tight text-white">PLN NUSA DAYA</span>
          </div>
        </div>

        <Link
          href="/login"
          className="px-4 py-1.5 rounded-lg bg-[#004581] hover:bg-[#005daa] text-white text-xs font-semibold shadow-md transition-all"
        >
          Login Pegawai
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-[#ffc709]">
            <Tag className="w-3.5 h-3.5" />
            <span>{article.category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">{article.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                {new Date(article.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>{article.views} kali dibaca</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[450px]">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-invert max-w-none text-slate-300 text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* Share / Back Bar */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/berita"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Semua Berita</span>
          </Link>
          <div className="text-xs text-slate-500">
            Kategori: <span className="text-[#ffc709] font-medium">{article.category}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} PT PLN Nusa Daya • Wilayah Kerja Kalimantan 3</p>
      </footer>
    </div>
  );
}
