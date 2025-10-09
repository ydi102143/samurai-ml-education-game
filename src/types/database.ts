export interface Region {
  id: string;
  name: string;
  daimyo: string;
  description: string;
  problem_type: 'classification' | 'regression' | 'clustering' | 'mixed';
  problem_description: string;
  required_accuracy: number;
  unlock_condition: string | null;
  difficulty: number;
  reward_xp: number;
  order_index: number;
  dataset_info: {
    features: string[];
    classes?: string[];
    target?: string;
    clusters?: number;
    samples: number;
  };
  created_at: string;
}

export interface UserProfile {
  id: string;
  shogun_name: string;
  level: number;
  total_xp: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface UserRegionProgress {
  id: string;
  user_id: string;
  region_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  best_accuracy: number;
  stars: number;
  attempts: number;
  first_completed_at: string | null;
  last_attempt_at: string | null;
  created_at: string;
}

export interface ChallengeAttempt {
  id: string;
  user_id: string;
  region_id: string;
  model_type: string;
  parameters: Record<string, unknown>;
  accuracy: number;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  training_time: number | null;
  created_at: string;
}

export interface MLModel {
  id: string;
  name: string;
  name_ja: string;
  description: string;
  category: 'classification' | 'regression' | 'clustering';
  unlock_level: number;
  icon: string;
  parameters_schema: Record<string, {
    type: string;
    default: number;
    min: number;
    max: number;
  }>;
  created_at: string;
}

export interface UserModelCollection {
  id: string;
  user_id: string;
  model_id: string;
  is_unlocked: boolean;
  usage_count: number;
  proficiency: number;
  unlocked_at: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: Record<string, unknown>;
  reward_xp: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

// 段階的学習システムの型定義
export interface LearningPath {
  id: string;
  name: string;
  description: string;
  difficulty_level: number;
  prerequisites: string[];
  unlock_conditions: {
    required_regions: string[];
    min_accuracy: number;
    required_skills: string[];
  };
  order_index: number;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'preprocessing' | 'modeling' | 'evaluation' | 'interpretation';
  description: string;
  required_level: number;
  prerequisites: string[];
  learning_objectives: string[];
  created_at: string;
}

export interface UserSkillProgress {
  user_id: string;
  skill_id: string;
  level: number;
  experience_points: number;
  last_practiced_at: string;
  proficiency_score: number;
}

export interface SafetyCheck {
  id: string;
  concept: string;
  risk_level: 'low' | 'medium' | 'high';
  mitigation_strategies: string[];
  expert_reviewed: boolean;
  created_at: string;
}

export interface EducationalContent {
  id: string;
  concept: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  explanation: {
    intuitive: string;
    conceptual: string;
    technical: string;
    mathematical?: string;
  };
  examples: string[];
  common_misconceptions: string[];
  safety_notes: string[];
  created_at: string;
}
