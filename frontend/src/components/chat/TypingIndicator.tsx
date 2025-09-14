export interface TypingIndicatorProps {
  active: boolean;
}

/**
 * TypingIndicator Component
 * 
 * Props:
 * - active: boolean - whether to show the typing animation
 * 
 * How to integrate:
 * - Show when assistant is generating a response
 * - Connect to your real-time messaging system
 * - Add typing events for user input as well
 */
export const TypingIndicator = ({ active }: TypingIndicatorProps) => {
  if (!active) return null;

  return (
    <div className="flex items-center space-x-1 p-4">
      <div className="flex space-x-1">
        <div className="typing-dot w-2 h-2 bg-[var(--text-muted)] rounded-full"></div>
        <div className="typing-dot w-2 h-2 bg-[var(--text-muted)] rounded-full"></div>
        <div className="typing-dot w-2 h-2 bg-[var(--text-muted)] rounded-full"></div>
      </div>
      <span className="text-sm text-[var(--text-secondary)] ml-2">
        Assistant is typing...
      </span>
    </div>
  );
};
