// 動的機械学習システム
import { dataProcessingSystem } from './dataProcessingSystem';

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  description: string;
  complexity: 'low' | 'medium' | 'high';
  hyperparameters: Record<string, any>;
  isSelected: boolean;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  status: 'training' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

export interface ValidationResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  executionTime: number;
}

export interface SubmissionData {
  modelId: string;
  modelName: string;
  hyperparameters: Record<string, any>;
  validationAccuracy: number;
  submissionTime: Date;
  processingHistory: string[];
}

export class DynamicMLSystem {
  private availableModels: ModelConfig[] = [];
  private selectedModel: ModelConfig | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    console.log('Initializing ML models...');
    this.availableModels = [
      // 分類モデル
      {
        id: 'logistic_regression',
        name: 'ロジスティック回帰',
        type: 'classification',
        description: '線形分類器。シンプルで高速、解釈しやすい',
        complexity: 'low',
        hyperparameters: {
          learning_rate: 0.01,
          max_iter: 1000,
          regularization: 'l2',
          C: 1.0
        },
        isSelected: false
      },
      {
        id: 'random_forest',
        name: 'ランダムフォレスト',
        type: 'classification',
        description: 'アンサンブル学習。過学習に強く、特徴量重要度が分かる',
        complexity: 'medium',
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1
        },
        isSelected: false
      },
      {
        id: 'svm',
        name: 'サポートベクターマシン',
        type: 'classification',
        description: '高次元データに強い。カーネル法で非線形分離可能',
        complexity: 'high',
        hyperparameters: {
          kernel: 'rbf',
          C: 1.0,
          gamma: 'scale',
          degree: 3
        },
        isSelected: false
      },
      {
        id: 'neural_network',
        name: 'ニューラルネットワーク',
        type: 'classification',
        description: '深層学習。複雑なパターンを学習可能',
        complexity: 'high',
        hyperparameters: {
          hidden_layers: [64, 32],
          activation: 'relu',
          learning_rate: 0.001,
          epochs: 100,
          batch_size: 32
        },
        isSelected: false
      },
      // 回帰モデル
      {
        id: 'linear_regression',
        name: '線形回帰',
        type: 'regression',
        description: '基本的な回帰モデル。シンプルで高速',
        complexity: 'low',
        hyperparameters: {
          fit_intercept: true,
          normalize: false
        },
        isSelected: false
      },
      {
        id: 'ridge_regression',
        name: 'リッジ回帰',
        type: 'regression',
        description: '正則化付き線形回帰。過学習を防ぐ',
        complexity: 'low',
        hyperparameters: {
          alpha: 1.0,
          fit_intercept: true
        },
        isSelected: false
      },
      {
        id: 'gradient_boosting',
        name: '勾配ブースティング',
        type: 'regression',
        description: 'アンサンブル学習。高い精度を期待できる',
        complexity: 'high',
        hyperparameters: {
          n_estimators: 100,
          learning_rate: 0.1,
          max_depth: 6,
          subsample: 1.0
        },
        isSelected: false
      }
    ];
    console.log('ML models initialized:', this.availableModels.length, 'models');
  }

  // 利用可能なモデルを取得（問題タイプでフィルタ）
  getAvailableModels(problemType: 'classification' | 'regression'): ModelConfig[] {
    return this.availableModels.filter(model => model.type === problemType);
  }

  // モデルを選択
  selectModel(modelId: string): boolean {
    console.log('Selecting model:', modelId);
    // 既存の選択を解除
    this.availableModels.forEach(model => model.isSelected = false);
    
    const model = this.availableModels.find(m => m.id === modelId);
    if (model) {
      model.isSelected = true;
      this.selectedModel = model;
      console.log('Model selected successfully:', model.name);
      return true;
    }
    console.log('Model not found:', modelId);
    return false;
  }

  // 選択されたモデルを取得
  getSelectedModel(): ModelConfig | null {
    return this.selectedModel;
  }

  // ハイパーパラメータを更新
  updateHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    const model = this.availableModels.find(m => m.id === modelId);
    if (model) {
      model.hyperparameters = { ...model.hyperparameters, ...hyperparameters };
      if (this.selectedModel?.id === modelId) {
        this.selectedModel.hyperparameters = model.hyperparameters;
      }
      return true;
    }
    return false;
  }

  // 学習を開始
  async startTraining(): Promise<TrainingProgress> {
    if (!this.selectedModel) {
      throw new Error('モデルが選択されていません');
    }

    const currentDataset = dataProcessingSystem.getCurrentDataset();
    if (!currentDataset) {
      throw new Error('データセットが選択されていません');
    }

    this.trainingProgress = {
      epoch: 0,
      totalEpochs: this.selectedModel.hyperparameters.epochs || 100,
      loss: 1.0,
      accuracy: 0.0,
      status: 'training',
      startTime: new Date()
    };

    // 学習をシミュレート
    await this.simulateTraining();

    return this.trainingProgress;
  }

  // 学習をシミュレート
  private async simulateTraining(): Promise<void> {
    if (!this.trainingProgress || !this.selectedModel) return;

    const totalEpochs = this.trainingProgress.totalEpochs;
    const startLoss = 1.0;
    const targetLoss = 0.1;
    const startAccuracy = 0.0;
    const targetAccuracy = 0.9;

    for (let epoch = 0; epoch < totalEpochs; epoch++) {
      if (this.trainingProgress.status !== 'training') break;

      // 進捗を更新
      this.trainingProgress.epoch = epoch + 1;
      
      // 損失と精度を計算（簡易的なシミュレーション）
      const progress = epoch / totalEpochs;
      this.trainingProgress.loss = startLoss * (1 - progress) + targetLoss * progress + (Math.random() - 0.5) * 0.1;
      this.trainingProgress.accuracy = startAccuracy + (targetAccuracy - startAccuracy) * progress + (Math.random() - 0.5) * 0.05;
      
      // 損失と精度を0-1の範囲に制限
      this.trainingProgress.loss = Math.max(0, Math.min(1, this.trainingProgress.loss));
      this.trainingProgress.accuracy = Math.max(0, Math.min(1, this.trainingProgress.accuracy));

      // 少し待機（リアルタイム感を演出）
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 学習完了
    if (this.trainingProgress) {
      this.trainingProgress.status = 'completed';
      this.trainingProgress.endTime = new Date();
    }
  }

  // 学習進捗を取得
  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress;
  }

  // 学習を停止
  stopTraining(): void {
    if (this.trainingProgress) {
      this.trainingProgress.status = 'failed';
      this.trainingProgress.endTime = new Date();
    }
  }

  // 検証を実行
  async executeValidation(): Promise<ValidationResult> {
    if (!this.selectedModel) {
      throw new Error('モデルが選択されていません');
    }

    const startTime = new Date();
    
    // 検証をシミュレート
    await new Promise(resolve => setTimeout(resolve, 2000));

    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();

    // ランダムな検証結果を生成
    const accuracy = 0.85 + Math.random() * 0.1;
    const precision = accuracy + (Math.random() - 0.5) * 0.05;
    const recall = accuracy + (Math.random() - 0.5) * 0.05;
    const f1Score = 2 * (precision * recall) / (precision + recall);

    this.validationResult = {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: this.generateConfusionMatrix(accuracy),
      executionTime
    };

    return this.validationResult;
  }

  // 混同行列を生成
  private generateConfusionMatrix(accuracy: number): number[][] {
    const total = 100;
    const correct = Math.floor(total * accuracy);
    const incorrect = total - correct;
    
    const tp = Math.floor(correct * 0.7);
    const tn = correct - tp;
    const fp = Math.floor(incorrect * 0.3);
    const fn = incorrect - fp;

    return [
      [tp, fp],
      [fn, tn]
    ];
  }

  // 検証結果を取得
  getValidationResult(): ValidationResult | null {
    return this.validationResult;
  }

  // 提出を実行
  async submitModel(submissionName: string, comment: string): Promise<SubmissionData> {
    if (!this.selectedModel || !this.validationResult) {
      throw new Error('モデルまたは検証結果がありません');
    }

    const submission: SubmissionData = {
      modelId: this.selectedModel.id,
      modelName: submissionName,
      hyperparameters: this.selectedModel.hyperparameters,
      validationAccuracy: this.validationResult.accuracy,
      submissionTime: new Date(),
      processingHistory: [
        'データ分割: 訓練70%, 検証30%',
        '前処理: 標準化, ラベルエンコーディング',
        '特徴量エンジニアリング: 多項式特徴量, 集約特徴量',
        `モデル: ${this.selectedModel.name}`,
        `ハイパーパラメータ: ${JSON.stringify(this.selectedModel.hyperparameters)}`
      ]
    };

    this.submissionHistory.push(submission);
    return submission;
  }

  // 提出履歴を取得
  getSubmissionHistory(): SubmissionData[] {
    return this.submissionHistory;
  }

  // システムをリセット
  reset(): void {
    this.selectedModel = null;
    this.trainingProgress = null;
    this.validationResult = null;
    this.availableModels.forEach(model => model.isSelected = false);
  }
}

// シングルトンインスタンス
export const dynamicMLSystem = new DynamicMLSystem();
