// 動的前処理システム

export interface PreprocessingStep {
  name: string;
  description: string;
  parameters: {[key: string]: any};
  execute: (data: any[], parameters: any, selectedFeatures: number[]) => Promise<any[]>;
}

export const dynamicPreprocessingSteps: PreprocessingStep[] = [
  {
    name: 'missing_value_handling',
    description: '欠損値処理',
    parameters: {
      strategy: { type: 'select', options: ['mean', 'median', 'mode', 'drop'], default: 'mean' },
      threshold: { type: 'number', min: 0, max: 1, default: 0.5 }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { strategy, threshold } = parameters;
      const processedData = [...data];
      
      if (strategy === 'drop') {
        return processedData.filter(row => {
          return selectedFeatures.every(featureIndex => {
            const featureName = Object.keys(row)[featureIndex];
            return row[featureName] !== null && row[featureName] !== undefined && !isNaN(row[featureName]);
          });
        });
      }
      
      // 数値特徴量の欠損値処理
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        const values = processedData.map(row => row[featureName]).filter(v => v !== null && v !== undefined && !isNaN(v));
        
        if (values.length === 0) return;
        
        let fillValue: number;
        switch (strategy) {
          case 'mean':
            fillValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'median':
            const sorted = values.sort((a, b) => a - b);
            fillValue = sorted[Math.floor(sorted.length / 2)];
            break;
          case 'mode':
            const frequency: {[key: number]: number} = {};
            values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
            fillValue = parseInt(Object.keys(frequency).reduce((a, b) => frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b));
            break;
          default:
            fillValue = 0;
        }
        
        processedData.forEach(row => {
          if (row[featureName] === null || row[featureName] === undefined || isNaN(row[featureName])) {
            row[featureName] = fillValue;
          }
        });
      });
      
      return processedData;
    }
  },
  
  {
    name: 'scaling',
    description: 'スケーリング',
    parameters: {
      method: { type: 'select', options: ['standard', 'minmax', 'robust'], default: 'standard' },
      range: { type: 'range', min: 0, max: 1, default: [0, 1] }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { method, range } = parameters;
      const processedData = [...data];
      
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        const values = processedData.map(row => row[featureName]);
        
        let scaledValues: number[];
        switch (method) {
          case 'standard':
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
            scaledValues = values.map(val => (val - mean) / std);
            break;
          case 'minmax':
            const min = Math.min(...values);
            const max = Math.max(...values);
            scaledValues = values.map(val => (val - min) / (max - min) * (range[1] - range[0]) + range[0]);
            break;
          case 'robust':
            const sorted = values.sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const median = sorted[Math.floor(sorted.length / 2)];
            scaledValues = values.map(val => (val - median) / (q3 - q1));
            break;
          default:
            scaledValues = values;
        }
        
        processedData.forEach((row, index) => {
          row[featureName] = scaledValues[index];
        });
      });
      
      return processedData;
    }
  },
  
  {
    name: 'categorical_encoding',
    description: 'カテゴリカル変数エンコーディング',
    parameters: {
      method: { type: 'select', options: ['label', 'onehot', 'target'], default: 'label' },
      handle_unknown: { type: 'select', options: ['error', 'ignore'], default: 'error' }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { method, handle_unknown } = parameters;
      const processedData = [...data];
      
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        const values = processedData.map(row => row[featureName]);
        
        if (method === 'label') {
          const uniqueValues = [...new Set(values)];
          const labelMap: {[key: string]: number} = {};
          uniqueValues.forEach((val, index) => {
            labelMap[val] = index;
          });
          
          processedData.forEach(row => {
            row[featureName] = labelMap[row[featureName]] || 0;
          });
        } else if (method === 'onehot') {
          const uniqueValues = [...new Set(values)];
          const newFeatures: {[key: string]: number} = {};
          
          uniqueValues.forEach(val => {
            newFeatures[`${featureName}_${val}`] = 0;
          });
          
          processedData.forEach(row => {
            Object.keys(newFeatures).forEach(feature => {
              row[feature] = 0;
            });
            row[`${featureName}_${row[featureName]}`] = 1;
            delete row[featureName];
          });
        } else if (method === 'target') {
          // ターゲットエンコーディング（簡易版）
          const targetValues = processedData.map(row => row.target);
          const targetMap: {[key: string]: number} = {};
          
          uniqueValues.forEach(val => {
            const indices = processedData.map((row, index) => row[featureName] === val ? index : -1).filter(i => i !== -1);
            const targetSum = indices.reduce((sum, i) => sum + targetValues[i], 0);
            targetMap[val] = targetSum / indices.length;
          });
          
          processedData.forEach(row => {
            row[featureName] = targetMap[row[featureName]] || 0;
          });
        }
      });
      
      return processedData;
    }
  },
  
  {
    name: 'outlier_detection',
    description: '外れ値検出・処理',
    parameters: {
      method: { type: 'select', options: ['iqr', 'zscore', 'isolation'], default: 'iqr' },
      threshold: { type: 'number', min: 1, max: 5, default: 3 },
      action: { type: 'select', options: ['remove', 'cap', 'transform'], default: 'remove' }
    },
    execute: async (data: any[], parameters: any, selectedFeatures: number[]) => {
      const { method, threshold, action } = parameters;
      let processedData = [...data];
      
      selectedFeatures.forEach(featureIndex => {
        const featureName = Object.keys(processedData[0])[featureIndex];
        const values = processedData.map(row => row[featureName]);
        
        let outliers: number[] = [];
        
        if (method === 'iqr') {
          const sorted = values.sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;
          
          outliers = values.map((val, index) => (val < lowerBound || val > upperBound) ? index : -1).filter(i => i !== -1);
        } else if (method === 'zscore') {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
          
          outliers = values.map((val, index) => Math.abs((val - mean) / std) > threshold ? index : -1).filter(i => i !== -1);
        }
        
        if (action === 'remove') {
          processedData = processedData.filter((_, index) => !outliers.includes(index));
        } else if (action === 'cap') {
          const sorted = values.sort((a, b) => a - b);
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          
          outliers.forEach(index => {
            if (processedData[index]) {
              const val = processedData[index][featureName];
              processedData[index][featureName] = val < q1 ? q1 : val > q3 ? q3 : val;
            }
          });
        } else if (action === 'transform') {
          outliers.forEach(index => {
            if (processedData[index]) {
              processedData[index][featureName] = Math.log(Math.abs(processedData[index][featureName]) + 1);
            }
          });
        }
      });
      
      return processedData;
    }
  }
];

// 動的前処理マネージャー
export class DynamicPreprocessingManager {
  private steps: Map<string, PreprocessingStep> = new Map();
  
  constructor() {
    dynamicPreprocessingSteps.forEach(step => {
      this.steps.set(step.name, step);
    });
  }
  
  getAvailableSteps(): PreprocessingStep[] {
    return Array.from(this.steps.values());
  }
  
  getStep(name: string): PreprocessingStep | undefined {
    return this.steps.get(name);
  }
  
  async executeStep(name: string, data: any[], parameters: any, selectedFeatures: number[]): Promise<any[]> {
    const step = this.steps.get(name);
    if (!step) {
      throw new Error(`Preprocessing step '${name}' not found`);
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
        if (param.type === 'range' && (!Array.isArray(value) || value.length !== 2)) {
          return false;
        }
      }
    }
    
    return true;
  }
}

export const dynamicPreprocessingManager = new DynamicPreprocessingManager();
