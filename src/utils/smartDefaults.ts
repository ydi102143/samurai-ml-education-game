// インテリジェントなデフォルト設定
import type { Dataset } from '../types/ml';
import { userManager } from './userManager';

export interface UserLevel {
  level: number;
  experience: number;
  wins: number;
  losses: number;
  strengths: string[];
  weaknesses: string[];
}

export class SmartDefaults {
  // ユーザーレベルに基づく推奨モデル
  static getRecommendedModel(userLevel: number): string {
    if (userLevel < 3) {
      return 'logistic_regression'; // 初心者向け
    } else if (userLevel < 5) {
      return 'linear_regression'; // 中級者向け
    } else {
      return 'neural_network'; // 上級者向け
    }
  }
  
  // ユーザーレベルに基づく推奨特徴量
  static getRecommendedFeatures(dataset: Dataset, userLevel: number): number[] {
    const maxFeatures = Math.min(3 + userLevel, dataset.featureNames.length);
    const selectedFeatures: number[] = [];
    
    // 重要度の高い特徴量を優先選択
    const featureImportance = this.calculateFeatureImportance(dataset);
    const sortedFeatures = featureImportance
      .map((importance, index) => ({ index, importance }))
      .sort((a, b) => b.importance - a.importance);
    
    for (let i = 0; i < maxFeatures && i < sortedFeatures.length; i++) {
      selectedFeatures.push(sortedFeatures[i].index);
    }
    
    return selectedFeatures;
  }
  
  // 特徴量の重要度を計算
  private static calculateFeatureImportance(dataset: Dataset): number[] {
    const importance: number[] = [];
    
    for (let i = 0; i < dataset.featureNames.length; i++) {
      const values = dataset.train.map(point => point.features[i]);
      const variance = this.calculateVariance(values);
      const correlation = this.calculateCorrelation(values, dataset.train.map(point => point.label));
      importance.push(variance * Math.abs(correlation));
    }
    
    return importance;
  }
  
  // 分散を計算
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }
  
  // 相関を計算
  private static calculateCorrelation(x: number[], y: (number | string)[]): number {
    if (x.length !== y.length) return 0;
    
    const numericY = y.map(val => typeof val === 'string' ? val.charCodeAt(0) : val);
    const n = x.length;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = numericY.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * numericY[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = numericY.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  // ユーザーの強みと弱みを分析
  static analyzeUserStrengths(userStats: any): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // 勝率に基づく分析
    if (userStats.winRate > 0.8) {
      strengths.push('high_accuracy');
    } else if (userStats.winRate < 0.5) {
      weaknesses.push('low_accuracy');
    }
    
    // 学習時間に基づく分析
    if (userStats.averageTrainingTime < 30) {
      strengths.push('fast_learning');
    } else if (userStats.averageTrainingTime > 120) {
      weaknesses.push('slow_learning');
    }
    
    // 使用モデルに基づく分析
    if (userStats.preferredModel === 'neural_network') {
      strengths.push('advanced_models');
    } else if (userStats.preferredModel === 'logistic_regression') {
      weaknesses.push('basic_models');
    }
    
    return { strengths, weaknesses };
  }
  
  // 問題の難易度を調整
  static adjustProblemDifficulty(problemId: string, userPerformance: number): string {
    if (userPerformance > 0.9) {
      return this.increaseDifficulty(problemId);
    } else if (userPerformance < 0.6) {
      return this.decreaseDifficulty(problemId);
    }
    return problemId; // 現状維持
  }
  
  // 難易度を上げる
  private static increaseDifficulty(problemId: string): string {
    // より難しい問題を推薦
    const difficultProblems = [
      'modern_fraud_detection',
      'modern_image_classification'
    ];
    return difficultProblems[Math.floor(Math.random() * difficultProblems.length)];
  }
  
  // 難易度を下げる
  private static decreaseDifficulty(problemId: string): string {
    // より簡単な問題を推薦
    const easyProblems = [
      'modern_stock_prediction',
      'modern_sentiment_analysis'
    ];
    return easyProblems[Math.floor(Math.random() * easyProblems.length)];
  }
  
  // 推奨パラメータを取得
  static getRecommendedParameters(modelType: string, userLevel: number): Record<string, number> {
    const baseParams: Record<string, Record<string, number>> = {
      logistic_regression: {
        learning_rate: 0.01,
        max_iterations: 100,
        regularization: 0.1
      },
      linear_regression: {
        learning_rate: 0.001,
        max_iterations: 200,
        regularization: 0.01
      },
      neural_network: {
        learning_rate: 0.001,
        max_iterations: 300,
        hidden_layers: 2,
        neurons_per_layer: 64
      }
    };
    
    const params = { ...baseParams[modelType] };
    
    // ユーザーレベルに基づいて調整
    if (userLevel > 5) {
      params.learning_rate *= 0.5; // より細かい調整
      params.max_iterations *= 1.5; // より多くの反復
    }
    
    return params;
  }
  
  // 学習のヒントを提供
  static getLearningTips(currentStep: string, userLevel: number): string[] {
    const tips: Record<string, string[]> = {
      data: [
        'データの分布を確認して、異常値がないかチェックしましょう',
        '特徴量間の相関を確認して、重複する情報がないか見てみましょう'
      ],
      preprocessing: [
        '数値データは正規化して、スケールを統一しましょう',
        'カテゴリデータは適切にエンコーディングしましょう'
      ],
      features: [
        '重要度の高い特徴量を優先的に選択しましょう',
        '特徴量が多すぎると過学習の原因になります'
      ],
      model: [
        'シンプルなモデルから始めて、徐々に複雑にしていきましょう',
        'パラメータはデフォルト値から始めて調整しましょう'
      ],
      train: [
        '学習曲線を確認して、過学習していないかチェックしましょう',
        'バリデーション精度が向上しない場合は、学習を停止しましょう'
      ]
    };
    
    const baseTips = tips[currentStep] || [];
    
    // ユーザーレベルに基づいて高度なヒントを追加
    if (userLevel > 3) {
      baseTips.push('高度なテクニック: アンサンブル学習を試してみましょう');
    }
    
    return baseTips;
  }
}



