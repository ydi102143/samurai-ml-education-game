// 評価システム
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

export interface EvaluationConfig {
  enableCrossValidation: boolean;
  crossValidationFolds: number;
  enableEarlyStopping: boolean;
  patience: number;
  minImprovement: number;
}

export class EvaluationSystem {
  private evaluationResults: Map<string, EvaluationResult> = new Map();
  private config: EvaluationConfig;
  private listeners: Set<(result: EvaluationResult) => void> = new Set();

  constructor(config: EvaluationConfig = {
    enableCrossValidation: true,
    crossValidationFolds: 5,
    enableEarlyStopping: true,
    patience: 10,
    minImprovement: 0.001
  }) {
    this.config = config;
  }

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
    const binaryPredictions = predictions.map(p => p > 0.5 ? 1 : 0);
    
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

    const accuracy = (truePositives + trueNegatives) / (truePositives + falsePositives + trueNegatives + falseNegatives);
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
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
    
    const mae = predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actualValues[i]), 0) / n;
    const mse = predictions.reduce((sum, pred, i) => {
      const error = pred - actualValues[i];
      return sum + error * error;
    }, 0) / n;
    const rmse = Math.sqrt(mse);
    
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
      return metrics.f1_score * 100;
    } else {
      return Math.max(0, metrics.r2 * 100);
    }
  }

  // 評価結果を取得
  getEvaluationResult(submissionId: string): EvaluationResult | undefined {
    return this.evaluationResults.get(submissionId);
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
  getStats(): {
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
        console.error('Evaluation listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<EvaluationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): EvaluationConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.evaluationResults.clear();
  }
}

// シングルトンインスタンス
export const evaluationSystem = new EvaluationSystem();

