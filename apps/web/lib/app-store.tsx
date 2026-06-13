"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { apiClient, setApiAccessToken, type ApiSnapshot } from "./api-client";
import type {
  AdminUser,
  AiSettings,
  AppState,
  ChatMessage,
  ChatbotNumber,
  ChatbotNumberInput,
  DataSource,
  DataSourceInput,
  DataSourceUploadInput,
  FaqInput,
  FaqItem,
  WhatsappConnection
} from "./types";

const emptyAiSettings: AiSettings = {
  provider: "gemini",
  modelName: "gemini-1.5-flash",
  systemPrompt: "Anda adalah chatbot layanan warga. Jawab hanya berdasarkan konteks.",
  topK: 5,
  faqThreshold: 0.8,
  apiKey: "",
  fallbackAnswer: "Informasi tersebut belum tersedia di sistem."
};

type AppAction =
  | { type: "loginSuccess"; payload: { accessToken: string; admin: AdminUser } }
  | { type: "logout" }
  | { type: "apiLoading" }
  | { type: "apiError"; payload: string }
  | { type: "hydrateFromApi"; payload: ApiSnapshot }
  | { type: "replaceChatbotNumber"; payload: ChatbotNumber }
  | { type: "updateWhatsappConnection"; payload: WhatsappConnection }
  | { type: "replaceDataSource"; payload: DataSource }
  | { type: "replaceFaq"; payload: FaqItem }
  | { type: "replaceChatMessage"; payload: ChatMessage }
  | { type: "deleteChatbotNumber"; payload: string }
  | { type: "deleteDataSource"; payload: string }
  | { type: "deleteFaq"; payload: string }
  | { type: "updateAiSettings"; payload: AiSettings };

type AppStoreContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshFromApi: () => Promise<void>;
  actions: {
    login: (email: string, password: string) => Promise<boolean>;
    addChatbotNumber: (payload: ChatbotNumberInput) => Promise<void>;
    updateChatbotNumber: (payload: ChatbotNumberInput & { id: string }) => Promise<void>;
    deleteChatbotNumber: (id: string) => Promise<void>;
    toggleChatbotNumber: (id: string) => Promise<void>;
    connectWhatsapp: (id: string) => Promise<void>;
    refreshWhatsappConnection: (id: string) => Promise<void>;
    disconnectWhatsapp: (id: string) => Promise<void>;
    addDataSource: (payload: DataSourceInput) => Promise<void>;
    uploadDataSource: (payload: DataSourceUploadInput) => Promise<void>;
    updateDataSource: (payload: DataSourceInput & { id: string }) => Promise<void>;
    deleteDataSource: (id: string) => Promise<void>;
    reindexDataSource: (id: string) => Promise<void>;
    addFaq: (payload: FaqInput) => Promise<void>;
    updateFaq: (payload: FaqInput & { id: string }) => Promise<void>;
    deleteFaq: (id: string) => Promise<void>;
    toggleFaq: (id: string) => Promise<void>;
    markChatAnswerIssue: (id: string) => Promise<void>;
    updateAiSettings: (payload: AiSettings) => Promise<void>;
  };
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function createInitialState(): AppState {
  return {
    isAuthenticated: false,
    adminName: "Administrator",
    apiStatus: "idle",
    chatbotNumbers: [],
    dataSources: [],
    faqs: [],
    chatSessions: [],
    chatMessages: [],
    aiSettings: emptyAiSettings
  };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "loginSuccess":
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        adminName: action.payload.admin.name
      };
    case "logout":
      return createInitialState();
    case "apiLoading":
      return { ...state, apiStatus: "loading", apiMessage: undefined };
    case "apiError":
      return { ...state, apiStatus: "error", apiMessage: action.payload };
    case "hydrateFromApi":
      return {
        ...state,
        apiStatus: "connected",
        apiMessage: undefined,
        dashboardSummary: action.payload.dashboardSummary,
        chatbotNumbers: action.payload.chatbotNumbers,
        dataSources: action.payload.dataSources,
        faqs: action.payload.faqs,
        chatMessages: action.payload.chatMessages,
        aiSettings: action.payload.aiSettings,
        chatSessions: action.payload.chatMessages.map((message) => ({
          id: message.sessionId,
          chatbotNumberId: action.payload.chatbotNumbers[0]?.id ?? "",
          citizenPhone: message.citizenPhone ?? "",
          status: "active" as const,
          lastMessageAt: message.createdAt
        }))
      };
    case "replaceChatbotNumber":
      return {
        ...state,
        chatbotNumbers: state.chatbotNumbers.some((item) => item.id === action.payload.id)
          ? state.chatbotNumbers.map((item) => (item.id === action.payload.id ? action.payload : item))
          : [action.payload, ...state.chatbotNumbers]
      };
    case "updateWhatsappConnection":
      return {
        ...state,
        chatbotNumbers: state.chatbotNumbers.map((item) =>
          item.id === action.payload.chatbotNumberId
            ? {
                ...item,
                connectionStatus: action.payload.status,
                connectionQr: action.payload.qr,
                connectionMessage: action.payload.message
              }
            : item
        )
      };
    case "replaceDataSource":
      return {
        ...state,
        dataSources: state.dataSources.some((item) => item.id === action.payload.id)
          ? state.dataSources.map((item) => (item.id === action.payload.id ? action.payload : item))
          : [action.payload, ...state.dataSources]
      };
    case "replaceFaq":
      return {
        ...state,
        faqs: state.faqs.some((item) => item.id === action.payload.id)
          ? state.faqs.map((item) => (item.id === action.payload.id ? action.payload : item))
          : [action.payload, ...state.faqs]
      };
    case "replaceChatMessage":
      return {
        ...state,
        chatMessages: state.chatMessages.map((item) => (item.id === action.payload.id ? action.payload : item))
      };
    case "deleteChatbotNumber":
      return { ...state, chatbotNumbers: state.chatbotNumbers.filter((item) => item.id !== action.payload) };
    case "deleteDataSource":
      return { ...state, dataSources: state.dataSources.filter((item) => item.id !== action.payload) };
    case "deleteFaq":
      return { ...state, faqs: state.faqs.filter((item) => item.id !== action.payload) };
    case "updateAiSettings":
      return { ...state, aiSettings: action.payload };
    default:
      return state;
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);

  const refreshFromApi = async () => {
    if (!state.accessToken) return;
    dispatch({ type: "apiLoading" });
    try {
      const snapshot = await apiClient.snapshot();
      dispatch({ type: "hydrateFromApi", payload: snapshot });
    } catch (error) {
      dispatch({ type: "apiError", payload: error instanceof Error ? error.message : "API tidak tersedia" });
    }
  };

  useEffect(() => {
    if (state.accessToken) {
      void refreshFromApi();
    }
  }, [state.accessToken]);

  const actions = useMemo(
    () => ({
      async login(email: string, password: string) {
        try {
          const response = await apiClient.login(email, password);
          setApiAccessToken(response.access_token);
          dispatch({ type: "loginSuccess", payload: { accessToken: response.access_token, admin: response.admin } });
          return true;
        } catch {
          return false;
        }
      },
      async addChatbotNumber(payload: ChatbotNumberInput) {
        dispatch({ type: "replaceChatbotNumber", payload: await apiClient.createChatbotNumber(payload) });
      },
      async updateChatbotNumber(payload: ChatbotNumberInput & { id: string }) {
        dispatch({ type: "replaceChatbotNumber", payload: await apiClient.updateChatbotNumber(payload) });
      },
      async deleteChatbotNumber(id: string) {
        await apiClient.deleteChatbotNumber(id);
        dispatch({ type: "deleteChatbotNumber", payload: id });
      },
      async toggleChatbotNumber(id: string) {
        const item = state.chatbotNumbers.find((candidate) => candidate.id === id);
        if (!item) return;
        dispatch({
          type: "replaceChatbotNumber",
          payload: await apiClient.updateChatbotNumber({
            ...item,
            status: item.status === "active" ? "inactive" : "active"
          })
        });
      },
      async connectWhatsapp(id: string) {
        dispatch({ type: "updateWhatsappConnection", payload: await apiClient.connectWhatsapp(id) });
      },
      async refreshWhatsappConnection(id: string) {
        dispatch({ type: "updateWhatsappConnection", payload: await apiClient.getWhatsappConnection(id) });
      },
      async disconnectWhatsapp(id: string) {
        dispatch({ type: "updateWhatsappConnection", payload: await apiClient.disconnectWhatsapp(id) });
      },
      async addDataSource(payload: DataSourceInput) {
        dispatch({ type: "replaceDataSource", payload: await apiClient.createDataSource(payload) });
      },
      async uploadDataSource(payload: DataSourceUploadInput) {
        dispatch({ type: "replaceDataSource", payload: await apiClient.uploadDataSource(payload) });
      },
      async updateDataSource(payload: DataSourceInput & { id: string }) {
        dispatch({ type: "replaceDataSource", payload: await apiClient.updateDataSource(payload) });
      },
      async deleteDataSource(id: string) {
        await apiClient.deleteDataSource(id);
        dispatch({ type: "deleteDataSource", payload: id });
      },
      async reindexDataSource(id: string) {
        dispatch({ type: "replaceDataSource", payload: await apiClient.reindexDataSource(id) });
      },
      async addFaq(payload: FaqInput) {
        dispatch({ type: "replaceFaq", payload: await apiClient.createFaq(payload) });
      },
      async updateFaq(payload: FaqInput & { id: string }) {
        dispatch({ type: "replaceFaq", payload: await apiClient.updateFaq(payload) });
      },
      async deleteFaq(id: string) {
        await apiClient.deleteFaq(id);
        dispatch({ type: "deleteFaq", payload: id });
      },
      async toggleFaq(id: string) {
        dispatch({ type: "replaceFaq", payload: await apiClient.toggleFaq(id) });
      },
      async markChatAnswerIssue(id: string) {
        dispatch({ type: "replaceChatMessage", payload: await apiClient.markChatIssue(id) });
      },
      async updateAiSettings(payload: AiSettings) {
        dispatch({ type: "updateAiSettings", payload: await apiClient.updateAiSettings(payload) });
      }
    }),
    [state.chatbotNumbers]
  );

  const value = useMemo(() => ({ state, dispatch, refreshFromApi, actions }), [actions, state]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }
  return context;
}

export type { AppAction };
