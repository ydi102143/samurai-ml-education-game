export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][];
}

export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  mape: number;
}

export function calculateClassificationMetrics(
  yTrue: number[], 
  yPred: number[], 
  classes: string[]
): ClassificationMetrics {
  const n = yTrue.length;
  const numClasses = classes.length;
  
  // 混同行列の計算
  const confusionMatrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));
  
  for (let i = 0; i < n; i++) {
    const trueClass = yTrue[i];
    const predClass = yPred[i];
    confusionMatrix[trueClass][predClass]++;
  }
  
  // 精度の計算
  let correct = 0;
  for (let i = 0; i < n; i++) {
    if (yTrue[i] === yPred[i]) {
      correct++;
    }
  }
  const accuracy = correct / n;
  
  // 各クラスの適合率、再現率、F1スコアの計算
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1 = 0;
  let validClasses = 0;
  
  for (let i = 0; i < numClasses; i++) {
    const truePositives = confusionMatrix[i][i];
    const falsePositives = confusionMatrix.reduce((sum, row) => sum + row[i], 0) - truePositives;
    const falseNegatives = confusionMatrix[i].reduce((sum, val) => sum + val, 0) - truePositives;
    
    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    totalPrecision += precision;
    totalRecall += recall;
    totalF1 += f1;
    validClasses++;
  }
  
  const avgPrecision = validClasses > 0 ? totalPrecision / validClasses : 0;
  const avgRecall = validClasses > 0 ? totalRecall / validClasses : 0;
  const avgF1 = validClasses > 0 ? totalF1 / validClasses : 0;
  
  return {
    accuracy,
    precision: avgPrecision,
    recall: avgRecall,
    f1: avgF1,
    confusionMatrix
  };
}

export function calculateRegressionMetrics(
  yTrue: number[], 
  yPred: number[]
): RegressionMetrics {
  const n = yTrue.length;
  
  // 平均絶対誤差 (MAE)
  const mae = yTrue.reduce((sum, val, i) => sum + Math.abs(val - yPred[i]), 0) / n;
  
  // 平均二乗誤差 (MSE)
  const mse = yTrue.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0) / n;
  
  // 二乗平均平方根誤差 (RMSE)
  const rmse = Math.sqrt(mse);
  
  // 決定係数 (R²)
  const yTrueMean = yTrue.reduce((sum, val) => sum + val, 0) / n;
  const ssRes = yTrue.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
  const ssTot = yTrue.reduce((sum, val) => sum + Math.pow(val - yTrueMean, 2), 0);
  const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  
  // 平均絶対パーセント誤差 (MAPE)
  const mape = yTrue.reduce((sum, val, i) => {
    if (val !== 0) {
      return sum + Math.abs((val - yPred[i]) / val) * 100;
    }
    return sum;
  }, 0) / n;
  
  return {
    mae,
    mse,
    rmse,
    r2,
    mape
  };
}

export function getEvaluationQualityMessage(
  metrics: ClassificationMetrics | RegressionMetrics,
  problemType: 'classification' | 'regression'
): string {
  if (problemType === 'classification') {
    const classificationMetrics = metrics as ClassificationMetrics;
    if (classificationMetrics.accuracy >= 0.9) {
      return '🎉 優秀な性能です！';
    } else if (classificationMetrics.accuracy >= 0.8) {
      return '👍 良好な性能です';
    } else if (classificationMetrics.accuracy >= 0.7) {
      return '⚠️ 改善の余地があります';
    } else {
      return '❌ 大幅な改善が必要です';
    }
  } else {
    const regressionMetrics = metrics as RegressionMetrics;
    if (regressionMetrics.r2 >= 0.8) {
      return '🎉 優秀な性能です！';
    } else if (regressionMetrics.r2 >= 0.6) {
      return '👍 良好な性能です';
    } else if (regressionMetrics.r2 >= 0.4) {
      return '⚠️ 改善の余地があります';
    } else {
      return '❌ 大幅な改善が必要です';
    }
  }
}