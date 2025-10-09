// コンペティション用のデータ型定義
import type { FeatureImportance } from './ml';

export interface CompetitionDataset {
  // 全データ（プレイヤーがアクセス可能）
  data: DataPoint[];
  // 学習用データ（後方互換性のため）
  train: DataPoint[];
  // 検証用データ（後方互換性のため）
  validation: DataPoint[];
  // テスト用データ（後方互換性のため）
  test: DataPoint[];
  // 特徴量名
  featureNames: string[];
  // ラベル名
  labelName: string;
  // クラス名（分類問題の場合）
  classes?: string[];
  // 問題の種類
  problemType: 'classification' | 'regression';
  // データの説明
  description: string;
  // デフォルト評価指標
  defaultMetric: 'accuracy' | 'f1_score' | 'precision' | 'recall' | 'mae' | 'mse' | 'rmse';
  // 後方互換性のため
  metric: 'accuracy' | 'f1_score' | 'precision' | 'recall' | 'mae' | 'mse' | 'rmse';
}

export interface DataSplitOptions {
  // 学習データの割合（0.0-1.0）
  trainRatio: number;
  // 検証データの割合（0.0-1.0）
  validationRatio: number;
  // テストデータの割合（0.0-1.0）
  testRatio: number;
  // ランダムシード
  randomSeed?: number;
  // 層化サンプリングを使用するか
  stratified?: boolean;
}

export interface EvaluationOptions {
  // 使用する評価指標
  metrics: ('accuracy' | 'f1_score' | 'precision' | 'recall' | 'mae' | 'mse' | 'rmse')[];
  // データ分割オプション
  dataSplit: DataSplitOptions;
  // クロスバリデーションの折数（0の場合は使用しない）
  crossValidationFolds?: number;
}

export interface DataPoint {
  features: number[];
  label: number | string;
  id?: string; // データポイントの一意ID
}

export interface CompetitionSubmission {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  // 予測結果（テストデータに対する予測）
  predictions: number[];
  // 予測確率（分類問題の場合）
  probabilities?: number[][];
  // 使用した特徴量
  selectedFeatures: number[];
  // 使用したモデル
  modelType: string;
  // モデルのパラメータ
  parameters: Record<string, any>;
  // 前処理の設定
  preprocessing: {
    method: 'none' | 'normalize' | 'standardize' | 'encode';
    encodedFeatures?: number[];
  };
  // 提出時刻
  submittedAt: Date;
  // スコア（運営が計算）
  score?: number;
  // Private評価スコア
  privateScore?: number;
  // Private評価日時
  privateEvaluationDate?: Date;
  // ランク
  rank?: number;
  // チーム情報
  teamId?: string;
  teamMembers?: string[];
}

export interface CompetitionLeaderboard {
  problemId: string;
  submissions: CompetitionSubmission[];
  // 最終更新時刻
  lastUpdated: Date;
  // 総提出数
  totalSubmissions: number;
  // 参加者数
  participantCount: number;
}

export interface CompetitionProblem {
  id: string;
  title: string;
  description: string;
  dataset: CompetitionDataset;
  // 問題タイプ
  problemType: 'binary_classification' | 'multiclass_classification' | 'regression';
  // 難易度
  difficulty: 'easy' | 'medium' | 'hard';
  // 時間制限
  timeLimit: number;
  // 評価指標
  metric: 'accuracy' | 'f1_score' | 'precision' | 'recall' | 'mae' | 'mse' | 'rmse';
  // 制限事項
  constraints: {
    maxFeatures: number;
    maxTrainingTime: number; // 秒
    maxSubmissions: number;
    allowedModels: string[];
  };
  // 開始・終了時刻
  startTime: Date;
  endTime: Date;
  // 現在の参加者数
  participantCount: number;
  // 現在の提出数
  submissionCount: number;
}

export interface ModelEvaluation {
  // 検証データでのスコア（プレイヤーが見える）
  validationScore: number;
  // テストデータでのスコア（最終スコア）
  testScore: number;
  // 詳細メトリクス
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    mae?: number;
    mse?: number;
    rmse?: number;
  };
  // 予測結果
  predictions: number[];
  // 実際の値
  actual: number[];
  // 予測確率（分類問題の場合）
  probabilities?: number[][];
  // 特徴量重要度
  featureImportance?: FeatureImportance[];
  // 学習時間
  trainingTime: number;
  // モデルの複雑さ
  modelComplexity: number;
  // 使用した評価オプション
  evaluationOptions?: EvaluationOptions;
}

