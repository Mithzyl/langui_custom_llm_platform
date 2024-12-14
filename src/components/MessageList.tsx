// /src/components/MessageList.tsx
import React from "react";
import Message from "./Message";

interface MessageListProps {
  messages: { id: string; role: string; message: string }[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 shadow-md dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7">
      {messages.map((msg) => (
        <Message key={msg.id} sender={msg.role} content={msg.message} />
      ))}
    </div>
  );
};

export default MessageList;
