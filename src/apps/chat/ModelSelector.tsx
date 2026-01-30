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
    <div className="model-selector">
      <label htmlFor="model">Model:</label>
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as Model)}
      >
        {MODELS.map(model => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
      <button
        onClick={onClearChat}
        style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '13px' }}
      >
        Clear Chat
      </button>
    </div>
  );
}
