export interface Prompt {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isStarred?: boolean;
  model?: string;
}

export interface Message {
  id: string;
  input: string;
  response: string;
  model: string;
  createdAt: string;
  star?: {
    id: string;
    chatId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}
export interface StarredMessage {
  id: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  chat?: {
    id: string;
    input: string;
    response: string;
    model: string;
    createdAt: string;
  } | null;
}

export interface MessageRequest {
  input: string;
  model: string;
}

export interface LLMStore {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export interface PromptStore {
  prompts: Prompt[];
  addPrompts: (prompt: Prompt | Prompt[]) => void;
  setPrompts: (prompts: Prompt[]) => void;
  updateLastAssistantPrompt: (streamedContent: string) => void;
  toggleStar: (id: string) => void;
}
