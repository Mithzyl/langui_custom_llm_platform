// /src/components/Message.tsx
import React from "react";

interface MessageProps {
  sender: string;
  content: string;
}

const Message: React.FC<MessageProps> = ({ sender, content }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`flex px-4 py-2 sm:px-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`rounded-lg px-4 py-2 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default Message;
