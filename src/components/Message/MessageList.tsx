// /src/components/MessageList.tsx
import React, { useEffect, useRef } from "react";
import Message from "./Message";

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  message: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7">
      {messages.map((msg) => (
        <Message key={msg.message_id} role={msg.role} content={msg.message} />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
