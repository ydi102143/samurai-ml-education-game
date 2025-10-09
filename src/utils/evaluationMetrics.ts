export interface EvaluationMetric {
  id: string;
  name: string;
  description: string;
  category: 'classification' | 'regression' | 'both';
  calculate: (predictions: number[], actual: number[]) => number;
  isHigherBetter: boolean; // true: 高いほど良い, false: 低いほど良い
  range: [number, number]; // [最小値, 最大値]
  unit: string; // 単位
}

export class EvaluationMetricsManager {
  private static metrics: EvaluationMetric[] = [
    // 分類問題用メトリクス
    {
      id: 'accuracy',
      name: '精度 (Accuracy)',
      description: '正解率 - 全体のうち正しく予測できた割合',
      category: 'classification',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return 0;
        const correct = pred.filter((p, i) => Math.abs(p - actual[i]) < 0.5).length;
        return correct / pred.length;
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: '%'
    },
    {
      id: 'precision',
      name: '適合率 (Precision)',
      description: '陽性と予測したもののうち、実際に陽性だった割合',
      category: 'classification',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return 0;
        
        // 二値分類の場合
        const truePositives = pred.filter((p, i) => p >= 0.5 && actual[i] >= 0.5).length;
        const falsePositives = pred.filter((p, i) => p >= 0.5 && actual[i] < 0.5).length;
        
        if (truePositives + falsePositives === 0) return 0;
        return truePositives / (truePositives + falsePositives);
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: '%'
    },
    {
      id: 'recall',
      name: '再現率 (Recall)',
      description: '実際に陽性だったもののうち、正しく陽性と予測できた割合',
      category: 'classification',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return 0;
        
        const truePositives = pred.filter((p, i) => p >= 0.5 && actual[i] >= 0.5).length;
        const falseNegatives = pred.filter((p, i) => p < 0.5 && actual[i] >= 0.5).length;
        
        if (truePositives + falseNegatives === 0) return 0;
        return truePositives / (truePositives + falseNegatives);
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: '%'
    },
    {
      id: 'f1_score',
      name: 'F1スコア',
      description: '適合率と再現率の調和平均',
      category: 'classification',
      calculate: (pred, actual) => {
        const precision = this.metrics.find(m => m.id === 'precision')!.calculate(pred, actual);
        const recall = this.metrics.find(m => m.id === 'recall')!.calculate(pred, actual);
        
        if (precision + recall === 0) return 0;
        return 2 * (precision * recall) / (precision + recall);
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: '%'
    },
    {
      id: 'specificity',
      name: '特異度 (Specificity)',
      description: '実際に陰性だったもののうち、正しく陰性と予測できた割合',
      category: 'classification',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return 0;
        
        const trueNegatives = pred.filter((p, i) => p < 0.5 && actual[i] < 0.5).length;
        const falsePositives = pred.filter((p, i) => p >= 0.5 && actual[i] < 0.5).length;
        
        if (trueNegatives + falsePositives === 0) return 0;
        return trueNegatives / (trueNegatives + falsePositives);
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: '%'
    },
    {
      id: 'auc_roc',
      name: 'AUC-ROC',
      description: 'ROC曲線下面積 - 分類性能の総合評価',
      category: 'classification',
      calculate: (pred, actual) => {
        // 簡易版AUC計算（実際の実装ではより複雑）
        if (pred.length !== actual.length) return 0;
        
        const sorted = pred.map((p, i) => ({ pred: p, actual: actual[i] }))
          .sort((a, b) => b.pred - a.pred);
        
        let auc = 0;
        let truePositives = 0;
        let falsePositives = 0;
        const totalPositives = actual.filter(a => a >= 0.5).length;
        const totalNegatives = actual.length - totalPositives;
        
        for (const item of sorted) {
          if (item.actual >= 0.5) {
            truePositives++;
          } else {
            falsePositives++;
            auc += truePositives;
          }
        }
        
        return totalPositives * totalNegatives > 0 ? auc / (totalPositives * totalNegatives) : 0.5;
      },
      isHigherBetter: true,
      range: [0, 1],
      unit: ''
    },

    // 回帰問題用メトリクス
    {
      id: 'mae',
      name: '平均絶対誤差 (MAE)',
      description: '予測値と実際の値の差の絶対値の平均',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return Infinity;
        const sum = pred.reduce((acc, p, i) => acc + Math.abs(p - actual[i]), 0);
        return sum / pred.length;
      },
      isHigherBetter: false,
      range: [0, Infinity],
      unit: ''
    },
    {
      id: 'mse',
      name: '平均二乗誤差 (MSE)',
      description: '予測値と実際の値の差の二乗の平均',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return Infinity;
        const sum = pred.reduce((acc, p, i) => acc + Math.pow(p - actual[i], 2), 0);
        return sum / pred.length;
      },
      isHigherBetter: false,
      range: [0, Infinity],
      unit: ''
    },
    {
      id: 'rmse',
      name: '二乗平均平方根誤差 (RMSE)',
      description: 'MSEの平方根 - 元のデータと同じ単位',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return Infinity;
        const mse = pred.reduce((acc, p, i) => acc + Math.pow(p - actual[i], 2), 0) / pred.length;
        return Math.sqrt(mse);
      },
      isHigherBetter: false,
      range: [0, Infinity],
      unit: ''
    },
    {
      id: 'r2_score',
      name: '決定係数 (R²)',
      description: 'モデルの説明力 - 1に近いほど良い',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return -Infinity;
        
        const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
        const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
        const ssRes = pred.reduce((sum, p, i) => sum + Math.pow(actual[i] - p, 2), 0);
        
        if (ssTot === 0) return 0;
        return 1 - (ssRes / ssTot);
      },
      isHigherBetter: true,
      range: [-Infinity, 1],
      unit: ''
    },
    {
      id: 'mape',
      name: '平均絶対パーセント誤差 (MAPE)',
      description: '相対誤差の絶対値の平均',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return Infinity;
        
        const sum = pred.reduce((acc, p, i) => {
          if (actual[i] === 0) return acc + 100; // ゼロ除算を避ける
          return acc + Math.abs((actual[i] - p) / actual[i]) * 100;
        }, 0);
        
        return sum / pred.length;
      },
      isHigherBetter: false,
      range: [0, Infinity],
      unit: '%'
    },
    {
      id: 'smape',
      name: '対称平均絶対パーセント誤差 (SMAPE)',
      description: 'MAPEの対称版 - より安定した指標',
      category: 'regression',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length) return Infinity;
        
        const sum = pred.reduce((acc, p, i) => {
          const denominator = (Math.abs(actual[i]) + Math.abs(p)) / 2;
          if (denominator === 0) return acc + 0;
          return acc + Math.abs(actual[i] - p) / denominator * 100;
        }, 0);
        
        return sum / pred.length;
      },
      isHigherBetter: false,
      range: [0, 200],
      unit: '%'
    },

    // 両方に使えるメトリクス
    {
      id: 'correlation',
      name: '相関係数',
      description: '予測値と実際の値の線形相関',
      category: 'both',
      calculate: (pred, actual) => {
        if (pred.length !== actual.length || pred.length < 2) return 0;
        
        const n = pred.length;
        const sumX = pred.reduce((a, b) => a + b, 0);
        const sumY = actual.reduce((a, b) => a + b, 0);
        const sumXY = pred.reduce((acc, p, i) => acc + p * actual[i], 0);
        const sumX2 = pred.reduce((acc, p) => acc + p * p, 0);
        const sumY2 = actual.reduce((acc, y) => acc + y * y, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
      },
      isHigherBetter: true,
      range: [-1, 1],
      unit: ''
    }
  ];

  /**
   * 利用可能な評価指標を取得
   */
  static getAvailableMetrics(problemType: 'classification' | 'regression'): EvaluationMetric[] {
    return this.metrics.filter(m => 
      m.category === problemType || m.category === 'both'
    );
  }

  /**
   * 特定の評価指標を取得
   */
  static getMetric(metricId: string): EvaluationMetric | null {
    return this.metrics.find(m => m.id === metricId) || null;
  }

  /**
   * 評価指標を計算
   */
  static calculateMetric(metricId: string, predictions: number[], actual: number[]): number {
    const metric = this.getMetric(metricId);
    if (!metric) {
      throw new Error(`Unknown metric: ${metricId}`);
    }
    
    try {
      return metric.calculate(predictions, actual);
    } catch (error) {
      console.error(`Metric calculation failed for ${metricId}:`, error);
      return metric.isHigherBetter ? -Infinity : Infinity;
    }
  }

  /**
   * 複数の評価指標を一括計算
   */
  static calculateMultipleMetrics(
    metricIds: string[], 
    predictions: number[], 
    actual: number[]
  ): Record<string, number> {
    const results: Record<string, number> = {};
    
    for (const metricId of metricIds) {
      try {
        results[metricId] = this.calculateMetric(metricId, predictions, actual);
      } catch (error) {
        console.error(`Failed to calculate ${metricId}:`, error);
        results[metricId] = NaN;
      }
    }
    
    return results;
  }

  /**
   * 評価指標の値を正規化（0-1の範囲に変換）
   */
  static normalizeMetricValue(metric: EvaluationMetric, value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    
    if (metric.range[0] === -Infinity && metric.range[1] === Infinity) {
      // 無限範囲の場合は、値の絶対値に基づいて正規化
      return Math.max(0, Math.min(1, 1 / (1 + Math.abs(value))));
    }
    
    if (metric.range[0] === -Infinity) {
      // 上限のみの場合
      return Math.max(0, Math.min(1, value / metric.range[1]));
    }
    
    if (metric.range[1] === Infinity) {
      // 下限のみの場合
      return Math.max(0, Math.min(1, 1 - value / Math.abs(metric.range[0])));
    }
    
    // 有限範囲の場合
    const normalized = (value - metric.range[0]) / (metric.range[1] - metric.range[0]);
    return Math.max(0, Math.min(1, normalized));
  }

  /**
   * 評価指標の説明を取得
   */
  static getMetricDescription(metricId: string): string {
    const metric = this.getMetric(metricId);
    return metric ? metric.description : '不明な評価指標です';
  }

  /**
   * 評価指標の推奨設定を取得
   */
  static getRecommendedMetrics(problemType: 'classification' | 'regression'): string[] {
    if (problemType === 'classification') {
      return ['accuracy', 'precision', 'recall', 'f1_score'];
    } else {
      return ['r2_score', 'mae', 'rmse', 'correlation'];
    }
  }

  /**
   * 評価指標の比較（ランキング用）
   */
  static compareMetrics(metricId: string, value1: number, value2: number): number {
    const metric = this.getMetric(metricId);
    if (!metric) return 0;
    
    if (metric.isHigherBetter) {
      return value2 - value1; // 高いほど良い
    } else {
      return value1 - value2; // 低いほど良い
    }
  }
}
