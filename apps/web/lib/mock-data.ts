import type { AiSettings, ChatMessage, ChatSession, ChatbotNumber, DataSource, FaqItem } from "./types";

export const mockChatbotNumbers: ChatbotNumber[] = [
  {
    id: "bot-1",
    botName: "Layanan Desa Sukamaju",
    phoneNumber: "+62 812-3456-7001",
    provider: "Meta Cloud API",
    webhookSecret: "desa-sukamaju-secret",
    status: "active",
    connectionStatus: "connected",
    updatedAt: "2026-06-11T08:10:00+07:00"
  },
  {
    id: "bot-2",
    botName: "Info Posyandu Sukamaju",
    phoneNumber: "+62 812-3456-7002",
    provider: "Provider WA Lokal",
    webhookSecret: "posyandu-secret",
    status: "inactive",
    connectionStatus: "disconnected",
    updatedAt: "2026-06-10T15:30:00+07:00"
  }
];

export const mockDataSources: DataSource[] = [
  {
    id: "source-1",
    title: "SOP Surat Domisili",
    category: "Administrasi",
    sourceType: "file",
    fileName: "sop-surat-domisili.pdf",
    mimeType: "application/pdf",
    originalSize: 1840000,
    compressedSize: 1210000,
    indexingStatus: "completed",
    updatedAt: "2026-06-10T10:00:00+07:00"
  },
  {
    id: "source-2",
    title: "Jadwal Posyandu Juni 2026",
    category: "Kesehatan",
    sourceType: "text",
    contentText: "Posyandu Balita dilaksanakan setiap Rabu minggu kedua pukul 08.00 WIB.",
    originalSize: 4200,
    compressedSize: 4200,
    indexingStatus: "completed",
    updatedAt: "2026-06-09T09:00:00+07:00"
  },
  {
    id: "source-3",
    title: "Pengumuman Kerja Bakti",
    category: "Kegiatan",
    sourceType: "file",
    fileName: "kerja-bakti.jpg",
    mimeType: "image/jpeg",
    originalSize: 3200000,
    compressedSize: 760000,
    indexingStatus: "processing",
    updatedAt: "2026-06-11T07:45:00+07:00"
  }
];

export const mockFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Apa syarat membuat surat domisili?",
    answer: "Warga membawa fotokopi KTP, KK, dan surat pengantar RT/RW ke kantor desa.",
    keywords: "domisili,surat,keterangan",
    threshold: 0.82,
    isActive: true,
    updatedAt: "2026-06-08T11:00:00+07:00"
  },
  {
    id: "faq-2",
    question: "Kapan jadwal posyandu?",
    answer: "Posyandu dilaksanakan setiap Rabu minggu kedua pukul 08.00 WIB di balai desa.",
    keywords: "posyandu,kesehatan,balita",
    threshold: 0.78,
    isActive: true,
    updatedAt: "2026-06-09T09:20:00+07:00"
  },
  {
    id: "faq-3",
    question: "Apa syarat mengurus KTP?",
    answer: "Bawa fotokopi KK, surat pengantar RT/RW, dan datang sesuai jam layanan.",
    keywords: "ktp,administrasi,dukcapil",
    threshold: 0.8,
    isActive: true,
    updatedAt: "2026-06-09T14:00:00+07:00"
  },
  {
    id: "faq-4",
    question: "Berapa kontak kantor desa?",
    answer: "Kontak resmi kantor desa adalah 021-555-0101 pada jam kerja.",
    keywords: "kontak,telepon,kantor desa",
    threshold: 0.76,
    isActive: false,
    updatedAt: "2026-06-05T10:00:00+07:00"
  }
];

export const mockChatSessions: ChatSession[] = [
  {
    id: "session-1",
    chatbotNumberId: "bot-1",
    citizenPhone: "+62 813-1111-2222",
    citizenName: "Warga 001",
    status: "active",
    lastMessageAt: "2026-06-11T09:15:00+07:00"
  },
  {
    id: "session-2",
    chatbotNumberId: "bot-1",
    citizenPhone: "+62 813-3333-4444",
    citizenName: "Warga 002",
    status: "active",
    lastMessageAt: "2026-06-11T09:25:00+07:00"
  },
  {
    id: "session-3",
    chatbotNumberId: "bot-1",
    citizenPhone: "+62 813-5555-6666",
    status: "closed",
    lastMessageAt: "2026-06-10T16:20:00+07:00"
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sessionId: "session-1",
    direction: "incoming",
    messageText: "Apa syarat membuat surat domisili?",
    answerText: "Warga membawa fotokopi KTP, KK, dan surat pengantar RT/RW ke kantor desa.",
    answerSource: "faq",
    confidenceScore: 0.91,
    retrievedContext: [],
    faqMatchScore: 0.91,
    reviewStatus: "normal",
    createdAt: "2026-06-11T09:15:00+07:00"
  },
  {
    id: "msg-2",
    sessionId: "session-2",
    direction: "incoming",
    messageText: "Jadwal posyandu bulan ini kapan?",
    answerText: "Posyandu Balita dilaksanakan Rabu minggu kedua pukul 08.00 WIB di balai desa.",
    answerSource: "rag",
    confidenceScore: 0.84,
    retrievedContext: [
      {
        title: "Jadwal Posyandu Juni 2026",
        snippet: "Posyandu Balita dilaksanakan setiap Rabu minggu kedua pukul 08.00 WIB.",
        score: 0.87
      }
    ],
    reviewStatus: "normal",
    createdAt: "2026-06-11T09:25:00+07:00"
  },
  {
    id: "msg-3",
    sessionId: "session-3",
    direction: "incoming",
    messageText: "Ada bantuan pupuk minggu ini?",
    answerText: "Informasi tersebut belum tersedia di sistem. Silakan hubungi kantor desa pada jam layanan.",
    answerSource: "fallback",
    confidenceScore: 0.18,
    retrievedContext: [],
    reviewStatus: "normal",
    createdAt: "2026-06-10T16:20:00+07:00"
  }
];

export const mockAiSettings: AiSettings = {
  provider: "gemini",
  modelName: "gemini-1.5-flash",
  systemPrompt:
    "Anda adalah chatbot layanan warga. Jawab singkat, jelas, sopan, dan hanya berdasarkan konteks yang diberikan.",
  topK: 5,
  faqThreshold: 0.8,
  apiKey: "",
  fallbackAnswer: "Informasi tersebut belum tersedia di sistem. Silakan hubungi kantor desa pada jam layanan."
};
