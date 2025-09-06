'use client';
import React, { useEffect } from 'react';
import PromptContainer from '@/components/PromptContainer';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useChat } from '@/context/ChatContext';
import { getAuthToken } from '@/utils/auth';

export default function ChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = React.use(params);
  const { handleLogin } = useChat();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      handleLogin(token);
    }
  }, []);

  return (
    <div className="flex dark:bg-slate-900 dark:text-slate-300">
      <Sidebar />
      <main className="flex-1">
        <PromptContainer sessionId={sessionId} />
      </main>
    </div>
  );
}
