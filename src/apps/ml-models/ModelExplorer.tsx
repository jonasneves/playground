import { useState } from 'react';
import { ModelCard } from './ModelCard';
import { ModelChart } from './ModelChart';
import { AccuracyChart } from './AccuracyChart';
import { CodeViewer } from './CodeViewer';
import { models, codeExamples } from './data';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function ModelExplorer() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [chartMetric, setChartMetric] = useState<'params' | 'accuracy' | 'age'>('accuracy');
  const [view, setView] = useState<'comparison' | 'evolution'>('comparison');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-8">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
          Classification Models
        </h1>
        <p className="text-neutral-600">
          Explore pre-trained models with code examples and performance metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                Available Models
              </h2>
              <div className="space-y-3">
                {models.map((model) => (
                  <ModelCard
                    key={model.name}
                    model={model}
                    isSelected={selectedModel.name === model.name}
                    onSelect={() => setSelectedModel(model)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Visualizations
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('comparison')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      view === 'comparison'
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <BarChart3 size={16} />
                    Comparison
                  </button>
                  <button
                    onClick={() => setView('evolution')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      view === 'evolution'
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    <TrendingUp size={16} />
                    Evolution
                  </button>
                </div>
              </div>

              {view === 'comparison' ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setChartMetric('accuracy')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        chartMetric === 'accuracy'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      Accuracy
                    </button>
                    <button
                      onClick={() => setChartMetric('params')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        chartMetric === 'params'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      Parameters
                    </button>
                    <button
                      onClick={() => setChartMetric('age')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        chartMetric === 'age'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      Age
                    </button>
                  </div>
                  <ModelChart models={models} metric={chartMetric} />
                </>
              ) : (
                <AccuracyChart models={models} />
              )}
            </div>

            <CodeViewer
              code={codeExamples[selectedModel.name]}
              modelName={selectedModel.name}
            />

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                About {selectedModel.name}
              </h2>
              <div className="space-y-3 text-sm text-neutral-700">
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Family:</span>
                  <span>{selectedModel.family}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Variants:</span>
                  <span>{selectedModel.variants.join(', ')}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Parameters:</span>
                  <span>{selectedModel.params} million</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Accuracy:</span>
                  <span>{selectedModel.topAccuracy}% (ImageNet Top-1)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Released:</span>
                  <span>{selectedModel.year}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-medium text-neutral-900 min-w-24">Available in:</span>
                  <div className="flex gap-2">
                    {selectedModel.pytorch && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        PyTorch
                      </span>
                    )}
                    {selectedModel.tensorflow && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        TensorFlow
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
