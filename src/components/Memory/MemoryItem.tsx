import React from 'react';
import { formatDate } from '@/utils/dateUtils';
import Memory from '@/types/Memory';
import { useRouter } from 'next/navigation';

interface MemoryItemProps {
  memory: Memory;
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
}

const MemoryItem: React.FC<MemoryItemProps> = ({ memory, onDelete, onEdit }) => {
  const router = useRouter();

  const handleConversationClick = () => {
    if (memory.conversation_id) {
      router.push(`/chat/${memory.conversation_id}`);
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 ${memory.conversation_id ? 'cursor-pointer' : ''}`}
      onClick={handleConversationClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{memory.memory}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(memory);
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Edit memory"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(memory.id);
            }}
            className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Delete memory"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Created on {formatDate(new Date(memory.created_at))}
        </p>
        {memory.metadata && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Metadata: {JSON.stringify(memory.metadata)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MemoryItem;
