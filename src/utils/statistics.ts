import type { Dataset } from '../types/ml';

export interface FeatureStats {
  name: string;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

export function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function calculateStd(values: number[]): number {
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

export function calculateQuartile(values: number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function calculateFeatureStats(dataset: Dataset): FeatureStats[] {
  const stats: FeatureStats[] = [];

  for (let i = 0; i < dataset.featureNames.length; i++) {
    const values = dataset.train.map(d => d.features[i]);

    stats.push({
      name: dataset.featureNames[i],
      mean: calculateMean(values),
      median: calculateMedian(values),
      std: calculateStd(values),
      min: Math.min(...values),
      max: Math.max(...values),
      q1: calculateQuartile(values, 0.25),
      q3: calculateQuartile(values, 0.75),
    });
  }

  return stats;
}

export function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

export function calculateCorrelationMatrix(dataset: Dataset): number[][] {
  const numFeatures = dataset.featureNames.length;
  const matrix: number[][] = [];

  for (let i = 0; i < numFeatures; i++) {
    matrix[i] = [];
    const featuresI = dataset.train.map(d => d.features[i]);

    for (let j = 0; j < numFeatures; j++) {
      const featuresJ = dataset.train.map(d => d.features[j]);
      matrix[i][j] = calculateCorrelation(featuresI, featuresJ);
    }
  }

  return matrix;
}

export function createHistogram(values: number[], bins: number = 10): { bin: string; count: number }[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const binSize = range / bins;

  const histogram = Array(bins).fill(0);
  const binLabels: string[] = [];

  for (let i = 0; i < bins; i++) {
    const start = min + i * binSize;
    const end = min + (i + 1) * binSize;
    binLabels.push(`${start.toFixed(2)}-${end.toFixed(2)}`);
  }

  values.forEach(val => {
    const binIndex = Math.min(Math.floor((val - min) / binSize), bins - 1);
    histogram[binIndex]++;
  });

  return histogram.map((count, i) => ({
    bin: binLabels[i],
    count,
  }));
}

export function calculateClassDistribution(dataset: Dataset): { class: string; count: number }[] {
  if (!dataset.classes) return [];

  const distribution = new Map<string | number, number>();

  dataset.train.forEach(point => {
    const label = point.label;
    distribution.set(label, (distribution.get(label) || 0) + 1);
  });

  return Array.from(distribution.entries()).map(([label, count]) => ({
    class: dataset.classes ? dataset.classes[Number(label)] : String(label),
    count,
  }));
}
