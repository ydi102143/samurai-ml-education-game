// セキュリティ管理システム
export interface SecurityConfig {
  maxSubmissionsPerHour: number;
  maxSubmissionsPerDay: number;
  suspiciousActivityThreshold: number;
  enableRateLimiting: boolean;
  enableAnomalyDetection: boolean;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'submission' | 'login' | 'suspicious_activity' | 'rate_limit_exceeded';
  timestamp: number;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RateLimitInfo {
  userId: string;
  submissionsLastHour: number;
  submissionsLastDay: number;
  lastSubmissionTime: number;
  isBlocked: boolean;
  blockUntil?: number;
}

export class SecurityManager {
  private config: SecurityConfig;
  private events: SecurityEvent[] = [];
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private suspiciousUsers: Set<string> = new Set();

  constructor(config: SecurityConfig = {
    maxSubmissionsPerHour: 10,
    maxSubmissionsPerDay: 50,
    suspiciousActivityThreshold: 5,
    enableRateLimiting: true,
    enableAnomalyDetection: true
  }) {
    this.config = config;
  }

  // 提出をチェック
  checkSubmission(userId: string): { allowed: boolean; reason?: string; blockUntil?: number } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true };
    }

    const rateLimit = this.getRateLimitInfo(userId);
    const now = Date.now();

    // ブロック中かチェック
    if (rateLimit.isBlocked && rateLimit.blockUntil && now < rateLimit.blockUntil) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded. Account temporarily blocked.',
        blockUntil: rateLimit.blockUntil
      };
    }

    // 時間制限をチェック
    if (rateLimit.submissionsLastHour >= this.config.maxSubmissionsPerHour) {
      this.blockUser(userId, 60 * 60 * 1000); // 1時間ブロック
      this.logEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'rate_limit_exceeded',
        timestamp: now,
        details: { submissionsLastHour: rateLimit.submissionsLastHour },
        severity: 'medium'
      });

      return {
        allowed: false,
        reason: 'Hourly submission limit exceeded.',
        blockUntil: now + 60 * 60 * 1000
      };
    }

    if (rateLimit.submissionsLastDay >= this.config.maxSubmissionsPerDay) {
      this.blockUser(userId, 24 * 60 * 60 * 1000); // 24時間ブロック
      this.logEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'rate_limit_exceeded',
        timestamp: now,
        details: { submissionsLastDay: rateLimit.submissionsLastDay },
        severity: 'high'
      });

      return {
        allowed: false,
        reason: 'Daily submission limit exceeded.',
        blockUntil: now + 24 * 60 * 60 * 1000
      };
    }

    return { allowed: true };
  }

  // 提出を記録
  recordSubmission(userId: string, submissionData: any): void {
    const rateLimit = this.getRateLimitInfo(userId);
    const now = Date.now();

    // 提出数を更新
    rateLimit.submissionsLastHour++;
    rateLimit.submissionsLastDay++;
    rateLimit.lastSubmissionTime = now;

    // 1時間前の提出を除外
    const oneHourAgo = now - 60 * 60 * 1000;
    if (rateLimit.lastSubmissionTime < oneHourAgo) {
      rateLimit.submissionsLastHour = 1;
    }

    // 24時間前の提出を除外
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    if (rateLimit.lastSubmissionTime < oneDayAgo) {
      rateLimit.submissionsLastDay = 1;
    }

    this.rateLimits.set(userId, rateLimit);

    // 異常検知
    if (this.config.enableAnomalyDetection) {
      this.detectAnomalies(userId, submissionData);
    }

    this.logEvent({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'submission',
      timestamp: now,
      details: submissionData,
      severity: 'low'
    });
  }


  // ユーザーをブロック
  private blockUser(userId: string, duration: number): void {
    const rateLimit = this.getRateLimitInfo(userId);
    rateLimit.isBlocked = true;
    rateLimit.blockUntil = Date.now() + duration;
    this.rateLimits.set(userId, rateLimit);
  }

  // 異常を検知
  private detectAnomalies(userId: string, submissionData: any): void {
    const rateLimit = this.getRateLimitInfo(userId);
    const now = Date.now();

    // 短時間での大量提出
    if (rateLimit.submissionsLastHour > this.config.suspiciousActivityThreshold) {
      this.suspiciousUsers.add(userId);
      this.logEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'suspicious_activity',
        timestamp: now,
        details: { 
          reason: 'High submission frequency',
          submissionsLastHour: rateLimit.submissionsLastHour
        },
        severity: 'high'
      });
    }

    // 異常なスコアパターン
    if (submissionData.score && submissionData.score > 99) {
      this.logEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'suspicious_activity',
        timestamp: now,
        details: { 
          reason: 'Unusually high score',
          score: submissionData.score
        },
        severity: 'medium'
      });
    }
  }

  // イベントをログ
  private logEvent(event: SecurityEvent): void {
    this.events.push(event);
    
    // 古いイベントを削除（最新1000件のみ保持）
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  // セキュリティイベントを取得
  getSecurityEvents(userId?: string): SecurityEvent[] {
    if (userId) {
      return this.events.filter(event => event.userId === userId);
    }
    return [...this.events];
  }

  // レート制限情報を取得
  getRateLimitInfo(userId: string): RateLimitInfo {
    if (!this.rateLimits.has(userId)) {
      this.rateLimits.set(userId, {
        userId,
        submissionsLastHour: 0,
        submissionsLastDay: 0,
        lastSubmissionTime: 0,
        isBlocked: false
      });
    }
    return this.rateLimits.get(userId)!;
  }

  // 疑わしいユーザーかチェック
  isSuspiciousUser(userId: string): boolean {
    return this.suspiciousUsers.has(userId);
  }

  // ユーザーのブロックを解除
  unblockUser(userId: string): void {
    const rateLimit = this.getRateLimitInfo(userId);
    rateLimit.isBlocked = false;
    rateLimit.blockUntil = undefined;
    this.rateLimits.set(userId, rateLimit);
  }

  // 統計情報を取得
  getSecurityStats(): {
    totalEvents: number;
    suspiciousUsers: number;
    blockedUsers: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    const blockedUsers = Array.from(this.rateLimits.values())
      .filter(rl => rl.isBlocked).length;

    return {
      totalEvents: this.events.length,
      suspiciousUsers: this.suspiciousUsers.size,
      blockedUsers,
      eventsByType,
      eventsBySeverity
    };
  }

  // 設定を更新
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // セキュリティ警告を表示
  static showSecurityWarning(): void {
    console.warn('🔒 セキュリティ警告: 本アプリケーションは教育目的で作成されています');
    console.warn('⚠️ 実際の本番環境では適切なセキュリティ対策を実装してください');
  }

  // 本番環境のセキュリティチェック
  static checkProductionSecurity(): void {
    if (typeof window !== 'undefined') {
      // ブラウザ環境でのセキュリティチェック
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.error('🚨 セキュリティエラー: HTTPS接続が必要です');
        throw new Error('HTTPS接続が必要です');
      }
    }
    
    // 環境変数のチェック
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.log('🔒 本番環境でのセキュリティチェック完了');
    }
  }
}

// シングルトンインスタンス
export const securityManager = new SecurityManager();


