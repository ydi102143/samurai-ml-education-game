// リアルタイムリーダーボード
import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { scoringSystem, type LeaderboardEntry } from '../utils/scoringSystem';
import { weeklyProblemSystem, type WeeklyProblem } from '../utils/weeklyProblemSystem';

interface RealtimeLeaderboardProps {
  currentUserId: string;
  onClose: () => void;
}

export function RealtimeLeaderboard({ currentUserId, onClose }: RealtimeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentProblem, setCurrentProblem] = useState<WeeklyProblem | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    evaluatedSubmissions: 0,
    averageScore: 0,
    totalParticipants: 0
  });

  useEffect(() => {
    // 初期データを読み込み
    setLeaderboard(scoringSystem.getLeaderboard());
    setCurrentProblem(weeklyProblemSystem.getCurrentProblem());
    setStats(scoringSystem.getStats());

    // リスナーを設定
    scoringSystem.onLeaderboardUpdate(setLeaderboard);
    weeklyProblemSystem.onProblemUpdate(setCurrentProblem);

    // 現在のユーザーを設定
    scoringSystem.setCurrentUser(currentUserId);

    // タイマーを開始
    const timer = setInterval(() => {
      setTimeRemaining(weeklyProblemSystem.getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUserId]);

  // ランクアイコンを取得
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-white/60 font-bold">#{rank}</span>;
  };

  // スコアの色を取得
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-blue-400';
    if (score >= 0.7) return 'text-yellow-400';
    if (score >= 0.6) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold">リーダーボード</h2>
              {currentProblem && (
                <p className="text-white/70">{currentProblem.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* 問題情報とタイマー */}
        {currentProblem && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">評価指標</span>
              </div>
              <p className="text-white/70">{currentProblem.evaluation.metric}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="font-semibold">参加者</span>
              </div>
              <p className="text-white/70">{stats.totalParticipants}人</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="font-semibold">残り時間</span>
              </div>
              <p className="text-white/70">
                {timeRemaining.days}日 {timeRemaining.hours}時間 {timeRemaining.minutes}分
              </p>
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalSubmissions}</div>
            <div className="text-sm text-white/70">総提出数</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.evaluatedSubmissions}</div>
            <div className="text-sm text-white/70">評価済み</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {(stats.averageScore * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-white/70">平均スコア</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalParticipants}</div>
            <div className="text-sm text-white/70">参加者数</div>
          </div>
        </div>

        {/* リーダーボードテーブル */}
        <div className="bg-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">順位</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">チーム名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">パブリックスコア</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">プライベートスコア</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">提出数</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">最終提出</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">モデル</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.userId}
                    className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
                      entry.isCurrentUser ? 'bg-blue-600/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(entry.rank)}
                        {entry.isCurrentUser && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            あなた
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{entry.teamName}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${getScoreColor(entry.publicScore)}`}>
                        {(entry.publicScore * 100).toFixed(4)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${getScoreColor(entry.privateScore)}`}>
                        {(entry.privateScore * 100).toFixed(4)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{entry.submissions}</td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {entry.lastSubmission.toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-white/10 px-2 py-1 rounded text-sm">
                        {entry.modelName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-white/60">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <TrendingUp className="w-4 h-4" />
            <span>リアルタイム更新中</span>
          </div>
        </div>
      </div>
    </div>
  );
}
