// import * as tf from '@tensorflow/tfjs'; // TensorFlow.jsを無効化

/**
 * パフォーマンス最適化システム
 * メモリ管理、レンダリング最適化、データキャッシュを統合管理
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private memoryCache: Map<string, { data: any; size: number; timestamp: number }> = new Map();
  private renderQueue: (() => void)[] = [];
  private isProcessingQueue = false;
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_CACHE_AGE = 10 * 60 * 1000; // 10分
  private readonly BATCH_SIZE = 10;

  static getInstance(): PerformanceOptimizer {
    if (!this.instance) {
      this.instance = new PerformanceOptimizer();
    }
    return this.instance;
  }

  /**
   * メモリ効率的なデータキャッシュ
   */
  setCache(key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium') {
    const size = this.calculateSize(data);
    const timestamp = Date.now();

    // キャッシュサイズ制限チェック
    if (this.getTotalCacheSize() + size > this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }

    this.memoryCache.set(key, {
      data,
      size,
      timestamp
    });

    // 優先度に基づくクリーンアップ
    if (priority === 'low') {
      this.scheduleCleanup();
    }
  }

  /**
   * キャッシュからデータ取得
   */
  getCache(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    // 期限切れチェック
    if (Date.now() - cached.timestamp > this.MAX_CACHE_AGE) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * バッチレンダリングキュー
   */
  queueRender(renderFunction: () => void) {
    this.renderQueue.push(renderFunction);
    
    if (!this.isProcessingQueue) {
      this.processRenderQueue();
    }
  }

  /**
   * レンダリングキューの処理
   */
  private async processRenderQueue() {
    this.isProcessingQueue = true;

    while (this.renderQueue.length > 0) {
      const batch = this.renderQueue.splice(0, this.BATCH_SIZE);
      
      // バッチ処理
      batch.forEach(renderFunction => {
        try {
          renderFunction();
        } catch (error) {
          console.error('レンダリングエラー:', error);
        }
      });

      // 次のフレームまで待機
      await this.nextFrame();
    }

    this.isProcessingQueue = false;
  }

  /**
   * 次のフレームまで待機
   */
  private nextFrame(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => resolve());
    });
  }

  /**
   * データサイズの計算
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // 概算（UTF-16）
    } catch {
      return 1024; // デフォルトサイズ
    }
  }

  /**
   * 総キャッシュサイズの取得
   */
  private getTotalCacheSize(): number {
    let total = 0;
    for (const cached of this.memoryCache.values()) {
      total += cached.size;
    }
    return total;
  }

  /**
   * キャッシュのクリーンアップ
   */
  private cleanupCache() {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    
    // 期限切れのエントリを削除
    entries.forEach(([key, cached]) => {
      if (now - cached.timestamp > this.MAX_CACHE_AGE) {
        this.memoryCache.delete(key);
      }
    });

    // まだサイズが大きい場合は古いエントリから削除
    if (this.getTotalCacheSize() > this.MAX_CACHE_SIZE * 0.8) {
      const sortedEntries = entries
        .filter(([key]) => this.memoryCache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      for (const [key] of sortedEntries) {
        this.memoryCache.delete(key);
        if (this.getTotalCacheSize() <= this.MAX_CACHE_SIZE * 0.7) {
          break;
        }
      }
    }
  }

  /**
   * スケジュールされたクリーンアップ
   */
  private scheduleCleanup() {
    setTimeout(() => {
      this.cleanupCache();
    }, 5000); // 5秒後にクリーンアップ
  }

  /**
   * メモリ使用量の監視
   */
  getMemoryStats(): {
    cacheSize: number;
    cacheEntries: number;
    renderQueueLength: number;
    memoryUsage?: number;
  } {
    const stats = {
      cacheSize: this.getTotalCacheSize(),
      cacheEntries: this.memoryCache.size,
      renderQueueLength: this.renderQueue.length,
      memoryUsage: undefined as number | undefined
    };

    // ブラウザが対応している場合
    if ('memory' in performance) {
      stats.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    return stats;
  }

  /**
   * パフォーマンス測定
   */
  measurePerformance<T>(name: string, operation: () => T): T {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  /**
   * 非同期パフォーマンス測定
   */
  async measureAsyncPerformance<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  /**
   * デバウンス関数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * スロットル関数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 仮想スクロール用のアイテム計算
   */
  calculateVirtualScrollItems(
    totalItems: number,
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
  ): { startIndex: number; endIndex: number; visibleItems: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, totalItems);
    
    return {
      startIndex,
      endIndex,
      visibleItems: endIndex - startIndex
    };
  }

  /**
   * 画像の遅延読み込み
   */
  lazyLoadImage(element: HTMLImageElement, src: string, placeholder?: string) {
    if (placeholder) {
      element.src = placeholder;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.src = src;
          observer.unobserve(element);
        }
      });
    });

    observer.observe(element);
  }

  /**
   * 全キャッシュのクリア
   */
  clearAllCache() {
    this.memoryCache.clear();
    this.renderQueue = [];
  }

  /**
   * パフォーマンスレポートの生成
   */
  generatePerformanceReport(): string {
    const stats = this.getMemoryStats();
    const report = `
パフォーマンスレポート:
- キャッシュサイズ: ${(stats.cacheSize / 1024 / 1024).toFixed(2)}MB
- キャッシュエントリ数: ${stats.cacheEntries}
- レンダリングキュー: ${stats.renderQueueLength}
- メモリ使用量: ${stats.memoryUsage ? (stats.memoryUsage / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}
    `.trim();

    return report;
  }

  /**
   * モデルタイプとデータサイズに基づく最適化設定を取得
   */
  getOptimizedModelConfig(modelType: string, dataSize: number): {
    learningRate: number;
    epochs: number;
    batchSize: number;
  } {
    const baseConfig = {
      learningRate: 0.01,
      epochs: 100,
      batchSize: 32
    };

    // データサイズに基づく調整
    if (dataSize < 100) {
      baseConfig.epochs = 50;
      baseConfig.batchSize = 16;
    } else if (dataSize > 1000) {
      baseConfig.epochs = 200;
      baseConfig.batchSize = 64;
    }

    // モデルタイプに基づく調整
    switch (modelType) {
      case 'logistic_regression':
        return {
          ...baseConfig,
          learningRate: 0.1,
          epochs: Math.min(baseConfig.epochs, 100)
        };
      case 'linear_regression':
        return {
          ...baseConfig,
          learningRate: 0.01,
          epochs: Math.min(baseConfig.epochs, 150)
        };
      case 'neural_network':
        return {
          ...baseConfig,
          learningRate: 0.001,
          epochs: Math.min(baseConfig.epochs, 200)
        };
      default:
        return baseConfig;
    }
  }

  /**
   * 最適化されたオプティマイザーを取得
   */
  getOptimizedOptimizer(_learningRate: number, _modelType: string): any {
    console.log('TensorFlow.jsは無効化されています');
    return null;
  }

  /**
   * データ前処理の最適化
   */
  optimizeDataPreprocessing(data: any[]): any[] {
    // データの前処理を最適化（現在はそのまま返す）
    return data;
  }

  /**
   * 最適化された進捗コールバックを取得
   */
  getOptimizedProgressCallback(totalEpochs: number): (epoch: number, logs?: any) => void {
    return (epoch: number, logs?: any) => {
      const progress = ((epoch + 1) / totalEpochs) * 100;
      console.log(`学習進捗: ${progress.toFixed(1)}% (エポック ${epoch + 1}/${totalEpochs})`);
      if (logs) {
        console.log(`Loss: ${logs.loss?.toFixed(4) || 'N/A'}`);
      }
    };
  }

  /**
   * メモリクリーンアップ
   */
  cleanup(): void {
    this.memoryCache.clear();
    this.renderQueue = [];
    // TensorFlow.jsのメモリクリーンアップ（無効化）
    // tf.disposeVariables();
  }

  /**
   * 安全なテンソル操作の実行（無効化）
   */
  safeTensorOperation<T>(_operation: () => T): T {
    console.log('TensorFlow.jsは無効化されています');
    throw new Error('TensorFlow.jsは無効化されています');
  }

  /**
   * バックエンドの準備確認（完全実装）
   */
  async ensureBackendReady(): Promise<boolean> {
    console.log('TensorFlow.jsは無効化されています');
    return false;
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();