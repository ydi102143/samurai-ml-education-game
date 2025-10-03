// import { supabase } from './supabase';
import type { Region, UserProfile, UserRegionProgress, MLModel, ChallengeAttempt } from '../types/database';

// ローカル開発用のモックデータ
const mockRegions: Region[] = [
  {
    id: 'kyoto',
    name: '京都',
    daimyo: '足利将軍家',
    description: '商業の中心地として栄え、多くの茶器が取引される中で贋作を見抜く目が求められている。',
    problem_type: 'classification',
    problem_description: '茶器の画像から真贋を判定するAIを構築する。',
    required_accuracy: 0.8,
    unlock_condition: null,
    difficulty: 1,
    reward_xp: 100,
    order_index: 1,
    dataset_info: {
      features: ['年代', '職人技', '材質', '古色'],
      classes: ['贋作', '本物'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'sakai',
    name: '堺',
    daimyo: '商人自治',
    description: '南蛮貿易で栄える国際港湾都市。世界中から届く品物の産地を正確に識別する必要がある。',
    problem_type: 'classification',
    problem_description: '貿易品の特徴から産地を分類する。',
    required_accuracy: 0.75,
    unlock_condition: null,
    difficulty: 2,
    reward_xp: 150,
    order_index: 2,
    dataset_info: {
      features: ['材質', '装飾', '職人技', '価格'],
      classes: ['中国', '南蛮', '朝鮮', '日本'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'kai',
    name: '甲斐',
    daimyo: '武田信玄',
    description: '豊富な金山を有する武田領。鉱山の産出量を予測し、効率的な資源管理を実現する。',
    problem_type: 'regression',
    problem_description: '気象条件と労働力から金山の月間産出量を予測する。',
    required_accuracy: 0.7,
    unlock_condition: null,
    difficulty: 3,
    reward_xp: 200,
    order_index: 3,
    dataset_info: {
      features: ['労働者数', '経験値', '気温', '降水量', '機具の質', '鉱石の品質'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'echigo',
    name: '越後',
    daimyo: '上杉謙信',
    description: '豊かな穀倉地帯として知られる越後。気象データから米の収穫量を予測し、領民を飢饉から守る。',
    problem_type: 'regression',
    problem_description: '気象条件と土壌データから米の収穫量を予測する。',
    required_accuracy: 0.75,
    unlock_condition: null,
    difficulty: 2,
    reward_xp: 150,
    order_index: 4,
    dataset_info: {
      features: ['気温', '降水量', '日照時間', '土壌の質', '種子の質', '肥料の量'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'owari',
    name: '尾張',
    daimyo: '織田信長',
    description: '兵農分離を進める織田領。兵士の適性を科学的に分析し、最適な配置を実現する。',
    problem_type: 'classification',
    problem_description: '兵士の能力データから最適な役職を判定する。',
    required_accuracy: 0.8,
    unlock_condition: null,
    difficulty: 3,
    reward_xp: 200,
    order_index: 5,
    dataset_info: {
      features: ['年齢', '筋力', '敏捷性', '知力', '戦闘経験', '社会階級'],
      classes: ['槍兵', '弓兵', '鉄砲隊', '騎馬隊'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'satsuma',
    name: '薩摩',
    daimyo: '島津義弘',
    description: '鉄砲生産で名高い薩摩。火縄銃の品質検査を自動化し、不良品を検出する。',
    problem_type: 'classification',
    problem_description: '鉄砲の製造データから品質を判定する。',
    required_accuracy: 0.85,
    unlock_condition: null,
    difficulty: 4,
    reward_xp: 250,
    order_index: 6,
    dataset_info: {
      features: ['鉄の品質', '鋼の品質', '鍛造技術', '組み立て精度', '検査の厳密さ', '製造温度'],
      classes: ['不良品', '良品'],
      samples: 300
    },
    created_at: new Date().toISOString()
  }
];

// ローカルストレージを使用したモックデータベース
const getStorageKey = (userId: string, type: string) => `samurai_${type}_${userId}`;

export async function getRegions(): Promise<Region[]> {
  // ローカル開発用：モックデータを返す
  return mockRegions;
}

export async function getRegion(id: string): Promise<Region | null> {
  // ローカル開発用：モックデータから検索
  return mockRegions.find(r => r.id === id) || null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // ローカル開発用：ローカルストレージから取得
  const stored = localStorage.getItem(getStorageKey(userId, 'profile'));
  return stored ? JSON.parse(stored) : null;
}

export async function createUserProfile(shogunName: string): Promise<UserProfile> {
  // ローカル開発用：ローカルストレージに保存
  const profile: UserProfile = {
    id: `user_${Date.now()}`,
    shogun_name: shogunName,
    level: 1,
    total_xp: 0,
    title: '足軽',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem(getStorageKey(profile.id, 'profile'), JSON.stringify(profile));
  return profile;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  // ローカル開発用：ローカルストレージを更新
  const stored = localStorage.getItem(getStorageKey(userId, 'profile'));
  if (stored) {
    const profile = JSON.parse(stored);
    const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(getStorageKey(userId, 'profile'), JSON.stringify(updatedProfile));
  }
}

export async function getUserRegionProgress(userId: string): Promise<UserRegionProgress[]> {
  // ローカル開発用：ローカルストレージから取得
  const stored = localStorage.getItem(getStorageKey(userId, 'progress'));
  return stored ? JSON.parse(stored) : [];
}

export async function getRegionProgress(userId: string, regionId: string): Promise<UserRegionProgress | null> {
  const progress = await getUserRegionProgress(userId);
  return progress.find(p => p.region_id === regionId) || null;
}

export async function updateRegionProgress(
  userId: string,
  regionId: string,
  updates: Partial<UserRegionProgress>
): Promise<void> {
  // ローカル開発用：ローカルストレージを更新
  const progress = await getUserRegionProgress(userId);
  const existingIndex = progress.findIndex(p => p.region_id === regionId);
  
  if (existingIndex >= 0) {
    progress[existingIndex] = { ...progress[existingIndex], ...updates };
  } else {
    progress.push({
      id: `progress_${regionId}`,
      user_id: userId,
      region_id: regionId,
      is_unlocked: false,
      is_completed: false,
      best_accuracy: 0,
      stars: 0,
      attempts: 0,
      first_completed_at: null,
      last_attempt_at: null,
      created_at: new Date().toISOString(),
      ...updates
    });
  }
  
  localStorage.setItem(getStorageKey(userId, 'progress'), JSON.stringify(progress));
}

export async function unlockRegion(userId: string, regionId: string): Promise<void> {
  await updateRegionProgress(userId, regionId, { is_unlocked: true });
}

export async function getMLModels(): Promise<MLModel[]> {
  // ローカル開発用：モックデータを返す
  return [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      name_ja: 'ロジスティック回帰',
      description: '線形分類器で、シンプルで理解しやすいモデルです。',
      category: 'classification',
      unlock_level: 1,
      icon: 'TrendingUp',
      parameters_schema: {
        learning_rate: { type: 'number', min: 0.001, max: 0.1, default: 0.01 },
        max_iterations: { type: 'number', min: 10, max: 1000, default: 100 }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 'linear_regression',
      name: 'Linear Regression',
      name_ja: '線形回帰',
      description: '連続値を予測する基本的な回帰モデルです。',
      category: 'regression',
      unlock_level: 1,
      icon: 'BarChart',
      parameters_schema: {
        learning_rate: { type: 'number', min: 0.001, max: 0.1, default: 0.01 },
        max_iterations: { type: 'number', min: 10, max: 1000, default: 100 }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 'neural_network',
      name: 'Neural Network',
      name_ja: 'ニューラルネットワーク',
      description: '複雑なパターンを学習できる高度なモデルです。',
      category: 'classification',
      unlock_level: 2,
      icon: 'Brain',
      parameters_schema: {
        hidden_layers: { type: 'number', min: 1, max: 5, default: 2 },
        neurons_per_layer: { type: 'number', min: 4, max: 128, default: 16 },
        learning_rate: { type: 'number', min: 0.001, max: 0.1, default: 0.01 },
        epochs: { type: 'number', min: 10, max: 500, default: 100 }
      },
      created_at: new Date().toISOString()
    }
  ];
}

export async function saveAttempt(attempt: Omit<ChallengeAttempt, 'id' | 'created_at'>): Promise<void> {
  // ローカル開発用：ローカルストレージに保存
  const stored = localStorage.getItem(getStorageKey(attempt.user_id, 'attempts'));
  const attempts = stored ? JSON.parse(stored) : [];
  
  const newAttempt: ChallengeAttempt = {
    id: `attempt_${Date.now()}`,
    ...attempt,
    created_at: new Date().toISOString()
  };
  
  attempts.push(newAttempt);
  localStorage.setItem(getStorageKey(attempt.user_id, 'attempts'), JSON.stringify(attempts));
}

export async function getAttempts(userId: string, regionId: string): Promise<ChallengeAttempt[]> {
  // ローカル開発用：ローカルストレージから取得
  const stored = localStorage.getItem(getStorageKey(userId, 'attempts'));
  const attempts = stored ? JSON.parse(stored) : [];
  return attempts.filter((a: ChallengeAttempt) => a.region_id === regionId);
}

export async function initializeUserProgress(userId: string): Promise<void> {
  const regions = await getRegions();
  
  // すべての課題を解放する
  for (const region of regions) {
    await updateRegionProgress(userId, region.id, {
      is_unlocked: true,
      is_completed: false,
      best_accuracy: 0,
      stars: 0,
      attempts: 0,
    });
  }
}

export async function unlockAllRegions(userId: string): Promise<void> {
  const regions = await getRegions();
  
  // すべての課題を解放する（既存ユーザー用）
  for (const region of regions) {
    await updateRegionProgress(userId, region.id, {
      is_unlocked: true,
    });
  }
}