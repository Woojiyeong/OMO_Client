import { create } from "zustand";

import {
  createAiChatSession,
  requestAiChatRecommendations,
} from "@/features/ai/api";

import type { AiCoordiDetail, AiCoordiSummary } from "./types";

type AiChatState = {
  sessionId: string | null;
  lastQuery: string;
  results: AiCoordiSummary[];
  details: Record<string, AiCoordiDetail>;
  loading: boolean;
  error: string | null;
  requestRecommendations: (query: string) => Promise<void>;
  getDetail: (id: string) => AiCoordiDetail | undefined;
};

export const useAiChatStore = create<AiChatState>((set, get) => ({
  sessionId: null,
  lastQuery: "",
  results: [],
  details: {},
  loading: false,
  error: null,
  requestRecommendations: async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    set({ loading: true, error: null, lastQuery: trimmed });

    try {
      const currentSessionId =
        get().sessionId ?? (await createAiChatSession()).sessionId;
      const result = await requestAiChatRecommendations({
        message: trimmed,
        sessionId: currentSessionId,
      });

      set((state) => ({
        sessionId: result.sessionId ?? currentSessionId,
        results: result.summaries,
        details: { ...state.details, ...result.details },
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "추천 결과를 불러오지 못했어요.",
      });
      throw error;
    }
  },
  getDetail: (id) => get().details[id],
}));
