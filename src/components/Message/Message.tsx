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
        <div className="mr-3 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h-2m2 6h-2M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
          </svg>
        </div>
      )}
      <div
        className={`max-w-xl px-4 py-3 rounded-lg ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
