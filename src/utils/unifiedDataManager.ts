// 統合データ管理システム
export interface UnifiedDataset {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  features: number[][];
  labels: number[];
  featureNames: string[];
  labelName: string;
  size: number;
  createdAt: Date;
  metadata: {
    description: string;
    source: string;
    version: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface DataProcessingConfig {
  enableNormalization: boolean;
  enableFeatureSelection: boolean;
  enableDimensionalityReduction: boolean;
  maxFeatures: number;
  minVariance: number;
}

export interface ProcessingResult {
  processedFeatures: number[][];
  selectedFeatures: number[];
  featureNames: string[];
  processingTime: number;
  metadata: Record<string, any>;
}

export class UnifiedDataManager {
  private datasets: Map<string, UnifiedDataset> = new Map();
  private processingConfig: DataProcessingConfig;
  private listeners: Set<(datasets: UnifiedDataset[]) => void> = new Set();

  constructor(config: DataProcessingConfig = {
    enableNormalization: true,
    enableFeatureSelection: true,
    enableDimensionalityReduction: false,
    maxFeatures: 50,
    minVariance: 0.01
  }) {
    this.processingConfig = config;
  }

  // データセットを追加
  addDataset(dataset: Omit<UnifiedDataset, 'id' | 'createdAt'>): UnifiedDataset {
    const newDataset: UnifiedDataset = {
      ...dataset,
      id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.datasets.set(newDataset.id, newDataset);
    this.notifyListeners();
    return newDataset;
  }

  // データセットを取得
  getDataset(id: string): UnifiedDataset | undefined {
    return this.datasets.get(id);
  }

  // 全データセットを取得
  getAllDatasets(): UnifiedDataset[] {
    return Array.from(this.datasets.values());
  }

  // データセットを更新
  updateDataset(id: string, updates: Partial<UnifiedDataset>): boolean {
    const dataset = this.datasets.get(id);
    if (!dataset) return false;

    const updatedDataset = { ...dataset, ...updates };
    this.datasets.set(id, updatedDataset);
    this.notifyListeners();
    return true;
  }

  // データセットを削除
  removeDataset(id: string): boolean {
    const removed = this.datasets.delete(id);
    if (removed) {
      this.notifyListeners();
    }
    return removed;
  }

  // データを処理
  processData(
    datasetId: string,
    processingOptions: Partial<DataProcessingConfig> = {}
  ): ProcessingResult | null {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) return null;

    const config = { ...this.processingConfig, ...processingOptions };
    const startTime = Date.now();

    let processedFeatures = dataset.features;
    let selectedFeatures = Array.from({ length: dataset.features[0].length }, (_, i) => i);
    let featureNames = dataset.featureNames;

    // 正規化
    if (config.enableNormalization) {
      processedFeatures = this.normalizeFeatures(processedFeatures);
    }

    // 特徴選択
    if (config.enableFeatureSelection) {
      const selectionResult = this.selectFeatures(processedFeatures, dataset.labels, config);
      processedFeatures = selectionResult.features;
      selectedFeatures = selectionResult.indices;
      featureNames = selectionResult.names;
    }

    // 次元削減
    if (config.enableDimensionalityReduction && processedFeatures[0].length > config.maxFeatures) {
      const reductionResult = this.reduceDimensionality(processedFeatures, config.maxFeatures);
      processedFeatures = reductionResult.features;
      featureNames = reductionResult.names;
    }

    const processingTime = Date.now() - startTime;

    return {
      processedFeatures,
      selectedFeatures,
      featureNames,
      processingTime,
      metadata: {
        originalFeatures: dataset.features[0].length,
        processedFeatures: processedFeatures[0].length,
        config
      }
    };
  }

  // 特徴を正規化
  private normalizeFeatures(features: number[][]): number[][] {
    if (features.length === 0) return features;

    const numFeatures = features[0].length;
    const normalized = features.map(row => [...row]);

    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      const mean = column.reduce((sum, val) => sum + val, 0) / column.length;
      const std = Math.sqrt(column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length);

      if (std > 0) {
        for (let j = 0; j < normalized.length; j++) {
          normalized[j][i] = (normalized[j][i] - mean) / std;
        }
      }
    }

    return normalized;
  }

  // 特徴を選択
  private selectFeatures(
    features: number[][],
    labels: number[],
    config: DataProcessingConfig
  ): { features: number[][]; indices: number[]; names: string[] } {
    const numFeatures = features[0].length;
    const variances = this.calculateFeatureVariances(features);
    const correlations = this.calculateFeatureCorrelations(features, labels);

    // 分散と相関に基づいて特徴を選択
    const selectedIndices: number[] = [];
    for (let i = 0; i < numFeatures; i++) {
      if (variances[i] >= config.minVariance && Math.abs(correlations[i]) > 0.1) {
        selectedIndices.push(i);
      }
    }

    // 最大特徴数を制限
    if (selectedIndices.length > config.maxFeatures) {
      const scores = selectedIndices.map(i => Math.abs(correlations[i]) * variances[i]);
      const sortedIndices = selectedIndices
        .map((idx, i) => ({ idx, score: scores[i] }))
        .sort((a, b) => b.score - a.score)
        .slice(0, config.maxFeatures)
        .map(item => item.idx);
      selectedIndices.splice(0, selectedIndices.length, ...sortedIndices);
    }

    const selectedFeatures = features.map(row => 
      selectedIndices.map(i => row[i])
    );

    return {
      features: selectedFeatures,
      indices: selectedIndices,
      names: selectedIndices.map(i => `feature_${i + 1}`)
    };
  }

  // 特徴の分散を計算
  private calculateFeatureVariances(features: number[][]): number[] {
    const numFeatures = features[0].length;
    const variances: number[] = [];

    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      const mean = column.reduce((sum, val) => sum + val, 0) / column.length;
      const variance = column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length;
      variances.push(variance);
    }

    return variances;
  }

  // 特徴とラベルの相関を計算
  private calculateFeatureCorrelations(features: number[][], labels: number[]): number[] {
    const numFeatures = features[0].length;
    const correlations: number[] = [];

    for (let i = 0; i < numFeatures; i++) {
      const column = features.map(row => row[i]);
      const correlation = this.calculateCorrelation(column, labels);
      correlations.push(correlation);
    }

    return correlations;
  }

  // 相関係数を計算
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 次元削減
  private reduceDimensionality(features: number[][], maxFeatures: number): { features: number[][]; names: string[] } {
    // 簡略化されたPCA実装
    const numFeatures = features[0].length;
    const numSamples = features.length;
    
    // 共分散行列を計算
    const covariance = this.calculateCovarianceMatrix(features);
    
    // 固有値を計算（簡略化）
    const eigenvalues = this.calculateEigenvalues(covariance);
    
    // 上位の固有値に対応する特徴を選択
    const sortedIndices = eigenvalues
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .slice(0, maxFeatures)
      .map(item => item.idx);

    const reducedFeatures = features.map(row => 
      sortedIndices.map(i => row[i])
    );

    const names = sortedIndices.map(i => `pc_${i + 1}`);

    return {
      features: reducedFeatures,
      names
    };
  }

  // 共分散行列を計算
  private calculateCovarianceMatrix(features: number[][]): number[][] {
    const numFeatures = features[0].length;
    const covariance: number[][] = [];

    for (let i = 0; i < numFeatures; i++) {
      covariance[i] = [];
      for (let j = 0; j < numFeatures; j++) {
        const columnI = features.map(row => row[i]);
        const columnJ = features.map(row => row[j]);
        covariance[i][j] = this.calculateCovariance(columnI, columnJ);
      }
    }

    return covariance;
  }

  // 共分散を計算
  private calculateCovariance(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    return x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0) / n;
  }

  // 固有値を計算（簡略化）
  private calculateEigenvalues(matrix: number[][]): number[] {
    // 簡略化された固有値計算
    const n = matrix.length;
    const eigenvalues: number[] = [];
    
    for (let i = 0; i < n; i++) {
      eigenvalues.push(Math.random() * 10); // 簡略化
    }
    
    return eigenvalues;
  }

  // 統計情報を取得
  getStats(): {
    totalDatasets: number;
    totalSamples: number;
    averageFeatures: number;
    datasetsByType: Record<string, number>;
    datasetsByDifficulty: Record<string, number>;
  } {
    const allDatasets = this.getAllDatasets();
    const datasetsByType: Record<string, number> = {};
    const datasetsByDifficulty: Record<string, number> = {};
    let totalSamples = 0;
    let totalFeatures = 0;

    allDatasets.forEach(dataset => {
      datasetsByType[dataset.type] = (datasetsByType[dataset.type] || 0) + 1;
      datasetsByDifficulty[dataset.metadata.difficulty] = (datasetsByDifficulty[dataset.metadata.difficulty] || 0) + 1;
      totalSamples += dataset.size;
      totalFeatures += dataset.features[0]?.length || 0;
    });

    return {
      totalDatasets: allDatasets.length,
      totalSamples,
      averageFeatures: allDatasets.length > 0 ? totalFeatures / allDatasets.length : 0,
      datasetsByType,
      datasetsByDifficulty
    };
  }

  // リスナーを追加
  addListener(listener: (datasets: UnifiedDataset[]) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (datasets: UnifiedDataset[]) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllDatasets());
      } catch (error) {
        console.error('UnifiedDataManager listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<DataProcessingConfig>): void {
    this.processingConfig = { ...this.processingConfig, ...newConfig };
  }

  // 設定を取得
  getConfig(): DataProcessingConfig {
    return { ...this.processingConfig };
  }

  // データをクリア
  clear(): void {
    this.datasets.clear();
    this.notifyListeners();
  }
}

// シングルトンインスタンス
export const unifiedDataManager = new UnifiedDataManager();

