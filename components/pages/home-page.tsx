"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { simulateLLMStreaming } from "@/lib/generator";
import { CircleSlash, RotateCcw } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import { useLLMStore } from "@/store/llm-store";
import { sendMessage, starMessage, unstarMessage } from "@/app/actions";
import { Message, MessageResponse } from "@/helper/types";
import { MessageBubble } from "../elements/message-bubble";
import Link from "next/link";

const initialState: MessageResponse = {
  id: "",
  input: "",
  response: "",
  model: "",
  createdAt: "",
  star: null,
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const model = useLLMStore().selectedModel;

  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });

  // Handle auto-scrolling, and override if user scrolls up
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    setAutoScroll(isAtBottom);
  };

  // Send messages and stream the assistant response
  const [sendMessageState, sendMessageAction] = useActionState(
    sendMessage,
    initialState
  );

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", model: model, content: input.trim() },
    ]);
    setInput("");

    startTransition(() => {
      sendMessageAction({ input: input.trim(), model });
    });

    streamingOptions.current.stop = false;
  };

  const handleStop = () => {
    streamingOptions.current.stop = true;
    setLoading(false);
  };

  useEffect(() => {
    const doStreaming = async () => {
      if (!sendMessageState.response) return;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          id: sendMessageState.id,
          content: "",
          model: sendMessageState.model,
          isStarred: false,
        },
      ]);

      setLoading(true);

      let streamedContent = "";
      for await (const chunk of simulateLLMStreaming(
        sendMessageState.response,
        {
          delayMs: 200,
          chunkSize: 12,
          stop: streamingOptions.current.stop,
        }
      )) {
        if (streamingOptions.current.stop) break;

        streamedContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: streamedContent,
            };
          }
          return updated;
        });
      }

      setLoading(false);
    };

    doStreaming();
  }, [sendMessageState.response]);

  const handleToggleStar = (id: string) => {
    const message = messages.find((msg) => msg.id === id);
    if (!message) return;

    try {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === id) {
            return { ...msg, isStarred: !msg.isStarred };
          }
          return msg;
        })
      );

      if (message.isStarred) {
        unstarMessage(id);
      } else {
        starMessage(id);
      }
    } catch (error) {
      return;
    }
  };

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <h1 className="font-bold text-2xl">{model || "Chat with me"}</h1>

      <div className="flex flex-col items-center space-y-4 max-w-xl w-full">
        <Link
          href="/starred"
          className="transition-transform duration-300 transform hover:underline justify-start flex items-center w-full"
        >
          <span>🌟</span>
          View Starred Messages
        </Link>

        <div
          className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto no-scrollbar"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <div className="space-y-4 w-full">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";

              const isStreamingAssistant =
                loading &&
                msg.role === "assistant" &&
                index === messages.length - 1;

              return (
                <MessageBubble
                  key={index}
                  msg={msg}
                  isUser={isUser}
                  isStreamingAssistant={isStreamingAssistant}
                  model={model}
                  onToggleStar={handleToggleStar}
                />
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full">
          {loading && (
            <Button
              onClick={handleStop}
              variant="outline"
              size="icon"
              title="Stop"
            >
              <CircleSlash />
            </Button>
          )}
          <Button
            onClick={() => setMessages([])}
            variant="outline"
            size="icon"
            title="Clear Chat"
            disabled={loading || !messages.length}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="max-w-xl w-full fixed bottom-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-row w-full items-end gap-2"
        >
          <ModelOptions />
          <Input
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
