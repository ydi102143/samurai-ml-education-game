import * as tf from '@tensorflow/tfjs';
import type { ModelResult } from '../types/ml';

export interface TrainedModel {
  id: string;
  userId: string;
  problemId: string;
  modelType: string;
  parameters: Record<string, any>;
  preprocessing: {
    method: 'none' | 'normalize' | 'standardize' | 'encode';
    encodedFeatures?: number[];
  };
  selectedFeatures: number[];
  trainingDate: Date;
  modelData: any; // シリアライズされたモデル
  performance: {
    accuracy: number;
    loss: number;
    trainingTime: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
  featureNames: string[];
  problemTitle: string;
}

export class TrainedModelManager {
  private static models: Map<string, TrainedModel[]> = new Map();
  private static modelCache: Map<string, any> = new Map(); // デシリアライズ済みモデルのキャッシュ

  /**
   * 学習済みモデルを保存
   */
  static saveTrainedModel(
    userId: string,
    problemId: string,
    model: any,
    modelType: string,
    parameters: Record<string, any>,
    preprocessing: any,
    selectedFeatures: number[],
    performance: any,
    featureNames: string[],
    problemTitle: string
  ): string {
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trainedModel: TrainedModel = {
      id: modelId,
      userId,
      problemId,
      modelType,
      parameters,
      preprocessing,
      selectedFeatures,
      trainingDate: new Date(),
      modelData: this.serializeModel(model),
      performance: {
        accuracy: performance.accuracy || 0,
        loss: performance.loss || 0,
        trainingTime: performance.training_time || 0,
        precision: performance.precision,
        recall: performance.recall,
        f1_score: performance.f1_score
      },
      featureNames,
      problemTitle
    };

    if (!this.models.has(userId)) {
      this.models.set(userId, []);
    }
    this.models.get(userId)!.push(trainedModel);

    console.log(`学習済みモデルを保存しました: ${modelId} (${modelType})`);
    return modelId;
  }

  /**
   * ユーザーの学習済みモデルを取得
   */
  static getTrainedModels(userId: string, problemId?: string): TrainedModel[] {
    const userModels = this.models.get(userId) || [];
    return problemId 
      ? userModels.filter(m => m.problemId === problemId)
      : userModels;
  }

  /**
   * 特定のモデルを取得
   */
  static getTrainedModel(modelId: string): TrainedModel | null {
    for (const models of this.models.values()) {
      const model = models.find(m => m.id === modelId);
      if (model) return model;
    }
    return null;
  }

  /**
   * 学習済みモデルを読み込み（デシリアライズ）
   */
  static async loadTrainedModel(modelId: string): Promise<any> {
    // キャッシュから取得
    if (this.modelCache.has(modelId)) {
      return this.modelCache.get(modelId);
    }

    const trainedModel = this.getTrainedModel(modelId);
    if (!trainedModel) {
      throw new Error(`モデルが見つかりません: ${modelId}`);
    }

    try {
      // TensorFlow.jsモデルのデシリアライズ
      const model = await this.deserializeModel(trainedModel.modelData);
      
      // キャッシュに保存
      this.modelCache.set(modelId, model);
      
      return model;
    } catch (error) {
      console.error(`モデルの読み込みに失敗しました: ${modelId}`, error);
      throw new Error(`モデルの読み込みに失敗しました: ${error.message}`);
    }
  }

  /**
   * モデルをシリアライズ
   */
  private static serializeModel(model: any): any {
    try {
      if (model && typeof model.toJSON === 'function') {
        return model.toJSON();
      } else if (model && model.modelTopology) {
        // 既にシリアライズ済みの場合
        return model;
      } else {
        // その他のモデルタイプ（KNNなど）
        return {
          type: 'custom',
          data: JSON.stringify(model)
        };
      }
    } catch (error) {
      console.error('モデルのシリアライズに失敗:', error);
      return {
        type: 'custom',
        data: JSON.stringify(model)
      };
    }
  }

  /**
   * モデルをデシリアライズ
   */
  private static async deserializeModel(modelData: any): Promise<any> {
    try {
      if (modelData.type === 'custom') {
        // カスタムモデル（KNNなど）
        return JSON.parse(modelData.data);
      } else if (modelData.modelTopology) {
        // TensorFlow.jsモデル
        return await tf.loadLayersModel(modelData);
      } else {
        throw new Error('サポートされていないモデル形式です');
      }
    } catch (error) {
      console.error('モデルのデシリアライズに失敗:', error);
      throw error;
    }
  }

  /**
   * モデルを削除
   */
  static deleteTrainedModel(userId: string, modelId: string): boolean {
    const userModels = this.models.get(userId);
    if (!userModels) return false;

    const modelIndex = userModels.findIndex(m => m.id === modelId);
    if (modelIndex === -1) return false;

    userModels.splice(modelIndex, 1);
    
    // キャッシュからも削除
    this.modelCache.delete(modelId);
    
    console.log(`学習済みモデルを削除しました: ${modelId}`);
    return true;
  }

  /**
   * ユーザーの全モデルを削除
   */
  static deleteAllUserModels(userId: string): boolean {
    const userModels = this.models.get(userId);
    if (!userModels) return false;

    // キャッシュからも削除
    userModels.forEach(model => {
      this.modelCache.delete(model.id);
    });

    this.models.delete(userId);
    console.log(`ユーザーの全モデルを削除しました: ${userId}`);
    return true;
  }

  /**
   * モデルの統計情報を取得
   */
  static getModelStatistics(userId: string): {
    totalModels: number;
    modelsByType: Record<string, number>;
    averageAccuracy: number;
    bestModel: TrainedModel | null;
    recentModels: TrainedModel[];
  } {
    const userModels = this.models.get(userId) || [];
    
    const modelsByType: Record<string, number> = {};
    let totalAccuracy = 0;
    let bestModel: TrainedModel | null = null;
    let bestAccuracy = 0;

    userModels.forEach(model => {
      // モデルタイプ別カウント
      modelsByType[model.modelType] = (modelsByType[model.modelType] || 0) + 1;
      
      // 平均精度計算
      totalAccuracy += model.performance.accuracy;
      
      // 最高精度モデル
      if (model.performance.accuracy > bestAccuracy) {
        bestAccuracy = model.performance.accuracy;
        bestModel = model;
      }
    });

    // 最近のモデル（最新5件）
    const recentModels = userModels
      .sort((a, b) => b.trainingDate.getTime() - a.trainingDate.getTime())
      .slice(0, 5);

    return {
      totalModels: userModels.length,
      modelsByType,
      averageAccuracy: userModels.length > 0 ? totalAccuracy / userModels.length : 0,
      bestModel,
      recentModels
    };
  }

  /**
   * 問題別のモデル一覧を取得
   */
  static getModelsByProblem(problemId: string): TrainedModel[] {
    const allModels: TrainedModel[] = [];
    
    for (const models of this.models.values()) {
      allModels.push(...models.filter(m => m.problemId === problemId));
    }
    
    return allModels.sort((a, b) => b.trainingDate.getTime() - a.trainingDate.getTime());
  }

  /**
   * モデルの検索
   */
  static searchModels(
    userId: string,
    query: {
      modelType?: string;
      problemId?: string;
      minAccuracy?: number;
      maxAccuracy?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): TrainedModel[] {
    let userModels = this.models.get(userId) || [];

    if (query.modelType) {
      userModels = userModels.filter(m => m.modelType === query.modelType);
    }

    if (query.problemId) {
      userModels = userModels.filter(m => m.problemId === query.problemId);
    }

    if (query.minAccuracy !== undefined) {
      userModels = userModels.filter(m => m.performance.accuracy >= query.minAccuracy!);
    }

    if (query.maxAccuracy !== undefined) {
      userModels = userModels.filter(m => m.performance.accuracy <= query.maxAccuracy!);
    }

    if (query.dateFrom) {
      userModels = userModels.filter(m => m.trainingDate >= query.dateFrom!);
    }

    if (query.dateTo) {
      userModels = userModels.filter(m => m.trainingDate <= query.dateTo!);
    }

    return userModels.sort((a, b) => b.trainingDate.getTime() - a.trainingDate.getTime());
  }

  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.modelCache.clear();
    console.log('モデルキャッシュをクリアしました');
  }

  /**
   * 全データをエクスポート（バックアップ用）
   */
  static exportAllData(): string {
    const allData = {
      models: Array.from(this.models.entries()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return JSON.stringify(allData, null, 2);
  }

  /**
   * データをインポート（復元用）
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.models && Array.isArray(data.models)) {
        this.models = new Map(data.models);
        console.log('モデルデータをインポートしました');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('データのインポートに失敗:', error);
      return false;
    }
  }
}


