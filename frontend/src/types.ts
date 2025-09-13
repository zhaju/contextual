// TypeScript types for the Chat UI template
// These types define the structure for mock data and component props

export interface Topic {
  id: string;
  name: string;
  color: string;
}

export interface Chat {
  id: string;
  title: string;
  last: string;
  updatedAt: string;
  topicId: string;
  starred: boolean;
  memoryIds: string[]; // Array of memory IDs associated with this chat
  isNewChat?: boolean; // Whether this is a new chat in context selection mode
  contextSubmitted?: boolean; // Whether context has been submitted for this chat
  firstMessageSent?: boolean; // Whether first message has been sent for this chat
  filteredMemories?: string[]; // Array of filtered memory IDs for this chat
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface RelevantChat {
  chatId: string;
  title: string;
  snippet: string;
}

export interface PinnedContext {
  id: string;
  label: string;
}

export interface MemoryBlock {
  id: string;
  topic: string;
  description: string;
  importance: number; // 1-5 scale for # importance
  selected: boolean;
  chatReferences: string[]; // Array of chat IDs that reference this block
}

export interface Memory {
  id: string;
  title: string;
  blocks: MemoryBlock[];
  selected: boolean;
  isLocked: boolean; // true when context is submitted
  isExpanded: boolean; // for collapsible UI
  chatReferences: string[]; // Array of chat IDs that reference this memory
}

// Component prop types
export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export interface MarkdownMessageProps {
  text: string;
}

export interface TypingIndicatorProps {
  active: boolean;
}

export interface ChatSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface ChatListProps {
  chats: Chat[];
  topics: Topic[];
  onChatSelect: (chatId: string) => void;
}

export interface MessageListProps {
  messages: Message[];
}

export interface ComposerProps {
  contextPills: PinnedContext[];
  onContextRemove: (id: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export interface SuggestedTopicsProps {
  topics: Topic[];
  onTopicSelect: (topicId: string) => void;
}

export interface RelevantChatsProps {
  items: RelevantChat[];
  onPin: (chatId: string) => void;
  onPreview: (chatId: string) => void;
  onExclude: (chatId: string) => void;
}

export interface PinnedContextProps {
  pinned: PinnedContext[];
  onRemove: (id: string) => void;
}

export interface MemoryDirectoryProps {
  memories: Memory[];
  onBlockToggle: (memoryId: string, blockId: string) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  isNewChat: boolean;
  contextSubmitted: boolean;
  firstMessageSent: boolean;
}
