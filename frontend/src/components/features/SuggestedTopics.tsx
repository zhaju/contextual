import type { SuggestedTopicsProps } from '../../types';

/**
 * SuggestedTopics Component
 * 
 * Props:
 * - topics: Topic[] - array of suggested topics
 * - onTopicSelect: (topicId: string) => void - callback when topic is selected
 * 
 * How to integrate:
 * - Connect to AI-powered topic suggestions
 * - Implement topic-based chat filtering
 * - Add topic creation and management
 * - Connect to user preferences and history
 */
export const SuggestedTopics = ({ topics, onTopicSelect }: SuggestedTopicsProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        Suggested Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.id)}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                       bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                       hover:bg-[var(--bg-secondary)] transition-colors
                       border border-[var(--border-color)]"
            style={{ borderLeftColor: topic.color, borderLeftWidth: '3px' }}
          >
            {topic.name}
          </button>
        ))}
      </div>
    </div>
  );
};
