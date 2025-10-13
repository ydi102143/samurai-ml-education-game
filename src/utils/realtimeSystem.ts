// リアルタイム機能システム
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
  status: 'online' | 'offline' | 'training' | 'validating';
  currentStep: string;
  lastActivity: number;
}

export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
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
    // ローカルストレージからデータを読み込み
    this.loadFromStorage();
    
    // 定期的な更新を開始
    setInterval(() => {
      this.updateSystem();
    }, 1000);
    
    // 定期的にローカルストレージに保存
    setInterval(() => {
      this.saveToStorage();
    }, 5000);
  }

  // ローカルストレージからデータを読み込み
  private loadFromStorage() {
    try {
      const leaderboardData = localStorage.getItem('ml_battle_leaderboard');
      if (leaderboardData) {
        this.leaderboard = JSON.parse(leaderboardData);
      }
      
      const chatData = localStorage.getItem('ml_battle_chat');
      if (chatData) {
        this.chatMessages = JSON.parse(chatData);
      }
      
      const participantsData = localStorage.getItem('ml_battle_participants');
      if (participantsData) {
        this.participants = JSON.parse(participantsData);
      }
      
      const problemData = localStorage.getItem('ml_battle_current_problem');
      if (problemData) {
        const parsed = JSON.parse(problemData);
        this.currentProblem = {
          ...parsed,
          startTime: parsed.startTime,
          endTime: parsed.endTime
        };
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
      this.generateSampleData();
    }
  }

  // ローカルストレージにデータを保存
  private saveToStorage() {
    try {
      localStorage.setItem('ml_battle_leaderboard', JSON.stringify(this.leaderboard));
      localStorage.setItem('ml_battle_chat', JSON.stringify(this.chatMessages));
      localStorage.setItem('ml_battle_participants', JSON.stringify(this.participants));
      
      if (this.currentProblem) {
        localStorage.setItem('ml_battle_current_problem', JSON.stringify(this.currentProblem));
      }
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  // サンプルデータ生成
  private generateSampleData() {
    // 空の状態で開始
    this.leaderboard = [];
    this.chatMessages = [];
    this.participants = [];
    
    // 週次問題は動的に生成
    this.currentProblem = null;
  }

  // システム更新
  private updateSystem() {
    // 参加者のステータスをランダムに更新
    this.participants.forEach(participant => {
      if (participant.status === 'online' && Math.random() < 0.1) {
        const steps = ['data', 'eda', 'preprocessing', 'model_selection', 'training', 'validation', 'submission'];
        participant.currentStep = steps[Math.floor(Math.random() * steps.length)];
        participant.lastActivity = Date.now();
      }
    });

    // コールバックを実行
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

  // チャットメッセージ送信
  sendMessage(username: string, message: string): void {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      message,
      timestamp: Date.now(),
      type: 'user'
    };
    this.chatMessages.push(newMessage);
    
    // メッセージが多すぎる場合は古いものを削除
    if (this.chatMessages.length > 100) {
      this.chatMessages = this.chatMessages.slice(-100);
    }
    
    // 即座に保存
    this.saveToStorage();
  }

  // リーダーボードにスコアを追加
  addScore(username: string, score: number, accuracy: number, modelName: string): void {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      username,
      score,
      accuracy,
      modelName,
      timestamp: Date.now(),
      rank: 0 // 後で計算
    };

    this.leaderboard.push(newEntry);
    
    // スコアでソートしてランクを更新
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // 上位20位のみ保持
    if (this.leaderboard.length > 20) {
      this.leaderboard = this.leaderboard.slice(0, 20);
    }
    
    // 即座に保存
    this.saveToStorage();
  }

  // 参加者ステータス更新
  updateParticipantStatus(username: string, status: Participant['status'], currentStep: string): void {
    const participant = this.participants.find(p => p.username === username);
    if (participant) {
      participant.status = status;
      participant.currentStep = currentStep;
      participant.lastActivity = Date.now();
    } else {
      // 新しい参加者を追加
      this.participants.push({
        id: Date.now().toString(),
        username,
        status,
        currentStep,
        lastActivity: Date.now()
      });
    }
    
    // 即座に保存
    this.saveToStorage();
  }

  // 更新コールバック登録
  onUpdate(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  // 週次問題の残り時間取得
  getTimeRemaining(): number {
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
