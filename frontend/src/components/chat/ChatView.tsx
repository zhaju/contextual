import { useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '../../types';

interface ChatViewProps {
  messages: Message[];
  isTyping?: boolean;
}

/**
 * ChatView Component
 * 
 * Props:
 * - messages: Message[] - array of message objects
 * - isTyping?: boolean - whether to show typing indicator
 * 
 * How to integrate:
 * - Connect to real-time message updates via WebSocket
 * - Implement message pagination and infinite scroll
 * - Add message status indicators (sent, delivered, read)
 * - Implement message search and filtering
 */
export const ChatView = ({ messages, isTyping = false }: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList messages={messages} />
        <TypingIndicator active={isTyping} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
