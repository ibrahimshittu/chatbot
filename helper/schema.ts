export type Message = {
  role: "user" | "assistant";
  content: string;
  isStarred?: boolean;
  id?: string;
};

export type MessageResponse = {
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
};

export type MessageRequest = {
  input: string;
  model: string;
};
