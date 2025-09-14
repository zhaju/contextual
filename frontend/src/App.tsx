import { useState, useEffect } from 'react';
import { AppShell } from './components';
// Mock data imports removed - now using backend API calls
import { chatController } from './controllers';
import { convertBackendChatToFrontend } from './utils';
import type { Chat, Message } from './types';

/**
 * Main App Component - Contextual Chat Frontend
 * 
 * This implements the MVP Version 1 frontend for the contextual chat system.
 * The app automatically recommends relevant past conversations and injects context
 * to eliminate the need to re-explain everything from scratch.
 * 
 * Key Features:
 * - Maintains Topic -> Information mapping after every message
 * - Automatic context recommendations for new chats based on first message
 * - User-controlled context selection with automatic suggestions
 * - Memory persistence across chat sessions
 * 
 * Integration with Backend:
 * 1. Replace mock data with API calls to /api/chats endpoints
 * 2. Implement SSE streaming for real-time message responses
 * 3. Connect memory management to backend context system
 * 4. Add proper error handling and loading states
 */
function App() {
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state for new chats
  const [isNewChat, setIsNewChat] = useState(false);
  const [contextSubmitted, setContextSubmitted] = useState(false);

  // Load chats from backend on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const backendChats = await chatController.getChats();
        const frontendChats = backendChats.map(convertBackendChatToFrontend);
        setAllChats(frontendChats);
      } catch (err) {
        console.error('Failed to load chats:', err);
        setError('Failed to load chats. Please check if the backend is running.');
        // Fallback to empty array
        setAllChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);


  // Helper functions to get current chat state
  const getCurrentChat = () => {
    return allChats.find(c => c.id === selectedChatId);
  };
  
  const getCurrentMessages = (): Message[] => {
    const chat = getCurrentChat();
    return chat?.messages || [];
  };
  
  // Helper function to update messages in the current chat
  const updateCurrentChatMessages = (updater: (messages: Message[]) => Message[]) => {
    if (!selectedChatId) return;
    
    setAllChats(prev => prev.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, messages: updater(chat.messages) }
        : chat
    ));
  };

  // Determine if right sidebar should be open based on new chat state
  const shouldShowRightSidebar = () => {
    // Show sidebar if it's a new chat that hasn't submitted context yet
    return isNewChat && !contextSubmitted;
  };



  // Event handlers - TODO: Replace with real API calls to backend
  
  // Chat selection with memory context loading from backend
  const handleChatSelect = async (chatId: string) => {
    console.log('Chat selected:', chatId);
    if (chatId === "") return;
    
    setSelectedChatId(chatId);
    
    // Reset new chat state
    setIsNewChat(false);
    setContextSubmitted(false);

    try {
      // Check if chat is already loaded with messages
      const existingChat = allChats.find(c => c.id === chatId);
      if (existingChat && existingChat.messages.length > 0) {
        // Chat already loaded, no need to fetch again
        return;
      }
      
      // Load chat data from backend and update the chat in allChats
      const backendChat = await chatController.getChat(chatId);
      const updatedChat = convertBackendChatToFrontend(backendChat);
      
      setAllChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ));
      
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Failed to load chat. Please try again.');
    }
  };

  // New chat creation with context recommendation flow
  const handleNewChat = () => {
    console.log('New chat created');
    
    setSelectedChatId("");
    setIsNewChat(true);
    setContextSubmitted(false);
  };

  // Message sending with context recommendation and SSE streaming
  const handleSendMessage = async (message: string) => {
    console.log('Message sent:', message);

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message
    };
    
    // Add user message to current chat if it exists
    if (selectedChatId && selectedChatId !== "") {
      updateCurrentChatMessages(prev => [...prev, userMessage]);
    }
    
    // First message in new chat triggers context recommendation flow
    if (selectedChatId === "" || selectedChatId === null) {
      try {
        // Call backend API to create new chat and get context recommendations
        console.log('Sending to backend:', { message });
        const contextResponse = await chatController.createNewChat({ message });
        
        
        // Create a new chat object with the actual chat ID from backend
        const actualChatId = contextResponse.chat_id;
        
        // Fetch the full chat details from backend to get the proper title
        try {
          const fullChat = await chatController.getChat(actualChatId);
          const newChat: Chat = {
            id: actualChatId,
            title: fullChat.title,
            last: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            updatedAt: "Now",
            messages: [userMessage] // Start with the user's message
          };
          
          // Add the new chat to the beginning of the array
          setAllChats(prev => [newChat, ...prev]);
          setSelectedChatId(actualChatId);
        } catch (error) {
          console.error('Failed to fetch chat details:', error);
          // Fallback: create chat with basic info
          const newChat: Chat = {
            id: actualChatId,
            title: "New Chat",
            last: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            updatedAt: "Now",
            messages: [userMessage] // Start with the user's message
          };
          
          setAllChats(prev => [newChat, ...prev]);
          setSelectedChatId(actualChatId);
        }
        
        
        // If no relevant memories, automatically set context with empty context
        if (contextResponse.relevant_chats.length === 0) {
          console.log('No relevant memories found, setting context with empty context');
          
          // Update chat to mark context as submitted and no longer new
          if (actualChatId) {
            setAllChats(prev => prev.map(chat => 
              chat.id === actualChatId 
                ? { 
                    ...chat, 
                    contextSubmitted: true,
                    isNewChat: false
                  }
                : chat
            ));
          }
          
          // Set typing indicator since backend will generate response
          setIsTyping(true);
          
          try {
            // Call set_context with empty context to get assistant response
            const request = {
              chat_id: actualChatId,
              required_context: [] // Empty context
            };
            console.log('Setting context with empty context:', request);
            
            const stream = await chatController.setChatContext(request);
            
            // Parse SSE stream for assistant response
            let assistantResponse = '';
            await chatController.parseSSEStream(
              stream,
              (data: any) => {
                if (data.content) {
                  assistantResponse += data.content;
                  // Update the assistant message in real-time
                  updateCurrentChatMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...lastMessage, content: assistantResponse }];
                    } else {
                      return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', content: assistantResponse }];
                    }
                  });
                }
              },
              () => {
                // Stream complete
                setIsTyping(false);
              },
              (error: any) => {
                console.error('SSE stream error:', error);
                setIsTyping(false);
                setError('Failed to get response. Please try again.');
              }
            );
          } catch (error) {
            console.error('Failed to set context:', error);
            setIsTyping(false);
            setError('Failed to set context. Please try again.');
          }
          
          return; // Exit early since we handled the message
        }
        
        console.log('Context recommendations received:', contextResponse);
        return; // Don't proceed with assistant response until context is submitted
      } catch (error) {
        console.error('Failed to create new chat:', error);
        setError('Failed to create new chat. Please try again.');
        return;
      }
    }
    
    // For subsequent messages or after context is submitted, proceed normally
    if (!selectedChatId) {
      console.error('No chat selected');
      setError('No chat selected. Please select a chat or create a new one.');
      return;
    }
    
    setIsTyping(true);
    
    try {
      // Send message to backend and get SSE response
      const stream = await chatController.sendMessage({
        chat_id: selectedChatId,
        message: message
      });
      
      // Parse SSE stream
      let assistantResponse = '';
      await chatController.parseSSEStream(
        stream,
        (data: any) => {
          if (data.hasContext) {
            // Context recommendations received - sidebar will show automatically based on chat state
            console.log('Context recommendations received:', data.context);
            return; // Don't proceed with assistant response until context is submitted
          }
          if (data.content) {
            assistantResponse += data.content;
            // Update the assistant message in real-time
            updateCurrentChatMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { ...lastMessage, content: assistantResponse }];
              } else {
                return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', content: assistantResponse }];
              }
            });
          }
        },
        () => {
          // Stream complete
          setIsTyping(false);
        },
        (error: any) => {
          console.error('SSE stream error:', error);
          setIsTyping(false);
          setError('Failed to get response. Please try again.');
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      setError('Failed to send message. Please try again.');
    }
  };



  // Context submission after user selection
  const handleSubmitContext = async () => {
    console.log('Context submitted');
    console.log('Selected chat ID:', selectedChatId);
    
    if (!selectedChatId) {
      setError('No chat selected. Please try again.');
      return;
    }
    
    setError(null);
    
    try {
      // For now, submit with empty context - the sidebar component will handle selection
      const request = {
        chat_id: selectedChatId,
        required_context: [] // Empty context for now
      };
      console.log('Sending context request:', request);
      
      const stream = await chatController.setChatContext(request);
      
      // Set typing indicator since backend will generate response
      setIsTyping(true);
      
      // Update the current chat to mark context as submitted
      if (selectedChatId) {
        setAllChats(prev => prev.map(chat => 
          chat.id === selectedChatId 
            ? { 
                ...chat, 
                contextSubmitted: true,
                isNewChat: false // No longer a new chat after context is submitted
              }
            : chat
        ));
      }
      
      
      // Parse SSE stream for context confirmation and assistant response
      let assistantResponse = '';
      await chatController.parseSSEStream(
        stream,
        (data: any) => {
          if (data.content) {
            assistantResponse += data.content;
            // Update the assistant message in real-time
            updateCurrentChatMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { ...lastMessage, content: assistantResponse }];
              } else {
                return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', content: assistantResponse }];
              }
            });
          }
        },
        () => {
          // Context set and assistant response received successfully
          setIsTyping(false);
        },
        (error: any) => {
          console.error('Context setting error:', error);
          setError('Failed to set context. Please try again.');
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Failed to set context:', error);
      setError('Failed to set context. Please try again.');
    }
  };

  // Legacy handlers for compatibility (can be removed later)




  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      chats={allChats}
      messages={getCurrentMessages()}
      selectedChatId={selectedChatId}
      isTyping={isTyping} 
      isNewChat={isNewChat}
      contextSubmitted={contextSubmitted}
      isRightSidebarOpen={shouldShowRightSidebar()}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onChatsUpdate={(updater) => setAllChats(prev => updater(prev))}
      onSendMessage={handleSendMessage}
      onSubmitContext={handleSubmitContext}
    />
  );
}

export default App;
