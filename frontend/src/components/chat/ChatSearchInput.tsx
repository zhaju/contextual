import { Search } from 'lucide-react';

export interface ChatSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * ChatSearchInput Component
 * 
 * Props:
 * - value: string - current search input value
 * - onChange: (value: string) => void - callback when input changes
 * - placeholder?: string - optional placeholder text
 * 
 * How to integrate:
 * - Connect to search API endpoint
 * - Implement debounced search
 * - Add search filters and sorting options
 * - Show search suggestions as user types
 */
export const ChatSearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search chats..." 
}: ChatSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg \
                   bg-[var(--bg-primary)] text-[var(--text-primary)] \
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent \
                   placeholder-[var(--text-muted)]"
      />
    </div>
  );
};
