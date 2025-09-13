import { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { ChatSearchInput } from '../chat/ChatSearchInput';
import { ChatList } from '../chat/ChatList';
import type { Chat, Topic } from '../../types';

interface LeftSidebarProps {
  chats: Chat[];
  topics: Topic[];
  selectedChatId?: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

/**
 * LeftSidebar Component
 * 
 * Props:
 * - chats: Chat[] - array of chat objects
 * - topics: Topic[] - array of topics for color mapping
 * - onChatSelect: (chatId: string) => void - callback when chat is selected
 * - onNewChat: () => void - callback for new chat button
 * 
 * How to integrate:
 * - Connect to real chat data and search functionality
 * - Implement sidebar collapse/expand state
 * - Add chat creation and management features
 * - Connect to user preferences and settings
 */
export const LeftSidebar = ({ 
  chats, 
  topics, 
  selectedChatId,
  onChatSelect, 
  onNewChat 
}: LeftSidebarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    chat.last.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
                      flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
                    flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Chats
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
        <ChatSearchInput
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 
                     bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <ChatList
          chats={filteredChats}
          topics={topics}
          selectedChatId={selectedChatId}
          onChatSelect={onChatSelect}
        />
      </div>
    </div>
  );
};
