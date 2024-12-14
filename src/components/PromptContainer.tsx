'use client';
import React, {useEffect, useState} from 'react';
import {fetchMessagesByConversationId} from "@/utils/api";
import MessageList from "@/components/MessageList";


function adjustHeight(e: any) {
  e.target.style.height = 'inherit';
  e.target.style.height = `${e.target.scrollHeight}px`;
}

export default function PromptContainer() {
    const [text, setText] = useState(''); // # prompt text input
    const [messages, setMessages] = useState<any[]>([]); // messages from user and AI


    useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMessagesByConversationId("49dd31add44f009b991a005fe223c9dd"); // Example conversationId
          setMessages(fetchedMessages);
          console.log("fetched messages")
          // console.log(messages)
          // return fetchedMessages
      } catch (error) {
          console.error("Failed to load messages:", error);
      }
    };

    loadMessages();
  }, []);

  //    useEffect(() => {
  //   console.log("Updated messages:", messages);
  // }, [messages]); // Logs whenever `messages` is updated


  return (
    <div className="flex h-[97vh] w-full flex-col">
      {/* Prompt Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 shadow-md dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7">
        {/* Messages */}
        {/* Example conversation */}
          <MessageList messages={messages} />
      </div>
      {/* Prompt message input */}
      <form className="flex w-full items-center rounded-b-md border-t border-slate-300 bg-slate-200 p-2 dark:border-slate-700 dark:bg-slate-900">
        <label htmlFor="chat-input" className="sr-only">Enter your prompt</label>
        <div>
          <button
            className="hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2"
            type="button"
          >
            {/* Add icon */}
          </button>
        </div>
        <textarea
          id="chat-input"
          rows={1}
          className="mx-2 flex min-h-full w-full rounded-md border border-slate-300 bg-slate-50 p-2 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
          placeholder="Enter your prompt"
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight(e);
          }}
        ></textarea>
        <div>
          <button
            className="inline-flex hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2"
            type="submit"
          >
            {/* Send icon */}
          </button>
        </div>
      </form>
    </div>
  );
}
