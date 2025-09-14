import type { 
  BackendChat, 
  ContextResponse, 
  SendMessageRequest, 
  SendMessageToChatRequest, 
  SetChatContextRequest,
  StreamedChatResponse,
  DeleteChatRequest,
  DeleteChatResponse
} from './types';
import { API_BASE_URL } from './types';

/**
 * Chat Controller - Handles all API calls to the backend chat endpoints
 */
export class ChatController {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all chats from the backend
   */
  async getChats(): Promise<BackendChat[]> {
    try {
      console.log('🔍 API Call: GET /chats');
      const response = await fetch(`${this.baseUrl}/chats`);
      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📊 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      throw error;
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(chatId: string): Promise<BackendChat> {
    try {
      console.log('🔍 API Call: GET /chats/' + chatId);
      const response = await fetch(`${this.baseUrl}/chats/${chatId}`);
      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Chat not found');
        }
        throw new Error(`Failed to fetch chat: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('📊 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching chat:', error);
      throw error;
    }
  }

  /**
   * Create a new chat with first message and get context recommendations
   */
  async createNewChat(request: SendMessageRequest): Promise<ContextResponse> {
    try {
      console.log('🔍 API Call: POST /chats/new');
      console.log('📤 Request body:', request);
      const response = await fetch(`${this.baseUrl}/chats/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`Failed to create new chat: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating new chat:', error);
      throw error;
    }
  }

  /**
   * Set context for a chat and get SSE response
   */
  async setChatContext(request: SetChatContextRequest): Promise<ReadableStream<Uint8Array> | null> {
    try {
      console.log('🔍 API Call: POST /chats/set_context');
      console.log('📤 Request body:', request);
      const response = await fetch(`${this.baseUrl}/chats/set_context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`Failed to set chat context: ${response.statusText}`);
      }

      console.log('📊 Response body (SSE stream):', response.body ? 'Stream available' : 'No stream');
      return response.body;
    } catch (error) {
      console.error('❌ Error setting chat context:', error);
      throw error;
    }
  }

  /**
   * Send a message to an existing chat and get SSE response
   */
  async sendMessage(request: SendMessageToChatRequest): Promise<ReadableStream<Uint8Array> | null> {
    try {
      console.log('🔍 API Call: POST /chats/send');
      console.log('📤 Request body:', request);
      const response = await fetch(`${this.baseUrl}/chats/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Chat not found');
        }
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      console.log('📊 Response body (SSE stream):', response.body ? 'Stream available' : 'No stream');
      return response.body;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Delete a chat by ID
   */
  async deleteChat(request: DeleteChatRequest): Promise<DeleteChatResponse> {
    try {
      console.log('🔍 API Call: POST /chats/delete');
      console.log('📤 Request body:', request);
      const response = await fetch(`${this.baseUrl}/chats/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Chat not found');
        }
        throw new Error(`Failed to delete chat: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);
      return data as DeleteChatResponse;
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      throw error;
    }
  }
 
  /**
   * Parse SSE stream and call callback for each chunk
   */
  async parseSSEStream(
    stream: ReadableStream<Uint8Array> | null,
    onChunk: (data: StreamedChatResponse) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!stream) {
      onError?.(new Error('No stream available'));
      return;
    }

    try {
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing SSE stream:', error);
      onError?.(error as Error);
    }
  }
}

// Export a default instance
export const chatController = new ChatController();
