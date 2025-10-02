import type { Dataset, DataInsights } from '../types/ml';

export function calculateDataInsights(dataset: Dataset): DataInsights {
  const allData = [...dataset.train, ...dataset.test];
  const numFeatures = dataset.featureNames.length;

  const featureRanges = Array.from({ length: numFeatures }, (_, i) => {
    const values = allData.map(d => d.features[i]);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      std,
    };
  });

  const outliers: { index: number; featureIndex: number; value: number }[] = [];
  allData.forEach((point, index) => {
    point.features.forEach((value, featureIndex) => {
      const { mean, std } = featureRanges[featureIndex];
      const zScore = Math.abs((value - mean) / std);
      if (zScore > 3) {
        outliers.push({ index, featureIndex, value });
      }
    });
  });

  let classBalance: { [key: string]: number } | undefined;
  if (dataset.classes) {
    classBalance = {};
    allData.forEach(point => {
      const label = typeof point.label === 'number' && dataset.classes
        ? dataset.classes[point.label]
        : String(point.label);
      classBalance![label] = (classBalance![label] || 0) + 1;
    });
  }

  return {
    outliers: outliers.slice(0, 20),
    missingValues: 0,
    classBalance,
    featureRanges,
  };
}

export function calculateFeatureImportance(
  dataset: Dataset,
  _predictions: (number | string)[],
  _actual: (number | string)[]
): { featureName: string; importance: number }[] {
  const numFeatures = dataset.featureNames.length;
  const importances: number[] = [];

  for (let i = 0; i < numFeatures; i++) {
    const values = dataset.test.map(d => d.features[i]);
    const labels = dataset.test.map(d => d.label);

    const uniqueLabels = Array.from(new Set(labels));
    if (uniqueLabels.length < 2) {
      importances.push(0);
      continue;
    }

    const means: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    values.forEach((val, idx) => {
      const label = String(labels[idx]);
      means[label] = (means[label] || 0) + val;
      counts[label] = (counts[label] || 0) + 1;
    });

    Object.keys(means).forEach(label => {
      means[label] /= counts[label];
    });

    const meanValues = Object.values(means);
    const overallMean = meanValues.reduce((a, b) => a + b, 0) / meanValues.length;
    const variance = meanValues.reduce((a, b) => a + Math.pow(b - overallMean, 2), 0) / meanValues.length;

    importances.push(variance);
  }

  const maxImportance = Math.max(...importances);
  const normalizedImportances = maxImportance > 0
    ? importances.map(imp => imp / maxImportance)
    : importances.map(() => 1 / numFeatures);

  return dataset.featureNames.map((name, i) => ({
    featureName: name,
    importance: normalizedImportances[i],
  })).sort((a, b) => b.importance - a.importance);
}

export function detectAnomalies(dataset: Dataset): number[] {
  const anomalyIndices: number[] = [];
  const allData = [...dataset.train, ...dataset.test];

  const featureRanges = dataset.featureNames.map((_, i) => {
    const values = allData.map(d => d.features[i]);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    return { mean, std };
  });

  allData.forEach((point, index) => {
    let anomalyScore = 0;
    point.features.forEach((value, featureIndex) => {
      const { mean, std } = featureRanges[featureIndex];
      const zScore = Math.abs((value - mean) / std);
      if (zScore > 2.5) anomalyScore++;
    });

    if (anomalyScore >= 2) {
      anomalyIndices.push(index);
    }
  });

  return anomalyIndices;
}

export function suggestDataImprovements(insights: DataInsights, dataset: Dataset): string[] {
  const suggestions: string[] = [];

  if (insights.outliers.length > 0) {
    suggestions.push(`外れ値が${insights.outliers.length}個検出されました。これらのデータポイントを確認し、削除または補正を検討してください。`);
  }

  if (insights.classBalance) {
    const counts = Object.values(insights.classBalance);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const imbalanceRatio = max / min;

    if (imbalanceRatio > 3) {
      suggestions.push(`クラスの不均衡が検出されました（最大比率: ${imbalanceRatio.toFixed(1)}:1）。サンプリング手法の適用を検討してください。`);
    }
  }

  insights.featureRanges.forEach((range, i) => {
    if (range.std < 0.01) {
      suggestions.push(`特徴量「${dataset.featureNames[i]}」の分散が非常に小さいです。この特徴量は予測にあまり寄与しない可能性があります。`);
    }
  });

  const featureCorrelations = calculateFeatureCorrelations(dataset);
  const highCorrelations = featureCorrelations.filter(c => Math.abs(c.correlation) > 0.9 && c.feature1 !== c.feature2);
  if (highCorrelations.length > 0) {
    suggestions.push(`高い相関を持つ特徴量のペアが${highCorrelations.length}個見つかりました。多重共線性の可能性があります。`);
  }

  if (suggestions.length === 0) {
    suggestions.push('データの品質は良好です。このままモデルの学習を進めましょう。');
  }

  return suggestions;
}

function calculateFeatureCorrelations(dataset: Dataset): { feature1: number; feature2: number; correlation: number }[] {
  const correlations: { feature1: number; feature2: number; correlation: number }[] = [];
  const allData = [...dataset.train, ...dataset.test];
  const numFeatures = dataset.featureNames.length;

  for (let i = 0; i < numFeatures; i++) {
    for (let j = i + 1; j < numFeatures; j++) {
      const values1 = allData.map(d => d.features[i]);
      const values2 = allData.map(d => d.features[j]);

      const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
      const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

      let numerator = 0;
      let denominator1 = 0;
      let denominator2 = 0;

      for (let k = 0; k < values1.length; k++) {
        const diff1 = values1[k] - mean1;
        const diff2 = values2[k] - mean2;
        numerator += diff1 * diff2;
        denominator1 += diff1 * diff1;
        denominator2 += diff2 * diff2;
      }

      const correlation = numerator / Math.sqrt(denominator1 * denominator2);
      correlations.push({ feature1: i, feature2: j, correlation });
    }
  }

  return correlations;
}
