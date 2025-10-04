import { useState, useEffect } from 'react';
import { ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

interface MLFlowAnimationProps {
  onClose: () => void;
}

const steps = [
  {
    id: 'problem',
    title: '1. 問題を把握する',
    description: '何を予測したいのか、どんなデータがあるのかを整理する',
    example: '例：戦で勝つか負けるかを予測したい',
    details: [
      'どんな問題を解決したいのかを明確にする',
      '予測したい結果（目的変数）を決める',
      '使えるデータ（特徴量）をリストアップする',
      '問題の種類（分類か回帰か）を判断する'
    ],
    tips: '問題がはっきりしていないと、良いAIは作れません。まず「何を知りたいのか」を整理しましょう。',
    icon: '🎯',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'eda',
    title: '2. データを探索する（EDA）',
    description: 'データの分布や関係性をグラフで確認する',
    example: '例：兵力と勝率の関係を散布図で確認',
    details: [
      'データの基本統計（平均、最大、最小など）を確認する',
      'ヒストグラムでデータの分布を見る',
      '散布図で特徴量同士の関係を調べる',
      '欠損値や異常値がないかチェックする'
    ],
    tips: 'データをよく見ることで、どんな特徴があるか、どんな問題があるかが分かります。',
    icon: '📊',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'preprocess',
    title: '3. データを前処理する',
    description: 'データを機械学習に適した形に変換する',
    example: '例：文字データを数値に変換、データを正規化',
    details: [
      '文字データ（「勝ち」「負け」など）を数値（1、0）に変換する',
      'データのスケールを揃える（正規化・標準化）',
      '欠損値を埋める（平均値で埋めるなど）',
      '不要なデータを削除する'
    ],
    tips: 'AIは数値しか理解できないので、データを数値に変換する必要があります。',
    icon: '🔧',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'model',
    title: '4. モデルを選択・訓練する',
    description: '適切なAIモデルを選んで学習させる',
    example: '例：ロジスティック回帰で境界線を学習',
    details: [
      '問題の種類に合ったAIモデルを選ぶ',
      'モデルのパラメータを調整する',
      '学習データを使ってモデルを訓練する',
      '学習の進み具合を確認する'
    ],
    tips: '問題の種類によって使うモデルが違います。分類ならロジスティック回帰、回帰なら線形回帰など。',
    icon: '🤖',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'evaluate',
    title: '5. モデルを評価する',
    description: 'AIの性能を数値で確認する',
    example: '例：正解率85%、精度90%で良好な性能',
    details: [
      'テストデータでAIの性能を測る',
      '正解率、精度、再現率などの指標を計算する',
      '混同行列で間違いのパターンを確認する',
      '性能が十分かどうか判断する'
    ],
    tips: 'テストデータは学習に使わない新しいデータで評価することが重要です。',
    icon: '📈',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'deploy',
    title: '6. 実用化・改善',
    description: '学習したAIを実際の問題に適用する',
    example: '例：新しい戦略の成功確率を予測して活用',
    details: [
      '実際のデータでAIを使って予測する',
      '予測結果を基に意思決定を行う',
      '新しいデータでAIの性能を継続的に確認する',
      '必要に応じてモデルを再学習する'
    ],
    tips: 'AIは一度作って終わりではありません。新しいデータで継続的に改善していくことが大切です。',
    icon: '🚀',
    color: 'from-blue-600 to-blue-800'
  }
];

export function MLFlowAnimation({ onClose }: MLFlowAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // デフォルトで自動再生開始
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 5000);
    } else if (currentStep === steps.length - 1) {
      setIsCompleted(true);
      setIsPlaying(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (isCompleted) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsCompleted(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border-2 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--gold)' }}>
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">機械学習の流れ</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* プログレスバー */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-medium text-gray-700">進捗</span>
              <span className="text-base font-medium text-gray-700">{currentStep + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  background: 'linear-gradient(to right, var(--accent), var(--accent-strong))',
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* 現在のステップ */}
          <div className="mb-8">
            <div className={`bg-gradient-to-r ${currentStepData.color} text-white p-6 rounded-xl mb-6`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{currentStepData.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">{currentStepData.title}</h3>
                  <p className="text-lg opacity-90">{currentStepData.description}</p>
                </div>
              </div>
              <div className="bg-white/20 p-4 rounded-lg mb-4">
                <p className="text-base font-medium">{currentStepData.example}</p>
              </div>
              
              {/* 詳細な手順 */}
              <div className="bg-white/10 p-4 rounded-lg mb-4">
                <h4 className="text-base font-bold mb-3 opacity-90">具体的な手順：</h4>
                <ul className="text-sm space-y-1">
                  {currentStepData.details.map((detail, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-white/80 text-sm">•</span>
                      <span className="opacity-90">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* ヒント */}
              <div className="bg-yellow-400/20 p-3 rounded-lg border border-yellow-300/30">
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-200 text-lg">💡</span>
                  <p className="text-sm font-medium text-yellow-100">{currentStepData.tips}</p>
                </div>
              </div>
            </div>

            {/* ステップ一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    index === currentStep
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : index < currentStep
                      ? 'border-green-500 bg-green-50 hover:border-green-600'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${index <= currentStep ? 'opacity-100' : 'opacity-50'}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-base font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs mt-1 ${index <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                      {index === currentStep && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          クリックで詳細表示
                        </div>
                      )}
                    </div>
                    {index < currentStep && (
                      <div className="text-green-500 text-xl">✓</div>
                    )}
                    {index === currentStep && (
                      <div className="text-blue-500 text-xl">→</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* コントロール */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-base font-medium"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? '一時停止' : isCompleted ? '最初から' : '再生'}</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-base font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>リセット</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                前へ
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
              >
                次へ
              </button>
            </div>
          </div>

          {/* 完了メッセージ */}
          {isCompleted && (
            <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-3">機械学習の流れ完了！</h3>
              <p className="text-base text-green-700 mb-4">
                これで機械学習の基本的な流れを理解できました。<br />
                実際のゲームでこの流れを体験してみましょう！
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-300">
                <h4 className="text-base font-bold text-green-800 mb-3">学習のポイント</h4>
                <ul className="text-sm text-green-700 text-left space-y-1">
                  <li>• 問題を明確にすることが最も重要</li>
                  <li>• データをよく観察して特徴を理解する</li>
                  <li>• 適切な前処理でデータの質を向上させる</li>
                  <li>• 問題に合ったモデルを選択する</li>
                  <li>• 客観的な評価で性能を確認する</li>
                  <li>• 継続的な改善でAIを向上させる</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
