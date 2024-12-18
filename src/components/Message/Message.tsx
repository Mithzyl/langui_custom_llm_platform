// /src/components/Message/Message.tsx
import { resolve } from "node:path/win32";
import React from "react";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`flex px-4 py-2 sm:px-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <img
          className="mr-2 h-8 w-8 rounded-full"
          src="https://dummyimage.com/128x128/354ea1/ffffff&text=AI"
          alt="AI Avatar"
        />
      )}
      <div
        className={`rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
