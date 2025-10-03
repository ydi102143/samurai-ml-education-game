import { CheckCircle, Circle, Lightbulb } from 'lucide-react';
import { formatNumber } from '../utils/format';
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
    <div className="bg-white rounded-xl shadow-lg border-2 overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
      <div className="p-4" style={{ background: 'linear-gradient(to right, #1e3a8a, #1e40af)' }}>
        <h3 className="text-lg font-bold text-white">使う特徴を選ぼう</h3>
        <p className="text-sm mt-1 text-white/85">
          予測に役立ちそうな特徴を選びます。最低1つは選んでください。
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6 p-4 rounded-lg border-2" style={{ background: 'rgba(30,58,138,0.06)', borderColor: 'var(--gold)' }}>
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
            <div>
              <p className="text-sm leading-relaxed mb-2 text-gray-800">
                <span className="font-bold">特徴選択のポイント：</span>
              </p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• 値のばらつき（標準偏差）が大きい特徴は予測に役立つことが多い</li>
                <li>• すべての特徴を使うと、逆に精度が下がることもある</li>
                <li>• まずは全部使ってみて、少しずつ減らして試してみよう</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm" style={{ color: 'var(--ink)' }}>
            選択中: <span className="font-bold" style={{ color: 'var(--accent-strong)' }}>{selectedFeatures.length}</span> / {dataset.featureNames.length}
          </div>
          <button
            onClick={selectAll}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--accent-strong)' }}
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
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? 'bg-white shadow-md' : 'bg-gray-50 hover:border-gray-300'}`}
                style={{ borderColor: isSelected ? 'var(--gold)' : '#e5e7eb' }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {name}
                      </h4>
                      {isSelected && (<span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--accent)', color: 'white' }}>使用中</span>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">平均:</span> {formatNumber(stats.mean)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">ばらつき:</span> {formatNumber(stats.std)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">最小:</span> {formatNumber(stats.min)}
                      </div>
                      <div className={isSelected ? 'text-gray-700' : 'text-gray-500'}>
                        <span className="font-medium">最大:</span> {formatNumber(stats.max)}
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
