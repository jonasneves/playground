import { ModelData } from './types';
import { Check } from 'lucide-react';

interface ModelCardProps {
  model: ModelData;
  isSelected: boolean;
  onSelect: () => void;
}

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{model.name}</h3>
          <p className="text-xs text-neutral-600 mt-0.5">{model.family}</p>
        </div>
        {model.available && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
            <Check size={12} />
            Available
          </span>
        )}
      </div>
      <div className="space-y-1 text-xs text-neutral-600">
        <div className="flex justify-between">
          <span>Parameters:</span>
          <span className="font-medium text-neutral-900">{model.params}M</span>
        </div>
        <div className="flex justify-between">
          <span>Top-1 Accuracy:</span>
          <span className="font-medium text-neutral-900">{model.topAccuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span>Year:</span>
          <span className="font-medium text-neutral-900">{model.year}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-200">
        <p className="text-xs text-neutral-600 mb-1">Variants:</p>
        <div className="flex flex-wrap gap-1">
          {model.variants.map((variant) => (
            <span
              key={variant}
              className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded"
            >
              {variant}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
