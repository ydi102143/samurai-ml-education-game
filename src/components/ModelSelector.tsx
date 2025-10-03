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
    description: 'Yes/Noの判断に強いAI',
    category: 'classification',
    difficulty: '簡単',
    params: {
      learning_rate: { default: 0.01, min: 0.001, max: 0.1, step: 0.001, label: '学習速度', description: 'AIが学習する速さ' },
      max_iterations: { default: 100, min: 50, max: 500, step: 10, label: '学習回数', description: '何回練習するか' },
    },
  },
  {
    id: 'linear_regression',
    name: '線形回帰',
    description: '数値を予測するAI',
    category: 'regression',
    difficulty: '簡単',
    params: {
      learning_rate: { default: 0.01, min: 0.001, max: 0.1, step: 0.001, label: '学習速度', description: 'AIが学習する速さ' },
      max_iterations: { default: 100, min: 50, max: 500, step: 10, label: '学習回数', description: '何回練習するか' },
    },
  },
  {
    id: 'knn',
    name: 'k近傍法',
    description: '似ているデータを探すAI',
    category: 'classification',
    difficulty: '普通',
    params: {
      k: { default: 5, min: 1, max: 20, step: 1, label: '近くの数', description: '参考にする近くのデータの数' },
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
        <h3 className="text-lg font-bold text-purple-900">AIモデルを選ぼう</h3>
      </div>
      <p className="text-sm text-purple-700 mb-4">問題に合ったAIの種類を選んで、設定を調整しよう！</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-2">
            AIモデルの種類
          </label>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:outline-none text-base"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
          
          {/* 選択されたモデルの説明 */}
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-blue-900">{currentModel.name}</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                {currentModel.difficulty}
              </span>
            </div>
            <p className="text-sm text-blue-800">{currentModel.description}</p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-300">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-purple-900" />
            <h4 className="text-sm font-bold text-purple-900">AIの設定を調整</h4>
          </div>
          <p className="text-xs text-purple-700 mb-3">スライダーを動かして、AIの動作を調整しよう</p>

          <div className="space-y-4">
            {Object.entries(currentModel.params).map(([paramName, config]) => {
              const value = parameters[paramName] ?? config.default;
              return (
                <div key={paramName} className="bg-white p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-purple-900">
                      {config.label || paramName}
                    </label>
                    <span className="text-sm font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                      {value}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mb-2">{config.description}</p>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(e) => handleParameterChange(paramName, Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1">
                    <span>小さい</span>
                    <span>大きい</span>
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
