import { useState, useEffect } from 'react';
import { AppShell } from './components';
// Mock data imports removed - now using backend API calls
import { chatController } from './controllers';
import { convertBackendChatToFrontend, convertBackendMessageToFrontend, extractMemoryBlocksFromChat, convertBackendChatToRelevantChat } from './utils';
import type { Memory, Chat, Message, RelevantChat } from './types';

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
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [relevantChats, setRelevantChats] = useState<RelevantChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

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

  // Function to get memories for a specific chat
  const getMemoriesForChat = (chatId: string) => {
    const chat = allChats.find(c => c.id === chatId);
    if (!chat) return [];
    
    return memories.filter(memory => chat.memoryIds.includes(memory.id));
  };

  // Helper functions to get current chat state
  const getCurrentChat = () => {
    return allChats.find(c => c.id === selectedChatId);
  };

  const isNewChat = () => {
    const chat = getCurrentChat();
    return chat?.isNewChat || false;
  };

  const isContextSubmitted = () => {
    const chat = getCurrentChat();
    return chat?.contextSubmitted || false;
  };

  const isFirstMessageSent = () => {
    const chat = getCurrentChat();
    return chat?.firstMessageSent || false;
  };

  const getFilteredMemories = () => {
    const chat = getCurrentChat();
    if (!chat?.filteredMemories) return [];
    return memories.filter(memory => chat.filteredMemories!.includes(memory.id));
  };


  // Event handlers - TODO: Replace with real API calls to backend
  
  // Chat selection with memory context loading from backend
  const handleChatSelect = async (chatId: string) => {
    console.log('Chat selected:', chatId);
    console.log("!" + chatId + "!");
    if (chatId === "") return;
    
    // Debug print current memory for the selected chat
    const currentChat = allChats.find(c => c.id === chatId);
    if (currentChat) {
      const chatMemories = getMemoriesForChat(chatId);
      console.log('Current memory for chat', chatId, ':', {
        chat: {
          id: currentChat.id,
          title: currentChat.title,
          memoryIds: currentChat.memoryIds
        },
        memories: chatMemories.map(memory => ({
          id: memory.id,
          title: memory.title,
          selected: memory.selected,
          isLocked: memory.isLocked,
          isExpanded: memory.isExpanded,
          chatReferences: memory.chatReferences,
          blocks: memory.blocks.map(block => ({
            id: block.id,
            topic: block.topic,
            description: block.description,
            importance: block.importance,
            selected: block.selected,
            chatReferences: block.chatReferences
          }))
        }))
      });
    }
    
    setSelectedChatId(chatId);

    try {
      // Load chat data from backend
      const backendChat = await chatController.getChat(chatId);
      
      // Convert backend messages to frontend format
      const frontendMessages = backendChat.chat_history.map((msg: any, index: number) => 
        convertBackendMessageToFrontend(msg, `msg-${chatId}-${index}`)
      );
      
      setCurrentMessages(frontendMessages);
      
      // Extract memory blocks from the chat's current memory
      const chatMemories = extractMemoryBlocksFromChat(backendChat);
      if (chatMemories.length > 0) {
        setMemories(prev => [...prev, ...chatMemories]);
      }
      
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Failed to load chat. Please try again.');
      setCurrentMessages([]);
    }
  };

  // New chat creation with context recommendation flow
  const handleNewChat = () => {
    console.log('New chat created');
    
    setSelectedChatId("");
    setCurrentMessages([]);
    setMemories([]);
  };

  // Message sending with context recommendation and SSE streaming
  const handleSendMessage = async (message: string) => {
    console.log('Message sent:', message);
    
    // First message in new chat triggers context recommendation flow
    if (selectedChatId === "") {
      try {
         // Call backend API to create new chat and get context recommendations
         console.log('Sending to backend:', { message });
         const contextResponse = await chatController.createNewChat({ message });
        
        // Convert relevant chats to frontend format
        const relevantChatsList = contextResponse.relevant_chats.map(convertBackendChatToRelevantChat);
        setRelevantChats(relevantChatsList);
        
         // Create a new chat object with the actual chat ID from backend
         const actualChatId = contextResponse.relevant_chats[0]?.id;
         if (actualChatId) {
           const newChat: Chat = {
             id: actualChatId,
             title: contextResponse.relevant_chats[0]?.title || "New Chat",
             last: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
             updatedAt: "Now",
             topicId: "default", // Topics removed - using default
             starred: false,
             memoryIds: [],
             isNewChat: true,
             contextSubmitted: false,
             firstMessageSent: true,
             filteredMemories: contextResponse.relevant_chats.map((c: any) => c.id)
           };
           
           // Add the new chat to the beginning of the array
           setAllChats(prev => [newChat, ...prev]);
           setSelectedChatId(actualChatId);
         }
        
        // Store the user message
        const userMessage = {
          id: `msg-${Date.now()}`,
          role: 'user' as const,
          text: message
        };
        setCurrentMessages([userMessage]);
        
        // Extract memory blocks from relevant chats for context selection
        const relevantMemories = contextResponse.relevant_chats.flatMap(extractMemoryBlocksFromChat);
        setMemories(relevantMemories);
        toggleRightSidebar();
        console.log('Context recommendations received:', contextResponse);
        console.log("relevantMemories:", relevantMemories);
        return; // Don't proceed with assistant response until context is submitted
      } catch (error) {
        console.error('Failed to create new chat:', error);
        setError('Failed to create new chat. Please try again.');
        return;
      }
    }
    
    // For subsequent messages or after context is submitted, proceed normally
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      text: message
    };
    
    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Send message to backend and get SSE response
      const stream = await chatController.sendMessage({
        chat_id: selectedChatId!,
        message: message
      });
      
      // Parse SSE stream
      let assistantResponse = '';
      await chatController.parseSSEStream(
        stream,
        (data: any) => {
          if (data.content) {
            assistantResponse += data.content;
            // Update the assistant message in real-time
            setCurrentMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { ...lastMessage, text: assistantResponse }];
              } else {
                return [...prev, { id: `msg-${Date.now() + 1}`, role: 'assistant', text: assistantResponse }];
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

  // Memory handling functions
  const handleMemoryToggle = (memoryId: string) => {
    setMemories(prev => prev.map(memory => {
      if (memory.id === memoryId) {
        // Toggle only the selected memory, leave others unchanged
        const newSelected = !memory.selected;
        return {
          ...memory,
          selected: newSelected,
          blocks: memory.blocks.map(block => ({ ...block, selected: newSelected }))
        };
      } else {
        // Leave other memories as they are
        return memory;
      }
    }));
    
    // Also update filtered memories if they exist
    const currentFilteredMemories = getFilteredMemories();
    if (currentFilteredMemories.length > 0) {
      // Update the filtered memories in the chat state
      setAllChats(prev => prev.map(chat => 
        chat.id === selectedChatId && chat.filteredMemories
          ? {
              ...chat,
              filteredMemories: chat.filteredMemories.map(memId => {
                if (memId === memoryId) {
                  // This will be handled by the main memories state update above
                  return memId;
                }
                return memId;
              })
            }
          : chat
      ));
    }
  };

  const handleBlockToggle = (memoryId: string, blockId: string) => {
    setMemories(prev => prev.map(memory => {
      if (memory.id === memoryId) {
        const updatedBlocks = memory.blocks.map(block => 
          block.id === blockId ? { ...block, selected: !block.selected } : block
        );
        const someBlocksSelected = updatedBlocks.some(block => block.selected);
        
        return {
          ...memory,
          selected: someBlocksSelected, // Memory is selected if any blocks are selected
          blocks: updatedBlocks
        };
      }
      return memory;
    }));
  };

  const handleMemoryExpand = (memoryId: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, isExpanded: !memory.isExpanded }
        : memory
    ));
  };

  // Context submission after user selection
  const handleSubmitContext = async () => {
    console.log('Context submitted');
    
    // Get selected memory descriptions for context injection
    const selectedContexts = memories
      .filter(memory => memory.selected || memory.blocks.some(block => block.selected))
      .flatMap(memory => [
        memory.title,
        ...memory.blocks.filter(block => block.selected).map(block => `${block.topic}: ${block.description}`)
      ]);
    
    if (selectedContexts.length === 0) {
      setError('Please select at least one context item before submitting.');
      return;
    }
    
    try {
      // Call backend API to set context for the chat
      const stream = await chatController.setChatContext({
        chat_id: selectedChatId!,
        required_context: selectedContexts
      });
      
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
      
      // Lock all selected memories to prevent further changes
      setMemories(prev => prev.map(memory => ({
        ...memory,
        isLocked: memory.selected || memory.blocks.some(block => block.selected)
      })));
      
      // Parse SSE stream for context confirmation
      let contextResponse = '';
      await chatController.parseSSEStream(
        stream,
        (data: any) => {
          if (data.content) {
            contextResponse += data.content;
          }
        },
        () => {
          // Context set successfully, now send the first message
          const firstMessage = currentMessages[0];
          if (firstMessage) {
            // Trigger the message sending flow with the first message
            handleSendMessage(firstMessage.text);
          }
        },
        (error: any) => {
          console.error('Context setting error:', error);
          setError('Failed to set context. Please try again.');
        }
      );
    } catch (error) {
      console.error('Failed to set context:', error);
      setError('Failed to set context. Please try again.');
    }
  };

  // Legacy handlers for compatibility (can be removed later)
  const handleTopicSelect = (topicId: string) => {
    console.log('Topic selected:', topicId);
    // Topics functionality removed - implement if needed with backend API
    alert(`Topic selected: ${topicId}. Topics functionality not implemented yet.`);
  };

  const handleChatPin = (chatId: string) => {
    console.log('Chat pinned:', chatId);
    const chat = allChats.find((c: any) => c.id === chatId);
    alert(`Chat pinned: ${chat?.title || 'Unknown'}. In a real app, this would pin the chat.`);
  };

  const handleChatPreview = (chatId: string) => {
    console.log('Chat preview:', chatId);
    const chat = allChats.find((c: any) => c.id === chatId);
    alert(`Chat preview: ${chat?.title || 'Unknown'}. In a real app, this would show a preview modal.`);
  };

  const handleChatExclude = (chatId: string) => {
    console.log('Chat excluded:', chatId);
    alert(`Chat excluded from suggestions. In a real app, this would update the backend.`);
  };

  const handleContextRemove = (id: string) => {
    console.log('Context removed:', id);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(prev => !prev);
  };

  // Get the appropriate memories to display
  const getDisplayMemories = () => {
    if (isNewChat() && isFirstMessageSent()) {
      return getFilteredMemories();
    }
    if (selectedChatId) {
      return getMemoriesForChat(selectedChatId);
    }
    return memories;
  };

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
      topics={[]} // Topics functionality removed - implement if needed
      messages={currentMessages}
      memories={getDisplayMemories()}
      relevantChats={relevantChats}
      selectedChatId={selectedChatId}
      isTyping={isTyping}
      isNewChat={isNewChat()}
      contextSubmitted={isContextSubmitted()}
      firstMessageSent={isFirstMessageSent()}
      isRightSidebarOpen={isRightSidebarOpen}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onSendMessage={handleSendMessage}
      onMemoryToggle={handleMemoryToggle}
      onBlockToggle={handleBlockToggle}
      onMemoryExpand={handleMemoryExpand}
      onSubmitContext={handleSubmitContext}
      onTopicSelect={handleTopicSelect}
      onChatPin={handleChatPin}
      onChatPreview={handleChatPreview}
      onChatExclude={handleChatExclude}
      onContextRemove={handleContextRemove}
      onToggleRightSidebar={toggleRightSidebar}
    />
  );
}

export default App;
