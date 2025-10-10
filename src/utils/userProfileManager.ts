// ユーザープロフィール管理システム（経験値制度なし）
import type { UserProfile, UserStats, Achievement, Badge } from '../types/userProfile';
import { AchievementSystem } from './achievementSystem';

export class UserProfileManager {
  private static profiles: Map<string, UserProfile> = new Map();

  static createUserProfile(userId: string, username: string): UserProfile {
    const profile: UserProfile = {
      userId,
      username,
      achievements: [],
      badges: [],
      stats: this.getInitialStats(),
      joinDate: new Date(),
      lastActive: new Date()
    };

    this.profiles.set(userId, profile);
    return profile;
  }

  private static getInitialStats(): UserStats {
    return {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      bestScore: 0,
      averageScore: 0,
      totalSubmissions: 0,
      successfulSubmissions: 0,
      favoriteModelType: '',
      problemTypesSolved: [],
      streak: 0,
      longestStreak: 0
    };
  }

  static getUserProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }

  static updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): UserProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  static updateUserStats(
    userId: string,
    battleResult: {
      won: boolean;
      score: number;
      modelType: string;
      problemType: string;
    }
  ): UserProfile | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    // 統計を更新
    const newStats = AchievementSystem.updateUserStats(profile.stats, battleResult);
    
    // アチーブメントをチェック
    const newAchievements = AchievementSystem.checkAchievements(profile, newStats);
    
    // プロフィールを更新
    const updatedProfile: UserProfile = {
      ...profile,
      stats: newStats,
      achievements: [...profile.achievements, ...newAchievements],
      lastActive: new Date()
    };

    this.profiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  static getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  static getRankedProfiles(): UserProfile[] {
    const profiles = this.getAllProfiles();
    return AchievementSystem.calculateUserRanking(profiles);
  }

  static getTopUsers(limit: number = 10): UserProfile[] {
    const rankedProfiles = this.getRankedProfiles();
    return rankedProfiles.slice(0, limit);
  }

  static getUserRank(userId: string): number {
    const rankedProfiles = this.getRankedProfiles();
    const userIndex = rankedProfiles.findIndex(p => p.userId === userId);
    return userIndex >= 0 ? userIndex + 1 : -1;
  }

  static getAchievementProgress(userId: string): {
    unlocked: Achievement[];
    total: number;
    progress: number;
  } {
    const profile = this.getUserProfile(userId);
    if (!profile) {
      return { unlocked: [], total: 0, progress: 0 };
    }

    const totalAchievements = 18; // 定義されたアチーブメント数
    const unlocked = profile.achievements;
    const progress = (unlocked.length / totalAchievements) * 100;

    return {
      unlocked,
      total: totalAchievements,
      progress: Math.round(progress)
    };
  }

  static getBadgeProgress(userId: string): {
    unlocked: Badge[];
    total: number;
    progress: number;
  } {
    const profile = this.getUserProfile(userId);
    if (!profile) {
      return { unlocked: [], total: 0, progress: 0 };
    }

    // バッジは統計に基づいて自動生成
    const badges = this.generateBadges(profile);
    const totalBadges = 12; // 定義されたバッジ数
    const progress = (badges.length / totalBadges) * 100;

    return {
      unlocked: badges,
      total: totalBadges,
      progress: Math.round(progress)
    };
  }

  private static generateBadges(profile: UserProfile): Badge[] {
    const badges: Badge[] = [];
    const stats = profile.stats;

    // 勝利数に基づくバッジ
    if (stats.wins >= 1) {
      badges.push({
        id: 'first_win_badge',
        name: '初勝利',
        description: '初回勝利を記録',
        icon: '🎉',
        rarity: 'common',
        unlockedAt: new Date(),
        category: 'performance'
      });
    }

    if (stats.wins >= 10) {
      badges.push({
        id: 'win_master_badge',
        name: '勝利の達人',
        description: '10回勝利を記録',
        icon: '🏆',
        rarity: 'rare',
        unlockedAt: new Date(),
        category: 'performance'
      });
    }

    // スコアに基づくバッジ
    if (stats.bestScore >= 90) {
      badges.push({
        id: 'high_scorer_badge',
        name: '高得点者',
        description: '90点以上を記録',
        icon: '⭐',
        rarity: 'rare',
        unlockedAt: new Date(),
        category: 'performance'
      });
    }

    // 参加数に基づくバッジ
    if (stats.totalBattles >= 50) {
      badges.push({
        id: 'active_player_badge',
        name: 'アクティブプレイヤー',
        description: '50回バトル参加',
        icon: '⚡',
        rarity: 'common',
        unlockedAt: new Date(),
        category: 'participation'
      });
    }

    // 連続参加に基づくバッジ
    if (stats.streak >= 7) {
      badges.push({
        id: 'daily_player_badge',
        name: '毎日参加者',
        description: '7日連続参加',
        icon: '📅',
        rarity: 'common',
        unlockedAt: new Date(),
        category: 'participation'
      });
    }

    return badges;
  }

  static getProfileSummary(userId: string): {
    profile: UserProfile | null;
    rank: number;
    achievementProgress: { unlocked: Achievement[]; total: number; progress: number };
    badgeProgress: { unlocked: Badge[]; total: number; progress: number };
  } {
    const profile = this.getUserProfile(userId);
    const rank = this.getUserRank(userId);
    const achievementProgress = this.getAchievementProgress(userId);
    const badgeProgress = this.getBadgeProgress(userId);

    return {
      profile,
      rank,
      achievementProgress,
      badgeProgress
    };
  }
}

