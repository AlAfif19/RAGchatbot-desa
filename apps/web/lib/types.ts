export type BotStatus = "active" | "inactive";
export type ConnectionStatus = "connected" | "disconnected";
export type IndexingStatus = "pending" | "processing" | "completed" | "failed";
export type SourceType = "text" | "file" | "url";
export type AnswerSource = "faq" | "rag" | "fallback" | "system";
export type MessageDirection = "incoming" | "outgoing";
export type ReviewStatus = "normal" | "issue";

export type ChatbotNumber = {
  id: string;
  botName: string;
  phoneNumber: string;
  provider: string;
  webhookSecret: string;
  status: BotStatus;
  connectionStatus: ConnectionStatus;
  updatedAt: string;
};

export type DataSource = {
  id: string;
  title: string;
  category: string;
  sourceType: SourceType;
  contentText?: string;
  fileName?: string;
  mimeType?: string;
  originalSize: number;
  compressedSize: number;
  indexingStatus: IndexingStatus;
  updatedAt: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  threshold: number;
  isActive: boolean;
  updatedAt: string;
};

export type ChatSession = {
  id: string;
  chatbotNumberId: string;
  citizenPhone: string;
  citizenName?: string;
  status: "active" | "closed";
  lastMessageAt: string;
};

export type RetrievedContext = {
  title: string;
  snippet: string;
  score: number;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  citizenPhone?: string;
  direction: MessageDirection;
  messageText: string;
  answerText?: string;
  answerSource: AnswerSource;
  confidenceScore?: number;
  retrievedContext: RetrievedContext[];
  faqMatchScore?: number;
  reviewStatus: ReviewStatus;
  createdAt: string;
};

export type AiSettings = {
  provider: string;
  modelName: string;
  systemPrompt: string;
  topK: number;
  faqThreshold: number;
  apiKey: string;
  fallbackAnswer: string;
};

export type DashboardSummary = {
  totalChatsToday: number;
  answeredByFaq: number;
  answeredByRag: number;
  activeDataSources: number;
  activeBotCount: number;
};

export type MockState = {
  isAuthenticated: boolean;
  adminName: string;
  apiStatus: "idle" | "loading" | "connected" | "offline" | "error";
  apiMessage?: string;
  dashboardSummary?: DashboardSummary;
  chatbotNumbers: ChatbotNumber[];
  dataSources: DataSource[];
  faqs: FaqItem[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  aiSettings: AiSettings;
};

export type ChatbotNumberInput = Pick<
  ChatbotNumber,
  "botName" | "phoneNumber" | "provider" | "webhookSecret" | "status"
>;

export type DataSourceInput = Pick<
  DataSource,
  "title" | "category" | "sourceType" | "contentText" | "fileName" | "mimeType" | "originalSize"
>;

export type DataSourceUploadInput = Pick<DataSource, "title" | "category"> & {
  file: File;
};

export type FaqInput = Pick<FaqItem, "question" | "answer" | "keywords" | "threshold" | "isActive">;
