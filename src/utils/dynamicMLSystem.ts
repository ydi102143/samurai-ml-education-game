// 動的機械学習システム
export interface DynamicMLConfig {
  enableAutoTuning: boolean;
  enableEarlyStopping: boolean;
  enableCrossValidation: boolean;
  maxIterations: number;
  patience: number;
  minImprovement: number;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  validationAccuracy?: number;
  validationLoss?: number;
  learningRate: number;
  isEarlyStopped: boolean;
}

export interface ModelPerformance {
  modelName: string;
  accuracy: number;
  loss: number;
  trainingTime: number;
  validationAccuracy: number;
  validationLoss: number;
  hyperparameters: Record<string, any>;
  isBest: boolean;
}

export class DynamicMLSystem {
  private config: DynamicMLConfig;
  private models: Map<string, any> = new Map();
  private trainingHistory: TrainingProgress[] = [];
  private performanceHistory: ModelPerformance[] = [];
  private bestModel: string | null = null;
  private trainingCallbacks: Set<(progress: TrainingProgress) => void> = new Set();

  constructor(config: DynamicMLConfig = {
    enableAutoTuning: true,
    enableEarlyStopping: true,
    enableCrossValidation: true,
    maxIterations: 1000,
    patience: 10,
    minImprovement: 0.001
  }) {
    this.config = config;
  }

  // モデルを訓練
  async trainModel(
    modelName: string,
    features: number[][],
    labels: number[],
    hyperparameters: Record<string, any> = {}
  ): Promise<ModelPerformance> {
    const startTime = Date.now();
    
    try {
      // モデルを作成
      const model = this.createModel(modelName, hyperparameters);
      this.models.set(modelName, model);

      // データを分割
      const { trainFeatures, trainLabels, valFeatures, valLabels } = this.splitData(features, labels);

      // 訓練を実行
      const trainingResult = await this.performTraining(
        model,
        trainFeatures,
        trainLabels,
        valFeatures,
        valLabels,
        hyperparameters
      );

      // 性能を評価
      const performance = this.evaluateModel(
        model,
        valFeatures,
        valLabels,
        modelName,
        trainingResult,
        Date.now() - startTime
      );

      // 履歴を更新
      this.updatePerformanceHistory(performance);

      return performance;
    } catch (error) {
      throw new Error(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // モデルを作成
  private createModel(modelName: string, hyperparameters: Record<string, any>): any {
    // 簡略化されたモデル作成
    return {
      name: modelName,
      weights: new Array(10).fill(0),
      bias: 0,
      hyperparameters,
      isTrained: false
    };
  }

  // データを分割
  private splitData(features: number[][], labels: number[]): {
    trainFeatures: number[][];
    trainLabels: number[];
    valFeatures: number[][];
    valLabels: number[];
  } {
    const splitIndex = Math.floor(features.length * 0.8);
    
    return {
      trainFeatures: features.slice(0, splitIndex),
      trainLabels: labels.slice(0, splitIndex),
      valFeatures: features.slice(splitIndex),
      valLabels: labels.slice(splitIndex)
    };
  }

  // 訓練を実行
  private async performTraining(
    model: any,
    trainFeatures: number[][],
    trainLabels: number[],
    valFeatures: number[][],
    valLabels: number[],
    hyperparameters: Record<string, any>
  ): Promise<{ accuracy: number; loss: number; epochs: number }> {
    const { learningRate = 0.01, epochs = 100 } = hyperparameters;
    let bestValAccuracy = 0;
    let patienceCounter = 0;
    let bestWeights = [...model.weights];
    let bestBias = model.bias;

    for (let epoch = 0; epoch < epochs; epoch++) {
      // 訓練
      const trainResult = this.trainEpoch(model, trainFeatures, trainLabels, learningRate);
      
      // 検証
      const valResult = this.evaluateModel(model, valFeatures, valLabels, '', { accuracy: 0, loss: 0, epochs: 0 }, 0);

      // 進捗を記録
      const progress: TrainingProgress = {
        epoch: epoch + 1,
        totalEpochs: epochs,
        accuracy: trainResult.accuracy,
        loss: trainResult.loss,
        validationAccuracy: valResult.validationAccuracy,
        validationLoss: valResult.validationLoss,
        learningRate,
        isEarlyStopped: false
      };

      this.trainingHistory.push(progress);
      this.notifyTrainingProgress(progress);

      // 最良の結果を保存
      if (valResult.validationAccuracy > bestValAccuracy) {
        bestValAccuracy = valResult.validationAccuracy;
        bestWeights = [...model.weights];
        bestBias = model.bias;
        patienceCounter = 0;
      } else {
        patienceCounter++;
      }

      // 早期停止
      if (this.config.enableEarlyStopping && patienceCounter >= this.config.patience) {
        progress.isEarlyStopped = true;
        break;
      }
    }

    // 最良の重みを復元
    model.weights = bestWeights;
    model.bias = bestBias;
    model.isTrained = true;

    return {
      accuracy: bestValAccuracy,
      loss: this.trainingHistory[this.trainingHistory.length - 1]?.loss || 0,
      epochs: this.trainingHistory.length
    };
  }

  // エポックを訓練
  private trainEpoch(model: any, features: number[][], labels: number[], learningRate: number): { accuracy: number; loss: number } {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(model, features[i]);
      const actual = labels[i];
      const error = prediction - actual;

      // 勾配を計算
      const gradient = error;
      const weightGradient = features[i].map(f => f * gradient);
      const biasGradient = gradient;

      // 重みを更新
      for (let j = 0; j < model.weights.length; j++) {
        model.weights[j] -= learningRate * weightGradient[j];
      }
      model.bias -= learningRate * biasGradient;

      // 精度を計算
      if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
        correct++;
      }

      // 損失を計算
      const loss = error * error;
      totalLoss += loss;
    }

    return {
      accuracy: correct / features.length,
      loss: totalLoss / features.length
    };
  }

  // 予測を実行
  private predict(model: any, features: number[]): number {
    let sum = model.bias;
    for (let i = 0; i < features.length; i++) {
      sum += model.weights[i] * features[i];
    }
    return 1 / (1 + Math.exp(-sum)); // シグモイド関数
  }

  // モデルを評価
  private evaluateModel(
    model: any,
    features: number[][],
    labels: number[],
    modelName: string,
    trainingResult: any,
    trainingTime: number
  ): ModelPerformance {
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < features.length; i++) {
      const prediction = this.predict(model, features[i]);
      const actual = labels[i];

      if ((prediction > 0.5 && actual === 1) || (prediction <= 0.5 && actual === 0)) {
        correct++;
      }

      const error = prediction - actual;
      totalLoss += error * error;
    }

    const accuracy = correct / features.length;
    const loss = totalLoss / features.length;

    return {
      modelName,
      accuracy,
      loss,
      trainingTime,
      validationAccuracy: accuracy,
      validationLoss: loss,
      hyperparameters: model.hyperparameters,
      isBest: false
    };
  }

  // 性能履歴を更新
  private updatePerformanceHistory(performance: ModelPerformance): void {
    // 既存の同じモデルの履歴を削除
    this.performanceHistory = this.performanceHistory.filter(p => p.modelName !== performance.modelName);
    
    // 新しい性能を追加
    this.performanceHistory.push(performance);

    // 最良のモデルを更新
    const bestPerformance = this.performanceHistory.reduce((best, current) => 
      current.validationAccuracy > best.validationAccuracy ? current : best
    );

    this.bestModel = bestPerformance.modelName;
    bestPerformance.isBest = true;
  }

  // 訓練進捗を通知
  private notifyTrainingProgress(progress: TrainingProgress): void {
    this.trainingCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Training callback error:', error);
      }
    });
  }

  // 訓練進捗コールバックを追加
  addTrainingCallback(callback: (progress: TrainingProgress) => void): void {
    this.trainingCallbacks.add(callback);
  }

  // 訓練進捗コールバックを削除
  removeTrainingCallback(callback: (progress: TrainingProgress) => void): void {
    this.trainingCallbacks.delete(callback);
  }

  // 最良のモデルを取得
  getBestModel(): string | null {
    return this.bestModel;
  }

  // 性能履歴を取得
  getPerformanceHistory(): ModelPerformance[] {
    return [...this.performanceHistory];
  }

  // 訓練履歴を取得
  getTrainingHistory(): TrainingProgress[] {
    return [...this.trainingHistory];
  }

  // 統計情報を取得
  getStats(): {
    totalModels: number;
    bestAccuracy: number;
    averageAccuracy: number;
    totalTrainingTime: number;
    earlyStoppedCount: number;
  } {
    const totalModels = this.performanceHistory.length;
    const bestAccuracy = totalModels > 0 
      ? Math.max(...this.performanceHistory.map(p => p.validationAccuracy))
      : 0;
    const averageAccuracy = totalModels > 0
      ? this.performanceHistory.reduce((sum, p) => sum + p.validationAccuracy, 0) / totalModels
      : 0;
    const totalTrainingTime = this.performanceHistory.reduce((sum, p) => sum + p.trainingTime, 0);
    const earlyStoppedCount = this.trainingHistory.filter(p => p.isEarlyStopped).length;

    return {
      totalModels,
      bestAccuracy: Math.round(bestAccuracy * 1000) / 1000,
      averageAccuracy: Math.round(averageAccuracy * 1000) / 1000,
      totalTrainingTime,
      earlyStoppedCount
    };
  }

  // 設定を更新
  updateConfig(newConfig: Partial<DynamicMLConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): DynamicMLConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.models.clear();
    this.trainingHistory = [];
    this.performanceHistory = [];
    this.bestModel = null;
  }
}

// シングルトンインスタンス
export const dynamicMLSystem = new DynamicMLSystem();