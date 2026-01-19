export interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export interface Conversation {
  id: string;
  prompt: string;
  response: string;
  topic?: string;
  focusAreas?: string[];
}