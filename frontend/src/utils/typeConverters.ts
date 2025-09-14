// Utility functions to convert between frontend and backend types
import type { BackendChat, BackendMemory, BackendChatMessage } from '../controllers/types';
import type { Chat, MemoryWithUI, BlockWithUI, Message, InternalMessage } from '../types';

/**
 * Convert backend chat to frontend chat format
 */
export function convertBackendChatToFrontend(backendChat: BackendChat): Chat {
  const lastMessage = backendChat.chat_history[backendChat.chat_history.length - 1];
  const lastMessageText = lastMessage 
    ? (typeof lastMessage.content === 'string' ? lastMessage.content : 'Context message')
    : '';
  
  // Convert messages, filtering out context messages (they're not displayed)
  const messages: Message[] = backendChat.chat_history
    .filter(msg => msg.role !== 'context') // Context messages are not displayed
    .map((msg, index) => ({
      id: `msg-${backendChat.id}-${index}`,
      role: msg.role,
      content: msg.content
    }));
  
  return {
    id: backendChat.id,
    title: backendChat.title,
    last: lastMessageText,
    updatedAt: 'Now', // TODO: Add timestamp to backend message type
    messages
  };
}

/**
 * Convert backend memory to frontend memory format
 */
export function convertBackendMemoryToFrontend(backendMemory: BackendMemory, memoryId: string, chatTitle?: string): MemoryWithUI {
  const blocks: BlockWithUI[] = backendMemory.blocks.map((block) => ({
    topic: block.topic,
    description: block.description,
    selected: true // Auto-select all blocks by default
  }));

  return {
    id: memoryId,
    summary: backendMemory.summary_string || 'Memory',
    title: chatTitle || backendMemory.summary_string || 'Unknown Chat',
    blocks,
    selected: true, // Auto-select memory by default
    isLocked: false,
    isExpanded: false,
    chatReferences: []
  };
}

/**
 * Convert backend chat message to frontend message format (only user/assistant messages)
 */
export function convertBackendMessageToFrontend(backendMessage: BackendChatMessage, messageId: string): Message | null {
  if (backendMessage.role === 'context') {
    // Context messages are not displayed, return null
    return null;
  } else {
    return {
      id: messageId,
      role: backendMessage.role,
      content: backendMessage.content
    };
  }
}

/**
 * Convert backend chat message to internal message format (includes context)
 */
export function convertBackendMessageToInternal(backendMessage: BackendChatMessage, messageId: string): InternalMessage {
  if (backendMessage.role === 'context') {
    return {
      id: messageId,
      role: 'context',
      content: backendMessage.content.map(contextChat => ({
        id: contextChat.id,
        current_memory: contextChat.current_memory,
        title: contextChat.title
      }))
    };
  } else {
    return {
      id: messageId,
      role: backendMessage.role,
      content: backendMessage.content
    };
  }
}

/**
 * Convert frontend chat messages to backend format
 */
export function convertFrontendMessagesToBackend(messages: Message[]): BackendChatMessage[] {
  return messages.map(message => ({
    id: message.id,
    role: message.role,
    content: message.content
  }));
}

/**
 * Extract context messages from backend chat for sidebar processing
 */
export function extractContextMessagesFromChat(backendChat: BackendChat): InternalMessage[] {
  return backendChat.chat_history
    .filter(msg => msg.role === 'context')
    .map((msg, index) => convertBackendMessageToInternal(msg, `ctx-${backendChat.id}-${index}`));
}

/**
 * Extract memory blocks from backend chat for context
 */
export function extractMemoryBlocksFromChat(backendChat: BackendChat): MemoryWithUI[] {
  if (!backendChat.current_memory || !backendChat.current_memory.blocks.length) {
    return [];
  }

  const memory = convertBackendMemoryToFrontend(backendChat.current_memory, `mem-${backendChat.id}`, backendChat.title);
  
  // Set the chatReferences to include the source chat ID
  memory.chatReferences = [backendChat.id];
  
  return [memory];
}

