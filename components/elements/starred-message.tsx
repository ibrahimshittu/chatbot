import React from "react";
import { StarredMessage } from "@/helper/types";
import dayjs from "dayjs";

export function StarredPromptCard({ prompt }: { prompt: StarredMessage }) {
  console.log(prompt);
  return (
    <div className="rounded-lg shadow p-4 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center justify-between w-full gap-2 text-xs text-black dark:text-gray-400">
          {prompt.chat && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              {prompt.chat.model}
            </span>
          )}
          {prompt.createdAt && (
            <span>{dayjs(prompt.createdAt).format("h:mm A")}</span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-700 dark:text-gray-400 mb-1">
          Message:
        </p>
        <p className="text-sm text-primary dark:text-gray-100 whitespace-pre-wrap">
          {prompt?.chat?.input}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-700 dark:text-gray-400 mb-1">
          Response:
        </p>
        <p className="text-sm text-primary dark:text-gray-100 whitespace-pre-wrap">
          {prompt?.chat?.response}
        </p>
      </div>
    </div>
  );
}
