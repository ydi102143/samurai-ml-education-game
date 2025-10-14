import { useState, useEffect } from 'react';
import { Sword, Users, Trophy, Target, ChevronRight, Play, Settings, Upload } from 'lucide-react';
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { userManager } from '../utils/userManager';
import { createStableModel } from '../utils/stableMLModels';
// import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleBattleManager } from '../utils/simpleBattleManager';

interface SimpleOnlineBattleNewProps {
  onBack: () => void;
}

type Step = 'data' | 'features' | 'model' | 'train' | 'submit' | 'leaderboard';

export function SimpleOnlineBattleNew({ onBack }: SimpleOnlineBattleNewProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // データ関連
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  
  // 学習関連
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // リーダーボード関連
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // チーム関連
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [battleMode, setBattleMode] = useState<'solo' | 'team'>('solo');

  // 利用可能なモデル
  const availableModels = [
    { id: 'logistic_regression', name: 'ロジスティック回帰', icon: '📊' },
    { id: 'linear_regression', name: '線形回帰', icon: '📈' },
    { id: 'neural_network', name: 'ニューラルネットワーク', icon: '🧠' }
  ];

  // 初期化
  useEffect(() => {
    loadProblem();
  }, []);

  // 問題が読み込まれた後にリーダーボードを読み込み
  useEffect(() => {
    if (currentProblem) {
      loadLeaderboard();
    }
  }, [currentProblem]);

  const loadLeaderboard = async () => {
    try {
      // ローカルストレージから提出データを読み込み
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      console.log('全提出データ:', submissions);
      
      // スコア順でソート
      const sortedSubmissions = submissions
        .filter(sub => sub.problemId === currentProblem?.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      console.log('フィルタ後の提出データ:', sortedSubmissions);
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード読み込み完了:', sortedSubmissions);
    } catch (err) {
      console.error('リーダーボード読み込みエラー:', err);
    }
  };

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // 問題登録は不要（シンプルなアプローチ）
      console.log('問題読み込み完了:', problem.name);
      
      // 特徴量を自動選択（最初の3つ）
      const autoFeatures = problem.featureNames.slice(0, Math.min(3, problem.featureNames.length)).map((_, i) => i);
      setSelectedFeatures(autoFeatures);
      
      console.log('問題読み込み完了:', problem.name);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (index: number) => {
    if (selectedFeatures.includes(index)) {
      setSelectedFeatures(selectedFeatures.filter(i => i !== index));
    } else {
      setSelectedFeatures([...selectedFeatures, index]);
    }
  };

  const handleTrain = async () => {
    if (!currentProblem || selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setResult(null);

      // データを準備
      const trainData = currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7));
      const testData = currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7));

      // 特徴量を選択
      const filteredTrainData = trainData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      const filteredTestData = testData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      console.log('学習開始:', {
        trainSize: filteredTrainData.length,
        testSize: filteredTestData.length,
        selectedFeatures: selectedFeatures,
        model: selectedModel
      });

      // モデルを作成
      const model = createStableModel(selectedModel);
      
      // パラメータ設定
      const modelParams = {
        learningRate: 0.01,
        epochs: 100,
        ...parameters
      };

      // 学習実行
      console.log('モデル学習開始...');
      await model.train(filteredTrainData, modelParams, (progress) => {
        console.log('学習進捗:', progress);
        setTrainingProgress(progress);
      });
      console.log('モデル学習完了');

      // 評価実行
      console.log('モデル評価開始...');
      const evaluation = model.evaluate(filteredTestData);
      console.log('評価結果:', evaluation);
      
      setResult({
        accuracy: evaluation.accuracy,
        trainingTime: evaluation.training_time,
        predictions: evaluation.predictions,
        actual: evaluation.actual
      });

      console.log('学習完了:', evaluation);
      setCurrentStep('submit');
      
    } catch (err) {
      console.error('学習エラー:', err);
      setError(`学習に失敗しました: ${(err as Error).message}`);
      setCurrentStep('features'); // 特徴量選択に戻る
    } finally {
      setIsTraining(false);
    }
  };

  const handleSubmit = async () => {
    if (!result || !currentProblem) {
      setError('学習結果がありません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = userManager.getCurrentUser();
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      // 提出データを作成（シンプル版）
      const submission = {
        id: `submission_${Date.now()}`,
        problemId: currentProblem.id,
        userId: user.id,
        username: user.username,
        modelType: selectedModel,
        selectedFeatures: selectedFeatures,
        parameters: parameters,
        score: result.accuracy,
        trainingTime: result.trainingTime,
        submittedAt: new Date(),
        teamId: undefined,
        teamMembers: undefined
      };

      // ローカルストレージに保存
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('competition_submissions', JSON.stringify(submissions));

      console.log('提出完了:', submission);
      setIsSubmitted(true);
      
      // リーダーボードを即座に更新
      const updatedSubmissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      const sortedSubmissions = updatedSubmissions
        .filter(sub => sub.problemId === currentProblem.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード更新完了:', sortedSubmissions);
      
      // リーダーボードを自動表示
      setShowLeaderboard(true);
      
      // バトル完了を通知
      setTimeout(() => {
        onBack();
      }, 5000); // 5秒に延長してリーダーボードを確認できるように
      
    } catch (err) {
      console.error('提出エラー:', err);
      setError(`提出に失敗しました: ${(err as Error).message}`);
      setCurrentStep('train'); // 学習ステップに戻る
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 text-white p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center text-red-900">
          <p className="text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="mb-6">{error}</p>
          <button onClick={onBack} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <p className="text-xl font-bold">問題を読み込めませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sword className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  オンライン対戦
                </h1>
                <p className="text-white/80 text-lg">シンプルな機械学習チャレンジ</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>リーダーボード</span>
                  </button>
                  <div>
                    <div className="text-white/80 font-bold text-lg">ステップ</div>
                    <div className="text-white text-3xl font-mono">
                      {['データ', '特徴量', 'モデル', '学習', '提出', '結果'][['data', 'features', 'model', 'train', 'submit', 'leaderboard'].indexOf(currentStep)]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* リーダーボード表示 */}
        {showLeaderboard && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  リーダーボード
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* デバッグ情報 */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm">
                  デバッグ: リーダーボードエントリ数: {leaderboard.length}
                </p>
                <p className="text-white/70 text-sm">
                  現在の問題ID: {currentProblem?.id}
                </p>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">まだ提出がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                          : index < 3
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index < 3
                            ? 'bg-gray-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{entry.username || 'プレイヤー'}</div>
                          <div className="text-white/60 text-sm">
                            {entry.modelType || 'Unknown'} • {entry.trainingTime ? `${entry.trainingTime.toFixed(2)}s` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.score ? `${Math.round(entry.score * 100)}%` : 'N/A'}
                        </div>
                        <div className="text-white/60 text-sm">スコア</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* バトルモード選択 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🎮 バトルモード選択</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setBattleMode('solo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'solo'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold">ソロバトル</div>
                    <div className="text-sm opacity-70">一人で挑戦</div>
                  </div>
                </button>
                <button
                  onClick={() => setBattleMode('team')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'team'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-bold">チームバトル</div>
                    <div className="text-sm opacity-70">チームで協力</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 問題情報 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentProblem.name}</h2>
                  <p className="text-white/70 text-lg">{currentProblem.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.featureNames.length}</div>
                  <div className="text-sm text-white/80">特徴量数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.data.length}</div>
                  <div className="text-sm text-white/80">サンプル数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.problemType}</div>
                  <div className="text-sm text-white/80">問題タイプ</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                  <div className="text-sm text-white/80">選択済み特徴量</div>
                </div>
              </div>
            </div>

            {/* ステップ1: データ探索 */}
            {currentStep === 'data' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📊 データ探索</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">特徴量一覧</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-white font-medium">{feature}</div>
                        <div className="text-xs text-white/60">特徴量 {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 特徴量選択 */}
            {currentStep === 'features' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🎯 特徴量選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用する特徴量を選択</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => handleFeatureToggle(index)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedFeatures.includes(index)
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{feature}</div>
                          <div className="text-xs opacity-70">特徴量 {index + 1}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70">
                      選択済み: {selectedFeatures.length} / {currentProblem.featureNames.length} 特徴量
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={selectedFeatures.length === 0}
                    className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                      selectedFeatures.length === 0
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                    }`}
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: モデル選択 */}
            {currentStep === 'model' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🤖 モデル選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用するモデルを選択</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{model.icon}</div>
                          <div className="text-lg font-bold mb-1">{model.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ4: 学習 */}
            {currentStep === 'train' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🚀 モデル学習</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <div className="text-center mb-6">
                    <button
                      onClick={handleTrain}
                      disabled={isTraining}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isTraining
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isTraining ? '🔄 学習中...' : '🚀 学習開始'}
                    </button>
                  </div>
                  
                  {isTraining && trainingProgress && (
                    <div className="bg-white/10 rounded-lg p-6 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-lg">{trainingProgress.message}</span>
                        <span className="text-yellow-400 font-bold text-xl">{trainingProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${trainingProgress.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.epoch || 0}</div>
                          <div className="text-white/70 text-sm">エポック</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.loss ? trainingProgress.loss.toFixed(4) : 'N/A'}</div>
                          <div className="text-white/70 text-sm">損失</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.accuracy ? `${Math.round(trainingProgress.accuracy * 100)}%` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">精度</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.elapsed ? `${trainingProgress.elapsed.toFixed(1)}s` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">経過時間</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl">
                      <h4 className="text-2xl font-bold text-white mb-4">🎉 学習結果</h4>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">精度</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{result.trainingTime.toFixed(2)}s</div>
                          <div className="text-sm text-white/80">学習時間</div>
                        </div>
                      </div>
                      
                      {/* 実績表示 */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                          🏆 実績
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.accuracy > 0.9 && (
                            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-400/30">
                              🥇 高精度マスター
                            </span>
                          )}
                          {result.accuracy > 0.8 && result.accuracy <= 0.9 && (
                            <span className="px-3 py-1 bg-gray-400/20 text-gray-300 rounded-full text-sm font-bold border border-gray-400/30">
                              🥈 精度エキスパート
                            </span>
                          )}
                          {result.accuracy > 0.7 && result.accuracy <= 0.8 && (
                            <span className="px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-bold border border-orange-400/30">
                              🥉 学習の達人
                            </span>
                          )}
                          {result.trainingTime < 5 && (
                            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm font-bold border border-blue-400/30">
                              ⚡ 高速学習
                            </span>
                          )}
                          {selectedFeatures.length >= 5 && (
                            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full text-sm font-bold border border-purple-400/30">
                              🎯 特徴量マスター
                            </span>
                          )}
                          {selectedModel === 'neural_network' && (
                            <span className="px-3 py-1 bg-pink-400/20 text-pink-300 rounded-full text-sm font-bold border border-pink-400/30">
                              🧠 ニューラルネットワーク使い
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  {result && (
                    <button
                      onClick={nextStep}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ステップ5: 提出 */}
            {currentStep === 'submit' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📤 結果提出</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">📋 提出内容</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">スコア</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedModel}</div>
                          <div className="text-sm text-white/80">モデル</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                          <div className="text-sm text-white/80">特徴量数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{userManager.getCurrentUser()?.username || 'プレイヤー'}</div>
                          <div className="text-sm text-white/80">ユーザー</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmitted}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isSubmitting || isSubmitted
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isSubmitting ? '🔄 提出中...' : isSubmitted ? '✅ 提出完了' : '🚀 リーダーボードに提出'}
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mt-6">
                      <p className="text-green-200 text-center text-lg font-bold">✅ 提出が完了しました！</p>
                      <p className="text-white/70 text-center text-sm mt-2">2秒後にホーム画面に戻ります...</p>
                      
                      {/* 詳細分析 */}
                      {result && (
                        <div className="mt-6 bg-white/5 rounded-xl p-4">
                          <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                            📊 詳細分析
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">使用モデル:</span>
                                <span className="text-white font-bold">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">選択特徴量数:</span>
                                <span className="text-white font-bold">{selectedFeatures.length} / {currentProblem.featureNames.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">学習時間:</span>
                                <span className="text-white font-bold">{result.trainingTime.toFixed(2)}秒</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">最終精度:</span>
                                <span className="text-white font-bold">{Math.round(result.accuracy * 100)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">予測数:</span>
                                <span className="text-white font-bold">{result.predictions?.length || 0}件</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">バトルモード:</span>
                                <span className="text-white font-bold">{battleMode === 'solo' ? 'ソロ' : 'チーム'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    完了
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { userManager } from '../utils/userManager';
import { createStableModel } from '../utils/stableMLModels';
// import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleBattleManager } from '../utils/simpleBattleManager';

interface SimpleOnlineBattleNewProps {
  onBack: () => void;
}

type Step = 'data' | 'features' | 'model' | 'train' | 'submit' | 'leaderboard';

export function SimpleOnlineBattleNew({ onBack }: SimpleOnlineBattleNewProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // データ関連
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  
  // 学習関連
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // リーダーボード関連
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // チーム関連
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [battleMode, setBattleMode] = useState<'solo' | 'team'>('solo');

  // 利用可能なモデル
  const availableModels = [
    { id: 'logistic_regression', name: 'ロジスティック回帰', icon: '📊' },
    { id: 'linear_regression', name: '線形回帰', icon: '📈' },
    { id: 'neural_network', name: 'ニューラルネットワーク', icon: '🧠' }
  ];

  // 初期化
  useEffect(() => {
    loadProblem();
  }, []);

  // 問題が読み込まれた後にリーダーボードを読み込み
  useEffect(() => {
    if (currentProblem) {
      loadLeaderboard();
    }
  }, [currentProblem]);

  const loadLeaderboard = async () => {
    try {
      // ローカルストレージから提出データを読み込み
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      console.log('全提出データ:', submissions);
      
      // スコア順でソート
      const sortedSubmissions = submissions
        .filter(sub => sub.problemId === currentProblem?.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      console.log('フィルタ後の提出データ:', sortedSubmissions);
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード読み込み完了:', sortedSubmissions);
    } catch (err) {
      console.error('リーダーボード読み込みエラー:', err);
    }
  };

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // 問題登録は不要（シンプルなアプローチ）
      console.log('問題読み込み完了:', problem.name);
      
      // 特徴量を自動選択（最初の3つ）
      const autoFeatures = problem.featureNames.slice(0, Math.min(3, problem.featureNames.length)).map((_, i) => i);
      setSelectedFeatures(autoFeatures);
      
      console.log('問題読み込み完了:', problem.name);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (index: number) => {
    if (selectedFeatures.includes(index)) {
      setSelectedFeatures(selectedFeatures.filter(i => i !== index));
    } else {
      setSelectedFeatures([...selectedFeatures, index]);
    }
  };

  const handleTrain = async () => {
    if (!currentProblem || selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setResult(null);

      // データを準備
      const trainData = currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7));
      const testData = currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7));

      // 特徴量を選択
      const filteredTrainData = trainData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      const filteredTestData = testData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      console.log('学習開始:', {
        trainSize: filteredTrainData.length,
        testSize: filteredTestData.length,
        selectedFeatures: selectedFeatures,
        model: selectedModel
      });

      // モデルを作成
      const model = createStableModel(selectedModel);
      
      // パラメータ設定
      const modelParams = {
        learningRate: 0.01,
        epochs: 100,
        ...parameters
      };

      // 学習実行
      console.log('モデル学習開始...');
      await model.train(filteredTrainData, modelParams, (progress) => {
        console.log('学習進捗:', progress);
        setTrainingProgress(progress);
      });
      console.log('モデル学習完了');

      // 評価実行
      console.log('モデル評価開始...');
      const evaluation = model.evaluate(filteredTestData);
      console.log('評価結果:', evaluation);
      
      setResult({
        accuracy: evaluation.accuracy,
        trainingTime: evaluation.training_time,
        predictions: evaluation.predictions,
        actual: evaluation.actual
      });

      console.log('学習完了:', evaluation);
      setCurrentStep('submit');
      
    } catch (err) {
      console.error('学習エラー:', err);
      setError(`学習に失敗しました: ${(err as Error).message}`);
      setCurrentStep('features'); // 特徴量選択に戻る
    } finally {
      setIsTraining(false);
    }
  };

  const handleSubmit = async () => {
    if (!result || !currentProblem) {
      setError('学習結果がありません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = userManager.getCurrentUser();
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      // 提出データを作成（シンプル版）
      const submission = {
        id: `submission_${Date.now()}`,
        problemId: currentProblem.id,
        userId: user.id,
        username: user.username,
        modelType: selectedModel,
        selectedFeatures: selectedFeatures,
        parameters: parameters,
        score: result.accuracy,
        trainingTime: result.trainingTime,
        submittedAt: new Date(),
        teamId: undefined,
        teamMembers: undefined
      };

      // ローカルストレージに保存
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('competition_submissions', JSON.stringify(submissions));

      console.log('提出完了:', submission);
      setIsSubmitted(true);
      
      // リーダーボードを即座に更新
      const updatedSubmissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      const sortedSubmissions = updatedSubmissions
        .filter(sub => sub.problemId === currentProblem.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード更新完了:', sortedSubmissions);
      
      // リーダーボードを自動表示
      setShowLeaderboard(true);
      
      // バトル完了を通知
      setTimeout(() => {
        onBack();
      }, 5000); // 5秒に延長してリーダーボードを確認できるように
      
    } catch (err) {
      console.error('提出エラー:', err);
      setError(`提出に失敗しました: ${(err as Error).message}`);
      setCurrentStep('train'); // 学習ステップに戻る
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 text-white p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center text-red-900">
          <p className="text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="mb-6">{error}</p>
          <button onClick={onBack} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <p className="text-xl font-bold">問題を読み込めませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sword className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  オンライン対戦
                </h1>
                <p className="text-white/80 text-lg">シンプルな機械学習チャレンジ</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>リーダーボード</span>
                  </button>
                  <div>
                    <div className="text-white/80 font-bold text-lg">ステップ</div>
                    <div className="text-white text-3xl font-mono">
                      {['データ', '特徴量', 'モデル', '学習', '提出', '結果'][['data', 'features', 'model', 'train', 'submit', 'leaderboard'].indexOf(currentStep)]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* リーダーボード表示 */}
        {showLeaderboard && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  リーダーボード
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* デバッグ情報 */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm">
                  デバッグ: リーダーボードエントリ数: {leaderboard.length}
                </p>
                <p className="text-white/70 text-sm">
                  現在の問題ID: {currentProblem?.id}
                </p>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">まだ提出がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                          : index < 3
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index < 3
                            ? 'bg-gray-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{entry.username || 'プレイヤー'}</div>
                          <div className="text-white/60 text-sm">
                            {entry.modelType || 'Unknown'} • {entry.trainingTime ? `${entry.trainingTime.toFixed(2)}s` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.score ? `${Math.round(entry.score * 100)}%` : 'N/A'}
                        </div>
                        <div className="text-white/60 text-sm">スコア</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* バトルモード選択 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🎮 バトルモード選択</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setBattleMode('solo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'solo'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold">ソロバトル</div>
                    <div className="text-sm opacity-70">一人で挑戦</div>
                  </div>
                </button>
                <button
                  onClick={() => setBattleMode('team')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'team'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-bold">チームバトル</div>
                    <div className="text-sm opacity-70">チームで協力</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 問題情報 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentProblem.name}</h2>
                  <p className="text-white/70 text-lg">{currentProblem.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.featureNames.length}</div>
                  <div className="text-sm text-white/80">特徴量数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.data.length}</div>
                  <div className="text-sm text-white/80">サンプル数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.problemType}</div>
                  <div className="text-sm text-white/80">問題タイプ</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                  <div className="text-sm text-white/80">選択済み特徴量</div>
                </div>
              </div>
            </div>

            {/* ステップ1: データ探索 */}
            {currentStep === 'data' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📊 データ探索</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">特徴量一覧</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-white font-medium">{feature}</div>
                        <div className="text-xs text-white/60">特徴量 {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 特徴量選択 */}
            {currentStep === 'features' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🎯 特徴量選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用する特徴量を選択</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => handleFeatureToggle(index)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedFeatures.includes(index)
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{feature}</div>
                          <div className="text-xs opacity-70">特徴量 {index + 1}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70">
                      選択済み: {selectedFeatures.length} / {currentProblem.featureNames.length} 特徴量
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={selectedFeatures.length === 0}
                    className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                      selectedFeatures.length === 0
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                    }`}
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: モデル選択 */}
            {currentStep === 'model' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🤖 モデル選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用するモデルを選択</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{model.icon}</div>
                          <div className="text-lg font-bold mb-1">{model.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ4: 学習 */}
            {currentStep === 'train' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🚀 モデル学習</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <div className="text-center mb-6">
                    <button
                      onClick={handleTrain}
                      disabled={isTraining}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isTraining
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isTraining ? '🔄 学習中...' : '🚀 学習開始'}
                    </button>
                  </div>
                  
                  {isTraining && trainingProgress && (
                    <div className="bg-white/10 rounded-lg p-6 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-lg">{trainingProgress.message}</span>
                        <span className="text-yellow-400 font-bold text-xl">{trainingProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${trainingProgress.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.epoch || 0}</div>
                          <div className="text-white/70 text-sm">エポック</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.loss ? trainingProgress.loss.toFixed(4) : 'N/A'}</div>
                          <div className="text-white/70 text-sm">損失</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.accuracy ? `${Math.round(trainingProgress.accuracy * 100)}%` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">精度</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.elapsed ? `${trainingProgress.elapsed.toFixed(1)}s` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">経過時間</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl">
                      <h4 className="text-2xl font-bold text-white mb-4">🎉 学習結果</h4>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">精度</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{result.trainingTime.toFixed(2)}s</div>
                          <div className="text-sm text-white/80">学習時間</div>
                        </div>
                      </div>
                      
                      {/* 実績表示 */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                          🏆 実績
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.accuracy > 0.9 && (
                            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-400/30">
                              🥇 高精度マスター
                            </span>
                          )}
                          {result.accuracy > 0.8 && result.accuracy <= 0.9 && (
                            <span className="px-3 py-1 bg-gray-400/20 text-gray-300 rounded-full text-sm font-bold border border-gray-400/30">
                              🥈 精度エキスパート
                            </span>
                          )}
                          {result.accuracy > 0.7 && result.accuracy <= 0.8 && (
                            <span className="px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-bold border border-orange-400/30">
                              🥉 学習の達人
                            </span>
                          )}
                          {result.trainingTime < 5 && (
                            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm font-bold border border-blue-400/30">
                              ⚡ 高速学習
                            </span>
                          )}
                          {selectedFeatures.length >= 5 && (
                            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full text-sm font-bold border border-purple-400/30">
                              🎯 特徴量マスター
                            </span>
                          )}
                          {selectedModel === 'neural_network' && (
                            <span className="px-3 py-1 bg-pink-400/20 text-pink-300 rounded-full text-sm font-bold border border-pink-400/30">
                              🧠 ニューラルネットワーク使い
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  {result && (
                    <button
                      onClick={nextStep}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ステップ5: 提出 */}
            {currentStep === 'submit' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📤 結果提出</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">📋 提出内容</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">スコア</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedModel}</div>
                          <div className="text-sm text-white/80">モデル</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                          <div className="text-sm text-white/80">特徴量数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{userManager.getCurrentUser()?.username || 'プレイヤー'}</div>
                          <div className="text-sm text-white/80">ユーザー</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmitted}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isSubmitting || isSubmitted
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isSubmitting ? '🔄 提出中...' : isSubmitted ? '✅ 提出完了' : '🚀 リーダーボードに提出'}
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mt-6">
                      <p className="text-green-200 text-center text-lg font-bold">✅ 提出が完了しました！</p>
                      <p className="text-white/70 text-center text-sm mt-2">2秒後にホーム画面に戻ります...</p>
                      
                      {/* 詳細分析 */}
                      {result && (
                        <div className="mt-6 bg-white/5 rounded-xl p-4">
                          <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                            📊 詳細分析
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">使用モデル:</span>
                                <span className="text-white font-bold">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">選択特徴量数:</span>
                                <span className="text-white font-bold">{selectedFeatures.length} / {currentProblem.featureNames.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">学習時間:</span>
                                <span className="text-white font-bold">{result.trainingTime.toFixed(2)}秒</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">最終精度:</span>
                                <span className="text-white font-bold">{Math.round(result.accuracy * 100)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">予測数:</span>
                                <span className="text-white font-bold">{result.predictions?.length || 0}件</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">バトルモード:</span>
                                <span className="text-white font-bold">{battleMode === 'solo' ? 'ソロ' : 'チーム'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    完了
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { userManager } from '../utils/userManager';
import { createStableModel } from '../utils/stableMLModels';
// import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleBattleManager } from '../utils/simpleBattleManager';

interface SimpleOnlineBattleNewProps {
  onBack: () => void;
}

type Step = 'data' | 'features' | 'model' | 'train' | 'submit' | 'leaderboard';

export function SimpleOnlineBattleNew({ onBack }: SimpleOnlineBattleNewProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // データ関連
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  
  // 学習関連
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // リーダーボード関連
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // チーム関連
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [battleMode, setBattleMode] = useState<'solo' | 'team'>('solo');

  // 利用可能なモデル
  const availableModels = [
    { id: 'logistic_regression', name: 'ロジスティック回帰', icon: '📊' },
    { id: 'linear_regression', name: '線形回帰', icon: '📈' },
    { id: 'neural_network', name: 'ニューラルネットワーク', icon: '🧠' }
  ];

  // 初期化
  useEffect(() => {
    loadProblem();
  }, []);

  // 問題が読み込まれた後にリーダーボードを読み込み
  useEffect(() => {
    if (currentProblem) {
      loadLeaderboard();
    }
  }, [currentProblem]);

  const loadLeaderboard = async () => {
    try {
      // ローカルストレージから提出データを読み込み
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      console.log('全提出データ:', submissions);
      
      // スコア順でソート
      const sortedSubmissions = submissions
        .filter(sub => sub.problemId === currentProblem?.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      console.log('フィルタ後の提出データ:', sortedSubmissions);
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード読み込み完了:', sortedSubmissions);
    } catch (err) {
      console.error('リーダーボード読み込みエラー:', err);
    }
  };

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // 問題登録は不要（シンプルなアプローチ）
      console.log('問題読み込み完了:', problem.name);
      
      // 特徴量を自動選択（最初の3つ）
      const autoFeatures = problem.featureNames.slice(0, Math.min(3, problem.featureNames.length)).map((_, i) => i);
      setSelectedFeatures(autoFeatures);
      
      console.log('問題読み込み完了:', problem.name);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (index: number) => {
    if (selectedFeatures.includes(index)) {
      setSelectedFeatures(selectedFeatures.filter(i => i !== index));
    } else {
      setSelectedFeatures([...selectedFeatures, index]);
    }
  };

  const handleTrain = async () => {
    if (!currentProblem || selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setResult(null);

      // データを準備
      const trainData = currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7));
      const testData = currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7));

      // 特徴量を選択
      const filteredTrainData = trainData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      const filteredTestData = testData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      console.log('学習開始:', {
        trainSize: filteredTrainData.length,
        testSize: filteredTestData.length,
        selectedFeatures: selectedFeatures,
        model: selectedModel
      });

      // モデルを作成
      const model = createStableModel(selectedModel);
      
      // パラメータ設定
      const modelParams = {
        learningRate: 0.01,
        epochs: 100,
        ...parameters
      };

      // 学習実行
      console.log('モデル学習開始...');
      await model.train(filteredTrainData, modelParams, (progress) => {
        console.log('学習進捗:', progress);
        setTrainingProgress(progress);
      });
      console.log('モデル学習完了');

      // 評価実行
      console.log('モデル評価開始...');
      const evaluation = model.evaluate(filteredTestData);
      console.log('評価結果:', evaluation);
      
      setResult({
        accuracy: evaluation.accuracy,
        trainingTime: evaluation.training_time,
        predictions: evaluation.predictions,
        actual: evaluation.actual
      });

      console.log('学習完了:', evaluation);
      setCurrentStep('submit');
      
    } catch (err) {
      console.error('学習エラー:', err);
      setError(`学習に失敗しました: ${(err as Error).message}`);
      setCurrentStep('features'); // 特徴量選択に戻る
    } finally {
      setIsTraining(false);
    }
  };

  const handleSubmit = async () => {
    if (!result || !currentProblem) {
      setError('学習結果がありません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = userManager.getCurrentUser();
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      // 提出データを作成（シンプル版）
      const submission = {
        id: `submission_${Date.now()}`,
        problemId: currentProblem.id,
        userId: user.id,
        username: user.username,
        modelType: selectedModel,
        selectedFeatures: selectedFeatures,
        parameters: parameters,
        score: result.accuracy,
        trainingTime: result.trainingTime,
        submittedAt: new Date(),
        teamId: undefined,
        teamMembers: undefined
      };

      // ローカルストレージに保存
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('competition_submissions', JSON.stringify(submissions));

      console.log('提出完了:', submission);
      setIsSubmitted(true);
      
      // リーダーボードを即座に更新
      const updatedSubmissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      const sortedSubmissions = updatedSubmissions
        .filter(sub => sub.problemId === currentProblem.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード更新完了:', sortedSubmissions);
      
      // リーダーボードを自動表示
      setShowLeaderboard(true);
      
      // バトル完了を通知
      setTimeout(() => {
        onBack();
      }, 5000); // 5秒に延長してリーダーボードを確認できるように
      
    } catch (err) {
      console.error('提出エラー:', err);
      setError(`提出に失敗しました: ${(err as Error).message}`);
      setCurrentStep('train'); // 学習ステップに戻る
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 text-white p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center text-red-900">
          <p className="text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="mb-6">{error}</p>
          <button onClick={onBack} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <p className="text-xl font-bold">問題を読み込めませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sword className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  オンライン対戦
                </h1>
                <p className="text-white/80 text-lg">シンプルな機械学習チャレンジ</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>リーダーボード</span>
                  </button>
                  <div>
                    <div className="text-white/80 font-bold text-lg">ステップ</div>
                    <div className="text-white text-3xl font-mono">
                      {['データ', '特徴量', 'モデル', '学習', '提出', '結果'][['data', 'features', 'model', 'train', 'submit', 'leaderboard'].indexOf(currentStep)]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* リーダーボード表示 */}
        {showLeaderboard && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  リーダーボード
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* デバッグ情報 */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm">
                  デバッグ: リーダーボードエントリ数: {leaderboard.length}
                </p>
                <p className="text-white/70 text-sm">
                  現在の問題ID: {currentProblem?.id}
                </p>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">まだ提出がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                          : index < 3
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index < 3
                            ? 'bg-gray-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{entry.username || 'プレイヤー'}</div>
                          <div className="text-white/60 text-sm">
                            {entry.modelType || 'Unknown'} • {entry.trainingTime ? `${entry.trainingTime.toFixed(2)}s` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.score ? `${Math.round(entry.score * 100)}%` : 'N/A'}
                        </div>
                        <div className="text-white/60 text-sm">スコア</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* バトルモード選択 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🎮 バトルモード選択</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setBattleMode('solo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'solo'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold">ソロバトル</div>
                    <div className="text-sm opacity-70">一人で挑戦</div>
                  </div>
                </button>
                <button
                  onClick={() => setBattleMode('team')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'team'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-bold">チームバトル</div>
                    <div className="text-sm opacity-70">チームで協力</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 問題情報 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentProblem.name}</h2>
                  <p className="text-white/70 text-lg">{currentProblem.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.featureNames.length}</div>
                  <div className="text-sm text-white/80">特徴量数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.data.length}</div>
                  <div className="text-sm text-white/80">サンプル数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.problemType}</div>
                  <div className="text-sm text-white/80">問題タイプ</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                  <div className="text-sm text-white/80">選択済み特徴量</div>
                </div>
              </div>
            </div>

            {/* ステップ1: データ探索 */}
            {currentStep === 'data' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📊 データ探索</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">特徴量一覧</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-white font-medium">{feature}</div>
                        <div className="text-xs text-white/60">特徴量 {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 特徴量選択 */}
            {currentStep === 'features' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🎯 特徴量選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用する特徴量を選択</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => handleFeatureToggle(index)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedFeatures.includes(index)
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{feature}</div>
                          <div className="text-xs opacity-70">特徴量 {index + 1}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70">
                      選択済み: {selectedFeatures.length} / {currentProblem.featureNames.length} 特徴量
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={selectedFeatures.length === 0}
                    className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                      selectedFeatures.length === 0
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                    }`}
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: モデル選択 */}
            {currentStep === 'model' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🤖 モデル選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用するモデルを選択</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{model.icon}</div>
                          <div className="text-lg font-bold mb-1">{model.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ4: 学習 */}
            {currentStep === 'train' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🚀 モデル学習</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <div className="text-center mb-6">
                    <button
                      onClick={handleTrain}
                      disabled={isTraining}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isTraining
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isTraining ? '🔄 学習中...' : '🚀 学習開始'}
                    </button>
                  </div>
                  
                  {isTraining && trainingProgress && (
                    <div className="bg-white/10 rounded-lg p-6 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-lg">{trainingProgress.message}</span>
                        <span className="text-yellow-400 font-bold text-xl">{trainingProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${trainingProgress.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.epoch || 0}</div>
                          <div className="text-white/70 text-sm">エポック</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.loss ? trainingProgress.loss.toFixed(4) : 'N/A'}</div>
                          <div className="text-white/70 text-sm">損失</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.accuracy ? `${Math.round(trainingProgress.accuracy * 100)}%` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">精度</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.elapsed ? `${trainingProgress.elapsed.toFixed(1)}s` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">経過時間</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl">
                      <h4 className="text-2xl font-bold text-white mb-4">🎉 学習結果</h4>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">精度</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{result.trainingTime.toFixed(2)}s</div>
                          <div className="text-sm text-white/80">学習時間</div>
                        </div>
                      </div>
                      
                      {/* 実績表示 */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                          🏆 実績
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.accuracy > 0.9 && (
                            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-400/30">
                              🥇 高精度マスター
                            </span>
                          )}
                          {result.accuracy > 0.8 && result.accuracy <= 0.9 && (
                            <span className="px-3 py-1 bg-gray-400/20 text-gray-300 rounded-full text-sm font-bold border border-gray-400/30">
                              🥈 精度エキスパート
                            </span>
                          )}
                          {result.accuracy > 0.7 && result.accuracy <= 0.8 && (
                            <span className="px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-bold border border-orange-400/30">
                              🥉 学習の達人
                            </span>
                          )}
                          {result.trainingTime < 5 && (
                            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm font-bold border border-blue-400/30">
                              ⚡ 高速学習
                            </span>
                          )}
                          {selectedFeatures.length >= 5 && (
                            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full text-sm font-bold border border-purple-400/30">
                              🎯 特徴量マスター
                            </span>
                          )}
                          {selectedModel === 'neural_network' && (
                            <span className="px-3 py-1 bg-pink-400/20 text-pink-300 rounded-full text-sm font-bold border border-pink-400/30">
                              🧠 ニューラルネットワーク使い
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  {result && (
                    <button
                      onClick={nextStep}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ステップ5: 提出 */}
            {currentStep === 'submit' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📤 結果提出</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">📋 提出内容</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">スコア</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedModel}</div>
                          <div className="text-sm text-white/80">モデル</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                          <div className="text-sm text-white/80">特徴量数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{userManager.getCurrentUser()?.username || 'プレイヤー'}</div>
                          <div className="text-sm text-white/80">ユーザー</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmitted}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isSubmitting || isSubmitted
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isSubmitting ? '🔄 提出中...' : isSubmitted ? '✅ 提出完了' : '🚀 リーダーボードに提出'}
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mt-6">
                      <p className="text-green-200 text-center text-lg font-bold">✅ 提出が完了しました！</p>
                      <p className="text-white/70 text-center text-sm mt-2">2秒後にホーム画面に戻ります...</p>
                      
                      {/* 詳細分析 */}
                      {result && (
                        <div className="mt-6 bg-white/5 rounded-xl p-4">
                          <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                            📊 詳細分析
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">使用モデル:</span>
                                <span className="text-white font-bold">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">選択特徴量数:</span>
                                <span className="text-white font-bold">{selectedFeatures.length} / {currentProblem.featureNames.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">学習時間:</span>
                                <span className="text-white font-bold">{result.trainingTime.toFixed(2)}秒</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">最終精度:</span>
                                <span className="text-white font-bold">{Math.round(result.accuracy * 100)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">予測数:</span>
                                <span className="text-white font-bold">{result.predictions?.length || 0}件</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">バトルモード:</span>
                                <span className="text-white font-bold">{battleMode === 'solo' ? 'ソロ' : 'チーム'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    完了
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { userManager } from '../utils/userManager';
import { createStableModel } from '../utils/stableMLModels';
// import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleBattleManager } from '../utils/simpleBattleManager';

interface SimpleOnlineBattleNewProps {
  onBack: () => void;
}

type Step = 'data' | 'features' | 'model' | 'train' | 'submit' | 'leaderboard';

export function SimpleOnlineBattleNew({ onBack }: SimpleOnlineBattleNewProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // データ関連
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  
  // 学習関連
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // リーダーボード関連
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // チーム関連
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [battleMode, setBattleMode] = useState<'solo' | 'team'>('solo');

  // 利用可能なモデル
  const availableModels = [
    { id: 'logistic_regression', name: 'ロジスティック回帰', icon: '📊' },
    { id: 'linear_regression', name: '線形回帰', icon: '📈' },
    { id: 'neural_network', name: 'ニューラルネットワーク', icon: '🧠' }
  ];

  // 初期化
  useEffect(() => {
    loadProblem();
  }, []);

  // 問題が読み込まれた後にリーダーボードを読み込み
  useEffect(() => {
    if (currentProblem) {
      loadLeaderboard();
    }
  }, [currentProblem]);

  const loadLeaderboard = async () => {
    try {
      // ローカルストレージから提出データを読み込み
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      console.log('全提出データ:', submissions);
      
      // スコア順でソート
      const sortedSubmissions = submissions
        .filter(sub => sub.problemId === currentProblem?.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      console.log('フィルタ後の提出データ:', sortedSubmissions);
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード読み込み完了:', sortedSubmissions);
    } catch (err) {
      console.error('リーダーボード読み込みエラー:', err);
    }
  };

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // 問題登録は不要（シンプルなアプローチ）
      console.log('問題読み込み完了:', problem.name);
      
      // 特徴量を自動選択（最初の3つ）
      const autoFeatures = problem.featureNames.slice(0, Math.min(3, problem.featureNames.length)).map((_, i) => i);
      setSelectedFeatures(autoFeatures);
      
      console.log('問題読み込み完了:', problem.name);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (index: number) => {
    if (selectedFeatures.includes(index)) {
      setSelectedFeatures(selectedFeatures.filter(i => i !== index));
    } else {
      setSelectedFeatures([...selectedFeatures, index]);
    }
  };

  const handleTrain = async () => {
    if (!currentProblem || selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setResult(null);

      // データを準備
      const trainData = currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7));
      const testData = currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7));

      // 特徴量を選択
      const filteredTrainData = trainData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      const filteredTestData = testData.map(point => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      }));

      console.log('学習開始:', {
        trainSize: filteredTrainData.length,
        testSize: filteredTestData.length,
        selectedFeatures: selectedFeatures,
        model: selectedModel
      });

      // モデルを作成
      const model = createStableModel(selectedModel);
      
      // パラメータ設定
      const modelParams = {
        learningRate: 0.01,
        epochs: 100,
        ...parameters
      };

      // 学習実行
      console.log('モデル学習開始...');
      await model.train(filteredTrainData, modelParams, (progress) => {
        console.log('学習進捗:', progress);
        setTrainingProgress(progress);
      });
      console.log('モデル学習完了');

      // 評価実行
      console.log('モデル評価開始...');
      const evaluation = model.evaluate(filteredTestData);
      console.log('評価結果:', evaluation);
      
      setResult({
        accuracy: evaluation.accuracy,
        trainingTime: evaluation.training_time,
        predictions: evaluation.predictions,
        actual: evaluation.actual
      });

      console.log('学習完了:', evaluation);
      setCurrentStep('submit');
      
    } catch (err) {
      console.error('学習エラー:', err);
      setError(`学習に失敗しました: ${(err as Error).message}`);
      setCurrentStep('features'); // 特徴量選択に戻る
    } finally {
      setIsTraining(false);
    }
  };

  const handleSubmit = async () => {
    if (!result || !currentProblem) {
      setError('学習結果がありません');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = userManager.getCurrentUser();
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      // 提出データを作成（シンプル版）
      const submission = {
        id: `submission_${Date.now()}`,
        problemId: currentProblem.id,
        userId: user.id,
        username: user.username,
        modelType: selectedModel,
        selectedFeatures: selectedFeatures,
        parameters: parameters,
        score: result.accuracy,
        trainingTime: result.trainingTime,
        submittedAt: new Date(),
        teamId: undefined,
        teamMembers: undefined
      };

      // ローカルストレージに保存
      const submissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      submissions.push(submission);
      localStorage.setItem('competition_submissions', JSON.stringify(submissions));

      console.log('提出完了:', submission);
      setIsSubmitted(true);
      
      // リーダーボードを即座に更新
      const updatedSubmissions = JSON.parse(localStorage.getItem('competition_submissions') || '[]');
      const sortedSubmissions = updatedSubmissions
        .filter(sub => sub.problemId === currentProblem.id)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10);
      
      setLeaderboard(sortedSubmissions);
      console.log('リーダーボード更新完了:', sortedSubmissions);
      
      // リーダーボードを自動表示
      setShowLeaderboard(true);
      
      // バトル完了を通知
      setTimeout(() => {
        onBack();
      }, 5000); // 5秒に延長してリーダーボードを確認できるように
      
    } catch (err) {
      console.error('提出エラー:', err);
      setError(`提出に失敗しました: ${(err as Error).message}`);
      setCurrentStep('train'); // 学習ステップに戻る
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['data', 'features', 'model', 'train', 'submit'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 text-white p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center text-red-900">
          <p className="text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="mb-6">{error}</p>
          <button onClick={onBack} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <p className="text-xl font-bold">問題を読み込めませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* ヘッダー */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sword className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  オンライン対戦
                </h1>
                <p className="text-white/80 text-lg">シンプルな機械学習チャレンジ</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>リーダーボード</span>
                  </button>
                  <div>
                    <div className="text-white/80 font-bold text-lg">ステップ</div>
                    <div className="text-white text-3xl font-mono">
                      {['データ', '特徴量', 'モデル', '学習', '提出', '結果'][['data', 'features', 'model', 'train', 'submit', 'leaderboard'].indexOf(currentStep)]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* リーダーボード表示 */}
        {showLeaderboard && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  リーダーボード
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* デバッグ情報 */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm">
                  デバッグ: リーダーボードエントリ数: {leaderboard.length}
                </p>
                <p className="text-white/70 text-sm">
                  現在の問題ID: {currentProblem?.id}
                </p>
              </div>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">まだ提出がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                          : index < 3
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index < 3
                            ? 'bg-gray-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{entry.username || 'プレイヤー'}</div>
                          <div className="text-white/60 text-sm">
                            {entry.modelType || 'Unknown'} • {entry.trainingTime ? `${entry.trainingTime.toFixed(2)}s` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.score ? `${Math.round(entry.score * 100)}%` : 'N/A'}
                        </div>
                        <div className="text-white/60 text-sm">スコア</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* バトルモード選択 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🎮 バトルモード選択</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setBattleMode('solo')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'solo'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚔️</div>
                    <div className="font-bold">ソロバトル</div>
                    <div className="text-sm opacity-70">一人で挑戦</div>
                  </div>
                </button>
                <button
                  onClick={() => setBattleMode('team')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                    battleMode === 'team'
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-bold">チームバトル</div>
                    <div className="text-sm opacity-70">チームで協力</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 問題情報 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currentProblem.name}</h2>
                  <p className="text-white/70 text-lg">{currentProblem.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.featureNames.length}</div>
                  <div className="text-sm text-white/80">特徴量数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.data.length}</div>
                  <div className="text-sm text-white/80">サンプル数</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{currentProblem.problemType}</div>
                  <div className="text-sm text-white/80">問題タイプ</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                  <div className="text-sm text-white/80">選択済み特徴量</div>
                </div>
              </div>
            </div>

            {/* ステップ1: データ探索 */}
            {currentStep === 'data' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📊 データ探索</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">特徴量一覧</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <div key={index} className="p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="text-white font-medium">{feature}</div>
                        <div className="text-xs text-white/60">特徴量 {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: 特徴量選択 */}
            {currentStep === 'features' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🎯 特徴量選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用する特徴量を選択</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentProblem.featureNames.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => handleFeatureToggle(index)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedFeatures.includes(index)
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{feature}</div>
                          <div className="text-xs opacity-70">特徴量 {index + 1}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70">
                      選択済み: {selectedFeatures.length} / {currentProblem.featureNames.length} 特徴量
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={selectedFeatures.length === 0}
                    className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                      selectedFeatures.length === 0
                        ? 'bg-gray-500 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                    }`}
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: モデル選択 */}
            {currentStep === 'model' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🤖 モデル選択</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">使用するモデルを選択</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          selectedModel === model.id
                            ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                            : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{model.icon}</div>
                          <div className="text-lg font-bold mb-1">{model.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* ステップ4: 学習 */}
            {currentStep === 'train' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">🚀 モデル学習</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  <div className="text-center mb-6">
                    <button
                      onClick={handleTrain}
                      disabled={isTraining}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isTraining
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isTraining ? '🔄 学習中...' : '🚀 学習開始'}
                    </button>
                  </div>
                  
                  {isTraining && trainingProgress && (
                    <div className="bg-white/10 rounded-lg p-6 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white font-bold text-lg">{trainingProgress.message}</span>
                        <span className="text-yellow-400 font-bold text-xl">{trainingProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${trainingProgress.progress}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.epoch || 0}</div>
                          <div className="text-white/70 text-sm">エポック</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.loss ? trainingProgress.loss.toFixed(4) : 'N/A'}</div>
                          <div className="text-white/70 text-sm">損失</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.accuracy ? `${Math.round(trainingProgress.accuracy * 100)}%` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">精度</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-yellow-400 font-bold text-lg">{trainingProgress.elapsed ? `${trainingProgress.elapsed.toFixed(1)}s` : 'N/A'}</div>
                          <div className="text-white/70 text-sm">経過時間</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl">
                      <h4 className="text-2xl font-bold text-white mb-4">🎉 学習結果</h4>
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">精度</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{result.trainingTime.toFixed(2)}s</div>
                          <div className="text-sm text-white/80">学習時間</div>
                        </div>
                      </div>
                      
                      {/* 実績表示 */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                          🏆 実績
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.accuracy > 0.9 && (
                            <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-400/30">
                              🥇 高精度マスター
                            </span>
                          )}
                          {result.accuracy > 0.8 && result.accuracy <= 0.9 && (
                            <span className="px-3 py-1 bg-gray-400/20 text-gray-300 rounded-full text-sm font-bold border border-gray-400/30">
                              🥈 精度エキスパート
                            </span>
                          )}
                          {result.accuracy > 0.7 && result.accuracy <= 0.8 && (
                            <span className="px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-bold border border-orange-400/30">
                              🥉 学習の達人
                            </span>
                          )}
                          {result.trainingTime < 5 && (
                            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm font-bold border border-blue-400/30">
                              ⚡ 高速学習
                            </span>
                          )}
                          {selectedFeatures.length >= 5 && (
                            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full text-sm font-bold border border-purple-400/30">
                              🎯 特徴量マスター
                            </span>
                          )}
                          {selectedModel === 'neural_network' && (
                            <span className="px-3 py-1 bg-pink-400/20 text-pink-300 rounded-full text-sm font-bold border border-pink-400/30">
                              🧠 ニューラルネットワーク使い
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  {result && (
                    <button
                      onClick={nextStep}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ステップ5: 提出 */}
            {currentStep === 'submit' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">📤 結果提出</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                  {result && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">📋 提出内容</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white/80">スコア</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedModel}</div>
                          <div className="text-sm text-white/80">モデル</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                          <div className="text-sm text-white/80">特徴量数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{userManager.getCurrentUser()?.username || 'プレイヤー'}</div>
                          <div className="text-sm text-white/80">ユーザー</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isSubmitted}
                      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isSubmitting || isSubmitted
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {isSubmitting ? '🔄 提出中...' : isSubmitted ? '✅ 提出完了' : '🚀 リーダーボードに提出'}
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-xl mt-6">
                      <p className="text-green-200 text-center text-lg font-bold">✅ 提出が完了しました！</p>
                      <p className="text-white/70 text-center text-sm mt-2">2秒後にホーム画面に戻ります...</p>
                      
                      {/* 詳細分析 */}
                      {result && (
                        <div className="mt-6 bg-white/5 rounded-xl p-4">
                          <h5 className="text-lg font-bold text-white mb-3 flex items-center">
                            📊 詳細分析
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">使用モデル:</span>
                                <span className="text-white font-bold">{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">選択特徴量数:</span>
                                <span className="text-white font-bold">{selectedFeatures.length} / {currentProblem.featureNames.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">学習時間:</span>
                                <span className="text-white font-bold">{result.trainingTime.toFixed(2)}秒</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white/70">最終精度:</span>
                                <span className="text-white font-bold">{Math.round(result.accuracy * 100)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">予測数:</span>
                                <span className="text-white font-bold">{result.predictions?.length || 0}件</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/70">バトルモード:</span>
                                <span className="text-white font-bold">{battleMode === 'solo' ? 'ソロ' : 'チーム'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    戻る
                  </button>
                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    完了
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}