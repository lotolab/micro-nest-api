// All model common chat message
type ChatMessage = {
  role: 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
};
