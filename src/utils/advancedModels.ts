import * as tf from '@tensorflow/tfjs';

// アンサンブル学習（複数のモデルを組み合わせる）
export class EnsembleModel {
  private models: any[] = [];
  private weights: number[] = [];

  constructor() {
    this.models = [];
    this.weights = [];
  }

  addModel(model: any, weight: number = 1.0) {
    this.models.push(model);
    this.weights.push(weight);
  }

  async predict(features: number[][]): Promise<number[]> {
    if (this.models.length === 0) {
      throw new Error('No models added to ensemble');
    }

    const predictions = [];
    
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];
      const weight = this.weights[i];
      
      // 各モデルの予測を取得
      const modelPredictions = await this.getModelPredictions(model, features);
      
      // 重み付き予測を計算
      const weightedPredictions = modelPredictions.map(pred => pred * weight);
      predictions.push(weightedPredictions);
    }

    // 重み付き平均を計算
    const finalPredictions = [];
    for (let i = 0; i < features.length; i++) {
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (let j = 0; j < predictions.length; j++) {
        weightedSum += predictions[j][i];
        totalWeight += this.weights[j];
      }
      
      finalPredictions.push(weightedSum / totalWeight);
    }

    return finalPredictions;
  }

  private async getModelPredictions(model: any, features: number[][]): Promise<number[]> {
    // モデルの種類に応じて予測方法を変更
    if (model.predict) {
      // TensorFlow.jsモデルの場合
      const tensor = tf.tensor2d(features);
      const predictions = await model.predict(tensor).data();
      tensor.dispose();
      return Array.from(predictions);
    } else if (model.predict_proba) {
      // scikit-learnスタイルのモデルの場合
      return model.predict_proba(features).map((probs: number[]) => probs[1] || probs[0]);
    } else {
      // 単純な予測関数の場合
      return features.map(feature => model.predict(feature));
    }
  }
}

// ランダムフォレスト風の実装
export class RandomForestModel {
  private trees: any[] = [];
  private nEstimators: number;
  private maxDepth: number;

  constructor(nEstimators: number = 10, maxDepth: number = 5) {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.trees = [];
  }

  async train(features: number[][], labels: number[]): Promise<void> {
    this.trees = [];
    
    for (let i = 0; i < this.nEstimators; i++) {
      // ブートストラップサンプリング
      const bootstrapSample = this.bootstrapSample(features, labels);
      
      // 決定木を訓練
      const tree = await this.trainDecisionTree(
        bootstrapSample.features, 
        bootstrapSample.labels
      );
      
      this.trees.push(tree);
    }
  }

  async predict(features: number[][]): Promise<number[]> {
    const predictions = [];
    
    for (const feature of features) {
      const treePredictions = [];
      
      for (const tree of this.trees) {
        const prediction = this.predictWithTree(tree, feature);
        treePredictions.push(prediction);
      }
      
      // 多数決で最終予測を決定
      const avgPrediction = treePredictions.reduce((sum, pred) => sum + pred, 0) / treePredictions.length;
      predictions.push(avgPrediction);
    }
    
    return predictions;
  }

  private bootstrapSample(features: number[][], labels: number[]): { features: number[][], labels: number[] } {
    const n = features.length;
    const sampleFeatures = [];
    const sampleLabels = [];
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      sampleFeatures.push(features[randomIndex]);
      sampleLabels.push(labels[randomIndex]);
    }
    
    return { features: sampleFeatures, labels: sampleLabels };
  }

  private async trainDecisionTree(features: number[][], labels: number[]): Promise<any> {
    // 簡易的な決定木実装
    return {
      root: this.buildNode(features, labels, 0),
      maxDepth: this.maxDepth
    };
  }

  private buildNode(features: number[][], labels: number[], depth: number): any {
    if (depth >= this.maxDepth || this.isPure(labels)) {
      return {
        isLeaf: true,
        prediction: this.getMajorityClass(labels)
      };
    }

    const bestSplit = this.findBestSplit(features, labels);
    
    if (!bestSplit) {
      return {
        isLeaf: true,
        prediction: this.getMajorityClass(labels)
      };
    }

    const { leftFeatures, leftLabels, rightFeatures, rightLabels } = this.splitData(
      features, labels, bestSplit.featureIndex, bestSplit.threshold
    );

    return {
      isLeaf: false,
      featureIndex: bestSplit.featureIndex,
      threshold: bestSplit.threshold,
      left: this.buildNode(leftFeatures, leftLabels, depth + 1),
      right: this.buildNode(rightFeatures, rightLabels, depth + 1)
    };
  }

  private isPure(labels: number[]): boolean {
    const uniqueLabels = new Set(labels);
    return uniqueLabels.size === 1;
  }

  private getMajorityClass(labels: number[]): number {
    const counts = labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.keys(counts).reduce((a, b) => counts[Number(a)] > counts[Number(b)] ? a : b, '0');
  }

  private findBestSplit(features: number[][], labels: number[]): any {
    let bestGini = Infinity;
    let bestSplit = null;
    
    for (let featureIndex = 0; featureIndex < features[0].length; featureIndex++) {
      const values = features.map(f => f[featureIndex]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
      
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gini = this.calculateGini(features, labels, featureIndex, threshold);
        
        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { featureIndex, threshold };
        }
      }
    }
    
    return bestSplit;
  }

  private calculateGini(features: number[][], labels: number[], featureIndex: number, threshold: number): number {
    const { leftLabels, rightLabels } = this.splitData(features, labels, featureIndex, threshold);
    
    const leftGini = this.giniImpurity(leftLabels);
    const rightGini = this.giniImpurity(rightLabels);
    
    const leftWeight = leftLabels.length / labels.length;
    const rightWeight = rightLabels.length / labels.length;
    
    return leftWeight * leftGini + rightWeight * rightGini;
  }

  private giniImpurity(labels: number[]): number {
    if (labels.length === 0) return 0;
    
    const counts = labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    let gini = 1;
    for (const count of Object.values(counts)) {
      const probability = count / labels.length;
      gini -= probability * probability;
    }
    
    return gini;
  }

  private splitData(features: number[][], labels: number[], featureIndex: number, threshold: number): any {
    const leftFeatures = [];
    const leftLabels = [];
    const rightFeatures = [];
    const rightLabels = [];
    
    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        leftFeatures.push(features[i]);
        leftLabels.push(labels[i]);
      } else {
        rightFeatures.push(features[i]);
        rightLabels.push(labels[i]);
      }
    }
    
    return { leftFeatures, leftLabels, rightFeatures, rightLabels };
  }

  private predictWithTree(tree: any, feature: number[]): number {
    if (tree.isLeaf) {
      return tree.prediction;
    }
    
    if (feature[tree.featureIndex] <= tree.threshold) {
      return this.predictWithTree(tree.left, feature);
    } else {
      return this.predictWithTree(tree.right, feature);
    }
  }
}

// 勾配ブースティング風の実装
export class GradientBoostingModel {
  private models: any[] = [];
  private learningRate: number;
  private nEstimators: number;

  constructor(learningRate: number = 0.1, nEstimators: number = 100) {
    this.learningRate = learningRate;
    this.nEstimators = nEstimators;
    this.models = [];
  }

  async train(features: number[][], labels: number[]): Promise<void> {
    this.models = [];
    
    // 初期予測（平均値）
    let predictions = new Array(features.length).fill(0);
    
    for (let i = 0; i < this.nEstimators; i++) {
      // 残差を計算
      const residuals = labels.map((label, index) => label - predictions[index]);
      
      // 残差を予測するモデルを訓練
      const model = await this.trainWeakLearner(features, residuals);
      this.models.push(model);
      
      // 予測を更新
      const modelPredictions = await this.predictWithModel(model, features);
      predictions = predictions.map((pred, index) => 
        pred + this.learningRate * modelPredictions[index]
      );
    }
  }

  async predict(features: number[][]): Promise<number[]> {
    let predictions = new Array(features.length).fill(0);
    
    for (const model of this.models) {
      const modelPredictions = await this.predictWithModel(model, features);
      predictions = predictions.map((pred, index) => 
        pred + this.learningRate * modelPredictions[index]
      );
    }
    
    return predictions;
  }

  private async trainWeakLearner(features: number[][], residuals: number[]): Promise<any> {
    // 簡易的な弱学習器（線形回帰）
    return {
      coefficients: this.calculateLinearRegression(features, residuals),
      intercept: 0
    };
  }

  private calculateLinearRegression(features: number[][], targets: number[]): number[] {
    // 簡易的な線形回帰の実装
    const n = features.length;
    const m = features[0].length;
    
    // 正規方程式を解く
    const X = features.map(row => [1, ...row]); // バイアス項を追加
    const y = targets;
    
    // 最小二乗法で係数を計算
    const coefficients = new Array(m + 1).fill(0);
    
    for (let i = 0; i < m + 1; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += X[j][i] * y[j];
      }
      coefficients[i] = sum / n;
    }
    
    return coefficients;
  }

  private async predictWithModel(model: any, features: number[][]): Promise<number[]> {
    return features.map(feature => {
      let prediction = model.intercept;
      for (let i = 0; i < feature.length; i++) {
        prediction += model.coefficients[i + 1] * feature[i];
      }
      return prediction;
    });
  }
}

// サポートベクターマシン風の実装
export class SVMModel {
  private supportVectors: number[][] = [];
  private supportVectorLabels: number[] = [];
  private alphas: number[] = [];
  private bias: number = 0;
  private kernel: string;

  constructor(kernel: string = 'linear') {
    this.kernel = kernel;
  }

  async train(features: number[][], labels: number[]): Promise<void> {
    // 簡易的なSVM実装
    const n = features.length;
    const m = features[0].length;
    
    // ラグランジュ乗数を初期化
    this.alphas = new Array(n).fill(0);
    this.bias = 0;
    
    // 簡易的な最適化（実際のSVMはより複雑）
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < n; i++) {
        const prediction = this.predictSingle(features[i]);
        const error = labels[i] - prediction;
        
        if (Math.abs(error) > 0.1) {
          this.alphas[i] += 0.01 * error;
          this.alphas[i] = Math.max(0, Math.min(1, this.alphas[i]));
        }
      }
    }
    
    // サポートベクタを特定
    this.supportVectors = [];
    this.supportVectorLabels = [];
    
    for (let i = 0; i < n; i++) {
      if (this.alphas[i] > 0.01) {
        this.supportVectors.push(features[i]);
        this.supportVectorLabels.push(labels[i]);
      }
    }
  }

  async predict(features: number[][]): Promise<number[]> {
    return features.map(feature => this.predictSingle(feature));
  }

  private predictSingle(feature: number[]): number {
    let prediction = this.bias;
    
    for (let i = 0; i < this.supportVectors.length; i++) {
      const kernelValue = this.kernelFunction(feature, this.supportVectors[i]);
      prediction += this.alphas[i] * this.supportVectorLabels[i] * kernelValue;
    }
    
    return prediction > 0 ? 1 : 0;
  }

  private kernelFunction(x1: number[], x2: number[]): number {
    if (this.kernel === 'linear') {
      return this.dotProduct(x1, x2);
    } else if (this.kernel === 'rbf') {
      const gamma = 1.0;
      const distance = this.euclideanDistance(x1, x2);
      return Math.exp(-gamma * distance * distance);
    }
    
    return this.dotProduct(x1, x2);
  }

  private dotProduct(x1: number[], x2: number[]): number {
    return x1.reduce((sum, val, i) => sum + val * x2[i], 0);
  }

  private euclideanDistance(x1: number[], x2: number[]): number {
    const sum = x1.reduce((sum, val, i) => sum + Math.pow(val - x2[i], 2), 0);
    return Math.sqrt(sum);
  }
}



