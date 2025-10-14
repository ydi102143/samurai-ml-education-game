import { useState } from 'react';
import { Check, Search, Filter } from 'lucide-react';

interface FeatureSelectorProps {
  dataset: any;
  selectedFeatures: number[];
  onFeaturesChange: (features: number[]) => void;
}

export function FeatureSelector({ dataset, selectedFeatures, onFeaturesChange }: FeatureSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'numerical' | 'categorical'>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const featureNames = dataset?.featureNames || [];
  const featureTypes = dataset?.featureTypes || [];

  // フィルタリングされた特徴量を取得
  const filteredFeatures = featureNames
    .map((name: string, index: number) => ({
      name,
      index,
      type: featureTypes[index] || 'numerical'
    }))
    .filter((feature: any) => {
      const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || feature.type === filterType;
      const matchesSelected = !showSelectedOnly || selectedFeatures.includes(feature.index);
      
      return matchesSearch && matchesType && matchesSelected;
    });

  // 特徴量を選択/選択解除
  const toggleFeature = (index: number) => {
    if (selectedFeatures.includes(index)) {
      onFeaturesChange(selectedFeatures.filter(i => i !== index));
    } else {
      onFeaturesChange([...selectedFeatures, index]);
    }
  };

  // すべて選択/すべて選択解除
  const selectAll = () => {
    const allIndices = filteredFeatures.map((feature: any) => feature.index);
    onFeaturesChange([...new Set([...selectedFeatures, ...allIndices])]);
  };

  const deselectAll = () => {
    const filteredIndices = filteredFeatures.map((feature: any) => feature.index);
    onFeaturesChange(selectedFeatures.filter(index => !filteredIndices.includes(index)));
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Filter className="w-6 h-6 mr-2" />
          特徴量選択
        </h2>
        <div className="text-sm text-white/70">
          {selectedFeatures.length} / {featureNames.length} 選択中
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="特徴量を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterType('numerical')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'numerical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              数値
            </button>
            <button
              onClick={() => setFilterType('categorical')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'categorical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              カテゴリ
            </button>
          </div>

          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              showSelectedOnly
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            選択済みのみ
          </button>
        </div>
      </div>

      {/* 特徴量一覧 */}
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {filteredFeatures.map((feature: any) => (
          <div
            key={feature.index}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
              selectedFeatures.includes(feature.index)
                ? 'bg-blue-600/20 border border-blue-500/50'
                : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => toggleFeature(feature.index)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedFeatures.includes(feature.index)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-white/30'
              }`}>
                {selectedFeatures.includes(feature.index) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <div className="font-medium text-white">{feature.name}</div>
                <div className="text-sm text-white/70">
                  {feature.type === 'numerical' ? '数値' : 'カテゴリ'}
                </div>
              </div>
            </div>
            <div className="text-sm text-white/50">
              #{feature.index}
            </div>
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="flex justify-between">
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
          >
            すべて選択
          </button>
          <button
            onClick={deselectAll}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
          >
            すべて選択解除
          </button>
        </div>
        
        <div className="text-sm text-white/70">
          {selectedFeatures.length} 個の特徴量が選択されています
        </div>
      </div>
    </div>
  );
}