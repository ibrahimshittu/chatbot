"use server";

import { MessageRequest, Message, StarredMessage } from "../helper/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

console.log(BASE_URL);

export const getStarredChats = async (): Promise<StarredMessage[]> => {
  const res = await fetch(`${BASE_URL}/api/star`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
};

export const sendMessage = async (
  state: Message,
  payload: MessageRequest
): Promise<Message> => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return {
      ...state,
      response: "ERROR",
    };
  }

  return res.json();
};

export const starMessage = async (chatId: string) => {
  const res = await fetch(`${BASE_URL}/api/star`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });

  if (!res.ok) return;
  return res.json();
};

export const unstarMessage = async (chatId: string) => {
  const res = await fetch(`${BASE_URL}/api/star`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });

  if (!res.ok) return;
  return res.json();
};
