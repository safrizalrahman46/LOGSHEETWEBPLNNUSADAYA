"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Edit3, Trash2, Search, X, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api";

export interface CrudField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "password" | "number" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
}

interface MasterCrudProps {
  title: string;
  subtitle?: string;
  endpoint: string;
  listKey?: string;
  itemKey?: string;
  rowKey?: string;
  columns: CrudColumn[];
  fields: CrudField[];
  readOnly?: boolean;
  createLabel?: string;
  emptyText?: string;
  onFieldChange?: (
    name: string,
    value: string,
    form: Record<string, string>
  ) => Record<string, string> | void;
  mapRow?: (row: Record<string, unknown>) => Record<string, string>;
  tableMinWidth?: string;
}

export function MasterCrud({
  title,
  subtitle,
  endpoint,
  listKey = "data",
  itemKey = "data",
  rowKey = "id",
  columns,
  fields,
  readOnly = false,
  createLabel = "Tambah Baru",
  emptyText = "Belum ada data.",
  onFieldChange,
  mapRow,
  tableMinWidth = "min-w-[820px]",
}: MasterCrudProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const applyChange = useCallback(
    (name: string, value: string) => {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        const extra = onFieldChange ? onFieldChange(name, value, next) : undefined;
        return extra ? { ...next, ...extra } : next;
      });
    },
    [onFieldChange]
  );

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(endpoint);
      if (res.data?.success) {
        setRows(res.data[listKey] || []);
        setErrorMsg(null);
      } else {
        setErrorMsg(res.data?.message || "Gagal memuat data");
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal memuat data dari server";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint, listKey]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some(
        (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  function openCreate() {
    setEditingId(null);
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.name] = f.type === "select" ? f.options?.[0]?.value || "" : "";
    });
    setFormData(init);
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditingId(row[rowKey] as string | number);
    let init: Record<string, string> = {};
    fields.forEach((f) => {
      const v = row[f.name];
      init[f.name] = v === null || v === undefined ? "" : String(v);
    });
    if (mapRow) init = { ...init, ...mapRow(row) };
    setFormData(init);
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setModalError(null);

    // Kolom angka harus dikirim sebagai number, bukan string.
    const payload: Record<string, unknown> = { ...formData };
    fields.forEach((f) => {
      if (f.type === "number") {
        const raw = (formData[f.name] || "").trim();
        payload[f.name] = raw === "" ? 0 : Number(raw);
      }
    });

    try {
      if (editingId) {
        await apiClient.put(`${endpoint}/${editingId}`, payload);
      } else {
        await apiClient.post(endpoint, payload);
      }
      setIsModalOpen(false);
      fetchRows();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal menyimpan data";
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Record<string, unknown>) {
    const label = String(row.machine_name || row.name || row.title || row[rowKey]);
    if (!window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    try {
      await apiClient.delete(`${endpoint}/${row[rowKey]}`);
      fetchRows();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal menghapus data";
      alert(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchRows}
            title="Muat ulang data"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {!readOnly && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-theme-xs transition-colors hover:bg-brand-600 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>{createLabel}</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari data..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`${tableMinWidth} divide-y divide-gray-100 [&_td]:whitespace-nowrap dark:divide-gray-800`}
          >
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {c.label}
                  </th>
                ))}
                {!readOnly && (
                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (readOnly ? 0 : 1)}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (readOnly ? 0 : 1)}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {errorMsg || emptyText}
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={String(row[rowKey] ?? idx)}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {c.render
                          ? c.render(row)
                          : String(row[c.key] ?? "-")}
                      </td>
                    ))}
                    {!readOnly && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(row)}
                            title="Ubah"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/15 dark:text-brand-400"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            title="Hapus"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-error-600 transition-colors hover:bg-error-50 dark:hover:bg-error-500/15 dark:text-error-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Menampilkan {filtered.length} dari {rows.length} data
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg sm:p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingId ? "Ubah" : "Tambah"} {title.replace(/^Data\s+/i, "")}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Lengkapi kolom berikut lalu simpan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-3 py-2.5 text-xs font-semibold text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {f.label}
                    {f.required && <span className="text-error-500"> *</span>}
                  </label>
                  {f.type === "select" ? (
                    <select
                      value={formData[f.name] || ""}
                      onChange={(e) => applyChange(f.name, e.target.value)}
                      required={f.required}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    >
                      {(f.options || []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={formData[f.name] || ""}
                      onChange={(e) => applyChange(f.name, e.target.value)}
                      required={f.required}
                      rows={3}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    />
                  ) : (
                    <input
                      type={f.type === "password" ? "password" : f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={formData[f.name] || ""}
                      onChange={(e) => applyChange(f.name, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                      autoComplete={
                        f.type === "password" ? "new-password" : "off"
                      }
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    />
                  )}
                  {f.hint && (
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      {f.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MasterCrud;
