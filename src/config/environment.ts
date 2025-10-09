// 環境変数の設定（セキュア版）
export const environment = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'production'
  }
};

// 環境変数の検証（セキュア版）
export function validateEnvironment() {
  const errors: string[] = [];
  
  if (!environment.supabase.url) {
    errors.push('VITE_SUPABASE_URL が設定されていません');
  }
  
  if (!environment.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY が設定されていません');
  }
  
  if (errors.length > 0) {
    console.error('🚨 セキュリティエラー: 環境変数が設定されていません:', errors);
    console.error('本番環境では必ず適切な環境変数を設定してください');
    return false;
  }
  
  return true;
}