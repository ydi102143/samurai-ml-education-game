// Public/Private評価システム
export interface EvaluationResult {
  publicScore: number;
  privateScore?: number;
  publicRank?: number;
  privateRank?: number;
  totalParticipants: number;
  evaluationDate: Date;
  isFinal: boolean;
  detailedMetrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mae?: number;
    rmse?: number;
    r2?: number;
  };
  modelInfo?: {
    modelType: string;
    selectedFeatures: number[];
    parameters: any;
    trainingTime: number;
    featureImportance?: number[];
  };
}

export interface WeeklyCompetition {
  id: string;
  week: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  publicData: any[];
  privateData: any[];
  problemType: 'classification' | 'regression';
  metric: 'accuracy' | 'mae' | 'rmse' | 'f1';
}

export class EvaluationSystem {
  private static competitions: Map<string, WeeklyCompetition> = new Map();
  private static submissions: Map<string, any[]> = new Map();

  // 週間コンペティションを作成
  static createWeeklyCompetition(
    week: number,
    year: number,
    publicData: any[],
    privateData: any[],
    problemType: 'classification' | 'regression',
    metric: 'accuracy' | 'mae' | 'rmse' | 'f1' = 'accuracy'
  ): WeeklyCompetition {
    const id = `week_${year}_${week}`;
    const startDate = new Date(year, 0, 1);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const competition: WeeklyCompetition = {
      id,
      week,
      year,
      startDate,
      endDate,
      isActive: true,
      publicData,
      privateData,
      problemType,
      metric
    };

    this.competitions.set(id, competition);
    this.submissions.set(id, []);

    return competition;
  }

  // 提出を追加
  static addSubmission(
    competitionId: string,
    userId: string,
    username: string,
    modelType: string,
    selectedFeatures: number[],
    parameters: any,
    publicScore: number,
    trainingTime: number
  ): void {
    const submissions = this.submissions.get(competitionId) || [];
    const submission = {
      id: `sub_${Date.now()}`,
      competitionId,
      userId,
      username,
      modelType,
      selectedFeatures,
      parameters,
      publicScore,
      privateScore: undefined,
      trainingTime,
      submittedAt: new Date(),
      isEvaluated: false
    };

    submissions.push(submission);
    this.submissions.set(competitionId, submissions);

    // ローカルストレージにも保存
    const storageKey = `competition_${competitionId}_submissions`;
    localStorage.setItem(storageKey, JSON.stringify(submissions));
  }

  // Publicスコアでリーダーボードを取得
  static getPublicLeaderboard(competitionId: string): any[] {
    const submissions = this.submissions.get(competitionId) || [];
    const storageKey = `competition_${competitionId}_submissions`;
    const storedSubmissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const allSubmissions = [...submissions, ...storedSubmissions];
    
    return allSubmissions
      .sort((a, b) => b.publicScore - a.publicScore)
      .map((sub, index) => ({
        ...sub,
        publicRank: index + 1
      }));
  }

  // 週間コンペティションが終了したかチェック
  static isCompetitionEnded(competitionId: string): boolean {
    const competition = this.competitions.get(competitionId);
    if (!competition) return false;
    
    return new Date() > competition.endDate;
  }

  // 週間コンペティション終了時にPrivate評価を実行
  static async evaluatePrivateData(competitionId: string): Promise<void> {
    const competition = this.competitions.get(competitionId);
    if (!competition) return;

    const submissions = this.submissions.get(competitionId) || [];
    const storageKey = `competition_${competitionId}_submissions`;
    const storedSubmissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const allSubmissions = [...submissions, ...storedSubmissions];

    // 各提出に対してPrivate評価を実行
    for (const submission of allSubmissions) {
      if (submission.isEvaluated) continue;

      try {
        const privateScore = await this.calculatePrivateScore(
          submission,
          competition.privateData,
          competition.problemType,
          competition.metric
        );

        submission.privateScore = privateScore;
        submission.isEvaluated = true;
        submission.evaluatedAt = new Date();

      } catch (error) {
        console.error(`Private評価エラー (${submission.id}):`, error);
        submission.privateScore = 0;
        submission.isEvaluated = true;
        submission.evaluatedAt = new Date();
      }
    }

    // 更新された提出を保存
    this.submissions.set(competitionId, allSubmissions);
    localStorage.setItem(storageKey, JSON.stringify(allSubmissions));

    // コンペティションを非アクティブに
    competition.isActive = false;
    this.competitions.set(competitionId, competition);
  }

  // 詳細な評価メトリクスを計算
  static calculateDetailedMetrics(
    predictions: number[],
    actual: number[],
    problemType: 'classification' | 'regression'
  ): any {
    if (predictions.length !== actual.length) {
      throw new Error('予測値と実際の値の長さが一致しません');
    }

    if (problemType === 'classification') {
      return this.calculateClassificationMetrics(predictions, actual);
    } else {
      return this.calculateRegressionMetrics(predictions, actual);
    }
  }

  // 分類問題のメトリクスを計算
  private static calculateClassificationMetrics(predictions: number[], actual: number[]): any {
    const n = predictions.length;
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < n; i++) {
      const pred = Math.round(predictions[i]);
      const act = Math.round(actual[i]);
      
      if (pred === 1 && act === 1) truePositives++;
      else if (pred === 1 && act === 0) falsePositives++;
      else if (pred === 0 && act === 0) trueNegatives++;
      else if (pred === 0 && act === 1) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / n;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score
    };
  }

  // 回帰問題のメトリクスを計算
  private static calculateRegressionMetrics(predictions: number[], actual: number[]): any {
    const n = predictions.length;
    
    // MAE (Mean Absolute Error)
    const mae = predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actual[i]), 0) / n;
    
    // RMSE (Root Mean Square Error)
    const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - actual[i], 2), 0) / n;
    const rmse = Math.sqrt(mse);
    
    // R² (決定係数)
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
    const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(actual[i] - pred, 2), 0);
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return {
      mae,
      rmse,
      r2
    };
  }

  // Privateスコアを計算
  private static async calculatePrivateScore(
    submission: any,
    privateData: any[],
    problemType: 'classification' | 'regression',
    metric: 'accuracy' | 'mae' | 'rmse' | 'f1'
  ): Promise<number> {
    // 実際の実装では、提出されたモデルを使ってPrivateデータで評価
    // ここでは簡略化してランダムなスコアを生成
    const baseScore = submission.publicScore;
    const noise = (Math.random() - 0.5) * 0.1; // ±5%のノイズ
    const privateScore = Math.max(0, Math.min(1, baseScore + noise));
    
    return privateScore;
  }

  // 最終リーダーボードを取得
  static getFinalLeaderboard(competitionId: string): any[] {
    const submissions = this.submissions.get(competitionId) || [];
    const storageKey = `competition_${competitionId}_submissions`;
    const storedSubmissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const allSubmissions = [...submissions, ...storedSubmissions];
    
    return allSubmissions
      .filter(sub => sub.isEvaluated && sub.privateScore !== undefined)
      .sort((a, b) => b.privateScore - a.publicScore) // Privateスコアでソート
      .map((sub, index) => ({
        ...sub,
        privateRank: index + 1,
        finalScore: sub.privateScore
      }));
  }

  // 現在の週間コンペティションを取得
  static getCurrentCompetition(): WeeklyCompetition | null {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = this.getWeekNumber(now);

    const competitionId = `week_${currentYear}_${currentWeek}`;
    return this.competitions.get(competitionId) || null;
  }

  // 週番号を取得
  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // 週間コンペティションの統計を取得
  static getCompetitionStats(competitionId: string): {
    totalSubmissions: number;
    averagePublicScore: number;
    averagePrivateScore?: number;
    bestPublicScore: number;
    bestPrivateScore?: number;
    participationRate: number;
  } {
    const submissions = this.submissions.get(competitionId) || [];
    const storageKey = `competition_${competitionId}_submissions`;
    const storedSubmissions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const allSubmissions = [...submissions, ...storedSubmissions];
    
    if (allSubmissions.length === 0) {
      return {
        totalSubmissions: 0,
        averagePublicScore: 0,
        bestPublicScore: 0,
        participationRate: 0
      };
    }

    const publicScores = allSubmissions.map(s => s.publicScore);
    const privateScores = allSubmissions.filter(s => s.privateScore !== undefined).map(s => s.privateScore);

    return {
      totalSubmissions: allSubmissions.length,
      averagePublicScore: publicScores.reduce((a, b) => a + b, 0) / publicScores.length,
      averagePrivateScore: privateScores.length > 0 ? privateScores.reduce((a, b) => a + b, 0) / privateScores.length : undefined,
      bestPublicScore: Math.max(...publicScores),
      bestPrivateScore: privateScores.length > 0 ? Math.max(...privateScores) : undefined,
      participationRate: allSubmissions.length / 100 // 仮の参加率
    };
  }

  // 週間コンペティションを初期化
  static initializeWeeklyCompetition(): WeeklyCompetition {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = this.getWeekNumber(now);

    // サンプルデータを生成
    const publicData = this.generateSampleData(100, 'public');
    const privateData = this.generateSampleData(50, 'private');

    return this.createWeeklyCompetition(
      currentWeek,
      currentYear,
      publicData,
      privateData,
      'classification',
      'accuracy'
    );
  }

  // サンプルデータを生成
  private static generateSampleData(count: number, type: 'public' | 'private'): any[] {
    const data = [];
    for (let i = 0; i < count; i++) {
      const features = [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100
      ];
      const label = Math.random() > 0.5 ? 1 : 0;
      
      data.push({
        features,
        label,
        id: `${type}_${i}`,
        type
      });
    }
    return data;
  }
}
