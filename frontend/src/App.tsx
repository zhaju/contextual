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
  const [isSubmittingContext, setIsSubmittingContext] = useState(false);

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
          summary: memory.summary,
          title: currentChat.title,
          selected: memory.selected,
          isLocked: memory.isLocked,
          isExpanded: memory.isExpanded,
          chatReferences: memory.chatReferences,
          blocks: memory.blocks.map(block => ({
            topic: block.topic,
            description: block.description,
            selected: block.selected,
            chatReferences: block.chatReferences
          }))
        }))
      });
    }
    
    setSelectedChatId(chatId);
    
    // Auto-close memory directory when selecting existing chat (not new chat)
    setIsRightSidebarOpen(false);

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
        setMemories(prev => {
          const map = new Map(prev.map(m => [m.id, m]));
          for (const m of chatMemories) {
            map.set(m.id, m);
          }
          return Array.from(map.values());
        });
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
    
    // Auto-close memory directory when creating new chat (will auto-open when first message sent)
    setIsRightSidebarOpen(false);
  };

  // Message sending with context recommendation and SSE streaming
  const handleSendMessage = async (message: string) => {
    console.log('Message sent:', message);

    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user' as const,
      text: message
    };
    
    setCurrentMessages(prev => [...prev, userMessage]);
    
    // First message in new chat triggers context recommendation flow
    if (selectedChatId === "" || selectedChatId === null) {
      try {
        // Call backend API to create new chat and get context recommendations
        console.log('Sending to backend:', { message });
        const contextResponse = await chatController.createNewChat({ message });
        
        // Convert relevant chats to frontend format
        const relevantChatsList = contextResponse.relevant_chats.map(convertBackendChatToRelevantChat);
        setRelevantChats(relevantChatsList);
        
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
            topicId: "default", // Topics removed - using default
            starred: false,
            memoryIds: [],
            isNewChat: true,
            contextSubmitted: false,
            firstMessageSent: true,
            filteredMemories: [] // Will be populated with memory IDs after memories are extracted
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
            topicId: "default",
            starred: false,
            memoryIds: [],
            isNewChat: true,
            contextSubmitted: false,
            firstMessageSent: true,
            filteredMemories: []
          };
          
          setAllChats(prev => [newChat, ...prev]);
          setSelectedChatId(actualChatId);
        }
        
        // Extract memory blocks from relevant chats for context selection
        const relevantMemories = contextResponse.relevant_chats.flatMap(extractMemoryBlocksFromChat);
        setMemories(prev => {
          const map = new Map(prev.map(m => [m.id, m]));
          for (const m of relevantMemories) {
            map.set(m.id, m);
          }
          return Array.from(map.values());
        });
        
        // Update the chat with the memory IDs for filtering
        if (actualChatId) {
          setAllChats(prev => prev.map(chat => 
            chat.id === actualChatId 
              ? { ...chat, filteredMemories: relevantMemories.map((mem: any) => mem.id) }
              : chat
          ));
        }
        
        // If no relevant memories, automatically set context with empty context
        if (relevantMemories.length === 0) {
          console.log('No relevant memories found, setting context with empty context');
          
          // Auto-open memory directory for new chat (even with no context)
          setIsRightSidebarOpen(true);
          
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
                  setCurrentMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...lastMessage, text: assistantResponse }];
                    } else {
                      return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', text: assistantResponse }];
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
        
        // Auto-open memory directory for new chat with context
        setIsRightSidebarOpen(true);
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
            // Convert relevant chats to frontend format
            const contextResponse = data.context;
            const relevantChatsList = contextResponse.relevant_chats.map(convertBackendChatToRelevantChat);
            setRelevantChats(relevantChatsList);
            
            // Extract memory blocks from relevant chats for context selection
            const relevantMemories = contextResponse.relevant_chats.flatMap(extractMemoryBlocksFromChat);
            setMemories(prev => {
              const map = new Map(prev.map(m => [m.id, m]));
              for (const m of relevantMemories) {
                map.set(m.id, m);
              }
              return Array.from(map.values());
            });
            
            // Update the chat with the memory IDs for filtering
            if (selectedChatId) {
              setAllChats(prev => prev.map(chat => 
                chat.id === selectedChatId 
                  ? { ...chat, filteredMemories: relevantMemories.map((mem: any) => mem.id) }
                  : chat
              ));
            }
            
            // Auto-open memory directory for new chat with context
            setIsRightSidebarOpen(true);
            console.log('Context recommendations received:', contextResponse);
            console.log("relevantMemories:", relevantMemories);
            return; // Don't proceed with assistant response until context is submitted
          }
          if (data.content) {
            assistantResponse += data.content;
            // Update the assistant message in real-time
            setCurrentMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                return [...prev.slice(0, -1), { ...lastMessage, text: assistantResponse }];
              } else {
                return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', text: assistantResponse }];
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

  const handleBlockToggle = (memoryId: string, blockIndex: number) => {
    setMemories(prev => prev.map(memory => {
      if (memory.id === memoryId) {
        const updatedBlocks = memory.blocks.map((block, index) => 
          index === blockIndex ? { ...block, selected: !block.selected } : block
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

  // Skip context and proceed with empty context
  const handleSkipContext = async () => {
    if (isSubmittingContext) {
      console.log('Context submission already in progress, ignoring skip request');
      return;
    }
    
    console.log('Context skipped - proceeding with empty context');
    
    if (!selectedChatId) {
      setError('No chat selected. Please try again.');
      return;
    }
    
    setIsSubmittingContext(true);
    setError(null);
    // Auto-close memory directory when context is skipped (chat no longer new)
    setIsRightSidebarOpen(false);
    
    try {
      // Call set_context with empty context
      const request = {
        chat_id: selectedChatId,
        required_context: [] // Empty context
      };
      console.log('Skipping context with empty context:', request);
      
      const stream = await chatController.setChatContext(request);
      
      // Set typing indicator since backend will generate response
      setIsTyping(true);
      
      // Update the current chat to mark context as submitted
      setAllChats(prev => prev.map(chat => 
        chat.id === selectedChatId 
          ? { 
              ...chat, 
              contextSubmitted: true,
              isNewChat: false // No longer a new chat after context is submitted
            }
          : chat
      ));
      
      // Parse SSE stream for assistant response
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
                return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', text: assistantResponse }];
              }
            });
          }
        },
        () => {
          // Context skipped and assistant response received successfully
          setIsSubmittingContext(false);
          setIsTyping(false);
        },
        (error: any) => {
          console.error('Context skip error:', error);
          setError('Failed to skip context. Please try again.');
          setIsSubmittingContext(false);
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Failed to skip context:', error);
      setError('Failed to skip context. Please try again.');
      setIsSubmittingContext(false);
    }
  };

  // Context submission after user selection
  const handleSubmitContext = async () => {
    if (isSubmittingContext) {
      console.log('Context submission already in progress, ignoring duplicate request');
      return;
    }
    
    console.log('Context submitted');
    console.log('Selected chat ID:', selectedChatId);
    console.log('Available memories:', memories);
    console.log('Relevant chats:', relevantChats);
    
    // Get selected memory descriptions for context injection
    const selectedMemories = memories.filter(memory => 
      memory.selected || memory.blocks.some(block => block.selected)
    );
    
    console.log('Selected memories:', selectedMemories);
    
    if (selectedMemories.length === 0) {
      setError('Please select at least one context item before submitting.');
      return;
    }
    
    if (!selectedChatId) {
      setError('No chat selected. Please try again.');
      return;
    }
    
    setIsSubmittingContext(true);
    setError(null);
    // Auto-close memory directory when context is submitted (chat no longer new)
    setIsRightSidebarOpen(false);
    
    try {
      // Get the relevant chats that correspond to the selected memories
      // We need to map the selected memories back to their source chats
      const selectedChatIds = selectedMemories.flatMap(memory => {
        // Use the chatReferences field which contains the actual chat IDs
        return memory.chatReferences || [];
      });
      
      console.log('Selected chat IDs:', selectedChatIds);
      
      // Fetch the full chat objects from the backend
      const fullChats = await Promise.all(
        selectedChatIds.map(chatId => chatController.getChat(chatId))
      );
      
      console.log('Full chats for context:', fullChats);
      
      if (fullChats.length === 0) {
        setError('No relevant chats found for selected context.');
        setIsSubmittingContext(false);
        return;
      }
      
      // Filter the memory blocks based on user selection
      const selectedChats = fullChats.map(chat => {
        // Find the corresponding memory for this chat
        const memory = selectedMemories.find(mem => 
          mem.chatReferences.includes(chat.id)
        );
        
        if (!memory) {
          // If no memory found, return the chat as-is
          return chat;
        }
        
        // Filter the blocks to only include selected ones
        const selectedBlocks = memory.blocks.filter(block => block.selected);
        
        // Create a new chat object with filtered memory blocks
        return {
          ...chat,
          current_memory: {
            ...chat.current_memory,
            blocks: selectedBlocks.map(block => ({
              topic: block.topic,
              description: block.description
            }))
          }
        };
      });
      
      console.log('Selected chats with filtered blocks:', selectedChats);
      
      // Call backend API to set context for the chat
      const request = {
        chat_id: selectedChatId,
        required_context: selectedChats
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
      
      // Lock all selected memories to prevent further changes
      setMemories(prev => prev.map(memory => ({
        ...memory,
        isLocked: memory.selected || memory.blocks.some(block => block.selected)
      })));
      
      // Parse SSE stream for context confirmation and assistant response
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
                return [...prev, { id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, role: 'assistant', text: assistantResponse }];
              }
            });
          }
        },
        () => {
          // Context set and assistant response received successfully
          setIsSubmittingContext(false);
          setIsTyping(false);
        },
        (error: any) => {
          console.error('Context setting error:', error);
          setError('Failed to set context. Please try again.');
          setIsSubmittingContext(false);
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Failed to set context:', error);
      setError('Failed to set context. Please try again.');
      setIsSubmittingContext(false);
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
      // For new chats, return filtered memories for context selection
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
      selectedChatId={selectedChatId}
      isTyping={isTyping} 
      isNewChat={isNewChat()}
      contextSubmitted={isContextSubmitted()}
      firstMessageSent={isFirstMessageSent()}
      isRightSidebarOpen={isRightSidebarOpen}
      isSubmittingContext={isSubmittingContext}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onChatsUpdate={(updater) => setAllChats(prev => updater(prev))}
      onSendMessage={handleSendMessage}
      onMemoryToggle={handleMemoryToggle}
      onBlockToggle={handleBlockToggle}
      onMemoryExpand={handleMemoryExpand}
      onSubmitContext={handleSubmitContext}
      onSkipContext={handleSkipContext}
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
