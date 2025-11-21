import { renderMarkdown } from '@/lib/markdown';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({ content, className = '' }: MarkdownDisplayProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={renderMarkdown(content)}
    />
  );
}

