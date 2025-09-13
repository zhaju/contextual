import { Search } from 'lucide-react';
import type { ChatSearchInputProps } from '../types';

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
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
      />
    </div>
  );
};
