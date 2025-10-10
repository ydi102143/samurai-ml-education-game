import { createClient } from '@supabase/supabase-js';

// 直接APIキーを設定（デバッグ用）
const supabaseUrl = 'https://ovghanpxibparkuyxxdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y';

console.log('lib/supabase.ts: Creating Supabase client with direct keys');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

// シンプルなSupabaseクライアント作成
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
