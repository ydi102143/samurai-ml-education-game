-- Supabase Realtime用のデータベーススキーマ
-- オンライン対戦のリアルタイム通信をサポート

-- バトルイベントテーブル
CREATE TABLE IF NOT EXISTS battle_events (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'join', 'leave', 'progress', 'battle_start', 'battle_end'
  status TEXT DEFAULT 'active', -- 'active', 'left', 'finished'
  progress INTEGER DEFAULT 0,
  current_step TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バトル結果テーブル
CREATE TABLE IF NOT EXISTS battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL,
  training_time INTEGER NOT NULL,
  model_type TEXT NOT NULL,
  parameters JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL, -- 'individual' or 'team'
  team_id TEXT,
  team_members TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リーダーボード用のビュー
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  user_id,
  username,
  COUNT(*) as total_battles,
  SUM(CASE WHEN accuracy > 0.8 THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN accuracy <= 0.8 THEN 1 ELSE 0 END) as losses,
  AVG(accuracy) as average_accuracy,
  MAX(accuracy) as best_accuracy,
  SUM(accuracy * 1000) as total_score,
  MAX(submitted_at) as last_battle_at,
  battle_type,
  team_id,
  team_members
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members;

-- リアルタイム更新のためのRLS設定
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み書き可能なポリシー（開発用）
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX IF NOT EXISTS idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX IF NOT EXISTS idx_battle_results_battle_type ON battle_results(battle_type);

-- リアルタイム更新の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_results;

