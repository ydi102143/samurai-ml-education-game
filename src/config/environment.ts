// 環境設定管理
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  wsUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;
    
    return {
      isDevelopment,
      isProduction,
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://ovghanpxibparkuyxxdh.supabase.co',
      supabaseKey: import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
      logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || (isDevelopment ? 'debug' : 'info')
    };
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  get(key: keyof EnvironmentConfig): any {
    return this.config[key];
  }

  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  isProduction(): boolean {
    return this.config.isProduction;
  }

  isDebugMode(): boolean {
    return this.config.debugMode;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getWsUrl(): string {
    return this.config.wsUrl;
  }

  getSupabaseUrl(): string {
    return this.config.supabaseUrl;
  }

  getSupabaseKey(): string {
    return this.config.supabaseKey;
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }

  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.apiUrl) {
      errors.push('API URL is required');
    }

    if (!this.config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }

    if (!this.config.supabaseKey) {
      errors.push('Supabase Key is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// シングルトンインスタンス
export const environment = new EnvironmentManager();

// 便利な関数
export function isDevelopment(): boolean {
  return environment.isDevelopment();
}

export function isProduction(): boolean {
  return environment.isProduction();
}

export function isDebugMode(): boolean {
  return environment.isDebugMode();
}

export function getApiUrl(): string {
  return environment.getApiUrl();
}

export function getWsUrl(): string {
  return environment.getWsUrl();
}

export function getSupabaseUrl(): string {
  return environment.getSupabaseUrl();
}

export function getSupabaseKey(): string {
  return environment.getSupabaseKey();
}

export function getLogLevel(): string {
  return environment.getLogLevel();
}

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  return environment.validateConfig();
}

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  wsUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;
    
    return {
      isDevelopment,
      isProduction,
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://ovghanpxibparkuyxxdh.supabase.co',
      supabaseKey: import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
      logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || (isDevelopment ? 'debug' : 'info')
    };
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  get(key: keyof EnvironmentConfig): any {
    return this.config[key];
  }

  isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  isProduction(): boolean {
    return this.config.isProduction;
  }

  isDebugMode(): boolean {
    return this.config.debugMode;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getWsUrl(): string {
    return this.config.wsUrl;
  }

  getSupabaseUrl(): string {
    return this.config.supabaseUrl;
  }

  getSupabaseKey(): string {
    return this.config.supabaseKey;
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }

  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.apiUrl) {
      errors.push('API URL is required');
    }

    if (!this.config.supabaseUrl) {
      errors.push('Supabase URL is required');
    }

    if (!this.config.supabaseKey) {
      errors.push('Supabase Key is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// シングルトンインスタンス
export const environment = new EnvironmentManager();

// 便利な関数
export function isDevelopment(): boolean {
  return environment.isDevelopment();
}

export function isProduction(): boolean {
  return environment.isProduction();
}

export function isDebugMode(): boolean {
  return environment.isDebugMode();
}

export function getApiUrl(): string {
  return environment.getApiUrl();
}

export function getWsUrl(): string {
  return environment.getWsUrl();
}

export function getSupabaseUrl(): string {
  return environment.getSupabaseUrl();
}

export function getSupabaseKey(): string {
  return environment.getSupabaseKey();
}

export function getLogLevel(): string {
  return environment.getLogLevel();
}

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  return environment.validateConfig();
}


