import { Moon, Sun } from 'lucide-react';

export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

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
      className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
      )}
    </button>
  );
};
