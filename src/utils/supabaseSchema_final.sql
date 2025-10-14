-- オンライン対戦システム用の完全なデータベーススキーマ
-- 妥協なしの最終版

-- 既存のオブジェクトを安全に削除
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP POLICY IF EXISTS "Allow all operations" ON battle_events;
DROP POLICY IF EXISTS "Allow all operations" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations" ON battle_results;
DROP TABLE IF EXISTS battle_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS battle_results CASCADE;

-- バトルイベントテーブル（リアルタイム通信用）
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

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バトル結果テーブル（リーダーボード用）
CREATE TABLE battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  score REAL NOT NULL CHECK (score >= 0 AND score <= 100),
  training_time INTEGER NOT NULL CHECK (training_time >= 0),
  model_type TEXT NOT NULL CHECK (model_type IN ('logistic_regression', 'linear_regression', 'neural_network', 'knn')),
  parameters JSONB,
  preprocessing JSONB,
  selected_features INTEGER[],
  evaluation_metrics JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('individual', 'team')),
  team_id TEXT,
  team_members TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 週次問題管理テーブル
CREATE TABLE weekly_problems (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,
  problem_id TEXT NOT NULL,
  problem_data JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チーム管理テーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id TEXT NOT NULL,
  members TEXT[] NOT NULL,
  max_members INTEGER DEFAULT 4 CHECK (max_members > 0 AND max_members <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リーダーボード用のビュー（完全版）
CREATE VIEW leaderboard_view AS
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
  team_members,
  is_private,
  -- 追加の統計情報
  AVG(training_time) as avg_training_time,
  COUNT(DISTINCT problem_id) as problems_attempted,
  COUNT(DISTINCT model_type) as models_used
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members, is_private;

-- パフォーマンス統計用のビュー
CREATE VIEW performance_stats AS
SELECT 
  problem_id,
  model_type,
  COUNT(*) as total_submissions,
  AVG(accuracy) as avg_accuracy,
  AVG(training_time) as avg_training_time,
  MAX(accuracy) as best_accuracy,
  MIN(accuracy) as worst_accuracy,
  STDDEV(accuracy) as accuracy_stddev
FROM battle_results
GROUP BY problem_id, model_type;

-- インデックスの作成（パフォーマンス最適化）
CREATE INDEX idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX idx_battle_events_event_type ON battle_events(event_type);
CREATE INDEX idx_battle_events_created_at ON battle_events(created_at);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_battle_type ON battle_results(battle_type);
CREATE INDEX idx_battle_results_accuracy ON battle_results(accuracy DESC);
CREATE INDEX idx_battle_results_submitted_at ON battle_results(submitted_at DESC);
CREATE INDEX idx_battle_results_team_id ON battle_results(team_id);

CREATE INDEX idx_weekly_problems_week_number ON weekly_problems(week_number);
CREATE INDEX idx_weekly_problems_is_active ON weekly_problems(is_active);

CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- リアルタイム更新のためのRLS設定
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 開発用ポリシー（本番環境では適切なセキュリティポリシーに変更）
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON weekly_problems FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true);

-- リアルタイム更新の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_results;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_problems;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- トリガー関数（更新時刻の自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻トリガーの適用
CREATE TRIGGER update_battle_events_updated_at BEFORE UPDATE ON battle_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入（テスト用）
INSERT INTO weekly_problems (week_number, problem_id, problem_data, start_date, end_date) VALUES
(1, 'sample_problem_1', '{"title": "サンプル問題1", "description": "機械学習の基礎問題"}', NOW(), NOW() + INTERVAL '7 days'),
(2, 'sample_problem_2', '{"title": "サンプル問題2", "description": "高度な機械学習問題"}', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days');

-- 完了メッセージ
SELECT 'データベーススキーマの作成が完了しました。オンライン対戦システムが利用可能です。' as status;


-- 既存のオブジェクトを安全に削除
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP POLICY IF EXISTS "Allow all operations" ON battle_events;
DROP POLICY IF EXISTS "Allow all operations" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations" ON battle_results;
DROP TABLE IF EXISTS battle_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS battle_results CASCADE;

-- バトルイベントテーブル（リアルタイム通信用）
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

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バトル結果テーブル（リーダーボード用）
CREATE TABLE battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  score REAL NOT NULL CHECK (score >= 0 AND score <= 100),
  training_time INTEGER NOT NULL CHECK (training_time >= 0),
  model_type TEXT NOT NULL CHECK (model_type IN ('logistic_regression', 'linear_regression', 'neural_network', 'knn')),
  parameters JSONB,
  preprocessing JSONB,
  selected_features INTEGER[],
  evaluation_metrics JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('individual', 'team')),
  team_id TEXT,
  team_members TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 週次問題管理テーブル
CREATE TABLE weekly_problems (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,
  problem_id TEXT NOT NULL,
  problem_data JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チーム管理テーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id TEXT NOT NULL,
  members TEXT[] NOT NULL,
  max_members INTEGER DEFAULT 4 CHECK (max_members > 0 AND max_members <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リーダーボード用のビュー（完全版）
CREATE VIEW leaderboard_view AS
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
  team_members,
  is_private,
  -- 追加の統計情報
  AVG(training_time) as avg_training_time,
  COUNT(DISTINCT problem_id) as problems_attempted,
  COUNT(DISTINCT model_type) as models_used
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members, is_private;

-- パフォーマンス統計用のビュー
CREATE VIEW performance_stats AS
SELECT 
  problem_id,
  model_type,
  COUNT(*) as total_submissions,
  AVG(accuracy) as avg_accuracy,
  AVG(training_time) as avg_training_time,
  MAX(accuracy) as best_accuracy,
  MIN(accuracy) as worst_accuracy,
  STDDEV(accuracy) as accuracy_stddev
FROM battle_results
GROUP BY problem_id, model_type;

-- インデックスの作成（パフォーマンス最適化）
CREATE INDEX idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX idx_battle_events_event_type ON battle_events(event_type);
CREATE INDEX idx_battle_events_created_at ON battle_events(created_at);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_battle_type ON battle_results(battle_type);
CREATE INDEX idx_battle_results_accuracy ON battle_results(accuracy DESC);
CREATE INDEX idx_battle_results_submitted_at ON battle_results(submitted_at DESC);
CREATE INDEX idx_battle_results_team_id ON battle_results(team_id);

CREATE INDEX idx_weekly_problems_week_number ON weekly_problems(week_number);
CREATE INDEX idx_weekly_problems_is_active ON weekly_problems(is_active);

CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- リアルタイム更新のためのRLS設定
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 開発用ポリシー（本番環境では適切なセキュリティポリシーに変更）
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON weekly_problems FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true);

-- リアルタイム更新の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_results;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_problems;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- トリガー関数（更新時刻の自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻トリガーの適用
CREATE TRIGGER update_battle_events_updated_at BEFORE UPDATE ON battle_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入（テスト用）
INSERT INTO weekly_problems (week_number, problem_id, problem_data, start_date, end_date) VALUES
(1, 'sample_problem_1', '{"title": "サンプル問題1", "description": "機械学習の基礎問題"}', NOW(), NOW() + INTERVAL '7 days'),
(2, 'sample_problem_2', '{"title": "サンプル問題2", "description": "高度な機械学習問題"}', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days');

-- 完了メッセージ
SELECT 'データベーススキーマの作成が完了しました。オンライン対戦システムが利用可能です。' as status;

-- 既存のオブジェクトを安全に削除
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP POLICY IF EXISTS "Allow all operations" ON battle_events;
DROP POLICY IF EXISTS "Allow all operations" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations" ON battle_results;
DROP TABLE IF EXISTS battle_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS battle_results CASCADE;

-- バトルイベントテーブル（リアルタイム通信用）
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

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バトル結果テーブル（リーダーボード用）
CREATE TABLE battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  score REAL NOT NULL CHECK (score >= 0 AND score <= 100),
  training_time INTEGER NOT NULL CHECK (training_time >= 0),
  model_type TEXT NOT NULL CHECK (model_type IN ('logistic_regression', 'linear_regression', 'neural_network', 'knn')),
  parameters JSONB,
  preprocessing JSONB,
  selected_features INTEGER[],
  evaluation_metrics JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('individual', 'team')),
  team_id TEXT,
  team_members TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 週次問題管理テーブル
CREATE TABLE weekly_problems (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,
  problem_id TEXT NOT NULL,
  problem_data JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チーム管理テーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id TEXT NOT NULL,
  members TEXT[] NOT NULL,
  max_members INTEGER DEFAULT 4 CHECK (max_members > 0 AND max_members <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リーダーボード用のビュー（完全版）
CREATE VIEW leaderboard_view AS
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
  team_members,
  is_private,
  -- 追加の統計情報
  AVG(training_time) as avg_training_time,
  COUNT(DISTINCT problem_id) as problems_attempted,
  COUNT(DISTINCT model_type) as models_used
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members, is_private;

-- パフォーマンス統計用のビュー
CREATE VIEW performance_stats AS
SELECT 
  problem_id,
  model_type,
  COUNT(*) as total_submissions,
  AVG(accuracy) as avg_accuracy,
  AVG(training_time) as avg_training_time,
  MAX(accuracy) as best_accuracy,
  MIN(accuracy) as worst_accuracy,
  STDDEV(accuracy) as accuracy_stddev
FROM battle_results
GROUP BY problem_id, model_type;

-- インデックスの作成（パフォーマンス最適化）
CREATE INDEX idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX idx_battle_events_event_type ON battle_events(event_type);
CREATE INDEX idx_battle_events_created_at ON battle_events(created_at);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_battle_type ON battle_results(battle_type);
CREATE INDEX idx_battle_results_accuracy ON battle_results(accuracy DESC);
CREATE INDEX idx_battle_results_submitted_at ON battle_results(submitted_at DESC);
CREATE INDEX idx_battle_results_team_id ON battle_results(team_id);

CREATE INDEX idx_weekly_problems_week_number ON weekly_problems(week_number);
CREATE INDEX idx_weekly_problems_is_active ON weekly_problems(is_active);

CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- リアルタイム更新のためのRLS設定
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 開発用ポリシー（本番環境では適切なセキュリティポリシーに変更）
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON weekly_problems FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true);

-- リアルタイム更新の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_results;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_problems;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- トリガー関数（更新時刻の自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻トリガーの適用
CREATE TRIGGER update_battle_events_updated_at BEFORE UPDATE ON battle_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入（テスト用）
INSERT INTO weekly_problems (week_number, problem_id, problem_data, start_date, end_date) VALUES
(1, 'sample_problem_1', '{"title": "サンプル問題1", "description": "機械学習の基礎問題"}', NOW(), NOW() + INTERVAL '7 days'),
(2, 'sample_problem_2', '{"title": "サンプル問題2", "description": "高度な機械学習問題"}', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days');

-- 完了メッセージ
SELECT 'データベーススキーマの作成が完了しました。オンライン対戦システムが利用可能です。' as status;


-- 既存のオブジェクトを安全に削除
DROP VIEW IF EXISTS leaderboard_view CASCADE;
DROP POLICY IF EXISTS "Allow all operations" ON battle_events;
DROP POLICY IF EXISTS "Allow all operations" ON chat_messages;
DROP POLICY IF EXISTS "Allow all operations" ON battle_results;
DROP TABLE IF EXISTS battle_events CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS battle_results CASCADE;

-- バトルイベントテーブル（リアルタイム通信用）
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

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- バトル結果テーブル（リーダーボード用）
CREATE TABLE battle_results (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  score REAL NOT NULL CHECK (score >= 0 AND score <= 100),
  training_time INTEGER NOT NULL CHECK (training_time >= 0),
  model_type TEXT NOT NULL CHECK (model_type IN ('logistic_regression', 'linear_regression', 'neural_network', 'knn')),
  parameters JSONB,
  preprocessing JSONB,
  selected_features INTEGER[],
  evaluation_metrics JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('individual', 'team')),
  team_id TEXT,
  team_members TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 週次問題管理テーブル
CREATE TABLE weekly_problems (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,
  problem_id TEXT NOT NULL,
  problem_data JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チーム管理テーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id TEXT NOT NULL,
  members TEXT[] NOT NULL,
  max_members INTEGER DEFAULT 4 CHECK (max_members > 0 AND max_members <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リーダーボード用のビュー（完全版）
CREATE VIEW leaderboard_view AS
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
  team_members,
  is_private,
  -- 追加の統計情報
  AVG(training_time) as avg_training_time,
  COUNT(DISTINCT problem_id) as problems_attempted,
  COUNT(DISTINCT model_type) as models_used
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members, is_private;

-- パフォーマンス統計用のビュー
CREATE VIEW performance_stats AS
SELECT 
  problem_id,
  model_type,
  COUNT(*) as total_submissions,
  AVG(accuracy) as avg_accuracy,
  AVG(training_time) as avg_training_time,
  MAX(accuracy) as best_accuracy,
  MIN(accuracy) as worst_accuracy,
  STDDEV(accuracy) as accuracy_stddev
FROM battle_results
GROUP BY problem_id, model_type;

-- インデックスの作成（パフォーマンス最適化）
CREATE INDEX idx_battle_events_room_id ON battle_events(room_id);
CREATE INDEX idx_battle_events_user_id ON battle_events(user_id);
CREATE INDEX idx_battle_events_event_type ON battle_events(event_type);
CREATE INDEX idx_battle_events_created_at ON battle_events(created_at);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_battle_results_user_id ON battle_results(user_id);
CREATE INDEX idx_battle_results_problem_id ON battle_results(problem_id);
CREATE INDEX idx_battle_results_battle_type ON battle_results(battle_type);
CREATE INDEX idx_battle_results_accuracy ON battle_results(accuracy DESC);
CREATE INDEX idx_battle_results_submitted_at ON battle_results(submitted_at DESC);
CREATE INDEX idx_battle_results_team_id ON battle_results(team_id);

CREATE INDEX idx_weekly_problems_week_number ON weekly_problems(week_number);
CREATE INDEX idx_weekly_problems_is_active ON weekly_problems(is_active);

CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

-- リアルタイム更新のためのRLS設定
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 開発用ポリシー（本番環境では適切なセキュリティポリシーに変更）
CREATE POLICY "Allow all operations" ON battle_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON battle_results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON weekly_problems FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON teams FOR ALL USING (true);

-- リアルタイム更新の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_results;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_problems;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- トリガー関数（更新時刻の自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻トリガーの適用
CREATE TRIGGER update_battle_events_updated_at BEFORE UPDATE ON battle_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データの挿入（テスト用）
INSERT INTO weekly_problems (week_number, problem_id, problem_data, start_date, end_date) VALUES
(1, 'sample_problem_1', '{"title": "サンプル問題1", "description": "機械学習の基礎問題"}', NOW(), NOW() + INTERVAL '7 days'),
(2, 'sample_problem_2', '{"title": "サンプル問題2", "description": "高度な機械学習問題"}', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days');

-- 完了メッセージ
SELECT 'データベーススキーマの作成が完了しました。オンライン対戦システムが利用可能です。' as status;