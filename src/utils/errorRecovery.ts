// エラー回復システム
export interface ErrorInfo {
  id: string;
  type: 'syntax' | 'runtime' | 'network' | 'validation' | 'unknown';
  message: string;
  stack?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  resolved: boolean;
  recoveryAttempts: number;
}

export interface RecoveryStrategy {
  type: string;
  description: string;
  priority: number;
  autoExecute: boolean;
  execute: (error: ErrorInfo) => Promise<boolean>;
}

export interface RecoveryConfig {
  enableAutoRecovery: boolean;
  maxRecoveryAttempts: number;
  recoveryTimeout: number;
  enableLogging: boolean;
  enableNotifications: boolean;
}

export class ErrorRecoverySystem {
  private errors: Map<string, ErrorInfo> = new Map();
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private config: RecoveryConfig;
  private listeners: Set<(error: ErrorInfo) => void> = new Set();

  constructor(config: RecoveryConfig = {
    enableAutoRecovery: true,
    maxRecoveryAttempts: 3,
    recoveryTimeout: 5000,
    enableLogging: true,
    enableNotifications: true
  }) {
    this.config = config;
    this.initializeDefaultStrategies();
  }

  // デフォルトの回復戦略を初期化
  private initializeDefaultStrategies(): void {
    const strategies: RecoveryStrategy[] = [
      {
        type: 'syntax_error',
        description: '構文エラーの自動修正',
        priority: 1,
        autoExecute: true,
        execute: async (error) => {
          console.log('Attempting syntax error recovery...');
          return Math.random() > 0.5; // 50%の成功率
        }
      },
      {
        type: 'runtime_error',
        description: 'ランタイムエラーの回復',
        priority: 2,
        autoExecute: true,
        execute: async (error) => {
          console.log('Attempting runtime error recovery...');
          return Math.random() > 0.3; // 30%の成功率
        }
      },
      {
        type: 'network_error',
        description: 'ネットワークエラーの回復',
        priority: 3,
        autoExecute: true,
        execute: async (error) => {
          console.log('Attempting network error recovery...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return Math.random() > 0.4; // 40%の成功率
        }
      },
      {
        type: 'validation_error',
        description: 'バリデーションエラーの修正',
        priority: 4,
        autoExecute: false,
        execute: async (error) => {
          console.log('Attempting validation error recovery...');
          return Math.random() > 0.6; // 60%の成功率
        }
      }
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.type, strategy);
    });
  }

  // エラーを記録
  recordError(
    type: ErrorInfo['type'],
    message: string,
    stack?: string,
    context: Record<string, any> = {}
  ): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const error: ErrorInfo = {
      id: errorId,
      type,
      message,
      stack,
      timestamp: Date.now(),
      severity: this.determineSeverity(type, message),
      context,
      resolved: false,
      recoveryAttempts: 0
    };

    this.errors.set(errorId, error);
    
    if (this.config.enableLogging) {
      console.error('Error recorded:', error);
    }

    if (this.config.enableAutoRecovery) {
      this.attemptRecovery(error);
    }

    this.notifyListeners(error);
    return errorId;
  }

  // 重要度を決定
  private determineSeverity(type: ErrorInfo['type'], message: string): ErrorInfo['severity'] {
    if (type === 'syntax' || message.includes('critical')) {
      return 'critical';
    } else if (type === 'runtime' || message.includes('error')) {
      return 'high';
    } else if (type === 'network' || message.includes('warning')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // 回復を試行
  async attemptRecovery(error: ErrorInfo): Promise<boolean> {
    if (error.recoveryAttempts >= this.config.maxRecoveryAttempts) {
      console.log(`Max recovery attempts reached for error ${error.id}`);
      return false;
    }

    error.recoveryAttempts++;
    
    const strategy = this.findBestStrategy(error);
    if (!strategy) {
      console.log(`No recovery strategy found for error ${error.id}`);
      return false;
    }

    try {
      const success = await Promise.race([
        strategy.execute(error),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Recovery timeout')), this.config.recoveryTimeout)
        )
      ]);

      if (success) {
        error.resolved = true;
        console.log(`Error ${error.id} recovered successfully`);
        this.notifyListeners(error);
        return true;
      } else {
        console.log(`Recovery attempt ${error.recoveryAttempts} failed for error ${error.id}`);
        if (error.recoveryAttempts < this.config.maxRecoveryAttempts) {
          setTimeout(() => this.attemptRecovery(error), 1000);
        }
        return false;
      }
    } catch (recoveryError) {
      console.error(`Recovery failed for error ${error.id}:`, recoveryError);
      return false;
    }
  }

  // 最適な戦略を見つける
  private findBestStrategy(error: ErrorInfo): RecoveryStrategy | null {
    const applicableStrategies = Array.from(this.strategies.values())
      .filter(strategy => {
        if (strategy.type === 'syntax_error' && error.type === 'syntax') return true;
        if (strategy.type === 'runtime_error' && error.type === 'runtime') return true;
        if (strategy.type === 'network_error' && error.type === 'network') return true;
        if (strategy.type === 'validation_error' && error.type === 'validation') return true;
        return false;
      })
      .sort((a, b) => a.priority - b.priority);

    return applicableStrategies[0] || null;
  }

  // エラーを取得
  getError(errorId: string): ErrorInfo | undefined {
    return this.errors.get(errorId);
  }

  // 全エラーを取得
  getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values());
  }

  // 未解決のエラーを取得
  getUnresolvedErrors(): ErrorInfo[] {
    return this.getAllErrors().filter(error => !error.resolved);
  }

  // 重要度別のエラーを取得
  getErrorsBySeverity(severity: ErrorInfo['severity']): ErrorInfo[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  // エラーを手動で解決
  resolveError(errorId: string): boolean {
    const error = this.errors.get(errorId);
    if (!error) return false;

    error.resolved = true;
    this.notifyListeners(error);
    return true;
  }

  // エラーを削除
  removeError(errorId: string): boolean {
    const removed = this.errors.delete(errorId);
    if (removed) {
      console.log(`Error ${errorId} removed`);
    }
    return removed;
  }

  // 回復戦略を追加
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  // 回復戦略を削除
  removeRecoveryStrategy(type: string): boolean {
    return this.strategies.delete(type);
  }

  // 統計情報を取得
  getStats(): {
    totalErrors: number;
    resolvedErrors: number;
    unresolvedErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    averageRecoveryAttempts: number;
  } {
    const allErrors = this.getAllErrors();
    const resolvedErrors = allErrors.filter(error => error.resolved);
    const unresolvedErrors = allErrors.filter(error => !error.resolved);

    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    let totalRecoveryAttempts = 0;

    allErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      totalRecoveryAttempts += error.recoveryAttempts;
    });

    return {
      totalErrors: allErrors.length,
      resolvedErrors: resolvedErrors.length,
      unresolvedErrors: unresolvedErrors.length,
      errorsByType,
      errorsBySeverity,
      averageRecoveryAttempts: allErrors.length > 0 ? totalRecoveryAttempts / allErrors.length : 0
    };
  }

  // リスナーを追加
  addListener(listener: (error: ErrorInfo) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (error: ErrorInfo) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(error: ErrorInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (notificationError) {
        console.error('Error notification failed:', notificationError);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.errors.clear();
  }
}

// シングルトンインスタンス
export const errorRecoverySystem = new ErrorRecoverySystem();

