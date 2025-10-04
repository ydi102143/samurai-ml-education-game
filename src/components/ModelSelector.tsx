import { Brain, Settings, Info } from 'lucide-react';
import { useState } from 'react';

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
    detailedDescription: 'データを2つのグループに分ける直線を引くAI。境界線を学習して、新しいデータがどちらのグループに属するかを判断します。',
    tips: [
      '💡 例：戦で勝つか負けるか、商品が売れるか売れないかを予測',
      '⚡ 計算が速く、結果が分かりやすい',
      '🎯 直線で分けられる問題に最適',
      '⚠️ 複雑な曲線的な関係は苦手'
    ],
    useCases: '戦略の成功/失敗、商品の売上予測、病気の診断など',
    params: {
      learning_rate: { 
        default: 0.01, 
        min: 0.001, 
        max: 0.1, 
        step: 0.001, 
        label: '学習速度', 
        description: 'AIが学習する速さ。大きすぎると学習が不安定になり、小さすぎると時間がかかる',
        tips: '0.01が一般的な値。問題が複雑な場合は0.001、シンプルな場合は0.05を試してみよう'
      },
      max_iterations: { 
        default: 100, 
        min: 50, 
        max: 500, 
        step: 10, 
        label: '学習回数', 
        description: '何回練習するか。多いほど精度が上がるが、時間がかかる',
        tips: '100回で十分な場合が多い。精度が足りない場合は200-300回に増やしてみよう'
      },
    },
  },
  {
    id: 'linear_regression',
    name: '線形回帰',
    description: '数値を予測するAI',
    category: 'regression',
    difficulty: '簡単',
    detailedDescription: 'データの傾向を直線で表現し、新しいデータの値を予測するAI。特徴量と目的変数の関係を学習します。',
    tips: [
      '💡 例：気温から収穫量を予測、人口から税収を予測',
      '📈 「これが増えれば、あれも増える」という関係を見つける',
      '⚡ 計算が速く、結果が分かりやすい',
      '⚠️ 直線的な関係でない場合は精度が下がる'
    ],
    useCases: '収穫量予測、売上予測、価格予測、需要予測など',
    params: {
      learning_rate: { 
        default: 0.01, 
        min: 0.001, 
        max: 0.1, 
        step: 0.001, 
        label: '学習速度', 
        description: 'AIが学習する速さ。大きすぎると学習が不安定になり、小さすぎると時間がかかる',
        tips: '0.01が一般的な値。データが少ない場合は0.001、多い場合は0.05を試してみよう'
      },
      max_iterations: { 
        default: 100, 
        min: 50, 
        max: 500, 
        step: 10, 
        label: '学習回数', 
        description: '何回練習するか。多いほど精度が上がるが、時間がかかる',
        tips: '100回で十分な場合が多い。複雑なデータの場合は200-300回に増やしてみよう'
      },
    },
  },
  {
    id: 'knn',
    name: 'k近傍法',
    description: '似ているデータを探すAI',
    category: 'classification',
    difficulty: '普通',
    detailedDescription: '新しいデータの周りにあるk個の最も近いデータを探し、それらの多数決で判断するAI。距離を計算して近いデータを見つけます。',
    tips: [
      '💡 例：似たような条件の戦いの結果を参考に判断',
      '🔍 データの形が複雑でも対応できる',
      '⚡ 学習は不要で、すぐに予測できる',
      '⚠️ データが多いと計算に時間がかかる'
    ],
    useCases: '戦略の分類、商品のカテゴリ分け、顧客の行動予測など',
    params: {
      k: { 
        default: 5, 
        min: 1, 
        max: 20, 
        step: 1, 
        label: '近くの数', 
        description: '参考にする近くのデータの数。奇数にすると多数決で決まりやすくなる',
        tips: '5が一般的な値。データが少ない場合は3、多い場合は7-9を試してみよう。偶数だと同数になることがあるので奇数がおすすめ'
      },
    },
  },
];

export function ModelSelector({ selectedModel, parameters, onModelChange, onParametersChange, regionType }: Props) {
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const handleInfoClick = (modelId: string) => {
    setShowInfo(modelId);
    setIsAnimating(true);
  };

  const handleCloseInfo = () => {
    setShowInfo(null);
    setIsAnimating(false);
  };


  return (
    <div className="rounded-lg p-6 shadow-lg border-2" style={{ background: 'var(--ink-white)', borderColor: 'var(--gold)' }}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5" style={{ color: 'var(--gold)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>AIモデルを選ぼう</h3>
      </div>
          <p className="text-sm mb-4" style={{ color: 'var(--ink-light)' }}>問題に合ったAIの種類を選んで、設定を調整しよう！</p>
          
          {/* 問題タイプ別のヒント */}
          <div className="mb-6 p-4 rounded-lg border-2" style={{ background: 'var(--silver-light)', borderColor: 'var(--accent-strong)' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
              <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>問題タイプ別のヒント</span>
            </div>
            {regionType === 'classification' ? (
              <div className="text-sm" style={{ color: 'var(--ink-light)' }}>
                <p className="mb-2">📊 <strong>分類問題</strong>：データをグループに分ける問題です</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>例：戦で勝つか負けるか、商品が売れるか売れないか、病気か健康か</p>
              </div>
            ) : regionType === 'regression' ? (
              <div className="text-sm" style={{ color: 'var(--ink-light)' }}>
                <p className="mb-2">📈 <strong>回帰問題</strong>：数値を予測する問題です</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>例：収穫量、売上金額、価格、温度、人口など</p>
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--ink-light)' }}>
                <p className="mb-2">🤔 <strong>問題タイプを確認</strong>：まずデータを確認して問題の種類を把握しましょう</p>
                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>分類：グループ分け、回帰：数値予測</p>
              </div>
            )}
          </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            AIモデルの種類
          </label>
          <div className="space-y-2">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'shadow-md'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  background: selectedModel === model.id ? 'var(--silver-light)' : 'var(--ink-white)',
                  borderColor: selectedModel === model.id ? 'var(--accent)' : 'var(--silver)'
                }}
                onClick={() => onModelChange(model.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedModel === model.id
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedModel === model.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--ink)' }}>{model.name}</div>
                    <div className="text-sm" style={{ color: 'var(--ink-light)' }}>{model.description}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInfoClick(model.id);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="詳細情報を見る"
                >
                  <Info className="w-4 h-4" style={{ color: 'var(--ink-light)' }} />
                </button>
              </div>
            ))}
          </div>
          
        </div>

        <div className="p-4 rounded-lg border" style={{ background: 'var(--silver-light)', borderColor: 'var(--accent-strong)' }}>
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4" style={{ color: 'var(--accent-strong)' }} />
            <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>AIの設定を調整</h4>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-light)' }}>スライダーを動かして、AIの動作を調整しよう</p>

          <div className="space-y-4">
            {Object.entries(currentModel.params).map(([paramName, config]) => {
              const value = parameters[paramName] ?? config.default;
              return (
                <div key={paramName} className="p-3 rounded-lg border" style={{ background: 'var(--ink-white)', borderColor: 'var(--accent-strong)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {config.label || paramName}
                    </label>
                    <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: 'var(--accent-strong)', background: 'var(--silver-light)' }}>
                      {value}
                    </span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--ink-light)' }}>{config.description}</p>
                  {config.tips && (
                    <div className="text-xs p-2 rounded border-l-2 mb-2" style={{ color: 'var(--accent-strong)', background: 'var(--silver-light)', borderColor: 'var(--accent)' }}>
                      💡 {config.tips}
                    </div>
                  )}
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(e) => handleParameterChange(paramName, Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'rgba(30,58,138,0.15)', accentColor: 'var(--accent-strong)' }}
                  />
                  <div className="flex justify-between text-xs mt-1 text-gray-600">
                    <span>小さい</span>
                    <span>大きい</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* モデル詳細ポップアップ */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`bg-white rounded-2xl border-2 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-500 ${
            isAnimating ? 'scale-100 opacity-100 rotate-0' : 'scale-95 opacity-0 rotate-2'
          }`} style={{ borderColor: 'var(--gold)' }}>
            <div className="p-6">
              {(() => {
                const model = models.find(m => m.id === showInfo);
                if (!model) return null;

                return (
                  <div>
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-blue-100">
                          <Brain className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{model.name}</h3>
                          <p className="text-lg text-blue-600">{model.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseInfo}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                      >
                        ×
                      </button>
                    </div>


                    {/* 詳細説明 */}
                    <div className="mb-6 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">詳しい説明</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed mb-4">{model.detailedDescription}</p>
                        
                        {/* 使用例 */}
                        <div className="mb-4">
                          <h5 className="text-sm font-bold text-gray-800 mb-2">📋 使用例</h5>
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            {model.useCases}
                          </p>
                        </div>

                        {/* ヒントとコツ */}
                        <div>
                          <h5 className="text-sm font-bold text-gray-800 mb-2">💡 ヒントとコツ</h5>
                          <div className="space-y-2">
                            {model.tips.map((tip, index) => (
                              <div key={index} className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                                {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* パラメータ説明 */}
                    <div className="mb-6 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">設定パラメータ</h4>
                      <div className="space-y-4">
                        {Object.entries(model.params).map(([paramName, config]) => (
                          <div 
                            key={paramName} 
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{config.label}</span>
                              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded border font-bold">
                                現在値: {parameters[paramName] ?? config.default}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{config.description}</p>
                            
                            {/* パラメータのヒント */}
                            {config.tips && (
                              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-3">
                                <div className="text-xs font-bold text-blue-800 mb-1">💡 調整のコツ</div>
                                <p className="text-xs text-blue-700">{config.tips}</p>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 bg-white/50 px-3 py-2 rounded border">
                              <span className="font-medium">範囲:</span> {config.min} ～ {config.max} 
                              <span className="ml-2 font-medium">ステップ:</span> {config.step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 難易度とカテゴリ */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-slideInUp" style={{ animationDelay: '0.6s' }}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">難易度:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            model.difficulty === '簡単' 
                              ? 'bg-green-100 text-green-800' 
                              : model.difficulty === '普通'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {model.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">タイプ:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            model.category === 'classification' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {model.category === 'classification' ? '分類' : '回帰'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 閉じるボタン */}
                    <div className="mt-6 flex justify-end animate-slideInUp" style={{ animationDelay: '0.7s' }}>
                      <button
                        onClick={handleCloseInfo}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
