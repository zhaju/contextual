import type { MemoryWithUI } from '../../types';

export interface MemoryDirectoryProps {
  memories: MemoryWithUI[];
  onMemoryToggle: (memoryId: string) => void;
  onBlockToggle: (memoryId: string, blockIndex: number) => void;
  onMemoryExpand: (memoryId: string) => void;
  onSubmitContext: () => void;
  onSkipContext?: () => void;
  isNewChat: boolean;
  contextSubmitted: boolean;
  firstMessageSent: boolean;
  isSubmittingContext?: boolean;
}

/**
 * MemoryDirectory Component
 * 
 * Displays a hierarchical directory of memories and their blocks with checkboxes.
 * Allows users to select which context to include in new chats.
 * 
 * Features:
 * - Collapsible memory sections (initially closed)
 * - Memory-level checkboxes that select/deselect all blocks
 * - Individual block-level checkboxes with improved UI
 * - Visual importance indicators (# symbols)
 * - Chat reference links
 * - Locked state when context is submitted
 * - Submit button to finalize context selection
 */
export const MemoryDirectory = ({
  memories,
  onMemoryToggle,
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  onSkipContext,
  isNewChat,
  contextSubmitted,
  firstMessageSent,
  isSubmittingContext = false
}: MemoryDirectoryProps) => {

  const handleBlockToggle = (memoryId: string, blockIndex: number) => {
    if (memories.find(m => m.id === memoryId)?.isLocked) return;
    onBlockToggle(memoryId, blockIndex);
  };

  const handleMemoryExpand = (memoryId: string) => {
    onMemoryExpand(memoryId);
  };


  const hasSelectedBlocks = memories.some(memory => 
    memory.blocks.some(block => block.selected)
  );

  // Determine if we should show the active context selection UI
  const showActiveSelection = isNewChat && firstMessageSent && !contextSubmitted;
  const isDisabled = !showActiveSelection;
  const allowInteraction = showActiveSelection;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-2 ${
          isDisabled 
            ? 'text-[var(--text-muted)]' 
            : 'text-[var(--text-primary)]'
        }`}>
          {showActiveSelection ? 'Select Context' : 
           isNewChat && !firstMessageSent ? 'Send a message to see relevant context' :
           'Memory Directory'}
        </h3>
        <p className={`text-sm ${
          isDisabled 
            ? 'text-[var(--text-muted)]' 
            : 'text-[var(--text-secondary)]'
        }`}>
          {showActiveSelection 
            ? 'Choose which memories to include in this chat' :
           isNewChat && !firstMessageSent ?
            'The AI will analyze your message and suggest relevant memories' :
            'View available memories and their sources'
          }
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {isNewChat && !firstMessageSent ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm">Send your first message to see relevant context suggestions</p>
          </div>
        ) : (
          memories.map((memory) => (
          <div 
            key={memory.id} 
            className={`border rounded-lg ${
              isDisabled || memory.isLocked
                ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-60' 
                : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
            }`}
          >
            {/* Memory Header - Collapsible */}
            <div 
              className={`flex items-center justify-between p-3 ${
                memory.isLocked 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer hover:bg-[var(--bg-secondary)]'
              }`}
              onClick={() => !memory.isLocked && handleMemoryExpand(memory.id)}
            >
              <div className="flex items-center space-x-3">
                <label className="relative w-5 h-5 flex items-center justify-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={memory.selected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onMemoryToggle(memory.id);
                    }}
                    disabled={!allowInteraction || memory.isLocked}
                    className="absolute w-5 h-5 opacity-0 cursor-pointer z-10"
                    tabIndex={0}
                  />
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${memory.selected ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-color)] bg-[var(--bg-primary)]'}
                      ${!allowInteraction || memory.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:scale-110'}`}
                  >
                    {memory.selected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </label>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      isDisabled || memory.isLocked 
                        ? 'text-[var(--text-muted)]' 
                        : 'text-[var(--text-primary)]'
                    }`}>
                      {memory.title}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      ({memory.blocks.filter(block => block.selected).length}/{memory.blocks.length} blocks)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {memory.isLocked && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Locked
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                    memory.isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Memory Blocks - Collapsible */}
            {memory.isExpanded && (
              <div className="border-t border-[var(--border-color)] p-3 bg-[var(--bg-secondary)]">
                <div className="space-y-2">
                  {memory.blocks.map((block, blockIndex) => (
                    <div 
                      key={blockIndex}
                      className={`flex items-start space-x-3 p-2 rounded-lg ${
                        memory.isLocked 
                          ? 'bg-[var(--bg-tertiary)]' 
                          : 'hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <label className="relative w-5 h-5 flex items-center justify-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={block.selected}
                          onChange={() => handleBlockToggle(memory.id, blockIndex)}
                          disabled={!allowInteraction || memory.isLocked}
                          className="absolute w-5 h-5 opacity-0 cursor-pointer z-10"
                          tabIndex={0}
                        />
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                            ${block.selected ? 'bg-blue-600 border-blue-600' : 'border-[var(--border-color)] bg-[var(--bg-primary)]'}
                            ${!allowInteraction || memory.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:scale-110'}`}
                        >
                          {block.selected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isDisabled || memory.isLocked 
                              ? 'text-[var(--text-muted)]' 
                              : 'text-[var(--text-primary)]'
                          }`}>
                            {block.topic}
                          </span>
                          <div className="flex items-center space-x-2">
                            {/* Selection counter will be added here */}
                          </div>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          isDisabled || memory.isLocked 
                            ? 'text-[var(--text-muted)]' 
                            : 'text-[var(--text-secondary)]'
                        }`}>
                          {block.description.length > 52 ? `${block.description.substring(0, 50)}...` : block.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Action Buttons - Only show when active */}
      {showActiveSelection && (
        <div className="space-y-3">
          {/* Submit Context Button */}
          <button
            onClick={onSubmitContext}
            disabled={!hasSelectedBlocks || isSubmittingContext}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              hasSelectedBlocks && !isSubmittingContext
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg dark:bg-blue-700 dark:hover:bg-blue-800'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {isSubmittingContext ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting Context...</span>
              </div>
            ) : (
              'Submit Context'
            )}
          </button>
          
          {/* Skip Context Button */}
          {onSkipContext && (
            <button
              onClick={onSkipContext}
              disabled={isSubmittingContext}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isSubmittingContext
                  ? 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-muted)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
              }`}
            >
              Skip Context
            </button>
          )}
        </div>
      )}
    </div>
  );
};
