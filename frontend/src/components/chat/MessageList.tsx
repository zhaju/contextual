import type { MessageListProps } from '../../types';
import { MarkdownMessage } from './MarkdownMessage';

/**
 * MessageList Component
 * 
 * Props:
 * - messages: Message[] - array of message objects to display
 * - onForkMessage?: (messageId: string) => void - callback for fork button clicks
 * 
 * How to integrate:
 * - Connect to real-time message updates
 * - Implement message pagination for long conversations
 * - Add message editing and deletion
 * - Implement message reactions and threading
 */
export const MessageList = ({ messages, onForkMessage }: MessageListProps) => {
  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in group`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${
              message.role === 'user'
                ? 'bg-blue-600 text-white dark:bg-blue-700'
                : 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
            }`}
          >
            {message.role === 'assistant' ? (
              <>
                <MarkdownMessage text={message.text} />
                {/* Fork button for assistant messages */}
                {onForkMessage && (
                  <button
                    onClick={() => onForkMessage(message.id)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                    title="Fork conversation from this message"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10,17 15,12 10,7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <p className="whitespace-pre-wrap">{message.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
