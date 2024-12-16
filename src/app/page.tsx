'use client';
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import DefaultPage from "@/app/default/page";
import PromptContainer from "@/components/PromptContainer";

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  return (
    <div className="flex dark:bg-slate-900 dark:text-slate-300">
      {/* <Sidebar onSessionSelect={handleSessionSelect} /> */}
      <main className="flex-1">
        {selectedSessionId ? (
          <PromptContainer sessionId={selectedSessionId} />
        ) : (
          <DefaultPage />
        )}
      </main>
    </div>
  );
}
