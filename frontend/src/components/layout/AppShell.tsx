import { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { ChatView } from '../chat/ChatView';
import { Composer } from '../input/Composer';
import { RightSidebar } from './RightSidebar';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { Chat, Message } from '../../types';

interface AppShellProps {
  chats: Chat[];
  messages: Message[];
  selectedChatId?: string | null;
  isTyping?: boolean;
  isNewChat?: boolean;
  contextSubmitted?: boolean;
  isRightSidebarOpen?: boolean;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatsUpdate?: (updater: (prev: Chat[]) => Chat[]) => void;
  onSendMessage: (message: string) => void;
  onSubmitContext: () => void;
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
  messages,
  selectedChatId,
  isTyping = false,
  isNewChat = false,
  contextSubmitted = false,
  isRightSidebarOpen = false,
  onChatSelect,
  onNewChat,
  onChatsUpdate,
  onSendMessage,
  onSubmitContext,
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
            onContextRemove={() => {}}
            onSend={onSendMessage}
            disabled={isNewChat && !contextSubmitted}
            disabledMessage="Please submit your context before sending more messages"
          />
        </div>

        {/* Right Sidebar - Conditionally visible based on toggle state */}
        {isRightSidebarOpen && (
          <RightSidebar
            onSubmitContext={onSubmitContext}
            isNewChat={isNewChat}
            contextSubmitted={contextSubmitted}
          />
        )}
      </div>

    </div>
  );
};
