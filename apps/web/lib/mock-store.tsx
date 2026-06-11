"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { apiClient, type ApiSnapshot } from "./api-client";
import {
  mockAiSettings,
  mockChatMessages,
  mockChatSessions,
  mockChatbotNumbers,
  mockDataSources,
  mockFaqs
} from "./mock-data";
import type {
  AiSettings,
  ChatbotNumber,
  ChatbotNumberInput,
  DataSource,
  DataSourceInput,
  DataSourceUploadInput,
  FaqInput,
  FaqItem,
  ChatMessage,
  MockState
} from "./types";

type MockAction =
  | { type: "loginMock" }
  | { type: "logoutMock" }
  | { type: "apiLoading" }
  | { type: "apiOffline"; payload: string }
  | { type: "hydrateFromApi"; payload: ApiSnapshot }
  | { type: "replaceChatbotNumber"; payload: ChatbotNumber }
  | { type: "replaceDataSource"; payload: DataSource }
  | { type: "replaceFaq"; payload: FaqItem }
  | { type: "replaceChatMessage"; payload: ChatMessage }
  | { type: "addChatbotNumber"; payload: ChatbotNumberInput }
  | { type: "updateChatbotNumber"; payload: ChatbotNumberInput & { id: string } }
  | { type: "deleteChatbotNumber"; payload: string }
  | { type: "toggleChatbotNumber"; payload: string }
  | { type: "addDataSource"; payload: DataSourceInput }
  | { type: "updateDataSource"; payload: DataSourceInput & { id: string } }
  | { type: "deleteDataSource"; payload: string }
  | { type: "reindexDataSource"; payload: string }
  | { type: "completeDataSourceIndexing"; payload: string }
  | { type: "addFaq"; payload: FaqInput }
  | { type: "updateFaq"; payload: FaqInput & { id: string } }
  | { type: "deleteFaq"; payload: string }
  | { type: "toggleFaq"; payload: string }
  | { type: "markChatAnswerIssue"; payload: string }
  | { type: "updateAiSettings"; payload: AiSettings };

type MockStoreContextValue = {
  state: MockState;
  dispatch: React.Dispatch<MockAction>;
  refreshFromApi: () => Promise<void>;
  actions: {
    login: (email: string, password: string) => Promise<boolean>;
    addChatbotNumber: (payload: ChatbotNumberInput) => Promise<void>;
    updateChatbotNumber: (payload: ChatbotNumberInput & { id: string }) => Promise<void>;
    deleteChatbotNumber: (id: string) => Promise<void>;
    toggleChatbotNumber: (id: string) => Promise<void>;
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

const MockStoreContext = createContext<MockStoreContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createInitialState(): MockState {
  return {
    isAuthenticated: false,
    adminName: "Admin Desa",
    apiStatus: "idle",
    chatbotNumbers: mockChatbotNumbers,
    dataSources: mockDataSources,
    faqs: mockFaqs,
    chatSessions: mockChatSessions,
    chatMessages: mockChatMessages,
    aiSettings: mockAiSettings
  };
}

export function mockReducer(state: MockState, action: MockAction): MockState {
  switch (action.type) {
    case "loginMock":
      return { ...state, isAuthenticated: true };
    case "logoutMock":
      return { ...state, isAuthenticated: false };
    case "apiLoading":
      return { ...state, apiStatus: "loading", apiMessage: undefined };
    case "apiOffline":
      return { ...state, apiStatus: "offline", apiMessage: action.payload };
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
          chatbotNumberId: state.chatbotNumbers[0]?.id ?? "bot-1",
          citizenPhone: message.citizenPhone ?? "+62",
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
    case "addChatbotNumber": {
      const next: ChatbotNumber = {
        id: id("bot"),
        connectionStatus: action.payload.status === "active" ? "connected" : "disconnected",
        updatedAt: nowIso(),
        ...action.payload
      };
      return { ...state, chatbotNumbers: [next, ...state.chatbotNumbers] };
    }
    case "updateChatbotNumber":
      return {
        ...state,
        chatbotNumbers: state.chatbotNumbers.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                ...action.payload,
                connectionStatus: action.payload.status === "active" ? "connected" : "disconnected",
                updatedAt: nowIso()
              }
            : item
        )
      };
    case "deleteChatbotNumber":
      return {
        ...state,
        chatbotNumbers: state.chatbotNumbers.filter((item) => item.id !== action.payload)
      };
    case "toggleChatbotNumber":
      return {
        ...state,
        chatbotNumbers: state.chatbotNumbers.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                status: item.status === "active" ? "inactive" : "active",
                connectionStatus: item.status === "active" ? "disconnected" : "connected",
                updatedAt: nowIso()
              }
            : item
        )
      };
    case "addDataSource": {
      const next: DataSource = {
        id: id("source"),
        compressedSize: Math.round((action.payload.originalSize || action.payload.contentText?.length || 0) * 0.72),
        indexingStatus: "pending",
        updatedAt: nowIso(),
        ...action.payload
      };
      return { ...state, dataSources: [next, ...state.dataSources] };
    }
    case "updateDataSource":
      return {
        ...state,
        dataSources: state.dataSources.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                ...action.payload,
                compressedSize: Math.round((action.payload.originalSize || action.payload.contentText?.length || 0) * 0.72),
                updatedAt: nowIso()
              }
            : item
        )
      };
    case "deleteDataSource":
      return {
        ...state,
        dataSources: state.dataSources.filter((item) => item.id !== action.payload)
      };
    case "reindexDataSource":
      return {
        ...state,
        dataSources: state.dataSources.map((item) =>
          item.id === action.payload ? { ...item, indexingStatus: "processing", updatedAt: nowIso() } : item
        )
      };
    case "completeDataSourceIndexing":
      return {
        ...state,
        dataSources: state.dataSources.map((item) =>
          item.id === action.payload ? { ...item, indexingStatus: "completed", updatedAt: nowIso() } : item
        )
      };
    case "addFaq": {
      const next: FaqItem = {
        id: id("faq"),
        updatedAt: nowIso(),
        ...action.payload
      };
      return { ...state, faqs: [next, ...state.faqs] };
    }
    case "updateFaq":
      return {
        ...state,
        faqs: state.faqs.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload, updatedAt: nowIso() } : item
        )
      };
    case "deleteFaq":
      return { ...state, faqs: state.faqs.filter((item) => item.id !== action.payload) };
    case "toggleFaq":
      return {
        ...state,
        faqs: state.faqs.map((item) =>
          item.id === action.payload ? { ...item, isActive: !item.isActive, updatedAt: nowIso() } : item
        )
      };
    case "markChatAnswerIssue":
      return {
        ...state,
        chatMessages: state.chatMessages.map((item) =>
          item.id === action.payload ? { ...item, reviewStatus: "issue" } : item
        )
      };
    case "updateAiSettings":
      return { ...state, aiSettings: action.payload };
    default:
      return state;
  }
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mockReducer, undefined, createInitialState);
  const refreshFromApi = async () => {
    dispatch({ type: "apiLoading" });
    try {
      const snapshot = await apiClient.snapshot();
      dispatch({ type: "hydrateFromApi", payload: snapshot });
    } catch (error) {
      dispatch({
        type: "apiOffline",
        payload: error instanceof Error ? error.message : "API tidak tersedia"
      });
    }
  };

  useEffect(() => {
    void refreshFromApi();
  }, []);

  const actions = useMemo(
    () => ({
      async login(email: string, password: string) {
        try {
          await apiClient.login(email, password);
          dispatch({ type: "loginMock" });
          return true;
        } catch {
          return false;
        }
      },
      async addChatbotNumber(payload: ChatbotNumberInput) {
        try {
          dispatch({ type: "replaceChatbotNumber", payload: await apiClient.createChatbotNumber(payload) });
        } catch {
          dispatch({ type: "addChatbotNumber", payload });
        }
      },
      async updateChatbotNumber(payload: ChatbotNumberInput & { id: string }) {
        try {
          dispatch({ type: "replaceChatbotNumber", payload: await apiClient.updateChatbotNumber(payload) });
        } catch {
          dispatch({ type: "updateChatbotNumber", payload });
        }
      },
      async deleteChatbotNumber(id: string) {
        try {
          await apiClient.deleteChatbotNumber(id);
        } finally {
          dispatch({ type: "deleteChatbotNumber", payload: id });
        }
      },
      async toggleChatbotNumber(id: string) {
        const item = state.chatbotNumbers.find((candidate) => candidate.id === id);
        if (!item) return;
        const payload = { ...item, status: item.status === "active" ? "inactive" : "active" } as ChatbotNumberInput & {
          id: string;
        };
        try {
          dispatch({ type: "replaceChatbotNumber", payload: await apiClient.updateChatbotNumber(payload) });
        } catch {
          dispatch({ type: "updateChatbotNumber", payload });
        }
      },
      async addDataSource(payload: DataSourceInput) {
        try {
          dispatch({ type: "replaceDataSource", payload: await apiClient.createDataSource(payload) });
        } catch {
          dispatch({ type: "addDataSource", payload });
        }
      },
      async uploadDataSource(payload: DataSourceUploadInput) {
        try {
          dispatch({ type: "replaceDataSource", payload: await apiClient.uploadDataSource(payload) });
        } catch {
          dispatch({
            type: "addDataSource",
            payload: {
              title: payload.title,
              category: payload.category,
              sourceType: "file",
              contentText: "",
              fileName: payload.file.name,
              mimeType: payload.file.type || "text/plain",
              originalSize: payload.file.size
            }
          });
        }
      },
      async updateDataSource(payload: DataSourceInput & { id: string }) {
        try {
          dispatch({ type: "replaceDataSource", payload: await apiClient.updateDataSource(payload) });
        } catch {
          dispatch({ type: "updateDataSource", payload });
        }
      },
      async deleteDataSource(id: string) {
        try {
          await apiClient.deleteDataSource(id);
        } finally {
          dispatch({ type: "deleteDataSource", payload: id });
        }
      },
      async reindexDataSource(id: string) {
        try {
          dispatch({ type: "replaceDataSource", payload: await apiClient.reindexDataSource(id) });
        } catch {
          dispatch({ type: "reindexDataSource", payload: id });
        }
      },
      async addFaq(payload: FaqInput) {
        try {
          dispatch({ type: "replaceFaq", payload: await apiClient.createFaq(payload) });
        } catch {
          dispatch({ type: "addFaq", payload });
        }
      },
      async updateFaq(payload: FaqInput & { id: string }) {
        try {
          dispatch({ type: "replaceFaq", payload: await apiClient.updateFaq(payload) });
        } catch {
          dispatch({ type: "updateFaq", payload });
        }
      },
      async deleteFaq(id: string) {
        try {
          await apiClient.deleteFaq(id);
        } finally {
          dispatch({ type: "deleteFaq", payload: id });
        }
      },
      async toggleFaq(id: string) {
        try {
          dispatch({ type: "replaceFaq", payload: await apiClient.toggleFaq(id) });
        } catch {
          dispatch({ type: "toggleFaq", payload: id });
        }
      },
      async markChatAnswerIssue(id: string) {
        try {
          dispatch({ type: "replaceChatMessage", payload: await apiClient.markChatIssue(id) });
        } catch {
          dispatch({ type: "markChatAnswerIssue", payload: id });
        }
      },
      async updateAiSettings(payload: AiSettings) {
        try {
          dispatch({ type: "updateAiSettings", payload: await apiClient.updateAiSettings(payload) });
        } catch {
          dispatch({ type: "updateAiSettings", payload });
        }
      }
    }),
    [state.chatbotNumbers]
  );

  const value = useMemo(() => ({ state, dispatch, refreshFromApi, actions }), [actions, state]);

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error("useMockStore must be used inside MockStoreProvider");
  }
  return context;
}

export type { MockAction };
