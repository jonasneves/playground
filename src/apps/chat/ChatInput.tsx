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
    <div className="px-6 py-5 bg-white border-t border-[#E2E8F0]">
      <div className="flex items-center gap-2 pl-5 pr-2 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[28px] transition-all focus-within:border-[#00539B] focus-within:shadow-[0_0_0_3px_rgba(0,83,155,0.1)]">
        <input
          ref={inputRef}
          type="text"
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 py-2 px-0 bg-transparent border-none text-[15px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none disabled:text-neutral-400"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          id="send-btn"
          className="w-10 h-10 p-0 flex items-center justify-center bg-[#00539B] hover:bg-[#012169] text-white rounded-full transition-all disabled:bg-[#CBD5E1] disabled:text-[#94A3B8] disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
