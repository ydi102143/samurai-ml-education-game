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

  // パブリックスコアを計算
  private calculatePublicScore(submission: Submission): number {
    // ベーススコア（モデルとハイパーパラメータに基づく）
    let baseScore = 0.5;

    // モデルによる調整
    const modelAdjustments: Record<string, number> = {
      'logistic_regression': 0.0,
      'random_forest': 0.1,
      'svm': 0.05,
      'xgboost': 0.15,
      'neural_network': 0.08
    };

    baseScore += modelAdjustments[submission.modelName] || 0;

    // ハイパーパラメータの最適化による調整
    const hyperparameterBonus = this.calculateHyperparameterBonus(submission.metadata.hyperparameters);
    baseScore += hyperparameterBonus;

    // 前処理の効果
    const preprocessingBonus = submission.metadata.preprocessing.length * 0.02;
    baseScore += preprocessingBonus;

    // 特徴エンジニアリングの効果
    const featureEngineeringBonus = submission.metadata.featureEngineering.length * 0.03;
    baseScore += featureEngineeringBonus;

    // ランダム要素（現実的なばらつき）
    const randomFactor = (Math.random() - 0.5) * 0.1;
    baseScore += randomFactor;

    return Math.min(0.99, Math.max(0.01, baseScore));
  }

  // プライベートスコアを計算
  private calculatePrivateScore(submission: Submission, publicScore: number): number {
    // プライベートスコアはパブリックスコアに基づくが、少し異なる
    const privateAdjustment = (Math.random() - 0.5) * 0.05; // ±2.5%の調整
    return Math.min(0.99, Math.max(0.01, publicScore + privateAdjustment));
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
}

// シングルトンインスタンス
export const scoringSystem = new ScoringSystem();
