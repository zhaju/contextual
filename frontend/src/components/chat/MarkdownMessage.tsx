import ReactMarkdown from 'react-markdown';
import type { MarkdownMessageProps } from '../../types';

/**
 * MarkdownMessage Component
 * 
 * Props:
 * - text: string - markdown content to render
 * 
 * How to integrate:
 * - Replace with your preferred markdown renderer
 * - Add syntax highlighting for code blocks
 * - Implement custom components for links, images, etc.
 * - Add security sanitization for user-generated content
 */
export const MarkdownMessage = ({ text }: MarkdownMessageProps) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          // Custom styling for code blocks
          code: ({ node, className, children, ...props }: any) => {
            const inline = (props as any).inline;
            if (inline) {
              return (
                <code 
                  className="bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-sm font-mono text-[var(--text-primary)]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[var(--bg-tertiary)] p-4 rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Custom styling for lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2">
              {children}
            </ol>
          ),
          // Custom styling for paragraphs
          p: ({ children }) => (
            <p className="my-2 leading-relaxed">
              {children}
            </p>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};
