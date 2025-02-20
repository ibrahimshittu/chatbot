import { create } from "zustand";

interface LLMStore {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useLLMStore = create<LLMStore>((set) => ({
  selectedModel: "gpt-3.5-turbo",
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
