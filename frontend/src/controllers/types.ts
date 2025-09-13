// API types that match the backend schema
export interface BackendChat {
  id: string;
  current_memory: BackendMemory;
  title: string;
  chat_history: BackendChatMessage[];
}

export interface BackendMemory {
  summary_string: string;
  blocks: BackendBlock[];
}

export interface BackendBlock {
  topic: string;
  description: string;
}

export interface BackendChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

export interface ContextResponse {
  context_summary: string;
  relevant_chats: BackendChat[];
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageToChatRequest {
  chat_id: string;
  message: string;
}

export interface SetChatContextRequest {
  chat_id: string;
  required_context: string[];
}

export interface StreamedChatResponse {
  content?: string;
  done?: boolean;
}

// API Configuration
export const API_BASE_URL = 'http://localhost:8000';
