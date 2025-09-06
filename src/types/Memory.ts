interface Memory {
  id: string;
  memory: string;
  hash: string;
  metadata: any | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  conversation_id: string | null;
}

export default Memory; 