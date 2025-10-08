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
    <div className="rounded-xl shadow-lg border-2 overflow-hidden" style={{ background: 'var(--ink-white)', borderColor: 'var(--gold)' }}>
      <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
        <h3 className="text-2xl font-bold text-white">使う特徴を選ぼう</h3>
        <p className="text-lg mt-2 text-yellow-200">
          予測に役立ちそうな特徴を選びます。最低1つは選んでください。
        </p>
      </div>

      <div className="p-8">
        <div className="mb-8 p-6 rounded-lg border-2 bg-slate-50" style={{ borderColor: 'var(--gold)' }}>
          <div className="flex items-start space-x-4">
            <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1 text-yellow-500" />
            <div>
              <p className="text-lg leading-relaxed mb-3 text-blue-900">
                <span className="font-bold">特徴選択のポイント：</span>
              </p>
              <ul className="text-base space-y-2 text-blue-800">
                <li>• 値のばらつき（標準偏差）が大きい特徴は予測に役立つことが多い</li>
                <li>• すべての特徴を使うと、逆に精度が下がることもある</li>
                <li>• まずは全部使ってみて、少しずつ減らして試してみよう</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-lg text-blue-900">
            選択中: <span className="font-bold text-blue-700">{selectedFeatures.length}</span> / {dataset.featureNames.length}
          </div>
          <button
            onClick={selectAll}
            className="text-lg font-bold transition-colors text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg border-2 border-blue-300 hover:border-blue-500"
          >
            すべて選択
          </button>
        </div>

        <div className="space-y-4">
          {dataset.featureNames.map((name, index) => {
            const isSelected = selectedFeatures.includes(index);
            const stats = calculateFeatureStats(index);

            return (
              <button
                key={index}
                onClick={() => toggleFeature(index)}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${isSelected ? 'bg-yellow-50 shadow-lg border-yellow-400' : 'bg-slate-50 hover:bg-blue-50 border-slate-300'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle className="w-8 h-8 text-yellow-500" />
                    ) : (
                      <Circle className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-xl font-bold ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>
                        {name}
                      </h4>
                      {isSelected && (<span className="text-sm px-3 py-1 rounded-full font-bold bg-blue-600 text-white">使用中</span>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-base">
                      <div className={isSelected ? 'text-blue-800' : 'text-slate-500'}>
                        <span className="font-bold">平均:</span> {formatNumber(stats.mean)}
                      </div>
                      <div className={isSelected ? 'text-blue-800' : 'text-slate-500'}>
                        <span className="font-bold">ばらつき:</span> {formatNumber(stats.std)}
                      </div>
                      <div className={isSelected ? 'text-blue-800' : 'text-slate-500'}>
                        <span className="font-bold">最小:</span> {formatNumber(stats.min)}
                      </div>
                      <div className={isSelected ? 'text-blue-800' : 'text-slate-500'}>
                        <span className="font-bold">最大:</span> {formatNumber(stats.max)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedFeatures.length === 0 && (
          <div className="mt-6 bg-red-50 p-6 rounded-lg border-2 border-red-200">
            <p className="text-lg text-red-800 text-center font-bold">
              少なくとも1つの特徴を選んでください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
