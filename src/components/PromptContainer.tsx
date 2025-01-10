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
      await sendStreamMessage(text, sessionId || null, model, 0.9, (newMessage) => {
        
        // Update the existing AI message with the new streamed text
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;
          const lastMessage = updatedMessages[lastMessageIndex].message;
          const newContent = newMessage;
          
          // Check if the new content is a continuation or duplicate
          if (!lastMessage.endsWith(newContent)) {
            updatedMessages[lastMessageIndex].message += newContent;
          }
          
          return updatedMessages;
        });
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[97vh] w-full flex-col">
      {/* Model Selection */}
      <div className="flex justify-start p-2">
        <button
          onClick={() => setShowModelList(!showModelList)}
          className="text-blue-600 dark:text-slate-200"
        >
          Model
        </button>
        {showModelList && (
          <div className="absolute bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg mt-8">
            {models.map((modelOption) => (
              <button
                key={modelOption}
                onClick={() => {
                  setModel(modelOption);
                  setShowModelList(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  model === modelOption ? 'font-bold' : ''
                }`}
              >
                {modelOption}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Prompt Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7">
        <MessageList messages={messages} />
      </div>
      {/* Prompt message input */}
      <form onSubmit={handleSubmit} className="flex w-full items-center rounded-md bg-slate-200 p-2 dark:bg-slate-900">
        <label htmlFor="prompt" className="sr-only">Enter your prompt</label>
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
        <textarea
          id="prompt"
          rows={1}
          className="mx-2 flex min-h-full w-full rounded-md border border-slate-300 bg-slate-200 p-2 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-300/20 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
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
