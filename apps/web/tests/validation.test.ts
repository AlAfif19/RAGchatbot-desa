import { describe, expect, it } from "vitest";
import {
  aiSettingsSchema,
  chatbotNumberSchema,
  dataSourceSchema,
  faqSchema,
  loginSchema
} from "../lib/validation";

describe("validation schemas", () => {
  it("accepts valid login input", () => {
    expect(loginSchema.parse({ email: "admin@example.com", password: "secret" })).toEqual({
      email: "admin@example.com",
      password: "secret"
    });
  });

  it("rejects invalid WhatsApp phone characters", () => {
    expect(() =>
      chatbotNumberSchema.parse({
        botName: "Layanan Desa",
        phoneNumber: "0812-ABC",
        provider: "Meta Cloud API",
        webhookSecret: "secret",
        status: "active"
      })
    ).toThrow();
  });

  it("rejects unsupported data source file types", () => {
    expect(() =>
      dataSourceSchema.parse({
        title: "Dokumen Rahasia",
        category: "Administrasi",
        sourceType: "file",
        contentText: "",
        fileName: "payload.exe",
        mimeType: "application/x-msdownload",
        originalSize: 1200
      })
    ).toThrow();
  });

  it("rejects FAQ threshold outside 0 to 1", () => {
    expect(() =>
      faqSchema.parse({
        question: "Apa syarat surat domisili?",
        answer: "Bawa KTP dan KK.",
        keywords: "domisili",
        threshold: 1.5,
        isActive: true
      })
    ).toThrow();
  });

  it("requires positive top K for AI settings", () => {
    expect(() =>
      aiSettingsSchema.parse({
        provider: "gemini",
        modelName: "gemini-1.5-flash",
        systemPrompt: "Jawab berdasarkan konteks.",
        topK: 0,
        faqThreshold: 0.8,
        apiKey: "sk-test",
        fallbackAnswer: "Informasi belum tersedia."
      })
    ).toThrow();
  });
});
