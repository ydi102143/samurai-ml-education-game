import { useState, useEffect } from 'react';
import { Clock, Trophy, Target, Users, Zap, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { BattleChallengeView } from './BattleChallengeView';
import { BattleDatabase } from '../utils/battleDatabase';
import { userManager } from '../utils/userManager';
import type { ModelResult } from '../types/ml';

interface SoloBattleProps {
  onBack: () => void;
}

interface CompetitionProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  participants: number;
  bestScore: number;
  category: 'classification' | 'regression';
  regionId: string;
}

export function SoloBattle({ onBack }: SoloBattleProps) {
  const [problems, setProblems] = useState<CompetitionProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CompetitionProblem | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [result, setResult] = useState<ModelResult | null>(null);

  useEffect(() => {
    loadCompetitionProblems();
  }, []);


  const loadCompetitionProblems = async () => {
    try {
      // 動的にリーダーボードから統計を取得
      const stockPrediction = await BattleDatabase.getProblemLeaderboard('modern_stock_prediction', false, 'individual');
      const sentimentAnalysis = await BattleDatabase.getProblemLeaderboard('modern_sentiment_analysis', false, 'individual');
      const imageClassification = await BattleDatabase.getProblemLeaderboard('modern_image_classification', false, 'individual');
      const recommendation = await BattleDatabase.getProblemLeaderboard('modern_recommendation', false, 'individual');
      const fraudDetection = await BattleDatabase.getProblemLeaderboard('modern_fraud_detection', false, 'individual');

      const competitionProblems: CompetitionProblem[] = [
        {
          id: 'stock_prediction',
          title: '株価予測コンペティション',
          description: '企業の財務データから株価の変動を予測する',
          difficulty: 'intermediate',
          timeLimit: 1800, // 30分
          participants: stockPrediction.length,
          bestScore: stockPrediction.length > 0 ? stockPrediction[0].accuracy : 0,
          category: 'regression',
          regionId: 'modern_stock_prediction'
        },
        {
          id: 'sentiment_analysis',
          title: '感情分析コンペティション',
          description: 'SNSの投稿から感情を分析・分類する',
          difficulty: 'beginner',
          timeLimit: 1200, // 20分
          participants: sentimentAnalysis.length,
          bestScore: sentimentAnalysis.length > 0 ? sentimentAnalysis[0].accuracy : 0,
          category: 'classification',
          regionId: 'modern_sentiment_analysis'
        },
        {
          id: 'image_classification',
          title: '画像分類コンペティション',
          description: '画像の特徴量から物体を識別・分類する',
          difficulty: 'advanced',
          timeLimit: 2400, // 40分
          participants: imageClassification.length,
          bestScore: imageClassification.length > 0 ? imageClassification[0].accuracy : 0,
          category: 'classification',
          regionId: 'modern_image_classification'
        },
        {
          id: 'recommendation',
          title: '推薦システムコンペティション',
          description: 'ユーザーの行動データから商品を推薦する',
          difficulty: 'intermediate',
          timeLimit: 1500, // 25分
          participants: recommendation.length,
          bestScore: recommendation.length > 0 ? recommendation[0].accuracy : 0,
          category: 'regression',
          regionId: 'modern_recommendation'
        },
        {
          id: 'fraud_detection',
          title: '不正検出コンペティション',
          description: '取引データから不正な行為を検出する',
          difficulty: 'advanced',
          timeLimit: 2100, // 35分
          participants: fraudDetection.length,
          bestScore: fraudDetection.length > 0 ? fraudDetection[0].accuracy : 0,
          category: 'classification',
          regionId: 'modern_fraud_detection'
        }
      ];
      setProblems(competitionProblems);
    } catch (error) {
      console.error('コンペティション問題の読み込みに失敗:', error);
      // フォールバック用の空の配列
      setProblems([]);
    }
  };


  const startCompetition = (problem: CompetitionProblem) => {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) {
      alert('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }
    
    setSelectedProblem(problem);
    setIsCompeting(true);
  };

  const handleCompetitionComplete = (result: ModelResult) => {
    setResult(result);
    setIsCompeting(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '不明';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompeting && selectedProblem) {
    return (
      <BattleChallengeView
        problemId={selectedProblem.regionId}
        problemTitle={selectedProblem.title}
        timeLimit={selectedProblem.timeLimit}
        onComplete={handleCompetitionComplete}
        onBack={() => setIsCompeting(false)}
        isMultiplayer={false}
        roomId="individual"
        userId={userManager.getCurrentUser()?.id}
        username={userManager.getCurrentUser()?.username}
      />
    );
  }

  if (result && selectedProblem) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">🎉 解答完了！</h1>
                <p className="text-lg text-yellow-200">{selectedProblem.title}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-800">{Math.round(result.accuracy * 100)}%</div>
                  <div className="text-sm text-green-600">精度</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-800">{Math.round(result.trainingTime)}秒</div>
                  <div className="text-sm text-blue-600">学習時間</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-800">{selectedModel}</div>
                  <div className="text-sm text-purple-600">使用モデル</div>
                </div>
              </div>

              <div className="text-center space-x-4">
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedProblem(null);
                  }}
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  他のコンペに挑戦
                </button>
                <button
                  onClick={onBack}
                  className="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
          {/* ヘッダー */}
          <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-white hover:text-yellow-200 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20"
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">戻る</span>
              </button>
              <div className="text-center flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Kaggle風コンペティション
                </h1>
                <p className="text-lg mt-2 text-yellow-200">個人でオンライン対戦に挑戦しよう</p>
              </div>
              <div className="w-32" />
            </div>

            {/* タブナビゲーション */}
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
              <button
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md bg-yellow-400 text-blue-900 font-bold"
              >
                <BarChart3 className="w-5 h-5" />
                <span>コンペティション</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-white hover:bg-white/20"
              >
                <Trophy className="w-5 h-5" />
                <span>リーダーボード</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* コンペティション一覧 */}
            <div className="space-y-4">
              {problems.map((problem) => (
                <div key={problem.id} className="bg-white rounded-lg border-2 border-slate-300 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">{problem.title}</h3>
                        <p className="text-slate-600 mt-1">{problem.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(problem.difficulty)}`}>
                            {getDifficultyLabel(problem.difficulty)}
                          </span>
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>{Math.floor(problem.timeLimit / 60)}分</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Users className="w-4 h-4" />
                            <span>{problem.participants.toLocaleString()}人</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>最高: {problem.bestScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => startCompetition(problem)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-yellow-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                        >
                          <Target className="w-5 h-5 inline-block mr-2" />
                          挑戦する
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
