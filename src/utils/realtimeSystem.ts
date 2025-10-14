import { WeeklyProblem } from './weeklyProblemSystem';

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  accuracy: number;
  modelName: string;
  timestamp: number;
  rank: number;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'user' | 'system';
}

export interface Participant {
  id: string;
  username: string;
  status: 'online' | 'offline';
  currentStep: string;
  lastActivity: number;
}

export interface BattleChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  endTime: number;
  maxSubmissions: number;
  isActive: boolean;
}

export class RealtimeSystem {
  private leaderboard: LeaderboardEntry[] = [];
  private chatMessages: ChatMessage[] = [];
  private participants: Participant[] = [];
  private currentProblem: WeeklyProblem | null = null;
  private updateCallbacks: Set<() => void> = new Set();
  private userId: string = '';
  private playerName: string = '';

  constructor() {
    this.initializeUser();
    this.initializeSystem();
  }

  // ユーザー初期化
  private initializeUser() {
    this.userId = this.getOrCreateUserId();
    this.playerName = this.generatePlayerName();
    console.log('RealtimeSystem initialized - User:', this.playerName, 'ID:', this.userId);
  }

  // ユーザーIDを取得または生成
  private getOrCreateUserId(): string {
    const storageKey = 'ml_battle_user_id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, userId);
    }
    
    return userId;
  }

  // プレイヤー名を生成
  private generatePlayerName(): string {
    const adjectives = ['Swift', 'Bright', 'Sharp', 'Bold', 'Quick', 'Smart', 'Wise', 'Strong', 'Fast', 'Cool'];
    const nouns = ['Warrior', 'Ninja', 'Master', 'Expert', 'Wizard', 'Hero', 'Champion', 'Legend', 'Pro', 'Ace'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${noun}${number}`;
  }

  // システム初期化
  private initializeSystem() {
    this.loadFromStorage();
    this.startPeriodicUpdates();
    this.startCrossDeviceSync();
  }

  // ストレージからデータを読み込み
  private loadFromStorage() {
    try {
      const storedLeaderboard = localStorage.getItem('ml_battle_leaderboard');
      if (storedLeaderboard) {
        this.leaderboard = JSON.parse(storedLeaderboard);
      }

      const storedChat = localStorage.getItem('ml_battle_chat');
      if (storedChat) {
        this.chatMessages = JSON.parse(storedChat);
      }

      const storedParticipants = localStorage.getItem('ml_battle_participants');
      if (storedParticipants) {
        this.participants = JSON.parse(storedParticipants);
      }

      const storedProblem = localStorage.getItem('ml_battle_current_problem');
      if (storedProblem) {
        this.currentProblem = JSON.parse(storedProblem);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  // 定期的な更新を開始
  private startPeriodicUpdates() {
    // リーダーボード更新（30秒ごと）
    setInterval(() => {
      this.updateLeaderboard();
    }, 30000);

    // 参加者ステータス更新（10秒ごと）
    setInterval(() => {
      this.updateParticipantStatus();
    }, 10000);

    // チャット更新（5秒ごと）
    setInterval(() => {
      this.notifyUpdate();
    }, 5000);
  }

  // クロスデバイス同期を開始
  private startCrossDeviceSync() {
    // ストレージイベントリスナーを設定
    window.addEventListener('storage', (e) => {
      if (e.key === 'ml_battle_shared_data') {
        this.loadFromSharedStorage();
      }
    });

    // 定期的に共有ストレージをチェック（10秒ごと）
    setInterval(() => {
      this.syncWithSharedStorage();
    }, 10000);
  }

  // 共有ストレージからデータを読み込み
  private loadFromSharedStorage() {
    try {
      const sharedData = localStorage.getItem('ml_battle_shared_data');
      if (sharedData) {
        const data = JSON.parse(sharedData);
        const lastSync = this.getLastSyncTime();
        
        if (data.timestamp > lastSync) {
          this.leaderboard = data.leaderboard || this.leaderboard;
          this.chatMessages = data.chatMessages || this.chatMessages;
          this.participants = data.participants || this.participants;
          this.currentProblem = data.currentProblem || this.currentProblem;
          this.setLastSyncTime(data.timestamp);
          this.notifyUpdate();
        }
      }
    } catch (error) {
      console.error('Failed to load from shared storage:', error);
    }
  }

  // 共有ストレージにデータを同期
  private syncWithSharedStorage() {
    try {
      const sharedData = {
        leaderboard: this.leaderboard,
        chatMessages: this.chatMessages,
        participants: this.participants,
        currentProblem: this.currentProblem,
        timestamp: Date.now()
      };
      
      localStorage.setItem('ml_battle_shared_data', JSON.stringify(sharedData));
    } catch (error) {
      console.error('Failed to sync with shared storage:', error);
    }
  }

  // 最後の同期時刻を取得
  private getLastSyncTime(): number {
    const stored = localStorage.getItem('ml_battle_last_sync');
    return stored ? parseInt(stored, 10) : 0;
  }

  // 最後の同期時刻を設定
  private setLastSyncTime(timestamp: number) {
    localStorage.setItem('ml_battle_last_sync', timestamp.toString());
  }

  // 更新コールバックを追加
  addUpdateCallback(callback: () => void) {
    this.updateCallbacks.add(callback);
  }

  // 更新コールバックを削除
  removeUpdateCallback(callback: () => void) {
    this.updateCallbacks.delete(callback);
  }

  // 更新を通知
  private notifyUpdate() {
    this.updateCallbacks.forEach(callback => callback());
  }

  // リーダーボード取得
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  // チャットメッセージ取得
  getChatMessages(): ChatMessage[] {
    return [...this.chatMessages];
  }

  // 参加者取得
  getParticipants(): Participant[] {
    return [...this.participants];
  }

  // 現在の問題取得
  getCurrentProblem(): WeeklyProblem | null {
    return this.currentProblem;
  }

  // ユーザーID取得
  getUserId(): string {
    return this.userId;
  }

  // プレイヤー名取得
  getPlayerName(): string {
    return this.playerName;
  }

  // リーダーボードにスコアを追加
  addScore(score: number, accuracy: number, modelName: string) {
    const entry: LeaderboardEntry = {
      id: this.userId,
      username: this.playerName,
      score,
      accuracy,
      modelName,
      timestamp: Date.now(),
      rank: 0
    };

    // 既存のエントリを更新または追加
    const existingIndex = this.leaderboard.findIndex(e => e.id === this.userId);
    if (existingIndex >= 0) {
      this.leaderboard[existingIndex] = entry;
    } else {
      this.leaderboard.push(entry);
    }

    // スコアでソートしてランクを更新
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // 上位10位のみ保持
    this.leaderboard = this.leaderboard.slice(0, 10);

    // ストレージに保存
    localStorage.setItem('ml_battle_leaderboard', JSON.stringify(this.leaderboard));
    
    // 共有ストレージに同期
    this.syncWithSharedStorage();
    
    this.notifyUpdate();
  }

  // チャットメッセージを送信
  sendMessage(message: string) {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: this.playerName,
      message,
      timestamp: Date.now(),
      type: 'user'
    };

    this.chatMessages.push(chatMessage);
    
    // 最新50件のみ保持
    this.chatMessages = this.chatMessages.slice(-50);

    // ストレージに保存
    localStorage.setItem('ml_battle_chat', JSON.stringify(this.chatMessages));
    
    // 共有ストレージに同期
    this.syncWithSharedStorage();
    
    this.notifyUpdate();
  }

  // 参加者ステータスを更新
  updateParticipantStatus() {
    const participant: Participant = {
      id: this.userId,
      username: this.playerName,
      status: 'online',
      currentStep: 'battle',
      lastActivity: Date.now()
    };

    const existingIndex = this.participants.findIndex(p => p.id === this.userId);
    if (existingIndex >= 0) {
      this.participants[existingIndex] = participant;
    } else {
      this.participants.push(participant);
    }

    // 5分以上非アクティブな参加者を削除
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.participants = this.participants.filter(p => p.lastActivity > fiveMinutesAgo);

    // ストレージに保存
    localStorage.setItem('ml_battle_participants', JSON.stringify(this.participants));
    
    // 共有ストレージに同期
    this.syncWithSharedStorage();
  }

  // リーダーボードを更新
  private updateLeaderboard() {
    // ランダムな参加者をシミュレート
    if (this.participants.length > 0) {
      const randomParticipant = this.participants[Math.floor(Math.random() * this.participants.length)];
      if (randomParticipant.id !== this.userId) {
        const randomScore = Math.random() * 100;
        const randomAccuracy = Math.random() * 100;
        const models = ['ロジスティック回帰', 'ランダムフォレスト', 'SVM', 'XGBoost', 'ニューラルネットワーク'];
        const randomModel = models[Math.floor(Math.random() * models.length)];

        const entry: LeaderboardEntry = {
          id: randomParticipant.id,
          username: randomParticipant.username,
          score: randomScore,
          accuracy: randomAccuracy,
          modelName: randomModel,
          timestamp: Date.now(),
          rank: 0
        };

        const existingIndex = this.leaderboard.findIndex(e => e.id === randomParticipant.id);
        if (existingIndex >= 0) {
          this.leaderboard[existingIndex] = entry;
        } else {
          this.leaderboard.push(entry);
        }

        // スコアでソートしてランクを更新
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        // 上位10位のみ保持
        this.leaderboard = this.leaderboard.slice(0, 10);

        // ストレージに保存
        localStorage.setItem('ml_battle_leaderboard', JSON.stringify(this.leaderboard));
        
        // 共有ストレージに同期
        this.syncWithSharedStorage();
      }
    }
  }

  // 週次問題を設定
  setCurrentProblem(problem: WeeklyProblem) {
    this.currentProblem = problem;
    localStorage.setItem('ml_battle_current_problem', JSON.stringify(problem));
    
    // 共有ストレージに同期
    this.syncWithSharedStorage();
    
    this.notifyUpdate();
  }

  // 残り時間を取得
  getRemainingTime(): number {
    if (!this.currentProblem) return 0;
    return Math.max(0, this.currentProblem.endTime - Date.now());
  }

  // 週次問題の進捗率取得
  getProgressPercentage(): number {
    if (!this.currentProblem) return 0;
    const total = this.currentProblem.endTime - this.currentProblem.startTime;
    const elapsed = Date.now() - this.currentProblem.startTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }
}

// シングルトンインスタンス
export const realtimeSystem = new RealtimeSystem();
