'use client';
import React, {useEffect, useState} from 'react';
import {fetchMessagesByConversationId, sendStreamMessage} from "@/utils/api";
import MessageList from "@/components/Message/MessageList";
import {useRouter} from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useChat } from "@/context/ChatContext";

interface AiResponse {
  message_id: string;
  message: string;
  role: string;
  prompt_token: number;
  completion_token: number;
  total_token: number;
  create_time: number;
  model: string;
}

interface PromptContainerProps {
  sessionId?: string;
}

function adjustHeight(e: any) {
  e.target.style.height = 'inherit';
  e.target.style.height = `${e.target.scrollHeight}px`;
}

const PromptContainer: React.FC<PromptContainerProps> = ({sessionId}) => {
    const [text, setText] = useState(''); // prompt text input
    const [messages, setMessages] = useState<any[]>([]); // messages from user and AI
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('gpt-4o-mini-2024-07-18');
    const [showModelList, setShowModelList] = useState(false);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false); // 新增联网搜索状态
    const router = useRouter();
    const { getContextMessage } = useChat();

    const models = ['gpt-4o-mini-2024-07-18', 'gpt-3.5-turbo', 'gpt-3'];


    const hasFetched = React.useRef(false);

    useEffect(() => {
      if (!sessionId || hasFetched.current) return;
      
      hasFetched.current = true;
      
      const loadMessages = async () => {
        try {
          // Load stored messages for existing session
          console.log("fetching messages for sessionId: ", sessionId);
          let fetchedMessages = await fetchMessagesByConversationId(sessionId);
          if (fetchedMessages.length === 0) {
            // Load messages from context
            fetchedMessages = getContextMessage();
            console.log("New conversation , try to fetch context message", fetchedMessages);
          }

          setMessages(fetchedMessages);
          console.log("fetched messages ", fetchedMessages);
        } catch (error) {
          console.error("Failed to load messages:", error);
        }
      };

      loadMessages();

      return () => {
        hasFetched.current = false;
      };
    }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Add the user's message to the messages list
      const userMessage = { message_id: uuidv4(), role: 'user', message: text };
      setText('');
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, userMessage];
        
        // Create a placeholder for the AI message
        const aiMessage = { message_id: uuidv4(), role: 'assistant', message: '' };
        updatedMessages.push(aiMessage); // Append the AI message placeholder
        
        return updatedMessages;
      });

      // Send the message to the backend and handle streaming
      await sendStreamMessage(text, sessionId || null, model, 0.9, (msg: string) => { /* no-op */ });
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100svh-1rem)] sm:h-[calc(100vh-1rem)] w-full overflow-hidden">
      {/* Navigation Bar - Model and Search Settings */}
      <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-slate-700 dark:text-slate-300">Model Settings</span>
          <div className="relative">
            <button
              onClick={() => setShowModelList(!showModelList)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              {model}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showModelList && (
              <div className="absolute z-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg mt-2">
                {models.map((modelOption) => (
                  <button
                    key={modelOption}
                    onClick={() => {
                      setModel(modelOption);
                      setShowModelList(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 ${
                      model === modelOption ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {modelOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      
      {/* Prompt message input */}
      <form onSubmit={handleSubmit} className="flex w-full items-center bg-slate-200 p-4 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700">
        <label htmlFor="prompt" className="sr-only">Enter your prompt</label>
        {/* Attach file button */}
        <div>
          <button
            className="hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2"
            type="button"
            aria-label="Attach file"
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
              <path d="M5 12l14 0"></path>
            </svg>
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            className={`hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2 transition-colors duration-200 ${
              webSearchEnabled ? 'text-blue-600 dark:text-blue-400' : ''
            }`}
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            aria-label="Web search"
            title="启用联网搜索"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {webSearchEnabled && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            )}
          </button>
        </div>
        <textarea
          id="prompt"
          rows={1}
          className="mx-2 flex min-h-full w-full border border-slate-300 bg-transparent p-2 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-300/20 dark:bg-transparent dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
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
            className={`inline-flex items-center justify-center hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2 transition-colors duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
            aria-label="Send message"
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
              </>
            )}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default PromptContainer;
