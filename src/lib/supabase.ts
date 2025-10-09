import { createClient } from '@supabase/supabase-js';
import { environment, validateEnvironment } from '../config/environment';

// 環境変数の検証
const isEnvironmentValid = validateEnvironment();

// Supabaseクライアントの作成
const supabaseUrl = environment.supabase.url;
const supabaseAnonKey = environment.supabase.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 環境変数が無効な場合の警告
if (!isEnvironmentValid) {
  console.warn('Supabase環境変数が正しく設定されていません。オンライン機能が動作しない可能性があります。');
}
