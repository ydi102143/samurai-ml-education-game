// 実際のデータ処理システム

export interface ProcessedData {
  data: Array<{ features: (number | string)[], label: number }>;
  featureNames: string[];
  featureTypes: ('numerical' | 'categorical')[];
  processingHistory: string[];
  version: number;
  timestamp: Date;
}

export interface RealProcessingResult {
  success: boolean;
  data?: any[];
  featureNames?: string[];
  featureTypes?: ('numerical' | 'categorical')[];
  error?: string;
  processingSteps: string[];
  processedData?: ProcessedData;
}

export interface PreprocessingOptions {
  selectedFeatures: number[];
  missingValueStrategy: 'mean' | 'median' | 'mode' | 'drop' | 'forward_fill';
  scalingMethod: 'standard' | 'minmax' | 'robust' | 'none';
  encodingMethod: 'label' | 'onehot' | 'target' | 'none';
  outlierRemoval: boolean;
  outlierThreshold: number;
  categoricalEncoding: {
    method: 'label' | 'onehot' | 'target';
    targetColumn?: number; // ターゲットエンコーディング用
  };
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

export class RealDataProcessor {
  private processingSteps: string[] = [];
  private currentProcessedData: ProcessedData | null = null;
  private dataVersion: number = 0;

  // 現在の処理済みデータを取得
  getCurrentProcessedData(): ProcessedData | null {
    return this.currentProcessedData;
  }

  // 処理済みデータを設定
  setProcessedData(processedData: ProcessedData): void {
    this.currentProcessedData = processedData;
    this.dataVersion = processedData.version;
  }

  // データバージョンを取得
  getDataVersion(): number {
    return this.dataVersion;
  }

  // データの前処理を実行
  async executePreprocessing(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    options: PreprocessingOptions
  ): Promise<RealProcessingResult> {
    this.processingSteps = [];
    
    try {
      console.log('Starting real preprocessing...');
      let processedData = [...data];
      let processedFeatureNames = [...featureNames];
      let processedFeatureTypes = [...featureTypes];

      // 1. 欠損値処理
      processedData = this.handleMissingValues(processedData, options.missingValueStrategy);
      this.processingSteps.push(`欠損値処理: ${options.missingValueStrategy}`);

      // 2. 特徴量選択
      if (options.selectedFeatures.length > 0) {
        processedData = this.selectFeatures(processedData, options.selectedFeatures);
        processedFeatureNames = options.selectedFeatures.map(i => featureNames[i]);
        processedFeatureTypes = options.selectedFeatures.map(i => featureTypes[i]);
        this.processingSteps.push(`特徴量選択: ${options.selectedFeatures.length}個の特徴量を選択`);
      }

      // 3. カテゴリカル変数のエンコーディング
      if (options.categoricalEncoding.method === 'label' || options.categoricalEncoding.method === 'onehot' || options.categoricalEncoding.method === 'target') {
        const encodingResult = this.encodeCategoricalFeatures(
          processedData, 
          processedFeatureNames, 
          processedFeatureTypes, 
          options.categoricalEncoding.method,
          options.categoricalEncoding.targetColumn
        );
        processedData = encodingResult.data;
        processedFeatureNames = encodingResult.featureNames;
        processedFeatureTypes = encodingResult.featureTypes;
        this.processingSteps.push(`カテゴリカル変数エンコーディング: ${options.categoricalEncoding.method}`);
      }

      // 4. 外れ値除去
      if (options.outlierRemoval) {
        processedData = this.removeOutliers(processedData, options.outlierThreshold);
        this.processingSteps.push(`外れ値除去: 閾値 ${options.outlierThreshold}`);
      }

      // 5. スケーリング
      if (options.scalingMethod !== 'none') {
        processedData = this.scaleFeatures(processedData, options.scalingMethod);
        this.processingSteps.push(`スケーリング: ${options.scalingMethod}`);
      }

      console.log('Real preprocessing completed');
      
      // ProcessedDataを作成して保存
      const processedDataObj: ProcessedData = {
        data: processedData,
        featureNames: processedFeatureNames,
        featureTypes: processedFeatureTypes,
        processingHistory: [...this.processingSteps],
        version: this.dataVersion + 1,
        timestamp: new Date()
      };
      
      this.setProcessedData(processedDataObj);
      
      return {
        success: true,
        data: processedData,
        featureNames: processedFeatureNames,
        featureTypes: processedFeatureTypes,
        processingSteps: this.processingSteps,
        processedData: processedDataObj
      };
    } catch (error) {
      console.error('Preprocessing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingSteps: this.processingSteps
      };
    }
  }

  // 特徴量エンジニアリングを実行
  async executeFeatureEngineering(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    options: FeatureEngineeringOptions
  ): Promise<RealProcessingResult> {
    this.processingSteps = [];
    
    try {
      console.log('Starting real feature engineering...');
      let processedData = [...data];
      let processedFeatureNames = [...featureNames];
      let processedFeatureTypes = [...featureTypes];

      // 1. 特徴量変換
      if (options.transformations.polynomial || options.transformations.interaction || 
          options.transformations.log || options.transformations.sqrt || options.transformations.square) {
        const transformationResult = this.applyTransformations(
          processedData, 
          processedFeatureNames, 
          processedFeatureTypes, 
          options.transformations
        );
        processedData = transformationResult.data;
        processedFeatureNames = transformationResult.featureNames;
        processedFeatureTypes = transformationResult.featureTypes;
        this.processingSteps.push('特徴量変換を適用');
      }

      // 2. 集約特徴量
      if (options.aggregations.mean || options.aggregations.std || 
          options.aggregations.max || options.aggregations.min || options.aggregations.count) {
        const aggregationResult = this.createAggregationFeatures(
          processedData, 
          processedFeatureNames, 
          processedFeatureTypes, 
          options.aggregations
        );
        processedData = aggregationResult.data;
        processedFeatureNames = aggregationResult.featureNames;
        processedFeatureTypes = aggregationResult.featureTypes;
        this.processingSteps.push('集約特徴量を作成');
      }

      // 3. 次元削減
      if (options.dimensionalityReduction.method !== 'none') {
        const reductionResult = this.applyDimensionalityReduction(
          processedData, 
          processedFeatureNames, 
          processedFeatureTypes, 
          options.dimensionalityReduction
        );
        processedData = reductionResult.data;
        processedFeatureNames = reductionResult.featureNames;
        processedFeatureTypes = reductionResult.featureTypes;
        this.processingSteps.push(`次元削減: ${options.dimensionalityReduction.method}`);
      }

      console.log('Real feature engineering completed');
      
      // ProcessedDataを作成して保存
      const processedDataObj: ProcessedData = {
        data: processedData,
        featureNames: processedFeatureNames,
        featureTypes: processedFeatureTypes,
        processingHistory: [...this.processingSteps],
        version: this.dataVersion + 1,
        timestamp: new Date()
      };
      
      this.setProcessedData(processedDataObj);
      
      return {
        success: true,
        data: processedData,
        featureNames: processedFeatureNames,
        featureTypes: processedFeatureTypes,
        processingSteps: this.processingSteps,
        processedData: processedDataObj
      };
    } catch (error) {
      console.error('Feature engineering failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingSteps: this.processingSteps
      };
    }
  }

  // 欠損値処理
  private handleMissingValues(data: any[], strategy: string): any[] {
    if (data.length === 0) return data;

    const processedData = data.map(row => ({ ...row }));
    
    // 各特徴量に対して欠損値処理を適用
    const featureCount = data[0].features.length;
    
    for (let i = 0; i < featureCount; i++) {
      const values = data.map(row => row.features[i]).filter(val => val !== null && val !== undefined && !isNaN(val));
      
      if (values.length === 0) continue;
      
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
          const frequency: { [key: number]: number } = {};
          values.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
          fillValue = parseInt(Object.keys(frequency).reduce((a, b) => frequency[parseInt(a)] > frequency[parseInt(b)] ? a : b));
          break;
        case 'forward_fill':
          let lastValue = values[0];
          processedData.forEach(row => {
            if (row.features[i] === null || row.features[i] === undefined || isNaN(row.features[i])) {
              row.features[i] = lastValue;
            } else {
              lastValue = row.features[i];
            }
          });
          continue;
        case 'drop':
        default:
          // 欠損値がある行を削除
          return data.filter(row => 
            row.features[i] !== null && row.features[i] !== undefined && !isNaN(row.features[i])
          );
      }
      
      // 欠損値を埋める
      processedData.forEach(row => {
        if (row.features[i] === null || row.features[i] === undefined || isNaN(row.features[i])) {
          row.features[i] = fillValue;
        }
      });
    }
    
    return processedData;
  }

  // 特徴量選択
  private selectFeatures(data: any[], selectedIndices: number[]): any[] {
    return data.map(row => ({
      ...row,
      features: selectedIndices.map(i => row.features[i])
    }));
  }

  // カテゴリカル変数のエンコーディング

  // 外れ値除去
  private removeOutliers(data: any[], threshold: number): any[] {
    if (data.length === 0) return data;
    
    const featureCount = data[0].features.length;
    const processedData = [];
    
    for (const row of data) {
      let isOutlier = false;
      
      for (let i = 0; i < featureCount; i++) {
        const values = data.map(r => r.features[i]).filter(val => !isNaN(val));
        if (values.length === 0) continue;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        
        if (Math.abs(row.features[i] - mean) > threshold * std) {
          isOutlier = true;
          break;
        }
      }
      
      if (!isOutlier) {
        processedData.push(row);
      }
    }
    
    return processedData;
  }

  // スケーリング
  private scaleFeatures(data: any[], method: string): any[] {
    if (data.length === 0) return data;
    
    const featureCount = data[0].features.length;
    const processedData = data.map(row => ({ ...row, features: [...row.features] }));
    
    for (let i = 0; i < featureCount; i++) {
      const values = data.map(row => row.features[i]).filter(val => !isNaN(val));
      if (values.length === 0) continue;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      processedData.forEach(row => {
        if (method === 'minmax') {
          row.features[i] = (row.features[i] - min) / (max - min);
        } else if (method === 'standard') {
          row.features[i] = (row.features[i] - mean) / (std + 1e-8);
        } else if (method === 'robust') {
          const q1 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)];
          const q3 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)];
          row.features[i] = (row.features[i] - q1) / (q3 - q1 + 1e-8);
        }
      });
    }
    
    return processedData;
  }

  // 特徴量変換
  private applyTransformations(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    transformations: any
  ): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row, features: [...row.features] }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureTypes];
    
    const numericalIndices = featureTypes.map((type, index) => type === 'numerical' ? index : -1).filter(i => i !== -1);
    
    if (transformations.polynomial) {
      // 多項式特徴量
      for (let i = 0; i < numericalIndices.length; i++) {
        const idx = numericalIndices[i];
        const newFeature = processedData.map(row => Math.pow(row.features[idx], 2));
        processedData.forEach((row, index) => {
          row.features.push(newFeature[index]);
        });
        newFeatureNames.push(`${featureNames[idx]}^2`);
        newFeatureTypes.push('numerical');
      }
    }
    
    if (transformations.log) {
      // 対数変換
      for (let i = 0; i < numericalIndices.length; i++) {
        const idx = numericalIndices[i];
        const newFeature = processedData.map(row => Math.log(Math.abs(row.features[idx]) + 1));
        processedData.forEach((row, index) => {
          row.features.push(newFeature[index]);
        });
        newFeatureNames.push(`log(${featureNames[idx]})`);
        newFeatureTypes.push('numerical');
      }
    }
    
    if (transformations.sqrt) {
      // 平方根変換
      for (let i = 0; i < numericalIndices.length; i++) {
        const idx = numericalIndices[i];
        const newFeature = processedData.map(row => Math.sqrt(Math.abs(row.features[idx])));
        processedData.forEach((row, index) => {
          row.features.push(newFeature[index]);
        });
        newFeatureNames.push(`sqrt(${featureNames[idx]})`);
        newFeatureTypes.push('numerical');
      }
    }
    
    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // 集約特徴量
  private createAggregationFeatures(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    aggregations: any
  ): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const processedData = data.map(row => ({ ...row, features: [...row.features] }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureTypes];
    
    const numericalIndices = featureTypes.map((type, index) => type === 'numerical' ? index : -1).filter(i => i !== -1);
    
    if (numericalIndices.length > 0) {
      const numericalValues = numericalIndices.map(idx => data.map(row => row.features[idx]));
      
      if (aggregations.mean) {
        const meanFeature = numericalValues.map(values => 
          values.reduce((sum, val) => sum + val, 0) / values.length
        );
        processedData.forEach((row, index) => {
          row.features.push(meanFeature[index]);
        });
        newFeatureNames.push('mean_features');
        newFeatureTypes.push('numerical');
      }
      
      if (aggregations.std) {
        const stdFeature = numericalValues.map(values => {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          return Math.sqrt(variance);
        });
        processedData.forEach((row, index) => {
          row.features.push(stdFeature[index]);
        });
        newFeatureNames.push('std_features');
        newFeatureTypes.push('numerical');
      }
    }
    
    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // 次元削減
  private applyDimensionalityReduction(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    options: any
  ): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    if (options.method === 'pca') {
      return this.applyPCA(data, featureNames, featureTypes, options.components);
    }
    
    return { data, featureNames, featureTypes };
  }

  // PCA実装（簡易版）
  private applyPCA(
    data: any[],
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    components: number
  ): { data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const numericalIndices = featureTypes.map((type, index) => type === 'numerical' ? index : -1).filter(i => i !== -1);
    
    if (numericalIndices.length === 0) {
      return { data, featureNames, featureTypes };
    }
    
    // 数値特徴量のみを抽出
    const numericalData = data.map(row => 
      numericalIndices.map(idx => row.features[idx])
    );
    
    // 簡易PCA（最初の数成分をそのまま使用）
    const selectedComponents = Math.min(components, numericalIndices.length);
    const pcaFeatures = numericalData.map(row => row.slice(0, selectedComponents));
    
    // 結果を元のデータ構造に変換
    const processedData = data.map((row, index) => ({
      ...row,
      features: [
        ...row.features.slice(0, numericalIndices[0]),
        ...pcaFeatures[index],
        ...row.features.slice(numericalIndices[numericalIndices.length - 1] + 1)
      ]
    }));
    
    const newFeatureNames = [
      ...featureNames.slice(0, numericalIndices[0]),
      ...Array.from({ length: selectedComponents }, (_, i) => `PC${i + 1}`),
      ...featureNames.slice(numericalIndices[numericalIndices.length - 1] + 1)
    ];
    
    const newFeatureTypes = [
      ...featureTypes.slice(0, numericalIndices[0]),
      ...new Array(selectedComponents).fill('numerical'),
      ...featureTypes.slice(numericalIndices[numericalIndices.length - 1] + 1)
    ];
    
    return { data: processedData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

  // カテゴリカル変数のエンコーディング
  private encodeCategoricalFeatures(
    data: Array<{ features: (number | string)[], label: number }>,
    featureNames: string[],
    featureTypes: ('numerical' | 'categorical')[],
    method: 'label' | 'onehot' | 'target',
    targetColumn?: number
  ): { data: Array<{ features: number[], label: number }>, featureNames: string[], featureTypes: ('numerical' | 'categorical')[] } {
    const categoricalIndices = featureTypes
      .map((type, index) => type === 'categorical' ? index : -1)
      .filter(index => index !== -1);

    if (categoricalIndices.length === 0) {
      // カテゴリカル変数がない場合は数値に変換して返す
      const processedData = data.map(row => ({
        ...row,
        features: row.features.map(f => typeof f === 'string' ? 0 : f) as number[]
      }));
      return { data: processedData, featureNames, featureTypes };
    }

    let processedData = data.map(row => ({ ...row, features: [...row.features] }));
    let newFeatureNames = [...featureNames];
    let newFeatureTypes = [...featureTypes];

    for (const catIndex of categoricalIndices) {
      const uniqueValues = [...new Set(data.map(row => row.features[catIndex]).filter(v => v !== null && v !== undefined && !isNaN(v as number)))];
      
      if (method === 'label') {
        // ラベルエンコーディング
        const valueMap = new Map(uniqueValues.map((value, index) => [value, index]));
        processedData = processedData.map(row => {
          const newFeatures = [...row.features];
          newFeatures[catIndex] = valueMap.get(row.features[catIndex]) || 0;
          return { ...row, features: newFeatures };
        });
        newFeatureTypes[catIndex] = 'numerical';
      } else if (method === 'onehot') {
        // ワンホットエンコーディング
        processedData = processedData.map(row => {
          const newFeatures = [...row.features];
          const oneHotVector = new Array(uniqueValues.length).fill(0);
          const valueIndex = uniqueValues.indexOf(row.features[catIndex]);
          if (valueIndex !== -1) {
            oneHotVector[valueIndex] = 1;
          }
          
          // カテゴリカル変数を削除してワンホットベクトルを挿入
          newFeatures.splice(catIndex, 1, ...oneHotVector);
          return { ...row, features: newFeatures };
        });
        
        // 特徴量名とタイプを更新
        newFeatureNames.splice(catIndex, 1, ...uniqueValues.map(value => `${featureNames[catIndex]}_${value}`));
        newFeatureTypes.splice(catIndex, 1, ...new Array(uniqueValues.length).fill('numerical'));
      } else if (method === 'target' && targetColumn !== undefined) {
        // ターゲットエンコーディング
        const valueTargetMap = new Map<string, number[]>();
        
        // 各カテゴリカル値のターゲット平均を計算
        uniqueValues.forEach(value => {
          const targetValuesForValue = data
            .filter(row => row.features[catIndex] === value)
            .map(row => row.label);
          valueTargetMap.set(value as string, targetValuesForValue);
        });
        
        processedData = processedData.map(row => {
          const newFeatures = [...row.features];
          const targetValuesForValue = valueTargetMap.get(row.features[catIndex] as string) || [0];
          const targetMean = targetValuesForValue.reduce((sum, val) => sum + val, 0) / targetValuesForValue.length;
          newFeatures[catIndex] = targetMean;
          return { ...row, features: newFeatures };
        });
        newFeatureTypes[catIndex] = 'numerical';
      }
    }

    // 最終的にすべて数値に変換
    const finalData = processedData.map(row => ({
      ...row,
      features: row.features.map(f => typeof f === 'string' ? 0 : f) as number[]
    }));

    return { data: finalData, featureNames: newFeatureNames, featureTypes: newFeatureTypes };
  }

}

// シングルトンインスタンス
export const realDataProcessor = new RealDataProcessor();


