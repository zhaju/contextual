// TypeScript types for the Chat UI template
// These types define the structure for mock data and component props

export interface Chat {
  id: string;
  title: string;
  last: string;
  updatedAt: string;
  messages: Message[];
}

// Messages for display in chat UI (no context messages shown)
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Internal message type that includes context (used for processing, not display)
export type InternalMessage =
  | Message
  | {
      id: string;
      role: 'context';
      content: ContextChat[];
    };

// Backend types for context processing
export interface Block {
  topic: string;
  description: string;
}

export interface Memory {
  summary_string: string;
  blocks: Block[];
}

export interface ContextChat {
  id: string;
  current_memory: Memory;
  title: string;
}

export interface StreamedChatResponse {
  content?: string;
  done?: boolean;
  hasContext?: boolean;
  context?: ContextChat[];
}

