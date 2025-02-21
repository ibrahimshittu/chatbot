export interface Message {
  role: "user" | "assistant";
  content: string;
  isStarred?: boolean;
  model?: string;
  id?: string;
}

export interface MessageResponse {
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
