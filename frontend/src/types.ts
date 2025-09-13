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
