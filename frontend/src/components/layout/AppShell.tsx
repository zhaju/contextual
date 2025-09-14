import { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { ChatView } from '../chat/ChatView';
import { Composer } from '../input/Composer';
import { RightSidebar } from './RightSidebar';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { Chat, Topic, Message, Memory } from '../../types';

interface AppShellProps {
  chats: Chat[];
  topics: Topic[];
  messages: Message[];
  memories: Memory[];
  selectedChatId?: string | null;
  isTyping?: boolean;
  isNewChat?: boolean;
  contextSubmitted?: boolean;
  firstMessageSent?: boolean;
  isRightSidebarOpen?: boolean;
  isSubmittingContext?: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatsUpdate?: (updater: (prev: Chat[]) => Chat[]) => void;
  onSendMessage: (message: string) => void;
  onMemoryToggle: (memoryId: string) => void;
  onBlockToggle: (memoryId: string, blockIndex: number) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  onSkipContext?: () => void;
  onTopicSelect: (topicId: string) => void;
  onChatPin: (chatId: string) => void;
  onChatPreview: (chatId: string) => void;
  onChatExclude: (chatId: string) => void;
  onContextRemove: (id: string) => void;
  onToggleRightSidebar?: () => void;
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
  memories,
  selectedChatId,
  isTyping = false,
  isNewChat = false,
  contextSubmitted = false,
  firstMessageSent = false,
  isRightSidebarOpen = true,
  isSubmittingContext = false,
  onChatSelect,
  onNewChat,
  onChatsUpdate,
  onSendMessage,
  onMemoryToggle,
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  onSkipContext,
  onTopicSelect: _onTopicSelect,
  onChatPin: _onChatPin,
  onChatPreview: _onChatPreview,
  onChatExclude: _onChatExclude,
  onContextRemove,
  onToggleRightSidebar,
}: AppShellProps) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  return (
  <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
  <header className="h-16 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <img 
            src="/icon.png" 
            alt="Contextual" 
            className="h-8 w-8"
          />
          <h1 className="text-xl font-bold" style={{ color: isDark ? 'white' : 'black' }}>
            Contextual
          </h1>
        </div>
        <div className="flex items-center space-x-4">
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
          onChatsUpdate={onChatsUpdate}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatView
            messages={messages}
            isTyping={isTyping}
          />
          <Composer
            contextPills={[]}
            onContextRemove={onContextRemove}
            onSend={onSendMessage}
            disabled={isNewChat && firstMessageSent && !contextSubmitted}
            disabledMessage="Please select and submit your context before sending more messages"
          />
        </div>

        {/* Right Sidebar - Conditionally visible based on toggle state */}
        {isRightSidebarOpen && (
          <RightSidebar
            memories={memories}
            onMemoryToggle={onMemoryToggle}
            onBlockToggle={onBlockToggle}
            onMemoryExpand={onMemoryExpand}
            onSubmitContext={onSubmitContext}
            onSkipContext={onSkipContext}
            onChatPin={_onChatPin}
            onChatPreview={_onChatPreview}
            onChatExclude={_onChatExclude}
            isNewChat={isNewChat}
            contextSubmitted={contextSubmitted}
            firstMessageSent={firstMessageSent}
            isSubmittingContext={isSubmittingContext}
          />
        )}
      </div>

      {/* Floating Right Sidebar Toggle Button */}
      {onToggleRightSidebar && (
        <button
          onClick={onToggleRightSidebar}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 
                     p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 
                     hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all duration-200
                     hover:shadow-xl"
          title={isRightSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isRightSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      )}
    </div>
  );
};
