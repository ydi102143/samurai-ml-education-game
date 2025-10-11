// 動的特徴量エンジニアリングシステム

export interface FeatureEngineeringStep {
  name: string;
  description: string;
  category: 'transformation' | 'creation' | 'selection' | 'aggregation' | 'dimensionality';
  parameters: {[key: string]: any};
  execute: (data: any[], parameters: any, selectedFeatures: number[]) => Promise<any[]>;
}

export const dynamicFeatureEngineeringSteps: FeatureEngineeringStep[] = [
  // 特徴量変換
  {
    name: 'log_transformation',
    description: '対数変換',
    category: 'transformation',
    parameters: {
      base: { type: 'select', options: ['e', '10', '2'], default: 'e' },
      offset: { type: 'number', min: 0, max: 10, default: 1 }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { base, offset } = parameters;
      const processedData = [...data];
      
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        processedData.forEach(row => {
          const val = row[featureName] + offset;
          if (val > 0) {
            switch (base) {
              case 'e':
                row[featureName] = Math.log(val);
                break;
              case '10':
                row[featureName] = Math.log10(val);
                break;
              case '2':
                row[featureName] = Math.log2(val);
                break;
            }
          }
        });
      });
      
      return processedData;
    }
  },
  
  {
    name: 'sqrt_transformation',
    description: '平方根変換',
    category: 'transformation',
    parameters: {
      offset: { type: 'number', min: 0, max: 10, default: 0 }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { offset } = parameters;
      const processedData = [...data];
      
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        processedData.forEach(row => {
          const val = row[featureName] + offset;
          if (val >= 0) {
            row[featureName] = Math.sqrt(val);
          }
        });
      });
      
      return processedData;
    }
  },
  
  {
    name: 'polynomial_features',
    description: '多項式特徴量',
    category: 'transformation',
    parameters: {
      degree: { type: 'number', min: 2, max: 5, default: 2 },
      interaction_only: { type: 'boolean', default: false }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { degree, interaction_only } = parameters;
      const processedData = [...data];
      
      if (selectedFeatures.length < 2) return processedData;
      
      const featureNames = Object.keys(processedData[0]);
      const selectedFeatureNames = selectedFeatures.map(i => featureNames[i]);
      
      processedData.forEach(row => {
        for (let i = 0; i < selectedFeatureNames.length; i++) {
          for (let j = i; j < selectedFeatureNames.length; j++) {
            if (i === j && !interaction_only) {
              // 単項式
              for (let d = 2; d <= degree; d++) {
                const newFeatureName = `${selectedFeatureNames[i]}^${d}`;
                row[newFeatureName] = Math.pow(row[selectedFeatureNames[i]], d);
              }
            } else if (i !== j) {
              // 交互作用項
              const newFeatureName = `${selectedFeatureNames[i]}*${selectedFeatureNames[j]}`;
              row[newFeatureName] = row[selectedFeatureNames[i]] * row[selectedFeatureNames[j]];
            }
          }
        }
      });
      
      return processedData;
    }
  },
  
  // 特徴量作成
  {
    name: 'ratio_features',
    description: '比率特徴量',
    category: 'creation',
    parameters: {
      numerator: { type: 'select', options: [], default: '' },
      denominator: { type: 'select', options: [], default: '' }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { numerator, denominator } = parameters;
      const processedData = [...data];
      
      if (!numerator || !denominator) return processedData;
      
      processedData.forEach(row => {
        const ratioValue = row[denominator] !== 0 ? row[numerator] / row[denominator] : 0;
        row[`${numerator}_${denominator}_ratio`] = ratioValue;
      });
      
      return processedData;
    }
  },
  
  {
    name: 'difference_features',
    description: '差分特徴量',
    category: 'creation',
    parameters: {
      feature1: { type: 'select', options: [], default: '' },
      feature2: { type: 'select', options: [], default: '' }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { feature1, feature2 } = parameters;
      const processedData = [...data];
      
      if (!feature1 || !feature2) return processedData;
      
      processedData.forEach(row => {
        row[`${feature1}_${feature2}_diff`] = row[feature1] - row[feature2];
      });
      
      return processedData;
    }
  },
  
  {
    name: 'interaction_features',
    description: '交互作用特徴量',
    category: 'creation',
    parameters: {
      features: { type: 'multiselect', options: [], default: [] }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { features } = parameters;
      const processedData = [...data];
      
      if (features.length < 2) return processedData;
      
      processedData.forEach(row => {
        const interactionValue = features.reduce((acc: number, feature: string) => acc * row[feature], 1);
        row[`${features.join('_')}_interaction`] = interactionValue;
      });
      
      return processedData;
    }
  },
  
  // 集約特徴量
  {
    name: 'statistical_aggregation',
    description: '統計的集約特徴量',
    category: 'aggregation',
    parameters: {
      group_by: { type: 'select', options: [], default: '' },
      functions: { type: 'multiselect', options: ['mean', 'std', 'min', 'max', 'count'], default: ['mean'] }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { group_by, functions } = parameters;
      const processedData = [...data];
      
      if (!group_by || functions.length === 0) return processedData;
      
      const groups: {[key: string]: any[]} = {};
      processedData.forEach(row => {
        const groupKey = row[group_by];
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(row);
      });
      
      const groupStats: {[key: string]: any} = {};
      Object.keys(groups).forEach(groupKey => {
        const groupData = groups[groupKey];
        const stats: {[key: string]: number} = {};
        
        selectedFeatures.forEach(featureIndex => {
          const featureName = Object.keys(processedData[0])[featureIndex];
          const values = groupData.map(row => row[featureName]);
          
          functions.forEach(func => {
            let value: number;
            switch (func) {
              case 'mean':
                value = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'std':
                const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                value = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
                break;
              case 'min':
                value = Math.min(...values);
                break;
              case 'max':
                value = Math.max(...values);
                break;
              case 'count':
                value = values.length;
                break;
              default:
                value = 0;
            }
            stats[`${featureName}_${func}`] = value;
          });
        });
        
        groupStats[groupKey] = stats;
      });
      
      processedData.forEach(row => {
        const groupKey = row[group_by];
        const stats = groupStats[groupKey] || {};
        Object.assign(row, stats);
      });
      
      return processedData;
    }
  },
  
  // 次元削減
  {
    name: 'pca',
    description: '主成分分析',
    category: 'dimensionality',
    parameters: {
      n_components: { type: 'number', min: 1, max: 10, default: 2 },
      explained_variance_threshold: { type: 'number', min: 0.5, max: 1.0, default: 0.95 }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { n_components, explained_variance_threshold } = parameters;
      const processedData = [...data];
      
      if (selectedFeatures.length < 2) return processedData;
      
      // 簡易PCA実装
      const featureNames = Object.keys(processedData[0]);
      const selectedFeatureNames = selectedFeatures.map(i => featureNames[i]);
      
      // データの標準化
      const standardizedData = processedData.map(row => {
        const standardizedRow = {...row};
        selectedFeatureNames.forEach(featureName => {
          const values = processedData.map(r => r[featureName]);
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
          standardizedRow[featureName] = (row[featureName] - mean) / std;
        });
        return standardizedRow;
      });
      
      // 共分散行列の計算（簡易版）
      const n = standardizedData.length;
      const p = selectedFeatureNames.length;
      const covarianceMatrix: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
      
      for (let i = 0; i < p; i++) {
        for (let j = 0; j < p; j++) {
          let sum = 0;
          standardizedData.forEach(row => {
            sum += row[selectedFeatureNames[i]] * row[selectedFeatureNames[j]];
          });
          covarianceMatrix[i][j] = sum / (n - 1);
        }
      }
      
      // 主成分の計算（簡易版）
      for (let i = 0; i < Math.min(n_components, p); i++) {
        const componentName = `PC${i + 1}`;
        processedData.forEach((row, index) => {
          let componentValue = 0;
          selectedFeatureNames.forEach((featureName, j) => {
            componentValue += standardizedData[index][featureName] * (i + 1) / p; // 簡易的な重み
          });
          row[componentName] = componentValue;
        });
      }
      
      return processedData;
    }
  }
];

// 動的特徴量エンジニアリングマネージャー
export class DynamicFeatureEngineeringManager {
  private steps: Map<string, FeatureEngineeringStep> = new Map();
  
  constructor() {
    dynamicFeatureEngineeringSteps.forEach(step => {
      this.steps.set(step.name, step);
    });
  }
  
  getAvailableSteps(): FeatureEngineeringStep[] {
    return Array.from(this.steps.values());
  }
  
  getStepsByCategory(category: string): FeatureEngineeringStep[] {
    return Array.from(this.steps.values()).filter(step => step.category === category);
  }
  
  getStep(name: string): FeatureEngineeringStep | undefined {
    return this.steps.get(name);
  }
  
  async executeStep(name: string, data: any[], parameters: any, selectedFeatures: number[]): Promise<any[]> {
    const step = this.steps.get(name);
    if (!step) {
      throw new Error(`Feature engineering step '${name}' not found`);
    }
    
    return await step.execute(data, parameters, selectedFeatures);
  }
  
  validateParameters(stepName: string, parameters: any): boolean {
    const step = this.steps.get(stepName);
    if (!step) return false;
    
    for (const [key, param] of Object.entries(step.parameters)) {
      if (param.required && !(key in parameters)) {
        return false;
      }
      
      if (key in parameters) {
        const value = parameters[key];
        if (param.type === 'number' && typeof value !== 'number') {
          return false;
        }
        if (param.type === 'select' && !param.options.includes(value)) {
          return false;
        }
        if (param.type === 'multiselect' && (!Array.isArray(value) || !value.every(v => param.options.includes(v)))) {
          return false;
        }
        if (param.type === 'boolean' && typeof value !== 'boolean') {
          return false;
        }
      }
    }
    
    return true;
  }
}

export const dynamicFeatureEngineeringManager = new DynamicFeatureEngineeringManager();
