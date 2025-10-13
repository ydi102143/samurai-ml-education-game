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
  private async evaluateSubmission(submission: Submission) {
    try {
      // 実際の評価ロジック（簡易版）
      const publicScore = this.calculatePublicScore(submission);
      const privateScore = this.calculatePrivateScore(submission, publicScore);

      submission.publicScore = publicScore;
      submission.privateScore = privateScore;
      submission.status = 'evaluated';

      // 少し遅延を追加してリアルな感じに
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    } catch (error) {
      submission.status = 'failed';
      console.error('Submission evaluation failed:', error);
    }
  }

  // パブリックスコアを計算（現実的な実装）
  private calculatePublicScore(submission: Submission): number {
    // 実際の検証データでの性能をシミュレート
    const baseScore = this.simulateModelPerformance(submission);
    
    // データの複雑さによる調整
    const complexityAdjustment = this.calculateComplexityAdjustment(submission);
    
    // ハイパーパラメータの最適化度による調整
    const hyperparameterAdjustment = this.calculateHyperparameterAdjustment(submission.metadata.hyperparameters);
    
    // 前処理の効果による調整
    const preprocessingAdjustment = this.calculatePreprocessingAdjustment(submission.metadata.preprocessing);
    
    // 特徴量エンジニアリングの効果による調整
    const featureEngineeringAdjustment = this.calculateFeatureEngineeringAdjustment(submission.metadata.featureEngineering);
    
    // 最終スコアを計算
    const finalScore = baseScore + complexityAdjustment + hyperparameterAdjustment + 
                      preprocessingAdjustment + featureEngineeringAdjustment;
    
    return Math.min(0.99, Math.max(0.01, finalScore));
  }

  // プライベートスコアを計算（現実的な実装）
  private calculatePrivateScore(submission: Submission, publicScore: number): number {
    // Privateデータでの性能をシミュレート
    const privateDataComplexity = this.estimatePrivateDataComplexity(submission);
    
    // モデルの汎化性能を考慮
    const generalizationFactor = this.calculateGeneralizationFactor(submission);
    
    // 過学習の影響を考慮
    const overfittingPenalty = this.calculateOverfittingPenalty(submission, publicScore);
    
    // Privateスコアを計算
    const privateScore = publicScore * generalizationFactor - overfittingPenalty + privateDataComplexity;
    
    return Math.min(0.99, Math.max(0.01, privateScore));
  }

  // ハイパーパラメータボーナスを計算
  private calculateHyperparameterBonus(hyperparameters: Record<string, any>): number {
    let bonus = 0;

    // 学習率の最適化
    if (hyperparameters.learningRate) {
      const lr = hyperparameters.learningRate;
      if (lr >= 0.001 && lr <= 0.1) {
        bonus += 0.02;
      }
    }

    // 正則化の最適化
    if (hyperparameters.regularization) {
      const reg = hyperparameters.regularization;
      if (reg >= 0.01 && reg <= 0.1) {
        bonus += 0.02;
      }
    }

    // エポック数の最適化
    if (hyperparameters.maxIterations) {
      const epochs = hyperparameters.maxIterations;
      if (epochs >= 100 && epochs <= 1000) {
        bonus += 0.01;
      }
    }

    // ランダムフォレストのパラメータ
    if (hyperparameters.nEstimators) {
      const nEst = hyperparameters.nEstimators;
      if (nEst >= 50 && nEst <= 200) {
        bonus += 0.03;
      }
    }

    if (hyperparameters.maxDepth) {
      const maxDepth = hyperparameters.maxDepth;
      if (maxDepth >= 5 && maxDepth <= 15) {
        bonus += 0.02;
      }
    }

    return bonus;
  }

  // リーダーボードを更新
  private updateLeaderboard() {
    // ユーザーごとの最高スコアを取得
    const userScores = new Map<string, {
      userId: string;
      teamName: string;
      publicScore: number;
      privateScore: number;
      submissions: number;
      lastSubmission: Date;
      modelName: string;
    }>();

    this.submissions
      .filter(s => s.status === 'evaluated')
      .forEach(submission => {
        const existing = userScores.get(submission.userId);
        if (!existing || submission.publicScore > existing.publicScore) {
          userScores.set(submission.userId, {
            userId: submission.userId,
            teamName: `Team_${submission.userId}`,
            publicScore: submission.publicScore,
            privateScore: submission.privateScore,
            submissions: (existing?.submissions || 0) + 1,
            lastSubmission: submission.submittedAt,
            modelName: submission.modelName
          });
        } else if (existing) {
          existing.submissions++;
        }
      });

    // スコア順にソート
    this.leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.publicScore - a.publicScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: false // 後で設定
      }));
  }

  // リーダーボードを取得
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  // ユーザーの提出履歴を取得
  getUserSubmissions(userId: string): Submission[] {
    return this.submissions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // ユーザーの最高スコアを取得
  getUserBestScore(userId: string): number {
    const userSubmissions = this.getUserSubmissions(userId);
    return userSubmissions.length > 0 
      ? Math.max(...userSubmissions.map(s => s.publicScore))
      : 0;
  }

  // 統計情報を取得
  getStats() {
    const totalSubmissions = this.submissions.length;
    const evaluatedSubmissions = this.submissions.filter(s => s.status === 'evaluated').length;
    const averageScore = evaluatedSubmissions > 0 
      ? this.submissions
          .filter(s => s.status === 'evaluated')
          .reduce((sum, s) => sum + s.publicScore, 0) / evaluatedSubmissions
      : 0;

    return {
      totalSubmissions,
      evaluatedSubmissions,
      averageScore,
      totalParticipants: this.leaderboard.length
    };
  }

  // リスナーを追加
  onLeaderboardUpdate(callback: (leaderboard: LeaderboardEntry[]) => void) {
    this.listeners.push(callback);
  }

  // リスナーに通知
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.leaderboard));
  }

  // 現在のユーザーを設定
  setCurrentUser(userId: string) {
    this.leaderboard.forEach(entry => {
      entry.isCurrentUser = entry.userId === userId;
    });
  }

  // モデル性能をシミュレート
  private simulateModelPerformance(submission: Submission): number {
    const modelType = submission.modelName;
    const hyperparameters = submission.metadata.hyperparameters;
    
    // モデルタイプによる基本性能
    const basePerformance: Record<string, number> = {
      'logistic_regression': 0.75,
      'random_forest': 0.82,
      'svm': 0.78,
      'xgboost': 0.85,
      'neural_network': 0.80
    };
    
    let performance = basePerformance[modelType] || 0.70;
    
    // ハイパーパラメータの最適化度を評価
    const hyperparameterScore = this.evaluateHyperparameterQuality(hyperparameters, modelType);
    performance += hyperparameterScore * 0.1;
    
    return performance;
  }

  // データの複雑さによる調整を計算
  private calculateComplexityAdjustment(submission: Submission): number {
    // 前処理と特徴量エンジニアリングの数から複雑さを推定
    const preprocessingCount = submission.metadata.preprocessing.length;
    const featureEngineeringCount = submission.metadata.featureEngineering.length;
    
    const complexity = (preprocessingCount + featureEngineeringCount) / 10;
    return Math.min(0.05, complexity * 0.01);
  }

  // ハイパーパラメータの最適化度を評価
  private calculateHyperparameterAdjustment(hyperparameters: Record<string, any>): number {
    let adjustment = 0;
    
    // 学習率の最適化
    if (hyperparameters.learningRate) {
      const lr = hyperparameters.learningRate;
      if (lr >= 0.001 && lr <= 0.01) {
        adjustment += 0.02;
      } else if (lr > 0.01 && lr <= 0.1) {
        adjustment += 0.01;
      }
    }
    
    // 正則化の最適化
    if (hyperparameters.regularization) {
      const reg = hyperparameters.regularization;
      if (reg >= 0.001 && reg <= 0.01) {
        adjustment += 0.015;
      }
    }
    
    // エポック数の最適化
    if (hyperparameters.maxIterations) {
      const epochs = hyperparameters.maxIterations;
      if (epochs >= 100 && epochs <= 500) {
        adjustment += 0.01;
      }
    }
    
    return Math.min(0.1, adjustment);
  }

  // 前処理の効果を評価
  private calculatePreprocessingAdjustment(preprocessing: string[]): number {
    let adjustment = 0;
    
    // 各前処理手法の効果を評価
    preprocessing.forEach(method => {
      switch (method) {
        case 'missing_value_imputation':
          adjustment += 0.01;
          break;
        case 'outlier_removal':
          adjustment += 0.015;
          break;
        case 'feature_scaling':
          adjustment += 0.02;
          break;
        case 'categorical_encoding':
          adjustment += 0.01;
          break;
        default:
          adjustment += 0.005;
      }
    });
    
    return Math.min(0.05, adjustment);
  }

  // 特徴量エンジニアリングの効果を評価
  private calculateFeatureEngineeringAdjustment(featureEngineering: string[]): number {
    let adjustment = 0;
    
    // 各特徴量エンジニアリング手法の効果を評価
    featureEngineering.forEach(method => {
      switch (method) {
        case 'polynomial_features':
          adjustment += 0.02;
          break;
        case 'interaction_features':
          adjustment += 0.015;
          break;
        case 'log_transformation':
          adjustment += 0.01;
          break;
        case 'sqrt_transformation':
          adjustment += 0.01;
          break;
        case 'pca':
          adjustment += 0.01;
          break;
        default:
          adjustment += 0.005;
      }
    });
    
    return Math.min(0.05, adjustment);
  }

  // Privateデータの複雑さを推定
  private estimatePrivateDataComplexity(submission: Submission): number {
    // モデルの複雑さと前処理の量から推定
    const modelComplexity = this.getModelComplexity(submission.modelName);
    const preprocessingComplexity = submission.metadata.preprocessing.length * 0.01;
    
    return (modelComplexity + preprocessingComplexity) * 0.1;
  }

  // 汎化性能を計算
  private calculateGeneralizationFactor(submission: Submission): number {
    // 正則化の強さとモデルの複雑さから汎化性能を推定
    const regularization = submission.metadata.hyperparameters.regularization || 0.01;
    const modelComplexity = this.getModelComplexity(submission.modelName);
    
    // 正則化が強く、モデルが適度に複雑な場合、汎化性能が高い
    const regularizationFactor = Math.min(1.0, regularization * 10);
    const complexityFactor = Math.min(1.0, modelComplexity);
    
    return 0.8 + (regularizationFactor * 0.1) + (complexityFactor * 0.1);
  }

  // 過学習ペナルティを計算
  private calculateOverfittingPenalty(submission: Submission, publicScore: number): number {
    // モデルの複雑さと前処理の多さから過学習のリスクを推定
    const modelComplexity = this.getModelComplexity(submission.modelName);
    const preprocessingCount = submission.metadata.preprocessing.length;
    const featureEngineeringCount = submission.metadata.featureEngineering.length;
    
    const overfittingRisk = (modelComplexity + preprocessingCount + featureEngineeringCount) / 20;
    
    // 過学習リスクが高い場合、ペナルティを適用
    return overfittingRisk * 0.1;
  }

  // モデルの複雑さを取得
  private getModelComplexity(modelName: string): number {
    const complexityMap: Record<string, number> = {
      'logistic_regression': 0.3,
      'random_forest': 0.7,
      'svm': 0.6,
      'xgboost': 0.8,
      'neural_network': 0.9
    };
    
    return complexityMap[modelName] || 0.5;
  }

  // ハイパーパラメータの品質を評価
  private evaluateHyperparameterQuality(hyperparameters: Record<string, any>, modelType: string): number {
    let score = 0;
    
    // モデルタイプに応じた最適なハイパーパラメータ範囲を評価
    switch (modelType) {
      case 'logistic_regression':
        if (hyperparameters.learningRate >= 0.001 && hyperparameters.learningRate <= 0.01) score += 0.5;
        if (hyperparameters.regularization >= 0.001 && hyperparameters.regularization <= 0.1) score += 0.5;
        break;
      case 'random_forest':
        if (hyperparameters.nEstimators >= 50 && hyperparameters.nEstimators <= 200) score += 0.5;
        if (hyperparameters.maxDepth >= 5 && hyperparameters.maxDepth <= 15) score += 0.5;
        break;
      case 'svm':
        if (hyperparameters.C >= 0.1 && hyperparameters.C <= 10) score += 0.5;
        if (hyperparameters.gamma && hyperparameters.gamma !== 'auto') score += 0.5;
        break;
    }
    
    return score;
  }
}

// シングルトンインスタンス
export const scoringSystem = new ScoringSystem();
