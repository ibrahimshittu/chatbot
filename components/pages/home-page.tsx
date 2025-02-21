"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../elements/toggle-mode";
import { simulateLLMStreaming } from "@/lib/generator";
import { CircleSlash, RotateCcw, Star } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLLMStore } from "@/store/llm-store";
import { sendMessage } from "@/app/actions";
import { Message, MessageResponse } from "@/helper/schema";
import { useOptimistic } from "react";

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

    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
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

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl">{model || "Chat with me"}</h1>

      <div className="flex flex-col items-center space-y-4 max-w-xl w-full">
        <div
          className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto no-scrollbar"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";

              const isStreamingAssistant =
                loading &&
                msg.role === "assistant" &&
                index === messages.length - 1;

              return (
                <div
                  key={index}
                  className={`flex w-full ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      relative px-4 py-3 rounded-xl shadow-md
                      max-w-[75%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-[48%]
                      ${
                        isUser
                          ? "bg-gray-700 dark:bg-gray-300 text-white dark:text-black rounded-br-none animate-in slide-in-from-right-2"
                          : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-bl-none animate-in slide-in-from-left-2"
                      }
                    `}
                  >
                    <Markdown
                      className="break-words"
                      remarkPlugins={[remarkGfm]}
                    >
                      {msg.content}
                    </Markdown>

                    {msg.role === "assistant" && !isStreamingAssistant && (
                      <button
                        className="absolute bottom-2 right-2"
                        // onClick={() => handleToggleStar(index)}
                        title="Star message"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            msg.isStarred ? "text-yellow-400" : "text-gray-400"
                          }`}
                          fill="currentColor"
                        />
                      </button>
                    )}
                  </div>
                </div>
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
