interface RightSidebarProps {
  onSubmitContext: () => void;
  isContextRequest?: boolean;
  contextSubmitted: boolean;
}

/**
 * RightSidebar Component
 * 
 * Props:
 * - onSubmitContext: () => void - callback when context is submitted
 * - isNewChat: boolean - whether this is a new chat
 * - contextSubmitted: boolean - whether context has been submitted
 * 
 * How to integrate:
 * - Connect to backend context system
 * - Implement context selection workflow
 * - Add context search and filtering
 */
export const RightSidebar = ({
  onSubmitContext,
  isContextRequest,
  contextSubmitted,
}: RightSidebarProps) => {
  return (
    <div className="w-80 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Context</h3>
          
          {isContextRequest && !contextSubmitted ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Select relevant context for your new chat.
              </p>
              <button
                onClick={onSubmitContext}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Context
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              Context has been submitted.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
