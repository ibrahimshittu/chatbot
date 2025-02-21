import React from "react";
import { StarredPromptCard } from "../elements/starred-message";
import Link from "next/link";
import { StarredMessage } from "@/helper/types";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";

function StarredPage({ messages }: { messages: StarredMessage[] }) {
  // Group messages by date using formatted date strings as keys.
  const messagesByDate = messages.reduce(
    (acc: { [key: string]: StarredMessage[] }, message) => {
      const date = dayjs(message.createdAt).format("MMMM D, YYYY");
      if (!acc[date]) acc[date] = [];
      acc[date].push(message);
      return acc;
    },
    {}
  );

  // Sort the date keys in descending order.
  const sortedDates = Object.keys(messagesByDate).sort(
    (a, b) =>
      dayjs(b, "MMMM D, YYYY").valueOf() - dayjs(a, "MMMM D, YYYY").valueOf()
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl shadow rounded-lg p-6 border dark:border-none bg-white dark:bg-background">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Starred Messages
        </h3>

        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            You have no starred prompts. Try starring an assistant message in
            the chat page!
          </p>
        ) : (
          <div className="space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
            {sortedDates.map((date) => (
              <div key={date}>
                <h4 className="sticky top-0 z-10 bg-white dark:bg-background py-2 text-base font-semibold text-gray-700 dark:text-gray-200">
                  {date}
                </h4>
                <div className="space-y-4">
                  {messagesByDate[date].map((message) => (
                    <StarredPromptCard key={message.id} prompt={message} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="flex items-center justify-center hover:underline group"
          >
            <ArrowLeft
              size={16}
              className="mr-2 transition-transform duration-300 transform group-hover:-translate-x-1"
            />
            Go Back to Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StarredPage;
