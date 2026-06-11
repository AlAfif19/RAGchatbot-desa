"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatPercent } from "@/lib/format";
import { useMockStore } from "@/lib/mock-store";
import type { AnswerSource, ChatMessage } from "@/lib/types";

export default function ChatLogPage() {
  const { state, actions } = useMockStore();
  const [keyword, setKeyword] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [source, setSource] = useState<AnswerSource | "all">("all");
  const [selected, setSelected] = useState<ChatMessage | null>(null);

  const incoming = state.chatMessages.filter((message) => message.direction === "incoming");
  const filtered = useMemo(
    () =>
      incoming.filter((message) => {
        const session = state.chatSessions.find((item) => item.id === message.sessionId);
        const text = `${message.messageText} ${message.answerText ?? ""}`.toLowerCase();
        return (
          text.includes(keyword.toLowerCase()) &&
          (phone ? session?.citizenPhone.includes(phone) : true) &&
          (date ? message.createdAt.startsWith(date) : true) &&
          (source === "all" ? true : message.answerSource === source)
        );
      }),
    [date, incoming, keyword, phone, source, state.chatSessions]
  );

  return (
    <div>
      <PageHeader
        title="Chat Log"
        description="Pantau pertanyaan warga, sumber jawaban AI, konteks RAG, dan tandai jawaban yang perlu ditinjau."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="field" placeholder="Kata kunci" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        <input className="field" placeholder="Nomor warga" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <select className="field" value={source} onChange={(event) => setSource(event.target.value as AnswerSource | "all")}>
          <option value="all">Semua sumber</option>
          <option value="faq">FAQ</option>
          <option value="rag">RAG</option>
          <option value="fallback">Fallback</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Chat tidak ditemukan" description="Ubah filter tanggal, nomor, kata kunci, atau sumber jawaban." />
      ) : (
        <ResponsiveTable>
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Waktu</th>
                <th className="px-3 py-3">Nomor warga</th>
                <th className="px-3 py-3">Pertanyaan</th>
                <th className="px-3 py-3">Jawaban</th>
                <th className="px-3 py-3">Sumber</th>
                <th className="px-3 py-3">Confidence</th>
                <th className="px-3 py-3">Review</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => {
                const session = state.chatSessions.find((item) => item.id === message.sessionId);
                return (
                  <tr key={message.id} className="border-t">
                    <td className="whitespace-nowrap px-3 py-3">{formatDateTime(message.createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{session?.citizenPhone ?? "-"}</td>
                    <td className="max-w-[220px] px-3 py-3">{message.messageText}</td>
                    <td className="max-w-[260px] truncate px-3 py-3">{message.answerText}</td>
                    <td className="px-3 py-3"><StatusBadge value={message.answerSource} /></td>
                    <td className="whitespace-nowrap px-3 py-3">{formatPercent(message.confidenceScore)}</td>
                    <td className="px-3 py-3"><StatusBadge value={message.reviewStatus} label={message.reviewStatus === "issue" ? "Perlu tinjau" : "Normal"} /></td>
                    <td className="px-3 py-3">
                      <button className="focus-ring rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setSelected(message)}>Detail</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTable>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4 sm:items-center sm:justify-center" onClick={() => setSelected(null)}>
          <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-md bg-card p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Detail chat</h2>
                <p className="text-sm text-muted-foreground">{formatDateTime(selected.createdAt)}</p>
              </div>
              <button className="focus-ring rounded-md border px-3 py-2 text-sm" onClick={() => setSelected(null)}>Tutup</button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <Block title="Pertanyaan warga" text={selected.messageText} />
              <Block title="Jawaban chatbot" text={selected.answerText ?? "-"} />
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={selected.answerSource} />
                <StatusBadge value={selected.reviewStatus} label={selected.reviewStatus === "issue" ? "Perlu tinjau" : "Normal"} />
                <span className="rounded-md border px-2 py-0.5 text-xs">Confidence {formatPercent(selected.confidenceScore)}</span>
                {selected.faqMatchScore ? <span className="rounded-md border px-2 py-0.5 text-xs">FAQ {formatPercent(selected.faqMatchScore)}</span> : null}
              </div>
              <div>
                <h3 className="text-sm font-semibold">Konteks RAG</h3>
                {selected.retrievedContext.length === 0 ? (
                  <p className="mt-1 text-muted-foreground">Tidak ada konteks dokumen untuk jawaban ini.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selected.retrievedContext.map((context) => (
                      <div key={context.title} className="rounded-md border p-3">
                        <p className="font-medium">{context.title}</p>
                        <p className="mt-1 text-muted-foreground">{context.snippet}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Score {formatPercent(context.score)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="focus-ring rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => {
                  void actions.markChatAnswerIssue(selected.id);
                  setSelected({ ...selected, reviewStatus: "issue" });
                }}
              >
                Tandai jawaban tidak sesuai
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 rounded-md border bg-background p-3 text-sm">{text}</p>
    </div>
  );
}
