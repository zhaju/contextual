import { X } from 'lucide-react';
import type { Chat } from '../../types';

export interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
}

/**
 * ChatList Component
 * 
 * Props:
 * - chats: Chat[] - array of chat objects to display
 * - onChatSelect: (chatId: string) => void - callback when chat is selected
 * 
 * How to integrate:
 * - Connect to real chat data from API
 * - Implement virtual scrolling for large lists
 * - Add drag-and-drop reordering
 * - Implement chat archiving and deletion
 */
interface ChatListPropsWithSelection extends ChatListProps {
  selectedChatId?: string | null;
  onChatDelete?: (chatId: string) => void;
}

export const ChatList = ({ chats, onChatSelect, selectedChatId, onChatDelete }: ChatListPropsWithSelection) => {

  return (
    <div className="space-y-1">
      {chats.map((chat, index) => (
        <div
          key={index}
          onClick={() => onChatSelect(chat.id)}
          className={`p-3 rounded-lg cursor-pointer transition-colors group ${
            selectedChatId === chat.id
              ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
              : 'hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
                {chat.title}
              </h3>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onChatDelete?.(chat.id);
                }}
                title="Delete chat"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] truncate mb-1">
            {chat.last}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {chat.updatedAt}
          </p>
        </div>
      ))}
    </div>
  );
};
