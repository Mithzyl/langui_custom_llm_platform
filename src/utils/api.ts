// /src/utils/api.ts
export const fetchMessagesByConversationId = async (conversationId: string) => {
  const response = await fetch(`http://localhost:8000/llm/${conversationId}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  const data = await response.json();

  return data.message || [];
};
