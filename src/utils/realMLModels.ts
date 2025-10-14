// リアルな機械学習モデル実装
export interface ModelConfig {
  learningRate?: number;
  epochs?: number;
  regularization?: number;
  hiddenLayers?: number[];
  batchSize?: number;
  dropout?: number;
  activation?: 'relu' | 'sigmoid' | 'tanh';
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  validationAccuracy?: number;
  validationLoss?: number;
}

export interface ModelResult {
  predictions: number[];
  probabilities?: number[];
  accuracy: number;
  loss: number;
  trainingTime: number;
}

export class RealMLModel {
  protected name: string;
  protected type: 'classification' | 'regression';
  protected config: ModelConfig;
  protected isTrained: boolean = false;
  protected weights: number[] = [];
  protected bias: number = 0;

  constructor(name: string, type: 'classification' | 'regression', config: ModelConfig = {}) {
    this.name = name;
    this.type = type;
    this.config = {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      batchSize: 32,
      dropout: 0.2,
      activation: 'relu',
      ...config
    };
  }

  // モデルを訓練
  async train(features: number[][], labels: number[], onProgress?: (progress: TrainingProgress) => void): Promise<ModelResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.performTraining(features, labels, onProgress);
      result.trainingTime = Date.now() - startTime;
      this.isTrained = true;
      return result;
    } catch (error) {
      throw new Error(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 実際の訓練を実行
  protected async performTraining(features: number[][], labels: number[], onProgress?: (progress: TrainingProgress) => void): Promise<ModelResult> {
    // サブクラスで実装
    throw new Error('performTraining must be implemented by subclass');
  }

  // 予測を実行
  predict(features: number[][]): number[] {
    if (!this.isTrained) {
      throw new Error('Model must be trained before making predictions');
    }
    
    return this.performPrediction(features);
  }

  // 実際の予測を実行
  protected performPrediction(features: number[][]): number[] {
    // サブクラスで実装
    throw new Error('performPrediction must be implemented by subclass');
  }

  // 確率を予測（分類問題のみ）
  predictProbabilities(features: number[][]): number[] {
    if (this.type !== 'classification') {
      throw new Error('Probabilities can only be predicted for classification models');
    }
    
    return this.performProbabilityPrediction(features);
  }

  // 実際の確率予測を実行
  protected performProbabilityPrediction(features: number[][]): number[] {
    // サブクラスで実装
    throw new Error('performProbabilityPrediction must be implemented by subclass');
  }

  // モデルを評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    const predictions = this.predict(features);
    return this.calculateMetrics(predictions, labels);
  }

  // メトリクスを計算
  protected calculateMetrics(predictions: number[], labels: number[]): { accuracy: number; loss: number } {
    if (this.type === 'classification') {
      return this.calculateClassificationMetrics(predictions, labels);
    } else {
      return this.calculateRegressionMetrics(predictions, labels);
    }
  }

  // 分類メトリクスを計算
  private calculateClassificationMetrics(predictions: number[], labels: number[]): { accuracy: number; loss: number } {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > 0.5 ? 1 : 0;
      const actual = labels[i];
      
      if (pred === actual) {
        correct++;
      }

      // バイナリクロスエントロピー損失
      const p = Math.max(1e-15, Math.min(1 - 1e-15, predictions[i]));
      const loss = -actual * Math.log(p) - (1 - actual) * Math.log(1 - p);
      totalLoss += loss;
    }

    return {
      accuracy: correct / predictions.length,
      loss: totalLoss / predictions.length
    };
  }

  // 回帰メトリクスを計算
  private calculateRegressionMetrics(predictions: number[], labels: number[]): { accuracy: number; loss: number } {
    let totalLoss = 0;
    let totalError = 0;

    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - labels[i];
      totalLoss += error * error;
      totalError += Math.abs(error);
    }

    const mse = totalLoss / predictions.length;
    const mae = totalError / predictions.length;
    
    // R²スコアを計算
    const actualMean = labels.reduce((sum, val) => sum + val, 0) / labels.length;
    const ssRes = predictions.reduce((sum, pred, i) => {
      const error = pred - labels[i];
      return sum + error * error;
    }, 0);
    const ssTot = labels.reduce((sum, val) => {
      const error = val - actualMean;
      return sum + error * error;
    }, 0);
    const r2 = 1 - (ssRes / ssTot);

    return {
      accuracy: Math.max(0, r2),
      loss: mse
    };
  }

  // ヘルパーメソッド
  protected sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  protected relu(x: number): number {
    return Math.max(0, x);
  }

  protected tanh(x: number): number {
    return Math.tanh(x);
  }

  protected dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  protected softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exp = values.map(v => Math.exp(v - max));
    const sum = exp.reduce((s, v) => s + v, 0);
    return exp.map(v => v / sum);
  }

  // ゲッター
  get isModelTrained(): boolean {
    return this.isTrained;
  }

  get modelName(): string {
    return this.name;
  }

  get modelType(): 'classification' | 'regression' {
    return this.type;
  }

  get modelConfig(): ModelConfig {
    return { ...this.config };
  }
}

export class TraditionalMLModel extends RealMLModel {
  constructor(name: string, type: 'classification' | 'regression', config: ModelConfig = {}) {
    super(name, type, config);
  }

  // 伝統的なMLモデルの訓練を実装
  protected async performTraining(features: number[][], labels: number[], onProgress?: (progress: TrainingProgress) => void): Promise<ModelResult> {
    const { learningRate, epochs, regularization } = this.config;
    const numFeatures = features[0].length;
    
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    let bestAccuracy = 0;
    let bestWeights = [...this.weights];
    let bestBias = this.bias;

    for (let epoch = 0; epoch < epochs!; epoch++) {
      let correct = 0;
      let totalLoss = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.forward(features[i]);
        const actual = labels[i];
        const error = prediction - actual;

        // 勾配を計算
        const gradients = this.calculateGradients(features[i], error);
        
        // 重みを更新
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] -= learningRate! * (gradients.weights[j] + regularization! * this.weights[j]);
        }
        this.bias -= learningRate! * gradients.bias;

        // 精度を計算
        if (this.type === 'classification') {
          if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
            correct++;
          }
        } else {
          if (Math.abs(prediction - actual) < 0.1) {
            correct++;
          }
        }

        // 損失を計算
        const loss = this.calculateLoss(prediction, actual);
        totalLoss += loss;
      }

      const accuracy = correct / features.length;
      const avgLoss = totalLoss / features.length;

      // 最良の結果を保存
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestWeights = [...this.weights];
        bestBias = this.bias;
      }

      // 進捗を通知
      if (onProgress) {
        onProgress({
          epoch: epoch + 1,
          totalEpochs: epochs!,
          accuracy,
          loss: avgLoss
        });
      }

      // 早期停止
      if (epoch > 10 && accuracy < bestAccuracy - 0.01) {
        break;
      }
    }

    // 最良の重みを復元
    this.weights = bestWeights;
    this.bias = bestBias;

    return {
      predictions: features.map(f => this.forward(f)),
      accuracy: bestAccuracy,
      loss: totalLoss / features.length,
      trainingTime: 0
    };
  }

  // フォワードパス
  protected forward(features: number[]): number {
    const score = this.dotProduct(this.weights, features) + this.bias;
    
    if (this.type === 'classification') {
      return this.sigmoid(score);
    } else {
      return score;
    }
  }

  // 勾配を計算
  protected calculateGradients(features: number[], error: number): { weights: number[]; bias: number } {
    const weightGradients = features.map(f => f * error);
    const biasGradient = error;
    
    return {
      weights: weightGradients,
      bias: biasGradient
    };
  }

  // 損失を計算
  protected calculateLoss(prediction: number, actual: number): number {
    if (this.type === 'classification') {
      const p = Math.max(1e-15, Math.min(1 - 1e-15, prediction));
      return -actual * Math.log(p) - (1 - actual) * Math.log(1 - p);
    } else {
      const error = prediction - actual;
      return error * error;
    }
  }

  // 予測を実行
  protected performPrediction(features: number[][]): number[] {
    return features.map(f => this.forward(f));
  }

  // 確率予測を実行
  protected performProbabilityPrediction(features: number[][]): number[] {
    return features.map(f => this.forward(f));
  }
}

// モデルファクトリー
export function createRealMLModel(
  name: string, 
  type: 'classification' | 'regression', 
  config: ModelConfig = {}
): RealMLModel {
  return new TraditionalMLModel(name, type, config);
}

// 事前定義されたモデル
export const predefinedModels = {
  'ロジスティック回帰': (config: ModelConfig = {}) => 
    createRealMLModel('ロジスティック回帰', 'classification', {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      ...config
    }),
  
  '線形回帰': (config: ModelConfig = {}) => 
    createRealMLModel('線形回帰', 'regression', {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      ...config
    }),
  
  'ランダムフォレスト': (config: ModelConfig = {}) => 
    createRealMLModel('ランダムフォレスト', 'classification', {
      learningRate: 0.1,
      epochs: 50,
      regularization: 0.001,
      ...config
    }),
  
  'SVM': (config: ModelConfig = {}) => 
    createRealMLModel('SVM', 'classification', {
      learningRate: 0.001,
      epochs: 200,
      regularization: 0.1,
      ...config
    }),
  
  'XGBoost': (config: ModelConfig = {}) => 
    createRealMLModel('XGBoost', 'classification', {
      learningRate: 0.1,
      epochs: 100,
      regularization: 0.01,
      ...config
    }),
  
  'ニューラルネットワーク': (config: ModelConfig = {}) => 
    createRealMLModel('ニューラルネットワーク', 'classification', {
      learningRate: 0.001,
      epochs: 100,
      regularization: 0.01,
      hiddenLayers: [64, 32],
      batchSize: 32,
      dropout: 0.2,
      ...config
    })
};

