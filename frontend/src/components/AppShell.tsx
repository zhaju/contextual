import { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { ChatView } from './ChatView';
import { Composer } from './Composer';
import { RightSidebar } from './RightSidebar';
import { ThemeToggle } from './ThemeToggle';
import type { Chat, Topic, Message, RelevantChat, PinnedContext as PinnedContextType } from '../types';

interface AppShellProps {
  chats: Chat[];
  topics: Topic[];
  messages: Message[];
  suggestedTopics: Topic[];
  relevantChats: RelevantChat[];
  pinnedContext: PinnedContextType[];
  selectedChatId?: string | null;
  isTyping?: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onSendMessage: (message: string) => void;
  onTopicSelect: (topicId: string) => void;
  onChatPin: (chatId: string) => void;
  onChatPreview: (chatId: string) => void;
  onChatExclude: (chatId: string) => void;
  onContextRemove: (id: string) => void;
}

/**
 * AppShell Component
 * 
 * Main layout component with 3-column grid and header
 * 
 * How to integrate:
 * - Connect to global state management (Redux, Zustand, etc.)
 * - Implement responsive design for mobile devices
 * - Add keyboard shortcuts and accessibility features
 * - Connect to real-time updates and notifications
 */
export const AppShell = ({
  chats,
  topics,
  messages,
  suggestedTopics,
  relevantChats,
  pinnedContext,
  selectedChatId,
  isTyping = false,
  onChatSelect,
  onNewChat,
  onSendMessage,
  onTopicSelect,
  onChatPin,
  onChatPreview,
  onChatExclude,
  onContextRemove,
}: AppShellProps) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
                         flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Contextual Chat
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                       transition-colors text-sm font-medium"
          >
            New Chat
          </button>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <LeftSidebar
          chats={chats}
          topics={topics}
          selectedChatId={selectedChatId}
          onChatSelect={onChatSelect}
          onNewChat={onNewChat}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatView
            messages={messages}
            isTyping={isTyping}
          />
          <Composer
            contextPills={pinnedContext}
            onContextRemove={onContextRemove}
            onSend={onSendMessage}
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          suggestedTopics={suggestedTopics}
          relevantChats={relevantChats}
          pinnedContext={pinnedContext}
          onTopicSelect={onTopicSelect}
          onChatPin={onChatPin}
          onChatPreview={onChatPreview}
          onChatExclude={onChatExclude}
          onContextRemove={onContextRemove}
        />
      </div>
    </div>
  );
};
