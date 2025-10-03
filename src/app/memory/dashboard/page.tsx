'use client';
import React, { useState, useEffect } from 'react';
import { fetchMemoriesByUserId, fetchMemoriesByConversationId, deleteMemory, updateMemory } from '@/services/api/memoryService';
import { fetchUserId } from '@/services/api/userService';
import { getAuthToken } from '@/utils/auth';
import MemoryItem from '@/components/Memory/MemoryItem';
import Memory from '@/types/Memory';
import Modal from '@/components/Modal';
import SuccessMessage from '@/components/SuccessMessage';
import { useRouter } from 'next/navigation';

interface MemoryStats {
  totalMemories: number;
  retrievalApiUsage: string;
  retrievalEvents: number;
  addEvents: number;
}

export default function MemoryDashboard() {
  const [userMemories, setUserMemories] = useState<Memory[]>([]);
  const [conversationMemories, setConversationMemories] = useState<Memory[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<MemoryStats>({
    totalMemories: 0,
    retrievalApiUsage: "0",
    retrievalEvents: 0,
    addEvents: 0
  });
  const [activeTab, setActiveTab] = useState<'user' | 'conversation'>('user');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Memory | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadMemories = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        const userId = await fetchUserId();
        const conversationId = "your-conversation-id"; // Placeholder

        const [userMemoriesResult, conversationMemoriesResult] = await Promise.allSettled([
          fetchMemoriesByUserId(userId),
          fetchMemoriesByConversationId(conversationId)
        ]);

        const safeUserMemories = userMemoriesResult.status === 'fulfilled' ? userMemoriesResult.value : [];
        const safeConversationMemories = conversationMemoriesResult.status === 'fulfilled' ? conversationMemoriesResult.value : [];

        setUserMemories(safeUserMemories);
        setConversationMemories(safeConversationMemories);
        setMemories(safeUserMemories);
        setStats(prev => ({
          ...prev,
          totalMemories: safeUserMemories.length,
          retrievalApiUsage: `${safeConversationMemories.length}`
        }));
      } catch (error) {
        console.error("Failed to load memories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, []);

  const handleBackToChat = () => {
    router.push('/default');
  };

  const handleUserMemories = () => {
    setActiveTab('user');
    setMemories(userMemories);
  };

  const handleConversationMemories = () => {
    setActiveTab('conversation');
    setMemories(conversationMemories);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory(id);
      const newMemories = memories.filter(memory => memory.id !== id);
      setMemories(newMemories);
      if (activeTab === 'user') {
        setUserMemories(newMemories);
      } else {
        setConversationMemories(newMemories);
      }
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const handleEdit = (memory: Memory) => {
    setCurrentMemory(memory);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (updatedMemory: Partial<Memory>) => {
    if (!currentMemory) return;

    try {
      await updateMemory(currentMemory.id, updatedMemory);
      const newMemories = memories.map(mem => mem.id === currentMemory.id ? { ...mem, ...updatedMemory } : mem);
      setMemories(newMemories);
      if (activeTab === 'user') {
        setUserMemories(newMemories);
      } else {
        setConversationMemories(newMemories);
      }
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading Memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="container mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Memory Dashboard</h1>
          <button
            onClick={handleBackToChat}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-sm"
          >
            Back to Chat
          </button>
        </div>

        <SuccessMessage show={deleteSuccess} message="Memory deleted successfully!" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">User Memories</h2>
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{userMemories.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversation Memories</h2>
              <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{conversationMemories.length}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Retrieval Events</h2>
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5V4H4zm0 12h5v-5H4v5zm10 0h5v-5h-5v5zm0-12h5V4h-5v5z" /></svg>
            </div>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stats.retrievalEvents}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Add Events</h2>
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stats.addEvents}</p>
          </div>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-6">
            <button onClick={handleUserMemories} className={`py-3 px-1 font-semibold ${activeTab === 'user' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              User Memories
            </button>
            <button onClick={handleConversationMemories} className={`py-3 px-1 font-semibold ${activeTab === 'conversation' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              Conversation Memories
            </button>
          </div>
        </div>

        <div className="mt-8">
          {memories.length > 0 ? (
            <div className="space-y-4">
              {memories.map((memory) => (
                <MemoryItem key={memory.id} memory={memory} onDelete={handleDelete} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400">No memories found for this view.</p>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {currentMemory && (
            <div className="p-2">
              <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Edit Memory</h3>
              <textarea
                defaultValue={currentMemory.memory}
                onChange={(e) => setCurrentMemory({ ...currentMemory, memory: e.target.value })}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={5}
              />
              <div className="flex justify-end items-center mt-6 space-x-3">
                {editSuccess && <SuccessMessage show={editSuccess} message="Memory updated!" />}
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleEditSubmit({ memory: currentMemory.memory })} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
