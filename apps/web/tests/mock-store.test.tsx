import { describe, expect, it } from "vitest";
import { createInitialState, mockReducer } from "../lib/mock-store";

describe("mock store reducer", () => {
  it("adds and toggles a chatbot number", () => {
    const added = mockReducer(createInitialState(), {
      type: "addChatbotNumber",
      payload: {
        botName: "Layanan Desa Baru",
        phoneNumber: "+62 812-0000-1111",
        provider: "Meta Cloud API",
        webhookSecret: "new-secret",
        status: "active"
      }
    });

    const created = added.chatbotNumbers.find((item) => item.phoneNumber === "+62 812-0000-1111");
    expect(created).toBeDefined();

    const toggled = mockReducer(added, {
      type: "toggleChatbotNumber",
      payload: created!.id
    });

    expect(toggled.chatbotNumbers.find((item) => item.id === created!.id)?.status).toBe("inactive");
  });

  it("reindexes a data source to processing", () => {
    const initial = createInitialState();
    const target = initial.dataSources[0];

    const next = mockReducer(initial, {
      type: "reindexDataSource",
      payload: target.id
    });

    expect(next.dataSources.find((item) => item.id === target.id)?.indexingStatus).toBe("processing");
  });

  it("marks a chat answer as problematic", () => {
    const initial = createInitialState();
    const target = initial.chatMessages.find((message) => message.direction === "incoming")!;

    const next = mockReducer(initial, {
      type: "markChatAnswerIssue",
      payload: target.id
    });

    expect(next.chatMessages.find((message) => message.id === target.id)?.reviewStatus).toBe("issue");
  });

  it("updates AI settings", () => {
    const next = mockReducer(createInitialState(), {
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
