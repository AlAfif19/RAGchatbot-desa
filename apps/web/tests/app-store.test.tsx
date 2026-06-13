import { describe, expect, it } from "vitest";
import { createInitialState, appReducer } from "../lib/app-store";

describe("app store reducer", () => {
  it("hydrates production data from the API snapshot", () => {
    const next = appReducer(createInitialState(), {
      type: "hydrateFromApi",
      payload: {
        dashboardSummary: {
          totalChatsToday: 0,
          answeredByFaq: 0,
          answeredByRag: 0,
          activeDataSources: 0,
          activeBotCount: 0
        },
        chatbotNumbers: [],
        dataSources: [],
        faqs: [],
        chatMessages: [],
        aiSettings: createInitialState().aiSettings
      }
    });

    expect(next.apiStatus).toBe("connected");
    expect(next.chatbotNumbers).toEqual([]);
  });

  it("stores authenticated admin session", () => {
    const next = appReducer(createInitialState(), {
      type: "loginSuccess",
      payload: {
        accessToken: "token",
        admin: { id: "1", name: "Administrator", email: "admin@example.com", role: "admin" }
      }
    });

    expect(next.isAuthenticated).toBe(true);
    expect(next.adminName).toBe("Administrator");
  });

  it("stores WhatsApp QR pairing status on chatbot number", () => {
    const initial = appReducer(createInitialState(), {
      type: "replaceChatbotNumber",
      payload: {
        id: "bot-1",
        botName: "Layanan Desa",
        phoneNumber: "+62 812",
        provider: "WhatsApp Web JS",
        webhookSecret: "secret",
        status: "active",
        connectionStatus: "disconnected",
        updatedAt: "2026-06-13"
      }
    });

    const next = appReducer(initial, {
      type: "updateWhatsappConnection",
      payload: {
        chatbotNumberId: "bot-1",
        status: "pending_qr",
        qr: "data:image/png;base64,qr-test",
        message: "Scan QR WhatsApp untuk menghubungkan nomor."
      }
    });

    const updated = next.chatbotNumbers.find((item) => item.id === "bot-1");
    expect(updated?.connectionStatus).toBe("pending_qr");
    expect(updated?.connectionQr).toBe("data:image/png;base64,qr-test");
    expect(updated?.connectionMessage).toBe("Scan QR WhatsApp untuk menghubungkan nomor.");
  });

  it("updates AI settings", () => {
    const next = appReducer(createInitialState(), {
      type: "updateAiSettings",
      payload: {
        provider: "openai-compatible",
        modelName: "gpt-compatible",
        systemPrompt: "Jawab singkat berdasarkan data desa.",
        topK: 4,
        faqThreshold: 0.75,
        apiKey: "sk-test",
        fallbackAnswer: "Informasi belum tersedia di sistem."
      }
    });

    expect(next.aiSettings.provider).toBe("openai-compatible");
    expect(next.aiSettings.topK).toBe(4);
  });
});
