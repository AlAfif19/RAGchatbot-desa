import { describe, expect, it } from "vitest";
import {
  mapAiSettingsFromApi,
  mapChatLogFromApi,
  mapChatbotNumberFromApi,
  mapDashboardSummaryFromApi,
  mapDataSourceFromApi,
  mapFaqFromApi
} from "../lib/api-client";

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
});
