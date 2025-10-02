import { Brain, Settings } from 'lucide-react';

interface Props {
  selectedModel: string;
  parameters: Record<string, number>;
  onModelChange: (model: string) => void;
  onParametersChange: (params: Record<string, number>) => void;
  regionType: string;
}

const models = [
  {
    id: 'logistic_regression',
    name: 'ロジスティック回帰',
    category: 'classification',
    params: {
      learning_rate: { default: 0.01, min: 0.001, max: 0.1, step: 0.001 },
      max_iterations: { default: 100, min: 50, max: 500, step: 10 },
    },
  },
  {
    id: 'linear_regression',
    name: '線形回帰',
    category: 'regression',
    params: {
      learning_rate: { default: 0.01, min: 0.001, max: 0.1, step: 0.001 },
      max_iterations: { default: 100, min: 50, max: 500, step: 10 },
    },
  },
  {
    id: 'knn',
    name: 'k近傍法',
    category: 'classification',
    params: {
      k: { default: 5, min: 1, max: 20, step: 1 },
    },
  },
];

export function ModelSelector({ selectedModel, parameters, onModelChange, onParametersChange, regionType }: Props) {
  const availableModels = models.filter(m => {
    if (regionType === 'classification') return m.category === 'classification';
    if (regionType === 'regression') return m.category === 'regression';
    return true;
  });

  const currentModel = models.find(m => m.id === selectedModel) || availableModels[0];

  const handleParameterChange = (paramName: string, value: number) => {
    onParametersChange({
      ...parameters,
      [paramName]: value,
    });
  };

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-purple-600">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-900" />
        <h3 className="text-lg font-bold text-purple-900">モデル選択</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            機械学習モデル
          </label>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full p-2 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:outline-none"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-300">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-purple-900" />
            <h4 className="text-sm font-bold text-purple-900">パラメータ</h4>
          </div>

          <div className="space-y-3">
            {Object.entries(currentModel.params).map(([paramName, config]) => {
              const value = parameters[paramName] ?? config.default;
              return (
                <div key={paramName}>
                  <label className="block text-xs font-medium text-purple-900 mb-1">
                    {paramName}: <span className="font-bold">{value}</span>
                  </label>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(e) => handleParameterChange(paramName, Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-purple-700 mt-1">
                    <span>{config.min}</span>
                    <span>{config.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
