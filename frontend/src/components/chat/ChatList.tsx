import { Star, Clock } from 'lucide-react';
import type { ChatListProps } from '../../types';

/**
 * ChatList Component
 * 
 * Props:
 * - chats: Chat[] - array of chat objects to display
 * - topics: Topic[] - array of topics for color mapping
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
}

export const ChatList = ({ chats, topics, onChatSelect, selectedChatId }: ChatListPropsWithSelection) => {
  const getTopicColor = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.color || '#6b7280';
  };

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className={`p-3 rounded-lg cursor-pointer transition-colors group ${
            selectedChatId === chat.id
              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
              : 'hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getTopicColor(chat.topicId) }}
              />
              <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
                {chat.title}
              </h3>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {chat.starred && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
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
