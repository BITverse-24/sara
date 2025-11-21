'use client';

import { useRef, useState } from 'react';
import { renderMarkdown } from '@/lib/markdown';

interface MarkdownEditorProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function MarkdownEditor({
  id,
  name,
  value,
  onChange,
  placeholder,
  className = '',
  label,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    // Create a synthetic event
    const syntheticEvent = {
      target: { name, value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(syntheticEvent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertMarkdown('**', '**');
  const formatItalic = () => insertMarkdown('*', '*');
  const formatUnderline = () => insertMarkdown('<u>', '</u>');
  const formatCode = () => insertMarkdown('`', '`');
  const formatCodeBlock = () => insertMarkdown('```\n', '\n```');
  const formatLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    if (selectedText) {
      insertMarkdown('[', `](${selectedText})`);
    } else {
      insertMarkdown('[link text](', ')');
    }
  };
  const formatList = () => insertMarkdown('- ', '');
  const formatNumberedList = () => insertMarkdown('1. ', '');

  const getPreviewContent = () => {
    if (!value) {
      return { __html: '<span class="text-gray-500">Preview will appear here...</span>' };
    }
    return renderMarkdown(value || placeholder || '');
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300" htmlFor={id}>
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded"
          >
            {showPreview ? '📝 Edit' : '👁️ Preview'}
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-1 p-2 bg-gray-800 rounded-t-lg border border-gray-700 border-b-0">
        <button
          type="button"
          onClick={formatBold}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={formatItalic}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={formatUnderline}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={formatCode}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors font-mono"
          title="Inline Code"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={formatCodeBlock}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Code Block"
        >
          {'{}'}
        </button>
        <button
          type="button"
          onClick={formatLink}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={formatList}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={formatNumberedList}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
          title="Numbered List"
        >
          1.
        </button>
      </div>

      {showPreview ? (
        <div
          className={`min-h-[120px] w-full rounded-b-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 ${className}`}
          dangerouslySetInnerHTML={getPreviewContent()}
        />
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`min-h-[120px] w-full rounded-b-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none ${className}`}
        />
      )}
      
      <p className="text-xs text-gray-500">
        Use the toolbar above to format text. Supports: <strong>**bold**</strong>, <em>*italic*</em>, <u>underline</u>, <code className="bg-gray-700 px-1 rounded">`code`</code>, links, and lists.
      </p>
    </div>
  );
}

