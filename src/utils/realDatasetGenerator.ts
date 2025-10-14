// リアルなデータセット生成システム
export interface DatasetConfig {
  name: string;
  type: 'classification' | 'regression';
  size: number;
  features: number;
  noiseLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GeneratedDataset {
  features: number[][];
  labels: number[];
  featureNames: string[];
  labelName: string;
  config: DatasetConfig;
  metadata: {
    generatedAt: Date;
    version: string;
    description: string;
  };
}

export class RealDatasetGenerator {
  private datasets: Map<string, GeneratedDataset> = new Map();
  private configs: Map<string, DatasetConfig> = new Map();

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
  generateDataset(configName: string): GeneratedDataset | null {
    const config = this.configs.get(configName);
    if (!config) return null;

    const dataset = this.createDataset(config);
    this.datasets.set(configName, dataset);
    return dataset;
  }

  // データセットを作成
  private createDataset(config: DatasetConfig): GeneratedDataset {
    const features: number[][] = [];
    const labels: number[] = [];
    const featureNames = this.generateFeatureNames(config.features);
    const labelName = config.type === 'classification' ? 'target' : 'target';

    for (let i = 0; i < config.size; i++) {
      const featureRow = this.generateFeatureRow(config);
      const label = this.generateLabel(featureRow, config);
      
      features.push(featureRow);
      labels.push(label);
    }

    return {
      features,
      labels,
      featureNames,
      labelName,
      config,
      metadata: {
        generatedAt: new Date(),
        version: '1.0.0',
        description: this.generateDescription(config)
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
      // 異なる分布を使用してより現実的なデータを生成
      let value: number;
      
      switch (i % 4) {
        case 0:
          // 正規分布
          value = this.generateNormal(0, 1);
          break;
        case 1:
          // 対数正規分布
          value = this.generateLogNormal(0, 0.5);
          break;
        case 2:
          // ベータ分布
          value = this.generateBeta(2, 5);
          break;
        case 3:
          // ガンマ分布
          value = this.generateGamma(2, 1);
          break;
        default:
          value = Math.random();
      }
      
      // ノイズを追加
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
    // 特徴量の重み付き合計を計算
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += features[i] * (i + 1) * 0.1;
    }
    
    // シグモイド関数を適用して確率に変換
    const probability = 1 / (1 + Math.exp(-score));
    
    // ノイズを追加
    const noise = (Math.random() - 0.5) * config.noiseLevel;
    const finalProbability = Math.max(0, Math.min(1, probability + noise));
    
    return finalProbability > 0.5 ? 1 : 0;
  }

  // 回帰ラベルを生成
  private generateRegressionLabel(features: number[], config: DatasetConfig): number {
    // 特徴量の重み付き合計を計算
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += features[i] * (i + 1) * 0.5;
    }
    
    // 非線形変換を追加
    score = Math.pow(score, 1.5) * 0.1;
    
    // ノイズを追加
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
  getDataset(name: string): GeneratedDataset | undefined {
    return this.datasets.get(name);
  }

  // 全データセットを取得
  getAllDatasets(): GeneratedDataset[] {
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
  removeDataset(name: string): boolean {
    return this.datasets.delete(name);
  }

  // 全データセットをクリア
  clear(): void {
    this.datasets.clear();
  }

  // データセットをエクスポート
  exportDataset(name: string): string | null {
    const dataset = this.datasets.get(name);
    if (!dataset) return null;
    
    return JSON.stringify(dataset);
  }

  // データセットをインポート
  importDataset(data: string): boolean {
    try {
      const dataset = JSON.parse(data) as GeneratedDataset;
      this.datasets.set(dataset.config.name, dataset);
      return true;
    } catch (error) {
      console.error('Failed to import dataset:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const realDatasetGenerator = new RealDatasetGenerator();

