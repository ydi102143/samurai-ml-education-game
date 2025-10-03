import { Brain, Settings, Info, X, Play, Pause, RotateCcw } from 'lucide-react';
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
    animation: 'line',
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
    detailedDescription: 'データの傾向を直線で表現し、新しいデータの値を予測するAI。特徴量と目的変数の関係を学習します。',
    animation: 'trend',
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
    detailedDescription: '新しいデータの周りにあるk個の最も近いデータを探し、それらの多数決で判断するAI。距離を計算して近いデータを見つけます。',
    animation: 'neighbors',
    params: {
      k: { default: 5, min: 1, max: 20, step: 1, label: '近くの数', description: '参考にする近くのデータの数' },
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

  const renderAnimation = (animationType: string) => {
    switch (animationType) {
      case 'line':
        return (
          <div className="relative w-full h-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
              {/* 背景グリッド */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="1"/>
                </pattern>
                <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* データポイント（赤クラス） */}
              <circle cx="60" cy="40" r="6" fill="url(#redGradient)" className="animate-pulse">
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="60" r="6" fill="url(#redGradient)" className="animate-pulse" style={{ animationDelay: '0.3s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.3s" />
              </circle>
              <circle cx="140" cy="80" r="6" fill="url(#redGradient)" className="animate-pulse" style={{ animationDelay: '0.6s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.6s" />
              </circle>
              <circle cx="180" cy="100" r="6" fill="url(#redGradient)" className="animate-pulse" style={{ animationDelay: '0.9s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.9s" />
              </circle>
              
              {/* データポイント（青クラス） */}
              <circle cx="80" cy="100" r="6" fill="url(#blueGradient)" className="animate-pulse" style={{ animationDelay: '0.1s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.1s" />
              </circle>
              <circle cx="120" cy="120" r="6" fill="url(#blueGradient)" className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.4s" />
              </circle>
              <circle cx="160" cy="140" r="6" fill="url(#blueGradient)" className="animate-pulse" style={{ animationDelay: '0.7s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="0.7s" />
              </circle>
              <circle cx="200" cy="160" r="6" fill="url(#blueGradient)" className="animate-pulse" style={{ animationDelay: '1s' }}>
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin="1s" />
              </circle>
              
              {/* 境界線（動的に描画） */}
              <line x1="20" y1="50" x2="380" y2="130" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round">
                <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
              </line>
              
              {/* 境界線の影 */}
              <line x1="22" y1="52" x2="382" y2="132" stroke="rgba(0,0,0,0.2)" strokeWidth="4" strokeLinecap="round" opacity="0.3">
                <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.3;0.3;0" dur="3s" repeatCount="indefinite" />
              </line>
              
              {/* 分類ラベル */}
              <text x="20" y="30" className="text-xs font-bold fill-red-600">クラスA</text>
              <text x="20" y="150" className="text-xs font-bold fill-blue-600">クラスB</text>
            </svg>
          </div>
        );
      
      case 'trend':
        return (
          <div className="relative w-full h-40 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
              <defs>
                <pattern id="trendGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="1"/>
                </pattern>
                <linearGradient id="pointGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#trendGrid)" />
              
              {/* データポイント */}
              {[...Array(12)].map((_, i) => {
                const x = 30 + i * 30;
                const y = 120 - i * 4 - Math.sin(i * 0.5) * 10;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="url(#pointGradient)">
                      <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                    </circle>
                    {/* データポイントの光る効果 */}
                    <circle cx={x} cy={y} r="8" fill="none" stroke="url(#pointGradient)" strokeWidth="1" opacity="0.3">
                      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
                    </circle>
                  </g>
                );
              })}
              
              {/* トレンドライン（ベジェ曲線） */}
              <path d="M 30,120 Q 100,100 200,80 T 370,60" stroke="url(#trendGradient)" strokeWidth="3" fill="none" strokeLinecap="round">
                <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
              </path>
              
              {/* 予測エリア（点線） */}
              <path d="M 370,60 Q 380,50 390,40" stroke="url(#trendGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="5,5">
                <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" begin="2s" />
              </path>
              
              {/* 軸ラベル */}
              <text x="10" y="140" className="text-xs font-bold fill-gray-600">特徴量</text>
              <text x="350" y="20" className="text-xs font-bold fill-gray-600">目的変数</text>
            </svg>
          </div>
        );
      
      case 'neighbors':
        return (
          <div className="relative w-full h-40 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-lg overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
              <defs>
                <pattern id="neighborGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="1"/>
                </pattern>
                <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </radialGradient>
                <radialGradient id="neighborGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#be185d" />
                </radialGradient>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#neighborGrid)" />
              
              {/* 中心のデータポイント */}
              <g>
                <circle cx="200" cy="80" r="8" fill="url(#centerGradient)">
                  <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="80" r="16" fill="none" stroke="url(#centerGradient)" strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
              
              {/* 近傍のデータポイント */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45) * Math.PI / 180;
                const radius = 40 + Math.sin(i * 0.5) * 10;
                const x = 200 + Math.cos(angle) * radius;
                const y = 80 + Math.sin(angle) * radius;
                
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="url(#neighborGradient)">
                      <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                    </circle>
                    {/* 距離線 */}
                    <line x1="200" y1="80" x2={x} y2={y} stroke="url(#lineGradient)" strokeWidth="1" opacity="0.6">
                      <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                    </line>
                    {/* 距離の数値 */}
                    <text x={x + 5} y={y - 5} className="text-xs font-bold fill-gray-600" opacity="0.8">
                      <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                      {Math.round(radius)}
                    </text>
                  </g>
                );
              })}
              
              {/* k値の表示 */}
              <rect x="320" y="20" width="60" height="30" rx="15" fill="rgba(168,85,247,0.1)" stroke="url(#centerGradient)" strokeWidth="2">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </rect>
              <text x="350" y="40" className="text-sm font-bold fill-purple-600" textAnchor="middle">k=5</text>
              
              {/* ラベル */}
              <text x="20" y="20" className="text-xs font-bold fill-purple-600">新しいデータ</text>
              <text x="20" y="150" className="text-xs font-bold fill-pink-600">近傍データ</text>
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2" style={{ borderColor: 'var(--gold)' }}>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5" style={{ color: 'var(--gold)' }} />
        <h3 className="text-lg font-bold text-gray-900">AIモデルを選ぼう</h3>
      </div>
      <p className="text-sm mb-4 text-gray-700">問題に合ったAIの種類を選んで、設定を調整しよう！</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">
            AIモデルの種類
          </label>
          <div className="space-y-2">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'bg-blue-50 border-blue-400 shadow-md'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
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
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-600">{model.description}</div>
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
                  <Info className="w-4 h-4 text-gray-500 hover:text-blue-500" />
                </button>
              </div>
            ))}
          </div>
          
          {/* 選択されたモデルの説明 */}
          <div className="mt-2 p-3 rounded-lg border" style={{ background: 'rgba(30,58,138,0.06)', borderColor: 'var(--accent-strong)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{currentModel.name}</span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--accent)', color: 'white' }}>
                {currentModel.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-800">{currentModel.description}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ background: 'rgba(30,58,138,0.06)', borderColor: 'var(--accent-strong)' }}>
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4" style={{ color: 'var(--accent-strong)' }} />
            <h4 className="text-sm font-bold text-gray-900">AIの設定を調整</h4>
          </div>
          <p className="text-xs mb-3 text-gray-700">スライダーを動かして、AIの動作を調整しよう</p>

          <div className="space-y-4">
            {Object.entries(currentModel.params).map(([paramName, config]) => {
              const value = parameters[paramName] ?? config.default;
              return (
                <div key={paramName} className="bg-white p-3 rounded-lg border" style={{ borderColor: 'var(--accent-strong)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-900">
                      {config.label || paramName}
                    </label>
                    <span className="text-sm font-bold px-2 py-1 rounded" style={{ color: 'var(--accent-strong)', background: 'rgba(30,58,138,0.1)' }}>
                      {value}
                    </span>
                  </div>
                  <p className="text-xs mb-2 text-gray-700">{config.description}</p>
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

                    {/* アニメーション */}
                    <div className="mb-6 animate-slideInUp">
                      <h4 className="text-lg font-bold text-gray-900 mb-3 animate-glow">動作の仕組み</h4>
                      <div className="animate-bounceIn" style={{ animationDelay: '0.2s' }}>
                        {renderAnimation(model.animation)}
                      </div>
                    </div>

                    {/* 詳細説明 */}
                    <div className="mb-6 animate-slideInUp" style={{ animationDelay: '0.3s' }}>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">詳しい説明</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-pulse-glow">
                        <p className="text-gray-700 leading-relaxed">{model.detailedDescription}</p>
                      </div>
                    </div>

                    {/* パラメータ説明 */}
                    <div className="mb-6 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">設定パラメータ</h4>
                      <div className="space-y-3">
                        {Object.entries(model.params).map(([paramName, config], index) => (
                          <div 
                            key={paramName} 
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200 animate-float"
                            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{config.label}</span>
                              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">
                                現在値: {parameters[paramName] ?? config.default}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{config.description}</p>
                            <div className="mt-2 text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
                              範囲: {config.min} ～ {config.max} (ステップ: {config.step})
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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium animate-pulse ${
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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium animate-pulse ${
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
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse-glow"
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
