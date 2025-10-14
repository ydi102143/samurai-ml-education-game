// リアルタイム管理システム
export interface RealtimeEvent {
  id: string;
  type: 'submission' | 'leaderboard_update' | 'user_join' | 'user_leave' | 'problem_change';
  data: any;
  timestamp: number;
  userId?: string;
}

export interface RealtimeConfig {
  enableWebSocket: boolean;
  enablePolling: boolean;
  pollingInterval: number;
  maxRetries: number;
  retryDelay: number;
}

export class RealtimeManager {
  private events: RealtimeEvent[] = [];
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();
  private config: RealtimeConfig;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;

  constructor(config: RealtimeConfig = {
    enableWebSocket: false,
    enablePolling: true,
    pollingInterval: 5000,
    maxRetries: 3,
    retryDelay: 1000
  }) {
    this.config = config;
    
    if (this.config.enablePolling) {
      this.startPolling();
    }
  }

  // イベントを発行
  emitEvent(type: string, data: any, userId?: string): void {
    const event: RealtimeEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      userId
    };

    this.events.push(event);
    
    // 古いイベントを削除（最新1000件のみ保持）
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // リスナーに通知
    this.notifyListeners(type, event);
  }

  // イベントリスナーを追加
  addEventListener(type: string, listener: (event: RealtimeEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  // イベントリスナーを削除
  removeEventListener(type: string, listener: (event: RealtimeEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // リスナーに通知
  private notifyListeners(type: string, event: RealtimeEvent): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // ポーリングを開始
  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.performPolling();
    }, this.config.pollingInterval);
  }

  // ポーリングを実行
  private performPolling(): void {
    // 実際の実装では、サーバーからデータを取得
    // ここではシミュレーション
    this.simulateRealtimeUpdates();
  }

  // リアルタイム更新をシミュレート
  private simulateRealtimeUpdates(): void {
    // ランダムなイベントを生成
    const eventTypes = ['submission', 'leaderboard_update', 'user_join', 'user_leave'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    if (Math.random() < 0.1) { // 10%の確率でイベントを生成
      this.emitEvent(randomType, {
        message: `Simulated ${randomType} event`,
        timestamp: Date.now()
      });
    }
  }

  // 接続状態を取得
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 接続を開始
  connect(): void {
    this.isConnected = true;
    this.emitEvent('connection', { status: 'connected' });
  }

  // 接続を切断
  disconnect(): void {
    this.isConnected = false;
    this.emitEvent('connection', { status: 'disconnected' });
  }

  // イベント履歴を取得
  getEventHistory(type?: string): RealtimeEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type);
    }
    return [...this.events];
  }

  // 最新のイベントを取得
  getLatestEvents(count: number = 10): RealtimeEvent[] {
    return this.events.slice(-count);
  }

  // 統計情報を取得
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    isConnected: boolean;
    listenersCount: number;
  } {
    const eventsByType: Record<string, number> = {};
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const listenersCount = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.size, 0);

    return {
      totalEvents: this.events.length,
      eventsByType,
      isConnected: this.isConnected,
      listenersCount
    };
  }

  // 設定を更新
  updateConfig(newConfig: Partial<RealtimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enablePolling) {
      this.startPolling();
    } else if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // 設定を取得
  getConfig(): RealtimeConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.events = [];
    this.listeners.clear();
  }

  // 破棄
  destroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.listeners.clear();
    this.events = [];
  }
}

// シングルトンインスタンス
export const realtimeManager = new RealtimeManager();

