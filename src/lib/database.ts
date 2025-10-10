// import { supabase } from './supabase';
import type { Region, UserProfile, UserRegionProgress, MLModel, ChallengeAttempt, LearningPath, Skill, UserSkillProgress, SafetyCheck, EducationalContent } from '../types/database';

// ローカル開発用のモックデータ
const mockRegions: Region[] = [
  {
    id: 'kyoto',
    name: '京都',
    daimyo: '足利将軍家',
    description: '商業の中心地として栄え、多くの茶器が取引される中で贋作を見抜く目が求められている。',
    problem_type: 'classification',
    problem_description: '茶器の情報から真贋を判定するAIを構築する。',
    required_accuracy: 0.8,
    unlock_condition: null, // 最初の問題
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
    unlock_condition: 'kyoto', // 京都をクリア後に開放（レベル2の問題群）
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
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
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
    unlock_condition: 'kyoto', // レベル1をクリア後に開放（レベル2の問題群）
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
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
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
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 200,
    order_index: 6,
    dataset_info: {
      features: ['鉄の品質', '鋼の品質', '鍛造技術', '組み立て精度', '検査の厳密さ', '製造温度'],
      classes: ['不良品', '良品'],
      samples: 300
    },
    created_at: new Date().toISOString()
  }
  ,
  {
    id: 'hizen',
    name: '肥前',
    daimyo: '鍋島直茂',
    description: '有田焼など陶磁器で名高い肥前。焼成条件から等級を見極める。',
    problem_type: 'classification',
    problem_description: '陶器の製造データから等級（上・中・下）を分類する。',
    required_accuracy: 0.8,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 180,
    order_index: 7,
    dataset_info: {
      features: ['粘土の品質', '釉薬の品質', '焼成温度', '陶工の技能', '装飾の美しさ', '厚さの均一性'],
      classes: ['下級', '中級', '上級'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'sagami',
    name: '相模',
    daimyo: '北条氏康',
    description: '小田原を擁する北条領。政治・経済指標から地域の繁栄度を判断する。',
    problem_type: 'classification',
    problem_description: '地域指標から繁栄レベル（低・中・高）を分類する。',
    required_accuracy: 0.75,
    unlock_condition: 'kyoto', // レベル1をクリア後に開放（レベル2の問題群）
    difficulty: 2,
    reward_xp: 150,
    order_index: 8,
    dataset_info: {
      features: ['人口', '商業の発達度', '農業の発達度', '統治の質', '政治安定性', '立地の良さ'],
      classes: ['低い', '中程度', '高い'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'dewa',
    name: '出羽',
    daimyo: '最上義光',
    description: '山形の険しい地形での物流網最適化。条件から輸送効率を予測する。',
    problem_type: 'regression',
    problem_description: '距離や標高、天候などから輸送効率を予測する。',
    required_accuracy: 0.7,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 200,
    order_index: 9,
    dataset_info: {
      features: ['距離', '標高', '天候の良さ', '道路の質', '荷物の価値', '季節'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'morioka',
    name: '盛岡',
    daimyo: '南部信直',
    description: '南部藩の中心地。馬の品種改良データから最適な繁殖条件を予測する。',
    problem_type: 'regression',
    problem_description: '馬の血統と環境条件から繁殖成功率を予測する。',
    required_accuracy: 0.75,
    unlock_condition: 'kyoto', // レベル1をクリア後に開放（レベル2の問題群）
    difficulty: 2,
    reward_xp: 150,
    order_index: 10,
    dataset_info: {
      features: ['血統スコア', '年齢', '健康状態', '飼育環境', '季節', '交配回数'],
      classes: [],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'sendai',
    name: '仙台',
    daimyo: '伊達政宗',
    description: '東北最大の藩。米の収穫量を気象データから予測し、年貢を最適化する。',
    problem_type: 'regression',
    problem_description: '気象条件から米の収穫量を予測する。',
    required_accuracy: 0.8,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 200,
    order_index: 11,
    dataset_info: {
      features: ['気温', '降水量', '日照時間', '土壌水分', '肥料量', '植え付け時期'],
      classes: [],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'kanazawa',
    name: '金沢',
    daimyo: '前田利家',
    description: '加賀百万石。金箔の品質を製造条件から判定し、最高級品を選別する。',
    problem_type: 'classification',
    problem_description: '金箔の製造データから品質等級を分類する。',
    required_accuracy: 0.85,
    unlock_condition: 'kai', // レベル3をクリア後に開放（レベル4の問題）
    difficulty: 4,
    reward_xp: 250,
    order_index: 12,
    dataset_info: {
      features: ['金の純度', '温度', '湿度', '圧延回数', '職人経験', '作業時間'],
      classes: ['下級', '中級', '上級', '最高級'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'takamatsu',
    name: '高松',
    daimyo: '生駒親正',
    description: '四国の要衝。海運の安全を天候と海流データから予測する。',
    problem_type: 'classification',
    problem_description: '天候と海流から航海の安全性を判定する。',
    required_accuracy: 0.8,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 180,
    order_index: 13,
    dataset_info: {
      features: ['風速', '波高', '海流速度', '雲量', '気圧', '潮汐'],
      classes: ['危険', '注意', '安全'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'kumamoto',
    name: '熊本',
    daimyo: '加藤清正',
    description: '肥後熊本藩。城の石垣の強度を材料と工法から予測する。',
    problem_type: 'regression',
    problem_description: '石の材質と積み方から石垣の強度を予測する。',
    required_accuracy: 0.75,
    unlock_condition: 'kyoto', // レベル1をクリア後に開放（レベル2の問題群）
    difficulty: 2,
    reward_xp: 150,
    order_index: 14,
    dataset_info: {
      features: ['石の硬さ', '石の大きさ', '積み方', 'モルタル量', '角度', '基礎の深さ'],
      classes: [],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'yamaguchi',
    name: '長門',
    daimyo: '毛利元就',
    description: '中国地方の雄。水軍の戦術データから最適な戦略を予測する。',
    problem_type: 'classification',
    problem_description: '海戦の条件から勝利確率を予測する。',
    required_accuracy: 0.8,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 200,
    order_index: 15,
    dataset_info: {
      features: ['風速', '波高', '船数', '兵数', '距離', '時間'],
      classes: ['敗北', '引き分け', '勝利'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'kaga',
    name: '加賀',
    daimyo: '一向一揆',
    description: '一向宗の自治領。信者の分布データから布教戦略を最適化する。',
    problem_type: 'regression',
    problem_description: '地域の特性から信者獲得数を予測する。',
    required_accuracy: 0.75,
    unlock_condition: 'kyoto', // レベル1をクリア後に開放（レベル2の問題群）
    difficulty: 2,
    reward_xp: 150,
    order_index: 16,
    dataset_info: {
      features: ['人口密度', '経済状況', '教育レベル', '既存宗教', '交通便', '季節'],
      classes: [],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'tosa',
    name: '土佐',
    daimyo: '長宗我部元親',
    description: '四国の統一者。領土拡大の戦略をデータから最適化する。',
    problem_type: 'classification',
    problem_description: '戦略条件から成功確率を予測する。',
    required_accuracy: 0.8,
    unlock_condition: 'sakai', // レベル2をクリア後に開放（レベル3の問題群）
    difficulty: 3,
    reward_xp: 180,
    order_index: 17,
    dataset_info: {
      features: ['兵力', '装備', '地形', '天候', '敵兵力', '補給'],
      classes: ['失敗', '部分成功', '完全成功'],
      samples: 300
    },
    created_at: new Date().toISOString()
  },
  // 現代の問題（オンライン対戦用）
  {
    id: 'modern_stock_prediction',
    name: '株価予測',
    daimyo: '現代金融',
    description: '現代の金融市場で株価の変動を予測し、投資戦略を最適化する。',
    problem_type: 'regression',
    problem_description: '企業の財務データから株価変化率を予測する。',
    required_accuracy: 0.7,
    unlock_condition: null, // すべて開放
    difficulty: 5,
    reward_xp: 500,
    order_index: 30,
    dataset_info: {
      features: ['始値', '出来高', '時価総額', 'PER', '負債比率', '売上成長率', '利益率'],
      samples: 1000
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'modern_sentiment_analysis',
    name: '感情分析',
    daimyo: 'テキスト解析',
    description: 'SNSやレビューのテキストから感情を分析し、顧客満足度を向上させる。',
    problem_type: 'classification',
    problem_description: 'テキストの特徴から感情を分類する。',
    required_accuracy: 0.8,
    unlock_condition: null, // すべて開放
    difficulty: 4,
    reward_xp: 400,
    order_index: 31,
    dataset_info: {
      features: ['単語数', 'ポジティブ単語比率', 'ネガティブ単語比率', 'ニュートラル単語比率', '感嘆符比率', '疑問符比率', '大文字比率'],
      classes: ['ネガティブ', 'ニュートラル', 'ポジティブ'],
      samples: 2000
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'modern_image_classification',
    name: '画像分類',
    daimyo: 'コンピュータビジョン',
    description: '画像の特徴量から物体を分類し、自動認識システムを構築する。',
    problem_type: 'classification',
    problem_description: '画像の特徴量から物体を分類する。',
    required_accuracy: 0.85,
    unlock_condition: null, // すべて開放
    difficulty: 5,
    reward_xp: 500,
    order_index: 32,
    dataset_info: {
      features: ['明度', 'コントラスト', '色彩豊かさ', 'エッジ密度', 'テクスチャ複雑さ', '対称性', 'アスペクト比'],
      classes: ['猫', '犬', '車', '飛行機', '建物', '花', '食べ物', '人物'],
      samples: 1500
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'modern_recommendation',
    name: '推薦システム',
    daimyo: 'ECサイト',
    description: 'ユーザーの行動データから購入確率を予測し、パーソナライズされた推薦を行う。',
    problem_type: 'regression',
    problem_description: 'ユーザーとアイテムの特徴から購入確率を予測する。',
    required_accuracy: 0.75,
    unlock_condition: null, // すべて開放
    difficulty: 4,
    reward_xp: 400,
    order_index: 33,
    dataset_info: {
      features: ['ユーザー年齢', 'ユーザー収入', 'ユーザー活動度', 'アイテム価格', 'アイテム評価', 'アイテムカテゴリ', 'アイテム人気度'],
      samples: 3000
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'modern_fraud_detection',
    name: '不正検出',
    daimyo: 'セキュリティ',
    description: '取引データから不正な行為を検出し、金融システムの安全性を守る。',
    problem_type: 'classification',
    problem_description: '取引の特徴から不正を検出する（不均衡データ）。',
    required_accuracy: 0.95,
    unlock_condition: null, // すべて開放
    difficulty: 5,
    reward_xp: 600,
    order_index: 34,
    dataset_info: {
      features: ['取引金額', '時間', '曜日', '地域', '店舗タイプ', 'ユーザー履歴', 'デバイスタイプ'],
      classes: ['正常', '不正'],
      samples: 5000
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

// 段階的学習システムのデータ
const mockLearningPaths: LearningPath[] = [
  {
    id: 'beginner_path',
    name: '侍見習いの道',
    description: '機械学習の基礎を学ぶ',
    difficulty_level: 1,
    prerequisites: [],
    unlock_conditions: {
      required_regions: [],
      min_accuracy: 0,
      required_skills: []
    },
    order_index: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'intermediate_path',
    name: '侍の道',
    description: '応用的な機械学習手法を学ぶ',
    difficulty_level: 2,
    prerequisites: ['beginner_path'],
    unlock_conditions: {
      required_regions: ['kyoto'],
      min_accuracy: 0.8,
      required_skills: ['basic_classification']
    },
    order_index: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'advanced_path',
    name: '武将の道',
    description: '高度な機械学習技術を学ぶ',
    difficulty_level: 3,
    prerequisites: ['intermediate_path'],
    unlock_conditions: {
      required_regions: ['kyoto', 'sakai'],
      min_accuracy: 0.85,
      required_skills: ['feature_engineering', 'model_selection']
    },
    order_index: 3,
    created_at: new Date().toISOString()
  }
];

const mockSkills: Skill[] = [
  {
    id: 'basic_classification',
    name: '基本分類',
    category: 'modeling',
    description: '2クラス分類の基本概念を理解する',
    required_level: 1,
    prerequisites: [],
    learning_objectives: [
      '分類問題の理解',
      'ロジスティック回帰の基本',
      '精度の評価方法'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'feature_engineering',
    name: '特徴量エンジニアリング',
    category: 'preprocessing',
    description: '効果的な特徴量を作成する技術',
    required_level: 2,
    prerequisites: ['basic_classification'],
    learning_objectives: [
      '特徴量の重要性理解',
      '新しい特徴量の作成',
      '特徴量選択の方法'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'model_selection',
    name: 'モデル選択',
    category: 'modeling',
    description: '適切なモデルを選択する技術',
    required_level: 2,
    prerequisites: ['basic_classification'],
    learning_objectives: [
      'モデルの比較方法',
      '交差検証の理解',
      '過学習の防止'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'overfitting_prevention',
    name: '過学習防止',
    category: 'evaluation',
    description: '過学習を防ぐ技術',
    required_level: 3,
    prerequisites: ['model_selection'],
    learning_objectives: [
      '過学習の理解',
      '正則化の手法',
      '適切な検証方法'
    ],
    created_at: new Date().toISOString()
  }
];

const mockSafetyChecks: SafetyCheck[] = [
  {
    id: 'overfitting_safety',
    concept: '過学習',
    risk_level: 'high',
    mitigation_strategies: [
      '段階的な説明の導入',
      '適切な検証の強制',
      '過学習の早期発見システム'
    ],
    expert_reviewed: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'model_complexity_safety',
    concept: 'モデル複雑性',
    risk_level: 'medium',
    mitigation_strategies: [
      '段階的な複雑さの制限',
      '適切な評価指標の使用',
      '解釈可能性の重視'
    ],
    expert_reviewed: true,
    created_at: new Date().toISOString()
  }
];

const mockEducationalContent: EducationalContent[] = [
  {
    id: 'overfitting_explanation',
    concept: '過学習',
    level: 'beginner',
    explanation: {
      intuitive: 'テストの答えを暗記してしまうと、新しい問題が解けなくなる',
      conceptual: '訓練データに過度に適合し、汎化性能が低下する現象',
      technical: 'モデルの複雑さが増すと、訓練誤差は減少するが汎化誤差は増加する',
      mathematical: 'E[L(f(x), y)] = E[L(f(x), y)|D_train] + E[L(f(x), y)|D_test]'
    },
    examples: [
      '学生が過去問を暗記して新しい問題が解けない',
      'AIが訓練データを覚えてしまい、新しいデータで性能が悪い'
    ],
    common_misconceptions: [
      '精度が高いほど良い',
      '複雑なモデルが常に良い'
    ],
    safety_notes: [
      '過学習は機械学習の重要な問題',
      '適切な検証が不可欠',
      '段階的な複雑さの導入が重要'
    ],
    created_at: new Date().toISOString()
  }
];

// 段階的学習システムの関数
export async function getLearningPaths(): Promise<LearningPath[]> {
  return mockLearningPaths;
}

export async function getSkills(): Promise<Skill[]> {
  return mockSkills;
}

export async function getSafetyChecks(): Promise<SafetyCheck[]> {
  return mockSafetyChecks;
}

export async function getEducationalContent(concept: string, level: string): Promise<EducationalContent | null> {
  return mockEducationalContent.find(content => 
    content.concept === concept && content.level === level
  ) || null;
}

export async function getUserSkillProgress(_userId: string): Promise<UserSkillProgress[]> {
  // モックデータ - 実際の実装ではデータベースから取得
  return [];
}

export async function updateUserSkillProgress(
  userId: string, 
  skillId: string, 
  progress: Partial<UserSkillProgress>
): Promise<void> {
  // モック実装 - 実際の実装ではデータベースを更新
  console.log(`Updating skill progress for user ${userId}, skill ${skillId}:`, progress);
}