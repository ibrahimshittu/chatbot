import React from "react";
import { Star } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/helper/types";

interface MessageBubbleProps {
  msg: Message;
  isUser: boolean;
  isStreamingAssistant: boolean;
  model: string | null;
  onToggleStar: (id: string) => void;
}

export function MessageBubble({
  msg,
  isUser,
  isStreamingAssistant,
  model,
  onToggleStar,
}: MessageBubbleProps) {
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          relative px-4 py-3 rounded-xl shadow-md
          max-w-[75%] sm:max-w-[60%] md:max-w-[55%] lg:max-w-[48%]
          ${
            isUser
              ? "bg-gray-700 dark:bg-gray-300 text-white dark:text-black rounded-br-none animate-in slide-in-from-right-2"
              : `bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-bl-none animate-in slide-in-from-left-2 ${
                  isStreamingAssistant ? "animate-pulse" : ""
                } ${
                  msg.model && msg.model !== model
                    ? "pb-6 border-b border-gray-300 dark:border-gray-700"
                    : ""
                }`
          }
        `}
      >
        <Markdown className="break-words" remarkPlugins={[remarkGfm]}>
          {msg.content}
        </Markdown>

        {msg.role === "assistant" && !isStreamingAssistant && (
          <button
            className="absolute bottom-1 right-2"
            onClick={() => {
              if (!msg.id) return;
              onToggleStar(msg.id);
            }}
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

        {msg.role === "assistant" &&
          !isStreamingAssistant &&
          msg.model &&
          msg.model !== model && (
            <p className="absolute bottom-1 left-4 text-xs text-gray-400 dark:text-gray-600">
              {msg.model}
            </p>
          )}
      </div>
    </div>
  );
}
