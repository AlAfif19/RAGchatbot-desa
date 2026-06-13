import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiClient,
  mapAiSettingsFromApi,
  mapChatLogFromApi,
  mapChatbotNumberFromApi,
  mapDashboardSummaryFromApi,
  mapDataSourceFromApi,
  mapFaqFromApi,
  mapWhatsappConnectionFromApi
} from "../lib/api-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client mappers", () => {
  it("maps chatbot number fields to frontend shape", () => {
    expect(
      mapChatbotNumberFromApi({
        id: "bot-1",
        bot_name: "Layanan Desa",
        phone_number: "+62 812",
        provider: "Meta Cloud API",
        webhook_secret: "secret",
        status: "active",
        connection_status: "connected",
        updated_at: "2026-06-11"
      })
    ).toMatchObject({
      botName: "Layanan Desa",
      phoneNumber: "+62 812",
      webhookSecret: "secret",
      connectionStatus: "connected",
      updatedAt: "2026-06-11"
    });
  });

  it("maps dashboard summary and settings", () => {
    expect(
      mapDashboardSummaryFromApi({
        total_chats_today: 2,
        answered_by_faq: 1,
        answered_by_rag: 1,
        active_data_sources: 2,
        active_bot_count: 1
      })
    ).toEqual({
      totalChatsToday: 2,
      answeredByFaq: 1,
      answeredByRag: 1,
      activeDataSources: 2,
      activeBotCount: 1
    });

    expect(
      mapAiSettingsFromApi({
        provider: "gemini",
        model_name: "gemini-1.5-flash",
        system_prompt: "Prompt",
        top_k: 5,
        faq_threshold: 0.8,
        api_key: "sk-test",
        fallback_answer: "Fallback"
      })
    ).toMatchObject({ modelName: "gemini-1.5-flash", topK: 5, faqThreshold: 0.8, apiKey: "sk-test" });
  });

  it("maps data source, FAQ, and chat log", () => {
    expect(
      mapDataSourceFromApi({
        id: "source-1",
        title: "SOP",
        category: "Administrasi",
        source_type: "file",
        content_text: null,
        file_name: "sop.pdf",
        mime_type: "application/pdf",
        original_size: 1000,
        compressed_size: 700,
        indexing_status: "completed",
        updated_at: "2026-06-11"
      })
    ).toMatchObject({ sourceType: "file", fileName: "sop.pdf", indexingStatus: "completed" });

    expect(
      mapFaqFromApi({
        id: "faq-1",
        question: "Q",
        answer: "A",
        keywords: "k",
        threshold: 0.8,
        is_active: true,
        updated_at: "2026-06-11"
      })
    ).toMatchObject({ isActive: true, updatedAt: "2026-06-11" });

    expect(
      mapChatLogFromApi({
        id: "msg-1",
        session_id: "session-1",
        citizen_phone: "+62",
        message_text: "Q",
        answer_text: "A",
        answer_source: "faq",
        confidence_score: 0.9,
        retrieved_context: [],
        faq_match_score: 0.9,
        review_status: "normal",
        created_at: "2026-06-11"
      })
    ).toMatchObject({ sessionId: "session-1", citizenPhone: "+62", messageText: "Q", answerSource: "faq" });
  });

  it("maps WhatsApp connection fields to frontend shape", () => {
    expect(
      mapWhatsappConnectionFromApi({
        chatbot_number_id: "bot-1",
        status: "pending_qr",
        qr: "data:image/png;base64,qr-test",
        message: "Scan QR WhatsApp untuk menghubungkan nomor."
      })
    ).toEqual({
      chatbotNumberId: "bot-1",
      status: "pending_qr",
      qr: "data:image/png;base64,qr-test",
      message: "Scan QR WhatsApp untuk menghubungkan nomor."
    });
  });

  it("starts WhatsApp QR pairing through the backend API", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        chatbot_number_id: "bot-1",
        status: "pending_qr",
        qr: "data:image/png;base64,qr-test",
        message: "Scan QR WhatsApp untuk menghubungkan nomor."
      })
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiClient.connectWhatsapp("bot-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8002/api/chatbot-numbers/bot-1/connect",
      expect.objectContaining({ method: "POST" })
    );
    expect(result.status).toBe("pending_qr");
    expect(result.qr).toBe("data:image/png;base64,qr-test");
  });

  it("includes backend detail in failed API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Saat ini upload hanya mendukung TXT, MD, dan CSV" })
      }))
    );

    await expect(apiClient.uploadDataSource({ title: "SOP", category: "Administrasi", file: new File(["x"], "sop.pdf") })).rejects.toThrow(
      "API 400: Saat ini upload hanya mendukung TXT, MD, dan CSV"
    );
  });
});
