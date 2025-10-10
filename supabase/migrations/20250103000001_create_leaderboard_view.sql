-- リーダーボードビューの作成
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  br.id,
  br.room_id,
  br.user_id,
  br.username,
  br.problem_id,
  br.accuracy,
  br.training_time,
  br.model_type,
  br.parameters,
  br.is_private,
  br.battle_type,
  br.team_id,
  br.team_members,
  br.score,
  br.submitted_at,
  br.created_at,
  br.updated_at,
  -- 総合スコアの計算（精度ベース）
  COALESCE(br.score, ROUND(br.accuracy * 1000)) as total_score,
  -- ランキング計算用のROW_NUMBER
  ROW_NUMBER() OVER (
    PARTITION BY br.problem_id, br.is_private, br.battle_type 
    ORDER BY COALESCE(br.score, ROUND(br.accuracy * 1000)) DESC, br.submitted_at ASC
  ) as rank
FROM battle_results br
WHERE br.accuracy IS NOT NULL;

-- ビューの権限設定
GRANT SELECT ON leaderboard_view TO anon;
GRANT SELECT ON leaderboard_view TO authenticated;

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_battle_results_accuracy ON battle_results(accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_battle_results_submitted_at ON battle_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_results_problem_private_type ON battle_results(problem_id, is_private, battle_type);



