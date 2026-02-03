import { useState } from 'react';
import { FrameworkCode } from './types';

interface CodeViewerProps {
  code: FrameworkCode;
  modelName: string;
}

export function CodeViewer({ code, modelName }: CodeViewerProps) {
  const [framework, setFramework] = useState<'pytorch' | 'tensorflow'>('pytorch');

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          {modelName} Implementation
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFramework('pytorch')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              framework === 'pytorch'
                ? 'bg-orange-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            PyTorch
          </button>
          <button
            onClick={() => setFramework('tensorflow')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              framework === 'tensorflow'
                ? 'bg-orange-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            TensorFlow
          </button>
        </div>
      </div>
      <div className="p-4">
        <pre className="text-xs overflow-x-auto">
          <code className="text-neutral-800 leading-relaxed">
            {code[framework]}
          </code>
        </pre>
      </div>
    </div>
  );
}
