"use client";
import React, { useState } from "react";
import SidebarItem from "./SidebarItem";
import { useRouter } from 'next/navigation';
import { useChat } from "@/context/ChatContext";
import { clearAuthToken } from "@/utils/auth";

interface Session {
  session_id: string;
  title: string;
}

interface SidebarProps {
  onSessionSelect?: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSessionSelect }) => {
  const { sessions } = useChat();
  const router = useRouter();
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const handleNewChat = async () => {
    await router.push('/default');
  };

  const handleMemoryDashboard = async () => {
    await router.push('/memory/dashboard');
  };

  return (
    <aside className="flex p-2">
      <div className="flex h-[calc(100svh-1rem)] w-60 flex-col overflow-y-auto bg-white p-4 transition-all duration-300 dark:bg-slate-800 sm:h-[calc(100vh-1rem)] sm:w-64 border-r border-slate-200 dark:border-slate-700">
        <div className="flex px-4 ml-2 pb-4 border-b border-slate-200 dark:border-slate-700">
          {/* Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-blue-600"
            fill="currentColor"
            strokeWidth="1"
            viewBox="0 0 24 24"
          >
            <path
              d="M20.553 3.105l-6 3C11.225 7.77 9.274 9.953 8.755 12.6c-.738 3.751 1.992 7.958 2.861 8.321A.985.985 0 0012 21c6.682 0 11-3.532 11-9 0-6.691-.9-8.318-1.293-8.707a1 1 0 00-1.154-.188zm-7.6 15.86a8.594 8.594 0 015.44-8.046 1 1 0 10-.788-1.838 10.363 10.363 0 00-6.393 7.667 6.59 6.59 0 01-.494-3.777c.4-2 1.989-3.706 4.728-5.076l5.03-2.515A29.2 29.2 0 0121 12c0 4.063-3.06 6.67-8.046 6.965zM3.523 5.38A29.2 29.2 0 003 12a6.386 6.386 0 004.366 6.212 1 1 0 11-.732 1.861A8.377 8.377 0 011 12c0-6.691.9-8.318 1.293-8.707a1 1 0 011.154-.188l6 3A1 1 0 018.553 7.9z"
            ></path>
          </svg>
          <h2 className="px-5 text-lg font-medium text-slate-800 dark:text-slate-200">
            Chats
            <span className="mx-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-slate-200">
              {sessions.length}
            </span>
          </h2>
        </div>
        <div className="flex justify-center mt-4 mb-4 space-x-2">
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-x-2 p-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            title="New Chat"
          >
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
              <path d="M12 5l0 14"></path>
              <path d="M5 12l14 0"></path>
            </svg>
          </button>
          <button
            onClick={handleMemoryDashboard}
            className="flex items-center justify-center gap-x-2 p-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            title="Memory Dashboard"
          >
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
              <path d="M9 12h6"></path>
              <path d="M9 5h6"></path>
              <path d="M3 19a9 9 0 1 1 18 0a9 9 0 0 1 -18 0"></path>
            </svg>
          </button>
        </div>
        {/* Previous chats container */}
        <div className="flex-grow space-y-2 overflow-y-auto px-2 py-4 border-t border-slate-200 dark:border-slate-700">
          {sessions.map((session: Session) => (
            <SidebarItem
              key={session.session_id}
              sessionId={session.session_id}
              title={session.title}
            />
          ))}
        </div>
        <div className="mt-auto w-full space-y-2 px-2 py-4 border-t border-slate-200 dark:border-slate-700">
          <div
            className="relative"
            onMouseEnter={() => setDropdownVisible(true)}
            onMouseLeave={() => setDropdownVisible(false)}
          >
            <button className="flex items-center justify-center gap-x-2 p-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
                <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"></path>
              </svg>
            </button>
            {isDropdownVisible && (
              <div className="absolute bottom-full w-48 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800">
                <a
                  href="/memory/users/123"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Personal Page
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
