// リアルタイム管理システム（日本標準時）

export interface RealtimeData {
  timestamp: string; // ISO形式の日本時間
  data: any;
  type: 'problem' | 'leaderboard' | 'submission' | 'user' | 'participant_update' | 'chat_message' | 'battle_start' | 'battle_end';
}

export interface ParticipantUpdate {
  userId: string;
  username: string;
  progress: number;
  currentStep: string;
  lastUpdate: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  roomId: string;
}

export interface ProblemStatus {
  id: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  timeRemaining: number; // 秒
  participants: number;
  submissions: number;
}

export class RealtimeManager {
  private static instance: RealtimeManager;
  private callbacks: Map<string, ((data: RealtimeData) => void)[]> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private currentProblem: ProblemStatus | null = null;

  private constructor() {
    this.startRealtimeUpdates();
  }

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  // 日本標準時を取得
  private getJSTTime(): Date {
    const now = new Date();
    const jstOffset = 9 * 60; // UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (jstOffset * 60000));
  }

  // 日本時間をISO形式で取得
  private getJSTISOString(): string {
    return this.getJSTTime().toISOString();
  }

  // リアルタイム更新を開始
  private startRealtimeUpdates(): void {
    this.intervalId = setInterval(() => {
      this.updateProblemStatus();
      this.broadcastUpdate('problem', this.currentProblem);
    }, 1000); // 1秒ごとに更新
  }

  // 問題の状態を更新
  private updateProblemStatus(): void {
    if (!this.currentProblem) {
      // デフォルトの問題を作成（1週間の期間）
      const now = this.getJSTTime();
      const startTime = new Date(now);
      const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7日後

      this.currentProblem = {
        id: 'weekly_problem_' + now.getFullYear() + '_' + (now.getMonth() + 1) + '_' + now.getDate(),
        isActive: true,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeRemaining: Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000)),
        participants: 0,
        submissions: 0
      };
    } else {
      // 時間を更新
      const now = this.getJSTTime();
      const endTime = new Date(this.currentProblem.endTime);
      this.currentProblem.timeRemaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      this.currentProblem.isActive = this.currentProblem.timeRemaining > 0;
    }
  }

  // 時間の残りをフォーマット
  formatTimeRemaining(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // 現在の問題状態を取得
  getCurrentProblem(): ProblemStatus | null {
    return this.currentProblem;
  }

  // 参加者数を更新
  updateParticipants(count: number): void {
    if (this.currentProblem) {
      this.currentProblem.participants = count;
      this.broadcastUpdate('problem', this.currentProblem);
    }
  }

  // 提出数を更新
  updateSubmissions(count: number): void {
    if (this.currentProblem) {
      this.currentProblem.submissions = count;
      this.broadcastUpdate('problem', this.currentProblem);
    }
  }

  // コールバックを登録
  subscribe(type: string, callback: (data: RealtimeData) => void): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);

    // アンサブスクライブ関数を返す
    return () => {
      const callbacks = this.callbacks.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // 更新をブロードキャスト
  private broadcastUpdate(type: string, data: any): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      const realtimeData: RealtimeData = {
        timestamp: this.getJSTISOString(),
        data,
        type: type as any
      };
      callbacks.forEach(callback => callback(realtimeData));
    }
  }

  // 手動で更新をブロードキャスト
  broadcast(type: string, data: any): void {
    this.broadcastUpdate(type, data);
  }

  // イベントリスナー管理
  on(event: string, callback: (data: any) => void): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 接続管理
  connect(userId: string, roomId: string): void {
    console.log('リアルタイム接続開始:', { userId, roomId });
    // シミュレートされた接続
    setTimeout(() => {
      this.broadcastUpdate('connected', { userId, roomId });
    }, 100);
  }

  disconnect(): void {
    console.log('リアルタイム接続切断');
    this.broadcastUpdate('disconnected', {});
  }

  // ルーム管理
  joinRoom(roomId: string, userId: string, username: string): void {
    console.log('ルーム参加:', { roomId, userId, username });
    this.broadcastUpdate('participant_update', {
      userId,
      username,
      progress: 0,
      currentStep: 'data',
      lastUpdate: this.getJSTISOString()
    });
  }

  leaveRoom(): void {
    console.log('ルーム退出');
  }

  // 進捗送信
  sendProgress(progress: number, currentStep: string): void {
    this.broadcastUpdate('participant_update', {
      userId: 'current_user',
      username: 'Current User',
      progress,
      currentStep,
      lastUpdate: this.getJSTISOString()
    });
  }

  // チャットメッセージ送信
  sendMessage(message: string): void {
    this.broadcastUpdate('chat_message', {
      id: `msg_${Date.now()}`,
      userId: 'current_user',
      username: 'Current User',
      message,
      timestamp: this.getJSTISOString(),
      roomId: 'current_room'
    });
  }

  // バトル管理
  startBattle(roomId: string): void {
    console.log('バトル開始:', roomId);
    this.broadcastUpdate('battle_start', { roomId });
  }

  endBattle(roomId: string, result: any): void {
    console.log('バトル終了:', { roomId, result });
    this.broadcastUpdate('battle_end', { roomId, result });
  }

  // リソースをクリーンアップ
  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const realtimeManager = RealtimeManager.getInstance();