// API types that match the backend schema
export interface BackendChat {
  id: string;
  memory_snapshots: BackendMemorySnapshot[];
  current_memory: BackendMemory; // Legacy field for backward compatibility
  title: string;
  chat_history: BackendChatMessage[];
}

export interface BackendMemory {
  summary_string: string;
  blocks: BackendBlock[];
}

export interface BackendMemorySnapshot {
  memory: BackendMemory;
  associated_assistant_message_id: string | null;
  timestamp: string; // ISO string
  sequence_number: number;
}

export interface BackendBlock {
  topic: string;
  description: string;
}

export interface BackendChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

export interface ContextResponse {
  relevant_chats: BackendChat[];
  chat_id: string;
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
  required_context: BackendChat[];
}

export interface StreamedChatResponse {
  content?: string;
  done?: boolean;
}

// API Configuration
export const API_BASE_URL = 'http://localhost:8000';

// Delete chat request/response
export interface DeleteChatRequest {
  chat_id: string;
}

export interface DeleteChatResponse {
  message: string;
}

// Fork-related types
export interface ForkRequest {
  source_chat_id: string;
  assistant_message_id: string;
}

export interface ForkResponse {
  new_chat_id: string;
  message: string;
}
