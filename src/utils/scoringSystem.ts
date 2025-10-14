// Kaggleライクなスコアリングシステム
export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  modelName: string;
  score: number;
  publicScore: number;
  privateScore: number;
  submittedAt: Date;
  status: 'pending' | 'evaluated' | 'failed';
  metadata: {
    hyperparameters: Record<string, any>;
    preprocessing: string[];
    featureEngineering: string[];
    trainingTime: number;
    validationTime: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  teamName: string;
  publicScore: number;
  privateScore: number;
  submissions: number;
  lastSubmission: Date;
  modelName: string;
  isCurrentUser: boolean;
}

export class ScoringSystem {
  private submissions: Submission[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private listeners: ((leaderboard: LeaderboardEntry[]) => void)[] = [];

  // 提出を追加
  addSubmission(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Submission {
    const newSubmission: Submission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date(),
      status: 'pending'
    };

    this.submissions.push(newSubmission);
    this.evaluateSubmission(newSubmission);
    this.updateLeaderboard();
    this.notifyListeners();

    return newSubmission;
  }

  // 提出を評価
  private evaluateSubmission(submission: Submission) {
    try {
      // パブリックスコアを計算
      const publicScore = this.calculatePublicScore(submission);
      
      // プライベートスコアを計算（実際のコンペでは後で計算）
      const privateScore = this.calculatePrivateScore(submission);

      submission.publicScore = publicScore;
      submission.privateScore = privateScore;
      submission.score = publicScore; // 現在はパブリックスコアを使用
      submission.status = 'evaluated';

      console.log(`Submission evaluated: ${submission.id}, Public: ${publicScore.toFixed(4)}, Private: ${privateScore.toFixed(4)}`);
    } catch (error) {
      console.error('Failed to evaluate submission:', error);
      submission.status = 'failed';
    }
  }

  // パブリックスコアを計算
  private calculatePublicScore(submission: Submission): number {
    // ベーススコア（モデル性能に基づく）
    let baseScore = this.simulateModelPerformance(submission);
    
    // 複雑さ調整
    const complexityAdjustment = this.calculateComplexityAdjustment(submission);
    
    // ハイパーパラメータ調整
    const hyperparameterAdjustment = this.calculateHyperparameterAdjustment(submission.metadata.hyperparameters);
    
    // 前処理調整
    const preprocessingAdjustment = this.calculatePreprocessingAdjustment(submission.metadata.preprocessing);
    
    // 特徴エンジニアリング調整
    const featureEngineeringAdjustment = this.calculateFeatureEngineeringAdjustment(submission.metadata.featureEngineering);
    
    // 最終スコア計算
    const finalScore = baseScore * complexityAdjustment * hyperparameterAdjustment * preprocessingAdjustment * featureEngineeringAdjustment;
    
    return Math.max(0, Math.min(100, finalScore));
  }

  // プライベートスコアを計算
  private calculatePrivateScore(submission: Submission): number {
    const publicScore = submission.publicScore;
    
    // プライベートデータの複雑さを推定
    const privateDataComplexity = this.estimatePrivateDataComplexity(submission);
    
    // 汎化性能を計算
    const generalizationFactor = this.calculateGeneralizationFactor(submission);
    
    // オーバーフィッティングペナルティ
    const overfittingPenalty = this.calculateOverfittingPenalty(submission, publicScore);
    
    // プライベートスコア計算
    const privateScore = publicScore * privateDataComplexity * generalizationFactor * overfittingPenalty;
    
    return Math.max(0, Math.min(100, privateScore));
  }

  // モデル性能をシミュレート
  private simulateModelPerformance(submission: Submission): number {
    const modelType = submission.modelName;
    const basePerformance = this.getModelBasePerformance(modelType);
    
    // ハイパーパラメータの影響
    const hyperparameterQuality = this.evaluateHyperparameterQuality(submission.metadata.hyperparameters, modelType);
    
    // 前処理の影響
    const preprocessingQuality = submission.metadata.preprocessing.length * 0.1;
    
    // 特徴エンジニアリングの影響
    const featureEngineeringQuality = submission.metadata.featureEngineering.length * 0.05;
    
    return basePerformance * (1 + hyperparameterQuality + preprocessingQuality + featureEngineeringQuality);
  }

  // モデルの基本性能を取得
  private getModelBasePerformance(modelType: string): number {
    const performanceMap: Record<string, number> = {
      'ロジスティック回帰': 75,
      '線形回帰': 70,
      'ランダムフォレスト': 85,
      'SVM': 80,
      'XGBoost': 90,
      'ニューラルネットワーク': 88,
      'リッジ回帰': 72,
      'ラッソ回帰': 68
    };
    
    return performanceMap[modelType] || 70;
  }

  // 複雑さ調整を計算
  private calculateComplexityAdjustment(submission: Submission): number {
    const preprocessingCount = submission.metadata.preprocessing.length;
    const featureEngineeringCount = submission.metadata.featureEngineering.length;
    
    // 適度な複雑さが良いスコアにつながる
    const totalComplexity = preprocessingCount + featureEngineeringCount;
    
    if (totalComplexity === 0) return 0.8; // 何もしないのは低いスコア
    if (totalComplexity <= 3) return 1.0; // 適度な複雑さ
    if (totalComplexity <= 6) return 1.1; // 良い複雑さ
    if (totalComplexity <= 10) return 1.05; // やや複雑すぎる
    return 0.95; // 複雑すぎる
  }

  // ハイパーパラメータ調整を計算
  private calculateHyperparameterAdjustment(hyperparameters: Record<string, any>): number {
    let adjustment = 1.0;
    
    // 学習率の影響
    if (hyperparameters.learningRate) {
      const lr = hyperparameters.learningRate;
      if (lr >= 0.001 && lr <= 0.1) adjustment *= 1.1;
      else if (lr < 0.001 || lr > 0.3) adjustment *= 0.9;
    }
    
    // 正則化の影響
    if (hyperparameters.regularization) {
      const reg = hyperparameters.regularization;
      if (reg >= 0.01 && reg <= 0.1) adjustment *= 1.05;
      else if (reg < 0.001 || reg > 1.0) adjustment *= 0.95;
    }
    
    // エポック数の影響
    if (hyperparameters.epochs) {
      const epochs = hyperparameters.epochs;
      if (epochs >= 50 && epochs <= 200) adjustment *= 1.05;
      else if (epochs < 10 || epochs > 500) adjustment *= 0.9;
    }
    
    return adjustment;
  }

  // 前処理調整を計算
  private calculatePreprocessingAdjustment(preprocessing: string[]): number {
    let adjustment = 1.0;
    
    // 有用な前処理手法
    const usefulPreprocessing = ['missing_value_imputation', 'outlier_removal', 'scaling', 'categorical_encoding'];
    const usefulCount = preprocessing.filter(p => usefulPreprocessing.includes(p)).length;
    
    adjustment += usefulCount * 0.05;
    
    // 過度な前処理はペナルティ
    if (preprocessing.length > 8) {
      adjustment *= 0.95;
    }
    
    return adjustment;
  }

  // 特徴エンジニアリング調整を計算
  private calculateFeatureEngineeringAdjustment(featureEngineering: string[]): number {
    let adjustment = 1.0;
    
    // 有用な特徴エンジニアリング手法
    const usefulFeatureEngineering = ['polynomial_features', 'log_transformation', 'feature_combination', 'pca'];
    const usefulCount = featureEngineering.filter(f => usefulFeatureEngineering.includes(f)).length;
    
    adjustment += usefulCount * 0.03;
    
    // 過度な特徴エンジニアリングはペナルティ
    if (featureEngineering.length > 10) {
      adjustment *= 0.9;
    }
    
    return adjustment;
  }

  // プライベートデータの複雑さを推定
  private estimatePrivateDataComplexity(submission: Submission): number {
    const modelComplexity = this.getModelComplexity(submission.modelName);
    const preprocessingComplexity = submission.metadata.preprocessing.length * 0.1;
    const featureEngineeringComplexity = submission.metadata.featureEngineering.length * 0.05;
    
    const totalComplexity = modelComplexity + preprocessingComplexity + featureEngineeringComplexity;
    
    // 複雑さが高いほど、プライベートデータでの性能が変動しやすい
    return Math.max(0.8, Math.min(1.2, 1.0 + (totalComplexity - 1.0) * 0.1));
  }

  // 汎化性能を計算
  private calculateGeneralizationFactor(submission: Submission): number {
    const regularization = submission.metadata.hyperparameters.regularization || 0;
    const modelComplexity = this.getModelComplexity(submission.modelName);
    
    // 正則化が適切で、モデルが適度に複雑な場合、汎化性能が良い
    let generalizationFactor = 1.0;
    
    if (regularization > 0.01 && regularization < 0.1) {
      generalizationFactor += 0.1;
    }
    
    if (modelComplexity > 0.5 && modelComplexity < 1.5) {
      generalizationFactor += 0.05;
    }
    
    return Math.max(0.8, Math.min(1.2, generalizationFactor));
  }

  // オーバーフィッティングペナルティを計算
  private calculateOverfittingPenalty(submission: Submission, publicScore: number): number {
    const modelComplexity = this.getModelComplexity(submission.modelName);
    const featureEngineeringCount = submission.metadata.featureEngineering.length;
    const preprocessingCount = submission.metadata.preprocessing.length;
    
    const totalComplexity = modelComplexity + featureEngineeringCount * 0.1 + preprocessingCount * 0.05;
    
    // 複雑さが高く、スコアが高い場合、オーバーフィッティングの可能性
    if (totalComplexity > 2.0 && publicScore > 85) {
      return 0.9; // 10%のペナルティ
    }
    
    return 1.0;
  }

  // モデルの複雑さを取得
  private getModelComplexity(modelName: string): number {
    const complexityMap: Record<string, number> = {
      'ロジスティック回帰': 0.5,
      '線形回帰': 0.5,
      'ランダムフォレスト': 1.2,
      'SVM': 1.0,
      'XGBoost': 1.5,
      'ニューラルネットワーク': 1.8,
      'リッジ回帰': 0.6,
      'ラッソ回帰': 0.7
    };
    
    return complexityMap[modelName] || 1.0;
  }

  // ハイパーパラメータの品質を評価
  private evaluateHyperparameterQuality(hyperparameters: Record<string, any>, modelType: string): number {
    let quality = 0;
    
    // 学習率の評価
    if (hyperparameters.learningRate) {
      const lr = hyperparameters.learningRate;
      if (lr >= 0.001 && lr <= 0.01) quality += 0.1;
      else if (lr >= 0.01 && lr <= 0.1) quality += 0.05;
    }
    
    // 正則化の評価
    if (hyperparameters.regularization) {
      const reg = hyperparameters.regularization;
      if (reg >= 0.01 && reg <= 0.1) quality += 0.1;
      else if (reg >= 0.001 && reg <= 0.5) quality += 0.05;
    }
    
    // エポック数の評価
    if (hyperparameters.epochs) {
      const epochs = hyperparameters.epochs;
      if (epochs >= 50 && epochs <= 200) quality += 0.05;
    }
    
    return quality;
  }

  // リーダーボードを更新
  private updateLeaderboard() {
    // ユーザーごとに最高スコアを取得
    const userScores = new Map<string, Submission>();
    
    this.submissions.forEach(submission => {
      if (submission.status === 'evaluated') {
        const existing = userScores.get(submission.userId);
        if (!existing || submission.score > existing.score) {
          userScores.set(submission.userId, submission);
        }
      }
    });

    // リーダーボードエントリを作成
    this.leaderboard = Array.from(userScores.values())
      .map(submission => ({
        rank: 0,
        userId: submission.userId,
        teamName: `Team ${submission.userId.slice(-4)}`,
        publicScore: submission.publicScore,
        privateScore: submission.privateScore,
        submissions: this.submissions.filter(s => s.userId === submission.userId).length,
        lastSubmission: submission.submittedAt,
        modelName: submission.modelName,
        isCurrentUser: false
      }))
      .sort((a, b) => b.publicScore - a.publicScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  // リスナーを追加
  addListener(listener: (leaderboard: LeaderboardEntry[]) => void) {
    this.listeners.push(listener);
  }

  // リスナーを削除
  removeListener(listener: (leaderboard: LeaderboardEntry[]) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // リスナーに通知
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.leaderboard));
  }

  // リーダーボードを取得
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  // 提出履歴を取得
  getSubmissions(userId?: string): Submission[] {
    if (userId) {
      return this.submissions.filter(s => s.userId === userId);
    }
    return [...this.submissions];
  }

  // 統計情報を取得
  getStats() {
    const totalSubmissions = this.submissions.length;
    const evaluatedSubmissions = this.submissions.filter(s => s.status === 'evaluated').length;
    const failedSubmissions = this.submissions.filter(s => s.status === 'failed').length;
    
    const averageScore = evaluatedSubmissions > 0 
      ? this.submissions
          .filter(s => s.status === 'evaluated')
          .reduce((sum, s) => sum + s.score, 0) / evaluatedSubmissions
      : 0;

    return {
      totalSubmissions,
      evaluatedSubmissions,
      failedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      leaderboardSize: this.leaderboard.length
    };
  }
}

// シングルトンインスタンス
export const scoringSystem = new ScoringSystem();

