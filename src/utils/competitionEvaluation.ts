// コンペティション評価システム
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
}

export interface EvaluationResult {
  submissionId: string;
  userId: string;
  problemId: string;
  modelName: string;
  metrics: EvaluationMetrics;
  score: number;
  rank: number;
  evaluatedAt: Date;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface ProblemLeaderboard {
  problemId: string;
  entries: LeaderboardEntry[];
  totalSubmissions: number;
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  modelName: string;
  submittedAt: Date;
  isCurrentUser: boolean;
}

export class CompetitionEvaluator {
  private evaluationResults: Map<string, EvaluationResult> = new Map();
  private problemLeaderboards: Map<string, ProblemLeaderboard> = new Map();
  private listeners: Set<(result: EvaluationResult) => void> = new Set();

  // 提出を評価
  evaluateSubmission(
    submissionId: string,
    userId: string,
    problemId: string,
    modelName: string,
    predictions: number[],
    actualValues: number[],
    problemType: 'classification' | 'regression'
  ): EvaluationResult {
    try {
      const metrics = this.calculateMetrics(predictions, actualValues, problemType);
      const score = this.calculateScore(metrics, problemType);
      
      const result: EvaluationResult = {
        submissionId,
        userId,
        problemId,
        modelName,
        metrics,
        score,
        rank: 0,
        evaluatedAt: new Date(),
        status: 'success'
      };

      this.evaluationResults.set(submissionId, result);
      this.updateProblemLeaderboard(problemId, result);
      this.notifyListeners(result);

      return result;
    } catch (error) {
      const result: EvaluationResult = {
        submissionId,
        userId,
        problemId,
        modelName,
        metrics: {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1_score: 0,
          mae: 0,
          mse: 0,
          rmse: 0,
          r2: 0
        },
        score: 0,
        rank: 0,
        evaluatedAt: new Date(),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      this.evaluationResults.set(submissionId, result);
      this.notifyListeners(result);

      return result;
    }
  }

  // メトリクスを計算
  private calculateMetrics(
    predictions: number[],
    actualValues: number[],
    problemType: 'classification' | 'regression'
  ): EvaluationMetrics {
    if (predictions.length !== actualValues.length) {
      throw new Error('Predictions and actual values must have the same length');
    }

    if (problemType === 'classification') {
      return this.calculateClassificationMetrics(predictions, actualValues);
    } else {
      return this.calculateRegressionMetrics(predictions, actualValues);
    }
  }

  // 分類メトリクスを計算
  private calculateClassificationMetrics(predictions: number[], actualValues: number[]): EvaluationMetrics {
    // 予測値を0または1に変換
    const binaryPredictions = predictions.map(p => p > 0.5 ? 1 : 0);
    
    // 混同行列を計算
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < binaryPredictions.length; i++) {
      const predicted = binaryPredictions[i];
      const actual = actualValues[i];

      if (predicted === 1 && actual === 1) {
        truePositives++;
      } else if (predicted === 1 && actual === 0) {
        falsePositives++;
      } else if (predicted === 0 && actual === 0) {
        trueNegatives++;
      } else if (predicted === 0 && actual === 1) {
        falseNegatives++;
      }
    }

    // 精度を計算
    const accuracy = (truePositives + trueNegatives) / (truePositives + falsePositives + trueNegatives + falseNegatives);
    
    // 適合率を計算
    const precision = truePositives / (truePositives + falsePositives) || 0;
    
    // 再現率を計算
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    
    // F1スコアを計算
    const f1_score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1_score,
      mae: 0,
      mse: 0,
      rmse: 0,
      r2: 0
    };
  }

  // 回帰メトリクスを計算
  private calculateRegressionMetrics(predictions: number[], actualValues: number[]): EvaluationMetrics {
    const n = predictions.length;
    
    // 平均絶対誤差 (MAE)
    const mae = predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actualValues[i]), 0) / n;
    
    // 平均二乗誤差 (MSE)
    const mse = predictions.reduce((sum, pred, i) => {
      const error = pred - actualValues[i];
      return sum + error * error;
    }, 0) / n;
    
    // 平方根平均二乗誤差 (RMSE)
    const rmse = Math.sqrt(mse);
    
    // R²スコア
    const actualMean = actualValues.reduce((sum, val) => sum + val, 0) / n;
    const ssRes = predictions.reduce((sum, pred, i) => {
      const error = pred - actualValues[i];
      return sum + error * error;
    }, 0);
    const ssTot = actualValues.reduce((sum, val) => {
      const error = val - actualMean;
      return sum + error * error;
    }, 0);
    const r2 = 1 - (ssRes / ssTot);

    return {
      accuracy: Math.max(0, r2),
      precision: 0,
      recall: 0,
      f1_score: 0,
      mae,
      mse,
      rmse,
      r2
    };
  }

  // スコアを計算
  private calculateScore(metrics: EvaluationMetrics, problemType: 'classification' | 'regression'): number {
    if (problemType === 'classification') {
      // 分類問題ではF1スコアを主な指標として使用
      return metrics.f1_score * 100;
    } else {
      // 回帰問題ではR²スコアを主な指標として使用
      return Math.max(0, metrics.r2 * 100);
    }
  }

  // 問題のリーダーボードを更新
  private updateProblemLeaderboard(problemId: string, result: EvaluationResult): void {
    if (!this.problemLeaderboards.has(problemId)) {
      this.problemLeaderboards.set(problemId, {
        problemId,
        entries: [],
        totalSubmissions: 0,
        lastUpdated: new Date()
      });
    }

    const leaderboard = this.problemLeaderboards.get(problemId)!;
    
    // 既存のエントリを更新または追加
    const existingIndex = leaderboard.entries.findIndex(entry => entry.userId === result.userId);
    
    const leaderboardEntry: LeaderboardEntry = {
      rank: 0,
      userId: result.userId,
      username: `User_${result.userId.slice(-4)}`,
      score: result.score,
      modelName: result.modelName,
      submittedAt: result.evaluatedAt,
      isCurrentUser: false
    };

    if (existingIndex >= 0) {
      leaderboard.entries[existingIndex] = leaderboardEntry;
    } else {
      leaderboard.entries.push(leaderboardEntry);
    }

    // スコアでソート
    leaderboard.entries.sort((a, b) => b.score - a.score);
    
    // ランクを更新
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    leaderboard.totalSubmissions++;
    leaderboard.lastUpdated = new Date();
  }

  // 評価結果を取得
  getEvaluationResult(submissionId: string): EvaluationResult | undefined {
    return this.evaluationResults.get(submissionId);
  }

  // 問題のリーダーボードを取得
  getProblemLeaderboard(problemId: string): ProblemLeaderboard | undefined {
    return this.problemLeaderboards.get(problemId);
  }

  // 全評価結果を取得
  getAllEvaluationResults(): EvaluationResult[] {
    return Array.from(this.evaluationResults.values());
  }

  // ユーザーの評価結果を取得
  getUserEvaluationResults(userId: string): EvaluationResult[] {
    return this.getAllEvaluationResults().filter(result => result.userId === userId);
  }

  // 問題の評価結果を取得
  getProblemEvaluationResults(problemId: string): EvaluationResult[] {
    return this.getAllEvaluationResults().filter(result => result.problemId === problemId);
  }

  // 統計情報を取得
  getStatistics(): {
    totalEvaluations: number;
    successfulEvaluations: number;
    failedEvaluations: number;
    averageScore: number;
    bestScore: number;
    evaluationsByProblem: Record<string, number>;
    evaluationsByModel: Record<string, number>;
  } {
    const allResults = this.getAllEvaluationResults();
    const successfulResults = allResults.filter(result => result.status === 'success');
    const failedResults = allResults.filter(result => result.status === 'failed');

    const averageScore = successfulResults.length > 0
      ? successfulResults.reduce((sum, result) => sum + result.score, 0) / successfulResults.length
      : 0;

    const bestScore = successfulResults.length > 0
      ? Math.max(...successfulResults.map(result => result.score))
      : 0;

    const evaluationsByProblem: Record<string, number> = {};
    const evaluationsByModel: Record<string, number> = {};

    allResults.forEach(result => {
      evaluationsByProblem[result.problemId] = (evaluationsByProblem[result.problemId] || 0) + 1;
      evaluationsByModel[result.modelName] = (evaluationsByModel[result.modelName] || 0) + 1;
    });

    return {
      totalEvaluations: allResults.length,
      successfulEvaluations: successfulResults.length,
      failedEvaluations: failedResults.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      evaluationsByProblem,
      evaluationsByModel
    };
  }

  // リスナーを追加
  addListener(listener: (result: EvaluationResult) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (result: EvaluationResult) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(result: EvaluationResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // データをクリア
  clear(): void {
    this.evaluationResults.clear();
    this.problemLeaderboards.clear();
  }
}

// シングルトンインスタンス
export const competitionEvaluator = new CompetitionEvaluator();

