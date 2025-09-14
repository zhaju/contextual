import type { Memory, Chat } from '../../types';
import { useState, useEffect } from 'react';

interface ChatContextProps {
  selectedChat: Chat;
  memories: Memory[];
}

/**
 * ChatContext Component
 * 
 * Displays the context/memories that an active chat is using.
 * Shows only the selected memory blocks that are associated with this chat.
 */
export const ChatContext = ({ selectedChat, memories }: ChatContextProps) => {
  const [isDark, setIsDark] = useState(false);

  // Check if we're in dark mode
  useEffect(() => {
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(isDarkTheme);
    };

    // Check initially
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Filter memories that are associated with this chat
  const chatMemories = memories.filter(memory => 
    selectedChat.memoryIds?.includes(memory.id)
  );

  // If no context is associated with this chat
  if (chatMemories.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Chat Context
        </h3>
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)] text-sm">
            No context is currently associated with this chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Chat Context
      </h3>
      <div className="space-y-4">
        {chatMemories.map((memory) => (
          <div key={memory.id} className="border border-[var(--border-color)] rounded-lg p-3 bg-[var(--bg-primary)]">
            <h4 className="font-medium text-[var(--text-primary)] mb-2 text-sm">
              {memory.title}
            </h4>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {memory.summary}
            </p>
            
            {/* Show selected memory blocks */}
            <div className="space-y-2">
              {memory.blocks
                .filter(block => block.selected)
                .map((block, blockIndex) => (
                  <div 
                    key={blockIndex}
                    className={`rounded p-2 border ${
                      isDark 
                        ? 'bg-blue-900/20 border-blue-800' 
                        : 'bg-gray-200 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-xs ${
                        isDark ? 'text-blue-200' : 'text-black'
                      }`}>
                        {block.topic}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Selected" />
                    </div>
                    <p className={`text-xs ${
                      isDark ? 'text-blue-300' : 'text-gray-700'
                    }`}>
                      {block.description}
                    </p>
                  </div>
                ))}
            </div>
            
            {/* Show count of selected vs total blocks */}
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              {memory.blocks.filter(b => b.selected).length} of {memory.blocks.length} blocks selected
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};