"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Plus, QrCode, RefreshCw, Save, Unplug } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, maskSecret } from "@/lib/format";
import { useAppStore } from "@/lib/app-store";
import { chatbotNumberSchema } from "@/lib/validation";
import type { BotStatus, ChatbotNumber } from "@/lib/types";

const blankForm: {
  botName: string;
  phoneNumber: string;
  provider: string;
  webhookSecret: string;
  status: BotStatus;
} = {
  botName: "",
  phoneNumber: "",
  provider: "WhatsApp Web JS",
  webhookSecret: "wa-web-js-local",
  status: "active"
};

export default function ChatbotNumberPage() {
  const { state, actions } = useAppStore();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () =>
      state.chatbotNumbers.filter((item) =>
        `${item.botName} ${item.phoneNumber} ${item.provider}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, state.chatbotNumbers]
  );
  const pairingTarget = useMemo(
    () => state.chatbotNumbers.find((item) => item.id === pairingId) ?? filtered[0],
    [filtered, pairingId, state.chatbotNumbers]
  );

  useEffect(() => {
    if (!pairingTarget || !["pending_qr", "connecting"].includes(pairingTarget.connectionStatus)) {
      return;
    }
    const timer = window.setInterval(() => {
      void actions.refreshWhatsappConnection(pairingTarget.id);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [actions, pairingTarget]);

  const edit = (item: ChatbotNumber) => {
    setEditingId(item.id);
    setForm({
      botName: item.botName,
      phoneNumber: item.phoneNumber,
      provider: item.provider,
      webhookSecret: item.webhookSecret,
      status: item.status
    });
    setErrors({});
  };

  const reset = () => {
    setEditingId(null);
    setForm(blankForm);
    setErrors({});
  };

  const startPairing = async (item: ChatbotNumber) => {
    setPairingId(item.id);
    await actions.connectWhatsapp(item.id);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = chatbotNumberSchema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (editingId) {
      await actions.updateChatbotNumber({ ...result.data, id: editingId });
    } else {
      await actions.addChatbotNumber(result.data);
    }
    reset();
  };

  return (
    <div>
      <PageHeader
        title="Nomor Chatbot"
        description="Kelola nomor WhatsApp, provider, status koneksi, dan webhook secret chatbot."
        actions={
          <button className="focus-ring rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" onClick={reset}>
            <Plus className="mr-2 inline h-4 w-4" />
            Tambah nomor
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <form className="rounded-md border bg-card p-4" onSubmit={submit}>
          <h2 className="text-sm font-semibold">{editingId ? "Edit nomor" : "Tambah nomor"}</h2>
          <div className="mt-4 space-y-3">
            <Field label="Nama bot" error={errors.botName}>
              <input className="field" value={form.botName} onChange={(event) => setForm({ ...form, botName: event.target.value })} />
            </Field>
            <Field label="Nomor WhatsApp" error={errors.phoneNumber}>
              <input className="field" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
            </Field>
            <input type="hidden" value={form.provider} name="provider" />
            <input type="hidden" value={form.webhookSecret} name="webhookSecret" />
            <Field label="Status aktif">
              <select
                className="field"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as "active" | "inactive" })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </Field>
          </div>
          <button className="focus-ring mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            <Save className="mr-2 inline h-4 w-4" />
            Simpan
          </button>

          <section className="mt-5 rounded-md border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Pairing WhatsApp</h3>
                <p className="mt-1 text-xs text-muted-foreground">{pairingTarget?.botName ?? "Pilih nomor untuk scan QR."}</p>
              </div>
              {pairingTarget ? <StatusBadge value={pairingTarget.connectionStatus} /> : null}
            </div>

            <div className="mt-3 grid min-h-[188px] place-items-center rounded-md border bg-card p-3">
              {pairingTarget?.connectionQr ? (
                <img
                  src={pairingTarget.connectionQr}
                  alt="QR WhatsApp Web untuk menghubungkan nomor chatbot"
                  className="aspect-square w-full max-w-[172px] rounded border bg-white p-2"
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <QrCode className="mx-auto h-10 w-10" />
                  <p className="mt-2">{pairingTarget?.connectionMessage ?? "QR tampil setelah tombol Hubungkan ditekan."}</p>
                </div>
              )}
            </div>

            <p className="mt-2 min-h-8 text-xs text-muted-foreground">
              {pairingTarget?.connectionMessage ?? "Gunakan WhatsApp di ponsel untuk scan QR yang tampil di panel ini."}
            </p>
          </section>
        </form>

        <section>
          <input
            className="focus-ring mb-3 w-full rounded-md border bg-card px-3 py-2 text-sm"
            placeholder="Cari nama bot, nomor, atau provider"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {filtered.length === 0 ? (
            <EmptyState title="Nomor tidak ditemukan" description="Ubah kata kunci pencarian atau tambah nomor baru." />
          ) : (
            <ResponsiveTable>
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Nama bot</th>
                    <th className="px-3 py-3">Nomor</th>
                    <th className="px-3 py-3">Provider</th>
                    <th className="px-3 py-3">Koneksi</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Secret</th>
                    <th className="px-3 py-3">Update</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-3 font-medium">{item.botName}</td>
                      <td className="whitespace-nowrap px-3 py-3">{item.phoneNumber}</td>
                      <td className="px-3 py-3">{item.provider}</td>
                      <td className="px-3 py-3"><StatusBadge value={item.connectionStatus} /></td>
                      <td className="px-3 py-3"><StatusBadge value={item.status} /></td>
                      <td className="whitespace-nowrap px-3 py-3">{maskSecret(item.webhookSecret)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{formatDateTime(item.updatedAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => void startPairing(item)}>
                            <Link2 className="mr-2 inline h-4 w-4" />
                            Hubungkan
                          </button>
                          <button
                            className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => {
                              setPairingId(item.id);
                              void actions.refreshWhatsappConnection(item.id);
                            }}
                          >
                            <RefreshCw className="mr-2 inline h-4 w-4" />
                            Status
                          </button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => void actions.disconnectWhatsapp(item.id)}>
                            <Unplug className="mr-2 inline h-4 w-4" />
                            Putus
                          </button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => edit(item)}>Edit</button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => void actions.toggleChatbotNumber(item.id)}>Toggle</button>
                          <ConfirmDialog title="Hapus nomor?" description={item.botName} onConfirm={() => void actions.deleteChatbotNumber(item.id)}>
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
