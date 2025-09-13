import { Pin, Eye, X } from 'lucide-react';
import type { RelevantChatsProps } from '../../types';

/**
 * RelevantChats Component
 * 
 * Props:
 * - items: RelevantChat[] - array of relevant chat items
 * - onPin: (chatId: string) => void - callback when chat is pinned
 * - onPreview: (chatId: string) => void - callback when chat is previewed
 * - onExclude: (chatId: string) => void - callback when chat is excluded
 * 
 * How to integrate:
 * - Connect to AI-powered relevant chat suggestions
 * - Implement real-time relevance scoring
 * - Add chat preview modal functionality
 * - Connect to user interaction tracking
 */
export const RelevantChats = ({ items, onPin, onPreview, onExclude }: RelevantChatsProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Relevant Chats
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.chatId}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {item.title}
              </h4>
              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onPin(item.chatId)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Pin chat"
                >
                  <Pin className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => onPreview(item.chatId)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Preview chat"
                >
                  <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => onExclude(item.chatId)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Exclude from suggestions"
                >
                  <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {item.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
