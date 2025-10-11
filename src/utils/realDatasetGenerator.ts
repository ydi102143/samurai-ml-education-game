// 実際のデータセット生成システム
export interface RealDataset {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  description: string;
  data: Array<{
    features: number[];
    label: number;
  }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetName: string;
  targetValues: string[];
  problemDescription: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleCount: number;
  featureCount: number;
  missingValueRate: number;
}

export class RealDatasetGenerator {
  private randomSeed: number = 42;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.randomSeed = seed;
    }
  }

  // シードを設定
  setSeed(seed: number): void {
    this.randomSeed = seed;
  }

  // 線形合同法による疑似乱数生成
  private random(): number {
    this.randomSeed = (this.randomSeed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.randomSeed / Math.pow(2, 32);
  }

  // 正規分布の乱数生成（Box-Muller法）
  private normalRandom(mean: number = 0, std: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std + mean;
  }

  // 医療診断データセットを生成
  generateMedicalDiagnosisDataset(): RealDataset {
    const sampleCount = 1000;
    const data: Array<{ features: number[], label: number }> = [];
    
    // 特徴量名とタイプ
    const featureNames = [
      'age', 'gender', 'blood_pressure', 'cholesterol', 'bmi', 'glucose',
      'smoking', 'exercise', 'family_history', 'stress_level'
    ];
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'categorical', 'numerical', 'numerical', 'numerical', 'numerical',
      'categorical', 'categorical', 'categorical', 'categorical'
    ];

    for (let i = 0; i < sampleCount; i++) {
      // 年齢（20-80歳）
      const age = Math.floor(this.random() * 61) + 20;
      
      // 性別（0: 女性, 1: 男性）
      const gender = this.random() < 0.5 ? 0 : 1;
      
      // 血圧（正常範囲に偏りを持たせる）
      const bloodPressure = this.normalRandom(120, 15);
      
      // コレステロール（年齢と性別に依存）
      const cholesterol = this.normalRandom(200 + age * 0.5 + gender * 10, 30);
      
      // BMI（年齢と性別に依存）
      const bmi = this.normalRandom(22 + age * 0.1 + gender * 1, 3);
      
      // 血糖値（BMIに依存）
      const glucose = this.normalRandom(90 + bmi * 2, 15);
      
      // 喫煙（年齢と性別に依存）
      const smoking = (age > 30 && this.random() < 0.3) ? 1 : 0;
      
      // 運動（年齢に依存）
      const exercise = (age < 50 && this.random() < 0.6) ? 1 : 0;
      
      // 家族歴（ランダム）
      const familyHistory = this.random() < 0.2 ? 1 : 0;
      
      // ストレスレベル（0: 低, 1: 中, 2: 高）
      const stressLevel = this.random() < 0.3 ? 0 : (this.random() < 0.7 ? 1 : 2);
      
      // 疾患リスクを計算（実際の医学的知識に基づく）
      let diseaseRisk = 0;
      diseaseRisk += age > 60 ? 0.3 : (age > 40 ? 0.1 : 0);
      diseaseRisk += gender === 1 ? 0.1 : 0;
      diseaseRisk += bloodPressure > 140 ? 0.2 : 0;
      diseaseRisk += cholesterol > 240 ? 0.2 : 0;
      diseaseRisk += bmi > 30 ? 0.15 : 0;
      diseaseRisk += glucose > 126 ? 0.2 : 0;
      diseaseRisk += smoking === 1 ? 0.25 : 0;
      diseaseRisk += exercise === 0 ? 0.1 : 0;
      diseaseRisk += familyHistory === 1 ? 0.2 : 0;
      diseaseRisk += stressLevel === 2 ? 0.1 : 0;
      
      // ノイズを追加
      diseaseRisk += this.normalRandom(0, 0.1);
      
      // ラベルを決定（0: 健康, 1: 疾患リスク）
      const label = diseaseRisk > 0.5 ? 1 : 0;
      
      // 欠損値を追加（5%の確率で）
      const features = [age, gender, bloodPressure, cholesterol, bmi, glucose, smoking, exercise, familyHistory, stressLevel];
      for (let j = 0; j < features.length; j++) {
        if (this.random() < 0.05) {
          features[j] = NaN;
        }
      }
      
      data.push({
        features,
        label
      });
    }

    return {
      id: 'medical_diagnosis',
      name: '医療診断データセット',
      type: 'classification',
      description: '患者の基本情報から疾患リスクを予測する分類問題',
      data,
      featureNames,
      featureTypes,
      targetName: 'disease_risk',
      targetValues: ['健康', '疾患リスク'],
      problemDescription: '患者の年齢、性別、血圧、コレステロール、BMI、血糖値、生活習慣などの情報から、将来的な疾患リスクを予測します。',
      difficulty: 'medium',
      sampleCount: data.length,
      featureCount: featureNames.length,
      missingValueRate: 0.05
    };
  }

  // 住宅価格予測データセットを生成
  generateHousingPriceDataset(): RealDataset {
    const sampleCount = 800;
    const data: Array<{ features: number[], label: number }> = [];
    
    // 特徴量名とタイプ
    const featureNames = [
      'size', 'bedrooms', 'bathrooms', 'age', 'location', 'condition',
      'garage', 'garden', 'pool', 'school_rating'
    ];
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'numerical', 'numerical', 'numerical', 'categorical', 'categorical',
      'categorical', 'categorical', 'categorical', 'numerical'
    ];

    for (let i = 0; i < sampleCount; i++) {
      // 住宅面積（50-300平米）
      const size = Math.floor(this.random() * 251) + 50;
      
      // 寝室数（1-5室）
      const bedrooms = Math.floor(this.random() * 5) + 1;
      
      // 浴室数（1-3室）
      const bathrooms = Math.floor(this.random() * 3) + 1;
      
      // 築年数（0-50年）
      const age = Math.floor(this.random() * 51);
      
      // 立地（0: 郊外, 1: 住宅街, 2: 都心）
      const location = this.random() < 0.3 ? 0 : (this.random() < 0.7 ? 1 : 2);
      
      // 状態（0: 悪い, 1: 普通, 2: 良い）
      const condition = this.random() < 0.2 ? 0 : (this.random() < 0.7 ? 1 : 2);
      
      // ガレージ（0: なし, 1: あり）
      const garage = this.random() < 0.6 ? 1 : 0;
      
      // 庭（0: なし, 1: あり）
      const garden = this.random() < 0.4 ? 1 : 0;
      
      // プール（0: なし, 1: あり）
      const pool = this.random() < 0.1 ? 1 : 0;
      
      // 学校評価（1-10点）
      const schoolRating = Math.floor(this.random() * 10) + 1;
      
      // 価格を計算（実際の不動産価格に基づく）
      let price = size * 50; // 基本価格（平米単価50万円）
      price += bedrooms * 500; // 寝室1室あたり50万円
      price += bathrooms * 300; // 浴室1室あたり30万円
      price -= age * 20; // 築年数1年あたり20万円減価
      price += location * 1000; // 立地による価格差
      price += condition * 200; // 状態による価格差
      price += garage * 300; // ガレージ
      price += garden * 200; // 庭
      price += pool * 500; // プール
      price += schoolRating * 50; // 学校評価
      
      // ノイズを追加
      price += this.normalRandom(0, price * 0.1);
      
      // 価格を万円単位に変換
      const label = Math.max(0, Math.floor(price));
      
      // 欠損値を追加（3%の確率で）
      const features = [size, bedrooms, bathrooms, age, location, condition, garage, garden, pool, schoolRating];
      for (let j = 0; j < features.length; j++) {
        if (this.random() < 0.03) {
          features[j] = NaN;
        }
      }
      
      data.push({
        features,
        label
      });
    }

    return {
      id: 'housing_price',
      name: '住宅価格予測データセット',
      type: 'regression',
      description: '住宅の特徴から価格を予測する回帰問題',
      data,
      featureNames,
      featureTypes,
      targetName: 'price',
      targetValues: [],
      problemDescription: '住宅の面積、寝室数、浴室数、築年数、立地、状態、設備などの情報から、適正な価格を予測します。',
      difficulty: 'medium',
      sampleCount: data.length,
      featureCount: featureNames.length,
      missingValueRate: 0.03
    };
  }

  // 不正検出データセットを生成
  generateFraudDetectionDataset(): RealDataset {
    const sampleCount = 1200;
    const data: Array<{ features: number[], label: number }> = [];
    
    // 特徴量名とタイプ
    const featureNames = [
      'amount', 'time', 'merchant_type', 'card_type', 'location',
      'previous_fraud', 'transaction_frequency', 'amount_variance'
    ];
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'numerical', 'categorical', 'categorical', 'categorical',
      'categorical', 'numerical', 'numerical'
    ];

    for (let i = 0; i < sampleCount; i++) {
      // 取引金額（0-100万円）
      const amount = this.random() * 1000000;
      
      // 取引時間（0-24時間）
      const time = this.random() * 24;
      
      // 店舗タイプ（0: 小売, 1: 飲食, 2: ガソリンスタンド, 3: オンライン）
      const merchantType = Math.floor(this.random() * 4);
      
      // カードタイプ（0: デビット, 1: クレジット, 2: プリペイド）
      const cardType = Math.floor(this.random() * 3);
      
      // 場所（0: 国内, 1: 海外）
      const location = this.random() < 0.1 ? 1 : 0;
      
      // 過去の不正履歴（0: なし, 1: あり）
      const previousFraud = this.random() < 0.05 ? 1 : 0;
      
      // 取引頻度（1日あたりの取引回数）
      const transactionFrequency = this.normalRandom(2, 1);
      
      // 取引金額の分散
      const amountVariance = this.normalRandom(100000, 50000);
      
      // 不正確率を計算
      let fraudProbability = 0;
      fraudProbability += amount > 500000 ? 0.3 : 0; // 高額取引
      fraudProbability += time < 6 || time > 22 ? 0.2 : 0; // 深夜・早朝
      fraudProbability += merchantType === 3 ? 0.1 : 0; // オンライン取引
      fraudProbability += location === 1 ? 0.2 : 0; // 海外取引
      fraudProbability += previousFraud === 1 ? 0.4 : 0; // 過去の不正履歴
      fraudProbability += transactionFrequency > 5 ? 0.1 : 0; // 高頻度取引
      fraudProbability += amountVariance > 200000 ? 0.15 : 0; // 金額のばらつき
      
      // ノイズを追加
      fraudProbability += this.normalRandom(0, 0.05);
      
      // ラベルを決定（0: 正常, 1: 不正）
      const label = fraudProbability > 0.3 ? 1 : 0;
      
      // 欠損値を追加（2%の確率で）
      const features = [amount, time, merchantType, cardType, location, previousFraud, transactionFrequency, amountVariance];
      for (let j = 0; j < features.length; j++) {
        if (this.random() < 0.02) {
          features[j] = NaN;
        }
      }
      
      data.push({
        features,
        label
      });
    }

    return {
      id: 'fraud_detection',
      name: '不正検出データセット',
      type: 'classification',
      description: 'クレジットカード取引から不正を検出する分類問題',
      data,
      featureNames,
      featureTypes,
      targetName: 'fraud',
      targetValues: ['正常', '不正'],
      problemDescription: 'クレジットカードの取引金額、時間、店舗タイプ、カードタイプ、場所、過去の履歴などの情報から、不正な取引を検出します。',
      difficulty: 'hard',
      sampleCount: data.length,
      featureCount: featureNames.length,
      missingValueRate: 0.02
    };
  }

  // 顧客離反予測データセットを生成
  generateCustomerChurnDataset(): RealDataset {
    const sampleCount = 900;
    const data: Array<{ features: number[], label: number }> = [];
    
    // 特徴量名とタイプ
    const featureNames = [
      'tenure', 'monthly_charges', 'total_charges', 'contract_type',
      'internet_service', 'online_security', 'tech_support', 'satisfaction_score'
    ];
    const featureTypes: ('numerical' | 'categorical')[] = [
      'numerical', 'numerical', 'numerical', 'categorical',
      'categorical', 'categorical', 'categorical', 'numerical'
    ];

    for (let i = 0; i < sampleCount; i++) {
      // 契約期間（0-72ヶ月）
      const tenure = Math.floor(this.random() * 73);
      
      // 月額料金（20-120ドル）
      const monthlyCharges = this.normalRandom(70, 20);
      
      // 総料金（契約期間 × 月額料金 + ノイズ）
      const totalCharges = tenure * monthlyCharges + this.normalRandom(0, 100);
      
      // 契約タイプ（0: 月契約, 1: 年契約, 2: 2年契約）
      const contractType = this.random() < 0.4 ? 0 : (this.random() < 0.8 ? 1 : 2);
      
      // インターネットサービス（0: なし, 1: あり）
      const internetService = this.random() < 0.8 ? 1 : 0;
      
      // オンラインセキュリティ（0: なし, 1: あり）
      const onlineSecurity = this.random() < 0.5 ? 1 : 0;
      
      // テクニカルサポート（0: なし, 1: あり）
      const techSupport = this.random() < 0.5 ? 1 : 0;
      
      // 満足度スコア（1-10点）
      const satisfactionScore = Math.floor(this.random() * 10) + 1;
      
      // 離反確率を計算
      let churnProbability = 0;
      churnProbability += tenure < 12 ? 0.3 : 0; // 短期契約
      churnProbability += monthlyCharges > 80 ? 0.2 : 0; // 高額料金
      churnProbability += contractType === 0 ? 0.2 : 0; // 月契約
      churnProbability += internetService === 0 ? 0.1 : 0; // インターネットなし
      churnProbability += onlineSecurity === 0 ? 0.1 : 0; // セキュリティなし
      churnProbability += techSupport === 0 ? 0.1 : 0; // サポートなし
      churnProbability += satisfactionScore < 5 ? 0.3 : 0; // 低満足度
      
      // ノイズを追加
      churnProbability += this.normalRandom(0, 0.05);
      
      // ラベルを決定（0: 継続, 1: 離反）
      const label = churnProbability > 0.4 ? 1 : 0;
      
      // 欠損値を追加（4%の確率で）
      const features = [tenure, monthlyCharges, totalCharges, contractType, internetService, onlineSecurity, techSupport, satisfactionScore];
      for (let j = 0; j < features.length; j++) {
        if (this.random() < 0.04) {
          features[j] = NaN;
        }
      }
      
      data.push({
        features,
        label
      });
    }

    return {
      id: 'customer_churn',
      name: '顧客離反予測データセット',
      type: 'classification',
      description: '顧客の属性から離反を予測する分類問題',
      data,
      featureNames,
      featureTypes,
      targetName: 'churn',
      targetValues: ['継続', '離反'],
      problemDescription: '顧客の契約期間、料金、契約タイプ、サービス利用状況、満足度などの情報から、顧客の離反を予測します。',
      difficulty: 'medium',
      sampleCount: data.length,
      featureCount: featureNames.length,
      missingValueRate: 0.04
    };
  }

  // 全データセットを取得
  getAllDatasets(): RealDataset[] {
    return [
      this.generateMedicalDiagnosisDataset(),
      this.generateHousingPriceDataset(),
      this.generateFraudDetectionDataset(),
      this.generateCustomerChurnDataset()
    ];
  }

  // 特定のデータセットを取得
  getDataset(datasetId: string): RealDataset | null {
    const datasets = this.getAllDatasets();
    return datasets.find(dataset => dataset.id === datasetId) || null;
  }
}

// シングルトンインスタンス
export const realDatasetGenerator = new RealDatasetGenerator();
