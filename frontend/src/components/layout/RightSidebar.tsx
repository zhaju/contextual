import { MemoryDirectory } from '../memory/MemoryDirectory';
import type { Memory } from '../../types';

interface RightSidebarProps {
  memories: Memory[];
  onMemoryToggle: (memoryId: string) => void;
  onBlockToggle: (memoryId: string, blockId: string) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  isNewChat: boolean;
  contextSubmitted: boolean;
  firstMessageSent: boolean;
  onChatSelect: (chatId: string) => void;
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
  onMemoryToggle,
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  isNewChat,
  contextSubmitted,
  firstMessageSent,
  onChatSelect,
}: RightSidebarProps) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 
                    flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <MemoryDirectory
          memories={memories}
          onMemoryToggle={onMemoryToggle}
          onBlockToggle={onBlockToggle}
          onMemoryExpand={onMemoryExpand}
          onSubmitContext={onSubmitContext}
          isNewChat={isNewChat}
          contextSubmitted={contextSubmitted}
          firstMessageSent={firstMessageSent}
          onChatSelect={onChatSelect}
        />
      </div>
    </div>
  );
};
