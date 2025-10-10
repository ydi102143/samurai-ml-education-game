/**
 * 安定版機械学習モデル（純粋なJavaScript実装）
 * TensorFlow.jsに依存しない軽量な実装
 */

export interface SimpleModel {
  train(data: any[], parameters: any, onProgress?: (progress: any) => void): Promise<void>;
  predict(features: number[]): number;
  evaluate(data: any[]): { accuracy: number; training_time: number; precision: number; recall: number; f1_score: number; predictions: number[]; actual: number[] };
}

export class StableLogisticRegression implements SimpleModel {
  private weights: number[] = [];
  private bias: number = 0;
  private isTrained: boolean = false;

  async train(data: any[], parameters: any, onProgress?: (progress: any) => void): Promise<void> {
    const epochs = parameters.epochs || 100;
    const learningRate = parameters.learningRate || 0.01;
    
    const features = data.map(d => d.features);
    const labels = data.map(d => d.label);
    const numFeatures = features[0].length;
    
    // 重みの初期化
    this.weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = 0;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let validSamples = 0;
      
      for (let i = 0; i < features.length; i++) {
        const prediction = this.sigmoid(this.dotProduct(features[i], this.weights) + this.bias);
        const error = labels[i] - prediction;
        
        if (isFinite(error) && isFinite(prediction)) {
          // 勾配計算
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] += learningRate * error * features[i][j];
          }
          this.bias += learningRate * error;
          
          totalLoss += error * error;
          validSamples++;
        }
      }
      
      if (onProgress) {
        const avgLoss = validSamples > 0 ? totalLoss / validSamples : 0;
        const accuracy = this.calculateAccuracy(features, labels);
        
        onProgress({
          epoch: epoch + 1,
          total: epochs,
          message: `エポック ${epoch + 1}/${epochs}`,
          loss: isFinite(avgLoss) ? avgLoss : 0,
          accuracy: isFinite(accuracy) ? accuracy : 0
        });
      }
    }
    
    this.isTrained = true;
  }

  predict(features: number[]): number {
    if (!this.isTrained) {
      throw new Error('モデルが学習されていません');
    }
    
    return this.sigmoid(this.dotProduct(features, this.weights) + this.bias);
  }

  evaluate(data: any[]): { accuracy: number; training_time: number; precision: number; recall: number; f1_score: number; predictions: number[]; actual: number[] } {
    const features = data.map(d => d.features);
    const actual = data.map(d => d.label);
    const predictions = features.map(f => this.predict(f));
    
    const accuracy = this.calculateAccuracyFromPredictions(predictions, actual);
    const { precision, recall, f1_score } = this.calculateMetrics(predictions, actual);
    
    return {
      accuracy,
      training_time: 0,
      precision,
      recall,
      f1_score,
      predictions,
      actual
    };
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private calculateAccuracy(features: number[][], labels: number[]): number {
    if (features.length === 0) return 0;
    
    let correct = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.sigmoid(this.dotProduct(features[i], this.weights) + this.bias);
      if ((prediction > 0.5 ? 1 : 0) === labels[i]) {
        correct++;
      }
    }
    return correct / features.length;
  }

  private calculateAccuracyFromPredictions(predictions: number[], labels: number[]): number {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      const predictedClass = predictions[i] > 0.5 ? 1 : 0;
      if (predictedClass === labels[i]) {
        correct++;
      }
    }
    return correct / predictions.length;
  }

  private calculateMetrics(predictions: number[], actual: number[]): { precision: number; recall: number; f1_score: number } {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > 0.5 ? 1 : 0;
      if (pred === 1 && actual[i] === 1) truePositives++;
      if (pred === 1 && actual[i] === 0) falsePositives++;
      if (pred === 0 && actual[i] === 1) falseNegatives++;
    }

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1_score = 2 * (precision * recall) / (precision + recall) || 0;

    return { precision, recall, f1_score };
  }
}

export class StableLinearRegression implements SimpleModel {
  private weights: number[] = [];
  private bias: number = 0;
  private isTrained: boolean = false;

  async train(data: any[], parameters: any, onProgress?: (progress: any) => void): Promise<void> {
    const epochs = parameters.epochs || 100;
    const learningRate = parameters.learningRate || 0.01;
    
    const features = data.map(d => d.features);
    const labels = data.map(d => d.label);
    const numFeatures = features[0].length;
    
    // 重みの初期化
    this.weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = 0;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let validSamples = 0;
      
      for (let i = 0; i < features.length; i++) {
        const prediction = this.dotProduct(features[i], this.weights) + this.bias;
        const error = labels[i] - prediction;
        
        if (isFinite(error) && isFinite(prediction)) {
          // 勾配計算
          for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] += learningRate * error * features[i][j];
          }
          this.bias += learningRate * error;
          
          totalLoss += error * error;
          validSamples++;
        }
      }
      
      if (onProgress) {
        const avgLoss = validSamples > 0 ? totalLoss / validSamples : 0;
        const accuracy = this.calculateR2(features, labels);
        
        onProgress({
          epoch: epoch + 1,
          total: epochs,
          message: `エポック ${epoch + 1}/${epochs}`,
          loss: isFinite(avgLoss) ? avgLoss : 0,
          accuracy: isFinite(accuracy) ? accuracy : 0
        });
      }
    }
    
    this.isTrained = true;
  }

  predict(features: number[]): number {
    if (!this.isTrained) {
      throw new Error('モデルが学習されていません');
    }
    
    return this.dotProduct(features, this.weights) + this.bias;
  }

  evaluate(data: any[]): { accuracy: number; training_time: number; precision: number; recall: number; f1_score: number; predictions: number[]; actual: number[] } {
    const features = data.map(d => d.features);
    const actual = data.map(d => d.label);
    const predictions = features.map(f => this.predict(f));
    
    const accuracy = this.calculateR2(features, actual);
    const mae = this.calculateMAE(predictions, actual);
    
    return {
      accuracy: Math.max(0, accuracy),
      training_time: 0,
      precision: 1 - mae,
      recall: 1 - mae,
      f1_score: 1 - mae,
      predictions,
      actual
    };
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  private calculateR2(features: number[][], labels: number[]): number {
    if (features.length === 0) return 0;
    
    const predictions = features.map(f => this.dotProduct(f, this.weights) + this.bias);
    const meanActual = labels.reduce((sum, val) => sum + val, 0) / labels.length;
    
    const ssRes = predictions.reduce((sum, pred, i) => sum + Math.pow(labels[i] - pred, 2), 0);
    const ssTot = labels.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    
    if (ssTot === 0) return 1;
    
    const r2 = 1 - (ssRes / ssTot);
    return Math.max(0, Math.min(1, r2));
  }

  private calculateMAE(predictions: number[], actual: number[]): number {
    return predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actual[i]), 0) / predictions.length;
  }
}

export class StableNeuralNetwork implements SimpleModel {
  private weights: number[][] = [];
  private biases: number[] = [];
  private isTrained: boolean = false;

  async train(data: any[], parameters: any, onProgress?: (progress: any) => void): Promise<void> {
    const epochs = parameters.epochs || 100;
    const learningRate = parameters.learningRate || 0.01;
    
    const features = data.map(d => d.features);
    const labels = data.map(d => d.label);
    const numFeatures = features[0].length;
    
    // 重みの初期化
    this.weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.biases = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      
      for (let i = 0; i < features.length; i++) {
        const prediction = this.forward(features[i]);
        const error = labels[i] - prediction;
        
        // 逆伝播
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] += learningRate * error * features[i][j];
        }
        this.biases[0] += learningRate * error;
        
        totalLoss += error * error;
      }
      
      if (onProgress) {
        onProgress({
          epoch: epoch + 1,
          total: epochs,
          message: `エポック ${epoch + 1}/${epochs}`,
          loss: totalLoss / features.length,
          accuracy: this.calculateAccuracy(features, labels)
        });
      }
    }
    
    this.isTrained = true;
  }

  predict(features: number[]): number {
    if (!this.isTrained) {
      throw new Error('モデルが学習されていません');
    }
    
    return this.forward(features);
  }

  evaluate(data: any[]): { accuracy: number; training_time: number; precision: number; recall: number; f1_score: number; predictions: number[]; actual: number[] } {
    const features = data.map(d => d.features);
    const actual = data.map(d => d.label);
    const predictions = features.map(f => this.predict(f));
    
    const accuracy = this.calculateAccuracyFromPredictions(predictions, actual);
    const { precision, recall, f1_score } = this.calculateMetrics(predictions, actual);
    
    return {
      accuracy,
      training_time: 0,
      precision,
      recall,
      f1_score,
      predictions,
      actual
    };
  }

  private forward(features: number[]): number {
    let sum = 0;
    for (let i = 0; i < features.length; i++) {
      sum += features[i] * this.weights[i];
    }
    return this.sigmoid(sum + this.biases[0]);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private calculateAccuracy(features: number[][], labels: number[]): number {
    let correct = 0;
    for (let i = 0; i < features.length; i++) {
      const prediction = this.forward(features[i]);
      if ((prediction > 0.5 ? 1 : 0) === labels[i]) {
        correct++;
      }
    }
    return correct / features.length;
  }

  private calculateAccuracyFromPredictions(predictions: number[], labels: number[]): number {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      const predictedClass = predictions[i] > 0.5 ? 1 : 0;
      if (predictedClass === labels[i]) {
        correct++;
      }
    }
    return correct / predictions.length;
  }

  private calculateMetrics(predictions: number[], actual: number[]): { precision: number; recall: number; f1_score: number } {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] > 0.5 ? 1 : 0;
      if (pred === 1 && actual[i] === 1) truePositives++;
      if (pred === 1 && actual[i] === 0) falsePositives++;
      if (pred === 0 && actual[i] === 1) falseNegatives++;
    }

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1_score = 2 * (precision * recall) / (precision + recall) || 0;

    return { precision, recall, f1_score };
  }
}

export class StableKNN implements SimpleModel {
  private trainingData: { features: number[]; label: number }[] = [];
  private k: number = 3;
  private isTrained: boolean = false;

  async train(data: any[], parameters: any, onProgress?: (progress: any) => void): Promise<void> {
    this.k = parameters.k || 3;
    this.trainingData = data.map(d => ({ features: d.features, label: d.label }));
    this.isTrained = true;
    
    if (onProgress) {
      onProgress({
        epoch: 1,
        total: 1,
        message: 'KNN学習完了',
        loss: 0,
        accuracy: 1
      });
    }
  }

  predict(features: number[]): number {
    if (!this.isTrained) {
      throw new Error('モデルが学習されていません');
    }

    // 距離を計算
    const distances = this.trainingData.map(trainingPoint => ({
      distance: this.euclideanDistance(features, trainingPoint.features),
      label: trainingPoint.label
    }));

    // 距離でソート
    distances.sort((a, b) => a.distance - b.distance);

    // 上位k個のラベルを取得
    const kNearest = distances.slice(0, this.k);
    
    // 回帰問題の場合：平均値を返す
    if (typeof kNearest[0].label === 'number') {
      const sum = kNearest.reduce((acc, item) => acc + item.label, 0);
      return sum / kNearest.length;
    }
    
    // 分類問題の場合：多数決
    const labelCounts: { [key: string]: number } = {};
    kNearest.forEach(item => {
      const label = String(item.label);
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });
    
    let maxCount = 0;
    let predictedLabel = kNearest[0].label;
    
    for (const [label, count] of Object.entries(labelCounts)) {
      if (count > maxCount) {
        maxCount = count;
        predictedLabel = Number(label);
      }
    }
    
    return predictedLabel;
  }

  evaluate(data: any[]): { accuracy: number; training_time: number; precision: number; recall: number; f1_score: number; predictions: number[]; actual: number[] } {
    const features = data.map(d => d.features);
    const actual = data.map(d => d.label);
    const predictions = features.map(f => this.predict(f));
    
    const accuracy = this.calculateAccuracy(predictions, actual);
    
    return {
      accuracy,
      training_time: 0,
      precision: accuracy,
      recall: accuracy,
      f1_score: accuracy,
      predictions,
      actual
    };
  }

  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('特徴量の次元が一致しません');
    }
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private calculateAccuracy(predictions: number[], actual: number[]): number {
    if (predictions.length === 0) return 0;
    
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (Math.abs(predictions[i] - actual[i]) < 0.1) {
        correct++;
      }
    }
    
    return correct / predictions.length;
  }
}

// モデルファクトリー
export function createStableModel(modelType: string): SimpleModel {
  switch (modelType) {
    case 'logistic_regression':
      return new StableLogisticRegression();
    case 'linear_regression':
      return new StableLinearRegression();
    case 'neural_network':
      return new StableNeuralNetwork();
    case 'knn':
      return new StableKNN();
    default:
      throw new Error(`未知のモデルタイプ: ${modelType}`);
  }
}



