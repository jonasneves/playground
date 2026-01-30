import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import type { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors group">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 rounded border-neutral-300 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
      />
      <span
        className={`flex-1 text-base ${
          todo.completed
            ? 'text-neutral-400 line-through'
            : 'text-neutral-900'
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
        aria-label="Delete todo"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
