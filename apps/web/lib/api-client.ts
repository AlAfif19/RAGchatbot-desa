import type {
  AiSettings,
  AdminUser,
  AnswerSource,
  BotStatus,
  ChatMessage,
  ChatbotNumber,
  ChatbotNumberInput,
  ConnectionStatus,
  DashboardSummary,
  DataSource,
  DataSourceInput,
  DataSourceUploadInput,
  FaqInput,
  FaqItem,
  IndexingStatus,
  ReviewStatus,
  SourceType,
  WhatsappConnection
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002";
let accessToken: string | undefined;

export function setApiAccessToken(token: string | undefined) {
  accessToken = token;
}

type ApiChatbotNumber = {
  id: string;
  bot_name: string;
  phone_number: string;
  provider: string;
  webhook_secret: string;
  status: string;
  connection_status: string;
  updated_at: string;
};

type ApiDataSource = {
  id: string;
  title: string;
  category: string;
  source_type: string;
  content_text?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  original_size: number;
  compressed_size: number;
  indexing_status: string;
  updated_at: string;
};

type ApiFaq = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  threshold: number;
  is_active: boolean;
  updated_at: string;
};

type ApiChatLog = {
  id: string;
  session_id: string;
  citizen_phone: string;
  message_text: string;
  answer_text: string;
  answer_source: string;
  confidence_score?: number | null;
  retrieved_context: { title: string; snippet: string; score: number }[];
  faq_match_score?: number | null;
  review_status: string;
  created_at: string;
};

type ApiAiSettings = {
  provider: string;
  model_name: string;
  system_prompt: string;
  top_k: number;
  faq_threshold: number;
  api_key: string;
  fallback_answer: string;
};

type ApiDashboardSummary = {
  total_chats_today: number;
  answered_by_faq: number;
  answered_by_rag: number;
  active_data_sources: number;
  active_bot_count: number;
};

type ApiLoginResponse = {
  access_token: string;
  token_type: string;
  admin: AdminUser;
};

type ApiWhatsappConnection = {
  chatbot_number_id: string;
  status: string;
  qr?: string | null;
  message: string;
};

export type ApiSnapshot = {
  dashboardSummary: DashboardSummary;
  chatbotNumbers: ChatbotNumber[];
  dataSources: DataSource[];
  faqs: FaqItem[];
  chatMessages: ChatMessage[];
  aiSettings: AiSettings;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: isFormData
      ? {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(init?.headers ?? {})
        }
      : {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(init?.headers ?? {})
        }
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function mapChatbotNumberFromApi(item: ApiChatbotNumber): ChatbotNumber {
  return {
    id: item.id,
    botName: item.bot_name,
    phoneNumber: item.phone_number,
    provider: item.provider,
    webhookSecret: item.webhook_secret,
    status: item.status as BotStatus,
    connectionStatus: item.connection_status as ConnectionStatus,
    updatedAt: item.updated_at
  };
}

export function mapDataSourceFromApi(item: ApiDataSource): DataSource {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    sourceType: item.source_type as SourceType,
    contentText: item.content_text ?? undefined,
    fileName: item.file_name ?? undefined,
    mimeType: item.mime_type ?? undefined,
    originalSize: item.original_size,
    compressedSize: item.compressed_size,
    indexingStatus: item.indexing_status as IndexingStatus,
    updatedAt: item.updated_at
  };
}

export function mapFaqFromApi(item: ApiFaq): FaqItem {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    keywords: item.keywords,
    threshold: item.threshold,
    isActive: item.is_active,
    updatedAt: item.updated_at
  };
}

export function mapChatLogFromApi(item: ApiChatLog): ChatMessage {
  return {
    id: item.id,
    sessionId: item.session_id,
    citizenPhone: item.citizen_phone,
    direction: "incoming",
    messageText: item.message_text,
    answerText: item.answer_text,
    answerSource: item.answer_source as AnswerSource,
    confidenceScore: item.confidence_score ?? undefined,
    retrievedContext: item.retrieved_context,
    faqMatchScore: item.faq_match_score ?? undefined,
    reviewStatus: item.review_status as ReviewStatus,
    createdAt: item.created_at
  };
}

export function mapAiSettingsFromApi(item: ApiAiSettings): AiSettings {
  return {
    provider: item.provider,
    modelName: item.model_name,
    systemPrompt: item.system_prompt,
    topK: item.top_k,
    faqThreshold: item.faq_threshold,
    apiKey: item.api_key,
    fallbackAnswer: item.fallback_answer
  };
}

export function mapDashboardSummaryFromApi(item: ApiDashboardSummary): DashboardSummary {
  return {
    totalChatsToday: item.total_chats_today,
    answeredByFaq: item.answered_by_faq,
    answeredByRag: item.answered_by_rag,
    activeDataSources: item.active_data_sources,
    activeBotCount: item.active_bot_count
  };
}

export function mapWhatsappConnectionFromApi(item: ApiWhatsappConnection): WhatsappConnection {
  return {
    chatbotNumberId: item.chatbot_number_id,
    status: item.status as WhatsappConnection["status"],
    qr: item.qr ?? null,
    message: item.message
  };
}

function chatbotNumberToApi(input: ChatbotNumberInput) {
  return {
    bot_name: input.botName,
    phone_number: input.phoneNumber,
    provider: input.provider,
    webhook_secret: input.webhookSecret,
    status: input.status
  };
}

function dataSourceToApi(input: DataSourceInput) {
  return {
    title: input.title,
    category: input.category,
    source_type: input.sourceType,
    content_text: input.contentText ?? null,
    file_name: input.fileName ?? null,
    mime_type: input.mimeType ?? null,
    original_size: input.originalSize
  };
}

function faqToApi(input: FaqInput) {
  return {
    question: input.question,
    answer: input.answer,
    keywords: input.keywords,
    threshold: input.threshold,
    is_active: input.isActive
  };
}

function aiSettingsToApi(input: AiSettings): ApiAiSettings {
  return {
    provider: input.provider,
    model_name: input.modelName,
    system_prompt: input.systemPrompt,
    top_k: input.topK,
    faq_threshold: input.faqThreshold,
    api_key: input.apiKey,
    fallback_answer: input.fallbackAnswer
  };
}

export const apiClient = {
  login(email: string, password: string) {
    return request<ApiLoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  async snapshot(): Promise<ApiSnapshot> {
    const [dashboardSummary, chatbotNumbers, dataSources, faqs, chatMessages, aiSettings] = await Promise.all([
      request<ApiDashboardSummary>("/api/dashboard/summary").then(mapDashboardSummaryFromApi),
      request<ApiChatbotNumber[]>("/api/chatbot-numbers").then((items) => items.map(mapChatbotNumberFromApi)),
      request<ApiDataSource[]>("/api/data-sources").then((items) => items.map(mapDataSourceFromApi)),
      request<ApiFaq[]>("/api/faqs").then((items) => items.map(mapFaqFromApi)),
      request<ApiChatLog[]>("/api/chat-logs").then((items) => items.map(mapChatLogFromApi)),
      request<ApiAiSettings>("/api/settings/ai").then(mapAiSettingsFromApi)
    ]);
    return { dashboardSummary, chatbotNumbers, dataSources, faqs, chatMessages, aiSettings };
  },
  createChatbotNumber(input: ChatbotNumberInput) {
    return request<ApiChatbotNumber>("/api/chatbot-numbers", {
      method: "POST",
      body: JSON.stringify(chatbotNumberToApi(input))
    }).then(mapChatbotNumberFromApi);
  },
  updateChatbotNumber(input: ChatbotNumberInput & { id: string }) {
    return request<ApiChatbotNumber>(`/api/chatbot-numbers/${input.id}`, {
      method: "PUT",
      body: JSON.stringify({ id: input.id, ...chatbotNumberToApi(input) })
    }).then(mapChatbotNumberFromApi);
  },
  deleteChatbotNumber(id: string) {
    return request<void>(`/api/chatbot-numbers/${id}`, { method: "DELETE" });
  },
  connectWhatsapp(id: string) {
    return request<ApiWhatsappConnection>(`/api/chatbot-numbers/${id}/connect`, { method: "POST" }).then(
      mapWhatsappConnectionFromApi
    );
  },
  getWhatsappConnection(id: string) {
    return request<ApiWhatsappConnection>(`/api/chatbot-numbers/${id}/connection`).then(mapWhatsappConnectionFromApi);
  },
  disconnectWhatsapp(id: string) {
    return request<ApiWhatsappConnection>(`/api/chatbot-numbers/${id}/disconnect`, { method: "POST" }).then(
      mapWhatsappConnectionFromApi
    );
  },
  createDataSource(input: DataSourceInput) {
    return request<ApiDataSource>("/api/data-sources", {
      method: "POST",
      body: JSON.stringify(dataSourceToApi(input))
    }).then(mapDataSourceFromApi);
  },
  uploadDataSource(input: DataSourceUploadInput) {
    const formData = new FormData();
    formData.append("title", input.title);
    formData.append("category", input.category);
    formData.append("file", input.file);
    return request<ApiDataSource>("/api/data-sources/upload", {
      method: "POST",
      body: formData
    }).then(mapDataSourceFromApi);
  },
  updateDataSource(input: DataSourceInput & { id: string }) {
    return request<ApiDataSource>(`/api/data-sources/${input.id}`, {
      method: "PUT",
      body: JSON.stringify({ id: input.id, ...dataSourceToApi(input) })
    }).then(mapDataSourceFromApi);
  },
  deleteDataSource(id: string) {
    return request<void>(`/api/data-sources/${id}`, { method: "DELETE" });
  },
  reindexDataSource(id: string) {
    return request<ApiDataSource>(`/api/data-sources/${id}/reindex`, { method: "POST" }).then(mapDataSourceFromApi);
  },
  createFaq(input: FaqInput) {
    return request<ApiFaq>("/api/faqs", {
      method: "POST",
      body: JSON.stringify(faqToApi(input))
    }).then(mapFaqFromApi);
  },
  updateFaq(input: FaqInput & { id: string }) {
    return request<ApiFaq>(`/api/faqs/${input.id}`, {
      method: "PUT",
      body: JSON.stringify({ id: input.id, ...faqToApi(input) })
    }).then(mapFaqFromApi);
  },
  deleteFaq(id: string) {
    return request<void>(`/api/faqs/${id}`, { method: "DELETE" });
  },
  toggleFaq(id: string) {
    return request<ApiFaq>(`/api/faqs/${id}/toggle`, { method: "POST" }).then(mapFaqFromApi);
  },
  markChatIssue(id: string) {
    return request<ApiChatLog>(`/api/chat-logs/${id}/mark-issue`, { method: "POST" }).then(mapChatLogFromApi);
  },
  updateAiSettings(input: AiSettings) {
    return request<ApiAiSettings>("/api/settings/ai", {
      method: "PUT",
      body: JSON.stringify(aiSettingsToApi(input))
    }).then(mapAiSettingsFromApi);
  }
};
