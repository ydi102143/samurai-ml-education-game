// データセット管理システム
export interface Dataset {
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

export interface DatasetConfig {
  name: string;
  type: 'classification' | 'regression';
  size: number;
  features: number;
  noiseLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DatasetStats {
  totalDatasets: number;
  datasetsByType: Record<string, number>;
  datasetsByDifficulty: Record<string, number>;
  totalSamples: number;
  averageFeatures: number;
}

export class DatasetManager {
  private datasets: Map<string, Dataset> = new Map();
  private configs: Map<string, DatasetConfig> = new Map();
  private listeners: Set<(datasets: Dataset[]) => void> = new Set();

  constructor() {
    this.initializeDefaultConfigs();
  }

  // デフォルト設定を初期化
  private initializeDefaultConfigs(): void {
    const defaultConfigs: DatasetConfig[] = [
      {
        name: '売上予測データセット',
        type: 'regression',
        size: 1000,
        features: 8,
        noiseLevel: 0.1,
        difficulty: 'easy'
      },
      {
        name: '顧客分類データセット',
        type: 'classification',
        size: 800,
        features: 6,
        noiseLevel: 0.15,
        difficulty: 'medium'
      },
      {
        name: '住宅価格データセット',
        type: 'regression',
        size: 1200,
        features: 10,
        noiseLevel: 0.2,
        difficulty: 'medium'
      },
      {
        name: '不正検出データセット',
        type: 'classification',
        size: 1500,
        features: 12,
        noiseLevel: 0.05,
        difficulty: 'hard'
      }
    ];

    defaultConfigs.forEach(config => {
      this.configs.set(config.name, config);
    });
  }

  // データセットを生成
  generateDataset(configName: string): Dataset | null {
    const config = this.configs.get(configName);
    if (!config) return null;

    const dataset = this.createDataset(config);
    this.datasets.set(dataset.id, dataset);
    this.notifyListeners();
    return dataset;
  }

  // データセットを作成
  private createDataset(config: DatasetConfig): Dataset {
    const features: number[][] = [];
    const labels: number[] = [];
    const featureNames = this.generateFeatureNames(config.features);
    const labelName = 'target';

    for (let i = 0; i < config.size; i++) {
      const featureRow = this.generateFeatureRow(config);
      const label = this.generateLabel(featureRow, config);
      
      features.push(featureRow);
      labels.push(label);
    }

    return {
      id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      type: config.type,
      features,
      labels,
      featureNames,
      labelName,
      size: config.size,
      createdAt: new Date(),
      metadata: {
        description: this.generateDescription(config),
        source: 'Generated',
        version: '1.0.0',
        difficulty: config.difficulty
      }
    };
  }

  // 特徴量名を生成
  private generateFeatureNames(count: number): string[] {
    const names = [
      'feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5',
      'feature_6', 'feature_7', 'feature_8', 'feature_9', 'feature_10',
      'feature_11', 'feature_12', 'feature_13', 'feature_14', 'feature_15'
    ];
    
    return names.slice(0, count);
  }

  // 特徴量行を生成
  private generateFeatureRow(config: DatasetConfig): number[] {
    const row: number[] = [];
    
    for (let i = 0; i < config.features; i++) {
      let value: number;
      
      switch (i % 4) {
        case 0:
          value = this.generateNormal(0, 1);
          break;
        case 1:
          value = this.generateLogNormal(0, 0.5);
          break;
        case 2:
          value = this.generateBeta(2, 5);
          break;
        case 3:
          value = this.generateGamma(2, 1);
          break;
        default:
          value = Math.random();
      }
      
      const noise = (Math.random() - 0.5) * config.noiseLevel;
      value += noise;
      
      row.push(value);
    }
    
    return row;
  }

  // ラベルを生成
  private generateLabel(features: number[], config: DatasetConfig): number {
    if (config.type === 'classification') {
      return this.generateClassificationLabel(features, config);
    } else {
      return this.generateRegressionLabel(features, config);
    }
  }

  // 分類ラベルを生成
  private generateClassificationLabel(features: number[], config: DatasetConfig): number {
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += features[i] * (i + 1) * 0.1;
    }
    
    const probability = 1 / (1 + Math.exp(-score));
    const noise = (Math.random() - 0.5) * config.noiseLevel;
    const finalProbability = Math.max(0, Math.min(1, probability + noise));
    
    return finalProbability > 0.5 ? 1 : 0;
  }

  // 回帰ラベルを生成
  private generateRegressionLabel(features: number[], config: DatasetConfig): number {
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += features[i] * (i + 1) * 0.5;
    }
    
    score = Math.pow(score, 1.5) * 0.1;
    const noise = (Math.random() - 0.5) * config.noiseLevel * 10;
    score += noise;
    
    return Math.max(0, score);
  }

  // 正規分布を生成
  private generateNormal(mean: number, std: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
  }

  // 対数正規分布を生成
  private generateLogNormal(mu: number, sigma: number): number {
    const normal = this.generateNormal(mu, sigma);
    return Math.exp(normal);
  }

  // ベータ分布を生成
  private generateBeta(alpha: number, beta: number): number {
    const gamma1 = this.generateGamma(alpha, 1);
    const gamma2 = this.generateGamma(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  // ガンマ分布を生成
  private generateGamma(shape: number, scale: number): number {
    if (shape < 1) {
      return Math.pow(Math.random(), 1 / shape) * this.generateGamma(shape + 1, scale);
    }
    
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.generateNormal(0, 1);
      const v = 1 + c * x;
      
      if (v <= 0) continue;
      
      const v3 = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * (x * x) * (x * x)) {
        return d * v3 * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v3 + Math.log(v3))) {
        return d * v3 * scale;
      }
    }
  }

  // 説明を生成
  private generateDescription(config: DatasetConfig): string {
    const typeText = config.type === 'classification' ? '分類' : '回帰';
    const difficultyText = {
      'easy': '簡単',
      'medium': '中程度',
      'hard': '困難'
    }[config.difficulty];
    
    return `${config.name} - ${typeText}問題 (${difficultyText})`;
  }

  // データセットを取得
  getDataset(id: string): Dataset | undefined {
    return this.datasets.get(id);
  }

  // 全データセットを取得
  getAllDatasets(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  // 設定を取得
  getConfig(name: string): DatasetConfig | undefined {
    return this.configs.get(name);
  }

  // 全設定を取得
  getAllConfigs(): DatasetConfig[] {
    return Array.from(this.configs.values());
  }

  // データセットを削除
  removeDataset(id: string): boolean {
    const removed = this.datasets.delete(id);
    if (removed) {
      this.notifyListeners();
    }
    return removed;
  }

  // 統計情報を取得
  getStats(): DatasetStats {
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
      datasetsByType,
      datasetsByDifficulty,
      totalSamples,
      averageFeatures: allDatasets.length > 0 ? totalFeatures / allDatasets.length : 0
    };
  }

  // リスナーを追加
  addListener(listener: (datasets: Dataset[]) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (datasets: Dataset[]) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllDatasets());
      } catch (error) {
        console.error('Dataset listener error:', error);
      }
    });
  }

  // 全データセットをクリア
  clear(): void {
    this.datasets.clear();
    this.notifyListeners();
  }

  // データセットをエクスポート
  exportDataset(id: string): string | null {
    const dataset = this.datasets.get(id);
    if (!dataset) return null;
    
    return JSON.stringify(dataset);
  }

  // データセットをインポート
  importDataset(data: string): boolean {
    try {
      const dataset = JSON.parse(data) as Dataset;
      this.datasets.set(dataset.id, dataset);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import dataset:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const datasetManager = new DatasetManager();

