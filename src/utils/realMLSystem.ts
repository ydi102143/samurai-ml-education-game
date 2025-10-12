// 実際の機械学習システム
import { RealMLModel, TraditionalMLModel, RealModelConfig, TrainingData, ModelResult } from './realMLModels';

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

export class RealMLSystem {
  private availableModels: RealModelConfig[] = [];
  private selectedModel: RealMLModel | TraditionalMLModel | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];
  private trainingData: TrainingData | null = null;

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    console.log('Initializing real ML models...');
    this.availableModels = [
      // 分類モデル
      {
        id: 'neural_network_classification',
        name: 'ニューラルネットワーク（分類）',
        type: 'classification',
        description: '多層パーセプトロンによる分類器。複雑なパターンを学習可能',
        complexity: 'high',
        hyperparameters: {
          learning_rate: 0.001,
          hidden_units: 64,
          dropout: 0.2,
          epochs: 100,
          batch_size: 32
        },
        isSelected: false
      },
      {
        id: 'logistic_regression',
        name: 'ロジスティック回帰',
        type: 'classification',
        description: '線形分類器。シンプルで高速、解釈しやすい',
        complexity: 'low',
        hyperparameters: {
          learning_rate: 0.01,
          epochs: 1000,
          batch_size: 32
        },
        isSelected: false
      },
      {
        id: 'neural_network_regression',
        name: 'ニューラルネットワーク（回帰）',
        type: 'regression',
        description: '多層パーセプトロンによる回帰器。非線形関係を学習可能',
        complexity: 'high',
        hyperparameters: {
          learning_rate: 0.001,
          hidden_units: 64,
          dropout: 0.2,
          epochs: 100,
          batch_size: 32
        },
        isSelected: false
      },
      {
        id: 'linear_regression',
        name: '線形回帰',
        type: 'regression',
        description: '線形回帰モデル。シンプルで高速',
        complexity: 'low',
        hyperparameters: {
          learning_rate: 0.01,
          epochs: 1000
        },
        isSelected: false
      }
    ];
    console.log('Real ML models initialized:', this.availableModels.length, 'models');
  }

  // 利用可能なモデルを取得
  getAvailableModels(problemType: 'classification' | 'regression'): RealModelConfig[] {
    return this.availableModels.filter(model => model.type === problemType);
  }

  // モデルを選択
  selectModel(modelId: string): boolean {
    console.log('Selecting real model:', modelId);
    
    // 既存の選択を解除
    this.availableModels.forEach(model => model.isSelected = false);
    
    const modelConfig = this.availableModels.find(m => m.id === modelId);
    if (modelConfig) {
      modelConfig.isSelected = true;
      
      // 実際のモデルインスタンスを作成
      try {
        this.selectedModel = new RealMLModel(modelConfig);
        console.log('Real model selected successfully:', modelConfig.name);
        return true;
      } catch (error) {
        console.log('TensorFlow not available, using traditional method');
        this.selectedModel = new TraditionalMLModel(modelConfig);
        console.log('Traditional model selected successfully:', modelConfig.name);
        return true;
      }
    }
    console.log('Model not found:', modelId);
    return false;
  }

  // 選択されたモデルを取得
  getSelectedModel(): RealModelConfig | null {
    return this.selectedModel?.getConfig() || null;
  }

  // ハイパーパラメータを更新
  updateHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    const model = this.availableModels.find(m => m.id === modelId);
    if (model) {
      model.hyperparameters = { ...model.hyperparameters, ...hyperparameters };
      return true;
    }
    return false;
  }

  // 学習データを設定
  setTrainingData(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[]): void {
    // 安全チェック
    if (!data || data.length === 0) {
      console.error('No data provided for training');
      return;
    }
    
    if (!featureNames || featureNames.length === 0) {
      console.error('No feature names provided');
      return;
    }
    
    if (!featureTypes || featureTypes.length === 0) {
      console.error('No feature types provided');
      return;
    }
    
    console.log('Setting training data:', data.length, 'samples,', featureNames.length, 'features');
    
    // データを前処理（欠損値処理、カテゴリカル変数のエンコーディング）
    const processedData = this.preprocessData(data, featureNames, featureTypes);
    
    this.trainingData = {
      features: processedData.features,
      labels: processedData.labels,
      featureNames: processedData.featureNames,
      featureTypes: processedData.featureTypes
    };
    
    console.log('Training data processed:', this.trainingData.features.length, 'samples,', this.trainingData.features[0]?.length || 0, 'features');
  }

  // データの前処理
  private preprocessData(
    data: Array<{ features: (number | string)[], label: number }>, 
    featureNames: string[], 
    featureTypes: ('numerical' | 'categorical')[]
  ): { features: number[][], labels: number[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    console.log('Preprocessing data...');
    
    const processedFeatures: number[][] = [];
    const processedLabels: number[] = [];
    const processedFeatureNames: string[] = [];
    const processedFeatureTypes: ('numerical' | 'categorical')[] = [];
    
    // 各特徴量を処理
    for (let i = 0; i < featureNames.length; i++) {
      const featureType = featureTypes[i];
      const featureName = featureNames[i];
      
      if (featureType === 'categorical') {
        // カテゴリカル変数の処理
        const uniqueValues = [...new Set(data.map(row => row.features[i]).filter(v => v !== null && v !== undefined))];
        const valueMap = new Map(uniqueValues.map((value, index) => [value, index]));
        
        // ラベルエンコーディング
        const encodedValues = data.map(row => {
          const value = row.features[i];
          return value !== null && value !== undefined ? (valueMap.get(value) || 0) : 0;
        });
        
        processedFeatures.push(encodedValues);
        processedFeatureNames.push(featureName);
        processedFeatureTypes.push('numerical');
      } else {
        // 数値変数の処理
        const values = data.map(row => {
          const value = row.features[i];
          if (typeof value === 'string') {
            const numValue = parseFloat(value);
            return isNaN(numValue) ? 0 : numValue;
          }
          return typeof value === 'number' ? value : 0;
        });
        
        // 欠損値処理（平均値で埋める）
        const validValues = values.filter(v => !isNaN(v) && v !== null && v !== undefined);
        const mean = validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
        
        const filledValues = values.map(v => isNaN(v) || v === null || v === undefined ? mean : v);
        
        processedFeatures.push(filledValues);
        processedFeatureNames.push(featureName);
        processedFeatureTypes.push('numerical');
      }
    }
    
    // ラベルを処理
    const labels = data.map(row => row.label);
    processedLabels.push(...labels);
    
    // 特徴量を転置（各行が1つのサンプルになるように）
    const transposedFeatures: number[][] = [];
    for (let i = 0; i < data.length; i++) {
      const sample: number[] = [];
      for (let j = 0; j < processedFeatures.length; j++) {
        sample.push(processedFeatures[j][i]);
      }
      transposedFeatures.push(sample);
    }
    
    console.log('Data preprocessing completed:', transposedFeatures.length, 'samples,', transposedFeatures[0]?.length || 0, 'features');
    
    return {
      features: transposedFeatures,
      labels: processedLabels,
      featureNames: processedFeatureNames,
      featureTypes: processedFeatureTypes
    };
  }


  // 学習を開始
  async startTraining(): Promise<void> {
    if (!this.selectedModel || !this.trainingData) {
      throw new Error('No model selected or training data not set');
    }

    // 動的な学習IDを生成
    const trainingId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Starting real training with ID:', trainingId);
    
    // 検証結果をリセット
    this.validationResult = null;
    
    this.trainingProgress = {
      epoch: 0,
      totalEpochs: this.selectedModel.getConfig().hyperparameters.epochs || 100,
      loss: 0,
      accuracy: 0,
      status: 'training',
      startTime: new Date()
    };

    try {
      await this.selectedModel.train(this.trainingData, (epoch, loss, accuracy) => {
        if (this.trainingProgress) {
          this.trainingProgress.epoch = epoch;
          this.trainingProgress.loss = loss;
          this.trainingProgress.accuracy = accuracy;
          this.trainingProgress.status = 'training';
          console.log(`Training progress: Epoch ${epoch}/${this.trainingProgress.totalEpochs}, Loss: ${loss.toFixed(4)}, Accuracy: ${accuracy.toFixed(4)}`);
        }
      });

      if (this.trainingProgress) {
        this.trainingProgress.status = 'completed';
        this.trainingProgress.endTime = new Date();
        console.log('Real training completed successfully');
      }

      console.log('Real training completed');
    } catch (error) {
      console.error('Training failed:', error);
      if (this.trainingProgress) {
        this.trainingProgress.status = 'failed';
        this.trainingProgress.endTime = new Date();
      }
      throw error;
    }
  }

  // 学習進捗を取得
  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress;
  }

  // 検証を実行
  async executeValidation(): Promise<void> {
    if (!this.selectedModel || !this.trainingData) {
      throw new Error('No model selected or training data not set');
    }

    // 動的な検証IDを生成
    const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Executing real validation with ID:', validationId);
    const startTime = Date.now();

    try {
      // データを分割（80% 学習、20% 検証）
      const splitIndex = Math.floor(this.trainingData.features.length * 0.8);
      const validationFeatures = this.trainingData.features.slice(splitIndex);
      const validationLabels = this.trainingData.labels.slice(splitIndex);

      // 予測を実行
      const predictions = await this.selectedModel.predict(validationFeatures);
      
      // 評価指標を計算
      const { accuracy, loss } = await this.selectedModel.evaluate(validationFeatures, validationLabels);
      
      // 混同行列を計算（分類の場合）
      let confusionMatrix: number[][] = [];
      let precision = 0;
      let recall = 0;
      let f1Score = 0;

      if (this.selectedModel.getConfig().type === 'classification') {
        const uniqueLabels = [...new Set(this.trainingData.labels)].sort();
        confusionMatrix = uniqueLabels.map(() => new Array(uniqueLabels.length).fill(0));
        
        predictions.forEach((pred, index) => {
          const actual = validationLabels[index];
          const actualIndex = uniqueLabels.indexOf(actual);
          const predIndex = uniqueLabels.indexOf(pred);
          confusionMatrix[actualIndex][predIndex]++;
        });

        // 適合率、再現率、F1スコアを計算
        const truePositives = confusionMatrix.map((row, i) => row[i]);
        const falsePositives = confusionMatrix.map((row, i) => 
          row.reduce((sum, val, j) => sum + (i !== j ? val : 0), 0)
        );
        const falseNegatives = confusionMatrix.map((_, i) => 
          confusionMatrix.reduce((sum, row) => sum + (i !== confusionMatrix.indexOf(row) ? row[i] : 0), 0)
        );

        // 各クラスの適合率と再現率を計算
        const precisions = truePositives.map((tp, i) => 
          (tp + falsePositives[i] > 0) ? tp / (tp + falsePositives[i]) : 0
        );
        const recalls = truePositives.map((tp, i) => 
          (tp + falseNegatives[i] > 0) ? tp / (tp + falseNegatives[i]) : 0
        );

        // 平均を計算
        precision = precisions.reduce((sum, p) => sum + p, 0) / uniqueLabels.length;
        recall = recalls.reduce((sum, r) => sum + r, 0) / uniqueLabels.length;

        f1Score = (precision + recall > 0) ? 2 * (precision * recall) / (precision + recall) : 0;
      }

      this.validationResult = {
        accuracy,
        precision,
        recall,
        f1Score,
        confusionMatrix,
        executionTime: Date.now() - startTime
      };

      console.log('Real validation completed:', this.validationResult);
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  }

  // 検証結果を取得
  getValidationResult(): ValidationResult | null {
    return this.validationResult;
  }

  // モデルを提出
  submitModel(submissionName: string, comment: string = ''): void {
    if (!this.selectedModel || !this.validationResult) {
      throw new Error('No model selected or validation not completed');
    }

    const submission: SubmissionData = {
      modelId: this.selectedModel.getConfig().id,
      modelName: submissionName,
      hyperparameters: this.selectedModel.getConfig().hyperparameters,
      validationAccuracy: this.validationResult.accuracy,
      submissionTime: new Date(),
      processingHistory: [
        `モデル: ${this.selectedModel.getConfig().name}`,
        `ハイパーパラメータ: ${JSON.stringify(this.selectedModel.getConfig().hyperparameters)}`,
        `検証精度: ${this.validationResult.accuracy.toFixed(4)}`,
        `コメント: ${comment}`
      ]
    };

    this.submissionHistory.push(submission);
    console.log('Model submitted:', submission);
  }

  // 提出履歴を取得
  getSubmissionHistory(): SubmissionData[] {
    return [...this.submissionHistory];
  }

  // 予測を実行（新しいデータに対して）
  async predict(features: number[][]): Promise<number[]> {
    if (!this.selectedModel) {
      throw new Error('No model selected');
    }

    return await this.selectedModel.predict(features);
  }

  // 確率を取得（分類モデルの場合）
  async predictProbabilities(features: number[][]): Promise<number[][]> {
    if (!this.selectedModel || this.selectedModel.getConfig().type !== 'classification') {
      throw new Error('No classification model selected');
    }

    if ('predictProbabilities' in this.selectedModel) {
      return await this.selectedModel.predictProbabilities(features);
    } else {
      throw new Error('Probability prediction not supported for this model type');
    }
  }
}

// シングルトンインスタンス
export const realMLSystem = new RealMLSystem();
