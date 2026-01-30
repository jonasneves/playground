import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white px-6 py-4 flex items-center gap-3">
      <input
        ref={inputRef}
        type="text"
        id="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-neutral-100 disabled:text-neutral-400"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        id="send-btn"
        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
}
