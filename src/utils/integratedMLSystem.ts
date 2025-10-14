// 統合機械学習システム - UIの全機能に対応する完全なバックエンド

import { realDatasetGenerator, type RealDataset } from './realDatasetGenerator';
import { realDataProcessor, type ProcessedData } from './realDataProcessing';
import { realMLSystem, type TrainingProgress, type ValidationResult } from './realMLSystem';
import { dynamicLeaderboard } from './dynamicLeaderboard';

export interface ProblemData {
  id: string;
  name: string;
  description: string;
  data: Array<{ features: (number | string)[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetColumn: string;
  problemType: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  sampleCount: number;
  featureCount: number;
  missingValueRate: number;
}

export interface DataSplit {
  trainRatio: number;
  validationRatio: number;
  testRatio: number;
  trainData: Array<{ features: (number | string)[], label: number }>;
  validationData: Array<{ features: (number | string)[], label: number }>;
  testData: Array<{ features: (number | string)[], label: number }>;
}

export interface PreprocessingResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  processingSteps: string[];
  error?: string;
}

export interface FeatureEngineeringResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  newFeatures: string[];
  error?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  hyperparameters: Record<string, any>;
  isSelected: boolean;
}

export interface SubmissionData {
  id: string;
  modelName: string;
  accuracy: number;
  hyperparameters: Record<string, any>;
  submissionTime: Date;
  processingHistory: string[];
}

class IntegratedMLSystem {
  private currentProblem: ProblemData | null = null;
  private currentDataSplit: DataSplit | null = null;
  private currentProcessedData: ProcessedData | null = null;
  private currentModel: ModelConfig | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];

  // 問題データの管理
  async loadRandomProblem(): Promise<ProblemData> {
    console.log('Loading random problem...');
    
    // 動的なシード生成（現在時刻ベース）
    const dynamicSeed = Date.now() % 1000000;
    realDatasetGenerator.setSeed(dynamicSeed);
    
    const datasets = [
      realDatasetGenerator.generateMedicalDiagnosisDataset(),
      realDatasetGenerator.generateHousingPriceDataset(),
      realDatasetGenerator.generateFraudDetectionDataset()
    ];
    
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)];
    
    const problem: ProblemData = {
      id: randomDataset.id,
      name: randomDataset.name || 'Unknown Problem',
      description: randomDataset.description || 'No description available',
      data: randomDataset.data || [],
      featureNames: randomDataset.featureNames || [],
      featureTypes: randomDataset.featureTypes || [],
      targetColumn: randomDataset.targetName || 'target',
      problemType: randomDataset.type || 'classification',
      difficulty: randomDataset.difficulty || 'medium',
      sampleCount: randomDataset.sampleCount || 0,
      featureCount: randomDataset.featureCount || 0,
      missingValueRate: randomDataset.missingValueRate || 0
    };
    
    this.currentProblem = problem;
    console.log('Problem loaded:', problem.name, problem.data.length, 'samples');
    
    return problem;
  }

  getCurrentProblem(): ProblemData | null {
    return this.currentProblem;
  }

  // データ分割
  splitData(trainRatio: number = 0.7, validationRatio: number = 0.2, testRatio: number = 0.1): DataSplit {
    if (!this.currentProblem) {
      throw new Error('No problem loaded');
    }

    const data = [...this.currentProblem.data];
    const totalSamples = data.length;
    
    const trainSize = Math.floor(totalSamples * trainRatio);
    const validationSize = Math.floor(totalSamples * validationRatio);
    const testSize = totalSamples - trainSize - validationSize;
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    const dataSplit: DataSplit = {
      trainRatio,
      validationRatio,
      testRatio,
      trainData: data.slice(0, trainSize),
      validationData: data.slice(trainSize, trainSize + validationSize),
      testData: data.slice(trainSize + validationSize)
    };
    
    this.currentDataSplit = dataSplit;
    console.log('Data split completed:', {
      train: dataSplit.trainData.length,
      validation: dataSplit.validationData.length,
      test: dataSplit.testData.length
    });
    
    return dataSplit;
  }

  getCurrentDataSplit(): DataSplit | null {
    return this.currentDataSplit;
  }

  // 前処理
  async executePreprocessing(options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    if (!this.currentDataSplit) {
      return { success: false, data: [], featureNames: [], featureTypes: [], processingSteps: [], error: 'No data split available' };
    }

    try {
      console.log('Executing preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        this.currentDataSplit.trainData,
        this.currentProblem!.featureNames,
        this.currentProblem!.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 前処理（データ分割なし）
  async executePreprocessingDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    try {
      console.log('Executing direct preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Direct preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング
  async executeFeatureEngineering(options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    if (!this.currentProcessedData) {
      return { success: false, data: [], featureNames: [], featureTypes: [], newFeatures: [], error: 'No processed data available' };
    }

    try {
      console.log('Executing feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        this.currentProcessedData.data,
        this.currentProcessedData.featureNames,
        this.currentProcessedData.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(this.currentProcessedData.featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング（直接実行）
  async executeFeatureEngineeringDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    try {
      console.log('Executing direct feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Direct feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 学習データ設定
  setTrainingData(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[]): void {
    realMLSystem.setTrainingData(data, featureNames, featureTypes);
  }

  // モデル管理
  getAvailableModels(problemType: 'classification' | 'regression'): ModelConfig[] {
    const models = realMLSystem.getAvailableModels(problemType);
    return models.map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      hyperparameters: model.hyperparameters,
      isSelected: model.isSelected
    }));
  }

  selectModel(modelId: string): boolean {
    const success = realMLSystem.selectModel(modelId);
    if (success) {
      const model = realMLSystem.getSelectedModel();
      if (model) {
        this.currentModel = {
          id: model.id,
          name: model.name,
          type: model.type,
          hyperparameters: model.hyperparameters,
          isSelected: true
        };
      }
    }
    return success;
  }

  updateModelHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    return realMLSystem.updateHyperparameters(modelId, hyperparameters);
  }

  getSelectedModel(): ModelConfig | null {
    return this.currentModel;
  }

  // 学習
  async startTraining(): Promise<void> {
    if (!this.currentModel || !this.currentProcessedData) {
      throw new Error('No model selected or no processed data available');
    }

    console.log('Starting training...');
    
    // 学習データを設定
    realMLSystem.setTrainingData(
      this.currentProcessedData.data,
      this.currentProcessedData.featureNames,
      this.currentProcessedData.featureTypes
    );
    
    // 学習を開始
    await realMLSystem.startTraining();
    
    // 学習進捗を監視
    const progressInterval = setInterval(() => {
      const progress = realMLSystem.getTrainingProgress();
      if (progress) {
        this.trainingProgress = progress;
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(progressInterval);
        }
      }
    }, 100);
  }

  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress || realMLSystem.getTrainingProgress();
  }

  // 検証
  async executeValidation(): Promise<ValidationResult> {
    if (!this.currentModel || !this.trainingProgress || this.trainingProgress.status !== 'completed') {
      throw new Error('Training not completed');
    }

    console.log('Executing validation...');
    
    await realMLSystem.executeValidation();
    const result = realMLSystem.getValidationResult();
    
    if (result) {
      this.validationResult = result;
    }
    
    return result!;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResult || realMLSystem.getValidationResult();
  }

  // 提出
  async submitResults(submissionName: string, comment: string = ''): Promise<boolean> {
    if (!this.currentModel || !this.validationResult) {
      throw new Error('No model or validation result available');
    }

    try {
      console.log('Submitting results...');
      
      const submission: SubmissionData = {
        id: `submission_${Date.now()}`,
        modelName: this.currentModel.name,
        accuracy: this.validationResult.accuracy,
        hyperparameters: this.currentModel.hyperparameters,
        submissionTime: new Date(),
        processingHistory: this.currentProcessedData?.processingHistory || []
      };
      
      this.submissionHistory.push(submission);
      
      // リーダーボードに追加
      dynamicLeaderboard.addSubmission(
        submissionName,
        this.validationResult.accuracy,
        this.currentModel.hyperparameters
      );
      
      console.log('Submission completed:', submission);
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      return false;
    }
  }

  getSubmissionHistory(): SubmissionData[] {
    return this.submissionHistory;
  }

  // リーダーボード
  getLeaderboard(): any[] {
    return dynamicLeaderboard.getLeaderboard();
  }

  getLeaderboardStats(): any {
    return dynamicLeaderboard.getStats();
  }

  // データ取得（EDA用）
  getDataForEDA(): {
    data: Array<{ features: (number | string)[], label: number }>;
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    isProcessed: boolean;
  } {
    if (this.currentProcessedData) {
      return {
        data: this.currentProcessedData.data,
        featureNames: this.currentProcessedData.featureNames,
        featureTypes: this.currentProcessedData.featureTypes,
        isProcessed: true
      };
    } else if (this.currentProblem) {
      return {
        data: this.currentProblem.data,
        featureNames: this.currentProblem.featureNames,
        featureTypes: this.currentProblem.featureTypes,
        isProcessed: false
      };
    } else {
      return {
        data: [],
        featureNames: [],
        featureTypes: [],
        isProcessed: false
      };
    }
  }

  // 現在の処理済みデータを取得
  getCurrentProcessedData(): ProcessedData | null {
    return this.currentProcessedData;
  }

  // システム状態のリセット
  reset(): void {
    this.currentProblem = null;
    this.currentDataSplit = null;
    this.currentProcessedData = null;
    this.currentModel = null;
    this.trainingProgress = null;
    this.validationResult = null;
    this.submissionHistory = [];
  }
}

// シングルトンインスタンス
export const integratedMLSystem = new IntegratedMLSystem();

import { realDatasetGenerator, type RealDataset } from './realDatasetGenerator';
import { realDataProcessor, type ProcessedData } from './realDataProcessing';
import { realMLSystem, type TrainingProgress, type ValidationResult } from './realMLSystem';
import { dynamicLeaderboard } from './dynamicLeaderboard';

export interface ProblemData {
  id: string;
  name: string;
  description: string;
  data: Array<{ features: (number | string)[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetColumn: string;
  problemType: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  sampleCount: number;
  featureCount: number;
  missingValueRate: number;
}

export interface DataSplit {
  trainRatio: number;
  validationRatio: number;
  testRatio: number;
  trainData: Array<{ features: (number | string)[], label: number }>;
  validationData: Array<{ features: (number | string)[], label: number }>;
  testData: Array<{ features: (number | string)[], label: number }>;
}

export interface PreprocessingResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  processingSteps: string[];
  error?: string;
}

export interface FeatureEngineeringResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  newFeatures: string[];
  error?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  hyperparameters: Record<string, any>;
  isSelected: boolean;
}

export interface SubmissionData {
  id: string;
  modelName: string;
  accuracy: number;
  hyperparameters: Record<string, any>;
  submissionTime: Date;
  processingHistory: string[];
}

class IntegratedMLSystem {
  private currentProblem: ProblemData | null = null;
  private currentDataSplit: DataSplit | null = null;
  private currentProcessedData: ProcessedData | null = null;
  private currentModel: ModelConfig | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];

  // 問題データの管理
  async loadRandomProblem(): Promise<ProblemData> {
    console.log('Loading random problem...');
    
    // 動的なシード生成（現在時刻ベース）
    const dynamicSeed = Date.now() % 1000000;
    realDatasetGenerator.setSeed(dynamicSeed);
    
    const datasets = [
      realDatasetGenerator.generateMedicalDiagnosisDataset(),
      realDatasetGenerator.generateHousingPriceDataset(),
      realDatasetGenerator.generateFraudDetectionDataset()
    ];
    
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)];
    
    const problem: ProblemData = {
      id: randomDataset.id,
      name: randomDataset.name || 'Unknown Problem',
      description: randomDataset.description || 'No description available',
      data: randomDataset.data || [],
      featureNames: randomDataset.featureNames || [],
      featureTypes: randomDataset.featureTypes || [],
      targetColumn: randomDataset.targetName || 'target',
      problemType: randomDataset.type || 'classification',
      difficulty: randomDataset.difficulty || 'medium',
      sampleCount: randomDataset.sampleCount || 0,
      featureCount: randomDataset.featureCount || 0,
      missingValueRate: randomDataset.missingValueRate || 0
    };
    
    this.currentProblem = problem;
    console.log('Problem loaded:', problem.name, problem.data.length, 'samples');
    
    return problem;
  }

  getCurrentProblem(): ProblemData | null {
    return this.currentProblem;
  }

  // データ分割
  splitData(trainRatio: number = 0.7, validationRatio: number = 0.2, testRatio: number = 0.1): DataSplit {
    if (!this.currentProblem) {
      throw new Error('No problem loaded');
    }

    const data = [...this.currentProblem.data];
    const totalSamples = data.length;
    
    const trainSize = Math.floor(totalSamples * trainRatio);
    const validationSize = Math.floor(totalSamples * validationRatio);
    const testSize = totalSamples - trainSize - validationSize;
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    const dataSplit: DataSplit = {
      trainRatio,
      validationRatio,
      testRatio,
      trainData: data.slice(0, trainSize),
      validationData: data.slice(trainSize, trainSize + validationSize),
      testData: data.slice(trainSize + validationSize)
    };
    
    this.currentDataSplit = dataSplit;
    console.log('Data split completed:', {
      train: dataSplit.trainData.length,
      validation: dataSplit.validationData.length,
      test: dataSplit.testData.length
    });
    
    return dataSplit;
  }

  getCurrentDataSplit(): DataSplit | null {
    return this.currentDataSplit;
  }

  // 前処理
  async executePreprocessing(options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    if (!this.currentDataSplit) {
      return { success: false, data: [], featureNames: [], featureTypes: [], processingSteps: [], error: 'No data split available' };
    }

    try {
      console.log('Executing preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        this.currentDataSplit.trainData,
        this.currentProblem!.featureNames,
        this.currentProblem!.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 前処理（データ分割なし）
  async executePreprocessingDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    try {
      console.log('Executing direct preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Direct preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング
  async executeFeatureEngineering(options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    if (!this.currentProcessedData) {
      return { success: false, data: [], featureNames: [], featureTypes: [], newFeatures: [], error: 'No processed data available' };
    }

    try {
      console.log('Executing feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        this.currentProcessedData.data,
        this.currentProcessedData.featureNames,
        this.currentProcessedData.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(this.currentProcessedData.featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング（直接実行）
  async executeFeatureEngineeringDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    try {
      console.log('Executing direct feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Direct feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 学習データ設定
  setTrainingData(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[]): void {
    realMLSystem.setTrainingData(data, featureNames, featureTypes);
  }

  // モデル管理
  getAvailableModels(problemType: 'classification' | 'regression'): ModelConfig[] {
    const models = realMLSystem.getAvailableModels(problemType);
    return models.map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      hyperparameters: model.hyperparameters,
      isSelected: model.isSelected
    }));
  }

  selectModel(modelId: string): boolean {
    const success = realMLSystem.selectModel(modelId);
    if (success) {
      const model = realMLSystem.getSelectedModel();
      if (model) {
        this.currentModel = {
          id: model.id,
          name: model.name,
          type: model.type,
          hyperparameters: model.hyperparameters,
          isSelected: true
        };
      }
    }
    return success;
  }

  updateModelHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    return realMLSystem.updateHyperparameters(modelId, hyperparameters);
  }

  getSelectedModel(): ModelConfig | null {
    return this.currentModel;
  }

  // 学習
  async startTraining(): Promise<void> {
    if (!this.currentModel || !this.currentProcessedData) {
      throw new Error('No model selected or no processed data available');
    }

    console.log('Starting training...');
    
    // 学習データを設定
    realMLSystem.setTrainingData(
      this.currentProcessedData.data,
      this.currentProcessedData.featureNames,
      this.currentProcessedData.featureTypes
    );
    
    // 学習を開始
    await realMLSystem.startTraining();
    
    // 学習進捗を監視
    const progressInterval = setInterval(() => {
      const progress = realMLSystem.getTrainingProgress();
      if (progress) {
        this.trainingProgress = progress;
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(progressInterval);
        }
      }
    }, 100);
  }

  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress || realMLSystem.getTrainingProgress();
  }

  // 検証
  async executeValidation(): Promise<ValidationResult> {
    if (!this.currentModel || !this.trainingProgress || this.trainingProgress.status !== 'completed') {
      throw new Error('Training not completed');
    }

    console.log('Executing validation...');
    
    await realMLSystem.executeValidation();
    const result = realMLSystem.getValidationResult();
    
    if (result) {
      this.validationResult = result;
    }
    
    return result!;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResult || realMLSystem.getValidationResult();
  }

  // 提出
  async submitResults(submissionName: string, comment: string = ''): Promise<boolean> {
    if (!this.currentModel || !this.validationResult) {
      throw new Error('No model or validation result available');
    }

    try {
      console.log('Submitting results...');
      
      const submission: SubmissionData = {
        id: `submission_${Date.now()}`,
        modelName: this.currentModel.name,
        accuracy: this.validationResult.accuracy,
        hyperparameters: this.currentModel.hyperparameters,
        submissionTime: new Date(),
        processingHistory: this.currentProcessedData?.processingHistory || []
      };
      
      this.submissionHistory.push(submission);
      
      // リーダーボードに追加
      dynamicLeaderboard.addSubmission(
        submissionName,
        this.validationResult.accuracy,
        this.currentModel.hyperparameters
      );
      
      console.log('Submission completed:', submission);
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      return false;
    }
  }

  getSubmissionHistory(): SubmissionData[] {
    return this.submissionHistory;
  }

  // リーダーボード
  getLeaderboard(): any[] {
    return dynamicLeaderboard.getLeaderboard();
  }

  getLeaderboardStats(): any {
    return dynamicLeaderboard.getStats();
  }

  // データ取得（EDA用）
  getDataForEDA(): {
    data: Array<{ features: (number | string)[], label: number }>;
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    isProcessed: boolean;
  } {
    if (this.currentProcessedData) {
      return {
        data: this.currentProcessedData.data,
        featureNames: this.currentProcessedData.featureNames,
        featureTypes: this.currentProcessedData.featureTypes,
        isProcessed: true
      };
    } else if (this.currentProblem) {
      return {
        data: this.currentProblem.data,
        featureNames: this.currentProblem.featureNames,
        featureTypes: this.currentProblem.featureTypes,
        isProcessed: false
      };
    } else {
      return {
        data: [],
        featureNames: [],
        featureTypes: [],
        isProcessed: false
      };
    }
  }

  // 現在の処理済みデータを取得
  getCurrentProcessedData(): ProcessedData | null {
    return this.currentProcessedData;
  }

  // システム状態のリセット
  reset(): void {
    this.currentProblem = null;
    this.currentDataSplit = null;
    this.currentProcessedData = null;
    this.currentModel = null;
    this.trainingProgress = null;
    this.validationResult = null;
    this.submissionHistory = [];
  }
}

// シングルトンインスタンス
export const integratedMLSystem = new IntegratedMLSystem();
import { realDatasetGenerator, type RealDataset } from './realDatasetGenerator';
import { realDataProcessor, type ProcessedData } from './realDataProcessing';
import { realMLSystem, type TrainingProgress, type ValidationResult } from './realMLSystem';
import { dynamicLeaderboard } from './dynamicLeaderboard';

export interface ProblemData {
  id: string;
  name: string;
  description: string;
  data: Array<{ features: (number | string)[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetColumn: string;
  problemType: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  sampleCount: number;
  featureCount: number;
  missingValueRate: number;
}

export interface DataSplit {
  trainRatio: number;
  validationRatio: number;
  testRatio: number;
  trainData: Array<{ features: (number | string)[], label: number }>;
  validationData: Array<{ features: (number | string)[], label: number }>;
  testData: Array<{ features: (number | string)[], label: number }>;
}

export interface PreprocessingResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  processingSteps: string[];
  error?: string;
}

export interface FeatureEngineeringResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  newFeatures: string[];
  error?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  hyperparameters: Record<string, any>;
  isSelected: boolean;
}

export interface SubmissionData {
  id: string;
  modelName: string;
  accuracy: number;
  hyperparameters: Record<string, any>;
  submissionTime: Date;
  processingHistory: string[];
}

class IntegratedMLSystem {
  private currentProblem: ProblemData | null = null;
  private currentDataSplit: DataSplit | null = null;
  private currentProcessedData: ProcessedData | null = null;
  private currentModel: ModelConfig | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];

  // 問題データの管理
  async loadRandomProblem(): Promise<ProblemData> {
    console.log('Loading random problem...');
    
    // 動的なシード生成（現在時刻ベース）
    const dynamicSeed = Date.now() % 1000000;
    realDatasetGenerator.setSeed(dynamicSeed);
    
    const datasets = [
      realDatasetGenerator.generateMedicalDiagnosisDataset(),
      realDatasetGenerator.generateHousingPriceDataset(),
      realDatasetGenerator.generateFraudDetectionDataset()
    ];
    
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)];
    
    const problem: ProblemData = {
      id: randomDataset.id,
      name: randomDataset.name || 'Unknown Problem',
      description: randomDataset.description || 'No description available',
      data: randomDataset.data || [],
      featureNames: randomDataset.featureNames || [],
      featureTypes: randomDataset.featureTypes || [],
      targetColumn: randomDataset.targetName || 'target',
      problemType: randomDataset.type || 'classification',
      difficulty: randomDataset.difficulty || 'medium',
      sampleCount: randomDataset.sampleCount || 0,
      featureCount: randomDataset.featureCount || 0,
      missingValueRate: randomDataset.missingValueRate || 0
    };
    
    this.currentProblem = problem;
    console.log('Problem loaded:', problem.name, problem.data.length, 'samples');
    
    return problem;
  }

  getCurrentProblem(): ProblemData | null {
    return this.currentProblem;
  }

  // データ分割
  splitData(trainRatio: number = 0.7, validationRatio: number = 0.2, testRatio: number = 0.1): DataSplit {
    if (!this.currentProblem) {
      throw new Error('No problem loaded');
    }

    const data = [...this.currentProblem.data];
    const totalSamples = data.length;
    
    const trainSize = Math.floor(totalSamples * trainRatio);
    const validationSize = Math.floor(totalSamples * validationRatio);
    const testSize = totalSamples - trainSize - validationSize;
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    const dataSplit: DataSplit = {
      trainRatio,
      validationRatio,
      testRatio,
      trainData: data.slice(0, trainSize),
      validationData: data.slice(trainSize, trainSize + validationSize),
      testData: data.slice(trainSize + validationSize)
    };
    
    this.currentDataSplit = dataSplit;
    console.log('Data split completed:', {
      train: dataSplit.trainData.length,
      validation: dataSplit.validationData.length,
      test: dataSplit.testData.length
    });
    
    return dataSplit;
  }

  getCurrentDataSplit(): DataSplit | null {
    return this.currentDataSplit;
  }

  // 前処理
  async executePreprocessing(options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    if (!this.currentDataSplit) {
      return { success: false, data: [], featureNames: [], featureTypes: [], processingSteps: [], error: 'No data split available' };
    }

    try {
      console.log('Executing preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        this.currentDataSplit.trainData,
        this.currentProblem!.featureNames,
        this.currentProblem!.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 前処理（データ分割なし）
  async executePreprocessingDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    try {
      console.log('Executing direct preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Direct preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング
  async executeFeatureEngineering(options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    if (!this.currentProcessedData) {
      return { success: false, data: [], featureNames: [], featureTypes: [], newFeatures: [], error: 'No processed data available' };
    }

    try {
      console.log('Executing feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        this.currentProcessedData.data,
        this.currentProcessedData.featureNames,
        this.currentProcessedData.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(this.currentProcessedData.featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング（直接実行）
  async executeFeatureEngineeringDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    try {
      console.log('Executing direct feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Direct feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 学習データ設定
  setTrainingData(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[]): void {
    realMLSystem.setTrainingData(data, featureNames, featureTypes);
  }

  // モデル管理
  getAvailableModels(problemType: 'classification' | 'regression'): ModelConfig[] {
    const models = realMLSystem.getAvailableModels(problemType);
    return models.map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      hyperparameters: model.hyperparameters,
      isSelected: model.isSelected
    }));
  }

  selectModel(modelId: string): boolean {
    const success = realMLSystem.selectModel(modelId);
    if (success) {
      const model = realMLSystem.getSelectedModel();
      if (model) {
        this.currentModel = {
          id: model.id,
          name: model.name,
          type: model.type,
          hyperparameters: model.hyperparameters,
          isSelected: true
        };
      }
    }
    return success;
  }

  updateModelHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    return realMLSystem.updateHyperparameters(modelId, hyperparameters);
  }

  getSelectedModel(): ModelConfig | null {
    return this.currentModel;
  }

  // 学習
  async startTraining(): Promise<void> {
    if (!this.currentModel || !this.currentProcessedData) {
      throw new Error('No model selected or no processed data available');
    }

    console.log('Starting training...');
    
    // 学習データを設定
    realMLSystem.setTrainingData(
      this.currentProcessedData.data,
      this.currentProcessedData.featureNames,
      this.currentProcessedData.featureTypes
    );
    
    // 学習を開始
    await realMLSystem.startTraining();
    
    // 学習進捗を監視
    const progressInterval = setInterval(() => {
      const progress = realMLSystem.getTrainingProgress();
      if (progress) {
        this.trainingProgress = progress;
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(progressInterval);
        }
      }
    }, 100);
  }

  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress || realMLSystem.getTrainingProgress();
  }

  // 検証
  async executeValidation(): Promise<ValidationResult> {
    if (!this.currentModel || !this.trainingProgress || this.trainingProgress.status !== 'completed') {
      throw new Error('Training not completed');
    }

    console.log('Executing validation...');
    
    await realMLSystem.executeValidation();
    const result = realMLSystem.getValidationResult();
    
    if (result) {
      this.validationResult = result;
    }
    
    return result!;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResult || realMLSystem.getValidationResult();
  }

  // 提出
  async submitResults(submissionName: string, comment: string = ''): Promise<boolean> {
    if (!this.currentModel || !this.validationResult) {
      throw new Error('No model or validation result available');
    }

    try {
      console.log('Submitting results...');
      
      const submission: SubmissionData = {
        id: `submission_${Date.now()}`,
        modelName: this.currentModel.name,
        accuracy: this.validationResult.accuracy,
        hyperparameters: this.currentModel.hyperparameters,
        submissionTime: new Date(),
        processingHistory: this.currentProcessedData?.processingHistory || []
      };
      
      this.submissionHistory.push(submission);
      
      // リーダーボードに追加
      dynamicLeaderboard.addSubmission(
        submissionName,
        this.validationResult.accuracy,
        this.currentModel.hyperparameters
      );
      
      console.log('Submission completed:', submission);
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      return false;
    }
  }

  getSubmissionHistory(): SubmissionData[] {
    return this.submissionHistory;
  }

  // リーダーボード
  getLeaderboard(): any[] {
    return dynamicLeaderboard.getLeaderboard();
  }

  getLeaderboardStats(): any {
    return dynamicLeaderboard.getStats();
  }

  // データ取得（EDA用）
  getDataForEDA(): {
    data: Array<{ features: (number | string)[], label: number }>;
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    isProcessed: boolean;
  } {
    if (this.currentProcessedData) {
      return {
        data: this.currentProcessedData.data,
        featureNames: this.currentProcessedData.featureNames,
        featureTypes: this.currentProcessedData.featureTypes,
        isProcessed: true
      };
    } else if (this.currentProblem) {
      return {
        data: this.currentProblem.data,
        featureNames: this.currentProblem.featureNames,
        featureTypes: this.currentProblem.featureTypes,
        isProcessed: false
      };
    } else {
      return {
        data: [],
        featureNames: [],
        featureTypes: [],
        isProcessed: false
      };
    }
  }

  // 現在の処理済みデータを取得
  getCurrentProcessedData(): ProcessedData | null {
    return this.currentProcessedData;
  }

  // システム状態のリセット
  reset(): void {
    this.currentProblem = null;
    this.currentDataSplit = null;
    this.currentProcessedData = null;
    this.currentModel = null;
    this.trainingProgress = null;
    this.validationResult = null;
    this.submissionHistory = [];
  }
}

// シングルトンインスタンス
export const integratedMLSystem = new IntegratedMLSystem();

import { realDatasetGenerator, type RealDataset } from './realDatasetGenerator';
import { realDataProcessor, type ProcessedData } from './realDataProcessing';
import { realMLSystem, type TrainingProgress, type ValidationResult } from './realMLSystem';
import { dynamicLeaderboard } from './dynamicLeaderboard';

export interface ProblemData {
  id: string;
  name: string;
  description: string;
  data: Array<{ features: (number | string)[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  targetColumn: string;
  problemType: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  sampleCount: number;
  featureCount: number;
  missingValueRate: number;
}

export interface DataSplit {
  trainRatio: number;
  validationRatio: number;
  testRatio: number;
  trainData: Array<{ features: (number | string)[], label: number }>;
  validationData: Array<{ features: (number | string)[], label: number }>;
  testData: Array<{ features: (number | string)[], label: number }>;
}

export interface PreprocessingResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  processingSteps: string[];
  error?: string;
}

export interface FeatureEngineeringResult {
  success: boolean;
  data: Array<{ features: number[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  newFeatures: string[];
  error?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  hyperparameters: Record<string, any>;
  isSelected: boolean;
}

export interface SubmissionData {
  id: string;
  modelName: string;
  accuracy: number;
  hyperparameters: Record<string, any>;
  submissionTime: Date;
  processingHistory: string[];
}

class IntegratedMLSystem {
  private currentProblem: ProblemData | null = null;
  private currentDataSplit: DataSplit | null = null;
  private currentProcessedData: ProcessedData | null = null;
  private currentModel: ModelConfig | null = null;
  private trainingProgress: TrainingProgress | null = null;
  private validationResult: ValidationResult | null = null;
  private submissionHistory: SubmissionData[] = [];

  // 問題データの管理
  async loadRandomProblem(): Promise<ProblemData> {
    console.log('Loading random problem...');
    
    // 動的なシード生成（現在時刻ベース）
    const dynamicSeed = Date.now() % 1000000;
    realDatasetGenerator.setSeed(dynamicSeed);
    
    const datasets = [
      realDatasetGenerator.generateMedicalDiagnosisDataset(),
      realDatasetGenerator.generateHousingPriceDataset(),
      realDatasetGenerator.generateFraudDetectionDataset()
    ];
    
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)];
    
    const problem: ProblemData = {
      id: randomDataset.id,
      name: randomDataset.name || 'Unknown Problem',
      description: randomDataset.description || 'No description available',
      data: randomDataset.data || [],
      featureNames: randomDataset.featureNames || [],
      featureTypes: randomDataset.featureTypes || [],
      targetColumn: randomDataset.targetName || 'target',
      problemType: randomDataset.type || 'classification',
      difficulty: randomDataset.difficulty || 'medium',
      sampleCount: randomDataset.sampleCount || 0,
      featureCount: randomDataset.featureCount || 0,
      missingValueRate: randomDataset.missingValueRate || 0
    };
    
    this.currentProblem = problem;
    console.log('Problem loaded:', problem.name, problem.data.length, 'samples');
    
    return problem;
  }

  getCurrentProblem(): ProblemData | null {
    return this.currentProblem;
  }

  // データ分割
  splitData(trainRatio: number = 0.7, validationRatio: number = 0.2, testRatio: number = 0.1): DataSplit {
    if (!this.currentProblem) {
      throw new Error('No problem loaded');
    }

    const data = [...this.currentProblem.data];
    const totalSamples = data.length;
    
    const trainSize = Math.floor(totalSamples * trainRatio);
    const validationSize = Math.floor(totalSamples * validationRatio);
    const testSize = totalSamples - trainSize - validationSize;
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    const dataSplit: DataSplit = {
      trainRatio,
      validationRatio,
      testRatio,
      trainData: data.slice(0, trainSize),
      validationData: data.slice(trainSize, trainSize + validationSize),
      testData: data.slice(trainSize + validationSize)
    };
    
    this.currentDataSplit = dataSplit;
    console.log('Data split completed:', {
      train: dataSplit.trainData.length,
      validation: dataSplit.validationData.length,
      test: dataSplit.testData.length
    });
    
    return dataSplit;
  }

  getCurrentDataSplit(): DataSplit | null {
    return this.currentDataSplit;
  }

  // 前処理
  async executePreprocessing(options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    if (!this.currentDataSplit) {
      return { success: false, data: [], featureNames: [], featureTypes: [], processingSteps: [], error: 'No data split available' };
    }

    try {
      console.log('Executing preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        this.currentDataSplit.trainData,
        this.currentProblem!.featureNames,
        this.currentProblem!.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 前処理（データ分割なし）
  async executePreprocessingDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop';
    scalingMethod: 'standard' | 'minmax' | 'none';
    encodingMethod: 'label' | 'onehot' | 'target';
    outlierRemoval: boolean;
    outlierThreshold: number;
    categoricalEncoding: {
      method: 'label' | 'onehot' | 'target';
      targetColumn?: number;
    };
  }): Promise<PreprocessingResult> {
    try {
      console.log('Executing direct preprocessing...');
      
      const result = await realDataProcessor.executePreprocessing(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct preprocessing completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          processingSteps: result.processingSteps || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          processingSteps: [],
          error: result.error || 'Preprocessing failed'
        };
      }
    } catch (error) {
      console.error('Direct preprocessing error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        processingSteps: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング
  async executeFeatureEngineering(options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    if (!this.currentProcessedData) {
      return { success: false, data: [], featureNames: [], featureTypes: [], newFeatures: [], error: 'No processed data available' };
    }

    try {
      console.log('Executing feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        this.currentProcessedData.data,
        this.currentProcessedData.featureNames,
        this.currentProcessedData.featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(this.currentProcessedData.featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 特徴量エンジニアリング（直接実行）
  async executeFeatureEngineeringDirect(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: {
    selectedFeatures: number[];
    transformations: {
      polynomial: boolean;
      interaction: boolean;
      log: boolean;
      sqrt: boolean;
      square: boolean;
    };
    aggregations: {
      mean: boolean;
      std: boolean;
      max: boolean;
      min: boolean;
      count: boolean;
    };
    dimensionalityReduction: {
      method: 'none' | 'pca' | 'lda' | 'tsne';
      components: number;
    };
  }): Promise<FeatureEngineeringResult> {
    try {
      console.log('Executing direct feature engineering...');
      
      const result = await realDataProcessor.executeFeatureEngineering(
        data,
        featureNames,
        featureTypes,
        options
      );
      
      if (result.success && result.processedData) {
        this.currentProcessedData = result.processedData;
        console.log('Direct feature engineering completed successfully');
        return {
          success: true,
          data: result.data || [],
          featureNames: result.featureNames || [],
          featureTypes: result.featureTypes || [],
          newFeatures: result.featureNames?.slice(featureNames.length) || []
        };
      } else {
        return {
          success: false,
          data: [],
          featureNames: [],
          featureTypes: [],
          newFeatures: [],
          error: result.error || 'Feature engineering failed'
        };
      }
    } catch (error) {
      console.error('Direct feature engineering error:', error);
      return {
        success: false,
        data: [],
        featureNames: [],
        featureTypes: [],
        newFeatures: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 学習データ設定
  setTrainingData(data: Array<{ features: (number | string)[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[]): void {
    realMLSystem.setTrainingData(data, featureNames, featureTypes);
  }

  // モデル管理
  getAvailableModels(problemType: 'classification' | 'regression'): ModelConfig[] {
    const models = realMLSystem.getAvailableModels(problemType);
    return models.map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      hyperparameters: model.hyperparameters,
      isSelected: model.isSelected
    }));
  }

  selectModel(modelId: string): boolean {
    const success = realMLSystem.selectModel(modelId);
    if (success) {
      const model = realMLSystem.getSelectedModel();
      if (model) {
        this.currentModel = {
          id: model.id,
          name: model.name,
          type: model.type,
          hyperparameters: model.hyperparameters,
          isSelected: true
        };
      }
    }
    return success;
  }

  updateModelHyperparameters(modelId: string, hyperparameters: Record<string, any>): boolean {
    return realMLSystem.updateHyperparameters(modelId, hyperparameters);
  }

  getSelectedModel(): ModelConfig | null {
    return this.currentModel;
  }

  // 学習
  async startTraining(): Promise<void> {
    if (!this.currentModel || !this.currentProcessedData) {
      throw new Error('No model selected or no processed data available');
    }

    console.log('Starting training...');
    
    // 学習データを設定
    realMLSystem.setTrainingData(
      this.currentProcessedData.data,
      this.currentProcessedData.featureNames,
      this.currentProcessedData.featureTypes
    );
    
    // 学習を開始
    await realMLSystem.startTraining();
    
    // 学習進捗を監視
    const progressInterval = setInterval(() => {
      const progress = realMLSystem.getTrainingProgress();
      if (progress) {
        this.trainingProgress = progress;
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(progressInterval);
        }
      }
    }, 100);
  }

  getTrainingProgress(): TrainingProgress | null {
    return this.trainingProgress || realMLSystem.getTrainingProgress();
  }

  // 検証
  async executeValidation(): Promise<ValidationResult> {
    if (!this.currentModel || !this.trainingProgress || this.trainingProgress.status !== 'completed') {
      throw new Error('Training not completed');
    }

    console.log('Executing validation...');
    
    await realMLSystem.executeValidation();
    const result = realMLSystem.getValidationResult();
    
    if (result) {
      this.validationResult = result;
    }
    
    return result!;
  }

  getValidationResult(): ValidationResult | null {
    return this.validationResult || realMLSystem.getValidationResult();
  }

  // 提出
  async submitResults(submissionName: string, comment: string = ''): Promise<boolean> {
    if (!this.currentModel || !this.validationResult) {
      throw new Error('No model or validation result available');
    }

    try {
      console.log('Submitting results...');
      
      const submission: SubmissionData = {
        id: `submission_${Date.now()}`,
        modelName: this.currentModel.name,
        accuracy: this.validationResult.accuracy,
        hyperparameters: this.currentModel.hyperparameters,
        submissionTime: new Date(),
        processingHistory: this.currentProcessedData?.processingHistory || []
      };
      
      this.submissionHistory.push(submission);
      
      // リーダーボードに追加
      dynamicLeaderboard.addSubmission(
        submissionName,
        this.validationResult.accuracy,
        this.currentModel.hyperparameters
      );
      
      console.log('Submission completed:', submission);
      return true;
    } catch (error) {
      console.error('Submission failed:', error);
      return false;
    }
  }

  getSubmissionHistory(): SubmissionData[] {
    return this.submissionHistory;
  }

  // リーダーボード
  getLeaderboard(): any[] {
    return dynamicLeaderboard.getLeaderboard();
  }

  getLeaderboardStats(): any {
    return dynamicLeaderboard.getStats();
  }

  // データ取得（EDA用）
  getDataForEDA(): {
    data: Array<{ features: (number | string)[], label: number }>;
    featureNames: string[];
    featureTypes: ('numerical' | 'categorical')[];
    isProcessed: boolean;
  } {
    if (this.currentProcessedData) {
      return {
        data: this.currentProcessedData.data,
        featureNames: this.currentProcessedData.featureNames,
        featureTypes: this.currentProcessedData.featureTypes,
        isProcessed: true
      };
    } else if (this.currentProblem) {
      return {
        data: this.currentProblem.data,
        featureNames: this.currentProblem.featureNames,
        featureTypes: this.currentProblem.featureTypes,
        isProcessed: false
      };
    } else {
      return {
        data: [],
        featureNames: [],
        featureTypes: [],
        isProcessed: false
      };
    }
  }

  // 現在の処理済みデータを取得
  getCurrentProcessedData(): ProcessedData | null {
    return this.currentProcessedData;
  }

  // システム状態のリセット
  reset(): void {
    this.currentProblem = null;
    this.currentDataSplit = null;
    this.currentProcessedData = null;
    this.currentModel = null;
    this.trainingProgress = null;
    this.validationResult = null;
    this.submissionHistory = [];
  }
}

// シングルトンインスタンス
export const integratedMLSystem = new IntegratedMLSystem();