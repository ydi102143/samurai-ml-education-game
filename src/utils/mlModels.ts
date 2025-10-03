import * as tf from '@tensorflow/tfjs';
import type { Dataset, ModelParameters, ModelResult, TrainingProgress } from '../types/ml';
import { calculateFeatureImportance } from './dataAnalysis';

export class LogisticRegressionModel {
  private model: tf.Sequential | null = null;
  private lastTrainingMs: number = 0;

  async train(
    dataset: Dataset,
    parameters: ModelParameters,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<void> {
    const { learning_rate = 0.01, max_iterations = 100 } = parameters;

    const numFeatures = dataset.train[0].features.length;
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [numFeatures], units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(learning_rate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    const trainX = tf.tensor2d(dataset.train.map(d => d.features));
    const trainY = tf.tensor2d(dataset.train.map(d => [Number(d.label)]));

    const start = Date.now();
    await this.model.fit(trainX, trainY, {
      epochs: max_iterations,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onProgress && logs) {
            onProgress({
              epoch: epoch + 1,
              loss: logs.loss,
              accuracy: logs.acc || 0
            });
          }
        }
      }
    });
    this.lastTrainingMs = Date.now() - start;

    trainX.dispose();
    trainY.dispose();
  }

  predict(features: number[]): number {
    if (!this.model) throw new Error('Model not trained');

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const value = prediction.dataSync()[0];

    input.dispose();
    prediction.dispose();

    return value > 0.5 ? 1 : 0;
  }

  evaluate(dataset: Dataset): ModelResult {
    const startTime = Date.now();
    const predictions: number[] = [];
    const actual: number[] = [];

    for (const point of dataset.test) {
      predictions.push(this.predict(point.features));
      actual.push(Number(point.label));
    }

    const correct = predictions.filter((p, i) => p === actual[i]).length;
    const accuracy = correct / predictions.length;

    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === 1 && actual[i] === 1) tp++;
      else if (predictions[i] === 1 && actual[i] === 0) fp++;
      else if (predictions[i] === 0 && actual[i] === 1) fn++;
      else tn++;
    }

    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1_score = 2 * (precision * recall) / (precision + recall) || 0;

    const feature_importance = calculateFeatureImportance(dataset, predictions, actual);

    return {
      accuracy,
      precision,
      recall,
      f1_score,
      confusion_matrix: [[tn, fp], [fn, tp]],
      predictions,
      actual,
      training_time: Math.floor(this.lastTrainingMs / 1000),
      feature_importance
    };
  }
}

export class LinearRegressionModel {
  private model: tf.Sequential | null = null;
  private lastTrainingMs: number = 0;

  async train(
    dataset: Dataset,
    parameters: ModelParameters,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<void> {
    const { learning_rate = 0.01, max_iterations = 100 } = parameters;

    const numFeatures = dataset.train[0].features.length;
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [numFeatures], units: 1 })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(learning_rate),
      loss: 'meanSquaredError'
    });

    const trainX = tf.tensor2d(dataset.train.map(d => d.features));
    const trainY = tf.tensor2d(dataset.train.map(d => [Number(d.label)]));

    const start = Date.now();
    await this.model.fit(trainX, trainY, {
      epochs: max_iterations,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onProgress && logs) {
            onProgress({
              epoch: epoch + 1,
              loss: logs.loss,
              accuracy: 0
            });
          }
        }
      }
    });
    this.lastTrainingMs = Date.now() - start;

    trainX.dispose();
    trainY.dispose();
  }

  predict(features: number[]): number {
    if (!this.model) throw new Error('Model not trained');

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const value = prediction.dataSync()[0];

    input.dispose();
    prediction.dispose();

    return value;
  }

  evaluate(dataset: Dataset): ModelResult {
    const startTime = Date.now();
    const predictions: number[] = [];
    const actual: number[] = [];

    for (const point of dataset.test) {
      predictions.push(this.predict(point.features));
      actual.push(Number(point.label));
    }

    const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
    const totalSS = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    const residualSS = predictions.reduce((sum, pred, i) => sum + Math.pow(actual[i] - pred, 2), 0);
    const r2 = 1 - (residualSS / totalSS);

    return {
      accuracy: Math.max(0, r2),
      predictions,
      actual,
      training_time: Math.floor(this.lastTrainingMs / 1000)
    };
  }
}

export class KNNModel {
  private trainData: { features: number[]; label: number }[] = [];
  private k: number = 5;
  private lastTrainingMs: number = 0;

  async train(
    dataset: Dataset,
    parameters: ModelParameters,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<void> {
    const start = Date.now();
    this.k = parameters.k || 5;
    this.trainData = dataset.train.map(d => ({
      features: d.features,
      label: Number(d.label)
    }));

    if (onProgress) {
      onProgress({ epoch: 1, loss: 0, accuracy: 1 });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    this.lastTrainingMs = Date.now() - start;
  }

  predict(features: number[]): number {
    const distances = this.trainData.map(d => ({
      label: d.label,
      distance: Math.sqrt(
        d.features.reduce((sum, val, i) => sum + Math.pow(val - features[i], 2), 0)
      )
    }));

    distances.sort((a, b) => a.distance - b.distance);

    const kNearest = distances.slice(0, this.k);
    const votes: Record<number, number> = {};

    for (const neighbor of kNearest) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    return Number(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]);
  }

  evaluate(dataset: Dataset): ModelResult {
    const startTime = Date.now();
    const predictions: number[] = [];
    const actual: number[] = [];

    for (const point of dataset.test) {
      predictions.push(this.predict(point.features));
      actual.push(Number(point.label));
    }

    const correct = predictions.filter((p, i) => p === actual[i]).length;
    const accuracy = correct / predictions.length;

    const uniqueLabels = [...new Set(actual)];
    let confusion_matrix: number[][] | undefined;

    if (uniqueLabels.length === 2) {
      let tp = 0, fp = 0, fn = 0, tn = 0;
      for (let i = 0; i < predictions.length; i++) {
        if (predictions[i] === 1 && actual[i] === 1) tp++;
        else if (predictions[i] === 1 && actual[i] === 0) fp++;
        else if (predictions[i] === 0 && actual[i] === 1) fn++;
        else tn++;
      }

      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1_score = 2 * (precision * recall) / (precision + recall) || 0;

      confusion_matrix = [[tn, fp], [fn, tp]];
      const feature_importance = calculateFeatureImportance(dataset, predictions, actual);

      return {
        accuracy,
        precision,
        recall,
        f1_score,
        confusion_matrix,
        predictions,
        actual,
        training_time: Math.floor(this.lastTrainingMs / 1000),
        feature_importance
      };
    }

    const numClasses = uniqueLabels.length;
    confusion_matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

    for (let i = 0; i < predictions.length; i++) {
      const predLabel = predictions[i];
      const actualLabel = actual[i];
      confusion_matrix[actualLabel][predLabel]++;
    }

    const feature_importance = calculateFeatureImportance(dataset, predictions, actual);

    return {
      accuracy,
      confusion_matrix,
      predictions,
      actual,
      training_time: Math.floor(this.lastTrainingMs / 1000),
      feature_importance
    };
  }
}

export class MultiClassNeuralNetworkModel {
  private model: tf.Sequential | null = null;
  private lastTrainingMs: number = 0;

  async train(
    dataset: Dataset,
    parameters: ModelParameters,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<void> {
    const { learning_rate = 0.01, max_iterations = 100 } = parameters;

    const numFeatures = dataset.train[0].features.length;
    const numClasses = dataset.classes?.length || 2;

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [numFeatures], units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: numClasses, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(learning_rate),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy']
    });

    const trainX = tf.tensor2d(dataset.train.map(d => d.features));
    const trainY = tf.tensor1d(dataset.train.map(d => Number(d.label)), 'int32');

    const start = Date.now();
    await this.model.fit(trainX, trainY, {
      epochs: max_iterations,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onProgress && logs) {
            onProgress({
              epoch: epoch + 1,
              loss: logs.loss,
              accuracy: logs.acc || 0
            });
          }
        }
      }
    });
    this.lastTrainingMs = Date.now() - start;

    trainX.dispose();
    trainY.dispose();
  }

  predict(features: number[]): number {
    if (!this.model) throw new Error('Model not trained');

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const probabilities = prediction.dataSync();

    let maxIndex = 0;
    let maxValue = probabilities[0];
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > maxValue) {
        maxValue = probabilities[i];
        maxIndex = i;
      }
    }

    input.dispose();
    prediction.dispose();

    return maxIndex;
  }

  evaluate(dataset: Dataset): ModelResult {
    const startTime = Date.now();
    const predictions: number[] = [];
    const actual: number[] = [];

    for (const point of dataset.test) {
      predictions.push(this.predict(point.features));
      actual.push(Number(point.label));
    }

    const correct = predictions.filter((p, i) => p === actual[i]).length;
    const accuracy = correct / predictions.length;

    const uniqueLabels = [...new Set(actual)];
    const numClasses = uniqueLabels.length;
    const confusion_matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

    for (let i = 0; i < predictions.length; i++) {
      const predLabel = predictions[i];
      const actualLabel = actual[i];
      confusion_matrix[actualLabel][predLabel]++;
    }

    const feature_importance = calculateFeatureImportance(dataset, predictions, actual);

    return {
      accuracy,
      confusion_matrix,
      predictions,
      actual,
      training_time: Math.floor(this.lastTrainingMs / 1000),
      feature_importance
    };
  }
}

export function createModel(modelType: string) {
  switch (modelType) {
    case 'logistic_regression':
      return new LogisticRegressionModel();
    case 'linear_regression':
      return new LinearRegressionModel();
    case 'knn':
      return new KNNModel();
    case 'neural_network':
      return new MultiClassNeuralNetworkModel();
    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }
}
