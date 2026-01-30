import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        aria-label="New task"
        className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="Add task"
        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Plus size={18} />
        Add
      </button>
    </form>
  );
}
