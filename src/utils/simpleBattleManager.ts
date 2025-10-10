import { 
  SimpleBattleRoom, 
  SimpleParticipant, 
  SimpleBattleResult, 
  SimpleLeaderboardEntry,
  SimpleBattleState
} from '../types/simpleBattle';
import { userManager } from './userManager';
import { CompetitionSubmissionManager } from './competitionSubmission';

export class SimpleBattleManager {
  private static battleRooms: Map<string, SimpleBattleRoom> = new Map();
  private static battleStates: Map<string, SimpleBattleState> = new Map();
  private static battleResults: Map<string, SimpleBattleResult[]> = new Map();

  // バトルルーム作成
  static createBattleRoom(
    problemId: string,
    problemTitle: string,
    battleType: 'individual' | 'team',
    maxParticipants: number = 10,
    timeLimit: number = 3600
  ): SimpleBattleRoom {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const roomId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const battleRoom: SimpleBattleRoom = {
      id: roomId,
      name: `${problemTitle} - ${battleType === 'team' ? 'チーム戦' : '個人戦'}`,
      problemId,
      problemTitle,
      battleType,
      status: 'waiting',
      participants: [],
      maxParticipants,
      timeLimit,
      startTime: null,
      endTime: null,
      createdAt: now
    };

    this.battleRooms.set(roomId, battleRoom);
    this.battleStates.set(roomId, {
      currentRoom: battleRoom,
      currentTeam: null,
      participants: [],
      chatMessages: [],
      teamChatMessages: [],
      leaderboard: [],
      battleResults: [],
      isConnected: false,
      lastActivity: now
    });

    console.log('バトルルームを作成しました:', battleRoom);
    return battleRoom;
  }

  // バトルルーム参加
  static joinBattleRoom(roomId: string, teamId?: string): SimpleBattleRoom {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    if (room.status !== 'waiting') {
      throw new Error('バトルは既に開始されています');
    }

    if (room.participants.length >= room.maxParticipants) {
      throw new Error('バトルルームの定員に達しています');
    }

    // 既に参加しているかチェック
    if (room.participants.some(p => p.userId === user.id)) {
      throw new Error('既に参加しています');
    }

    const now = new Date().toISOString();
    let teamName: string | undefined;

    if (teamId) {
      // チーム名を取得（実際の実装ではチームマネージャーから取得）
      teamName = `チーム${teamId}`;
    }

    const participant: SimpleParticipant = {
      userId: user.id,
      username: user.username,
      teamId,
      teamName,
      isReady: false,
      progress: 0,
      currentStep: 'data',
      lastActivity: now,
      joinedAt: now
    };

    room.participants.push(participant);
    this.updateBattleState(roomId);

    console.log('バトルルームに参加しました:', participant);
    return room;
  }

  // バトルルーム脱退
  static leaveBattleRoom(roomId: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    const participantIndex = room.participants.findIndex(p => p.userId === user.id);
    if (participantIndex === -1) {
      throw new Error('参加していません');
    }

    room.participants.splice(participantIndex, 1);
    this.updateBattleState(roomId);

    console.log('バトルルームから脱退しました:', roomId);
  }

  // バトル開始
  static startBattle(roomId: string): SimpleBattleRoom {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    if (room.status !== 'waiting') {
      throw new Error('バトルは既に開始されています');
    }

    if (room.participants.length === 0) {
      throw new Error('参加者がいません');
    }

    const now = new Date().toISOString();
    room.status = 'active';
    room.startTime = now;
    room.endTime = new Date(Date.now() + room.timeLimit * 1000).toISOString();

    this.updateBattleState(roomId);

    console.log('バトルを開始しました:', room);
    return room;
  }

  // バトル終了
  static endBattle(roomId: string): SimpleBattleRoom {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    if (room.status !== 'active') {
      throw new Error('バトルは開始されていません');
    }

    const now = new Date().toISOString();
    room.status = 'finished';
    room.endTime = now;

    this.updateBattleState(roomId);

    console.log('バトルを終了しました:', room);
    return room;
  }

  // 進捗更新
  static updateProgress(roomId: string, userId: string, progress: number, currentStep: string): void {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    const participant = room.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('参加者が見つかりません');
    }

    const now = new Date().toISOString();
    participant.progress = progress;
    participant.currentStep = currentStep;
    participant.lastActivity = now;

    this.updateBattleState(roomId);
    console.log('進捗を更新しました:', { roomId, userId, progress, currentStep });
  }

  // 準備完了状態更新
  static updateReadyStatus(roomId: string, userId: string, isReady: boolean): void {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    const participant = room.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('参加者が見つかりません');
    }

    participant.isReady = isReady;
    this.updateBattleState(roomId);

    console.log('準備状態を更新しました:', { roomId, userId, isReady });
  }

  // バトル結果追加
  static addBattleResult(roomId: string, result: SimpleBattleResult): void {
    if (!this.battleResults.has(roomId)) {
      this.battleResults.set(roomId, []);
    }

    this.battleResults.get(roomId)!.push(result);
    this.updateBattleState(roomId);

    console.log('バトル結果を追加しました:', result);
  }

  // リーダーボード更新
  static async updateLeaderboard(roomId: string): Promise<SimpleLeaderboardEntry[]> {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    try {
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(room.problemId);
      const leaderboard: SimpleLeaderboardEntry[] = [];

      if (leaderboardData && leaderboardData.submissions) {
        leaderboardData.submissions.forEach((submission, index) => {
          const participant = room.participants.find(p => p.userId === submission.userId);
          leaderboard.push({
            rank: index + 1,
            userId: submission.userId,
            username: submission.username,
            teamId: participant?.teamId,
            teamName: participant?.teamName,
            score: submission.score || 0,
            modelType: submission.modelType || 'Unknown',
            submittedAt: submission.submittedAt.toISOString(),
            isCurrentUser: submission.userId === userManager.getCurrentUser()?.id
          });
        });
      }

      const battleState = this.battleStates.get(roomId);
      if (battleState) {
        battleState.leaderboard = leaderboard;
      }

      console.log('リーダーボードを更新しました:', leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
      return [];
    }
  }

  // バトル状態更新
  private static updateBattleState(roomId: string): void {
    const room = this.battleRooms.get(roomId);
    const battleState = this.battleStates.get(roomId);
    
    if (!room || !battleState) return;

    battleState.currentRoom = room;
    battleState.participants = [...room.participants];
    battleState.lastActivity = new Date().toISOString();
  }

  // バトルルーム取得
  static getBattleRoom(roomId: string): SimpleBattleRoom | null {
    return this.battleRooms.get(roomId) || null;
  }

  // バトル状態取得
  static getBattleState(roomId: string): SimpleBattleState | null {
    return this.battleStates.get(roomId) || null;
  }

  // 利用可能なバトルルーム一覧取得
  static getAvailableBattleRooms(): SimpleBattleRoom[] {
    return Array.from(this.battleRooms.values()).filter(room => 
      room.status === 'waiting' && room.participants.length < room.maxParticipants
    );
  }

  // ユーザーの参加中バトルルーム取得
  static getUserBattleRooms(userId: string): SimpleBattleRoom[] {
    return Array.from(this.battleRooms.values()).filter(room =>
      room.participants.some(p => p.userId === userId)
    );
  }

  // バトルルーム削除
  static deleteBattleRoom(roomId: string): void {
    this.battleRooms.delete(roomId);
    this.battleStates.delete(roomId);
    this.battleResults.delete(roomId);
    console.log('バトルルームを削除しました:', roomId);
  }

  // バトル統計取得
  static getBattleStatistics(roomId: string): {
    totalParticipants: number;
    readyParticipants: number;
    averageProgress: number;
    battleDuration: number;
  } {
    const room = this.battleRooms.get(roomId);
    if (!room) {
      throw new Error('バトルルームが見つかりません');
    }

    const totalParticipants = room.participants.length;
    const readyParticipants = room.participants.filter(p => p.isReady).length;
    const averageProgress = room.participants.reduce((sum, p) => sum + p.progress, 0) / totalParticipants;
    
    const battleDuration = room.startTime ? 
      Math.floor((Date.now() - new Date(room.startTime).getTime()) / 1000) : 0;

    return {
      totalParticipants,
      readyParticipants,
      averageProgress,
      battleDuration
    };
  }
}

