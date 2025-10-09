import type { Dataset, ModelResult } from '../types/ml';
import type { SafetyCheck, EducationalContent } from '../types/database';

// 過学習検出システム
export class OverfittingDetector {
  static detectOverfitting(
    trainAccuracy: number, 
    testAccuracy: number, 
    threshold: number = 0.1
  ): {
    isOverfitting: boolean;
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestions: string[];
  } {
    const gap = trainAccuracy - testAccuracy;
    
    if (gap > 0.2) {
      return {
        isOverfitting: true,
        severity: 'high',
        message: '⚠️ 過学習が発生しています。モデルが複雑すぎる可能性があります。',
        suggestions: [
          'モデルを簡素化してください',
          '正則化を試してください',
          'より多くのデータを集めてください',
          '特徴量の数を減らしてください'
        ]
      };
    } else if (gap > 0.1) {
      return {
        isOverfitting: true,
        severity: 'medium',
        message: '⚠️ 過学習の可能性があります。注意深く監視してください。',
        suggestions: [
          '交差検証を実施してください',
          'モデルの複雑さを確認してください',
          'テストデータでの性能を監視してください'
        ]
      };
    } else {
      return {
        isOverfitting: false,
        severity: 'low',
        message: '✅ 適切な学習状態です。',
        suggestions: ['現在のモデルは適切です']
      };
    }
  }
}

// 段階的な複雑さ制限システム
export class ComplexityLimiter {
  static getAvailableModels(level: number): string[] {
    const modelAvailability = {
      1: ['logistic_regression', 'linear_regression'],
      2: ['logistic_regression', 'linear_regression', 'knn'],
      3: ['logistic_regression', 'linear_regression', 'knn', 'neural_network'],
      4: ['logistic_regression', 'linear_regression', 'knn', 'neural_network', 'ensemble']
    };
    
    return modelAvailability[level] || modelAvailability[1];
  }
  
  static canUseModel(modelType: string, level: number): boolean {
    const availableModels = this.getAvailableModels(level);
    return availableModels.includes(modelType);
  }
  
  static getModelComplexity(modelType: string): number {
    const complexityMap = {
      'logistic_regression': 1,
      'linear_regression': 1,
      'knn': 2,
      'neural_network': 3,
      'ensemble': 4
    };
    
    return complexityMap[modelType] || 1;
  }
}

// 教育内容の段階的提供システム
export class EducationalContentProvider {
  static getExplanation(
    concept: string, 
    level: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    const explanations = {
      'overfitting': {
        beginner: 'テストの答えを暗記してしまうと、新しい問題が解けなくなる',
        intermediate: '訓練データに過度に適合し、汎化性能が低下する現象',
        advanced: 'モデルの複雑さが増すと、訓練誤差は減少するが汎化誤差は増加する'
      },
      'validation': {
        beginner: 'テストの練習をして、本当に理解できているか確認する',
        intermediate: '未知のデータでの性能を確認すること',
        advanced: 'モデルの汎化性能を評価するための手法'
      },
      'feature_engineering': {
        beginner: '新しい指標を作る',
        intermediate: '既存の特徴量から新しい特徴量を作成する手法',
        advanced: 'ドメイン知識を活用して、モデルの性能向上に寄与する特徴量を作成する'
      }
    };
    
    return explanations[concept]?.[level] || '概念の説明を準備中です';
  }
  
  static getSafetyNotes(concept: string): string[] {
    const safetyNotes = {
      'overfitting': [
        '過学習は機械学習の重要な問題です',
        '適切な検証が不可欠です',
        '段階的な複雑さの導入が重要です'
      ],
      'model_selection': [
        '複雑なモデルが常に良いとは限りません',
        '解釈可能性も考慮してください',
        '計算コストも考慮してください'
      ]
    };
    
    return safetyNotes[concept] || [];
  }
}

// 安全な学習ガイダンスシステム
export class SafeLearningGuidance {
  static getBestPractices(): string[] {
    return [
      'まずはシンプルなモデルから始める',
      '訓練データとテストデータを分ける',
      '複雑なモデルを使う前に基本を理解する',
      '結果を解釈できることが重要',
      '過学習に注意する',
      '適切な評価指標を使う'
    ];
  }
  
  static getCommonMisconceptions(): { concept: string; misconception: string; correction: string }[] {
    return [
      {
        concept: '精度',
        misconception: '精度が高いほど良い',
        correction: '適切な検証での精度が重要。過学習に注意'
      },
      {
        concept: 'モデル選択',
        misconception: '複雑なモデルが常に良い',
        correction: '問題に応じた適切なモデルを選択することが重要'
      },
      {
        concept: '特徴量',
        misconception: '特徴量が多いほど良い',
        correction: '関連性の高い特徴量を選択することが重要'
      }
    ];
  }
}

// 段階的な学習進捗管理
export class LearningProgressManager {
  static checkUnlockConditions(
    userLevel: number,
    completedRegions: string[],
    userSkills: string[]
  ): { canUnlock: boolean; missingRequirements: string[] } {
    const requirements = {
      level2: {
        requiredRegions: ['kyoto'],
        minAccuracy: 0.8,
        requiredSkills: ['basic_classification']
      },
      level3: {
        requiredRegions: ['kyoto', 'sakai'],
        minAccuracy: 0.85,
        requiredSkills: ['feature_engineering', 'model_selection']
      }
    };
    
    const missingRequirements: string[] = [];
    
    if (userLevel >= 2) {
      const req = requirements.level2;
      if (!completedRegions.includes('kyoto')) {
        missingRequirements.push('京都の課題をクリアしてください');
      }
      if (!userSkills.includes('basic_classification')) {
        missingRequirements.push('基本分類スキルを習得してください');
      }
    }
    
    if (userLevel >= 3) {
      const req = requirements.level3;
      if (!completedRegions.includes('sakai')) {
        missingRequirements.push('堺の課題をクリアしてください');
      }
      if (!userSkills.includes('feature_engineering')) {
        missingRequirements.push('特徴量エンジニアリングスキルを習得してください');
      }
      if (!userSkills.includes('model_selection')) {
        missingRequirements.push('モデル選択スキルを習得してください');
      }
    }
    
    return {
      canUnlock: missingRequirements.length === 0,
      missingRequirements
    };
  }
}

// 安全な評価システム
export class SafeEvaluationSystem {
  static validateModelSelection(
    modelType: string,
    problemType: string,
    userLevel: number
  ): { isValid: boolean; message: string; suggestions: string[] } {
    // 問題タイプとモデルの適合性チェック
    const validCombinations = {
      'classification': ['logistic_regression', 'knn', 'neural_network'],
      'regression': ['linear_regression', 'neural_network'],
      'clustering': ['knn']
    };
    
    if (!validCombinations[problemType]?.includes(modelType)) {
      return {
        isValid: false,
        message: '選択したモデルは問題タイプに適していません',
        suggestions: [
          `分類問題には ${validCombinations.classification.join(', ')} が適しています`,
          `回帰問題には ${validCombinations.regression.join(', ')} が適しています`
        ]
      };
    }
    
    // ユーザーレベルとモデル複雑性のチェック
    if (!ComplexityLimiter.canUseModel(modelType, userLevel)) {
      return {
        isValid: false,
        message: 'このモデルは現在のレベルでは使用できません',
        suggestions: [
          'より基本的なモデルから始めてください',
          'レベルを上げてから再挑戦してください'
        ]
      };
    }
    
    return {
      isValid: true,
      message: '適切なモデル選択です',
      suggestions: ['このモデルで学習を進めてください']
    };
  }
  
  static provideFeedback(
    result: ModelResult,
    userLevel: number
  ): { feedback: string; suggestions: string[]; nextSteps: string[] } {
    const feedback: string[] = [];
    const suggestions: string[] = [];
    const nextSteps: string[] = [];
    
    // 精度に基づくフィードバック
    if (result.accuracy >= 0.9) {
      feedback.push('素晴らしい精度です！');
      nextSteps.push('より複雑な問題に挑戦してみてください');
    } else if (result.accuracy >= 0.8) {
      feedback.push('良い精度です！');
      suggestions.push('特徴量の選択を見直してみてください');
    } else if (result.accuracy >= 0.7) {
      feedback.push('改善の余地があります');
      suggestions.push('データの前処理を確認してください');
      suggestions.push('異なるモデルを試してみてください');
    } else {
      feedback.push('精度を向上させる必要があります');
      suggestions.push('データの理解を深めてください');
      suggestions.push('基本的な手法から始めてください');
    }
    
    // 過学習チェック
    const overfittingCheck = OverfittingDetector.detectOverfitting(
      result.accuracy, // 仮想的な訓練精度
      result.accuracy
    );
    
    if (overfittingCheck.isOverfitting) {
      feedback.push(overfittingCheck.message);
      suggestions.push(...overfittingCheck.suggestions);
    }
    
    return {
      feedback: feedback.join(' '),
      suggestions,
      nextSteps
    };
  }
}

