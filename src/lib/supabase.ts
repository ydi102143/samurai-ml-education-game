import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseKey } from '../config/environment';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseKey();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'samurai-ai-game'
    }
  }
});

// エラーハンドリング用のラッパー関数
export const safeSupabaseCall = async <T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
