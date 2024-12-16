// /src/utils/api.ts
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

  const response = await fetch('http://localhost:8000/llm/send_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
