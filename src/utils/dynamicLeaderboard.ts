// 動的リーダーボード管理システム
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  modelName: string;
  submittedAt: Date;
  isCurrentUser: boolean;
}

export interface LeaderboardStats {
  totalEntries: number;
  averageScore: number;
  bestScore: number;
  entriesByModel: Record<string, number>;
  lastUpdated: Date;
}

export interface LeaderboardConfig {
  maxEntries: number;
  updateInterval: number;
  enableRealTimeUpdates: boolean;
  sortBy: 'score' | 'accuracy' | 'submittedAt';
  sortOrder: 'asc' | 'desc';
}

export class DynamicLeaderboard {
  private entries: LeaderboardEntry[] = [];
  private config: LeaderboardConfig;
  private updateCallbacks: Set<() => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: LeaderboardConfig = {
    maxEntries: 100,
    updateInterval: 5000,
    enableRealTimeUpdates: true,
    sortBy: 'score',
    sortOrder: 'desc'
  }) {
    this.config = config;
    
    if (this.config.enableRealTimeUpdates) {
      this.startUpdateLoop();
    }
  }

  // エントリを追加
  addEntry(entry: Omit<LeaderboardEntry, 'rank'>): void {
    // 既存のエントリを更新または追加
    const existingIndex = this.entries.findIndex(e => e.userId === entry.userId);
    
    if (existingIndex >= 0) {
      this.entries[existingIndex] = { ...entry, rank: 0 };
    } else {
      this.entries.push({ ...entry, rank: 0 });
    }

    // ソートしてランクを更新
    this.sortAndUpdateRanks();
    
    // 最大エントリ数を超える場合は古いエントリを削除
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(0, this.config.maxEntries);
    }

    this.notifyUpdate();
  }

  // エントリを更新
  updateEntry(userId: string, updates: Partial<LeaderboardEntry>): boolean {
    const index = this.entries.findIndex(e => e.userId === userId);
    if (index === -1) return false;

    this.entries[index] = { ...this.entries[index], ...updates };
    this.sortAndUpdateRanks();
    this.notifyUpdate();
    return true;
  }

  // エントリを削除
  removeEntry(userId: string): boolean {
    const index = this.entries.findIndex(e => e.userId === userId);
    if (index === -1) return false;

    this.entries.splice(index, 1);
    this.sortAndUpdateRanks();
    this.notifyUpdate();
    return true;
  }

  // ソートしてランクを更新
  private sortAndUpdateRanks(): void {
    // ソート
    this.entries.sort((a, b) => {
      let comparison = 0;
      
      switch (this.config.sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'accuracy':
          comparison = a.accuracy - b.accuracy;
          break;
        case 'submittedAt':
          comparison = a.submittedAt.getTime() - b.submittedAt.getTime();
          break;
      }
      
      return this.config.sortOrder === 'desc' ? -comparison : comparison;
    });

    // ランクを更新
    this.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  // リーダーボードを取得
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.entries];
  }

  // 特定のユーザーのエントリを取得
  getUserEntry(userId: string): LeaderboardEntry | undefined {
    return this.entries.find(e => e.userId === userId);
  }

  // 上位N位を取得
  getTopEntries(count: number): LeaderboardEntry[] {
    return this.entries.slice(0, count);
  }

  // 統計情報を取得
  getStats(): LeaderboardStats {
    const totalEntries = this.entries.length;
    const averageScore = totalEntries > 0
      ? this.entries.reduce((sum, entry) => sum + entry.score, 0) / totalEntries
      : 0;
    const bestScore = totalEntries > 0
      ? Math.max(...this.entries.map(entry => entry.score))
      : 0;

    const entriesByModel: Record<string, number> = {};
    this.entries.forEach(entry => {
      entriesByModel[entry.modelName] = (entriesByModel[entry.modelName] || 0) + 1;
    });

    return {
      totalEntries,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      entriesByModel,
      lastUpdated: new Date()
    };
  }

  // 更新コールバックを追加
  addUpdateCallback(callback: () => void): void {
    this.updateCallbacks.add(callback);
  }

  // 更新コールバックを削除
  removeUpdateCallback(callback: () => void): void {
    this.updateCallbacks.delete(callback);
  }

  // 更新を通知
  private notifyUpdate(): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Update callback error:', error);
      }
    });
  }

  // 更新ループを開始
  private startUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.performPeriodicUpdate();
    }, this.config.updateInterval);
  }

  // 定期的な更新を実行
  private performPeriodicUpdate(): void {
    // 古いエントリを削除（24時間以上前）
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.entries = this.entries.filter(entry => 
      entry.submittedAt.getTime() > oneDayAgo
    );

    // ソートしてランクを更新
    this.sortAndUpdateRanks();
    
    this.notifyUpdate();
  }

  // 設定を更新
  updateConfig(newConfig: Partial<LeaderboardConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 更新ループを再開
    if (this.config.enableRealTimeUpdates) {
      this.startUpdateLoop();
    } else if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // 設定を取得
  getConfig(): LeaderboardConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.entries = [];
    this.notifyUpdate();
  }

  // データをエクスポート
  exportData(): string {
    return JSON.stringify({
      entries: this.entries,
      config: this.config
    });
  }

  // データをインポート
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.entries) {
        this.entries = parsed.entries;
        this.sortAndUpdateRanks();
      }
      
      if (parsed.config) {
        this.config = { ...this.config, ...parsed.config };
      }
      
      this.notifyUpdate();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 破棄
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.updateCallbacks.clear();
  }
}

// シングルトンインスタンス
export const dynamicLeaderboard = new DynamicLeaderboard();

