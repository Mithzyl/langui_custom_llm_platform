import Image from "next/image";
import React from "react";
import PromptContainer from "@/components/PromptContainer";

export default function Home() {
  return (
      <div className="dark:bg-slate-900 dark:text-slate-300">
        <PromptContainer/>
      </div>

  );
}
