import { useEffect, useRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Editor({ content, onChange, disabled, placeholder }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when content changes (new file loaded)
  useEffect(() => {
    if (content && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [content]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <h3 className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-700">
        Editor
      </h3>
      <textarea
        ref={textareaRef}
        id="editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Select a file to edit...'}
        className="flex-1 w-full px-6 py-4 font-mono text-sm text-neutral-900 resize-none focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
      />
    </div>
  );
}
