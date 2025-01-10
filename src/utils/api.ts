// /src/utils/api.ts
import { getAuthToken } from './auth';

export const fetchMessagesByConversationId = async (conversationId: string) => {
  
  const response = await fetch(`http://localhost:8000/llm/${conversationId}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  const data = await response.json();

  return data.message || [];
};

export const fetchSessionsByUserId = async (userId: string) => {
  const response = await fetch(`http://localhost:8000/llm/${userId}/sessions/`);
  if (!response.ok) throw new Error("Failed to fetch sessions");
  const data = await response.json();

  return data.message || [];
};

export const fetchUserId = async (token: string) => {
  const response = await fetch('http://localhost:8000/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch user ID");
  const data = await response.json();

  return data.message.userid; // Assuming the user ID is returned in this format
};

/**
 * Interface representing the AI response from the backend.
 */
interface AiResponse {
  message_id: string;
  message: string;
  role: string;
  prompt_token: number;
  completion_token: number;
  total_token: number;
  create_time: number;
  model: string;
}

/**
 * Sends a message to the backend API.
 * @param message The user's message.
 * @param conversationId The conversation ID. Use `null` for new sessions.
 * @param model The AI model to use.
 * @param temperature The response temperature.
 * @returns An object containing the conversation ID and the AI response.
 */
export const sendMessage = async (
  message: string,
  conversationId: string | null,
  model: string = "gpt-4o-mini-2024-07-18",
  temperature: number = 0.9
): Promise<{ conversation_id: string; ai_response: AiResponse }> => {
  const payload = {
    message,
    conversation_id: conversationId,
    model,
    temperature,
  };
  console.log("payload: ", payload);

  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('http://localhost:8000/llm/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send message');
  }

  const data = await response.json();

  if (data.code !== "200") {
    throw new Error(data.message || 'Unexpected response from the server');
  }

  const aiResponse: AiResponse = data.message.content;
  const conversationIdResponse: string = data.message.conversation_id;

  return {
    conversation_id: conversationIdResponse,
    ai_response: aiResponse,
  };
};

import Memory from '@/types/Memory';
import { generateMockMemories } from '@/utils/mockData';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { generateMd5Id } from './idUtils';

export const fetchMemoriesByUserId = async (userId: string): Promise<Memory[]> => {
  try {
    const response = await fetch(`http://localhost:8000/memory/users/637414fd-6a9e-452e-8468-02adca3c083c`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authorization headers
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch memories');
    }

    const data = await response.json();
    return data.message; // The memories are in the 'message' field of the response
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

export const fetchMemoriesByConversationId = async (conversationId: string): Promise<Memory[]> => {
  try {
    const response = await fetch(`http://localhost:8000/memory/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch memories');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

export const deleteMemory = async (memoryId: string) => {
  console.log("got delete request ", memoryId);
  const response = await fetch(`http://localhost:8000/memory/${memoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Add any necessary authorization headers
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete memory');
  }
  
  return response.json();
};

export const updateMemory = async (userId: string, memoryId: string, data: Partial<Memory>) => {
  console.log("got update request ", memoryId);
  const response = await fetch(`http://localhost:8000/memory/${memoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update memory');
  return response.json();
};

export const sendStreamMessage = async (
  message: string,
  conversationId: string | null,
  model: string = "gpt-4o-mini-2024-07-18",
  temperature: number = 0.9,
  onMessageReceived: (msg: string) => void // New callback parameter
): Promise<void> => { // Change return type to void
  if (!conversationId) {
    conversationId = generateMd5Id();
  }
  const payload = {
    message,
    conversation_id: conversationId,
    model,
    temperature,
  };

  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  await fetchEventSource('http://localhost:8000/llm/stream_chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    async onmessage(ev) {
      let data = ev.data;
      if (data.length == 0) {
        data += "\n";
      }
      // console.log("streaming", data);
      onMessageReceived(data);
    }
    
  });

  
}
