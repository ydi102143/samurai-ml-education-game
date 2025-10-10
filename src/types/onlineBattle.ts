// オンライン対戦用のデータ構造定義

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  maxMembers: number;
  isPrivate: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  battleStats: TeamBattleStats;
}

export interface TeamMember {
  userId: string;
  username: string;
  joinedAt: string;
  isReady: boolean;
  progress: number;
  currentStep: string;
  lastActivity: string;
  role: 'leader' | 'member';
  permissions: TeamPermissions;
}

export interface TeamPermissions {
  canInvite: boolean;
  canKick: boolean;
  canEditTeam: boolean;
  canStartBattle: boolean;
}

export interface TeamBattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface BattleRoom {
  id: string;
  name: string;
  problemId: string;
  problemTitle: string;
  battleType: 'individual' | 'team';
  status: 'waiting' | 'active' | 'finished' | 'paused';
  participants: BattleParticipant[];
  teams: Team[];
  maxParticipants: number;
  timeLimit: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  settings: BattleRoomSettings;
}

export interface BattleParticipant {
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  isReady: boolean;
  progress: number;
  currentStep: string;
  lastActivity: string;
  joinedAt: string;
  battleStats: ParticipantBattleStats;
}

export interface ParticipantBattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  rank: number;
  level: number;
  experience: number;
}

export interface BattleRoomSettings {
  allowTeamSwitching: boolean;
  allowSpectators: boolean;
  enableChat: boolean;
  enableVoiceChat: boolean;
  enableScreenShare: boolean;
  autoStartDelay: number;
  pauseOnDisconnect: boolean;
  maxDisconnectTime: number;
}

export interface TeamChatMessage {
  id: string;
  teamId: string;
  userId: string;
  username: string;
  message: string;
  messageType: 'text' | 'system' | 'announcement';
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: ChatReaction[];
}

export interface ChatReaction {
  emoji: string;
  userId: string;
  username: string;
  timestamp: string;
}

export interface BattleProgress {
  userId: string;
  username: string;
  teamId?: string;
  currentStep: string;
  progress: number;
  isReady: boolean;
  lastActivity: string;
  stepTimes: Record<string, number>;
  totalTime: number;
}

export interface BattleResult {
  id: string;
  battleId: string;
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  problemId: string;
  score: number;
  modelType: string;
  trainingTime: number;
  evaluationMetrics: Record<string, number>;
  submission: any;
  rank: number;
  submittedAt: string;
  isWinner: boolean;
  rewards: BattleReward[];
}

export interface BattleReward {
  type: 'experience' | 'points' | 'badge' | 'unlock';
  amount: number;
  description: string;
  icon: string;
}

export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  problemType: 'classification' | 'regression';
  dataset: OnlineDataset;
  startDate: string;
  endDate: string;
  isActive: boolean;
  timeLimit: number;
  maxSubmissions: number;
  constraints: ProblemConstraints;
  rewards: WeeklyProblemReward;
  statistics: ProblemStatistics;
}

export interface OnlineDataset {
  id: string;
  name: string;
  data: { features: number[]; label: number | string }[];
  raw: { features: number[]; label: number | string }[];
  featureNames: string[];
  featureUnits: string[];
  problemType: 'classification' | 'regression';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetName: string;
  targetUnit: string;
  classes?: string[];
  metadata: DatasetMetadata;
}

export interface DatasetMetadata {
  source: string;
  license: string;
  version: string;
  lastUpdated: string;
  size: number;
  features: FeatureInfo[];
}

export interface FeatureInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'text';
  description: string;
  range?: [number, number];
  categories?: string[];
}

export interface ProblemConstraints {
  maxFeatures: number;
  maxTrainingTime: number;
  maxSubmissions: number;
  allowedModels: string[];
  requiredPreprocessing: string[];
  forbiddenFeatures: string[];
}

export interface WeeklyProblemReward {
  experience: number;
  points: number;
  badges: string[];
  unlocks: string[];
}

export interface ProblemStatistics {
  totalParticipants: number;
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  completionRate: number;
  difficultyRating: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  score: number;
  modelType: string;
  submissionCount: number;
  bestScore: number;
  averageScore: number;
  lastSubmission: string;
  battleStats: ParticipantBattleStats;
  isOnline: boolean;
  isCurrentUser: boolean;
}

export interface BattleNotification {
  id: string;
  type: 'team_invite' | 'battle_start' | 'battle_end' | 'team_message' | 'achievement' | 'system';
  title: string;
  message: string;
  userId: string;
  teamId?: string;
  battleId?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actions: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  data: any;
}

export interface OnlineBattleState {
  currentRoom: BattleRoom | null;
  currentTeam: Team | null;
  participants: Map<string, BattleParticipant>;
  teamChatMessages: Map<string, TeamChatMessage[]>;
  globalChatMessages: TeamChatMessage[];
  leaderboard: LeaderboardEntry[];
  battleProgress: Map<string, BattleProgress>;
  notifications: BattleNotification[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastActivity: string;
}

