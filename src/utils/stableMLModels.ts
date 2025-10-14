// 安定した機械学習モデルの実装
export interface ModelConfig {
  learningRate?: number;
  epochs?: number;
  regularization?: number;
  hiddenLayers?: number[];
  k?: number;
  kernel?: 'linear' | 'rbf' | 'poly';
  gamma?: number;
  degree?: number;
}

export interface TrainingResult {
  weights: number[];
  bias: number;
  accuracy: number;
  loss: number;
  epochs: number;
}

export class StableLogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private config: ModelConfig;

  constructor(config: ModelConfig = {}) {
    this.config = {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      ...config
    };
  }

  // シグモイド関数
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  // 予測
  predict(features: number[]): number {
    if (this.weights.length === 0) return 0;
    
    let sum = this.bias;
    for (let i = 0; i < features.length; i++) {
      sum += this.weights[i] * features[i];
    }
    
    return this.sigmoid(sum);
  }

  // 訓練
  train(features: number[][], labels: number[]): TrainingResult {
    const numFeatures = features[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    const learningRate = this.config.learningRate!;
    const epochs = this.config.epochs!;
    const regularization = this.config.regularization!;

    let bestAccuracy = 0;
    let bestWeights = [...this.weights];
    let bestBias = this.bias;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let correct = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const actual = labels[i];
        const error = prediction - actual;

        // 勾配を計算
        const gradient = error;
        const weightGradient = features[i].map(f => f * gradient);
        const biasGradient = gradient;

        // 重みを更新（正則化付き）
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] -= learningRate * (weightGradient[j] + regularization * this.weights[j]);
        }
        this.bias -= learningRate * biasGradient;

        // 損失を計算
        const loss = -actual * Math.log(Math.max(1e-15, prediction)) - 
                    (1 - actual) * Math.log(Math.max(1e-15, 1 - prediction));
        totalLoss += loss;

        // 精度を計算
        if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
          correct++;
        }
      }

      const accuracy = correct / features.length;
      const avgLoss = totalLoss / features.length;

      // 最良の結果を保存
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestWeights = [...this.weights];
        bestBias = this.bias;
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
      weights: this.weights,
      bias: this.bias,
      accuracy: bestAccuracy,
      loss: totalLoss / features.length,
      epochs: epoch + 1
    };
  }

  // 評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      const actual = labels[i];

      if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
        correct++;
      }

      const loss = -actual * Math.log(Math.max(1e-15, prediction)) - 
                  (1 - actual) * Math.log(Math.max(1e-15, 1 - prediction));
      totalLoss += loss;
    }

    return {
      accuracy: correct / features.length,
      loss: totalLoss / features.length
    };
  }
}

export class StableLinearRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private config: ModelConfig;

  constructor(config: ModelConfig = {}) {
    this.config = {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      ...config
    };
  }

  // 予測
  predict(features: number[]): number {
    if (this.weights.length === 0) return 0;
    
    let sum = this.bias;
    for (let i = 0; i < features.length; i++) {
      sum += this.weights[i] * features[i];
    }
    
    return sum;
  }

  // 訓練
  train(features: number[][], labels: number[]): TrainingResult {
    const numFeatures = features[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    const learningRate = this.config.learningRate!;
    const epochs = this.config.epochs!;
    const regularization = this.config.regularization!;

    let bestLoss = Infinity;
    let bestWeights = [...this.weights];
    let bestBias = this.bias;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const actual = labels[i];
        const error = prediction - actual;

        // 勾配を計算
        const gradient = error;
        const weightGradient = features[i].map(f => f * gradient);
        const biasGradient = gradient;

        // 重みを更新（正則化付き）
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] -= learningRate * (weightGradient[j] + regularization * this.weights[j]);
        }
        this.bias -= learningRate * biasGradient;

        // 損失を計算
        const loss = error * error;
        totalLoss += loss;
      }

      const avgLoss = totalLoss / features.length;

      // 最良の結果を保存
      if (avgLoss < bestLoss) {
        bestLoss = avgLoss;
        bestWeights = [...this.weights];
        bestBias = this.bias;
      }

      // 早期停止
      if (epoch > 10 && avgLoss > bestLoss * 1.1) {
        break;
      }
    }

    // 最良の重みを復元
    this.weights = bestWeights;
    this.bias = bestBias;

    // R²スコアを計算
    const r2 = this.calculateR2(features, labels);

    return {
      weights: this.weights,
      bias: this.bias,
      accuracy: Math.max(0, r2),
      loss: bestLoss,
      epochs: epoch + 1
    };
  }

  // R²スコアを計算
  private calculateR2(features: number[][], labels: number[]): number {
    const predictions = features.map(f => this.predict(f));
    const actualMean = labels.reduce((sum, val) => sum + val, 0) / labels.length;
    
    const ssRes = predictions.reduce((sum, pred, i) => {
      const diff = pred - labels[i];
      return sum + diff * diff;
    }, 0);
    
    const ssTot = labels.reduce((sum, val) => {
      const diff = val - actualMean;
      return sum + diff * diff;
    }, 0);
    
    return 1 - (ssRes / ssTot);
  }

  // 評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      const actual = labels[i];
      const error = prediction - actual;
      totalLoss += error * error;
    }

    const r2 = this.calculateR2(features, labels);

    return {
      accuracy: Math.max(0, r2),
      loss: totalLoss / features.length
    };
  }
}

export class StableNeuralNetwork {
  private weights: number[][][] = [];
  private biases: number[][] = [];
  private config: ModelConfig;

  constructor(config: ModelConfig = {}) {
    this.config = {
      learningRate: 0.01,
      epochs: 100,
      hiddenLayers: [64],
      ...config
    };
  }

  // シグモイド関数
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  // フォワードパス
  private forward(features: number[]): number[] {
    let current = features;
    
    for (let layer = 0; layer < this.weights.length; layer++) {
      const next = new Array(this.weights[layer].length);
      
      for (let i = 0; i < this.weights[layer].length; i++) {
        let sum = this.biases[layer][i];
        for (let j = 0; j < current.length; j++) {
          sum += this.weights[layer][i][j] * current[j];
        }
        next[i] = this.sigmoid(sum);
      }
      
      current = next;
    }
    
    return current;
  }

  // 予測
  predict(features: number[]): number {
    if (this.weights.length === 0) return 0;
    
    const output = this.forward(features);
    return output[0];
  }

  // 訓練
  train(features: number[][], labels: number[]): TrainingResult {
    const numFeatures = features[0].length;
    const hiddenLayers = this.config.hiddenLayers!;
    
    // ネットワーク構造を初期化
    this.weights = [];
    this.biases = [];
    
    let prevSize = numFeatures;
    for (const layerSize of hiddenLayers) {
      const layerWeights = Array(layerSize).fill(null).map(() => 
        Array(prevSize).fill(0).map(() => (Math.random() - 0.5) * 0.1)
      );
      const layerBiases = Array(layerSize).fill(0);
      
      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
      prevSize = layerSize;
    }
    
    // 出力層
    const outputWeights = Array(1).fill(null).map(() => 
      Array(prevSize).fill(0).map(() => (Math.random() - 0.5) * 0.1)
    );
    const outputBiases = Array(1).fill(0);
    
    this.weights.push(outputWeights);
    this.biases.push(outputBiases);

    const learningRate = this.config.learningRate!;
    const epochs = this.config.epochs!;

    let bestAccuracy = 0;
    let bestWeights = JSON.parse(JSON.stringify(this.weights));
    let bestBiases = JSON.parse(JSON.stringify(this.biases));

    for (let epoch = 0; epoch < epochs; epoch++) {
      let correct = 0;
      let totalLoss = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const actual = labels[i];
        const error = prediction - actual;

        // 簡略化されたバックプロパゲーション
        for (let layer = this.weights.length - 1; layer >= 0; layer--) {
          for (let j = 0; j < this.weights[layer].length; j++) {
            for (let k = 0; k < this.weights[layer][j].length; k++) {
              this.weights[layer][j][k] -= learningRate * error * 0.1;
            }
            this.biases[layer][j] -= learningRate * error * 0.1;
          }
        }

        // 精度を計算
        if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
          correct++;
        }

        // 損失を計算
        const loss = error * error;
        totalLoss += loss;
      }

      const accuracy = correct / features.length;
      const avgLoss = totalLoss / features.length;

      // 最良の結果を保存
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestWeights = JSON.parse(JSON.stringify(this.weights));
        bestBiases = JSON.parse(JSON.stringify(this.biases));
      }

      // 早期停止
      if (epoch > 10 && accuracy < bestAccuracy - 0.01) {
        break;
      }
    }

    // 最良の重みを復元
    this.weights = bestWeights;
    this.biases = bestBiases;

    return {
      weights: this.weights.flat().flat(),
      bias: this.biases.flat().reduce((sum, b) => sum + b, 0),
      accuracy: bestAccuracy,
      loss: totalLoss / features.length,
      epochs: epoch + 1
    };
  }

  // 評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      const actual = labels[i];

      if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
        correct++;
      }

      const error = prediction - actual;
      const loss = error * error;
      totalLoss += loss;
    }

    return {
      accuracy: correct / features.length,
      loss: totalLoss / features.length
    };
  }
}

export class StableKNN {
  private features: number[][] = [];
  private labels: number[] = [];
  private k: number;

  constructor(config: ModelConfig = {}) {
    this.k = config.k || 3;
  }

  // ユークリッド距離を計算
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  // 予測
  predict(features: number[]): number {
    if (this.features.length === 0) return 0;

    // 距離を計算
    const distances = this.features.map((f, i) => ({
      distance: this.euclideanDistance(features, f),
      label: this.labels[i]
    }));

    // 距離でソート
    distances.sort((a, b) => a.distance - b.distance);

    // 上位k個のラベルを取得
    const kNearest = distances.slice(0, this.k);
    
    // 多数決
    const labelCounts = new Map<number, number>();
    kNearest.forEach(item => {
      labelCounts.set(item.label, (labelCounts.get(item.label) || 0) + 1);
    });

    let maxCount = 0;
    let predictedLabel = 0;
    labelCounts.forEach((count, label) => {
      if (count > maxCount) {
        maxCount = count;
        predictedLabel = label;
      }
    });

    return predictedLabel;
  }

  // 訓練（KNNは訓練不要、データを保存するだけ）
  train(features: number[][], labels: number[]): TrainingResult {
    this.features = features.map(f => [...f]);
    this.labels = [...labels];

    // 訓練データでの精度を計算
    let correct = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      if (prediction === labels[i]) {
        correct++;
      }
    }

    return {
      weights: [],
      bias: 0,
      accuracy: correct / features.length,
      loss: 0,
      epochs: 1
    };
  }

  // 評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    let correct = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      if (prediction === labels[i]) {
        correct++;
      }
    }

    return {
      accuracy: correct / features.length,
      loss: 0
    };
  }
}

export class StableSVM {
  private weights: number[] = [];
  private bias: number = 0;
  private config: ModelConfig;

  constructor(config: ModelConfig = {}) {
    this.config = {
      learningRate: 0.01,
      epochs: 100,
      regularization: 0.01,
      kernel: 'linear',
      gamma: 1.0,
      degree: 3,
      ...config
    };
  }

  // カーネル関数
  private kernel(x1: number[], x2: number[]): number {
    const kernelType = this.config.kernel || 'linear';
    
    switch (kernelType) {
      case 'linear':
        return this.dotProduct(x1, x2);
      case 'rbf':
        const gamma = this.config.gamma || 1.0;
        const distance = this.euclideanDistance(x1, x2);
        return Math.exp(-gamma * distance * distance);
      case 'poly':
        const degree = this.config.degree || 3;
        const dot = this.dotProduct(x1, x2);
        return Math.pow(dot + 1, degree);
      default:
        return this.dotProduct(x1, x2);
    }
  }

  // ドット積
  private dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  // ユークリッド距離
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  // 予測
  predict(features: number[]): number {
    if (this.weights.length === 0) return 0;
    
    let sum = this.bias;
    for (let i = 0; i < this.weights.length; i++) {
      sum += this.weights[i] * features[i];
    }
    
    return sum > 0 ? 1 : 0;
  }

  // 訓練
  train(features: number[][], labels: number[]): TrainingResult {
    const numFeatures = features[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    const learningRate = this.config.learningRate!;
    const epochs = this.config.epochs!;
    const regularization = this.config.regularization!;

    let bestAccuracy = 0;
    let bestWeights = [...this.weights];
    let bestBias = this.bias;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let correct = 0;
      let totalLoss = 0;

      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const actual = labels[i];
        
        // ヒンジ損失
        const margin = actual * (this.dotProduct(this.weights, features[i]) + this.bias);
        const loss = Math.max(0, 1 - margin);
        
        if (loss > 0) {
          // 勾配を計算
          const gradient = actual;
          const weightGradient = features[i].map(f => f * gradient);
          const biasGradient = gradient;

          // 重みを更新
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] += learningRate * (weightGradient[j] - regularization * this.weights[j]);
          }
          this.bias += learningRate * biasGradient;
        }

        // 精度を計算
        if (prediction === actual) {
          correct++;
        }

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

      // 早期停止
      if (epoch > 10 && accuracy < bestAccuracy - 0.01) {
        break;
      }
    }

    // 最良の重みを復元
    this.weights = bestWeights;
    this.bias = bestBias;

    return {
      weights: this.weights,
      bias: this.bias,
      accuracy: bestAccuracy,
      loss: totalLoss / features.length,
      epochs: epoch + 1
    };
  }

  // 評価
  evaluate(features: number[][], labels: number[]): { accuracy: number; loss: number } {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(features[i]);
      const actual = labels[i];

      if (prediction === actual) {
        correct++;
      }

      const margin = actual * (this.dotProduct(this.weights, features[i]) + this.bias);
      const loss = Math.max(0, 1 - margin);
      totalLoss += loss;
    }

    return {
      accuracy: correct / features.length,
      loss: totalLoss / features.length
    };
  }
}

// モデルファクトリー
export function createStableModel(modelType: string, config: ModelConfig = {}): any {
  switch (modelType) {
    case 'ロジスティック回帰':
      return new StableLogisticRegression(config);
    case '線形回帰':
      return new StableLinearRegression(config);
    case 'ニューラルネットワーク':
      return new StableNeuralNetwork(config);
    case 'KNN':
      return new StableKNN(config);
    case 'SVM':
      return new StableSVM(config);
    default:
      return new StableLogisticRegression(config);
  }
}

