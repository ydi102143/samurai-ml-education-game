// ユーザープロフィール表示コンポーネント（経験値制度なし）
import React, { useState, useEffect } from 'react';
import { Trophy, Target, Award, Star, Calendar, TrendingUp, Users, Zap } from 'lucide-react';
import { UserProfileManager } from '../utils/userProfileManager';
import type { UserProfile, Achievement, Badge } from '../types/userProfile';

interface UserProfileViewProps {
  userId: string;
  onClose?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rank, setRank] = useState<number>(-1);
  const [achievementProgress, setAchievementProgress] = useState<{
    unlocked: Achievement[];
    total: number;
    progress: number;
  }>({ unlocked: [], total: 0, progress: 0 });
  const [badgeProgress, setBadgeProgress] = useState<{
    unlocked: Badge[];
    total: number;
    progress: number;
  }>({ unlocked: [], total: 0, progress: 0 });

  useEffect(() => {
    const summary = UserProfileManager.getProfileSummary(userId);
    setProfile(summary.profile);
    setRank(summary.rank);
    setAchievementProgress(summary.achievementProgress);
    setBadgeProgress(summary.badgeProgress);
  }, [userId]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">プロフィールを読み込み中...</div>
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                ランク #{rank}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                参加日: {new Date(profile.joinDate).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBattles}</div>
          <div className="text-sm text-blue-800">総バトル数</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
          <div className="text-sm text-green-800">勝利数</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{Math.round(stats.winRate * 100)}%</div>
          <div className="text-sm text-yellow-800">勝率</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.bestScore}</div>
          <div className="text-sm text-purple-800">最高スコア</div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            パフォーマンス
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">平均スコア</span>
              <span className="font-semibold">{Math.round(stats.averageScore)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">成功提出率</span>
              <span className="font-semibold">
                {Math.round((stats.successfulSubmissions / Math.max(stats.totalSubmissions, 1)) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">連続参加日数</span>
              <span className="font-semibold">{stats.streak}日</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最長連続記録</span>
              <span className="font-semibold">{stats.longestStreak}日</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            習得状況
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">お気に入りモデル</span>
              <span className="font-semibold">{stats.favoriteModelType || 'なし'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">解決した問題タイプ</span>
              <span className="font-semibold">{stats.problemTypesSolved.length}種類</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">総提出数</span>
              <span className="font-semibold">{stats.totalSubmissions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">成功提出数</span>
              <span className="font-semibold">{stats.successfulSubmissions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* アチーブメント */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          アチーブメント ({achievementProgress.unlocked.length}/{achievementProgress.total})
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-semibold">{achievementProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${achievementProgress.progress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {achievementProgress.unlocked.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-lg p-3 text-center border border-gray-200"
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs font-semibold text-gray-900">{achievement.name}</div>
                <div className="text-xs text-gray-600">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* バッジ */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          バッジ ({badgeProgress.unlocked.length}/{badgeProgress.total})
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-semibold">{badgeProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${badgeProgress.progress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {badgeProgress.unlocked.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-lg p-3 text-center border border-gray-200"
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-semibold text-gray-900">{badge.name}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
