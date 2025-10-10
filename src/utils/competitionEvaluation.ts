import type { CompetitionDataset, ModelEvaluation, CompetitionSubmission, DataSplitOptions, EvaluationOptions } from '../types/competition';
import { createStableModel } from './stableMLModels';
//  // 安定版MLモデルでは不要

export class CompetitionEvaluator {
  /**
   * データを学習・検証・テストセットに分割
   */
  static splitData(
    data: any[],
    options: DataSplitOptions
  ): { train: any[]; validation: any[]; test: any[] } {
    const { trainRatio, validationRatio, testRatio, randomSeed, stratified } = options;
    
    // 比率の合計が1.0になることを確認
    const totalRatio = trainRatio + validationRatio + testRatio;
    if (Math.abs(totalRatio - 1.0) > 0.001) {
      throw new Error('データ分割比率の合計が1.0になる必要があります');
    }

    // ランダムシードを設定（簡易実装）
    if (randomSeed !== undefined) {
      // シード値に基づいてランダム関数を初期化
      const seed = randomSeed;
      Math.random = () => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
    }

    // データをシャッフル
    const shuffledData = [...data].sort(() => Math.random() - 0.5);

    // 層化サンプリング（分類問題の場合）
    if (stratified && data.length > 0 && typeof data[0].label === 'string') {
      return this.stratifiedSplit(shuffledData, trainRatio, validationRatio, testRatio);
    }

    // 通常の分割
    const totalSize = shuffledData.length;
    const trainSize = Math.floor(totalSize * trainRatio);
    const validationSize = Math.floor(totalSize * validationRatio);
    // const testSize = totalSize - trainSize - validationSize; // 未使用のためコメントアウト

    return {
      train: shuffledData.slice(0, trainSize),
      validation: shuffledData.slice(trainSize, trainSize + validationSize),
      test: shuffledData.slice(trainSize + validationSize)
    };
  }

  /**
   * 層化サンプリングによるデータ分割
   */
  private static stratifiedSplit(
    data: any[],
    trainRatio: number,
    validationRatio: number,
    _testRatio: number // 未使用のためプレフィックスを追加
  ): { train: any[]; validation: any[]; test: any[] } {
    // ラベルごとにデータをグループ化
    const labelGroups = new Map<string, any[]>();
    data.forEach(point => {
      const label = point.label.toString();
      if (!labelGroups.has(label)) {
        labelGroups.set(label, []);
      }
      labelGroups.get(label)!.push(point);
    });

    const train: any[] = [];
    const validation: any[] = [];
    const test: any[] = [];

    // 各ラベルグループに対して分割を実行
    labelGroups.forEach(groupData => {
      const groupSize = groupData.length;
      const groupTrainSize = Math.floor(groupSize * trainRatio);
      const groupValidationSize = Math.floor(groupSize * validationRatio);
      // const groupTestSize = groupSize - groupTrainSize - groupValidationSize; // 未使用のためコメントアウト

      // グループ内でシャッフル
      const shuffledGroup = groupData.sort(() => Math.random() - 0.5);

      train.push(...shuffledGroup.slice(0, groupTrainSize));
      validation.push(...shuffledGroup.slice(groupTrainSize, groupTrainSize + groupValidationSize));
      test.push(...shuffledGroup.slice(groupTrainSize + groupValidationSize));
    });

    return { train, validation, test };
  }

  /**
   * モデルを評価（プレイヤー用）
   * 注意: 現在の実装では学習と評価が一緒になっています。
   * 本来は学習済みモデルを受け取って評価のみを行うべきです。
   */
  static async evaluatePlayerModel(
    dataset: CompetitionDataset,
    selectedFeatures: number[],
    modelType: string,
    parameters: Record<string, any>,
    _preprocessing: {
      method: 'none' | 'normalize' | 'standardize' | 'encode';
      encodedFeatures?: number[];
    },
    evaluationOptions?: EvaluationOptions
  ): Promise<ModelEvaluation> {
    try {
      // 安定版MLモデルを使用（TensorFlow.js不要）
      console.log('安定版機械学習モデルを使用中...');

      // デフォルトの評価オプションを設定
      const options = evaluationOptions || {
        metrics: [dataset.defaultMetric],
        dataSplit: {
          trainRatio: 0.7,
          validationRatio: 0.2,
          testRatio: 0.1,
          randomSeed: 42,
          stratified: dataset.problemType === 'classification'
        }
      };

      // データセットを安定版MLモデル用に変換
      const playerDataset = {
        train: dataset.train.map(point => ({
          features: selectedFeatures.map(i => point.features[i]),
          label: point.label
        })),
        test: dataset.test.map(point => ({
          features: selectedFeatures.map(i => point.features[i]),
          label: point.label
        })),
        featureNames: selectedFeatures.map(i => dataset.featureNames[i]),
        labelName: dataset.labelName,
        classes: dataset.classes
      };

      const startTime = Date.now();
      
      // モデルを学習
      const model = createStableModel(modelType);
      
      // 学習を実行（進捗表示なし）
      await model.train(playerDataset.train, parameters);
      
      const trainingTime = Date.now() - startTime;
      
      // 評価を実行
      console.log('モデル評価を開始しています...');
      console.log('テストデータ数:', playerDataset.test.length);
      console.log('テストデータサンプル:', playerDataset.test.slice(0, 2));
      const result = model.evaluate(playerDataset.test);
      console.log('評価結果:', result);
      console.log('評価が完了しました');
      
      // 選択された評価指標でスコアを計算
      const selectedMetrics = options.metrics;
      const primaryMetric = selectedMetrics[0] || dataset.defaultMetric;
      const validationScore = this.calculateScore(result, primaryMetric);
      
      // 選択された評価指標のみを含むメトリクス
      const selectedMetricsResult: Record<string, number> = {};
      selectedMetrics.forEach(metric => {
        switch (metric) {
          case 'accuracy':
            selectedMetricsResult.accuracy = result.accuracy || 0;
            break;
          case 'precision':
            selectedMetricsResult.precision = result.precision || 0;
            break;
          case 'recall':
            selectedMetricsResult.recall = result.recall || 0;
            break;
          case 'f1_score':
            selectedMetricsResult.f1_score = result.f1_score || 0;
            break;
          case 'mae':
            selectedMetricsResult.mae = result.accuracy || 0; // 安定版MLモデルではaccuracyを使用
            break;
          case 'mse':
            selectedMetricsResult.mse = result.accuracy || 0; // 安定版MLモデルではaccuracyを使用
            break;
          case 'rmse':
            selectedMetricsResult.rmse = result.accuracy || 0; // 安定版MLモデルではaccuracyを使用
            break;
        }
      });

      return {
        validationScore,
        testScore: 0, // プレイヤーは見れない
        metrics: selectedMetricsResult,
        predictions: result.predictions.map(p => typeof p === 'string' ? parseFloat(p) : p),
        actual: result.actual.map(a => typeof a === 'string' ? parseFloat(a) : a),
        probabilities: undefined, // 安定版MLモデルでは未実装
        featureImportance: undefined, // 安定版MLモデルでは未実装
        trainingTime: trainingTime / 1000, // 秒
        modelComplexity: this.calculateModelComplexity(modelType, parameters, selectedFeatures.length),
        evaluationOptions: options // 使用した評価オプションを記録
      };
    } catch (error) {
      console.error('評価エラー:', error);
      throw new Error(`モデル評価に失敗しました: ${error}`);
    }
  }

  /**
   * モデルを最終評価（運営用）
   */
  static async evaluateOfficialModel(
    dataset: CompetitionDataset,
    submission: CompetitionSubmission
  ): Promise<ModelEvaluation> {
    // 特徴量選択を適用
    const filteredDataset = this.selectFeatures(dataset, submission.selectedFeatures);
    
    // 前処理を適用
    const processedDataset = this.preprocessDataset(filteredDataset, submission.preprocessing);
    
    // 運営用データセット（学習用 + テスト用）
    const officialDataset = {
      train: processedDataset.train,
      test: processedDataset.test,
      featureNames: processedDataset.featureNames,
      labelName: processedDataset.labelName,
      classes: processedDataset.classes
    };

    const startTime = Date.now();
    
    // モデルを学習
    const model = createStableModel(submission.modelType);
    await model.train(officialDataset.train, submission.parameters);
    
    const trainingTime = Date.now() - startTime;
    
    // テストデータで評価
    const result = model.evaluate(officialDataset.test);
    
    return {
      validationScore: 0, // 運営は見ない
      testScore: this.calculateScore(result, dataset.metric),
      metrics: {
        accuracy: result.accuracy,
        precision: result.precision,
        recall: result.recall,
        f1_score: result.f1_score,
        mae: result.accuracy, // 安定版MLモデルではaccuracyを使用
        mse: result.accuracy, // 安定版MLモデルではaccuracyを使用
        rmse: result.accuracy // 安定版MLモデルではaccuracyを使用
      },
      predictions: result.predictions.map(p => typeof p === 'string' ? parseFloat(p) : p),
      actual: result.actual.map(a => typeof a === 'string' ? parseFloat(a) : a),
      probabilities: undefined, // 安定版MLモデルでは未実装
      featureImportance: undefined, // 安定版MLモデルでは未実装
      trainingTime: trainingTime / 1000, // 秒
      modelComplexity: this.calculateModelComplexity(
        submission.modelType,
        submission.parameters,
        submission.selectedFeatures.length
      )
    };
  }

  /**
   * 特徴量選択を適用
   */
  private static selectFeatures(
    dataset: CompetitionDataset,
    selectedFeatures: number[]
  ): CompetitionDataset {
    return {
      ...dataset,
      train: dataset.train.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      validation: dataset.validation.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      test: dataset.test.map(point => ({
        ...point,
        features: selectedFeatures.map(i => point.features[i])
      })),
      featureNames: selectedFeatures.map(i => dataset.featureNames[i])
    };
  }

  /**
   * 前処理を適用
   */
  private static preprocessDataset(
    dataset: CompetitionDataset,
    preprocessing: {
      method: 'none' | 'normalize' | 'standardize' | 'encode';
      encodedFeatures?: number[];
    }
  ): CompetitionDataset {
    if (preprocessing.method === 'none') return dataset;

    // 正規化
    if (preprocessing.method === 'normalize') {
      return this.normalizeDataset(dataset);
    }

    // 標準化
    if (preprocessing.method === 'standardize') {
      return this.standardizeDataset(dataset);
    }

    // エンコーディング
    if (preprocessing.method === 'encode' && preprocessing.encodedFeatures) {
      return this.encodeDataset(dataset, preprocessing.encodedFeatures);
    }

    return dataset;
  }

  /**
   * 正規化
   */
  private static normalizeDataset(dataset: CompetitionDataset): CompetitionDataset {
    const numFeatures = dataset.featureNames.length;
    const mins = Array(numFeatures).fill(Infinity);
    const maxs = Array(numFeatures).fill(-Infinity);

    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        mins[i] = Math.min(mins[i], value);
        maxs[i] = Math.max(maxs[i], value);
      });
    });

    const transform = (point: any) => ({
      ...point,
      features: point.features.map((value: number, i: number) => {
        const range = maxs[i] - mins[i];
        if (!isFinite(range) || range === 0) return 0;
        return (value - mins[i]) / range;
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * 標準化
   */
  private static standardizeDataset(dataset: CompetitionDataset): CompetitionDataset {
    const numFeatures = dataset.featureNames.length;
    const means = Array(numFeatures).fill(0);
    const stds = Array(numFeatures).fill(0);

    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        means[i] += value;
      });
    });

    means.forEach((mean, i) => {
      means[i] = mean / dataset.train.length;
    });

    dataset.train.forEach(point => {
      point.features.forEach((value, i) => {
        stds[i] += Math.pow(value - means[i], 2);
      });
    });

    stds.forEach((sum, i) => {
      stds[i] = Math.sqrt(sum / dataset.train.length);
    });

    const transform = (point: any) => ({
      ...point,
      features: point.features.map((value: number, i: number) => {
        if (stds[i] === 0) return 0;
        return (value - means[i]) / stds[i];
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * エンコーディング
   */
  private static encodeDataset(
    dataset: CompetitionDataset,
    encodedFeatures: number[]
  ): CompetitionDataset {
    const encoders: Record<number, Map<string, number>> = {};

    dataset.train.forEach(point => {
      encodedFeatures.forEach(featureIndex => {
        if (!encoders[featureIndex]) {
          encoders[featureIndex] = new Map();
        }
        const key = String(point.features[featureIndex]);
        if (!encoders[featureIndex].has(key)) {
          encoders[featureIndex].set(key, encoders[featureIndex].size);
        }
      });
    });

    const transform = (point: any) => ({
      ...point,
      features: point.features.map((value: number, i: number) => {
        if (encodedFeatures.includes(i)) {
          const key = String(value);
          return encoders[i].get(key) ?? 0;
        }
        return value;
      })
    });

    return {
      ...dataset,
      train: dataset.train.map(transform),
      validation: dataset.validation.map(transform),
      test: dataset.test.map(transform)
    };
  }

  /**
   * スコア計算（適切な指標を選択）
   */
  private static calculateScore(result: any, metric: string): number {
    console.log('calculateScore called:', { result, metric });
    switch (metric) {
      case 'accuracy':
        const accuracy = result.accuracy || 0;
        console.log('Accuracy score:', accuracy);
        return accuracy;
      case 'f1_score':
        return result.f1_score || 0;
      case 'precision':
        return result.precision || 0;
      case 'recall':
        return result.recall || 0;
      case 'mae':
        // MAEは小さいほど良いので、1 - (mae / max_mae)で正規化
        const maxMAE = 100; // 適切な最大値を設定
        return Math.max(0, 1 - (result.mae || 0) / maxMAE);
      case 'mse':
        // MSEは小さいほど良いので、1 / (1 + mse)で正規化
        return 1 / (1 + (result.mse || 0));
      case 'rmse':
        // RMSEは小さいほど良いので、1 / (1 + rmse)で正規化
        return 1 / (1 + (result.rmse || 0));
      default:
        return result.accuracy || 0;
    }
  }

  /**
   * モデルの複雑さを計算
   */
  private static calculateModelComplexity(
    modelType: string,
    parameters: Record<string, any>,
    numFeatures: number
  ): number {
    let complexity = 0;
    
    switch (modelType) {
      case 'logistic_regression':
        complexity = numFeatures;
        break;
      case 'linear_regression':
        complexity = numFeatures;
        break;
      case 'neural_network':
        const hiddenUnits = parameters.hidden_units || 16;
        complexity = numFeatures * hiddenUnits + hiddenUnits * (parameters.num_classes || 2);
        break;
      case 'knn':
        complexity = numFeatures * (parameters.k || 5);
        break;
      default:
        complexity = numFeatures;
    }
    
    return complexity;
  }
}

