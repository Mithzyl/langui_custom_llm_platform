'use client';

import React, { useEffect, useState } from 'react';
import MemoryItem from '@/components/Memory/MemoryItem';
import { fetchMemoriesByUserId, fetchMemoriesByConversationId, deleteMemory } from '@/utils/api';
import Memory from '@/types/Memory';

interface MemoryListProps {
  userId?: string;
  conversationId?: string;
  showHeader?: boolean;
}

const MemoryList: React.FC<MemoryListProps> = ({ userId, conversationId, showHeader = true }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadMemories = async () => {
    try {
      let data: Memory[];
      if (userId) {
        data = await fetchMemoriesByUserId(userId);
      } else if (conversationId) {
        data = await fetchMemoriesByConversationId(conversationId);
      } else {
        throw new Error('Either userId or conversationId must be provided');
      }
      setMemories(data);
    } catch (err) {
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [userId, conversationId]);

  const handleDelete = async (memoryId: string) => {
    try {
      await deleteMemory(memoryId);
      await loadMemories();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to delete memory:', err);
      setError('Failed to delete memory');
    }
  };

  if (loading) return <div className="p-4">Loading memories...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="px-4 py-3 relative">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Total memories: {memories.length}
            </h2>
            <div className="transition-opacity duration-300 ease-in-out">
              {showSuccess && (
                <span className="inline-flex items-center gap-x-1 rounded-full px-2.5 py-1 text-sm font-semibold leading-5 text-green-600 animate-fade-in-out">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                    <path d="M9 12l2 2l4 -4"></path>
                  </svg>
                  Memory Deleted
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {memories.map((memory) => (
            <MemoryItem 
              key={memory.id} 
              memory={memory}
              onDelete={handleDelete}
              onEdit={() => {/* Handle edit */}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryList; 