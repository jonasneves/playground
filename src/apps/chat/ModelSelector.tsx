import type { Model } from './types';

interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  onClearChat: () => void;
}

const MODELS: { value: Model; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'meta-llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
  { value: 'mistral-large', label: 'Mistral Large' }
];

export function ModelSelector({ selectedModel, onModelChange, onClearChat }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-neutral-200">
      <label htmlFor="model" className="text-sm font-medium text-neutral-700">Model:</label>
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as Model)}
        className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
      >
        {MODELS.map(model => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
      <button
        onClick={onClearChat}
        className="ml-auto px-3 py-1.5 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        Clear Chat
      </button>
    </div>
  );
}
