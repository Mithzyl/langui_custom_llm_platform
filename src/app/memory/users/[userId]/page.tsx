'use client';
import React from 'react';
import MemoryList from '@/components/Memory/MemoryList';

export default function MemoriesPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  return (
    <div className="flex h-screen">
      <div className="container mx-auto max-w-4xl py-8 flex-1 mb-10">
        <h1 className="text-2xl font-bold mb-4 ml-3">Your Memories</h1>
        <MemoryList userId={userId} />
      </div>
    </div>
  );
}
