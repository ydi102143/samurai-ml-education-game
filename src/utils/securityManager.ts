/**
 * セキュリティ管理システム
 * 環境変数の検証とセキュアな設定管理
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private static readonly REQUIRED_ENV_VARS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  static getInstance(): SecurityManager {
    if (!this.instance) {
      this.instance = new SecurityManager();
    }
    return this.instance;
  }

  /**
   * 環境変数の検証
   */
  static validateEnvironment(): { isValid: boolean; missingVars: string[]; errors: string[] } {
    const missingVars: string[] = [];
    const errors: string[] = [];

    // 必須環境変数のチェック
    for (const varName of this.REQUIRED_ENV_VARS) {
      const value = import.meta.env[varName];
      if (!value) {
        missingVars.push(varName);
      }
    }

    // Supabase URLの形式チェック
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && !this.isValidSupabaseUrl(supabaseUrl)) {
      errors.push('VITE_SUPABASE_URLの形式が正しくありません');
    }

    // Supabase Keyの形式チェック
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseKey && !this.isValidSupabaseKey(supabaseKey)) {
      errors.push('VITE_SUPABASE_ANON_KEYの形式が正しくありません');
    }

    return {
      isValid: missingVars.length === 0 && errors.length === 0,
      missingVars,
      errors
    };
  }

  /**
   * セキュアなSupabase設定の取得
   */
  static getSecureSupabaseConfig(): { url: string; key: string } | null {
    const validation = this.validateEnvironment();
    
    if (!validation.isValid) {
      console.error('環境変数の検証に失敗しました:', validation);
      return null;
    }

    return {
      url: import.meta.env.VITE_SUPABASE_URL!,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY!
    };
  }

  /**
   * Supabase URLの形式検証
   */
  private static isValidSupabaseUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && 
             urlObj.hostname.includes('supabase.co') &&
             urlObj.pathname.includes('/rest/v1/');
    } catch {
      return false;
    }
  }

  /**
   * Supabase Keyの形式検証
   */
  private static isValidSupabaseKey(key: string): boolean {
    // JWT形式のチェック（基本的な形式のみ）
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return jwtPattern.test(key) && key.length > 100;
  }

  /**
   * セキュリティ警告の表示
   */
  static showSecurityWarning(): void {
    const validation = this.validateEnvironment();
    
    if (!validation.isValid) {
      console.warn('🚨 セキュリティ警告: 環境変数が正しく設定されていません');
      console.warn('不足している環境変数:', validation.missingVars);
      console.warn('エラー:', validation.errors);
      console.warn('本番環境では必ず適切な環境変数を設定してください');
    }
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
    if (import.meta.env.PROD) {
      const validation = this.validateEnvironment();
      
      if (!validation.isValid) {
        throw new Error('本番環境で環境変数が設定されていません。セキュリティ上の理由でアプリケーションを停止します。');
      }
    }
  }
}

export const securityManager = SecurityManager.getInstance();
