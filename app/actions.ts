"use server";

import { MessageRequest, MessageResponse } from "../helper/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

export const getChats = async () => {
  const res = await fetch(`${BASE_URL}/api/chat`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
};

export const getStarredChats = async () => {
  const res = await fetch(`${BASE_URL}/api/star`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch starred chats");
  return res.json();
};

export const sendMessage = async (
  prev: MessageRequest,
  body: MessageRequest
): Promise<MessageResponse> => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

export const starMessage = async (chatId: string) => {
  const res = await fetch(`${BASE_URL}/api/star`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });

  if (!res.ok) throw new Error("Failed to star message");
  return res.json();
};

export const unstarMessage = async (chatId: string) => {
  const res = await fetch(`${BASE_URL}/api/star`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });

  if (!res.ok) throw new Error("Failed to unstar message");
  return res.json();
};
