import { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { ChatSearchInput } from '../chat/ChatSearchInput';
import { ChatList } from '../chat/ChatList';
import type { Chat } from '../../types';
import { chatController } from '../../controllers';

interface LeftSidebarProps {
  chats: Chat[];
  selectedChatId?: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatsUpdate?: (updater: (prev: Chat[]) => Chat[]) => void;
}

/**
 * LeftSidebar Component
 * 
 * Props:
 * - chats: Chat[] - array of chat objects
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
  selectedChatId,
  onChatSelect, 
  onNewChat,
  onChatsUpdate
}: LeftSidebarProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteConfirm = (chatId: string) => {
    setPendingDeleteId(chatId);
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setPendingDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setIsDeleting(true);
      await chatController.deleteChat({ chat_id: pendingDeleteId });
      if (onChatsUpdate) {
        onChatsUpdate(prev => prev.filter(c => c.id !== pendingDeleteId));
      }
      if (selectedChatId === pendingDeleteId) {
        onNewChat();
      }
      setPendingDeleteId(null);
    } catch (e) {
      console.error('Failed to delete chat', e);
      alert('Failed to delete chat.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    chat.last.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
      </div>
    );
  }

  return (
  <div className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col h-full min-h-0">
      {/* Header */}
  <div className="px-6 py-4 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            All Chats
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
          >
            <Menu className="w-4 h-4 text-[var(--text-primary)]" />
          </button>
        </div>
        <ChatSearchInput
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      {/* New Chat Button */}
  <div className="px-6 py-4 border-b border-[var(--border-color)] flex-shrink-0">
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
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <ChatList
          chats={filteredChats}
          selectedChatId={selectedChatId}
          onChatSelect={onChatSelect}
          onChatDelete={openDeleteConfirm}
        />
      </div>
      {pendingDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Delete chat?</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="px-3 py-2 rounded-md border border-[var(--border-color)] text-sm hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
