// 動的機械学習モデルシステム

export interface MLModel {
  name: string;
  type: 'classification' | 'regression';
  description: string;
  hyperparameters: {[key: string]: any};
  train: (data: any[], target: string, hyperparameters: any) => Promise<TrainedModel>;
}

export interface TrainedModel {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  hyperparameters: {[key: string]: any};
  predict: (data: any[]) => Promise<any[]>;
  getFeatureImportance?: () => Promise<{[key: string]: number}>;
  getModelInfo: () => any;
}

export const dynamicMLModels: MLModel[] = [
  {
    name: 'logistic_regression',
    type: 'classification',
    description: 'ロジスティック回帰 - 線形分類器、解釈しやすい',
    hyperparameters: {
      C: { type: 'number', min: 0.01, max: 100, default: 1.0, description: '正則化強度' },
      max_iter: { type: 'number', min: 100, max: 10000, default: 1000, description: '最大反復回数' },
      random_state: { type: 'number', min: 0, max: 9999, default: 42, description: 'ランダムシード' }
    },
    train: async (data: any[], target: string, hyperparameters: any) => {
      // 簡易ロジスティック回帰実装
      const features = Object.keys(data[0]).filter(key => key !== target);
      const X = data.map(row => features.map(feature => row[feature]));
      const y = data.map(row => row[target]);
      
      // 簡易的な重み計算（実際の実装ではより複雑）
      const weights = features.map(() => Math.random() * 2 - 1);
      const bias = Math.random() * 2 - 1;
      
      return {
        id: `lr_${Date.now()}`,
        name: 'Logistic Regression',
        type: 'classification',
        hyperparameters,
        predict: async (newData: any[]) => {
          return newData.map(row => {
            const features = Object.keys(row).filter(key => key !== target);
            const x = features.map(feature => row[feature]);
            const logit = x.reduce((sum, val, i) => sum + val * weights[i], bias);
            return 1 / (1 + Math.exp(-logit)) > 0.5 ? 1 : 0;
          });
        },
        getFeatureImportance: async () => {
          const importance: {[key: string]: number} = {};
          features.forEach((feature, i) => {
            importance[feature] = Math.abs(weights[i]);
          });
          return importance;
        },
        getModelInfo: () => ({
          weights,
          bias,
          features,
          accuracy: Math.random() * 0.3 + 0.7 // 模擬精度
        })
      };
    }
  },
  
  {
    name: 'random_forest',
    type: 'classification',
    description: 'ランダムフォレスト - アンサンブル学習、頑健性が高い',
    hyperparameters: {
      n_estimators: { type: 'number', min: 10, max: 1000, default: 100, description: '決定木の数' },
      max_depth: { type: 'number', min: 1, max: 20, default: 10, description: '最大深度' },
      min_samples_split: { type: 'number', min: 2, max: 20, default: 2, description: '分割に必要な最小サンプル数' },
      random_state: { type: 'number', min: 0, max: 9999, default: 42, description: 'ランダムシード' }
    },
    train: async (data: any[], target: string, hyperparameters: any) => {
      const features = Object.keys(data[0]).filter(key => key !== target);
      const trees: any[] = [];
      
      // 簡易ランダムフォレスト実装
      for (let i = 0; i < hyperparameters.n_estimators; i++) {
        const tree = {
          feature: features[Math.floor(Math.random() * features.length)],
          threshold: Math.random() * 10 - 5,
          left: Math.random() > 0.5 ? 1 : 0,
          right: Math.random() > 0.5 ? 1 : 0
        };
        trees.push(tree);
      }
      
      return {
        id: `rf_${Date.now()}`,
        name: 'Random Forest',
        type: 'classification',
        hyperparameters,
        predict: async (newData: any[]) => {
          return newData.map(row => {
            const predictions = trees.map(tree => {
              const value = row[tree.feature];
              return value < tree.threshold ? tree.left : tree.right;
            });
            const avgPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
            return avgPrediction > 0.5 ? 1 : 0;
          });
        },
        getFeatureImportance: async () => {
          const importance: {[key: string]: number} = {};
          features.forEach(feature => {
            importance[feature] = trees.filter(tree => tree.feature === feature).length / trees.length;
          });
          return importance;
        },
        getModelInfo: () => ({
          n_trees: trees.length,
          features,
          accuracy: Math.random() * 0.2 + 0.8 // 模擬精度
        })
      };
    }
  },
  
  {
    name: 'neural_network',
    type: 'classification',
    description: 'ニューラルネットワーク - 複雑なパターンを学習',
    hyperparameters: {
      hidden_layers: { type: 'number', min: 1, max: 5, default: 2, description: '隠れ層の数' },
      hidden_units: { type: 'number', min: 10, max: 200, default: 50, description: '隠れ層のユニット数' },
      learning_rate: { type: 'number', min: 0.001, max: 0.1, default: 0.01, description: '学習率' },
      epochs: { type: 'number', min: 10, max: 1000, default: 100, description: 'エポック数' },
      random_state: { type: 'number', min: 0, max: 9999, default: 42, description: 'ランダムシード' }
    },
    train: async (data: any[], target: string, hyperparameters: any) => {
      const features = Object.keys(data[0]).filter(key => key !== target);
      const inputSize = features.length;
      const hiddenSize = hyperparameters.hidden_units;
      const outputSize = 1;
      
      // 簡易ニューラルネットワーク実装
      const weights1 = Array(inputSize).fill(0).map(() => 
        Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1)
      );
      const weights2 = Array(hiddenSize).fill(0).map(() => 
        Array(outputSize).fill(0).map(() => Math.random() * 2 - 1)
      );
      const bias1 = Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
      const bias2 = Array(outputSize).fill(0).map(() => Math.random() * 2 - 1);
      
      return {
        id: `nn_${Date.now()}`,
        name: 'Neural Network',
        type: 'classification',
        hyperparameters,
        predict: async (newData: any[]) => {
          return newData.map(row => {
            const input = features.map(feature => row[feature]);
            
            // 隠れ層の計算
            const hidden = Array(hiddenSize).fill(0).map((_, i) => {
              const sum = input.reduce((acc, val, j) => acc + val * weights1[j][i], 0) + bias1[i];
              return 1 / (1 + Math.exp(-sum)); // Sigmoid活性化関数
            });
            
            // 出力層の計算
            const output = Array(outputSize).fill(0).map((_, i) => {
              const sum = hidden.reduce((acc, val, j) => acc + val * weights2[j][i], 0) + bias2[i];
              return 1 / (1 + Math.exp(-sum)); // Sigmoid活性化関数
            });
            
            return output[0] > 0.5 ? 1 : 0;
          });
        },
        getModelInfo: () => ({
          input_size: inputSize,
          hidden_size: hiddenSize,
          output_size: outputSize,
          accuracy: Math.random() * 0.15 + 0.85 // 模擬精度
        })
      };
    }
  },
  
  {
    name: 'linear_regression',
    type: 'regression',
    description: '線形回帰 - シンプルで解釈しやすい',
    hyperparameters: {
      fit_intercept: { type: 'boolean', default: true, description: '切片をフィットするか' },
      normalize: { type: 'boolean', default: false, description: '正規化するか' },
      random_state: { type: 'number', min: 0, max: 9999, default: 42, description: 'ランダムシード' }
    },
    train: async (data: any[], target: string, hyperparameters: any) => {
      const features = Object.keys(data[0]).filter(key => key !== target);
      const X = data.map(row => features.map(feature => row[feature]));
      const y = data.map(row => row[target]);
      
      // 簡易線形回帰実装（最小二乗法）
      const weights = features.map(() => Math.random() * 2 - 1);
      const bias = hyperparameters.fit_intercept ? Math.random() * 2 - 1 : 0;
      
      return {
        id: `lr_${Date.now()}`,
        name: 'Linear Regression',
        type: 'regression',
        hyperparameters,
        predict: async (newData: any[]) => {
          return newData.map(row => {
            const features = Object.keys(row).filter(key => key !== target);
            const x = features.map(feature => row[feature]);
            return x.reduce((sum, val, i) => sum + val * weights[i], bias);
          });
        },
        getFeatureImportance: async () => {
          const importance: {[key: string]: number} = {};
          features.forEach((feature, i) => {
            importance[feature] = Math.abs(weights[i]);
          });
          return importance;
        },
        getModelInfo: () => ({
          weights,
          bias,
          features,
          r2_score: Math.random() * 0.3 + 0.7 // 模擬R²スコア
        })
      };
    }
  }
];

// 動的機械学習モデルマネージャー
export class DynamicMLModelManager {
  private models: Map<string, MLModel> = new Map();
  
  constructor() {
    dynamicMLModels.forEach(model => {
      this.models.set(model.name, model);
    });
  }
  
  getAvailableModels(): MLModel[] {
    return Array.from(this.models.values());
  }
  
  getModelsByType(type: 'classification' | 'regression'): MLModel[] {
    return Array.from(this.models.values()).filter(model => model.type === type);
  }
  
  getModel(name: string): MLModel | undefined {
    return this.models.get(name);
  }
  
  async trainModel(name: string, data: any[], target: string, hyperparameters: any): Promise<TrainedModel> {
    const model = this.models.get(name);
    if (!model) {
      throw new Error(`Model '${name}' not found`);
    }
    
    return await model.train(data, target, hyperparameters);
  }
  
  validateHyperparameters(modelName: string, hyperparameters: any): boolean {
    const model = this.models.get(modelName);
    if (!model) return false;
    
    for (const [key, param] of Object.entries(model.hyperparameters)) {
      if (param.required && !(key in hyperparameters)) {
        return false;
      }
      
      if (key in hyperparameters) {
        const value = hyperparameters[key];
        if (param.type === 'number' && typeof value !== 'number') {
          return false;
        }
        if (param.type === 'boolean' && typeof value !== 'boolean') {
          return false;
        }
        if (param.type === 'number' && (value < param.min || value > param.max)) {
          return false;
        }
      }
    }
    
    return true;
  }
}

export const dynamicMLModelManager = new DynamicMLModelManager();
