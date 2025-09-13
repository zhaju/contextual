import { useState } from 'react';
import { AppShell } from './components';
import { 
  chats, 
  topics, 
  messages, 
  mockMemories
} from './mockData';
import type { Memory } from './types';

/**
 * Main App Component
 * 
 * This is a static, frontend-only Chat UI template with no data layer or API wiring.
 * All data comes from mock constants for easy replacement with real logic later.
 * 
 * How to integrate with real backend:
 * 1. Replace mock data imports with API calls
 * 2. Add state management (Redux, Zustand, etc.)
 * 3. Implement WebSocket connections for real-time updates
 * 4. Add authentication and user management
 * 5. Connect to your backend API endpoints
 */
function App() {
  const [currentMessages, setCurrentMessages] = useState(messages);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  const [allChats, setAllChats] = useState(chats);

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

  // Function to filter memories based on message content (mock search)
  const filterMemoriesByMessage = (message: string) => {
    const searchTerms = message.toLowerCase().split(' ').filter(term => term.length > 2);
    
    // Simple scoring based on keyword matches
    const scoredMemories = memories.map(memory => {
      let score = 0;
      const memoryText = `${memory.title} ${memory.blocks.map(b => `${b.topic} ${b.description}`).join(' ')}`.toLowerCase();
      
      searchTerms.forEach(term => {
        if (memoryText.includes(term)) {
          score += 1;
          // Boost score for topic matches
          if (memory.blocks.some(block => block.topic.toLowerCase().includes(term))) {
            score += 2;
          }
        }
      });
      
      return { memory, score };
    });
    
    // Sort by score and take top 3
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.memory);
  };

  // Event handlers - replace with real API calls
  const handleChatSelect = (chatId: string) => {
    console.log('Chat selected:', chatId);
    setSelectedChatId(chatId);
    
    // Reset memory selections when switching chats
    setMemories(prev => prev.map(memory => ({
      ...memory,
      selected: false,
      isLocked: false,
      blocks: memory.blocks.map(block => ({ ...block, selected: false }))
    })));
    
    // Load different messages based on chat selection
    if (chatId === 'c1') {
      setCurrentMessages(messages);
    } else if (chatId === 'c2') {
      setCurrentMessages([
        { id: 'm1', role: 'assistant', text: '**Welcome to Skew-normal priors chat!**\n\nThis is a mock conversation about Bayesian statistics.' },
        { id: 'm2', role: 'user', text: 'Can you explain skew-normal priors?' },
        { id: 'm3', role: 'assistant', text: 'Skew-normal priors are a flexible family of distributions that can model asymmetric data. They extend the normal distribution by adding a shape parameter that controls skewness.' }
      ]);
    } else {
      const chat = allChats.find(c => c.id === chatId);
      if (chat?.isNewChat) {
        // For new chats, load the messages that were already there
        setCurrentMessages(chat.firstMessageSent ? [
          { id: 'm1', role: 'user', text: 'First message' } // This would be the actual first message
        ] : []);
      } else {
        setCurrentMessages([
          { id: 'm1', role: 'assistant', text: `**Welcome to ${chat?.title || 'this chat'}!**\n\nThis is a mock conversation.` }
        ]);
      }
    }
  };

  const handleNewChat = () => {
    console.log('New chat created');
    
    // Create new chat
    const newChatId = `c${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      last: '',
      updatedAt: 'Now',
      topicId: 't1', // Default topic
      starred: false,
      memoryIds: [], // Start with no memories
      isNewChat: true,
      contextSubmitted: false,
      firstMessageSent: false,
      filteredMemories: []
    };
    
    setAllChats(prev => [newChat, ...prev]);
    setSelectedChatId(newChatId);
    setCurrentMessages([]);
    // Reset memory selections
    setMemories(prev => prev.map(memory => ({
      ...memory,
      selected: false,
      isLocked: false,
      blocks: memory.blocks.map(block => ({ ...block, selected: false }))
    })));
  };

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    
    // If this is the first message in a new chat, don't add to messages yet
    if (isNewChat() && currentMessages.length === 0) {
      const filtered = filterMemoriesByMessage(message);
      const filteredMemoryIds = filtered.map(m => m.id);
      
      // Update the chat state
      setAllChats(prev => prev.map(chat => 
        chat.id === selectedChatId 
          ? { 
              ...chat, 
              firstMessageSent: true,
              filteredMemories: filteredMemoryIds
            }
          : chat
      ));
      
      console.log('Filtered memories based on message:', filtered);
      // Store the message temporarily but don't add to chat yet
      setCurrentMessages([{
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        text: message
      }]);
      return; // Don't proceed with assistant response
    }
    
    // For subsequent messages or after context is submitted, proceed normally
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      text: message
    };
    
    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        text: `I received your message: "${message}". This is a mock response. In a real implementation, this would come from your AI assistant API.`
      };
      setCurrentMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  // Memory handling functions

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

  const handleSubmitContext = () => {
    console.log('Context submitted');
    
    // Get selected memory IDs
    const selectedMemoryIds = memories
      .filter(memory => memory.selected || memory.blocks.some(block => block.selected))
      .map(memory => memory.id);
    
    // Update the current chat to include the selected memories and mark context as submitted
    if (selectedChatId) {
      setAllChats(prev => prev.map(chat => 
        chat.id === selectedChatId 
          ? { 
              ...chat, 
              memoryIds: [...new Set([...chat.memoryIds, ...selectedMemoryIds])],
              contextSubmitted: true,
              isNewChat: false // No longer a new chat after context is submitted
            }
          : chat
      ));
    }
    
    // Lock all selected memories
    setMemories(prev => prev.map(memory => ({
      ...memory,
      isLocked: memory.selected || memory.blocks.some(block => block.selected)
    })));
    
    // Now send the first message and get assistant response
    const firstMessage = currentMessages[0];
    if (firstMessage) {
      setIsTyping(true);
      setTimeout(() => {
        const assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant' as const,
          text: `I received your message: "${firstMessage.text}". This is a mock response. In a real implementation, this would come from your AI assistant API.`
        };
        setCurrentMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 2000);
    }
  };

  // Legacy handlers for compatibility (can be removed later)
  const handleTopicSelect = (topicId: string) => {
    console.log('Topic selected:', topicId);
    const topic = topics.find(t => t.id === topicId);
    alert(`Topic selected: ${topic?.name || 'Unknown'}. In a real app, this would filter the chat list.`);
  };

  const handleChatPin = (chatId: string) => {
    console.log('Chat pinned:', chatId);
    const chat = chats.find(c => c.id === chatId);
    alert(`Chat pinned: ${chat?.title || 'Unknown'}. In a real app, this would pin the chat.`);
  };

  const handleChatPreview = (chatId: string) => {
    console.log('Chat preview:', chatId);
    const chat = chats.find(c => c.id === chatId);
    alert(`Chat preview: ${chat?.title || 'Unknown'}. In a real app, this would show a preview modal.`);
  };

  const handleChatExclude = (chatId: string) => {
    console.log('Chat excluded:', chatId);
    alert(`Chat excluded from suggestions. In a real app, this would update the backend.`);
  };

  const handleContextRemove = (id: string) => {
    console.log('Context removed:', id);
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

  return (
    <AppShell
      chats={allChats}
      topics={topics}
      messages={currentMessages}
      memories={getDisplayMemories()}
      selectedChatId={selectedChatId}
      isTyping={isTyping}
      isNewChat={isNewChat()}
      contextSubmitted={isContextSubmitted()}
      firstMessageSent={isFirstMessageSent()}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onSendMessage={handleSendMessage}
      onBlockToggle={handleBlockToggle}
      onMemoryExpand={handleMemoryExpand}
      onSubmitContext={handleSubmitContext}
      onTopicSelect={handleTopicSelect}
      onChatPin={handleChatPin}
      onChatPreview={handleChatPreview}
      onChatExclude={handleChatExclude}
      onContextRemove={handleContextRemove}
    />
  );
}

export default App;
