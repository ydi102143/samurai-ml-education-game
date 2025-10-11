// バランスの取れた機械学習モデル
// 強力すぎず、適度な難易度を保つ

export interface BalancedModel {
  name: string;
  type: string;
  description: string;
  maxFeatures: number;
  trainingTime: number; // 秒
  expectedAccuracy: number; // 期待される精度
  category: 'linear' | 'tree' | 'ensemble' | 'neural' | 'svm' | 'naive_bayes';
  parameters: {
    [key: string]: {
      type: 'number' | 'select' | 'boolean';
      min?: number;
      max?: number;
      step?: number;
      options?: string[];
      default: any;
      description: string;
    };
  };
}

export const BALANCED_MODELS: BalancedModel[] = [
  // 線形モデル
  {
    name: 'ロジスティック回帰',
    type: 'logistic_regression',
    description: '線形分類器。シンプルで解釈しやすい',
    maxFeatures: 100,
    trainingTime: 2,
    expectedAccuracy: 0.75,
    category: 'linear',
    parameters: {
      C: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '正則化の強さ（小さいほど強い）'
      },
      max_iter: {
        type: 'number',
        min: 100,
        max: 1000,
        step: 50,
        default: 100,
        description: '最大反復回数'
      },
      solver: {
        type: 'select',
        options: ['liblinear', 'lbfgs', 'newton-cg', 'sag', 'saga'],
        default: 'liblinear',
        description: '最適化アルゴリズム'
      }
    }
  },
  {
    name: '線形回帰',
    type: 'linear_regression',
    description: '線形回帰モデル。回帰問題に最適',
    maxFeatures: 100,
    trainingTime: 1,
    expectedAccuracy: 0.70,
    category: 'linear',
    parameters: {
      fit_intercept: {
        type: 'boolean',
        default: true,
        description: '切片を計算するか'
      },
      normalize: {
        type: 'boolean',
        default: false,
        description: '正規化するか'
      }
    }
  },
  {
    name: 'リッジ回帰',
    type: 'ridge_regression',
    description: 'L2正則化付き線形回帰',
    maxFeatures: 100,
    trainingTime: 2,
    expectedAccuracy: 0.72,
    category: 'linear',
    parameters: {
      alpha: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '正則化の強さ'
      },
      solver: {
        type: 'select',
        options: ['auto', 'svd', 'cholesky', 'lsqr', 'sparse_cg', 'sag', 'saga'],
        default: 'auto',
        description: '最適化アルゴリズム'
      }
    }
  },
  {
    name: 'ラッソ回帰',
    type: 'lasso_regression',
    description: 'L1正則化付き線形回帰。特徴選択効果',
    maxFeatures: 50,
    trainingTime: 3,
    expectedAccuracy: 0.73,
    category: 'linear',
    parameters: {
      alpha: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '正則化の強さ'
      },
      max_iter: {
        type: 'number',
        min: 1000,
        max: 10000,
        step: 500,
        default: 1000,
        description: '最大反復回数'
      }
    }
  },

  // 決定木系
  {
    name: '決定木',
    type: 'decision_tree',
    description: '単一の決定木。解釈しやすい',
    maxFeatures: 30,
    trainingTime: 1,
    expectedAccuracy: 0.70,
    category: 'tree',
    parameters: {
      max_depth: {
        type: 'number',
        min: 3,
        max: 20,
        step: 1,
        default: 10,
        description: '木の最大深度'
      },
      min_samples_split: {
        type: 'number',
        min: 2,
        max: 20,
        step: 1,
        default: 5,
        description: '分割に必要な最小サンプル数'
      },
      min_samples_leaf: {
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        default: 2,
        description: '葉に必要な最小サンプル数'
      },
      criterion: {
        type: 'select',
        options: ['gini', 'entropy'],
        default: 'gini',
        description: '分割基準'
      }
    }
  },
  {
    name: 'ランダムフォレスト',
    type: 'random_forest',
    description: 'アンサンブル学習。過学習に強い',
    maxFeatures: 50,
    trainingTime: 5,
    expectedAccuracy: 0.82,
    category: 'ensemble',
    parameters: {
      n_estimators: {
        type: 'number',
        min: 10,
        max: 200,
        step: 10,
        default: 100,
        description: '決定木の数'
      },
      max_depth: {
        type: 'number',
        min: 3,
        max: 20,
        step: 1,
        default: 10,
        description: '木の最大深度'
      },
      min_samples_split: {
        type: 'number',
        min: 2,
        max: 20,
        step: 1,
        default: 5,
        description: '分割に必要な最小サンプル数'
      },
      max_features: {
        type: 'select',
        options: ['sqrt', 'log2', 'auto'],
        default: 'sqrt',
        description: '各分割で考慮する特徴量数'
      }
    }
  },
  {
    name: '勾配ブースティング',
    type: 'gradient_boosting',
    description: '段階的に学習。高い精度が期待できる',
    maxFeatures: 30,
    trainingTime: 8,
    expectedAccuracy: 0.85,
    category: 'ensemble',
    parameters: {
      n_estimators: {
        type: 'number',
        min: 10,
        max: 200,
        step: 10,
        default: 100,
        description: 'ブースティングステージ数'
      },
      learning_rate: {
        type: 'number',
        min: 0.01,
        max: 0.3,
        step: 0.01,
        default: 0.1,
        description: '学習率'
      },
      max_depth: {
        type: 'number',
        min: 3,
        max: 10,
        step: 1,
        default: 6,
        description: '木の最大深度'
      },
      subsample: {
        type: 'number',
        min: 0.5,
        max: 1.0,
        step: 0.1,
        default: 1.0,
        description: 'サンプリング率'
      }
    }
  },
  {
    name: 'XGBoost',
    type: 'xgboost',
    description: '高速な勾配ブースティング。競技で人気',
    maxFeatures: 50,
    trainingTime: 6,
    expectedAccuracy: 0.87,
    category: 'ensemble',
    parameters: {
      n_estimators: {
        type: 'number',
        min: 10,
        max: 200,
        step: 10,
        default: 100,
        description: 'ブースティングラウンド数'
      },
      learning_rate: {
        type: 'number',
        min: 0.01,
        max: 0.3,
        step: 0.01,
        default: 0.1,
        description: '学習率'
      },
      max_depth: {
        type: 'number',
        min: 3,
        max: 10,
        step: 1,
        default: 6,
        description: '木の最大深度'
      },
      subsample: {
        type: 'number',
        min: 0.5,
        max: 1.0,
        step: 0.1,
        default: 1.0,
        description: 'サンプリング率'
      },
      colsample_bytree: {
        type: 'number',
        min: 0.5,
        max: 1.0,
        step: 0.1,
        default: 1.0,
        description: '特徴量サンプリング率'
      }
    }
  },

  // SVM
  {
    name: 'SVM（線形）',
    type: 'svm_linear',
    description: '線形SVM。高次元データに強い',
    maxFeatures: 1000,
    trainingTime: 4,
    expectedAccuracy: 0.78,
    category: 'svm',
    parameters: {
      C: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '正則化パラメータ'
      },
      kernel: {
        type: 'select',
        options: ['linear'],
        default: 'linear',
        description: 'カーネル関数'
      }
    }
  },
  {
    name: 'SVM（RBF）',
    type: 'svm_rbf',
    description: 'RBFカーネルSVM。非線形パターンを学習',
    maxFeatures: 100,
    trainingTime: 6,
    expectedAccuracy: 0.80,
    category: 'svm',
    parameters: {
      C: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '正則化パラメータ'
      },
      gamma: {
        type: 'select',
        options: ['scale', 'auto'],
        default: 'scale',
        description: 'RBFカーネルの係数'
      }
    }
  },

  // ナイーブベイズ
  {
    name: 'ガウシアンNB',
    type: 'gaussian_nb',
    description: 'ガウシアン分布を仮定したナイーブベイズ',
    maxFeatures: 100,
    trainingTime: 1,
    expectedAccuracy: 0.72,
    category: 'naive_bayes',
    parameters: {
      var_smoothing: {
        type: 'number',
        min: 1e-10,
        max: 1e-6,
        step: 1e-11,
        default: 1e-9,
        description: '分散の平滑化パラメータ'
      }
    }
  },
  {
    name: 'マルチノミアルNB',
    type: 'multinomial_nb',
    description: '多項分布を仮定したナイーブベイズ',
    maxFeatures: 100,
    trainingTime: 1,
    expectedAccuracy: 0.70,
    category: 'naive_bayes',
    parameters: {
      alpha: {
        type: 'number',
        min: 0.01,
        max: 10,
        step: 0.01,
        default: 1.0,
        description: '平滑化パラメータ'
      }
    }
  },

  // ニューラルネットワーク
  {
    name: 'ニューラルネットワーク',
    type: 'neural_network',
    description: '多層パーセプトロン。複雑なパターンを学習',
    maxFeatures: 20,
    trainingTime: 10,
    expectedAccuracy: 0.80,
    category: 'neural',
    parameters: {
      hidden_layer_sizes: {
        type: 'select',
        options: ['(50,)', '(100,)', '(50, 50)', '(100, 50)', '(100, 100)', '(200, 100)'],
        default: '(100,)',
        description: '隠れ層のサイズ'
      },
      activation: {
        type: 'select',
        options: ['relu', 'tanh', 'logistic'],
        default: 'relu',
        description: '活性化関数'
      },
      learning_rate: {
        type: 'select',
        options: ['constant', 'invscaling', 'adaptive'],
        default: 'constant',
        description: '学習率スケジュール'
      },
      alpha: {
        type: 'number',
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        default: 0.001,
        description: 'L2正則化パラメータ'
      },
      batch_size: {
        type: 'select',
        options: ['auto', '32', '64', '128', '256'],
        default: 'auto',
        description: 'バッチサイズ'
      }
    }
  }
];

// モデルバランサークラス
export class ModelBalancer {
  static getAvailableModels(featureCount: number): BalancedModel[] {
    return BALANCED_MODELS.filter(model => model.maxFeatures >= featureCount);
  }

  static getModelsByCategory(category: string): BalancedModel[] {
    return BALANCED_MODELS.filter(model => model.category === category);
  }

  static getModelByType(type: string): BalancedModel | undefined {
    return BALANCED_MODELS.find(model => model.type === type);
  }

  static getRecommendedModels(featureCount: number, problemType: 'classification' | 'regression'): BalancedModel[] {
    const availableModels = this.getAvailableModels(featureCount);
    
    // 問題タイプに応じてフィルタリング
    const suitableModels = availableModels.filter(model => {
      if (problemType === 'classification') {
        return !['linear_regression', 'ridge_regression', 'lasso_regression'].includes(model.type);
      } else {
        return !['logistic_regression', 'gaussian_nb', 'multinomial_nb'].includes(model.type);
      }
    });

    // 期待精度でソート
    return suitableModels.sort((a, b) => b.expectedAccuracy - a.expectedAccuracy);
  }
}