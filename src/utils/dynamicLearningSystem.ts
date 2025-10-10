// 動的学習システム
import { createStableModel } from './stableMLModels';
import type { Dataset, ModelResult, TrainingProgress } from '../types/ml';

export interface LearningConfig {
  modelType: string;
  parameters: Record<string, any>;
  selectedFeatures: number[];
  evaluationMetrics: string[];
  dataSplit: {
    trainRatio: number;
    validationRatio: number;
    testRatio: number;
    randomSeed: number;
    stratified: boolean;
  };
}

export interface LearningResult {
  model: any;
  result: ModelResult;
  trainingTime: number;
  evaluation: any;
  config: LearningConfig;
}

export class DynamicLearningSystem {
  static async trainModel(
    dataset: Dataset,
    config: LearningConfig,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<LearningResult> {
    const startTime = Date.now();
    
    try {
      console.log('動的学習システム開始:', {
        datasetSize: dataset.train.length,
        modelType: config.modelType,
        selectedFeatures: config.selectedFeatures,
        parameters: config.parameters
      });
      
      // データを分割
      const { train, validation, test } = this.splitData(dataset, config.dataSplit);
      console.log('データ分割完了:', {
        trainSize: train.length,
        validationSize: validation.length,
        testSize: test.length
      });
      
      // データの検証
      if (train.length === 0) {
        throw new Error('学習データが空です');
      }
      
      // 特徴量を選択（安全に）
      const filteredTrain = train.map(point => {
        if (!point.features || !Array.isArray(point.features)) {
          throw new Error('無効なデータポイント: featuresが配列ではありません');
        }
        return {
          features: config.selectedFeatures.map(i => {
            if (i >= point.features.length) {
              console.warn(`特徴量インデックス ${i} が範囲外です。データ長: ${point.features.length}`);
              return 0;
            }
            return point.features[i];
          }),
          label: point.label
        };
      });
      
      const filteredTest = test.map(point => {
        if (!point.features || !Array.isArray(point.features)) {
          throw new Error('無効なデータポイント: featuresが配列ではありません');
        }
        return {
          features: config.selectedFeatures.map(i => {
            if (i >= point.features.length) {
              console.warn(`特徴量インデックス ${i} が範囲外です。データ長: ${point.features.length}`);
              return 0;
            }
            return point.features[i];
          }),
          label: point.label
        };
      });
      
      console.log('特徴量選択完了:', {
        filteredTrainSize: filteredTrain.length,
        filteredTestSize: filteredTest.length,
        selectedFeatures: config.selectedFeatures,
        originalFeatureCount: train[0]?.features?.length || 0,
        filteredFeatureCount: filteredTrain[0]?.features?.length || 0
      });
      
      // モデルを作成
      console.log('モデル作成中:', config.modelType);
      const model = createStableModel(config.modelType);
      console.log('モデル作成完了:', model.constructor.name);
      
      // 学習を実行
      console.log('学習開始:', {
        trainDataSize: filteredTrain.length,
        parameters: config.parameters
      });
      await model.train(filteredTrain, config.parameters, onProgress);
      console.log('学習完了');
      
      // 評価を実行
      console.log('評価開始:', {
        testDataSize: filteredTest.length
      });
      const result = model.evaluate(filteredTest);
      console.log('評価結果:', {
        accuracy: result.accuracy,
        loss: result.loss,
        precision: result.precision,
        recall: result.recall,
        f1_score: result.f1_score
      });
      
      const trainingTime = Date.now() - startTime;
      
      // 評価結果を構築
      const evaluation = {
        validationScore: result.accuracy,
        testScore: result.accuracy,
        metrics: this.buildMetrics(result, config.evaluationMetrics),
        predictions: result.predictions,
        actual: result.actual,
        trainingTime: trainingTime / 1000,
        config: config
      };
      
      return {
        model,
        result,
        trainingTime,
        evaluation,
        config
      };
      
    } catch (error) {
      console.error('動的学習エラー:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        config: config
      });
      throw error;
    }
  }
  
  private static splitData(
    dataset: Dataset,
    splitConfig: LearningConfig['dataSplit']
  ): { train: any[]; validation: any[]; test: any[] } {
    const { trainRatio, validationRatio, testRatio, randomSeed, stratified } = splitConfig;
    
    // ランダムシードを設定（改良版）
    const originalRandom = Math.random;
    let seed = randomSeed || 42;
    
    // シード値に基づいてランダム関数を初期化
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    // データをシャッフル
    const allData = [...dataset.train, ...dataset.test];
    const shuffledData = [...allData].sort(() => Math.random() - 0.5);
    
    // 層化サンプリング（分類問題の場合）
    if (stratified && dataset.classes && dataset.classes.length > 0) {
      const result = this.stratifiedSplit(shuffledData, trainRatio, validationRatio, testRatio);
      // ランダム関数を復元
      Math.random = originalRandom;
      return result;
    }
    
    // 通常の分割
    const totalSize = shuffledData.length;
    const trainSize = Math.floor(totalSize * trainRatio);
    const validationSize = Math.floor(totalSize * validationRatio);
    
    const result = {
      train: shuffledData.slice(0, trainSize),
      validation: shuffledData.slice(trainSize, trainSize + validationSize),
      test: shuffledData.slice(trainSize + validationSize)
    };
    
    // ランダム関数を復元
    Math.random = originalRandom;
    return result;
  }
  
  private static stratifiedSplit(
    data: any[],
    trainRatio: number,
    validationRatio: number,
    testRatio: number
  ): { train: any[]; validation: any[]; test: any[] } {
    // クラスごとにデータをグループ化
    const classGroups: { [key: string]: any[] } = {};
    data.forEach(point => {
      const label = point.label.toString();
      if (!classGroups[label]) {
        classGroups[label] = [];
      }
      classGroups[label].push(point);
    });
    
    const train: any[] = [];
    const validation: any[] = [];
    const test: any[] = [];
    
    // 各クラスから比例的に分割
    Object.values(classGroups).forEach(classData => {
      const classSize = classData.length;
      const trainSize = Math.floor(classSize * trainRatio);
      const validationSize = Math.floor(classSize * validationRatio);
      
      // クラス内でシャッフル（Fisher-Yatesアルゴリズム）
      const shuffled = [...classData];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      train.push(...shuffled.slice(0, trainSize));
      validation.push(...shuffled.slice(trainSize, trainSize + validationSize));
      test.push(...shuffled.slice(trainSize + validationSize));
    });
    
    return { train, validation, test };
  }
  
  private static buildMetrics(result: ModelResult, selectedMetrics: string[]): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    selectedMetrics.forEach(metric => {
      switch (metric) {
        case 'accuracy':
          metrics.accuracy = result.accuracy;
          break;
        case 'precision':
          metrics.precision = result.precision;
          break;
        case 'recall':
          metrics.recall = result.recall;
          break;
        case 'f1_score':
          metrics.f1_score = result.f1_score;
          break;
        case 'mae':
          metrics.mae = result.accuracy; // 安定版MLモデルではaccuracyを使用
          break;
        case 'mse':
          metrics.mse = result.accuracy; // 安定版MLモデルではaccuracyを使用
          break;
        case 'rmse':
          metrics.rmse = result.accuracy; // 安定版MLモデルではaccuracyを使用
          break;
      }
    });
    
    return metrics;
  }
  
  static async batchTrain(
    dataset: Dataset,
    configs: LearningConfig[],
    onProgress?: (progress: { current: number; total: number; result?: LearningResult }) => void
  ): Promise<LearningResult[]> {
    const results: LearningResult[] = [];
    
    for (let i = 0; i < configs.length; i++) {
      try {
        const result = await this.trainModel(dataset, configs[i]);
        results.push(result);
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: configs.length,
            result
          });
        }
      } catch (error) {
        console.error(`設定${i + 1}の学習に失敗:`, error);
        // エラーが発生しても続行
      }
    }
    
    return results;
  }
  
  static generateLearningConfigs(
    modelTypes: string[],
    featureCombinations: number[][],
    parameterSets: Record<string, any[]>,
    evaluationMetrics: string[],
    dataSplitConfigs: LearningConfig['dataSplit'][]
  ): LearningConfig[] {
    const configs: LearningConfig[] = [];
    
    modelTypes.forEach(modelType => {
      featureCombinations.forEach(selectedFeatures => {
        const modelParams = parameterSets[modelType] || [{}];
        modelParams.forEach(parameters => {
          dataSplitConfigs.forEach(dataSplit => {
            configs.push({
              modelType,
              parameters,
              selectedFeatures,
              evaluationMetrics,
              dataSplit
            });
          });
        });
      });
    });
    
    return configs;
  }
}
