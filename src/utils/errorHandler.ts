// 統一エラーハンドリングシステム
export interface ErrorInfo {
  type: 'NETWORK_ERROR' | 'DATABASE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
}

export class ErrorHandler {
  static handleSupabaseError(error: any): ErrorInfo {
    console.error('Supabase Error:', error);
    
    if (error.code === 'PGRST116') {
      return {
        type: 'DATABASE_ERROR',
        message: 'Database connection failed',
        userMessage: 'データベース接続に失敗しました。オフラインモードで続行します。',
        recoverable: true,
        retryable: true
      };
    }
    
    if (error.code === 'PGRST301') {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Invalid data format',
        userMessage: 'データ形式が正しくありません。',
        recoverable: true,
        retryable: false
      };
    }
    
    return {
      type: 'DATABASE_ERROR',
      message: error.message || 'Unknown database error',
      userMessage: 'データベースエラーが発生しました。',
      recoverable: true,
      retryable: true
    };
  }
  
  static handleNetworkError(error: any): ErrorInfo {
    return {
      type: 'NETWORK_ERROR',
      message: error.message || 'Network connection failed',
      userMessage: 'ネットワーク接続を確認してください。',
      recoverable: true,
      retryable: true
    };
  }
  
  static handleValidationError(error: any): ErrorInfo {
    return {
      type: 'VALIDATION_ERROR',
      message: error.message || 'Validation failed',
      userMessage: '入力データに問題があります。',
      recoverable: true,
      retryable: false
    };
  }
  
  static handleUnknownError(error: any): ErrorInfo {
    console.error('Unknown Error:', error);
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      userMessage: '予期しないエラーが発生しました。',
      recoverable: false,
      retryable: false
    };
  }
  
  static getErrorInfo(error: any): ErrorInfo {
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return this.handleNetworkError(error);
    }
    
    if (error.code && error.code.startsWith('PGRST')) {
      return this.handleSupabaseError(error);
    }
    
    if (error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }
    
    return this.handleUnknownError(error);
  }
  
  static async recoverFromError(errorInfo: ErrorInfo): Promise<boolean> {
    if (!errorInfo.recoverable) {
      return false;
    }
    
    switch (errorInfo.type) {
      case 'NETWORK_ERROR':
        return this.switchToOfflineMode();
      case 'DATABASE_ERROR':
        return this.useLocalStorage();
      case 'VALIDATION_ERROR':
        return this.showUserFriendlyError(errorInfo);
      default:
        return false;
    }
  }
  
  private static async switchToOfflineMode(): Promise<boolean> {
    console.log('Switching to offline mode');
    // オフラインモードに切り替え
    return true;
  }
  
  private static async useLocalStorage(): Promise<boolean> {
    console.log('Using local storage fallback');
    // ローカルストレージを使用
    return true;
  }
  
  private static async showUserFriendlyError(errorInfo: ErrorInfo): Promise<boolean> {
    console.log('Showing user-friendly error:', errorInfo.userMessage);
    // ユーザーフレンドリーなエラー表示
    return true;
  }
}

