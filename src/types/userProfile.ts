// ユーザープロフィール型定義（経験値制度なし）
export interface UserProfile {
  userId: string;
  username: string;
  // 経験値・レベルを削除
  achievements: Achievement[];
  stats: UserStats;
  badges: Badge[];
  joinDate: Date;
  lastActive: Date;
}

export interface UserStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  bestScore: number;
  averageScore: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  favoriteModelType: string;
  problemTypesSolved: string[];
  streak: number; // 連続参加日数
  longestStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'battle' | 'learning' | 'team' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  category: 'performance' | 'participation' | 'teamwork' | 'innovation';
}

// アチーブメント条件（経験値ベースを削除）
export interface AchievementCondition {
  id: string;
  type: 'battle_count' | 'win_count' | 'score_threshold' | 'streak_count' | 'model_mastery' | 'team_contribution';
  threshold: number;
  description: string;
}

// 統計ベースのランキング
export interface UserRanking {
  userId: string;
  username: string;
  rank: number;
  score: number;
  stats: UserStats;
  badges: Badge[];
  achievements: Achievement[];
}


