// Utility functions to convert between frontend and backend types
import type { BackendChat, BackendMemory, BackendChatMessage } from '../controllers/types';
import type { Chat, Memory, MemoryBlock, Message, RelevantChat } from '../types';

/**
 * Convert backend chat to frontend chat format
 */
export function convertBackendChatToFrontend(backendChat: BackendChat): Chat {
  const lastMessage = backendChat.chat_history[backendChat.chat_history.length - 1];
  const lastMessageText = lastMessage ? lastMessage.content : '';
  
  return {
    id: backendChat.id,
    title: backendChat.title,
    last: lastMessageText,
    updatedAt: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : 'Now',
    topicId: 't1', // Default topic - could be enhanced to extract from memory
    starred: false, // Default value
    memoryIds: [], // Will be populated from memory blocks
    isNewChat: false,
    contextSubmitted: false,
    firstMessageSent: backendChat.chat_history.length > 0,
    filteredMemories: []
  };
}

/**
 * Convert backend memory to frontend memory format
 */
export function convertBackendMemoryToFrontend(backendMemory: BackendMemory, memoryId: string): Memory {
  const blocks: MemoryBlock[] = backendMemory.blocks.map((block) => ({
    topic: block.topic,
    description: block.description,
    selected: true, // Auto-select all blocks by default
    chatReferences: []
  }));

  return {
    id: memoryId,
    title: backendMemory.summary_string || 'Memory',
    blocks,
    selected: true, // Auto-select memory by default
    isLocked: false,
    isExpanded: false,
    chatReferences: []
  };
}

/**
 * Convert backend chat message to frontend message format
 */
export function convertBackendMessageToFrontend(backendMessage: BackendChatMessage, messageId: string): Message {
  return {
    id: messageId,
    role: backendMessage.role,
    text: backendMessage.content
  };
}

/**
 * Convert frontend chat messages to backend format
 */
export function convertFrontendMessagesToBackend(messages: Message[]): BackendChatMessage[] {
  return messages.map(message => ({
    role: message.role,
    content: message.text,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Extract memory blocks from backend chat for context
 */
export function extractMemoryBlocksFromChat(backendChat: BackendChat): Memory[] {
  if (!backendChat.current_memory || !backendChat.current_memory.blocks.length) {
    return [];
  }

  const memory = convertBackendMemoryToFrontend(backendChat.current_memory, `mem-${backendChat.id}`);
  
  // Set the chatReferences to include the source chat ID
  memory.chatReferences = [backendChat.id];
  
  return [memory];
}

/**
 * Convert backend chat to frontend relevant chat format
 */
export function convertBackendChatToRelevantChat(backendChat: BackendChat): RelevantChat {
  const lastMessage = backendChat.chat_history[backendChat.chat_history.length - 1];
  const snippet = lastMessage ? lastMessage.content.substring(0, 100) + '...' : 'No messages';
  return {
    chatId: backendChat.id,
    title: backendChat.title,
    snippet: snippet
  };
}
