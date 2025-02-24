"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { simulateLLMStreaming } from "@/lib/generator";
import { CircleSlash, RotateCcw } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import { useLLMStore, usePromptStore } from "@/store/llm-store";
import { sendMessage, starMessage, unstarMessage } from "@/app/actions";
import { Message } from "@/helper/types";
import { MessageBubble } from "../elements/message-bubble";
import Link from "next/link";

const initialState: Message = {
  id: "",
  input: "",
  response: "",
  model: "",
  createdAt: "",
  star: null,
};

export default function HomePage() {
  const {
    prompts,
    addPrompts,
    setPrompts,
    updateLastAssistantPrompt,
    toggleStar,
  } = usePromptStore();
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
  }, [prompts, autoScroll]);

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

    addPrompts({
      role: "user",
      content: input.trim(),
      model,
      isStarred: false,
    });

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
      if (sendMessageState.response === "ERROR") {
        addPrompts({
          role: "assistant",
          content: "Failed to get a response from the server.",
          model: "",
          isStarred: false,
        });
        return;
      }

      if (!sendMessageState.response && !sendMessageState.model) return;

      addPrompts({
        role: "assistant",
        id: sendMessageState.id,
        content: sendMessageState.model,
        isStarred: false,
      });

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
        updateLastAssistantPrompt(streamedContent);
      }

      setLoading(false);
    };

    doStreaming();
  }, [sendMessageState.response]);

  const handleToggleStar = (id: string) => {
    const message = prompts.find((msg) => msg.id === id);
    if (!message) return;

    toggleStar(id);

    if (message.isStarred) {
      unstarMessage(id);
    } else {
      starMessage(id);
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
            {prompts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Start a conversation by typing a message below!
              </p>
            )}

            {prompts.map((msg, index) => {
              const isUser = msg.role === "user";

              const isStreamingAssistant =
                loading &&
                msg.role === "assistant" &&
                index === prompts.length - 1;

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
            onClick={() => setPrompts([])}
            variant="outline"
            size="icon"
            title="Clear Chat"
            disabled={loading || !prompts.length}
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
