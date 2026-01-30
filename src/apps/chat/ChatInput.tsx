import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

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

  // Auto-focus input when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if input is already focused
      if (document.activeElement === inputRef.current) return;

      // Don't interfere if disabled
      if (disabled) return;

      // Don't interfere with modifier keys (except Shift for capitals)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Don't interfere with special keys
      if (e.key.length > 1 && e.key !== 'Space') return;

      // Don't interfere if user is typing in another input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Focus input and let the character be typed naturally
      inputRef.current?.focus();
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
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
    <div className="px-6 py-5 bg-white border-t border-neutral-200">
      <div className="flex items-center gap-2 pl-5 pr-2 py-2 bg-neutral-50 border border-neutral-200 rounded-[28px] transition-all duration-100 focus-within:border-brand-600 focus-within:shadow-[0_0_0_3px_rgba(44,79,124,0.1)]">
        <input
          ref={inputRef}
          type="text"
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 py-2 px-0 bg-transparent border-none text-[15px] text-neutral-900 placeholder-neutral-400 focus:outline-none disabled:text-neutral-400"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          id="send-btn"
          className="w-10 h-10 p-0 flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-all duration-100 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
