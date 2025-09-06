'use client';
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMemoriesByConversationId } from '@/utils/api';
import MemoryList from '@/components/Memory/MemoryList';
import Memory from '@/types/Memory';

export default function MemoryDetailPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const unwrappedParams = use(params);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMemoriesByConversationId(unwrappedParams.conversationId);
        setMemories(fetchedMessages);
      } catch (err) {
        setError('Failed to load conversation messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [unwrappedParams.conversationId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center">
        <div className="flex w-full justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2">Back to Memories</span>
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">Conversation Memory</h1>
          <div className="w-5"></div> {/* Placeholder to balance the flex layout */}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          <MemoryList 
            conversationId={unwrappedParams.conversationId} 
            showHeader={false} 
          />
        </div>
      </div>
    </div>
  );
} 