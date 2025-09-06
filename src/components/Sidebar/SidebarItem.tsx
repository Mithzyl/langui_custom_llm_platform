import React from "react";
import { useRouter, usePathname } from 'next/navigation';

interface SidebarItemProps {
  sessionId: string;
  title: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ sessionId, title }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSessionClick = () => {
    if (pathname.startsWith('/memories')) {
      router.push(`/memory/${sessionId}`);
    } else {
      router.push(`/chat/${sessionId}`);
    }
  };

  return (
    <button
      className="flex w-full flex-col gap-y-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 hover:bg-slate-200 focus:outline-none dark:hover:bg-slate-800"
      onClick={handleSessionClick}
    >
      <h1 className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
        {title}
      </h1>
    </button>
  );
};

export default SidebarItem;
