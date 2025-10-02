import { CheckCircle, Circle, Lightbulb } from 'lucide-react';
import type { Dataset } from '../types/ml';

interface Props {
  dataset: Dataset;
  selectedFeatures: number[];
  onFeaturesChange: (features: number[]) => void;
}

export function FeatureSelector({ dataset, selectedFeatures, onFeaturesChange }: Props) {
  const toggleFeature = (index: number) => {
    if (selectedFeatures.includes(index)) {
      onFeaturesChange(selectedFeatures.filter(i => i !== index));
    } else {
      onFeaturesChange([...selectedFeatures, index].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    onFeaturesChange(dataset.featureNames.map((_, i) => i));
  };

  const calculateFeatureStats = (featureIndex: number) => {
    const values = dataset.train.map(d => d.features[featureIndex]);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    return { mean, std, min: Math.min(...values), max: Math.max(...values) };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-green-300 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
        <h3 className="text-lg font-bold text-white">使う特徴を選ぼう</h3>
        <p className="text-sm text-green-50 mt-1">
          予測に役立ちそうな特徴を選びます。最低1つは選んでください。
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                <span className="font-bold">特徴選択のポイント：</span>
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 値のばらつき（標準偏差）が大きい特徴は予測に役立つことが多い</li>
                <li>• すべての特徴を使うと、逆に精度が下がることもある</li>
                <li>• まずは全部使ってみて、少しずつ減らして試してみよう</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            選択中: <span className="font-bold text-green-600">{selectedFeatures.length}</span> / {dataset.featureNames.length}
          </div>
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            すべて選択
          </button>
        </div>

        <div className="space-y-3">
          {dataset.featureNames.map((name, index) => {
            const isSelected = selectedFeatures.includes(index);
            const stats = calculateFeatureStats(index);

            return (
              <button
                key={index}
                onClick={() => toggleFeature(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {name}
                      </h4>
                      {isSelected && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                          使用中
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">平均:</span> {stats.mean.toFixed(2)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">ばらつき:</span> {stats.std.toFixed(2)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">最小:</span> {stats.min.toFixed(2)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">最大:</span> {stats.max.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedFeatures.length === 0 && (
          <div className="mt-4 bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm text-red-800 text-center">
              少なくとも1つの特徴を選んでください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
