import React, { useState, useEffect } from 'react';
import { Trophy, Award, Users, Target, Clock, Star, TrendingUp, RefreshCw } from 'lucide-react';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { CompetitionProblemManager } from '../utils/competitionProblemManager';
import type { CompetitionLeaderboard, CompetitionProblem } from '../types/competition';

interface LeaderboardProps {
  onBack: () => void;
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<CompetitionLeaderboard | null>(null);
  const [problems, setProblems] = useState<CompetitionProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  useEffect(() => {
    loadProblems();
    
    // 定期的にリーダーボードを更新
    const interval = setInterval(() => {
      if (selectedProblem) {
        loadLeaderboard(selectedProblem);
      }
    }, 10000); // 10秒ごとに更新
    
    return () => clearInterval(interval);
  }, [selectedProblem]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const activeProblems = CompetitionProblemManager.getActiveProblems();
      setProblems(activeProblems);
      
      if (activeProblems.length > 0) {
        setSelectedProblem(activeProblems[0].id);
        await loadLeaderboard(activeProblems[0].id);
      }
    } catch (error) {
      console.error('問題読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (problemId: string) => {
    try {
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId, 20);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  const handleProblemChange = async (problemId: string) => {
    setSelectedProblem(problemId);
    await loadLeaderboard(problemId);
  };

  const handleTabChange = (tab: 'public' | 'private') => {
    setActiveTab(tab);
    // タブ変更時は同じデータを表示（Public/Privateの区別は将来実装）
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
            <p className="text-2xl text-yellow-100 font-bold">読み込み中...</p>
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                <Trophy className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-yellow-300 mb-2">🏆 リーダーボード</h1>
                <p className="text-blue-200">機械学習の実力を競おう</p>
              </div>
              <div className="text-right">
                <div className="text-yellow-300 font-bold text-lg">総参加者</div>
                <div className="text-white text-2xl">{leaderboard?.participantCount || 0}人</div>
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="p-6 border-b-2 border-blue-200">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleTabChange('public')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeTab === 'public'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Public評価
              </button>
              <button
                onClick={() => handleTabChange('private')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  activeTab === 'private'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔍 Private評価
              </button>
            </div>

            {/* 問題選択 */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                問題を選択 ({problems.length}問)
              </h3>
              {problems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {problems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemChange(problem.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedProblem === problem.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-blue-900">{problem.title}</div>
                      <div className="text-sm text-gray-600">{problem.description}</div>
                      <div className="text-xs text-gray-500">
                        参加者: {problem.participantCount}人 | 提出: {problem.submissionCount}件
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>アクティブな問題がありません</p>
                  <p className="text-sm">新しい問題が追加されるまでお待ちください</p>
                </div>
              )}
            </div>
          </div>

          {/* リーダーボード表示 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900">
                {activeTab === 'public' ? '📊 Public評価リーダーボード' : '🔍 Private評価リーダーボード'}
              </h3>
              <button
                onClick={() => selectedProblem && loadLeaderboard(selectedProblem)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>更新</span>
              </button>
            </div>
            
            {!leaderboard || leaderboard.submissions.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">データがありません</h3>
                <p className="text-gray-500">まだ誰も参加していません。最初の参加者になりましょう！</p>
                <div className="mt-4 text-sm text-gray-400">
                  <p>• オンライン対戦で問題に挑戦すると、リーダーボードに表示されます</p>
                  <p>• {activeTab === 'public' ? '検証データ' : 'テストデータ'}でのスコアが表示されます</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.submissions.map((entry, index) => (
                  <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-yellow-100 border-yellow-300' :
                    index === 1 ? 'bg-gray-100 border-gray-300' :
                    index === 2 ? 'bg-orange-100 border-orange-300' :
                    'bg-white border-slate-300'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-blue-900 w-8">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-blue-900 text-lg">{entry.username}</div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{entry.teamId ? 'チーム' : '個人'}</span>
                            </span>
                            {entry.teamId && (
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{entry.teamId}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{entry.modelType}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {isNaN(entry.score) ? '0.0' : ((entry.score || 0)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-600">
                        {activeTab === 'public' ? 'Public' : 'Private'}スコア
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}