export interface DataPoint {
  features: number[];
  label: number | string;
}

export interface RawDataset {
  train: DataPoint[];
  test: DataPoint[];
  featureUnits?: string[];
}

export interface Dataset {
  train: DataPoint[];
  test: DataPoint[];
  featureNames: string[];
  labelName: string;
  classes?: string[];
  // 生データ（前処理前）を保持し、EDAでわかりやすく表示できるようにする
  raw?: RawDataset;
}

export interface ModelParameters {
  [key: string]: number;
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface FeatureImportance {
  featureName: string;
  importance: number;
}

export interface DataInsights {
  outliers: { index: number; featureIndex: number; value: number }[];
  missingValues: number;
  classBalance?: { [key: string]: number };
  featureRanges: { min: number; max: number; mean: number; std: number }[];
}

export interface ModelResult {
  accuracy: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  confusion_matrix?: number[][];
  predictions: (number | string)[];
  actual: (number | string)[];
  training_time: number;
  feature_importance?: FeatureImportance[];
}

export interface ModelTrainer {
  train(dataset: Dataset, parameters: ModelParameters, onProgress?: (progress: TrainingProgress) => void): Promise<void>;
  predict(features: number[]): number | string;
  evaluate(dataset: Dataset): ModelResult;
}
