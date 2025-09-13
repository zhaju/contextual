import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import type { ComposerProps } from '../types';

/**
 * Composer Component
 * 
 * Props:
 * - contextPills: PinnedContext[] - array of context pills to display
 * - onContextRemove: (id: string) => void - callback when context pill is removed
 * - onSend: (message: string) => void - callback when message is sent
 * 
 * How to integrate:
 * - Connect to real message sending API
 * - Implement message drafts and auto-save
 * - Add file upload and attachment support
 * - Implement message templates and shortcuts
 */
export const Composer = ({ 
  contextPills, 
  onContextRemove, 
  onSend 
}: ComposerProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      {/* Context Pills */}
      {contextPills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {contextPills.map((pill) => (
            <div
              key={pill.id}
              className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 
                         text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
            >
              <span>{pill.label}</span>
              <button
                onClick={() => onContextRemove(pill.id)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500 p-3 pr-12
                       min-h-[44px] max-h-32"
            rows={1}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                     text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
