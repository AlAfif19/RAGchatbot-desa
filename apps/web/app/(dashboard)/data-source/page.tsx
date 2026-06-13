"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCcw, Save, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { useAppStore } from "@/lib/app-store";
import { dataSourceSchema } from "@/lib/validation";
import type { DataSource, SourceType } from "@/lib/types";

const blankForm = {
  title: "",
  category: "Administrasi",
  sourceType: "text" as SourceType,
  contentText: "",
  fileName: "",
  mimeType: "",
  originalSize: 0
};

const fileTypes: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime"
};

export default function DataSourcePage() {
  const { state, actions } = useAppStore();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      state.dataSources.filter((item) =>
        `${item.title} ${item.category} ${item.sourceType} ${item.indexingStatus}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, state.dataSources]
  );

  const reset = () => {
    setEditingId(null);
    setForm(blankForm);
    setSelectedFile(null);
    setErrors({});
  };

  const edit = (item: DataSource) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      sourceType: item.sourceType,
      contentText: item.contentText ?? "",
      fileName: item.fileName ?? "",
      mimeType: item.mimeType ?? "",
      originalSize: item.originalSize
    });
    setSelectedFile(null);
    setErrors({});
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile && !editingId) {
      const uploadForm = {
        ...form,
        sourceType: "file" as SourceType,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || fileTypes[selectedFile.name.split(".").pop()?.toLowerCase() ?? ""] || "text/plain",
        originalSize: selectedFile.size
      };
      const result = dataSourceSchema.safeParse(uploadForm);
      if (!result.success) {
        setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
        return;
      }
      await actions.uploadDataSource({ title: result.data.title, category: result.data.category, file: selectedFile });
      reset();
      return;
    }
    const result = dataSourceSchema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (editingId) {
      await actions.updateDataSource({ ...result.data, id: editingId });
    } else {
      await actions.addDataSource(result.data);
    }
    reset();
  };

  const updateFile = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    setForm({
      ...form,
      sourceType: "file",
      fileName,
      mimeType: fileTypes[ext] ?? "application/octet-stream",
      originalSize: fileName ? 1500000 : 0
    });
  };

  const chooseFile = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      updateFile("");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    setForm({
      ...form,
      sourceType: "file",
      fileName: file.name,
      mimeType: file.type || fileTypes[ext] || "text/plain",
      originalSize: file.size
    });
  };

  const reindex = (id: string) => {
    void actions.reindexDataSource(id);
  };

  return (
    <div>
      <PageHeader
        title="Sumber Data"
        description="Kelola dokumen, teks manual, dan status indexing sumber pengetahuan chatbot warga."
        actions={
          <button className="focus-ring rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" onClick={reset}>
            <Plus className="mr-2 inline h-4 w-4" />
            Tambah sumber
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form className="rounded-md border bg-card p-4" onSubmit={submit}>
          <h2 className="text-sm font-semibold">{editingId ? "Edit sumber data" : "Tambah sumber data"}</h2>
          <div className="mt-4 space-y-3">
            <Field label="Judul" error={errors.title}>
              <input className="field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Field>
            <Field label="Kategori" error={errors.category}>
              <select className="field" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option>Administrasi</option>
                <option>Kesehatan</option>
                <option>Kegiatan</option>
                <option>Pengumuman</option>
              </select>
            </Field>
            <Field label="Tipe sumber">
              <select className="field" value={form.sourceType} onChange={(event) => setForm({ ...form, sourceType: event.target.value as SourceType })}>
                <option value="text">Teks manual</option>
                <option value="file">File</option>
              </select>
            </Field>
            <Field label="Teks manual" error={errors.contentText}>
              <textarea className="field min-h-24" value={form.contentText} onChange={(event) => setForm({ ...form, contentText: event.target.value })} />
            </Field>
            <Field label="Upload file" error={errors.mimeType ?? errors.fileName}>
              <input
                className="field"
                type="file"
                accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
              />
            </Field>
            <Field label="Nama file" error={errors.mimeType ?? errors.fileName}>
              <input className="field" placeholder="contoh: sop.txt" value={form.fileName} onChange={(event) => updateFile(event.target.value)} />
            </Field>
          </div>
          <button className="focus-ring mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            {selectedFile && !editingId ? <Upload className="mr-2 inline h-4 w-4" /> : <Save className="mr-2 inline h-4 w-4" />}
            {selectedFile && !editingId ? "Upload & index" : "Simpan"}
          </button>
        </form>

        <section>
          <input
            className="focus-ring mb-3 w-full rounded-md border bg-card px-3 py-2 text-sm"
            placeholder="Cari judul, kategori, tipe, atau status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {filtered.length === 0 ? (
            <EmptyState title="Sumber data tidak ditemukan" description="Ubah filter atau tambah sumber data baru." />
          ) : (
            <ResponsiveTable>
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Judul</th>
                    <th className="px-3 py-3">Kategori</th>
                    <th className="px-3 py-3">Tipe</th>
                    <th className="px-3 py-3">Indexing</th>
                    <th className="px-3 py-3">Asli</th>
                    <th className="px-3 py-3">Kompresi</th>
                    <th className="px-3 py-3">Update</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-3 font-medium">{item.title}</td>
                      <td className="px-3 py-3">{item.category}</td>
                      <td className="px-3 py-3">{item.sourceType}</td>
                      <td className="px-3 py-3"><StatusBadge value={item.indexingStatus} /></td>
                      <td className="whitespace-nowrap px-3 py-3">{formatFileSize(item.originalSize)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{formatFileSize(item.compressedSize)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{formatDateTime(item.updatedAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => edit(item)}>Edit</button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => reindex(item.id)}>
                            <RefreshCcw className="mr-2 inline h-4 w-4" />
                            Re-index
                          </button>
                          <ConfirmDialog title="Hapus sumber data?" description={item.title} onConfirm={() => void actions.deleteDataSource(item.id)}>
                            Hapus
                          </ConfirmDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
