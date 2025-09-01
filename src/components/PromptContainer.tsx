'use client';
import React, { useEffect, useState, useRef } from 'react';
import { fetchMessagesByConversationId, sendStreamMessage } from "@/utils/api";
import MessageList from "@/components/Message/MessageList";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useChat } from "@/context/ChatContext";

interface PromptContainerProps {
  sessionId?: string;
}

const PromptContainer: React.FC<PromptContainerProps> = ({ sessionId }) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini-2024-07-18');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const router = useRouter();
  const { getContextMessage } = useChat();
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: "gpt-4o-mini-2024-07-18", name: "GPT-4o Mini" },
    { id: "gpt-4o-2024-05-13", name: "GPT-4o" },
    { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
  ];

  const hasFetched = React.useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!sessionId || hasFetched.current) return;
    
    hasFetched.current = true;
    
    const loadMessages = async () => {
      try {
        let fetchedMessages = await fetchMessagesByConversationId(sessionId);
        if (fetchedMessages.length === 0) {
          fetchedMessages = getContextMessage();
        }
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    return () => {
      hasFetched.current = false;
    };
  }, [sessionId, getContextMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);

    const userMessage = { message_id: uuidv4(), role: 'user', message: text };
    const aiMessagePlaceholder = { message_id: uuidv4(), role: 'assistant', message: '' };
    
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessagePlaceholder]);
    setText('');

    try {
      await sendStreamMessage(text, sessionId || null, model, 0.9, webSearchEnabled, (chunk: string) => {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, message: lastMessage.message + chunk }
            ];
          }
          return prevMessages;
        });
      });
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
      setMessages(prev => prev.slice(0, -2)); // Remove user message and placeholder on error
    } finally {
      setLoading(false);
    }
  };

  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-900">
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative" ref={modelSelectorRef}>
          <button
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="font-semibold text-slate-800 dark:text-slate-200">{models.find(m => m.id === model)?.name}</span>
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isModelSelectorOpen && (
            <div className="absolute top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
              {models.map((modelOption) => (
                <button
                  key={modelOption.id}
                  onClick={() => {
                    setModel(modelOption.id);
                    setIsModelSelectorOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between rounded-md"
                >
                  <span>{modelOption.name}</span>
                  {model === modelOption.id && (
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => router.push('/default')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
          <button type="button" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`p-2 rounded-full transition-colors ${webSearchEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <textarea
            id="prompt"
            rows={1}
            className="flex-1 bg-transparent p-2 text-base text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
            placeholder="Enter your prompt"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight(e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 transition-colors"
          >
            {loading ? (
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v.01M12 20v.01M4 12h.01M20 12h.01M6.31 6.31l.01.01M17.69 17.69l.01.01M6.31 17.69l.01-.01M17.69 6.31l.01-.01" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            )}
          </button>
        </form>
        {error && <div className="mt-2 text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
}

export default PromptContainer;
