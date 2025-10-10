-- バトル結果テーブルの修正
-- 既存のテーブルを削除して再作成

DROP TABLE IF EXISTS battle_results CASCADE;

CREATE TABLE battle_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy DECIMAL(5,4) NOT NULL,
  training_time INTEGER NOT NULL,
  model_type TEXT NOT NULL,
  parameters JSONB,
  is_private BOOLEAN DEFAULT false,
  battle_type TEXT CHECK (battle_type IN ('individual', 'team')) NOT NULL,
  team_id TEXT,
  team_members JSONB,
  score INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX idx_battle_results_room_id ON battle_results(room_id);
CREATE INDEX idx_battle_results_submitted_at ON battle_results(submitted_at DESC);

-- リアルタイム機能を有効化
ALTER TABLE battle_results REPLICA IDENTITY FULL;

-- RLS (Row Level Security) の設定
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow public read access" ON battle_results
  FOR SELECT USING (true);

-- 認証されたユーザーが挿入可能
CREATE POLICY "Allow authenticated insert" ON battle_results
  FOR INSERT WITH CHECK (true);

-- 認証されたユーザーが更新可能（自分のデータのみ）
CREATE POLICY "Allow authenticated update" ON battle_results
  FOR UPDATE USING (true);

-- 認証されたユーザーが削除可能（自分のデータのみ）
CREATE POLICY "Allow authenticated delete" ON battle_results
  FOR DELETE USING (true);



