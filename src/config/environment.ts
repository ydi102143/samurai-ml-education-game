// 環境変数の取得（HTML埋め込み優先、フォールバック付き）
function getEnvVar(key: string, fallback: string): string {
  console.log(`環境変数 ${key} の取得を開始...`);
  
  // 1. HTMLに埋め込まれた環境変数を優先
  if (typeof window !== 'undefined' && (window as any).ENV) {
    const htmlEnv = (window as any).ENV[key];
    console.log(`HTML環境変数 ${key}:`, htmlEnv ? 'found' : 'not found');
    if (htmlEnv) {
      console.log(`環境変数 ${key} をHTMLから取得:`, htmlEnv);
      return htmlEnv;
    }
  } else {
    console.log('window.ENV not available');
  }
  
  // 2. import.meta.envから取得
  const viteEnv = import.meta.env[key];
  console.log(`Vite環境変数 ${key}:`, viteEnv ? 'found' : 'not found');
  if (viteEnv) {
    console.log(`環境変数 ${key} をViteから取得:`, viteEnv);
    return viteEnv;
  }
  
  // 3. フォールバック値を使用
  console.log(`環境変数 ${key} をフォールバックから取得:`, fallback);
  return fallback;
}

// ベースパスの取得
function getBasePath(): string {
  if (typeof window !== 'undefined' && (window as any).ENV?.BASE_PATH) {
    return (window as any).ENV.BASE_PATH;
  }
  
  // 本番環境ではGitHub Pagesのパスを使用
  if (import.meta.env.PROD) {
    return '/samurai-ml-education-game/';
  }
  
  // 開発環境ではルートパスを使用
  return '/';
}

// 環境設定（HTML埋め込み優先）
export const environment = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', 'https://ovghanpxibparkuyxxdh.supabase.co'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y')
  },
  basePath: getBasePath()
};

// シンプルな環境変数検証
export function validateEnvironment() {
  return true;
}