/**
 * オンライン対戦用データセット
 * 週次問題とリアルタイム問題のデータセット生成
 */

export interface OnlineDataset {
  data: { features: number[]; label: number | string }[];
  raw: { features: number[]; label: number | string }[];
  featureNames: string[];
  featureUnits: string[];
  problemType: 'classification' | 'regression';
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetName: string;
  targetUnit: string;
  classes?: string[];
}

// 正規分布の乱数生成
function normalRandom(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

/**
 * 週次問題1: 株価予測（回帰）
 */
export function generateWeeklyStockPrediction(): OnlineDataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 500; i++) {
    // 株価関連の特徴量
    const volume = Math.max(1000, Math.min(1000000, normalRandom(100000, 50000))); // 出来高
    const volatility = Math.max(0.01, Math.min(0.5, normalRandom(0.2, 0.1))); // ボラティリティ
    const momentum = Math.max(-0.3, Math.min(0.3, normalRandom(0, 0.1))); // モメンタム
    const rsi = Math.max(0, Math.min(100, normalRandom(50, 20))); // RSI
    const macd = Math.max(-2, Math.min(2, normalRandom(0, 0.5))); // MACD
    const pe_ratio = Math.max(5, Math.min(50, normalRandom(20, 10))); // PER
    
    // シンプルな線形関係で株価を計算
    const basePrice = 100;
    const priceChange = 
      (volume / 100000) * 0.1 +
      (volatility - 0.2) * 50 +
      momentum * 30 +
      (rsi - 50) / 100 * 20 +
      macd * 10 +
      (20 - pe_ratio) / 20 * 15 +
      normalRandom(0, 5); // ノイズ
    
    const stockPrice = Math.max(10, basePrice + priceChange);

    raw.push({
      features: [
        Math.round(volume),
        Math.round(volatility * 100) / 100,
        Math.round(momentum * 100) / 100,
        Math.round(rsi),
        Math.round(macd * 100) / 100,
        Math.round(pe_ratio)
      ],
      label: Math.round(stockPrice * 100) / 100,
    });

    data.push({
      features: [
        (volume - 1000) / 999000, // 正規化 0-1
        (volatility - 0.01) / 0.49, // 正規化 0-1
        (momentum + 0.3) / 0.6, // 正規化 0-1
        rsi / 100, // 正規化 0-1
        (macd + 2) / 4, // 正規化 0-1
        (pe_ratio - 5) / 45 // 正規化 0-1
      ],
      label: (stockPrice - 10) / 200, // 正規化 0-1
    });
  }

  return {
    data,
    raw,
    featureNames: ['出来高', 'ボラティリティ', 'モメンタム', 'RSI', 'MACD', 'PER'],
    featureUnits: ['株', '', '', '', '', ''],
    problemType: 'regression',
    description: '株価予測問題。出来高、ボラティリティ、モメンタム、RSI、MACD、PERから翌日の株価を予測します。',
    difficulty: 'medium',
    targetName: '株価',
    targetUnit: '円'
  };
}

/**
 * 週次問題2: 顧客離脱予測（分類）
 */
export function generateWeeklyCustomerChurn(): OnlineDataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 500; i++) {
    // 顧客の特徴量
    const tenure = Math.max(0, Math.min(60, normalRandom(30, 15))); // 在籍期間（月）
    const monthly_charges = Math.max(20, Math.min(120, normalRandom(70, 25))); // 月額料金
    const total_charges = Math.max(0, Math.min(8000, normalRandom(3000, 2000))); // 総料金
    const contract_type = Math.random() < 0.5 ? 0 : 1; // 契約タイプ（0: 月次, 1: 年次）
    const internet_service = Math.random() < 0.8 ? 1 : 0; // インターネットサービス
    const tech_support = Math.random() < 0.3 ? 1 : 0; // テクニカルサポート
    
    // 離脱確率を計算
    const churnScore = 
      (60 - tenure) / 60 * 0.3 + // 在籍期間が短いほど離脱しやすい
      (monthly_charges - 20) / 100 * 0.2 + // 料金が高いほど離脱しやすい
      (1 - contract_type) * 0.2 + // 月次契約の方が離脱しやすい
      (1 - internet_service) * 0.15 + // インターネットサービスなしは離脱しやすい
      (1 - tech_support) * 0.1 + // サポートなしは離脱しやすい
      normalRandom(0, 0.1); // ノイズ
    
    const willChurn = churnScore > 0.5;

    raw.push({
      features: [
        Math.round(tenure),
        Math.round(monthly_charges),
        Math.round(total_charges),
        contract_type,
        internet_service,
        tech_support
      ],
      label: willChurn ? '離脱' : '継続',
    });

    data.push({
      features: [
        tenure / 60, // 正規化 0-1
        (monthly_charges - 20) / 100, // 正規化 0-1
        total_charges / 8000, // 正規化 0-1
        contract_type, // 0 or 1
        internet_service, // 0 or 1
        tech_support // 0 or 1
      ],
      label: willChurn ? 1 : 0,
    });
  }

  return {
    data,
    raw,
    featureNames: ['在籍期間', '月額料金', '総料金', '契約タイプ', 'インターネットサービス', 'テクニカルサポート'],
    featureUnits: ['月', 'ドル', 'ドル', '', '', ''],
    problemType: 'classification',
    description: '顧客離脱予測問題。在籍期間、料金、契約タイプ、サービス利用状況から顧客の離脱を予測します。',
    difficulty: 'medium',
    targetName: '離脱',
    targetUnit: '離脱/継続',
    classes: ['継続', '離脱']
  };
}

/**
 * 週次問題3: 住宅価格予測（回帰）
 */
export function generateWeeklyHousingPrice(): OnlineDataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 500; i++) {
    // 住宅の特徴量
    const area = Math.max(500, Math.min(5000, normalRandom(2000, 800))); // 面積（平方フィート）
    const bedrooms = Math.max(1, Math.min(6, Math.round(normalRandom(3, 1)))); // 寝室数
    const bathrooms = Math.max(1, Math.min(4, Math.round(normalRandom(2, 0.5)))); // 浴室数
    const age = Math.max(0, Math.min(50, normalRandom(15, 10))); // 築年数
    const location_score = Math.max(1, Math.min(10, normalRandom(6, 2))); // 立地スコア
    const school_rating = Math.max(1, Math.min(10, normalRandom(7, 2))); // 学校評価
    
    // 住宅価格を計算
    const basePrice = 200000;
    const price = basePrice +
      (area - 1000) * 100 + // 面積効果
      (bedrooms - 2) * 10000 + // 寝室効果
      (bathrooms - 1) * 15000 + // 浴室効果
      (50 - age) * 2000 + // 築年数効果（新しいほど高い）
      (location_score - 5) * 20000 + // 立地効果
      (school_rating - 5) * 15000 + // 学校効果
      normalRandom(0, 30000); // ノイズ

    raw.push({
      features: [
        Math.round(area),
        bedrooms,
        bathrooms,
        Math.round(age),
        Math.round(location_score),
        Math.round(school_rating)
      ],
      label: Math.round(price),
    });

    data.push({
      features: [
        (area - 500) / 4500, // 正規化 0-1
        (bedrooms - 1) / 5, // 正規化 0-1
        (bathrooms - 1) / 3, // 正規化 0-1
        age / 50, // 正規化 0-1
        (location_score - 1) / 9, // 正規化 0-1
        (school_rating - 1) / 9 // 正規化 0-1
      ],
      label: (price - 100000) / 500000, // 正規化 0-1
    });
  }

  return {
    data,
    raw,
    featureNames: ['面積', '寝室数', '浴室数', '築年数', '立地スコア', '学校評価'],
    featureUnits: ['平方フィート', '室', '室', '年', '点', '点'],
    problemType: 'regression',
    description: '住宅価格予測問題。面積、寝室数、浴室数、築年数、立地、学校評価から住宅価格を予測します。',
    difficulty: 'easy',
    targetName: '価格',
    targetUnit: 'ドル'
  };
}

/**
 * 週次問題4: 感情分析（分類）
 */
export function generateWeeklySentimentAnalysis(): OnlineDataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 500; i++) {
    // テキストの特徴量（数値化）
    const word_count = Math.max(10, Math.min(200, normalRandom(50, 30))); // 単語数
    const positive_words = Math.max(0, Math.min(20, normalRandom(5, 3))); // ポジティブ単語数
    const negative_words = Math.max(0, Math.min(20, normalRandom(3, 2))); // ネガティブ単語数
    const exclamation_count = Math.max(0, Math.min(10, normalRandom(1, 2))); // 感嘆符数
    const question_count = Math.max(0, Math.min(5, normalRandom(0.5, 1))); // 疑問符数
    const caps_ratio = Math.max(0, Math.min(1, normalRandom(0.1, 0.1))); // 大文字比率
    
    // 感情スコアを計算
    const sentimentScore = 
      (positive_words - negative_words) / 20 * 0.4 +
      (exclamation_count - question_count) / 10 * 0.2 +
      caps_ratio * 0.2 +
      (word_count - 50) / 150 * 0.1 +
      normalRandom(0, 0.1); // ノイズ
    
    const sentiment = sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral';

    raw.push({
      features: [
        Math.round(word_count),
        Math.round(positive_words),
        Math.round(negative_words),
        Math.round(exclamation_count),
        Math.round(question_count),
        Math.round(caps_ratio * 100) / 100
      ],
      label: sentiment,
    });

    data.push({
      features: [
        (word_count - 10) / 190, // 正規化 0-1
        positive_words / 20, // 正規化 0-1
        negative_words / 20, // 正規化 0-1
        exclamation_count / 10, // 正規化 0-1
        question_count / 5, // 正規化 0-1
        caps_ratio // 0-1
      ],
      label: sentiment === 'positive' ? 1 : sentiment === 'negative' ? 0 : 0.5,
    });
  }

  return {
    data,
    raw,
    featureNames: ['単語数', 'ポジティブ単語', 'ネガティブ単語', '感嘆符数', '疑問符数', '大文字比率'],
    featureUnits: ['語', '語', '語', '個', '個', ''],
    problemType: 'classification',
    description: '感情分析問題。テキストの特徴量から感情（ポジティブ/ネガティブ/ニュートラル）を予測します。',
    difficulty: 'hard',
    targetName: '感情',
    targetUnit: 'ポジティブ/ネガティブ/ニュートラル',
    classes: ['negative', 'neutral', 'positive']
  };
}

/**
 * 週次問題5: 売上予測（回帰）
 */
export function generateWeeklySalesPrediction(): OnlineDataset {
  const data = [];
  const raw = [] as { features: number[]; label: number | string }[];

  for (let i = 0; i < 500; i++) {
    // 売上関連の特徴量
    const advertising_budget = Math.max(0, Math.min(100000, normalRandom(30000, 15000))); // 広告予算
    const price = Math.max(10, Math.min(100, normalRandom(50, 20))); // 価格
    const competitor_price = Math.max(10, Math.min(100, normalRandom(45, 15))); // 競合価格
    const seasonality = Math.max(0, Math.min(1, normalRandom(0.5, 0.2))); // 季節性
    const economic_index = Math.max(0, Math.min(1, normalRandom(0.6, 0.2))); // 経済指標
    const social_media_mentions = Math.max(0, Math.min(1000, normalRandom(200, 100))); // SNS言及数
    
    // 売上を計算
    const baseSales = 10000;
    const sales = baseSales +
      (advertising_budget / 1000) * 0.5 + // 広告効果
      (100 - price) * 50 + // 価格効果（安いほど売れる）
      (competitor_price - price) * 20 + // 競合価格効果
      seasonality * 5000 + // 季節効果
      economic_index * 3000 + // 経済効果
      (social_media_mentions / 10) * 10 + // SNS効果
      normalRandom(0, 2000); // ノイズ

    raw.push({
      features: [
        Math.round(advertising_budget),
        Math.round(price),
        Math.round(competitor_price),
        Math.round(seasonality * 100) / 100,
        Math.round(economic_index * 100) / 100,
        Math.round(social_media_mentions)
      ],
      label: Math.round(sales),
    });

    data.push({
      features: [
        advertising_budget / 100000, // 正規化 0-1
        (price - 10) / 90, // 正規化 0-1
        (competitor_price - 10) / 90, // 正規化 0-1
        seasonality, // 0-1
        economic_index, // 0-1
        social_media_mentions / 1000 // 正規化 0-1
      ],
      label: (sales - 5000) / 20000, // 正規化 0-1
    });
  }

  return {
    data,
    raw,
    featureNames: ['広告予算', '価格', '競合価格', '季節性', '経済指標', 'SNS言及数'],
    featureUnits: ['ドル', 'ドル', 'ドル', '', '', '件'],
    problemType: 'regression',
    description: '売上予測問題。広告予算、価格、競合価格、季節性、経済指標、SNS言及数から売上を予測します。',
    difficulty: 'hard',
    targetName: '売上',
    targetUnit: 'ドル'
  };
}

/**
 * 週次問題の取得
 */
export function getWeeklyProblem(weekNumber?: number): OnlineDataset[] {
  const problems = [
    generateWeeklyStockPrediction,
    generateWeeklyCustomerChurn,
    generateWeeklyHousingPrice,
    generateWeeklySentimentAnalysis,
    generateWeeklySalesPrediction
  ];
  
  if (weekNumber !== undefined) {
    const problemIndex = weekNumber % problems.length;
    return [problems[problemIndex]()];
  }
  
  return problems.map(problem => problem());
}

/**
 * リアルタイム問題の生成
 */
export function generateRealtimeProblem(): OnlineDataset {
  // ランダムに週次問題から選択
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const problems = getWeeklyProblem(weekNumber);
  return problems[0];
}
