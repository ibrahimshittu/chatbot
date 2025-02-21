"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../elements/toggle-mode";
import { simulateLLMStreaming } from "@/lib/generator";
import { CircleSlash, RotateCcw, Star, StarOff } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLLMStore } from "@/store/llm-store";
import { simulatedResponse } from "@/helper/helper";

// Extend the message type to include isStarred
type Message = {
  role: "user" | "assistant";
  content: string;
  isStarred?: boolean; // Only relevant for assistant messages
};

type Chat = {
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

export default function HomePage({ chats }: { chats: Chat[] }) {
  // If you want to see the pre-fetched chats, log here:
  console.log(chats);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });
  const model = useLLMStore().selectedModel;

  // **Ref** to the scrollable container so we can auto-scroll to bottom
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Whenever messages change, scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send user message + stream assistant response
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // 1) Add user message to the conversation
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    streamingOptions.current.stop = false;

    // 2) Add an "empty" assistant message for streaming
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStarred: false },
    ]);

    // 3) Stream chunks into the last assistant message
    let streamedContent = "";
    for await (const chunk of simulateLLMStreaming(simulatedResponse, {
      delayMs: 200,
      chunkSize: 12,
      stop: streamingOptions.current.stop,
    })) {
      if (streamingOptions.current.stop) break;

      streamedContent += chunk;

      setMessages((prev) => {
        // Update only the last message (the assistant's)
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

  // Stop streaming
  const handleStop = () => {
    streamingOptions.current.stop = true;
    setLoading(false);
  };

  // Reset the conversation
  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  // Toggle star for an assistant message
  const handleToggleStar = (idx: number) => {
    setMessages((prev) => {
      const updated = [...prev];
      const msg = updated[idx];
      if (msg.role === "assistant") {
        msg.isStarred = !msg.isStarred;
      }
      return updated;
    });
  };

  return (
    <div className="relative mx-auto h-screen flex flex-col items-center space-y-4 p-4 max-w-4xl">
      {/* Mode toggle in top-right */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl mt-4">
        {model.length ? model : "Chat with me"}
      </h1>

      {/* Scrollable chat container */}
      <div
        ref={chatContainerRef}
        className="relative w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto space-y-3 bg-white dark:bg-gray-900"
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-300 mt-2">
            No messages yet. Start the conversation below!
          </div>
        )}
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={index}
              className={`flex w-full ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  relative px-4 py-3 rounded-xl shadow-sm
                  max-w-[75%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[45%]
                  ${
                    isUser
                      ? // User bubble
                        "bg-blue-600 text-white animate-in slide-in-from-right-2"
                      : // Assistant bubble
                        "bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-800 animate-in slide-in-from-left-2"
                  }
                `}
              >
                {/* Star button for assistant messages only */}
                {isAssistant && (
                  <button
                    type="button"
                    onClick={() => handleToggleStar(index)}
                    className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-500"
                  >
                    {msg.isStarred ? <StarOff size={18} /> : <Star size={18} />}
                  </button>
                )}

                <Markdown
                  className="prose dark:prose-invert break-words"
                  remarkPlugins={[remarkGfm]}
                >
                  {msg.content}
                </Markdown>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stop + Reset buttons */}
      <div className="flex gap-2">
        {loading && (
          <Button onClick={handleStop} variant="outline" size="icon">
            <CircleSlash />
          </Button>
        )}

        <Button
          disabled={!messages.length}
          onClick={handleReset}
          variant="outline"
          size="icon"
        >
          <RotateCcw />
        </Button>
      </div>

      {/* Message input */}
      <div className="w-full max-w-3xl fixed bottom-5 left-1/2 -translate-x-1/2 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex flex-row w-full items-end gap-2"
        >
          <ModelOptions />
          <Input
            placeholder="Type your message here."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={loading || !input.length}>
            {loading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
