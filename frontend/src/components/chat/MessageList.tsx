import type { Message } from '../../types';
import { MarkdownMessage } from './MarkdownMessage';

export interface MessageListProps {
  messages: Message[];
}

/**
 * MessageList Component
 * 
 * Props:
 * - messages: Message[] - array of message objects to display
 * 
 * How to integrate:
 * - Connect to real-time message updates
 * - Implement message pagination for long conversations
 * - Add message editing and deletion
 * - Implement message reactions and threading
 */
export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
            }`}
          >
            {message.role === 'assistant' ? (
              <MarkdownMessage text={message.content} />
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
