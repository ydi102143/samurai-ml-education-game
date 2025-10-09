import type { CompetitionDataset, CompetitionProblem } from '../types/competition';

export class CompetitionDatasetManager {
  /**
   * 生データからコンペティション用データセットを作成
   */
  static createCompetitionDataset(
    rawData: any[],
    featureNames: string[],
    labelName: string,
    problemType: 'classification' | 'regression',
    classes?: string[]
  ): CompetitionDataset {
    // データをシャッフル
    const shuffledData = this.shuffleArray([...rawData]);
    
    // 70% train, 15% validation, 15% test に分割（より適切な分割）
    const trainSize = Math.floor(shuffledData.length * 0.7);
    const validationSize = Math.floor(shuffledData.length * 0.15);
    
    const train = shuffledData.slice(0, trainSize);
    const validation = shuffledData.slice(trainSize, trainSize + validationSize);
    const test = shuffledData.slice(trainSize + validationSize);
    
    return {
      data: shuffledData, // 全データ
      train,
      validation,
      test,
      featureNames,
      labelName,
      classes,
      problemType,
      description: `${problemType}問題 - ${featureNames.length}個の特徴量`,
      defaultMetric: problemType === 'classification' ? 'accuracy' : 'mae',
      metric: problemType === 'classification' ? 'accuracy' : 'mae' // 後方互換性
    };
  }

  /**
   * データをシャッフル（Fisher-Yatesアルゴリズム）
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 特徴量選択を適用
   */
  static selectFeatures(
    dataset: CompetitionDataset,
    selectedFeatures: number[]
  ): CompetitionDataset {
    return {
      ...dataset,
      train: dataset.train.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      validation: dataset.validation.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      test: dataset.test.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      featureNames: selectedFeatures.map(i => dataset.featureNames[i])
    };
  }

  /**
   * 前処理を適用
   */
  static preprocessDataset(
    dataset: CompetitionDataset,
    method: 'none' | 'normalize' | 'standardize' | 'encode',
    encodedFeatures?: number[]
  ): CompetitionDataset {
    if (method === 'none') return dataset;

    if (method === 'normalize') {
      return this.normalizeDataset(dataset);
    }

    if (method === 'standardize') {
      return this.standardizeDataset(dataset);
    }

    if (method === 'encode' && encodedFeatures) {
      return this.encodeDataset(dataset, encodedFeatures);
    }

    return dataset;
  }

  /**
   * 正規化（0-1スケール）
   */
  private static normalizeDataset(dataset: CompetitionDataset): CompetitionDataset {
    const numFeatures = dataset.featureNames.length;
    const mins = Array(numFeatures).fill(Infinity);
    const maxs = Array(numFeatures).fill(-Infinity);

    // 学習データから最小値・最大値を計算
    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        mins[i] = Math.min(mins[i], value);
        maxs[i] = Math.max(maxs[i], value);
      });
    });

    const transform = (point: DataPoint): DataPoint => ({
      ...point,
      features: point.features.map((value, i) => {
        const range = maxs[i] - mins[i];
        if (!isFinite(range) || range === 0) return 0;
        return (value - mins[i]) / range;
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * 標準化（平均0、標準偏差1）
   */
  private static standardizeDataset(dataset: CompetitionDataset): CompetitionDataset {
    const numFeatures = dataset.featureNames.length;
    const means = Array(numFeatures).fill(0);
    const stds = Array(numFeatures).fill(0);

    // 学習データから平均・標準偏差を計算
    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        means[i] += value;
      });
    });

    means.forEach((mean, i) => {
      means[i] = mean / dataset.train.length;
    });

    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        stds[i] += Math.pow(value - means[i], 2);
      });
    });

    stds.forEach((sum, i) => {
      stds[i] = Math.sqrt(sum / dataset.train.length);
    });

    const transform = (point: DataPoint): DataPoint => ({
      ...point,
      features: point.features.map((value, i) => {
        if (stds[i] === 0) return 0;
        return (value - means[i]) / stds[i];
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * カテゴリエンコーディング
   */
  private static encodeDataset(
    dataset: CompetitionDataset,
    encodedFeatures: number[]
  ): CompetitionDataset {
    const encoders: Record<number, Map<string, number>> = {};

    // 学習データからエンコーダーを作成
    dataset.train.forEach(point => {
      encodedFeatures.forEach(featureIndex => {
        if (!encoders[featureIndex]) {
          encoders[featureIndex] = new Map();
        }
        const key = String(point.features[featureIndex]);
        if (!encoders[featureIndex].has(key)) {
          encoders[featureIndex].set(key, encoders[featureIndex].size);
        }
      });
    });

    const transform = (point: DataPoint): DataPoint => ({
      ...point,
      features: point.features.map((value, i) => {
        if (encodedFeatures.includes(i)) {
          const key = String(value);
          return encoders[i].get(key) ?? 0;
        }
        return value;
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * プレイヤー用データセット（学習用 + 検証用）
   */
  static getPlayerDataset(dataset: CompetitionDataset) {
    return {
      train: dataset.train,
      test: dataset.validation, // プレイヤーは検証データで評価
      featureNames: dataset.featureNames,
      labelName: dataset.labelName,
      classes: dataset.classes
    };
  }

  /**
   * 運営用データセット（最終評価用）
   */
  static getOfficialDataset(dataset: CompetitionDataset) {
    return {
      train: dataset.train,
      test: dataset.test, // 運営はテストデータで最終評価
      featureNames: dataset.featureNames,
      labelName: dataset.labelName,
      classes: dataset.classes
    };
  }
}

