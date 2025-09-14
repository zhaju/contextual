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

export interface Block {
  topic: string;
  description: string;
}

export interface Memory {
  summary_string: string;
  blocks: Block[];
}

// Legacy interfaces for UI state management
export interface BlockWithUI {
  topic: string;
  description: string;
  selected: boolean;
}

export interface MemoryWithUI {
  id: string;
  summary: string;
  title: string; // Title of the chat this memory is associated with
  blocks: BlockWithUI[];
  selected: boolean;
  isLocked: boolean; // true when context is submitted
  isExpanded: boolean; // for collapsible UI
  chatReferences: string[]; // Array of chat IDs that reference this memory
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

