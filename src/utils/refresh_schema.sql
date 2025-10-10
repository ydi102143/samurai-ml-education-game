-- SupabaseスキーマキャッシュをリフレッシュするSQL
-- このSQLをSupabaseのSQL Editorで実行してください

-- 1. 既存のテーブルを削除（データも含む）
DROP TABLE IF EXISTS battle_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS battle_results CASCADE;
DROP VIEW IF EXISTS leaderboard_view CASCADE;

-- 2. バトルイベントテーブル（リアルタイム通信用）
CREATE TABLE battle_events (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('join', 'leave', 'progress', 'battle_start', 'battle_end', 'model_trained', 'evaluation_complete')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'left', 'finished', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. チャットメッセージテーブル
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. バトル結果テーブル（リーダーボード用）- scoreカラムを含む
CREATE TABLE battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  score REAL NOT NULL CHECK (score >= 0 AND score <= 100), -- 重要: scoreカラム
  training_time INTEGER NOT NULL CHECK (training_time >= 0),
  model_type TEXT NOT NULL CHECK (model_type IN ('logistic_regression', 'linear_regression', 'neural_network', 'knn')),
  parameters JSONB,
  preprocessing JSONB,
  selected_features INTEGER[],
  evaluation_metrics JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('individual', 'team')),
  team_id TEXT,
  team_members JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. リーダーボードビュー
CREATE VIEW leaderboard_view AS
SELECT 
  problem_id,
  username,
  score,
  accuracy,
  training_time,
  model_type,
  created_at,
  ROW_NUMBER() OVER (PARTITION BY problem_id ORDER BY score DESC, training_time ASC) as rank
FROM battle_results
WHERE is_private = FALSE
ORDER BY problem_id, score DESC, training_time ASC;

-- 6. RLS（Row Level Security）ポリシー
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;

-- 全操作を許可するポリシー
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);

-- 7. インデックス作成
CREATE INDEX idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_score ON battle_results(score DESC);

-- 8. サンプルデータ挿入（テスト用）
INSERT INTO battle_results (room_id, user_id, username, problem_id, accuracy, score, training_time, model_type, parameters, selected_features, evaluation_metrics, battle_type) VALUES
('test_room_1', 'user_1', 'テストユーザー1', 'test_problem_1', 0.85, 85, 120, 'logistic_regression', '{"epochs": 100, "learningRate": 0.01}', '{0, 1, 2}', '{"accuracy": 0.85, "precision": 0.82, "recall": 0.88}', 'individual'),
('test_room_1', 'user_2', 'テストユーザー2', 'test_problem_1', 0.92, 92, 95, 'neural_network', '{"epochs": 150, "learningRate": 0.005}', '{0, 1, 2, 3}', '{"accuracy": 0.92, "precision": 0.90, "recall": 0.94}', 'individual');

-- 9. スキーマキャッシュをリフレッシュ
NOTIFY pgrst, 'reload schema';

