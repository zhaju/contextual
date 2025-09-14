import { useEffect, useRef, useState } from 'react';
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
  
  const rotatingTexts = [
    "What should I echo? 🦜",
    "What should I parrot? 🦜", 
    "What's worth repeating? 🦜"
  ];

  // Pick a random text on component mount
  const [randomText] = useState(() => {
    return rotatingTexts[Math.floor(Math.random() * rotatingTexts.length)];
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-4xl font-medium text-[var(--text-primary)]">{randomText}</p>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <TypingIndicator active={isTyping} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
