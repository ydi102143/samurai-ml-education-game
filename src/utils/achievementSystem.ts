// アチーブメントシステム（経験値制度なし）
import type { UserProfile, Achievement, Badge, UserStats, AchievementCondition } from '../types/userProfile';

export class AchievementSystem {
  private static achievements: AchievementCondition[] = [
    // バトル関連
    { id: 'first_battle', type: 'battle_count', threshold: 1, description: '初回バトル参加' },
    { id: 'battle_veteran', type: 'battle_count', threshold: 10, description: '10回バトル参加' },
    { id: 'battle_master', type: 'battle_count', threshold: 50, description: '50回バトル参加' },
    { id: 'battle_legend', type: 'battle_count', threshold: 100, description: '100回バトル参加' },
    
    // 勝利関連
    { id: 'first_win', type: 'win_count', threshold: 1, description: '初回勝利' },
    { id: 'win_streak_5', type: 'win_count', threshold: 5, description: '5連勝' },
    { id: 'win_streak_10', type: 'win_count', threshold: 10, description: '10連勝' },
    { id: 'win_master', type: 'win_count', threshold: 25, description: '25回勝利' },
    
    // スコア関連
    { id: 'high_scorer', type: 'score_threshold', threshold: 80, description: '80点以上獲得' },
    { id: 'excellent_scorer', type: 'score_threshold', threshold: 90, description: '90点以上獲得' },
    { id: 'perfect_scorer', type: 'score_threshold', threshold: 95, description: '95点以上獲得' },
    
    // 連続参加
    { id: 'daily_player', type: 'streak_count', threshold: 7, description: '7日連続参加' },
    { id: 'dedicated_player', type: 'streak_count', threshold: 30, description: '30日連続参加' },
    { id: 'loyal_player', type: 'streak_count', threshold: 100, description: '100日連続参加' },
    
    // モデル習得
    { id: 'model_explorer', type: 'model_mastery', threshold: 3, description: '3種類のモデル使用' },
    { id: 'model_master', type: 'model_mastery', threshold: 5, description: '5種類のモデル使用' },
    { id: 'model_guru', type: 'model_mastery', threshold: 10, description: '10種類のモデル使用' },
    
    // チーム貢献
    { id: 'team_player', type: 'team_contribution', threshold: 1, description: '初回チーム参加' },
    { id: 'team_leader', type: 'team_contribution', threshold: 5, description: '5回チームリーダー' },
    { id: 'team_champion', type: 'team_contribution', threshold: 10, description: '10回チーム勝利' }
  ];

  static checkAchievements(userProfile: UserProfile, newStats: UserStats): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    for (const condition of this.achievements) {
      // 既に取得済みかチェック
      const alreadyUnlocked = userProfile.achievements.some(a => a.id === condition.id);
      if (alreadyUnlocked) continue;
      
      // 条件をチェック
      if (this.checkCondition(condition, newStats)) {
        const achievement = this.createAchievement(condition);
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }

  private static checkCondition(condition: AchievementCondition, stats: UserStats): boolean {
    switch (condition.type) {
      case 'battle_count':
        return stats.totalBattles >= condition.threshold;
      case 'win_count':
        return stats.wins >= condition.threshold;
      case 'score_threshold':
        return stats.bestScore >= condition.threshold;
      case 'streak_count':
        return stats.streak >= condition.threshold;
      case 'model_mastery':
        return stats.problemTypesSolved.length >= condition.threshold;
      case 'team_contribution':
        // チーム関連の統計は後で実装
        return false;
      default:
        return false;
    }
  }

  private static createAchievement(condition: AchievementCondition): Achievement {
    const achievementData = this.getAchievementData(condition.id);
    
    return {
      id: condition.id,
      name: achievementData.name,
      description: condition.description,
      icon: achievementData.icon,
      unlockedAt: new Date(),
      category: achievementData.category,
      rarity: achievementData.rarity
    };
  }

  private static getAchievementData(achievementId: string): {
    name: string;
    icon: string;
    category: 'battle' | 'learning' | 'team' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } {
    const data: Record<string, any> = {
      'first_battle': { name: '初戦', icon: '🎯', category: 'battle', rarity: 'common' },
      'battle_veteran': { name: 'ベテラン', icon: '⚔️', category: 'battle', rarity: 'common' },
      'battle_master': { name: 'マスター', icon: '🏆', category: 'battle', rarity: 'rare' },
      'battle_legend': { name: 'レジェンド', icon: '👑', category: 'battle', rarity: 'epic' },
      
      'first_win': { name: '初勝利', icon: '🎉', category: 'battle', rarity: 'common' },
      'win_streak_5': { name: '5連勝', icon: '🔥', category: 'battle', rarity: 'common' },
      'win_streak_10': { name: '10連勝', icon: '💥', category: 'battle', rarity: 'rare' },
      'win_master': { name: '勝利王', icon: '👑', category: 'battle', rarity: 'epic' },
      
      'high_scorer': { name: '高得点者', icon: '⭐', category: 'learning', rarity: 'common' },
      'excellent_scorer': { name: '優秀者', icon: '🌟', category: 'learning', rarity: 'rare' },
      'perfect_scorer': { name: '完璧主義者', icon: '💎', category: 'learning', rarity: 'epic' },
      
      'daily_player': { name: '毎日参加', icon: '📅', category: 'special', rarity: 'common' },
      'dedicated_player': { name: '熱心な参加者', icon: '💪', category: 'special', rarity: 'rare' },
      'loyal_player': { name: '忠実な参加者', icon: '❤️', category: 'special', rarity: 'legendary' },
      
      'model_explorer': { name: 'モデル探検家', icon: '🔍', category: 'learning', rarity: 'common' },
      'model_master': { name: 'モデルマスター', icon: '🎓', category: 'learning', rarity: 'rare' },
      'model_guru': { name: 'モデル賢者', icon: '🧙', category: 'learning', rarity: 'epic' },
      
      'team_player': { name: 'チームプレイヤー', icon: '👥', category: 'team', rarity: 'common' },
      'team_leader': { name: 'チームリーダー', icon: '👑', category: 'team', rarity: 'rare' },
      'team_champion': { name: 'チームチャンピオン', icon: '🏆', category: 'team', rarity: 'epic' }
    };
    
    return data[achievementId] || { name: '未知のアチーブメント', icon: '❓', category: 'special', rarity: 'common' };
  }

  static calculateUserRanking(users: UserProfile[]): UserProfile[] {
    return users.sort((a, b) => {
      // 複数の指標でランキング計算
      const scoreA = this.calculateUserScore(a);
      const scoreB = this.calculateUserScore(b);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // 同点の場合は勝率で比較
      if (a.stats.winRate !== b.stats.winRate) {
        return b.stats.winRate - a.stats.winRate;
      }
      
      // それでも同点の場合は参加日数で比較
      return b.stats.totalBattles - a.stats.totalBattles;
    });
  }

  private static calculateUserScore(user: UserProfile): number {
    const stats = user.stats;
    
    // スコア計算式（経験値なし）
    let score = 0;
    
    // 勝利数 × 10
    score += stats.wins * 10;
    
    // 最高スコア × 2
    score += stats.bestScore * 2;
    
    // 平均スコア × 1
    score += stats.averageScore * 1;
    
    // 連続参加日数 × 5
    score += stats.streak * 5;
    
    // アチーブメント数 × 20
    score += user.achievements.length * 20;
    
    // バッジ数 × 15
    score += user.badges.length * 15;
    
    return Math.round(score);
  }

  static updateUserStats(
    currentStats: UserStats,
    battleResult: {
      won: boolean;
      score: number;
      modelType: string;
      problemType: string;
    }
  ): UserStats {
    const newStats = { ...currentStats };
    
    // バトル数更新
    newStats.totalBattles += 1;
    
    // 勝敗更新
    if (battleResult.won) {
      newStats.wins += 1;
    } else {
      newStats.losses += 1;
    }
    
    // 勝率計算
    newStats.winRate = newStats.wins / newStats.totalBattles;
    
    // スコア更新
    if (battleResult.score > newStats.bestScore) {
      newStats.bestScore = battleResult.score;
    }
    
    // 平均スコア更新
    const totalScore = newStats.averageScore * (newStats.totalBattles - 1) + battleResult.score;
    newStats.averageScore = totalScore / newStats.totalBattles;
    
    // 提出数更新
    newStats.totalSubmissions += 1;
    if (battleResult.score >= 70) { // 70点以上を成功とする
      newStats.successfulSubmissions += 1;
    }
    
    // お気に入りモデル更新
    newStats.favoriteModelType = battleResult.modelType;
    
    // 解決した問題タイプ更新
    if (!newStats.problemTypesSolved.includes(battleResult.problemType)) {
      newStats.problemTypesSolved.push(battleResult.problemType);
    }
    
    return newStats;
  }
}



