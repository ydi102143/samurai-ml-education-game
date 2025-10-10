// シンプルなオンライン対戦用のデータ構造

export interface SimpleTeam {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: SimpleTeamMember[];
  maxMembers: number;
  description: string;
  createdAt: string;
}

export interface SimpleTeamMember {
  userId: string;
  username: string;
  joinedAt: string;
  isReady: boolean;
  role: 'leader' | 'member';
}

export interface SimpleChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  teamId?: string;
  messageType: 'text' | 'system';
}

export interface SimpleBattleRoom {
  id: string;
  name: string;
  problemId: string;
  problemTitle: string;
  battleType: 'individual' | 'team';
  status: 'waiting' | 'active' | 'finished';
  participants: SimpleParticipant[];
  maxParticipants: number;
  timeLimit: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface SimpleParticipant {
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  isReady: boolean;
  progress: number;
  currentStep: string;
  lastActivity: string;
  joinedAt: string;
}

export interface SimpleBattleResult {
  id: string;
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  problemId: string;
  score: number;
  modelType: string;
  trainingTime: number;
  submittedAt: string;
  rank: number;
}

export interface SimpleLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  teamId?: string;
  teamName?: string;
  score: number;
  modelType: string;
  submittedAt: string;
  isCurrentUser: boolean;
}

export interface SimpleBattleState {
  currentRoom: SimpleBattleRoom | null;
  currentTeam: SimpleTeam | null;
  participants: SimpleParticipant[];
  chatMessages: SimpleChatMessage[];
  teamChatMessages: SimpleChatMessage[];
  leaderboard: SimpleLeaderboardEntry[];
  battleResults: SimpleBattleResult[];
  isConnected: boolean;
  lastActivity: string;
}

