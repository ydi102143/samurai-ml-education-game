// データ処理統合システム
import { datasetManager, DatasetVersion, DataOperation, DataSplit, PublicPrivateData } from './datasetManager';

export interface ProcessingResult {
  success: boolean;
  data?: any[];
  featureNames?: string[];
  featureTypes?: ('numerical' | 'categorical')[];
  error?: string;
  operation?: DataOperation;
}

export interface PreprocessingOptions {
  selectedFeatures: number[];
  missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop' | 'forward_fill';
  scalingMethod: 'standard' | 'minmax' | 'robust' | 'none';
  encodingMethod: 'label' | 'onehot' | 'target' | 'none';
  outlierRemoval: boolean;
  outlierThreshold: number;
}

export interface FeatureEngineeringOptions {
  selectedFeatures: number[];
  transformations: {
    polynomial: boolean;
    interaction: boolean;
    log: boolean;
    sqrt: boolean;
    square: boolean;
  };
  aggregations: {
    mean: boolean;
    std: boolean;
    max: boolean;
    min: boolean;
    count: boolean;
  };
  dimensionalityReduction: {
    method: 'pca' | 'lda' | 'tsne' | 'none';
    components: number;
  };
}

export interface DataSplitOptions {
  trainRatio: number;
  validationRatio: number;
  randomSeed: number;
  stratify: boolean;
}

export class DataProcessingSystem {
  private currentDataset: DatasetVersion | null = null;
  private currentSplit: DataSplit | null = null;
  private currentPublicPrivate: PublicPrivateData | null = null;

  constructor() {
    this.currentDataset = datasetManager.getCurrentDataset();
  }

  // データセットを切り替え
  switchDataset(versionId: string): boolean {
    const success = datasetManager.switchDataset(versionId);
    if (success) {
      this.currentDataset = datasetManager.getCurrentDataset();
      this.currentSplit = null;
      this.currentPublicPrivate = null;
    }
    return success;
  }

  // 前処理を実行
  async executePreprocessing(options: PreprocessingOptions): Promise<ProcessingResult> {
    if (!this.currentDataset) {
      return { success: false, error: 'データセットが選択されていません' };
    }

    try {
      let processedData = [...this.currentDataset.data];
      let featureNames = [...this.currentDataset.featureNames];
      let featureTypes = [...this.currentDataset.featureTypes];

      // 欠損値処理
      if (options.missingValueStrategy !== 'none') {
        processedData = this.handleMissingValues(processedData, featureNames, options);
      }

      // 外れ値除去
      if (options.outlierRemoval) {
        processedData = this.removeOutliers(processedData, featureNames, options);
      }

      // スケーリング
      if (options.scalingMethod !== 'none') {
        processedData = this.applyScaling(processedData, featureNames, options);
      }

      // エンコーディング
      if (options.encodingMethod !== 'none') {
        const encodingResult = this.applyEncoding(processedData, featureNames, featureTypes, options);
        processedData = encodingResult.data;
        featureNames = encodingResult.featureNames;
        featureTypes = encodingResult.featureTypes;
      }

      // 操作記録を作成
      const operation: DataOperation = {
        id: `preprocessing-${Date.now()}`,
        type: 'preprocessing',
        name: '前処理',
        parameters: options,
        appliedAt: new Date(),
        description: `欠損値: ${options.missingValueStrategy}, スケーリング: ${options.scalingMethod}, エンコーディング: ${options.encodingMethod}`
      };

      // 新しいバージョンを作成
      const newVersion = datasetManager.createVersion(operation);
      if (newVersion) {
        newVersion.data = processedData;
        newVersion.featureNames = featureNames;
        newVersion.featureTypes = featureTypes;
        this.currentDataset = newVersion;
      }

      return {
        success: true,
        data: processedData,
        featureNames,
        featureTypes,
        operation
      };
    } catch (error) {
      return { success: false, error: `前処理エラー: ${error}` };
    }
  }

  // 特徴量エンジニアリングを実行
  async executeFeatureEngineering(options: FeatureEngineeringOptions): Promise<ProcessingResult> {
    if (!this.currentDataset) {
      return { success: false, error: 'データセットが選択されていません' };
    }

    try {
      let processedData = [...this.currentDataset.data];
      let featureNames = [...this.currentDataset.featureNames];
      let featureTypes = [...this.currentDataset.featureTypes];

      // 特徴量変換
      if (options.transformations.polynomial || options.transformations.interaction) {
        const transformResult = this.applyTransformations(processedData, featureNames, options);
        processedData = transformResult.data;
        featureNames = transformResult.featureNames;
        featureTypes = transformResult.featureTypes;
      }

      // 集約特徴量
      if (Object.values(options.aggregations).some(v => v)) {
        const aggregationResult = this.createAggregatedFeatures(processedData, featureNames, options);
        processedData = aggregationResult.data;
        featureNames = aggregationResult.featureNames;
        featureTypes = aggregationResult.featureTypes;
      }

      // 次元削減
      if (options.dimensionalityReduction.method !== 'none') {
        const reductionResult = this.applyDimensionalityReduction(processedData, featureNames, options);
        processedData = reductionResult.data;
        featureNames = reductionResult.featureNames;
        featureTypes = reductionResult.featureTypes;
      }

      // 操作記録を作成
      const operation: DataOperation = {
        id: `feature_engineering-${Date.now()}`,
        type: 'feature_engineering',
        name: '特徴量エンジニアリング',
        parameters: options,
        appliedAt: new Date(),
        description: `変換: ${Object.keys(options.transformations).filter(k => options.transformations[k as keyof typeof options.transformations]).join(', ')}, 集約: ${Object.keys(options.aggregations).filter(k => options.aggregations[k as keyof typeof options.aggregations]).join(', ')}, 次元削減: ${options.dimensionalityReduction.method}`
      };

      // 新しいバージョンを作成
      const newVersion = datasetManager.createVersion(operation);
      if (newVersion) {
        newVersion.data = processedData;
        newVersion.featureNames = featureNames;
        newVersion.featureTypes = featureTypes;
        this.currentDataset = newVersion;
      }

      return {
        success: true,
        data: processedData,
        featureNames,
        featureTypes,
        operation
      };
    } catch (error) {
      return { success: false, error: `特徴量エンジニアリングエラー: ${error}` };
    }
  }

  // データ分割を実行
  async executeDataSplit(options: DataSplitOptions): Promise<ProcessingResult> {
    if (!this.currentDataset) {
      return { success: false, error: 'データセットが選択されていません' };
    }

    try {
      const split = datasetManager.splitData(
        this.currentDataset.id,
        options.trainRatio,
        options.validationRatio,
        options.randomSeed
      );

      if (!split) {
        return { success: false, error: 'データ分割に失敗しました' };
      }

      this.currentSplit = split;

      // 操作記録を作成
      const operation: DataOperation = {
        id: `data_split-${Date.now()}`,
        type: 'data_split',
        name: 'データ分割',
        parameters: options,
        appliedAt: new Date(),
        description: `訓練: ${options.trainRatio}%, 検証: ${options.validationRatio}%, シード: ${options.randomSeed}`
      };

      return {
        success: true,
        data: split.trainData,
        operation
      };
    } catch (error) {
      return { success: false, error: `データ分割エラー: ${error}` };
    }
  }

  // Public/Privateデータを生成
  async generatePublicPrivateData(publicRatio: number = 0.7): Promise<ProcessingResult> {
    if (!this.currentDataset) {
      return { success: false, error: 'データセットが選択されていません' };
    }

    try {
      const publicPrivate = datasetManager.generatePublicPrivateData(
        this.currentDataset.id,
        publicRatio
      );

      if (!publicPrivate) {
        return { success: false, error: 'Public/Privateデータ生成に失敗しました' };
      }

      this.currentPublicPrivate = publicPrivate;

      return {
        success: true,
        data: publicPrivate.publicData
      };
    } catch (error) {
      return { success: false, error: `Public/Privateデータ生成エラー: ${error}` };
    }
  }

  // 現在のデータセットを取得
  getCurrentDataset(): DatasetVersion | null {
    return this.currentDataset;
  }

  // 現在のデータ分割を取得
  getCurrentSplit(): DataSplit | null {
    return this.currentSplit;
  }

  // 現在のPublic/Privateデータを取得
  getCurrentPublicPrivate(): PublicPrivateData | null {
    return this.currentPublicPrivate;
  }

  // 利用可能なデータセット一覧を取得
  getAvailableDatasets(): DatasetVersion[] {
    return datasetManager.getAvailableDatasets();
  }

  // データ統計を取得
  getDataStatistics(): any {
    if (!this.currentDataset) return null;
    return datasetManager.getDataStatistics(this.currentDataset.id);
  }

  // 欠損値処理
  private handleMissingValues(data: any[], featureNames: string[], options: PreprocessingOptions): any[] {
    const processedData = data.map(row => ({ ...row }));
    
    featureNames.forEach((feature, index) => {
      const values = processedData.map(row => row[feature]).filter(val => val !== null && val !== undefined);
      
      if (values.length === 0) return;

      let fillValue: any;
      switch (options.missingValueStrategy) {
        case 'mean':
          fillValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'median':
          const sorted = values.sort((a, b) => a - b);
          fillValue = sorted[Math.floor(sorted.length / 2)];
          break;
        case 'mode':
          const counts: Record<string, number> = {};
          values.forEach(val => counts[val] = (counts[val] || 0) + 1);
          fillValue = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
          break;
        case 'forward_fill':
          let lastValue = values[0];
          processedData.forEach(row => {
            if (row[feature] === null || row[feature] === undefined) {
              row[feature] = lastValue;
            } else {
              lastValue = row[feature];
            }
          });
          return;
        case 'drop':
          // 欠損値がある行を削除
          return processedData.filter(row => row[feature] !== null && row[feature] !== undefined);
      }

      processedData.forEach(row => {
        if (row[feature] === null || row[feature] === undefined) {
          row[feature] = fillValue;
        }
      });
    });

    return processedData;
  }

  // 外れ値除去
  private removeOutliers(data: any[], featureNames: string[], options: PreprocessingOptions): any[] {
    const processedData = data.map(row => ({ ...row }));
    
    featureNames.forEach(feature => {
      const values = processedData.map(row => row[feature]).filter(val => typeof val === 'number');
      if (values.length === 0) return;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
      const threshold = options.outlierThreshold * std;

      return processedData.filter(row => {
        const value = row[feature];
        return typeof value !== 'number' || Math.abs(value - mean) <= threshold;
      });
    });

    return processedData;
  }

  // スケーリング適用
  private applyScaling(data: any[], featureNames: string[], options: PreprocessingOptions): any[] {
    const processedData = data.map(row => ({ ...row }));
    
    featureNames.forEach(feature => {
      const values = processedData.map(row => row[feature]).filter(val => typeof val === 'number');
      if (values.length === 0) return;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

      processedData.forEach(row => {
        const value = row[feature];
        if (typeof value === 'number') {
          switch (options.scalingMethod) {
            case 'minmax':
              row[feature] = (value - min) / (max - min);
              break;
            case 'standard':
              row[feature] = (value - mean) / std;
              break;
            case 'robust':
              const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
              const mad = values.reduce((sum, val) => sum + Math.abs(val - median), 0) / values.length;
              row[feature] = (value - median) / mad;
              break;
          }
        }
      });
    });

    return processedData;
  }

  // エンコーディング適用
  private applyEncoding(data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[], options: PreprocessingOptions): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureTypes];

    featureNames.forEach((feature, index) => {
      if (featureTypes[index] === 'categorical') {
        const values = processedData.map(row => row[feature]);
        const uniqueValues = [...new Set(values)];

        if (options.encodingMethod === 'label') {
          const labelMap: Record<string, number> = {};
          uniqueValues.forEach((val, i) => labelMap[val] = i);
          
          processedData.forEach(row => {
            row[feature] = labelMap[row[feature]];
          });
          newFeatureTypes[index] = 'numerical';
        } else if (options.encodingMethod === 'onehot') {
          // 元の特徴量を削除
          processedData.forEach(row => delete row[feature]);
          
          // 新しい特徴量を追加
          uniqueValues.forEach(val => {
            const newFeatureName = `${feature}_${val}`;
            newFeatureNames.push(newFeatureName);
            newFeatureTypes.push('numerical');
            
            processedData.forEach(row => {
              row[newFeatureName] = row[feature] === val ? 1 : 0;
            });
          });
          
          // 元の特徴量名を削除
          const featureIndex = newFeatureNames.indexOf(feature);
          newFeatureNames.splice(featureIndex, 1);
          newFeatureTypes.splice(featureIndex, 1);
        }
      }
    });

    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // 特徴量変換適用
  private applyTransformations(data: any[], featureNames: string[], options: FeatureEngineeringOptions): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureNames.map(() => 'numerical' as const)];

    // 多項式特徴量
    if (options.transformations.polynomial) {
      const numericalFeatures = featureNames.filter((_, index) => newFeatureTypes[index] === 'numerical');
      
      numericalFeatures.forEach(feature => {
        const newFeatureName = `${feature}_squared`;
        newFeatureNames.push(newFeatureName);
        newFeatureTypes.push('numerical');
        
        processedData.forEach(row => {
          const value = row[feature];
          if (typeof value === 'number') {
            row[newFeatureName] = value * value;
          }
        });
      });
    }

    // 交互作用項
    if (options.transformations.interaction) {
      const numericalFeatures = featureNames.filter((_, index) => newFeatureTypes[index] === 'numerical');
      
      for (let i = 0; i < numericalFeatures.length; i++) {
        for (let j = i + 1; j < numericalFeatures.length; j++) {
          const feature1 = numericalFeatures[i];
          const feature2 = numericalFeatures[j];
          const newFeatureName = `${feature1}_x_${feature2}`;
          
          newFeatureNames.push(newFeatureName);
          newFeatureTypes.push('numerical');
          
          processedData.forEach(row => {
            const value1 = row[feature1];
            const value2 = row[feature2];
            if (typeof value1 === 'number' && typeof value2 === 'number') {
              row[newFeatureName] = value1 * value2;
            }
          });
        }
      }
    }

    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // 集約特徴量作成
  private createAggregatedFeatures(data: any[], featureNames: string[], options: FeatureEngineeringOptions): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureNames.map(() => 'numerical' as const)];

    const numericalFeatures = featureNames.filter((_, index) => newFeatureTypes[index] === 'numerical');
    
    if (options.aggregations.mean) {
      const newFeatureName = 'mean_features';
      newFeatureNames.push(newFeatureName);
      newFeatureTypes.push('numerical');
      
      processedData.forEach(row => {
        const values = numericalFeatures.map(f => row[f]).filter(v => typeof v === 'number');
        row[newFeatureName] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      });
    }

    if (options.aggregations.std) {
      const newFeatureName = 'std_features';
      newFeatureNames.push(newFeatureName);
      newFeatureTypes.push('numerical');
      
      processedData.forEach(row => {
        const values = numericalFeatures.map(f => row[f]).filter(v => typeof v === 'number');
        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
          row[newFeatureName] = Math.sqrt(variance);
        } else {
          row[newFeatureName] = 0;
        }
      });
    }

    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // 次元削減適用
  private applyDimensionalityReduction(data: any[], featureNames: string[], options: FeatureEngineeringOptions): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureNames.map(() => 'numerical' as const)];

    if (options.dimensionalityReduction.method === 'pca') {
      // 簡易PCA実装
      const numericalFeatures = featureNames.filter((_, index) => newFeatureTypes[index] === 'numerical');
      const components = Math.min(options.dimensionalityReduction.components, numericalFeatures.length);
      
      // 元の特徴量を削除
      numericalFeatures.forEach(feature => {
        processedData.forEach(row => delete row[feature]);
      });
      
      // 新しいPCA特徴量を追加
      for (let i = 0; i < components; i++) {
        const newFeatureName = `pca_component_${i + 1}`;
        newFeatureNames.push(newFeatureName);
        newFeatureTypes.push('numerical');
        
        processedData.forEach((row, index) => {
          // 簡易的なPCA（実際の実装ではより複雑）
          row[newFeatureName] = Math.random() * 2 - 1; // プレースホルダー
        });
      }
    }

    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }
}

// シングルトンインスタンス
export const dataProcessingSystem = new DataProcessingSystem();
