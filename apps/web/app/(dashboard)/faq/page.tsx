"use client";

import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import { useMockStore } from "@/lib/mock-store";
import { faqSchema } from "@/lib/validation";
import type { FaqItem } from "@/lib/types";

const blankForm = {
  question: "",
  answer: "",
  keywords: "",
  threshold: 0.8,
  isActive: true
};

export default function FaqPage() {
  const { state, actions } = useMockStore();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      state.faqs.filter((item) =>
        `${item.question} ${item.answer} ${item.keywords}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, state.faqs]
  );

  const reset = () => {
    setEditingId(null);
    setForm(blankForm);
    setErrors({});
  };

  const edit = (item: FaqItem) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      keywords: item.keywords,
      threshold: item.threshold,
      isActive: item.isActive
    });
    setErrors({});
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = faqSchema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (editingId) {
      await actions.updateFaq({ ...result.data, id: editingId });
    } else {
      await actions.addFaq(result.data);
    }
    reset();
  };

  return (
    <div>
      <PageHeader
        title="FAQ"
        description="Atur pertanyaan prioritas yang dipakai sebelum sistem mengambil jawaban dari RAG."
        actions={
          <button className="focus-ring rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" onClick={reset}>
            <Plus className="mr-2 inline h-4 w-4" />
            Tambah FAQ
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form className="rounded-md border bg-card p-4" onSubmit={submit}>
          <h2 className="text-sm font-semibold">{editingId ? "Edit FAQ" : "Tambah FAQ"}</h2>
          <div className="mt-4 space-y-3">
            <Field label="Pertanyaan" error={errors.question}>
              <input className="field" value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} />
            </Field>
            <Field label="Jawaban" error={errors.answer}>
              <textarea className="field min-h-28" value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} />
            </Field>
            <Field label="Kata kunci">
              <input className="field" value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} />
            </Field>
            <Field label="Threshold" error={errors.threshold}>
              <input
                className="field"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.threshold}
                onChange={(event) => setForm({ ...form, threshold: Number(event.target.value) })}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              />
              Aktif
            </label>
          </div>
          <button className="focus-ring mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <Save className="mr-2 inline h-4 w-4" />
            Simpan
          </button>
        </form>

        <section>
          <input
            className="focus-ring mb-3 w-full rounded-md border bg-card px-3 py-2 text-sm"
            placeholder="Cari pertanyaan, jawaban, atau kata kunci"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {filtered.length === 0 ? (
            <EmptyState title="FAQ tidak ditemukan" description="Ubah pencarian atau tambah FAQ baru." />
          ) : (
            <ResponsiveTable>
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Pertanyaan</th>
                    <th className="px-3 py-3">Jawaban</th>
                    <th className="px-3 py-3">Kata kunci</th>
                    <th className="px-3 py-3">Threshold</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Update</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="max-w-[220px] px-3 py-3 font-medium">{item.question}</td>
                      <td className="max-w-[260px] truncate px-3 py-3">{item.answer}</td>
                      <td className="max-w-[180px] truncate px-3 py-3">{item.keywords}</td>
                      <td className="whitespace-nowrap px-3 py-3">{item.threshold.toFixed(2)}</td>
                      <td className="px-3 py-3"><StatusBadge value={item.isActive ? "active" : "inactive"} /></td>
                      <td className="whitespace-nowrap px-3 py-3">{formatDateTime(item.updatedAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => edit(item)}>Edit</button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => void actions.toggleFaq(item.id)}>Toggle</button>
                          <ConfirmDialog title="Hapus FAQ?" description={item.question} onConfirm={() => void actions.deleteFaq(item.id)}>
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
