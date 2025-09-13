import type { MemoryDirectoryProps } from '../../types';

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
  onBlockToggle,
  onMemoryExpand,
  onSubmitContext,
  isNewChat,
  contextSubmitted,
  firstMessageSent
}: MemoryDirectoryProps) => {

  const handleBlockToggle = (memoryId: string, blockId: string) => {
    if (memories.find(m => m.id === memoryId)?.isLocked) return;
    onBlockToggle(memoryId, blockId);
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
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-gray-900 dark:text-white'
        }`}>
          {showActiveSelection ? 'Select Context' : 
           isNewChat && !firstMessageSent ? 'Send a message to see relevant context' :
           'Memory Directory'}
        </h3>
        <p className={`text-sm ${
          isDisabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-600 dark:text-gray-400'
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          >
            {/* Memory Header - Collapsible */}
            <div 
              className={`flex items-center justify-between p-3 ${
                memory.isLocked 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              onClick={() => !memory.isLocked && handleMemoryExpand(memory.id)}
            >
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // If memory is selected, unselect all blocks; if not selected, select all blocks
                    if (memory.selected) {
                      // Unselect all blocks
                      memory.blocks.forEach(block => {
                        if (block.selected) {
                          handleBlockToggle(memory.id, block.id);
                        }
                      });
                    } else {
                      // Select all blocks
                      memory.blocks.forEach(block => {
                        if (!block.selected) {
                          handleBlockToggle(memory.id, block.id);
                        }
                      });
                    }
                  }}
                  disabled={!allowInteraction || memory.isLocked}
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    memory.selected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  } ${
                    !allowInteraction || memory.isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-110'
                  }`}
                >
                  {memory.selected && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      isDisabled || memory.isLocked 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {memory.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({memory.blocks.filter(block => block.selected).length}/{memory.blocks.length} blocks)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {memory.isLocked && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Locked
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
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
              <div className="border-t border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2">
                  {memory.blocks.map((block) => (
                    <div 
                      key={block.id}
                      className={`flex items-start space-x-3 p-2 rounded-lg ${
                        memory.isLocked 
                          ? 'bg-gray-100 dark:bg-gray-700' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleBlockToggle(memory.id, block.id)}
                        disabled={!allowInteraction || memory.isLocked}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center mt-0.5 ${
                          block.selected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        } ${
                          !allowInteraction || memory.isLocked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'cursor-pointer hover:scale-110'
                        }`}
                      >
                        {block.selected && (
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isDisabled || memory.isLocked 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {block.topic}
                          </span>
                          <div className="flex items-center space-x-2">
                            {/* Selection counter will be added here */}
                          </div>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          isDisabled || memory.isLocked 
                            ? 'text-gray-400 dark:text-gray-500' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {block.description}
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

      {/* Submit Button - Only show when active */}
      {showActiveSelection && (
        <button
          onClick={onSubmitContext}
          disabled={!hasSelectedBlocks}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            hasSelectedBlocks
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Context
        </button>
      )}
    </div>
  );
};
