'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchModels, fetchSessionByConversationId, sendStreamMessage } from '@/utils/api';
import { generateMd5Id } from '@/utils/idUtils';
import { useChat } from '@/context/ChatContext';
import Sidebar from '@/components/Sidebar/Sidebar';
import { getAuthToken } from '@/utils/auth';

const DefaultPage: React.FC = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini-2024-07-18");
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const router = useRouter();
  const { addSession, addContextMessage } = useChat();
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

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
    const loadModels = async () => {
      try {
        const fetchedModels = await fetchModels();
        if (Array.isArray(fetchedModels)) {
          setModels(fetchedModels);
        } else {
          console.error("Fetched models is not an array:", fetchedModels);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };

    loadModels();
  }, []);

  function adjustHeight(e: any) {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Generate new conversation ID
      let conversationId = generateMd5Id();

      // Add user message
      const userMessage = {
        message_id: generateMd5Id(),
        message: text,
        role: 'user',
        timestamp: Date.now()
      };
      addContextMessage(conversationId, userMessage);

      // Add AI message placeholder
      const aiMessage = {
        message_id: generateMd5Id(),
        message: '',
        role: 'assistant',
        timestamp: Date.now()
      };
      addContextMessage(conversationId, aiMessage);

      // Redirect to chat page
      router.push(`/chat/${conversationId}`);
      let session = { session_id: conversationId, title: 'New Chat', messages: [] }
      addSession(session);

      // Initiate streaming chat with markdown support
      let buffer = '';
      await sendStreamMessage(
        text,
        conversationId,
        selectedModel,
        0.9,
        webSearchEnabled,
        (chunk: string) => {
          buffer += chunk;
          // Try to decode the buffer
          try {
            // Update AI message with complete UTF-8 sequences
            const decoder = new TextDecoder('utf-8', { fatal: true });
            const decoded = decoder.decode(new TextEncoder().encode(buffer));
            
            // Preserve markdown formatting
            const formattedMessage = aiMessage.message + decoded
              .replace(/\\n/g, '\n')  // Handle newlines
              .replace(/\\\*/g, '*')  // Handle asterisks
              .replace(/\\_/g, '_')   // Handle underscores
              .replace(/\\`/g, '`');  // Handle code blocks

            addContextMessage(conversationId, {
              ...aiMessage,
              message: formattedMessage
            });
            buffer = ''; // Clear buffer after successful decode
          } catch (e) {
            // If decode fails, we have an incomplete UTF-8 sequence
            // Keep the partial sequence in buffer for next chunk
          }
        }
      );

      

      let newSession = await fetchSessionByConversationId(conversationId);
      addSession({ ...session, title: newSession.title });
      

    } catch (error: any) {
      console.error('Error creating new session:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setText('');
    }

    
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">欢迎使用AI助手</h1>
          <p className="text-slate-600 dark:text-slate-300">输入问题开始对话，或从侧边栏选择历史会话</p>
        </div>
        <form 
          onSubmit={handleSubmit} 
          className="flex w-full max-w-2xl items-center gap-2 rounded-xl bg-white p-4 shadow-lg dark:bg-slate-800 transition-all duration-300 hover:shadow-xl"
        >
          <label htmlFor="prompt" className="sr-only">Enter your prompt</label>
          <div className="flex items-center space-x-1">
            <div>
              <button
                className="hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                type="button"
                aria-label="添加附件"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 5l0 14"></path>
                  <path d="M5 12l14 0"></path>
                </svg>
                <span className="sr-only">Attach file</span>
              </button>
            </div>
            {/* 联网搜索按钮 */}
            <div>
              <button
                type="button"
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  webSearchEnabled 
                    ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                aria-label="Web search"
                title="启用联网搜索"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <div className="relative" ref={modelSelectorRef}>
              <button
                type="button"
                onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Select model"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m16-6h-2m2 6h-2M9 5a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
                </svg>
              </button>
              {isModelSelectorOpen && (
                <div className="absolute bottom-full mb-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <p className="text-xs text-slate-400 px-2">Selected Model: {models.find(m => m.id === selectedModel)?.name}</p>
                  </div>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsModelSelectorOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between rounded-md"
                    >
                      <span>{model.name}</span>
                      {selectedModel === model.id && (
                        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        <textarea
            id="prompt"
            rows={1}
            className="flex min-h-full w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 transition-all"
            placeholder="Enter your prompt"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight(e);
            }}
            disabled={loading}
          ></textarea>
          <div>
            <button
              className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 animate-spin"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 4v4"></path>
                  <path d="M12 16v4"></path>
                  <path d="M4 12h4"></path>
                  <path d="M16 12h4"></path>
                  <path d="M6.93 6.93l2.829 2.829"></path>
                  <path d="M14.243 14.243l2.829 2.829"></path>
                  <path d="M6.93 17.07l2.829 -2.829"></path>
                  <path d="M14.243 9.757l2.829 -2.829"></path>
                </svg>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 14l11 -11"></path>
                    <path
                      d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"
                    ></path>
                  </svg>
                  <span className="sr-only">Send message</span>
                </>
              )}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 w-full max-w-2xl">
            <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultPage;
