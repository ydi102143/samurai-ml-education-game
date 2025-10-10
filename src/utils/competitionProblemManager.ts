import type { CompetitionProblem, CompetitionDataset } from '../types/competition';
import { CompetitionDatasetManager } from './competitionDataset';

export class CompetitionProblemManager {
  private static problems: Map<string, CompetitionProblem> = new Map();

  /**
   * コンペティション問題を登録（シンプル版）
   */
  static registerProblem(
    id: string,
    title: string,
    description: string,
    rawData: any[],
    featureNames: string[],
    labelName: string,
    problemType: 'classification' | 'regression',
    classes?: string[]
  ): void {
    // 生データをDataPoint形式に変換
    const dataPoints = rawData.map((item, index) => ({
      id: `point_${index}`,
      features: item.features || item.slice(0, -1),
      label: item.label || item[item.length - 1]
    }));

    // コンペティション用データセットを作成
    const dataset = CompetitionDatasetManager.createCompetitionDataset(
      dataPoints,
      featureNames,
      labelName,
      problemType,
      classes
    );

    const problem: CompetitionProblem = {
      id,
      title,
      description,
      dataset,
      metric: problemType === 'classification' ? 'accuracy' : 'mae',
      constraints: {
        maxFeatures: Math.min(featureNames.length, 20),
        maxTrainingTime: 300, // 5分
        maxSubmissions: 10,
        allowedModels: ['logistic_regression', 'linear_regression', 'neural_network', 'knn']
      },
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
      participantCount: 0,
      submissionCount: 0
    };

    this.problems.set(id, problem);
    console.log(`問題を登録しました: ${id} - ${title}`);
  }

  /**
   * コンペティション問題を作成
   */
  static async createProblem(
    id: string,
    title: string,
    description: string,
    rawData: any[],
    featureNames: string[],
    labelName: string,
    problemType: 'classification' | 'regression',
    classes?: string[]
  ): Promise<CompetitionProblem> {
    // 生データをDataPoint形式に変換
    const dataPoints = rawData.map((item, index) => ({
      id: `point_${index}`,
      features: item.features || item.slice(0, -1),
      label: item.label || item[item.length - 1]
    }));

    // コンペティション用データセットを作成
    const dataset = CompetitionDatasetManager.createCompetitionDataset(
      dataPoints,
      featureNames,
      labelName,
      problemType,
      classes
    );

    const problem: CompetitionProblem = {
      id,
      title,
      description,
      dataset,
      metric: problemType === 'classification' ? 'accuracy' : 'mae',
      constraints: {
        maxFeatures: Math.min(featureNames.length, 20),
        maxTrainingTime: 300, // 5分
        maxSubmissions: 10,
        allowedModels: ['logistic_regression', 'linear_regression', 'neural_network', 'knn']
      },
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
      participantCount: 0,
      submissionCount: 0
    };

    this.problems.set(id, problem);
    
    // Private評価をスケジュール
    const { PrivateEvaluationScheduler } = await import('./privateEvaluationScheduler');
    PrivateEvaluationScheduler.scheduleForNewProblem(id);
    
    return problem;
  }

  /**
   * 問題を取得
   */
  static getProblem(id: string): CompetitionProblem | undefined {
    return this.problems.get(id);
  }

  /**
   * 全ての問題を取得
   */
  static getAllProblems(): CompetitionProblem[] {
    return Array.from(this.problems.values());
  }

  /**
   * アクティブな問題を取得
   */
  static getActiveProblems(): CompetitionProblem[] {
    const now = new Date();
    return Array.from(this.problems.values()).filter(
      problem => problem.startTime <= now && problem.endTime >= now
    );
  }

  /**
   * 問題の参加者数を更新
   */
  static updateParticipantCount(problemId: string, count: number): void {
    const problem = this.problems.get(problemId);
    if (problem) {
      problem.participantCount = count;
    }
  }

  /**
   * 問題がアクティブかチェック
   */
  static isProblemActive(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;
    
    const now = new Date();
    return problem.startTime <= now && problem.endTime >= now;
  }

  /**
   * 問題の提出数を更新
   */
  static updateSubmissionCount(problemId: string, count: number): void {
    const problem = this.problems.get(problemId);
    if (problem) {
      problem.submissionCount = count;
    }
  }

  /**
   * 問題の残り時間を取得（秒）
   */
  static getRemainingTime(problemId: string): number {
    const problem = this.problems.get(problemId);
    if (!problem) return 0;
    
    const now = new Date();
    const remaining = problem.endTime.getTime() - now.getTime();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * 問題の進捗を取得（0-1）
   */
  static getProblemProgress(problemId: string): number {
    const problem = this.problems.get(problemId);
    if (!problem) return 0;
    
    const now = new Date();
    const total = problem.endTime.getTime() - problem.startTime.getTime();
    const elapsed = now.getTime() - problem.startTime.getTime();
    
    return Math.min(1, Math.max(0, elapsed / total));
  }

  /**
   * デフォルト問題を作成（テスト用）
   */
  static async createDefaultProblems(): Promise<void> {
    console.log('CompetitionProblemManager: オンライン対戦用問題を作成中...');
    
    // 1. 株式市場予測問題（回帰）
    const stockData = this.generateStockMarketData(5000);
    console.log('株式市場データ生成完了:', stockData.length, '件');
    
    await this.createProblem(
      'stock_market_prediction',
      'AI株価予測チャレンジ',
      '過去の株価データ、市場指標、ニュース感情分析から未来の株価を予測する高度な回帰問題。金融業界で実際に使用される手法を学習できます。',
      stockData,
      ['過去価格', '出来高', 'RSI', 'MACD', 'ボリンジャーバンド', 'ニュース感情スコア', 'VIX', '金利', 'GDP成長率', '失業率'],
      '予測価格',
      'regression'
    );
    console.log('株式市場問題作成完了');

    // 2. 医療画像診断問題（分類）
    const medicalData = this.generateMedicalImageData(8000);
    console.log('医療画像データ生成完了:', medicalData.length, '件');
    
    await this.createProblem(
      'medical_image_diagnosis',
      'AI医療画像診断コンペ',
      'X線画像から疾患を自動診断する分類問題。医療AIの最先端技術を体験し、人命に関わる重要な判断を学びます。',
      medicalData,
      ['画像特徴1', '画像特徴2', '画像特徴3', '画像特徴4', '画像特徴5', '画像特徴6', '画像特徴7', '画像特徴8', '患者年齢', '性別'],
      '疾患タイプ',
      'classification',
      ['正常', '肺炎', '結核', 'がん', 'その他']
    );
    console.log('医療画像問題作成完了');

    // 3. 自然言語処理問題（分類）
    const nlpData = this.generateNLPData(6000);
    console.log('NLPデータ生成完了:', nlpData.length, '件');
    
    await this.createProblem(
      'sentiment_analysis_advanced',
      '高度感情分析AI',
      'ソーシャルメディアの投稿から感情を分析し、ブランド評価や市場動向を予測する分類問題。自然言語処理の最新技術を学習します。',
      nlpData,
      ['単語数', '感情語彙スコア', '否定語数', '大文字率', '感嘆符数', '疑問符数', 'URL数', 'ハッシュタグ数', 'メンション数', '投稿時間'],
      '感情',
      'classification',
      ['ポジティブ', 'ネガティブ', 'ニュートラル', '複雑']
    );
    console.log('NLP問題作成完了');

    // 4. 自動運転問題（分類）
    const autonomousData = this.generateAutonomousDrivingData(7000);
    console.log('自動運転データ生成完了:', autonomousData.length, '件');
    
    await this.createProblem(
      'autonomous_driving',
      '自動運転AI開発',
      'センサーデータから交通状況を認識し、適切な運転行動を決定する分類問題。自動運転技術の核心を学習します。',
      autonomousData,
      ['前方距離', '左側距離', '右側距離', '後方距離', '速度', '加速度', 'ステアリング角度', 'ブレーキ圧', '天候', '時間帯'],
      '運転行動',
      'classification',
      ['直進', '左折', '右折', '停止', '加速', '減速']
    );
    console.log('自動運転問題作成完了');

    // 5. 気候変動予測問題（回帰）
    const climateData = this.generateClimateData(4000);
    console.log('気候データ生成完了:', climateData.length, '件');
    
    await this.createProblem(
      'climate_prediction',
      '気候変動予測AI',
      '気象データから地球温暖化の影響を予測する回帰問題。環境科学とAIの融合技術を学習します。',
      climateData,
      ['気温', '湿度', '気圧', '降水量', '風速', 'CO2濃度', '海面温度', '氷河面積', '森林面積', '人口密度'],
      '温度上昇',
      'regression'
    );
    console.log('気候変動問題作成完了');
    
    console.log('CompetitionProblemManager: オンライン対戦用問題作成完了。総問題数:', this.problems.size);
  }

  /**
   * 株式市場予測データを生成
   */
  private static generateStockMarketData(count: number): any[] {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const basePrice = 100 + Math.random() * 900; // 100-1000の価格帯
      const volume = Math.random() * 1000000;
      const rsi = Math.random() * 100;
      const macd = (Math.random() - 0.5) * 10;
      const bollinger = Math.random() * 50;
      const newsSentiment = (Math.random() - 0.5) * 2; // -1 to 1
      const vix = Math.random() * 50;
      const interestRate = Math.random() * 5;
      const gdpGrowth = (Math.random() - 0.5) * 10;
      const unemployment = Math.random() * 15;
      
      // 複雑な価格予測式
      const predictedPrice = basePrice * (1 + 
        (rsi - 50) * 0.001 + 
        macd * 0.01 + 
        newsSentiment * 0.05 + 
        (vix - 25) * -0.002 + 
        (interestRate - 2.5) * -0.01 + 
        gdpGrowth * 0.005 + 
        (unemployment - 7.5) * -0.003 +
        (Math.random() - 0.5) * 0.1 // ノイズ
      );
      
      data.push({
        features: [basePrice, volume, rsi, macd, bollinger, newsSentiment, vix, interestRate, gdpGrowth, unemployment],
        label: Math.max(0, predictedPrice)
      });
    }
    
    return data;
  }

  /**
   * 医療画像診断データを生成
   */
  private static generateMedicalImageData(count: number): any[] {
    const data = [];
    const diseases = ['正常', '肺炎', '結核', 'がん', 'その他'];
    
    for (let i = 0; i < count; i++) {
      const diseaseIndex = Math.floor(Math.random() * diseases.length);
      const age = 20 + Math.random() * 60;
      const gender = Math.random() > 0.5 ? 1 : 0;
      
      // 疾患に応じた特徴パターンを生成
      const baseFeatures = Array(8).fill(0).map(() => Math.random() * 100);
      
      if (diseaseIndex > 0) {
        // 疾患がある場合、特定の特徴を強調
        baseFeatures[diseaseIndex - 1] += 50 + Math.random() * 50;
        baseFeatures[7] += 30; // 最後の特徴も強調
      }
      
      data.push({
        features: [...baseFeatures, age, gender],
        label: diseases[diseaseIndex]
      });
    }
    
    return data;
  }

  /**
   * 自然言語処理データを生成
   */
  private static generateNLPData(count: number): any[] {
    const data = [];
    const sentiments = ['ポジティブ', 'ネガティブ', 'ニュートラル', '複雑'];
    
    for (let i = 0; i < count; i++) {
      const sentimentIndex = Math.floor(Math.random() * sentiments.length);
      const wordCount = 10 + Math.random() * 200;
      const emotionScore = Math.random() * 100;
      const negationCount = Math.random() * 10;
      const capsRate = Math.random();
      const exclamationCount = Math.random() * 20;
      const questionCount = Math.random() * 10;
      const urlCount = Math.random() * 5;
      const hashtagCount = Math.random() * 10;
      const mentionCount = Math.random() * 5;
      const postTime = Math.random() * 24;
      
      data.push({
        features: [wordCount, emotionScore, negationCount, capsRate, exclamationCount, questionCount, urlCount, hashtagCount, mentionCount, postTime],
        label: sentiments[sentimentIndex]
      });
    }
    
    return data;
  }

  /**
   * 自動運転データを生成
   */
  private static generateAutonomousDrivingData(count: number): any[] {
    const data = [];
    const actions = ['直進', '左折', '右折', '停止', '加速', '減速'];
    
    for (let i = 0; i < count; i++) {
      const actionIndex = Math.floor(Math.random() * actions.length);
      const frontDistance = Math.random() * 100;
      const leftDistance = Math.random() * 50;
      const rightDistance = Math.random() * 50;
      const rearDistance = Math.random() * 30;
      const speed = Math.random() * 120;
      const acceleration = (Math.random() - 0.5) * 10;
      const steeringAngle = (Math.random() - 0.5) * 180;
      const brakePressure = Math.random() * 100;
      const weather = Math.random() * 10;
      const timeOfDay = Math.random() * 24;
      
      data.push({
        features: [frontDistance, leftDistance, rightDistance, rearDistance, speed, acceleration, steeringAngle, brakePressure, weather, timeOfDay],
        label: actions[actionIndex]
      });
    }
    
    return data;
  }

  /**
   * 気候変動予測データを生成
   */
  private static generateClimateData(count: number): any[] {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const temperature = 15 + Math.random() * 20;
      const humidity = Math.random() * 100;
      const pressure = 980 + Math.random() * 40;
      const precipitation = Math.random() * 200;
      const windSpeed = Math.random() * 30;
      const co2Concentration = 300 + Math.random() * 200;
      const seaSurfaceTemp = 15 + Math.random() * 15;
      const glacierArea = Math.random() * 1000000;
      const forestArea = Math.random() * 10000000;
      const populationDensity = Math.random() * 1000;
      
      // 複雑な気候変動予測式
      const temperatureRise = (co2Concentration - 400) * 0.01 + 
                             (glacierArea - 500000) * -0.000001 + 
                             (forestArea - 5000000) * 0.0000001 + 
                             (populationDensity - 500) * 0.001 +
                             (Math.random() - 0.5) * 0.5;
      
      data.push({
        features: [temperature, humidity, pressure, precipitation, windSpeed, co2Concentration, seaSurfaceTemp, glacierArea, forestArea, populationDensity],
        label: Math.max(0, temperatureRise)
      });
    }
    
    return data;
  }

  /**
   * 分類問題用のサンプルデータを生成（レガシー）
   */
  private static generateClassificationData(count: number): any[] {
    const data = [];
    const classes = ['織田', '豊臣', '徳川', '武田', '上杉'];
    
    for (let i = 0; i < count; i++) {
      const classIndex = Math.floor(Math.random() * classes.length);
      const features = [
        Math.random() * 100, // 武力
        Math.random() * 100, // 知力
        Math.random() * 100, // 政治力
        Math.random() * 100, // 統率力
        Math.random() * 100  // 魅力
      ];
      
      data.push({
        features,
        label: classes[classIndex]
      });
    }
    
    return data;
  }

  /**
   * 回帰問題用のサンプルデータを生成
   */
  private static generateRegressionData(count: number): any[] {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const features = [
        Math.random() * 100000, // 石高
        Math.random() * 100,    // 防御力
        Math.random() * 100,    // 立地
        Math.random() * 500,    // 築城年
        Math.random() * 10      // 改修回数
      ];
      
      // 価値は特徴量の重み付き合計 + ノイズ
      const value = 
        features[0] * 0.3 +  // 石高
        features[1] * 0.2 +  // 防御力
        features[2] * 0.2 +  // 立地
        features[3] * 0.1 +  // 築城年
        features[4] * 0.2 +  // 改修回数
        (Math.random() - 0.5) * 10000; // ノイズ
      
      data.push({
        features,
        label: Math.max(0, value)
      });
    }
    
    return data;
  }
}

