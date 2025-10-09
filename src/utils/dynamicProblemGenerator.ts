// 動的問題生成システム
import type { Dataset } from '../types/ml';

export interface ProblemConfig {
  type: 'binary_classification' | 'multiclass_classification' | 'regression';
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  features: number;
  samples: number;
  noiseLevel: number;
  complexity: number;
}

export class DynamicProblemGenerator {
  private static generateBinaryClassification(config: ProblemConfig): Dataset {
    const { samples, features, noiseLevel, complexity } = config;
    const data: any[] = [];
    
    // 2つのクラスを分離する決定境界を作成
    for (let i = 0; i < samples; i++) {
      const point: number[] = [];
      let decisionValue = 0;
      
      for (let j = 0; j < features; j++) {
        const value = Math.random() * 4 - 2; // -2 to 2
        point.push(value);
        
        // 複雑な決定境界を作成
        if (complexity === 1) {
          // 線形分離可能
          decisionValue += value * (j + 1);
        } else if (complexity === 2) {
          // 非線形分離可能
          decisionValue += Math.sin(value) * (j + 1) + value * value * 0.1;
        } else {
          // 非常に複雑
          decisionValue += Math.sin(value * 2) * Math.cos(value) * (j + 1) + 
                          value * value * 0.2 + Math.random() * 0.5;
        }
      }
      
      // ノイズを追加
      const noise = (Math.random() - 0.5) * noiseLevel;
      const label = decisionValue + noise > 0 ? 1 : 0;
      
      data.push({
        features: point,
        label: label
      });
    }
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    // 学習・テスト分割
    const trainSize = Math.floor(samples * 0.7);
    const train = data.slice(0, trainSize);
    const test = data.slice(trainSize);
    
    return {
      train,
      test,
      featureNames: Array.from({ length: features }, (_, i) => `特徴量${i + 1}`),
      labelName: 'クラス',
      classes: ['クラス0', 'クラス1']
    };
  }
  
  private static generateMulticlassClassification(config: ProblemConfig): Dataset {
    const { samples, features, noiseLevel, complexity } = config;
    const numClasses = Math.min(5, Math.max(3, Math.floor(complexity * 2) + 2));
    const data: any[] = [];
    
    for (let i = 0; i < samples; i++) {
      const point: number[] = [];
      const classScores: number[] = new Array(numClasses).fill(0);
      
      for (let j = 0; j < features; j++) {
        const value = Math.random() * 4 - 2;
        point.push(value);
        
        // 各クラスに対するスコアを計算
        for (let c = 0; c < numClasses; c++) {
          if (complexity === 1) {
            classScores[c] += value * Math.cos(c * Math.PI / numClasses) * (j + 1);
          } else if (complexity === 2) {
            classScores[c] += Math.sin(value + c) * (j + 1) + value * value * 0.1;
          } else {
            classScores[c] += Math.sin(value * (c + 1)) * Math.cos(value + c) * (j + 1) + 
                             value * value * 0.2 + Math.random() * 0.3;
          }
        }
      }
      
      // ノイズを追加
      for (let c = 0; c < numClasses; c++) {
        classScores[c] += (Math.random() - 0.5) * noiseLevel;
      }
      
      // 最も高いスコアのクラスを選択
      const label = classScores.indexOf(Math.max(...classScores));
      
      data.push({
        features: point,
        label: label
      });
    }
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    // 学習・テスト分割
    const trainSize = Math.floor(samples * 0.7);
    const train = data.slice(0, trainSize);
    const test = data.slice(trainSize);
    
    return {
      train,
      test,
      featureNames: Array.from({ length: features }, (_, i) => `特徴量${i + 1}`),
      labelName: 'クラス',
      classes: Array.from({ length: numClasses }, (_, i) => `クラス${i}`)
    };
  }
  
  private static generateRegression(config: ProblemConfig): Dataset {
    const { samples, features, noiseLevel, complexity } = config;
    const data: any[] = [];
    
    for (let i = 0; i < samples; i++) {
      const point: number[] = [];
      let targetValue = 0;
      
      for (let j = 0; j < features; j++) {
        const value = Math.random() * 4 - 2;
        point.push(value);
        
        // 複雑な回帰関数を作成
        if (complexity === 1) {
          // 線形回帰
          targetValue += value * (j + 1) * 2;
        } else if (complexity === 2) {
          // 非線形回帰
          targetValue += Math.sin(value) * (j + 1) * 3 + value * value * 0.5;
        } else {
          // 非常に複雑な回帰
          targetValue += Math.sin(value * 2) * Math.cos(value) * (j + 1) * 2 + 
                        value * value * 0.8 + Math.exp(value * 0.1) * 0.5;
        }
      }
      
      // ノイズを追加
      const noise = (Math.random() - 0.5) * noiseLevel * 2;
      const label = targetValue + noise;
      
      data.push({
        features: point,
        label: label
      });
    }
    
    // データをシャッフル
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }
    
    // 学習・テスト分割
    const trainSize = Math.floor(samples * 0.7);
    const train = data.slice(0, trainSize);
    const test = data.slice(trainSize);
    
    return {
      train,
      test,
      featureNames: Array.from({ length: features }, (_, i) => `特徴量${i + 1}`),
      labelName: 'ターゲット値',
      classes: []
    };
  }
  
  static generateProblem(config: ProblemConfig): Dataset {
    switch (config.type) {
      case 'binary_classification':
        return this.generateBinaryClassification(config);
      case 'multiclass_classification':
        return this.generateMulticlassClassification(config);
      case 'regression':
        return this.generateRegression(config);
      default:
        throw new Error(`未知の問題タイプ: ${config.type}`);
    }
  }
  
  static generateRandomProblem(): { config: ProblemConfig; dataset: Dataset } {
    const types: ProblemConfig['type'][] = ['binary_classification', 'multiclass_classification', 'regression'];
    const difficulties: ProblemConfig['difficulty'][] = ['easy', 'medium', 'hard'];
    
    // ランダムシードを設定
    const seed = Date.now();
    Math.random = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const config: ProblemConfig = {
      type,
      name: this.generateProblemName(type, difficulty),
      description: this.generateProblemDescription(type, difficulty),
      difficulty,
      features: difficulty === 'easy' ? 3 + Math.floor(Math.random() * 3) : 
                difficulty === 'medium' ? 6 + Math.floor(Math.random() * 4) : 
                10 + Math.floor(Math.random() * 6),
      samples: difficulty === 'easy' ? 200 + Math.floor(Math.random() * 300) :
               difficulty === 'medium' ? 500 + Math.floor(Math.random() * 500) :
               1000 + Math.floor(Math.random() * 1000),
      noiseLevel: difficulty === 'easy' ? 0.1 + Math.random() * 0.2 :
                  difficulty === 'medium' ? 0.3 + Math.random() * 0.3 :
                  0.5 + Math.random() * 0.4,
      complexity: difficulty === 'easy' ? 1 :
                  difficulty === 'medium' ? 2 : 3
    };
    
    const dataset = this.generateProblem(config);
    
    return { config, dataset };
  }
  
  private static generateProblemName(type: ProblemConfig['type'], difficulty: ProblemConfig['difficulty']): string {
    const typeNames = {
      'binary_classification': '2値分類',
      'multiclass_classification': '多値分類',
      'regression': '回帰'
    };
    
    const difficultyNames = {
      'easy': '初級',
      'medium': '中級',
      'hard': '上級'
    };
    
    return `${typeNames[type]}問題 - ${difficultyNames[difficulty]}`;
  }
  
  private static generateProblemDescription(type: ProblemConfig['type'], difficulty: ProblemConfig['difficulty']): string {
    const descriptions = {
      'binary_classification': {
        'easy': '2つのクラスを分離する線形分離可能な問題です。基本的な機械学習アルゴリズムで解決できます。',
        'medium': '2つのクラスを分離する非線形な決定境界を持つ問題です。より高度な手法が必要です。',
        'hard': '2つのクラスを分離する非常に複雑な決定境界を持つ問題です。高度な特徴量エンジニアリングとモデル選択が重要です。'
      },
      'multiclass_classification': {
        'easy': '複数のクラスを分類する線形分離可能な問題です。基本的な多クラス分類手法で解決できます。',
        'medium': '複数のクラスを分類する非線形な決定境界を持つ問題です。より高度な手法が必要です。',
        'hard': '複数のクラスを分類する非常に複雑な決定境界を持つ問題です。高度な特徴量エンジニアリングとモデル選択が重要です。'
      },
      'regression': {
        'easy': '連続値を予測する線形関係を持つ問題です。基本的な回帰手法で解決できます。',
        'medium': '連続値を予測する非線形な関係を持つ問題です。より高度な手法が必要です。',
        'hard': '連続値を予測する非常に複雑な関係を持つ問題です。高度な特徴量エンジニアリングとモデル選択が重要です。'
      }
    };
    
    return descriptions[type][difficulty];
  }
}
