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
    <div className="editor">
      <h3>Editor</h3>
      <textarea
        ref={textareaRef}
        id="editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Select a file to edit...'}
      />
    </div>
  );
}
