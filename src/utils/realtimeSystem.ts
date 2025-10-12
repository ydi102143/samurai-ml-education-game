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

  constructor() {
    this.initializeSystem();
  }

  // システム初期化
  private initializeSystem() {
    // サンプルデータを生成
    this.generateSampleData();
    
    // 定期的な更新を開始
    setInterval(() => {
      this.updateSystem();
    }, 1000);
  }

  // サンプルデータ生成
  private generateSampleData() {
    // リーダーボードデータ
    this.leaderboard = [
      { id: '1', username: 'MLMaster', score: 95.2, accuracy: 0.952, modelName: 'Random Forest', timestamp: Date.now() - 300000, rank: 1 },
      { id: '2', username: 'DataNinja', score: 93.8, accuracy: 0.938, modelName: 'XGBoost', timestamp: Date.now() - 600000, rank: 2 },
      { id: '3', username: 'AIWarrior', score: 92.1, accuracy: 0.921, modelName: 'Neural Network', timestamp: Date.now() - 900000, rank: 3 },
      { id: '4', username: 'CodeSamurai', score: 90.5, accuracy: 0.905, modelName: 'SVM', timestamp: Date.now() - 1200000, rank: 4 },
      { id: '5', username: 'MLNinja', score: 89.3, accuracy: 0.893, modelName: 'Logistic Regression', timestamp: Date.now() - 1500000, rank: 5 }
    ];

    // チャットメッセージ
    this.chatMessages = [
      { id: '1', username: 'System', message: '新しい週次問題が開始されました！', timestamp: Date.now() - 1800000, type: 'system' },
      { id: '2', username: 'MLMaster', message: 'この問題、なかなか難しいですね', timestamp: Date.now() - 1200000, type: 'user' },
      { id: '3', username: 'DataNinja', message: '特徴量エンジニアリングが鍵になりそうです', timestamp: Date.now() - 900000, type: 'user' },
      { id: '4', username: 'AIWarrior', message: 'みんな頑張って！', timestamp: Date.now() - 600000, type: 'user' }
    ];

    // 参加者データ
    this.participants = [
      { id: '1', username: 'MLMaster', status: 'online', currentStep: 'validation', lastActivity: Date.now() - 30000 },
      { id: '2', username: 'DataNinja', status: 'training', currentStep: 'training', lastActivity: Date.now() - 10000 },
      { id: '3', username: 'AIWarrior', status: 'online', currentStep: 'model_selection', lastActivity: Date.now() - 60000 },
      { id: '4', username: 'CodeSamurai', status: 'offline', currentStep: 'data', lastActivity: Date.now() - 300000 },
      { id: '5', username: 'MLNinja', status: 'validating', currentStep: 'validation', lastActivity: Date.now() - 20000 }
    ];

    // 週次問題
    this.currentProblem = {
      id: 'weekly_1',
      title: '医療診断データセット',
      description: '患者の症状から病気を予測する分類問題です。',
      type: 'classification',
      startTime: Date.now() - 3600000, // 1時間前
      endTime: Date.now() + 6 * 24 * 3600000, // 6日後
      maxSubmissions: 10,
      isActive: true
    };
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
