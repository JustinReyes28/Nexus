export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  prompt: string;
  response: string;
  topic?: string;
  focusAreas?: string[];
}

// Utility functions to convert between different message formats
export const convertConversationToMessages = (conversation: Conversation): ChatMessage[] => {
  return [
    { id: `user-${conversation.id}`, role: "user", content: conversation.prompt },
    { id: `bot-${conversation.id}`, role: "bot", content: conversation.response }
  ];
};

export const convertHistoryToMessages = (history: { id: string; prompt: string; response: string }[]): ChatMessage[] => {
  return history.flatMap(item => [
    { id: `user-${item.id}`, role: "user", content: item.prompt },
    { id: `bot-${item.id}`, role: "bot", content: item.response }
  ]);
};