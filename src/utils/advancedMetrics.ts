// 高度な評価指標の実装

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
  sensitivity: number;
  auc: number;
  confusionMatrix: number[][];
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  adjustedR2: number;
  mape: number;
}

// 分類問題の高度な評価指標
export function calculateAdvancedClassificationMetrics(
  yTrue: number[],
  yPred: number[],
  classes: string[]
): ClassificationMetrics {
  const n = yTrue.length;
  const numClasses = classes.length;
  
  // 混同行列の計算
  const confusionMatrix = Array(numClasses).fill(null).map(() => Array(numClasses).fill(0));
  
  for (let i = 0; i < n; i++) {
    confusionMatrix[yTrue[i]][yPred[i]]++;
  }
  
  // 各クラスの精度、再現率、特異度を計算
  const precision = [];
  const recall = [];
  const specificity = [];
  
  for (let i = 0; i < numClasses; i++) {
    const tp = confusionMatrix[i][i];
    const fp = confusionMatrix.reduce((sum, row, j) => sum + (j !== i ? row[i] : 0), 0);
    const fn = confusionMatrix[i].reduce((sum, val, j) => sum + (j !== i ? val : 0), 0);
    const tn = confusionMatrix.reduce((sum, row, j) => 
      sum + row.reduce((rowSum, val, k) => rowSum + (j !== i && k !== i ? val : 0), 0), 0
    );
    
    precision.push(tp + fp > 0 ? tp / (tp + fp) : 0);
    recall.push(tp + fn > 0 ? tp / (tp + fn) : 0);
    specificity.push(tn + fp > 0 ? tn / (tn + fp) : 0);
  }
  
  // マクロ平均
  const macroPrecision = precision.reduce((sum, val) => sum + val, 0) / numClasses;
  const macroRecall = recall.reduce((sum, val) => sum + val, 0) / numClasses;
  const macroSpecificity = specificity.reduce((sum, val) => sum + val, 0) / numClasses;
  
  // F1スコア
  const f1Score = 2 * (macroPrecision * macroRecall) / (macroPrecision + macroRecall);
  
  // 全体の精度
  const correct = confusionMatrix.reduce((sum, row, i) => sum + row[i], 0);
  const accuracy = correct / n;
  
  // AUC（簡易版）
  const auc = calculateAUC(yTrue, yPred);
  
  return {
    accuracy,
    precision: macroPrecision,
    recall: macroRecall,
    f1Score,
    specificity: macroSpecificity,
    sensitivity: macroRecall,
    auc,
    confusionMatrix
  };
}

// 回帰問題の高度な評価指標
export function calculateAdvancedRegressionMetrics(
  yTrue: number[],
  yPred: number[]
): RegressionMetrics {
  const n = yTrue.length;
  
  // 基本統計量
  const mse = yTrue.reduce((sum, actual, i) => sum + Math.pow(actual - yPred[i], 2), 0) / n;
  const rmse = Math.sqrt(mse);
  const mae = yTrue.reduce((sum, actual, i) => sum + Math.abs(actual - yPred[i]), 0) / n;
  
  // R²決定係数
  const yMean = yTrue.reduce((sum, val) => sum + val, 0) / n;
  const ssRes = yTrue.reduce((sum, actual, i) => sum + Math.pow(actual - yPred[i], 2), 0);
  const ssTot = yTrue.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);
  
  // 調整済みR²
  const p = 1; // 特徴量の数（簡易版）
  const adjustedR2 = 1 - (1 - r2) * (n - 1) / (n - p - 1);
  
  // MAPE（平均絶対パーセント誤差）
  const mape = yTrue.reduce((sum, actual, i) => {
    if (actual !== 0) {
      return sum + Math.abs((actual - yPred[i]) / actual);
    }
    return sum;
  }, 0) / n * 100;
  
  return {
    mse,
    rmse,
    mae,
    r2,
    adjustedR2,
    mape
  };
}

// AUC（Area Under Curve）の計算
function calculateAUC(yTrue: number[], yPred: number[]): number {
  const n = yTrue.length;
  const pairs = yTrue.map((label, i) => ({ label, score: yPred[i] }));
  
  // スコアでソート
  pairs.sort((a, b) => b.score - a.score);
  
  let auc = 0;
  let rank = 0;
  let positiveCount = 0;
  
  for (let i = 0; i < n; i++) {
    if (pairs[i].label === 1) {
      positiveCount++;
      rank += i + 1;
    }
  }
  
  const negativeCount = n - positiveCount;
  
  if (positiveCount === 0 || negativeCount === 0) {
    return 0.5; // ランダムな予測
  }
  
  auc = (rank - positiveCount * (positiveCount + 1) / 2) / (positiveCount * negativeCount);
  
  return Math.max(0, Math.min(1, auc));
}

// 交差検証の実装
export function crossValidation(
  features: number[][],
  labels: number[],
  model: any,
  k: number = 5
): { meanScore: number; stdScore: number; scores: number[] } {
  const n = features.length;
  const foldSize = Math.floor(n / k);
  const scores: number[] = [];
  
  for (let fold = 0; fold < k; fold++) {
    const start = fold * foldSize;
    const end = fold === k - 1 ? n : (fold + 1) * foldSize;
    
    // テストセット
    const testFeatures = features.slice(start, end);
    const testLabels = labels.slice(start, end);
    
    // 訓練セット
    const trainFeatures = [...features.slice(0, start), ...features.slice(end)];
    const trainLabels = [...labels.slice(0, start), ...labels.slice(end)];
    
    // モデルを訓練
    model.train(trainFeatures, trainLabels);
    
    // 予測
    const predictions = model.predict(testFeatures);
    
    // スコアを計算
    const score = calculateAccuracy(testLabels, predictions);
    scores.push(score);
  }
  
  const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / scores.length;
  const stdScore = Math.sqrt(variance);
  
  return { meanScore, stdScore, scores };
}

// 精度の計算
function calculateAccuracy(yTrue: number[], yPred: number[]): number {
  const correct = yTrue.reduce((count, actual, i) => 
    count + (actual === yPred[i] ? 1 : 0), 0
  );
  return correct / yTrue.length;
}

// 学習曲線の計算
export function calculateLearningCurve(
  features: number[][],
  labels: number[],
  model: any,
  trainSizes: number[] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
): { trainScores: number[]; valScores: number[]; trainSizes: number[] } {
  const trainScores: number[] = [];
  const valScores: number[] = [];
  
  for (const size of trainSizes) {
    const trainSize = Math.floor(features.length * size);
    const trainFeatures = features.slice(0, trainSize);
    const trainLabels = labels.slice(0, trainSize);
    
    // 訓練セットをさらに分割
    const valSize = Math.floor(trainSize * 0.2);
    const actualTrainSize = trainSize - valSize;
    
    const actualTrainFeatures = trainFeatures.slice(0, actualTrainSize);
    const actualTrainLabels = trainLabels.slice(0, actualTrainSize);
    const valFeatures = trainFeatures.slice(actualTrainSize);
    const valLabels = trainLabels.slice(actualTrainSize);
    
    // モデルを訓練
    model.train(actualTrainFeatures, actualTrainLabels);
    
    // 訓練スコア
    const trainPredictions = model.predict(actualTrainFeatures);
    const trainScore = calculateAccuracy(actualTrainLabels, trainPredictions);
    trainScores.push(trainScore);
    
    // 検証スコア
    const valPredictions = model.predict(valFeatures);
    const valScore = calculateAccuracy(valLabels, valPredictions);
    valScores.push(valScore);
  }
  
  return { trainScores, valScores, trainSizes };
}

// 特徴量重要度の計算
export function calculateFeatureImportance(
  features: number[][],
  labels: number[],
  featureNames: string[]
): { feature: string; importance: number }[] {
  const n = features.length;
  const m = features[0].length;
  const importances: { feature: string; importance: number }[] = [];
  
  for (let i = 0; i < m; i++) {
    // 特徴量iの値をシャッフル
    const shuffledFeatures = features.map(row => [...row]);
    const featureValues = shuffledFeatures.map(row => row[i]);
    featureValues.sort(() => Math.random() - 0.5);
    
    for (let j = 0; j < n; j++) {
      shuffledFeatures[j][i] = featureValues[j];
    }
    
    // 元の特徴量での予測精度
    const originalAccuracy = calculateBaselineAccuracy(features, labels);
    
    // シャッフル後の予測精度
    const shuffledAccuracy = calculateBaselineAccuracy(shuffledFeatures, labels);
    
    // 重要度 = 精度の減少
    const importance = originalAccuracy - shuffledAccuracy;
    
    importances.push({
      feature: featureNames[i],
      importance: Math.max(0, importance)
    });
  }
  
  // 重要度でソート
  importances.sort((a, b) => b.importance - a.importance);
  
  return importances;
}

// ベースライン精度の計算
function calculateBaselineAccuracy(features: number[][], labels: number[]): number {
  // 簡易的なベースライン（最も頻繁なクラスを予測）
  const labelCounts = labels.reduce((counts, label) => {
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);
  
  const mostFrequentLabel = Object.keys(labelCounts).reduce((a, b) => 
    labelCounts[Number(a)] > labelCounts[Number(b)] ? a : b
  );
  
  const correct = labels.reduce((count, label) => 
    count + (label === Number(mostFrequentLabel) ? 1 : 0), 0
  );
  
  return correct / labels.length;
}

// モデル比較のための統計的検定
export function compareModels(
  scores1: number[],
  scores2: number[],
  alpha: number = 0.05
): { isSignificant: boolean; pValue: number; effectSize: number } {
  const n1 = scores1.length;
  const n2 = scores2.length;
  
  // 平均と標準偏差
  const mean1 = scores1.reduce((sum, score) => sum + score, 0) / n1;
  const mean2 = scores2.reduce((sum, score) => sum + score, 0) / n2;
  
  const var1 = scores1.reduce((sum, score) => sum + Math.pow(score - mean1, 2), 0) / (n1 - 1);
  const var2 = scores2.reduce((sum, score) => sum + Math.pow(score - mean2, 2), 0) / (n2 - 1);
  
  // t検定
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
  const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
  const t = (mean1 - mean2) / se;
  
  // 自由度
  const df = n1 + n2 - 2;
  
  // p値の近似計算（簡易版）
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(t), df));
  
  // 効果サイズ（Cohen's d）
  const effectSize = (mean1 - mean2) / Math.sqrt(pooledVar);
  
  return {
    isSignificant: pValue < alpha,
    pValue,
    effectSize
  };
}

// t分布の累積分布関数（簡易版）
function tDistributionCDF(t: number, df: number): number {
  // 簡易的な近似（実際の実装ではより正確な方法を使用）
  if (df > 30) {
    // 正規分布で近似
    return 0.5 * (1 + erf(t / Math.sqrt(2)));
  }
  
  // 簡易的な近似
  const x = t / Math.sqrt(df);
  return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
}

// 誤差関数（簡易版）
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}




