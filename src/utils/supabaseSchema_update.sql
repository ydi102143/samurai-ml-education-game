-- リーダーボードビューの修正（is_privateカラムを追加）
DROP VIEW IF EXISTS leaderboard_view CASCADE;

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
  is_private
FROM battle_results
GROUP BY user_id, username, battle_type, team_id, team_members, is_private;



