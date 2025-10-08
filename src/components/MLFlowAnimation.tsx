import { useState, useEffect } from 'react';
import { Sparkles, Zap, Target, BarChart3, Settings, Brain, TrendingUp, Rocket } from 'lucide-react';

interface MLFlowAnimationProps {
  onClose: () => void;
}

const steps = [
  {
    id: 'problem',
    title: '1. 問題を決める',
    description: '何を予測したいか決める',
    example: '戦で勝つか負けるか？',
    details: [
      '予測したいことを決める',
      '使えるデータを確認する'
    ],
    tips: 'まず「何を知りたいか」を決めよう！',
    icon: '🎯',
    lucideIcon: Target,
    color: 'from-red-500 to-red-700',
    animation: 'animate-pulse',
    visualElements: [
      { type: 'question', text: '何を予測したい？', position: 'top-left' },
      { type: 'data', text: '使えるデータは？', position: 'top-right' },
      { type: 'arrow', from: 'question', to: 'data' }
    ]
  },
  {
    id: 'eda',
    title: '2. データを見る',
    description: 'グラフでデータの特徴を確認',
    example: '兵力が多いと勝ちやすい？',
    details: [
      'グラフでデータの分布を見る',
      '特徴量の関係を調べる'
    ],
    tips: 'データをよく見ると、パターンが見えてくる！',
    icon: '📊',
    lucideIcon: BarChart3,
    color: 'from-orange-500 to-orange-700',
    animation: 'animate-bounce',
    visualElements: [
      { type: 'chart', text: '散布図', position: 'center' },
      { type: 'pattern', text: 'パターン発見！', position: 'bottom' }
    ]
  },
  {
    id: 'preprocess',
    title: '3. データを整える',
    description: 'AIが理解できる形に変換',
    example: '「勝ち」→1、「負け」→0',
    details: [
      '文字を数値に変換する',
      'データのスケールを揃える'
    ],
    tips: 'AIは数値しか分からないから、変換が必要！',
    icon: '🔧',
    lucideIcon: Settings,
    color: 'from-yellow-500 to-yellow-700',
    animation: 'animate-spin',
    visualElements: [
      { type: 'transform', text: '文字→数値', position: 'left' },
      { type: 'normalize', text: '正規化', position: 'right' }
    ]
  },
  {
    id: 'features',
    title: '4. 特徴を選ぶ',
    description: '予測に役立つ特徴を選択',
    example: '兵力と戦術だけを使う',
    details: [
      '予測に役立ちそうな特徴を選ぶ',
      '不要な特徴は除外する'
    ],
    tips: '全部使うと逆に精度が下がることもある！',
    icon: '🎯',
    lucideIcon: Target,
    color: 'from-indigo-500 to-indigo-700',
    animation: 'animate-pulse',
    visualElements: [
      { type: 'select', text: '特徴選択', position: 'center' },
      { type: 'filter', text: 'フィルタ', position: 'right' }
    ]
  },
  {
    id: 'model',
    title: '5. AIを学習させる',
    description: 'データでAIを訓練する',
    example: '境界線を学習して勝敗を判定',
    details: [
      '適切なAIモデルを選ぶ',
      'データで学習させる'
    ],
    tips: '問題に合ったAIを選んで、たくさん練習させる！',
    icon: '🤖',
    lucideIcon: Brain,
    color: 'from-green-500 to-green-700',
    animation: 'animate-pulse',
    visualElements: [
      { type: 'learning', text: '学習中...', position: 'center' },
      { type: 'progress', text: '85%', position: 'bottom' }
    ]
  },
  {
    id: 'evaluate',
    title: '6. 性能を確認',
    description: 'AIの正解率を測る',
    example: '85%正解！',
    details: [
      'テストデータで性能を測る',
      '正解率を確認する'
    ],
    tips: '新しいデータでテストして、本当に使えるか確認！',
    icon: '📈',
    lucideIcon: TrendingUp,
    color: 'from-blue-500 to-blue-700',
    animation: 'animate-bounce',
    visualElements: [
      { type: 'accuracy', text: '85%', position: 'center' },
      { type: 'checkmark', text: '✓', position: 'right' }
    ]
  },
  {
    id: 'deploy',
    title: '7. 実際に使う',
    description: '学習したAIを活用する',
    example: '新しい戦略の成功確率を予測',
    details: [
      '実際のデータで予測する',
      '結果を活用して判断する'
    ],
    tips: 'AIは継続的に改善していくことが大切！',
    icon: '🚀',
    lucideIcon: Rocket,
    color: 'from-purple-500 to-purple-700',
    animation: 'animate-pulse',
    visualElements: [
      { type: 'prediction', text: '予測結果', position: 'center' },
      { type: 'success', text: '成功！', position: 'bottom' }
    ]
  }
];

export function MLFlowAnimation({ onClose }: MLFlowAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    
    if (currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000); // 4秒間隔で自動進行
    } else if (currentStep === steps.length - 1) {
      setIsCompleted(true);
      // 完了後、5秒後に自動で閉じる
      setTimeout(() => {
        onClose();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, onClose]);


  const currentStepData = steps[currentStep];


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-1">
      <div className="bg-white rounded-3xl border-4 shadow-2xl w-[98vw] h-[98vh] overflow-hidden flex flex-col" style={{ borderColor: 'var(--gold)' }}>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">機械学習の流れ</h2>
                <p className="text-sm text-gray-600">7つのステップで学ぶAIの作り方</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-lg font-bold rounded-full transition-all duration-200 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* プログレスバー */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold text-gray-800">学習進捗</span>
              <span className="text-base font-bold text-gray-800">{currentStep + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="h-3 rounded-full transition-all duration-700 shadow-lg"
                style={{
                  background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)',
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}
              />
            </div>
            <div className="mt-1 text-center">
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% 完了
              </span>
            </div>
          </div>

          {/* 現在のステップ */}
          <div className="mb-4 relative flex-1 min-h-0">
            <div className={`bg-gradient-to-br ${currentStepData.color} text-white p-6 rounded-2xl transform transition-all duration-700 hover:scale-105 shadow-xl relative overflow-hidden h-full`}>
              {/* 背景装飾 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
              <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="text-5xl">
                      {currentStepData.icon}
                    </div>
                    {currentStepData.lucideIcon && (
                      <div className="absolute -top-1 -right-1 text-lg text-white/90 bg-white/20 rounded-full p-1">
                        <currentStepData.lucideIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-2 leading-tight">{currentStepData.title}</h3>
                    <p className="text-xl opacity-95 leading-relaxed">{currentStepData.description}</p>
                  </div>
                </div>
                
                {/* 例の表示と詳細な手順を横並びに */}
                <div className="flex gap-4 mb-4 flex-1 min-h-0">
                  {/* 例の表示 */}
                  <div className="bg-white/25 p-4 rounded-xl backdrop-blur-sm border-2 border-white/40 flex-shrink-0 w-1/2">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 bg-yellow-400/30 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-yellow-200" />
                      </div>
                      <h4 className="text-lg font-bold text-yellow-100">具体例</h4>
                    </div>
                    <p className="text-lg font-medium leading-relaxed">{currentStepData.example}</p>
                  </div>
                  
                  {/* 詳細な手順 */}
                  <div className="bg-white/15 p-4 rounded-xl backdrop-blur-sm border-2 border-white/30 flex-1 min-h-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-6 h-6 bg-blue-400/30 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-200" />
                      </div>
                      <h4 className="text-lg font-bold text-blue-100">具体的な手順</h4>
                    </div>
                    <div className="space-y-2">
                      {currentStepData.details.map((detail, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg">
                          <div className="w-6 h-6 bg-white/25 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm opacity-95 leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* ヒント */}
                <div className="bg-gradient-to-r from-yellow-400/40 to-orange-400/40 p-3 rounded-xl border-2 border-yellow-300/50 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">💡</div>
                    <div>
                      <h5 className="text-base font-bold text-yellow-100 mb-1">重要なコツ</h5>
                      <p className="text-base font-medium text-yellow-50 leading-relaxed">{currentStepData.tips}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 自動進行表示 */}
          <div className="flex items-center justify-center mt-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-base font-bold text-blue-700">自動進行中...</span>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* 完了メッセージ */}
          {isCompleted && (
            <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg text-center flex-shrink-0">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">機械学習の流れ完了！</h3>
              <p className="text-base text-green-700">
                これで機械学習の基本的な流れを理解できました！<br />
                自動で閉じます...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
