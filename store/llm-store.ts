import { LLMStore, PromptStore } from "@/helper/types";
import { create } from "zustand";

export const useLLMStore = create<LLMStore>((set) => ({
  selectedModel: "gpt-3.5-turbo",
  setSelectedModel: (model) => set({ selectedModel: model }),
}));

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  addPrompts: (prompt) =>
    set((state) => ({
      prompts: [
        ...state.prompts,
        ...(Array.isArray(prompt) ? prompt : [prompt]),
      ],
    })),

  setPrompts: (prompts) => {
    set(() => ({ prompts }));
  },

  updateLastAssistantPrompt: (streamedContent: string) =>
    set((state) => {
      const updated = [...state.prompts];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: streamedContent,
        };
      }
      return { prompts: updated };
    }),

  toggleStar: (id) =>
    set((state) => ({
      prompts: state.prompts.map((msg) =>
        msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
      ),
    })),
}));
