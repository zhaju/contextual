import { useState } from 'react';
import { AppShell } from './components';
import { 
  chats, 
  topics, 
  messages, 
  suggestedTopics, 
  relevantChats, 
  pinnedContext 
} from './mockData';

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
  const [currentPinnedContext, setCurrentPinnedContext] = useState(pinnedContext);
  const [currentRelevantChats, setCurrentRelevantChats] = useState(relevantChats);

  // Event handlers - replace with real API calls
  const handleChatSelect = (chatId: string) => {
    console.log('Chat selected:', chatId);
    setSelectedChatId(chatId);
    
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
      setCurrentMessages([
        { id: 'm1', role: 'assistant', text: `**Welcome to ${chats.find(c => c.id === chatId)?.title || 'this chat'}!**\n\nThis is a mock conversation.` }
      ]);
    }
  };

  const handleNewChat = () => {
    console.log('New chat created');
    setSelectedChatId(null);
    setCurrentMessages([]);
  };

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    
    // Add user message to state
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
    setCurrentRelevantChats(prev => prev.filter(chat => chat.chatId !== chatId));
    alert(`Chat excluded from suggestions. In a real app, this would update the backend.`);
  };

  const handleContextRemove = (id: string) => {
    console.log('Context removed:', id);
    setCurrentPinnedContext(prev => prev.filter(context => context.id !== id));
  };

  return (
    <AppShell
      chats={chats}
      topics={topics}
      messages={currentMessages}
      suggestedTopics={suggestedTopics}
      relevantChats={currentRelevantChats}
      pinnedContext={currentPinnedContext}
      selectedChatId={selectedChatId}
      isTyping={isTyping}
      onChatSelect={handleChatSelect}
      onNewChat={handleNewChat}
      onSendMessage={handleSendMessage}
      onTopicSelect={handleTopicSelect}
      onChatPin={handleChatPin}
      onChatPreview={handleChatPreview}
      onChatExclude={handleChatExclude}
      onContextRemove={handleContextRemove}
    />
  );
}

export default App;
