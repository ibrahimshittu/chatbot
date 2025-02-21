"use client";
import React, {
  useState,
  useRef,
  useActionState,
  startTransition,
} from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../elements/toggle-mode";
import { simulateLLMStreaming } from "@/lib/generator";
import { CircleSlash, RotateCcw } from "lucide-react";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLLMStore } from "@/store/llm-store";
import { simulatedResponse } from "@/helper/helper";
import { sendMessage } from "@/helper/actions";

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
  console.log(chats);
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });

  const model = useLLMStore().selectedModel;

  const [sendMessageState, sendMessageAction, pendingsendMessage] =
    useActionState(sendMessage, {});

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
    startTransition(() => {
      sendMessageAction(input.trim());
    });
    setInput("");
    streamingOptions.current.stop = false;

    setLoading(true);
    setResult("");
    streamingOptions.current.stop = false;

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStarred: false },
    ]);

    let streamedContent = "";
    for await (const chunk of simulateLLMStreaming(simulatedResponse, {
      delayMs: 200,
      chunkSize: 12,
      stop: streamingOptions.current.stop,
    })) {
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

  console.log(sendMessageState);

  const handleStop = () => {
    streamingOptions.current.stop = true;
    setLoading(false);
  };

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl">
        {model.length ? model : "Chat with me"}
      </h1>

      <div className="flex flex-col items-center space-y-4 max-w-xl w-full">
        <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
          <div className="relative flex flex-row justify-between items-start">
            <div className="w-full space-y-4">
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
                      relative px-4 py-3 rounded-xl shadow-md
                      max-w-[75%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-[48%]
                      ${
                        isUser
                          ? "bg-gray-700 dark:bg-gray-300 px-3 py-2 text-white dark:text-black rounded-2xl rounded-br-none shadow-lg animate-in slide-in-from-right-2"
                          : "bg-gray-200 dark:bg-gray-800 px-3 py-2 text-black dark:text-white rounded-2xl rounded-bl-none shadow-lg animate-in slide-in-from-left-2"
                      }
                    `}
                    >
                      <Markdown
                        className="break-words"
                        remarkPlugins={[remarkGfm]}
                      >
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end w-full">
          {loading && (
            <Button onClick={handleStop} variant="outline" size="icon">
              <CircleSlash />
            </Button>
          )}

          <Button
            disabled={loading || !result.length}
            onClick={() => {
              setResult("");
            }}
            variant="outline"
            size="icon"
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
