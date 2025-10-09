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
  {
    id: 'neural_network',
    name: 'ニューラルネットワーク',
    description: '複雑な問題に強いAI',
    category: 'classification',
    difficulty: '難しい',
    detailedDescription: '人間の脳の仕組みをまねたAI。複雑なパターンを学習して、高度な判断ができます。',
    tips: [
      '🧠 例：複雑な画像認識、自然言語処理、高度な予測',
      '⚡ 複雑な関係性を学習できる',
      '🎯 大量のデータがある場合に威力を発揮',
      '⚠️ 設定が複雑で、過学習しやすい'
    ],
    useCases: '画像認識、音声認識、翻訳、高度な予測など',
    params: {
      learning_rate: { 
        default: 0.01, 
        min: 0.001, 
        max: 0.1, 
        step: 0.001, 
        label: '学習速度', 
        description: 'AIが学習する速さ。ニューラルネットワークでは特に重要',
        tips: '0.01が一般的。複雑な問題は0.001、シンプルな問題は0.05を試してみよう'
      },
      max_iterations: { 
        default: 100, 
        min: 50, 
        max: 500, 
        step: 10, 
        label: '学習回数', 
        description: '何回練習するか。ニューラルネットワークは時間がかかる',
        tips: '100回から始めて、精度が足りない場合は200-300回に増やそう'
      },
    },
  },
  {
    id: 'ensemble',
    name: 'アンサンブル学習',
    description: '複数のAIを組み合わせた強力なAI',
    category: 'both',
    difficulty: '難しい',
    detailedDescription: '複数の異なるモデルを組み合わせて、より正確な予測を行う手法です。各モデルの長所を活かして、単体では難しい問題も解決できます。',
    tips: [
      '🤝 例：複数の専門家の意見をまとめる',
      '⚡ 単体のモデルより高い精度を実現',
      '🎯 多様性のあるモデルを組み合わせると効果的',
      '⚠️ 計算量が多く、解釈が困難'
    ],
    useCases: '高精度な予測が必要な場合、複雑な問題の解決など',
    params: {
      n_estimators: { 
        default: 10, 
        min: 5, 
        max: 50, 
        step: 1, 
        label: 'モデル数', 
        description: '組み合わせるモデルの数。多いほど精度が上がるが、計算量も増える',
        tips: '10個が一般的。問題が簡単な場合は5個、複雑な場合は20-30個を試してみよう'
      },
      voting_method: { 
        default: 0, 
        min: 0, 
        max: 1, 
        step: 1, 
        label: '投票方法', 
        description: '0: 多数決、1: 重み付き平均',
        tips: '分類問題は多数決、回帰問題は重み付き平均が一般的'
      },
    },
  },
  {
    id: 'random_forest',
    name: 'ランダムフォレスト',
    description: '多数の決定木を組み合わせたAI',
    category: 'both',
    difficulty: '中程度',
    detailedDescription: '複数の決定木をランダムに作成し、それらの結果をまとめて予測する手法です。過学習に強く、特徴量の重要度も分かります。',
    tips: [
      '🌳 例：多数の専門家が独立して判断し、その結果をまとめる',
      '⚡ 過学習に強く、安定した性能',
      '🎯 特徴量の重要度が分かる',
      '⚠️ 大量のデータが必要'
    ],
    useCases: '特徴量の重要度を知りたい場合、安定した予測が必要な場合など',
    params: {
      n_trees: { 
        default: 100, 
        min: 10, 
        max: 500, 
        step: 10, 
        label: '木の数', 
        description: '作成する決定木の数。多いほど精度が上がるが、計算量も増える',
        tips: '100本が一般的。問題が簡単な場合は50本、複雑な場合は200-300本を試してみよう'
      },
      max_depth: { 
        default: 10, 
        min: 3, 
        max: 20, 
        step: 1, 
        label: '木の深さ', 
        description: '各決定木の最大の深さ。深いほど複雑なパターンを学習できるが、過学習しやすくなる',
        tips: '10が一般的。データが少ない場合は5-8、大量のデータがある場合は15-20を試してみよう'
      },
    },
  },
  {
    id: 'svm',
    name: 'サポートベクターマシン',
    description: '境界線を最適化するAI',
    category: 'classification',
    difficulty: '中程度',
    detailedDescription: 'データを分ける境界線を最適化する手法です。マージン（余裕）を最大化することで、汎化性能の高いモデルを作ります。',
    tips: [
      '📏 例：2つのグループを最も明確に分ける線を引く',
      '⚡ 高次元データに強い',
      '🎯 少ないデータでも高い性能',
      '⚠️ 大量のデータには向かない'
    ],
    useCases: '高次元データの分類、少ないデータでの学習など',
    params: {
      kernel: { 
        default: 0, 
        min: 0, 
        max: 2, 
        step: 1, 
        label: 'カーネル', 
        description: '0: 線形、1: 多項式、2: RBF',
        tips: '線形データは線形、非線形データはRBFが一般的'
      },
      c: { 
        default: 1, 
        min: 0.1, 
        max: 10, 
        step: 0.1, 
        label: '正則化パラメータ', 
        description: '誤分類の許容度。小さいほど誤分類を許容し、大きいほど厳密に分類',
        tips: '1が一般的。過学習している場合は0.1、未学習の場合は10を試してみよう'
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
          <label className="block text-lg font-bold mb-3 text-blue-900">
            AIモデルの種類
          </label>
          <div className="space-y-3">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'shadow-lg bg-yellow-50 border-yellow-400'
                    : 'hover:bg-blue-50 border-slate-300'
                }`}
                onClick={() => onModelChange(model.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedModel === model.id
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-400'
                  }`}>
                    {selectedModel === model.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-blue-900">{model.name}</div>
                    <div className="text-sm text-blue-700">{model.description}</div>
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
