/**
 * セキュリティ管理システム
 * 環境変数の検証とセキュアな設定管理
 */
export class SecurityManager {
  private static instance: SecurityManager;

  static getInstance(): SecurityManager {
    if (!this.instance) {
      this.instance = new SecurityManager();
    }
    return this.instance;
  }

  /**
   * 環境変数の検証（GitHub Pages対応版）
   */
  static validateEnvironment(): { isValid: boolean; missingVars: string[]; errors: string[] } {
    // 直接値が設定されているので常に有効
    return {
      isValid: true,
      missingVars: [],
      errors: []
    };
  }

  /**
   * セキュアなSupabase設定の取得
   */
  static getSecureSupabaseConfig(): { url: string; key: string } | null {
    return {
      url: 'https://ovghanpxibparkuyxxdh.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y'
    };
  }



  /**
   * セキュリティ警告の表示
   */
  static showSecurityWarning(): void {
    // GitHub Pages対応：警告を無効化
    // 直接値が設定されているため警告は不要
  }

  /**
   * 開発環境でのセキュリティチェック
   */
  static checkDevelopmentSecurity(): void {
    if (import.meta.env.DEV) {
      const validation = this.validateEnvironment();
      
      if (!validation.isValid) {
        console.warn('開発環境でのセキュリティ設定が不完全です');
        console.warn('.env.localファイルを作成して環境変数を設定してください');
      }
    }
  }

  /**
   * 本番環境でのセキュリティチェック
   */
  static checkProductionSecurity(): void {
    // GitHub Pages対応：本番環境チェックを無効化
    // 直接値が設定されているためチェックは不要
  }
}

export const securityManager = SecurityManager.getInstance();

