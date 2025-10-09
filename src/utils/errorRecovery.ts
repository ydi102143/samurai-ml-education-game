/**
 * エラー回復システム
 * ネットワークエラー、データベースエラー、リアルタイム通信エラーの自動回復
 */
export class ErrorRecoverySystem {
  private static instance: ErrorRecoverySystem;
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAYS = [1000, 2000, 5000]; // 1秒、2秒、5秒

  static getInstance(): ErrorRecoverySystem {
    if (!this.instance) {
      this.instance = new ErrorRecoverySystem();
    }
    return this.instance;
  }

  /**
   * リトライ可能な操作を実行（強化版）
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    context?: string,
    maxRetries: number = this.MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;
    
    try {
      const result = await operation();
      
      // 成功時はリトライカウントをリセット
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      console.error(`操作失敗 (${operationId}):`, error);
      
      if (attempts < this.MAX_RETRY_ATTEMPTS) {
        const delay = this.RETRY_DELAYS[attempts] || 5000;
        console.log(`${delay}ms後にリトライします... (${attempts + 1}/${this.MAX_RETRY_ATTEMPTS})`);
        
        this.retryAttempts.set(operationId, attempts + 1);
        
        await this.delay(delay);
        return this.executeWithRetry(operation, operationId, context);
      } else {
        // 最大リトライ回数に達した場合
        this.retryAttempts.delete(operationId);
        throw new Error(`${operationId}が${this.MAX_RETRY_ATTEMPTS}回のリトライ後に失敗しました: ${(error as Error).message}`);
      }
    }
  }

  /**
   * ネットワークエラーの回復
   */
  async handleNetworkError(error: any, operation: () => Promise<any>): Promise<any> {
    if (this.isNetworkError(error)) {
      console.log('ネットワークエラーを検出、接続を再試行します...');
      
      // 接続状態をチェック
      await this.checkConnection();
      
      // 操作を再実行
      return operation();
    }
    throw error;
  }

  /**
   * データベースエラーの回復
   */
  async handleDatabaseError(error: any, operation: () => Promise<any>): Promise<any> {
    if (this.isDatabaseError(error)) {
      console.log('データベースエラーを検出、ローカルフォールバックを使用します...');
      
      // セキュリティエラーの場合は特別な処理
      if (error.message?.includes('Supabase設定が無効') || 
          error.message?.includes('環境変数が設定されていません')) {
        console.error('セキュリティエラー: 環境変数が正しく設定されていません');
        throw new Error('セキュリティ設定が不完全です。管理者にお問い合わせください。');
      }
      
      // ローカルストレージにフォールバック
      return this.fallbackToLocal(operation);
    }
    throw error;
  }

  /**
   * リアルタイム通信エラーの回復
   */
  async handleRealtimeError(error: any, operation: () => Promise<any>): Promise<any> {
    if (this.isRealtimeError(error)) {
      console.log('リアルタイム通信エラーを検出、ポーリングに切り替えます...');
      
      // ポーリングモードに切り替え
      return this.switchToPolling(operation);
    }
    throw error;
  }

  /**
   * エラータイプの判定
   */
  private isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('fetch') ||
           error?.message?.includes('network') ||
           error?.message?.includes('timeout');
  }

  private isDatabaseError(error: any): boolean {
    return error?.code === 'DB_ERROR' ||
           error?.message?.includes('database') ||
           error?.message?.includes('connection') ||
           error?.message?.includes('supabase');
  }

  private isRealtimeError(error: any): boolean {
    return error?.code === 'REALTIME_ERROR' ||
           error?.message?.includes('websocket') ||
           error?.message?.includes('realtime') ||
           error?.message?.includes('socket');
  }

  /**
   * 接続状態のチェック
   */
  private async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * ローカルフォールバック
   */
  private async fallbackToLocal(operation: () => Promise<any>): Promise<any> {
    try {
      // ローカルストレージからデータを取得
      const localData = localStorage.getItem('fallback_data');
      if (localData) {
        return JSON.parse(localData);
      }
      
      // デフォルト値を返す
      return { error: 'データベース接続に失敗し、ローカルデータも見つかりません' };
    } catch (error) {
      console.error('ローカルフォールバックエラー:', error);
      throw error;
    }
  }

  /**
   * ポーリングモードへの切り替え
   */
  private async switchToPolling(operation: () => Promise<any>): Promise<any> {
    // ポーリング間隔を設定（5秒）
    const pollInterval = 5000;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          if (this.isRealtimeError(error)) {
            // まだリアルタイムエラーの場合は再試行
            setTimeout(poll, pollInterval);
          } else {
            reject(error);
          }
        }
      };
      
      poll();
    });
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * エラー統計の取得
   */
  getErrorStats(): { operationId: string; attempts: number }[] {
    return Array.from(this.retryAttempts.entries()).map(([operationId, attempts]) => ({
      operationId,
      attempts
    }));
  }

  /**
   * リトライ状態のリセット
   */
  resetRetryState(operationId?: string) {
    if (operationId) {
      this.retryAttempts.delete(operationId);
    } else {
      this.retryAttempts.clear();
    }
  }
}

export const errorRecovery = ErrorRecoverySystem.getInstance();
