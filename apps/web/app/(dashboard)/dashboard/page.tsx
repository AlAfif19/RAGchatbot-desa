"use client";

import { Bot, Database, HelpCircle, MessageSquareText, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatPercent, formatShortDate } from "@/lib/format";
import { useAppStore } from "@/lib/app-store";

export default function DashboardPage() {
  const { state } = useAppStore();
  const incomingMessages = state.chatMessages.filter((message) => message.direction === "incoming");
  const today = "2026-06-11";
  const totalChatsToday =
    state.dashboardSummary?.totalChatsToday ?? incomingMessages.filter((message) => message.createdAt.startsWith(today)).length;
  const answeredByFaq =
    state.dashboardSummary?.answeredByFaq ?? incomingMessages.filter((message) => message.answerSource === "faq").length;
  const answeredByRag =
    state.dashboardSummary?.answeredByRag ?? incomingMessages.filter((message) => message.answerSource === "rag").length;
  const activeDataSources =
    state.dashboardSummary?.activeDataSources ?? state.dataSources.filter((item) => item.indexingStatus === "completed").length;
  const activeBotCount =
    state.dashboardSummary?.activeBotCount ?? state.chatbotNumbers.filter((item) => item.status === "active").length;
  const chartDays = [
    { date: "2026-06-07", total: 8 },
    { date: "2026-06-08", total: 13 },
    { date: "2026-06-09", total: 17 },
    { date: "2026-06-10", total: 11 },
    { date: "2026-06-11", total: Math.max(totalChatsToday, 3) }
  ];
  const max = Math.max(...chartDays.map((day) => day.total));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan operasional chatbot warga, sumber jawaban, status data, dan pertanyaan terbaru."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Chat hari ini" value={totalChatsToday} helper="Dari log chat tersimpan" icon={MessageSquareText} />
        <MetricCard label="Dijawab FAQ" value={answeredByFaq} helper="FAQ prioritas" icon={HelpCircle} />
        <MetricCard label="Dijawab RAG" value={answeredByRag} helper="Berdasarkan dokumen" icon={Sparkles} />
        <MetricCard label="Sumber aktif" value={activeDataSources} helper="Index completed" icon={Database} />
        <MetricCard label="Nomor aktif" value={activeBotCount} helper="Status chatbot" icon={Bot} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <section className="rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Grafik chat per hari</h2>
          <div className="mt-4 flex h-56 items-end gap-3">
            {chartDays.map((day) => (
              <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-md bg-muted">
                  <div
                    className="w-full rounded-md bg-primary"
                    style={{ height: `${Math.max(12, (day.total / max) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{formatShortDate(day.date)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Pertanyaan terbaru</h2>
          <ResponsiveTable>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Waktu</th>
                  <th className="px-3 py-3">Nomor warga</th>
                  <th className="px-3 py-3">Pertanyaan</th>
                  <th className="px-3 py-3">Sumber</th>
                  <th className="px-3 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {incomingMessages.map((message) => {
                  const session = state.chatSessions.find((item) => item.id === message.sessionId);
                  return (
                    <tr key={message.id} className="border-t">
                      <td className="whitespace-nowrap px-3 py-3">{formatDateTime(message.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3">{session?.citizenPhone ?? "-"}</td>
                      <td className="px-3 py-3">{message.messageText}</td>
                      <td className="px-3 py-3">
                        <StatusBadge value={message.answerSource} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{formatPercent(message.confidenceScore)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTable>
        </section>
      </div>
    </div>
  );
}
