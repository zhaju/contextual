import { SuggestedTopics } from './SuggestedTopics';
import { RelevantChats } from './RelevantChats';
import { PinnedContext } from './PinnedContext';
import type { Topic, RelevantChat, PinnedContext as PinnedContextType } from '../types';

interface RightSidebarProps {
  suggestedTopics: Topic[];
  relevantChats: RelevantChat[];
  pinnedContext: PinnedContextType[];
  onTopicSelect: (topicId: string) => void;
  onChatPin: (chatId: string) => void;
  onChatPreview: (chatId: string) => void;
  onChatExclude: (chatId: string) => void;
  onContextRemove: (id: string) => void;
}

/**
 * RightSidebar Component
 * 
 * Props:
 * - suggestedTopics: Topic[] - array of suggested topics
 * - relevantChats: RelevantChat[] - array of relevant chats
 * - pinnedContext: PinnedContext[] - array of pinned context items
 * - onTopicSelect: (topicId: string) => void - callback when topic is selected
 * - onChatPin: (chatId: string) => void - callback when chat is pinned
 * - onChatPreview: (chatId: string) => void - callback when chat is previewed
 * - onChatExclude: (chatId: string) => void - callback when chat is excluded
 * - onContextRemove: (id: string) => void - callback when context is removed
 * 
 * How to integrate:
 * - Connect to AI-powered suggestions and recommendations
 * - Implement real-time updates based on current conversation
 * - Add user preference management
 * - Connect to context management and search functionality
 */
export const RightSidebar = ({
  suggestedTopics,
  relevantChats,
  pinnedContext,
  onTopicSelect,
  onChatPin,
  onChatPreview,
  onChatExclude,
  onContextRemove,
}: RightSidebarProps) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                    flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <SuggestedTopics
          topics={suggestedTopics}
          onTopicSelect={onTopicSelect}
        />
        
        <RelevantChats
          items={relevantChats}
          onPin={onChatPin}
          onPreview={onChatPreview}
          onExclude={onChatExclude}
        />
        
        <PinnedContext
          pinned={pinnedContext}
          onRemove={onContextRemove}
        />
      </div>
    </div>
  );
};
