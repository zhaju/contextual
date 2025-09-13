import { Moon, Sun } from 'lucide-react';
import type { ThemeToggleProps } from '../../types';

/**
 * ThemeToggle Component
 * 
 * Props:
 * - isDark: boolean - current theme state
 * - onToggle: () => void - callback to toggle theme
 * 
 * How to integrate:
 * - Connect to your global state management (Redux, Zustand, etc.)
 * - Persist theme preference in localStorage
 * - Apply theme classes to document.documentElement
 */
export const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
};
