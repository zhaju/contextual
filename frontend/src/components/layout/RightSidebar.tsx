import { MemoryDirectory } from '../memory/MemoryDirectory';
import { ChatContext } from '../memory/ChatContext';
import type { Memory, Chat } from '../../types';

interface RightSidebarProps {
  memories: Memory[];
  chats: Chat[];
  selectedChatId: string | null;
  onMemoryToggle: (memoryId: string) => void;
  onBlockToggle: (memoryId: string, blockIndex: number) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  onSkipContext?: () => void;
  onChatPin: (chatId: string) => void;
  onChatPreview: (chatId: string) => void;
  onChatExclude: (chatId: string) => void;
  isNewChat: boolean;
  contextSubmitted: boolean;
  firstMessageSent: boolean;
  isSubmittingContext?: boolean;
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
  chats,
  selectedChatId,
  onMemoryToggle,
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  onSkipContext,
  onChatPin,
  onChatPreview,
  onChatExclude,
  isNewChat,
  contextSubmitted,
  firstMessageSent,
  isSubmittingContext = false,
}: RightSidebarProps) => {
  // Find the selected chat
  const selectedChat = selectedChatId ? chats.find(chat => chat.id === selectedChatId) : null;
  
  // Determine what to show: memory directory for new chats, chat context for existing chats
  const showMemoryDirectory = isNewChat || !selectedChat;
  
  return (
  <div className="w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        {showMemoryDirectory ? (
          /* Show memory directory for context selection in new chats */
          <MemoryDirectory
            memories={memories}
            onMemoryToggle={onMemoryToggle}
            onBlockToggle={onBlockToggle}
            onMemoryExpand={onMemoryExpand}
            onSubmitContext={onSubmitContext}
            onSkipContext={onSkipContext}
            isNewChat={isNewChat}
            contextSubmitted={contextSubmitted}
            firstMessageSent={firstMessageSent}
            isSubmittingContext={isSubmittingContext}
          />
        ) : (
          /* Show chat context for existing/active chats */
          <ChatContext
            selectedChat={selectedChat!}
            memories={memories}
          />
        )}
      </div>
    </div>
  );
};
