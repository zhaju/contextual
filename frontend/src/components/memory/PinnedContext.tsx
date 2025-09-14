import { GripVertical, X } from 'lucide-react';

export interface PinnedContext {
  id: string;
  label: string;
}

export interface PinnedContextProps {
  pinned: PinnedContext[];
  onRemove: (id: string) => void;
}

/**
 * PinnedContext Component
 * 
 * Props:
 * - pinned: PinnedContext[] - array of pinned context items
 * - onRemove: (id: string) => void - callback when context is removed
 * 
 * How to integrate:
 * - Connect to real context management system
 * - Implement drag-and-drop reordering
 * - Add context editing and categorization
 * - Connect to AI-powered context suggestions
 */
export const PinnedContext = ({ pinned, onRemove }: PinnedContextProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        Pinned Context
      </h3>
      <div className="space-y-2">
        {pinned.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-2 rounded-lg 
                       bg-blue-50 border border-blue-200 
                       dark:bg-blue-900/20 dark:border-blue-800
                       hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <GripVertical className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-200 truncate">
                {item.label}
              </span>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors
                         opacity-0 group-hover:opacity-100"
              title="Remove context"
            >
              <X className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        ))}
        {pinned.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] italic">
            No pinned context yet
          </p>
        )}
      </div>
    </div>
  );
};
