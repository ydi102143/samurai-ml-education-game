/*
  # samurAI Database Schema

  ## 概要
  中学生向け機械学習教育ゲーム「samurAI」のデータベーススキーマ。
  戦国時代を舞台に、各地域のML課題を解決して天下統一を目指す。

  ## 新規テーブル

  ### 1. regions (地域マスタ)
  - `id` (text, primary key) - 地域ID（例: kyoto, sakai）
  - `name` (text) - 地域名（例: 京都、堺）
  - `daimyo` (text) - 大名名
  - `description` (text) - 歴史的背景説明
  - `problem_type` (text) - ML問題タイプ（classification, regression, clustering）
  - `problem_description` (text) - 課題説明
  - `required_accuracy` (decimal) - クリアに必要な精度（0-1）
  - `unlock_condition` (text) - 解放条件（前の地域ID、nullの場合は初期解放）
  - `difficulty` (integer) - 難易度（1-10）
  - `reward_xp` (integer) - クリア時の経験値
  - `order_index` (integer) - 表示順序
  - `dataset_info` (jsonb) - データセット情報（特徴量、ラベルなど）
  - `created_at` (timestamptz)

  ### 2. user_profiles (ユーザープロフィール)
  - `id` (uuid, primary key)
  - `shogun_name` (text) - 将軍名
  - `level` (integer) - レベル
  - `total_xp` (integer) - 総経験値
  - `title` (text) - 称号（足軽、侍、武将、大名、将軍）
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. user_region_progress (地域進捗)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `region_id` (text, foreign key)
  - `is_unlocked` (boolean) - 解放済みか
  - `is_completed` (boolean) - 完了済みか
  - `best_accuracy` (decimal) - 最高精度
  - `stars` (integer) - 獲得星数（0-3）
  - `attempts` (integer) - 試行回数
  - `first_completed_at` (timestamptz)
  - `last_attempt_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. challenge_attempts (チャレンジ試行履歴)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `region_id` (text, foreign key)
  - `model_type` (text) - 使用モデル（logistic_regression, decision_tree等）
  - `parameters` (jsonb) - モデルパラメータ
  - `accuracy` (decimal) - 達成精度
  - `precision` (decimal) - 適合率
  - `recall` (decimal) - 再現率
  - `f1_score` (decimal) - F1スコア
  - `training_time` (integer) - 訓練時間（秒）
  - `created_at` (timestamptz)

  ### 5. ml_models (MLモデルマスタ)
  - `id` (text, primary key)
  - `name` (text) - モデル名
  - `name_ja` (text) - 日本語名
  - `description` (text) - 説明
  - `category` (text) - カテゴリ（classification, regression, clustering）
  - `unlock_level` (integer) - 解放レベル
  - `icon` (text) - アイコン名
  - `parameters_schema` (jsonb) - パラメータ定義
  - `created_at` (timestamptz)

  ### 6. user_model_collection (ユーザーモデルコレクション)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `model_id` (text, foreign key)
  - `is_unlocked` (boolean) - 解放済みか
  - `usage_count` (integer) - 使用回数
  - `proficiency` (integer) - 習熟度（0-100）
  - `unlocked_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 7. achievements (実績マスタ)
  - `id` (text, primary key)
  - `name` (text) - 実績名
  - `description` (text) - 説明
  - `icon` (text) - アイコン
  - `condition_type` (text) - 条件タイプ
  - `condition_value` (jsonb) - 条件値
  - `reward_xp` (integer) - 報酬経験値
  - `created_at` (timestamptz)

  ### 8. user_achievements (ユーザー実績)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `achievement_id` (text, foreign key)
  - `earned_at` (timestamptz)

  ## セキュリティ
  - すべてのテーブルでRLSを有効化
  - ユーザーは自分のデータのみアクセス可能
  - マスタデータは全ユーザーが読み取り可能
*/

-- 地域マスタテーブル
CREATE TABLE IF NOT EXISTS regions (
  id text PRIMARY KEY,
  name text NOT NULL,
  daimyo text NOT NULL,
  description text NOT NULL,
  problem_type text NOT NULL,
  problem_description text NOT NULL,
  required_accuracy decimal NOT NULL DEFAULT 0.8,
  unlock_condition text,
  difficulty integer NOT NULL DEFAULT 1,
  reward_xp integer NOT NULL DEFAULT 100,
  order_index integer NOT NULL,
  dataset_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can read regions"
  ON regions FOR SELECT
  TO authenticated, anon
  USING (true);

-- ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shogun_name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '足軽',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 地域進捗テーブル
CREATE TABLE IF NOT EXISTS user_region_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  region_id text NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  is_unlocked boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  best_accuracy decimal DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  first_completed_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, region_id)
);

ALTER TABLE user_region_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_region_progress FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own progress"
  ON user_region_progress FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own progress"
  ON user_region_progress FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- チャレンジ試行履歴テーブル
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  region_id text NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  model_type text NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  accuracy decimal NOT NULL,
  precision decimal,
  recall decimal,
  f1_score decimal,
  training_time integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts"
  ON challenge_attempts FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own attempts"
  ON challenge_attempts FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- MLモデルマスタテーブル
CREATE TABLE IF NOT EXISTS ml_models (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ja text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  unlock_level integer NOT NULL DEFAULT 1,
  icon text NOT NULL,
  parameters_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can read ml_models"
  ON ml_models FOR SELECT
  TO authenticated, anon
  USING (true);

-- ユーザーモデルコレクションテーブル
CREATE TABLE IF NOT EXISTS user_model_collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  model_id text NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
  is_unlocked boolean NOT NULL DEFAULT false,
  usage_count integer NOT NULL DEFAULT 0,
  proficiency integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, model_id)
);

ALTER TABLE user_model_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own model collection"
  ON user_model_collection FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own model collection"
  ON user_model_collection FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own model collection"
  ON user_model_collection FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- 実績マスタテーブル
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL,
  condition_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_xp integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can read achievements"
  ON achievements FOR SELECT
  TO authenticated, anon
  USING (true);

-- ユーザー実績テーブル
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_region_progress_user_id ON user_region_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_region_progress_region_id ON user_region_progress(region_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_id ON challenge_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_region_id ON challenge_attempts(region_id);
CREATE INDEX IF NOT EXISTS idx_user_model_collection_user_id ON user_model_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);