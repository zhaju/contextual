import { MemoryDirectory } from '../memory/MemoryDirectory';
import { RelevantChats } from '../features/RelevantChats';
import type { Memory, RelevantChat } from '../../types';

interface RightSidebarProps {
  memories: Memory[];
  relevantChats?: RelevantChat[];
  onMemoryToggle: (memoryId: string) => void;
  onBlockToggle: (memoryId: string, blockId: string) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  onChatPin: (chatId: string) => void;
  onChatPreview: (chatId: string) => void;
  onChatExclude: (chatId: string) => void;
  isNewChat: boolean;
  contextSubmitted: boolean;
  firstMessageSent: boolean;
}

/**
 * RightSidebar Component
 * 
 * Props:
 * - memories: Memory[] - array of memories with blocks
 * - onMemoryToggle: (memoryId: string) => void - callback when memory is toggled
 * - onBlockToggle: (memoryId: string, blockId: string) => void - callback when block is toggled
 * - onSubmitContext: () => void - callback when context is submitted
 * - isNewChat: boolean - whether this is a new chat (shows memory directory)
 * 
 * How to integrate:
 * - Connect to backend memory management system
 * - Implement real-time memory updates
 * - Add memory search and filtering
 * - Connect to context selection workflow
 */
export const RightSidebar = ({
  memories,
  relevantChats = [],
  onMemoryToggle,
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  onChatPin,
  onChatPreview,
  onChatExclude,
  isNewChat,
  contextSubmitted,
  firstMessageSent,
}: RightSidebarProps) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                    flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {/* Show relevant chats for new chat context selection */}
        {isNewChat && firstMessageSent && !contextSubmitted && relevantChats.length > 0 && (
          <RelevantChats
            items={relevantChats}
            onPin={onChatPin}
            onPreview={onChatPreview}
            onExclude={onChatExclude}
          />
        )}
        
        {/* Show memory directory for context selection */}
        <MemoryDirectory
          memories={memories}
          onMemoryToggle={onMemoryToggle}
          onBlockToggle={onBlockToggle}
          onMemoryExpand={onMemoryExpand}
          onSubmitContext={onSubmitContext}
          isNewChat={isNewChat}
          contextSubmitted={contextSubmitted}
          firstMessageSent={firstMessageSent}
        />
      </div>
    </div>
  );
};
