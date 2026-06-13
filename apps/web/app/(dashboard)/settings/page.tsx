"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useAppStore } from "@/lib/app-store";
import { aiSettingsSchema } from "@/lib/validation";

export default function SettingsPage() {
  const { state, actions } = useAppStore();
  const [form, setForm] = useState(state.aiSettings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = aiSettingsSchema.safeParse(form);
    if (!result.success) {
      setSaved(false);
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    await actions.updateAiSettings(result.data);
    setErrors({});
    setSaved(true);
  };

  return (
    <div>
      <PageHeader
        title="Pengaturan AI"
        description="Atur provider LLM, prompt dasar, retrieval, threshold FAQ, dan jawaban fallback."
      />

      <form className="max-w-3xl rounded-md border bg-card p-4" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Provider LLM" error={errors.provider}>
            <select className="field" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })}>
              <option value="gemini">Gemini</option>
              <option value="openai-compatible">OpenAI Compatible</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </Field>
          <Field label="Nama model" error={errors.modelName}>
            <input className="field" value={form.modelName} onChange={(event) => setForm({ ...form, modelName: event.target.value })} />
          </Field>
          <Field label="Top K retrieval" error={errors.topK}>
            <input className="field" type="number" min="1" value={form.topK} onChange={(event) => setForm({ ...form, topK: Number(event.target.value) })} />
          </Field>
          <Field label="Threshold FAQ" error={errors.faqThreshold}>
            <input
              className="field"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.faqThreshold}
              onChange={(event) => setForm({ ...form, faqThreshold: Number(event.target.value) })}
            />
          </Field>
          <Field label="API Key AI" error={errors.apiKey}>
            <input
              className="field"
              type="password"
              value={form.apiKey}
              placeholder="Masukkan API key provider AI"
              autoComplete="off"
              onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="System prompt" error={errors.systemPrompt}>
            <textarea className="field min-h-36" value={form.systemPrompt} onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })} />
          </Field>
          <Field label="Jawaban fallback" error={errors.fallbackAnswer}>
            <textarea className="field min-h-24" value={form.fallbackAnswer} onChange={(event) => setForm({ ...form, fallbackAnswer: event.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="focus-ring rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <Save className="mr-2 inline h-4 w-4" />
            Simpan pengaturan
          </button>
          {saved ? <span className="text-sm text-emerald-700">Pengaturan tersimpan.</span> : null}
        </div>
      </form>
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
