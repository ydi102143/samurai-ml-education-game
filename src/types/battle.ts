// オンライン対戦システムの型定義

export interface BattleRoom {
  id: string;
  name: string;
  hostId: string;
  participants: BattleParticipant[];
  maxParticipants: number;
  status: 'waiting' | 'preparing' | 'active' | 'finished';
  problemType: 'classification' | 'regression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number; // 秒
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface BattleParticipant {
  userId: string;
  username: string;
  avatar?: string;
  isReady: boolean;
  joinedAt: string;
  score?: number;
  rank?: number;
  modelType?: string;
  accuracy?: number;
  trainingTime?: number;
}

export interface BattleProblem {
  id: string;
  title: string;
  description: string;
  dataset: string; // データセットID
  problemType: 'classification' | 'regression';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  evaluationMetrics: string[];
  features: string[];
  sampleSize: number;
  testSize: number;
  createdAt: string;
}

export interface BattleResult {
  battleId: string;
  participantId: string;
  finalScore: number;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  rmse?: number;
  r2?: number;
  trainingTime: number;
  modelType: string;
  rank: number;
  isWinner: boolean;
  completedAt: string;
}

export interface BattleLeaderboard {
  userId: string;
  username: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  rank: number;
  streak: number;
  lastBattleAt: string;
}

export interface BattleChatMessage {
  id: string;
  battleId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'normal' | 'system' | 'achievement';
}

export interface BattleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'score' | 'accuracy' | 'speed' | 'streak' | 'battles';
    value: number;
    operator: '>' | '>=' | '=' | '<' | '<=';
  };
  reward: {
    xp: number;
    title?: string;
    badge?: string;
  };
  unlockedAt?: string;
}

export interface BattleSettings {
  allowSpectators: boolean;
  allowChat: boolean;
  showRealTimeProgress: boolean;
  enableAchievements: boolean;
  difficultyScaling: boolean;
  timeBonus: boolean;
  collaborationMode: boolean;
}

export interface BattleInvitation {
  id: string;
  battleId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

export interface BattleSpectator {
  userId: string;
  username: string;
  joinedAt: string;
  isWatching: boolean;
}

export interface BattleReplay {
  id: string;
  battleId: string;
  participants: BattleParticipant[];
  problem: BattleProblem;
  results: BattleResult[];
  duration: number;
  chatHistory: BattleChatMessage[];
  createdAt: string;
}

export interface BattleTournament {
  id: string;
  name: string;
  description: string;
  hostId: string;
  participants: string[];
  maxParticipants: number;
  status: 'registration' | 'active' | 'finished';
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  rounds: BattleTournamentRound[];
  currentRound: number;
  prize: {
    title: string;
    description: string;
    xp: number;
    badge?: string;
  };
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface BattleTournamentRound {
  roundNumber: number;
  battles: string[]; // Battle IDs
  status: 'pending' | 'active' | 'finished';
  startedAt?: string;
  finishedAt?: string;
}

export interface BattleStatistics {
  userId: string;
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageTrainingTime: number;
  fastestTraining: number;
  favoriteModel: string;
  mostUsedFeatures: string[];
  battleStreak: number;
  longestStreak: number;
  achievements: string[];
  rank: number;
  totalXP: number;
  level: number;
  lastBattleAt: string;
  createdAt: string;
}

export interface BattleMatchmaking {
  userId: string;
  preferences: {
    difficulty: ('beginner' | 'intermediate' | 'advanced')[];
    problemTypes: ('classification' | 'regression')[];
    timeLimit: {
      min: number;
      max: number;
    };
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  queueTime: number;
  estimatedWaitTime: number;
  matchedAt?: string;
}

export interface BattleNotification {
  id: string;
  userId: string;
  type: 'battle_invitation' | 'battle_started' | 'battle_finished' | 'achievement_unlocked' | 'tournament_announcement';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface BattleRealTimeUpdate {
  battleId: string;
  participantId: string;
  progress: {
    currentStep: string;
    progress: number; // 0-100
    estimatedTimeRemaining: number;
  };
  modelPerformance: {
    accuracy: number;
    loss: number;
    epoch: number;
  };
  timestamp: string;
}

export interface BattleCollaboration {
  battleId: string;
  participants: string[];
  sharedFeatures: string[];
  sharedModels: string[];
  collaborationLevel: 'none' | 'features' | 'models' | 'full';
  sharedInsights: BattleInsight[];
  createdAt: string;
}

export interface BattleInsight {
  id: string;
  battleId: string;
  userId: string;
  type: 'feature_importance' | 'model_performance' | 'data_pattern' | 'optimization_tip';
  title: string;
  description: string;
  confidence: number;
  sharedAt: string;
  upvotes: number;
  downvotes: number;
}

export interface BattleFeedback {
  id: string;
  battleId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    communication: number;
    collaboration: number;
    skill: number;
    helpfulness: number;
  };
  createdAt: string;
}

export interface BattleReport {
  id: string;
  battleId: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'cheating' | 'inappropriate_behavior' | 'spam' | 'harassment' | 'other';
  description: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  moderatorId?: string;
  resolution?: string;
}



