import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import type { ComposerProps } from '../../types';

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
  onSend,
  disabled = false,
  disabledMessage = "Please submit your context selection before sending messages"
}: ComposerProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea and match button height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
      
      // Set button height to match textarea height
      const sendButton = textareaRef.current.parentElement?.nextElementSibling as HTMLButtonElement;
      if (sendButton) {
        sendButton.style.height = `${scrollHeight}px`;
        sendButton.style.minHeight = '44px';
        sendButton.style.maxHeight = '128px'; // Match max-h-32 of textarea
      }
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
      {/* Context Pills */}
      {contextPills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {contextPills.map((pill) => (
            <div
              key={pill.id}
              className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 
                         dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
            >
              <span>{pill.label}</span>
              <button
                onClick={() => onContextRemove(pill.id)}
                className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Disabled Message */}
      {disabled && (
        <div className="mb-3 p-3 bg-yellow-300 text-black 
                        dark:bg-yellow-800 dark:text-yellow-200
                        rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 flex-shrink-0 text-black dark:text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{disabledMessage}</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-start space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Please select and submit context first..." : "Type your message... (Enter to send, Shift+Enter for new line)"}
            disabled={disabled}
            className={`w-full resize-none rounded-lg border p-3 pr-12 min-h-[44px] max-h-32 overflow-y-auto no-scrollbar ${
              disabled 
                ? 'border-[var(--disabled-border)] bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed'
                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            } placeholder-[var(--text-muted)]`}
            rows={1}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`p-3 rounded-lg transition-colors flex items-center justify-center min-h-[44px] w-12 ${
            disabled || !message.trim()
              ? 'bg-[var(--disabled-bg)] text-[var(--disabled-text)] cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
