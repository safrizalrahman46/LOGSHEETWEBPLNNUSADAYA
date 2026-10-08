"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
} from "lucide-react";
import { AppLayout } from "@/layout/AppLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { apiClient } from "@/lib/api";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  status: string;
  author: string;
  views: number;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Operasional",
    excerpt: "",
    content: "",
    image_url: "",
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    apiClient.get("/admin/articles")
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat artikel:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Operasional",
      excerpt: "",
      content: "",
      image_url: "",
      status: "PUBLISHED",
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article: ArticleItem) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      image_url: article.image_url,
      status: article.status,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    try {
      await apiClient.delete(`/admin/articles/${id}`);
      fetchArticles();
    } catch (err: any) {
      alert("Gagal menghapus artikel: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await apiClient.put(`/admin/articles/${editingId}`, formData);
      } else {
        await apiClient.post("/admin/articles", formData);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["SUPERADMIN", "ADMIN"]}>
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                CMS Berita & Publikasi Korporat
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola artikel, pengumuman K3, dan publikasi operasional PLN Nusa Daya Kalimantan 3.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Artikel Baru</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari judul artikel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-xs font-semibold text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
              />
            </div>
            <span className="text-xs font-semibold text-gray-400">
              Total: {filtered.length} Artikel
            </span>
          </div>

          {/* Table of Articles */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th className="py-3.5 px-5">Artikel</th>
                    <th className="py-3.5 px-5">Kategori</th>
                    <th className="py-3.5 px-5">Penulis</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-center">Dibaca</th>
                    <th className="py-3.5 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        Memuat daftar artikel...
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                        <td className="py-3.5 px-5 max-w-xs">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-gray-400 truncate">{item.excerpt}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400">{item.author}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            item.status === "PUBLISHED"
                              ? "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono text-gray-500 dark:text-gray-400">
                          {item.views}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
                              title="Edit Artikel"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg p-1.5 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors"
                              title="Hapus Artikel"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        Tidak ada artikel ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL FORM CREATE / EDIT */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingId ? "Edit Artikel" : "Tambah Artikel Baru"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-error-200 bg-error-50 p-3 text-xs font-semibold text-error-700 dark:border-error-800 dark:bg-error-950/60 dark:text-error-300">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Judul Artikel</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Masukkan judul artikel..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                      >
                        <option value="Operasional">Operasional</option>
                        <option value="Pemeliharaan">Pemeliharaan</option>
                        <option value="K3 & Lingkungan">K3 & Lingkungan</option>
                        <option value="Corporate News">Corporate News</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Status Publikasi</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                      >
                        <option value="PUBLISHED">Published (Tayang)</option>
                        <option value="DRAFT">Draft (Disimpan)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">URL Gambar Sampul (Thumbnail)</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Ringkasan Singkat (Excerpt)</label>
                    <textarea
                      rows={2}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Ringkasan 1-2 kalimat untuk preview di kartu berita..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">Isi Konten Lengkap</label>
                    <textarea
                      rows={6}
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Tuliskan berita lengkap..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Simpan Artikel"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
