import { useState } from 'react';
import { Settings, CheckCircle, Eye, EyeOff, Play } from 'lucide-react';
import { integratedMLSystem } from '../utils/integratedMLSystem';

interface PreprocessingPanelProps {
  data: any[];
  featureNames: string[];
  featureTypes?: ('numerical' | 'categorical')[];
  onPreprocessedData: (data: any[], featureNames: string[], featureTypes: ('numerical' | 'categorical')[]) => void;
}

export function PreprocessingPanel({ data, featureNames, featureTypes, onPreprocessedData }: PreprocessingPanelProps) {
  const [preprocessingSteps, setPreprocessingSteps] = useState({
    missingValueStrategy: 'mean', // 'mean', 'median', 'mode', 'drop'
    scalingMethod: 'standard', // 'standard', 'minmax', 'robust', 'none'
    encodingMethod: 'label', // 'label', 'onehot', 'target', 'none'
    outlierMethod: 'iqr', // 'iqr', 'zscore', 'isolation', 'none'
    dimensionalityReduction: 'none', // 'pca', 'lda', 'none'
    categoricalHandling: 'label' // 'label', 'onehot', 'target', 'none'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [showRawData, setShowRawData] = useState(false);
  const [rawDataPage, setRawDataPage] = useState(0);
  const [rawDataPageSize] = useState(20);
  const [appliedSteps, setAppliedSteps] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<any[]>(data);
  const [selectedFeaturesForPreprocessing, setSelectedFeaturesForPreprocessing] = useState<{[key: string]: number[]}>({
    missingValue: [],
    scaling: [],
    categorical: [],
    outlier: []
  });

  const [showFeatureSelector, setShowFeatureSelector] = useState<string | null>(null);

  const addLog = (message: string) => {
    setProcessingLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // データセットを保存

  // データセットを読み込み

  // データセットを削除

  // データセットを編集


  // 個別の前処理手法を適用
  const applyMissingValueHandling = () => {
    setIsProcessing(true);
    addLog(`欠損値処理を適用: ${preprocessingSteps.missingValueStrategy}`);
    
    const selectedFeatures = selectedFeaturesForPreprocessing.missingValue;
    if (selectedFeatures.length === 0) {
      addLog('エラー: 適用する特徴量が選択されていません');
      setIsProcessing(false);
      return;
    }
    
    const processed = handleMissingValues(currentData, preprocessingSteps.missingValueStrategy, selectedFeatures);
    setCurrentData(processed);
    setAppliedSteps(prev => [...prev, `欠損値処理 (${preprocessingSteps.missingValueStrategy}) - ${selectedFeatures.length}特徴量`]);
    addLog('欠損値処理完了');
    setIsProcessing(false);
  };

  const applyScaling = () => {
    setIsProcessing(true);
    addLog(`スケーリングを適用: ${preprocessingSteps.scalingMethod}`);
    
    const selectedFeatures = selectedFeaturesForPreprocessing.scaling;
    if (selectedFeatures.length === 0) {
      addLog('エラー: 適用する特徴量が選択されていません');
      setIsProcessing(false);
      return;
    }
    
    const processed = handleScaling(currentData, preprocessingSteps.scalingMethod, selectedFeatures);
    setCurrentData(processed);
    setAppliedSteps(prev => [...prev, `スケーリング (${preprocessingSteps.scalingMethod}) - ${selectedFeatures.length}特徴量`]);
    addLog('スケーリング完了');
    setIsProcessing(false);
  };

  const applyOutlierHandling = () => {
    setIsProcessing(true);
    addLog(`外れ値処理を適用: ${preprocessingSteps.outlierMethod}`);
    
    const processed = handleOutliers(currentData, preprocessingSteps.outlierMethod);
    setCurrentData(processed);
    setAppliedSteps(prev => [...prev, `外れ値処理 (${preprocessingSteps.outlierMethod})`]);
    addLog('外れ値処理完了');
    setIsProcessing(false);
  };

  const applyCategoricalHandling = () => {
    setIsProcessing(true);
    addLog(`カテゴリカル変数処理を適用: ${preprocessingSteps.categoricalHandling}`);
    
    const processed = handleCategoricalFeatures(currentData, preprocessingSteps.categoricalHandling);
    setCurrentData(processed);
    setAppliedSteps(prev => [...prev, `カテゴリカル変数処理 (${preprocessingSteps.categoricalHandling})`]);
    addLog('カテゴリカル変数処理完了');
    setIsProcessing(false);
  };

  const resetPreprocessing = () => {
    setCurrentData(data);
    setAppliedSteps([]);
    setProcessingLog([]);
    addLog('前処理をリセットしました');
  };

  const finalizePreprocessing = async () => {
    setIsProcessing(true);
    addLog('前処理を統合システムで実行中...');
    
    try {
      // データを統合システムの形式に変換
      const formattedData = data.map((item) => ({
        features: item.features || [],
        label: item.label || 0
      }));
      
      const result = await integratedMLSystem.executePreprocessingDirect(
        formattedData,
        featureNames,
        featureTypes || [],
        {
          selectedFeatures: featureNames.map((_, index) => index),
          missingValueStrategy: preprocessingSteps.missingValueStrategy as 'mean' | 'median' | 'mode' | 'drop',
          scalingMethod: preprocessingSteps.scalingMethod as 'standard' | 'minmax' | 'none',
          encodingMethod: preprocessingSteps.encodingMethod as 'label' | 'onehot' | 'target',
          outlierRemoval: preprocessingSteps.outlierMethod !== 'none',
          outlierThreshold: 3,
          categoricalEncoding: {
            method: preprocessingSteps.categoricalHandling as 'label' | 'onehot' | 'target'
          }
        }
      );
      
      if (result.success) {
        // 結果を元の形式に変換
        const convertedData = result.data.map((item) => ({
          features: item.features || [],
          label: item.label || 0
        }));
        
        onPreprocessedData(convertedData, result.featureNames, result.featureTypes);
        addLog('前処理を確定しました');
      } else {
        addLog(`エラー: ${result.error}`);
      }
    } catch (error) {
      addLog(`エラー: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 欠損値処理
  const handleMissingValues = (data: any[], strategy: string, selectedFeatures: number[] = []) => {
    addLog(`欠損値処理開始: ${strategy}戦略`);
    
    if (strategy === 'drop') {
      const filtered = data.filter(d => 
        selectedFeatures.length > 0 
          ? selectedFeatures.every(index => !isNaN(d.features[index]) && d.features[index] !== null && d.features[index] !== undefined)
          : d.features.every((f: any) => !isNaN(f) && f !== null && f !== undefined)
      );
      addLog(`欠損値のあるサンプルを削除: ${data.length - filtered.length}件`);
      return filtered;
    }

    const features = (selectedFeatures.length > 0 ? selectedFeatures : featureNames.map((_, i) => i)).map(index => 
      data.map(d => d.features[index]).filter(f => !isNaN(f) && f !== null && f !== undefined)
    );

    const processed = data.map(d => {
      const newFeatures = d.features.map((f: any, index: number) => {
        if (isNaN(f) || f === null || f === undefined) {
          const featureIndex = selectedFeatures.length > 0 ? selectedFeatures.indexOf(index) : index;
          if (featureIndex === -1 || featureIndex >= features.length) return f;
          
          const validValues = features[featureIndex];
          if (validValues.length === 0) return 0;

          switch (strategy) {
            case 'mean':
              return validValues.reduce((a, b) => a + b, 0) / validValues.length;
            case 'median':
              const sorted = [...validValues].sort((a, b) => a - b);
              return sorted[Math.floor(sorted.length / 2)];
            case 'mode':
              const counts: { [key: number]: number } = {};
              validValues.forEach(v => counts[v] = (counts[v] || 0) + 1);
              return parseInt(Object.keys(counts).reduce((a, b) => counts[parseInt(a)] > counts[parseInt(b)] ? a : b));
            default:
              return 0;
          }
        }
        return f;
      });

      return { ...d, features: newFeatures };
    });

    addLog(`欠損値処理完了: ${strategy}戦略`);
    return processed;
  };

  // スケーリング処理
  const handleScaling = (data: any[], method: string, selectedFeatures: number[] = []) => {
    addLog(`スケーリング処理開始: ${method}方法`);

    if (method === 'none') return data;

    const features = (selectedFeatures.length > 0 ? selectedFeatures : featureNames.map((_, i) => i)).map(index => 
      data.map(d => d.features[index])
    );

    const scaledFeatures = features.map(featureData => {
      const values = featureData.filter(v => !isNaN(v));
      if (values.length === 0) return featureData;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      const min = Math.min(...values);
      const max = Math.max(...values);

      return featureData.map(value => {
        if (isNaN(value)) return value;

        switch (method) {
          case 'standard':
            return std === 0 ? 0 : (value - mean) / std;
          case 'minmax':
            return max === min ? 0 : (value - min) / (max - min);
          case 'robust':
            const q1 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)];
            const q3 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)];
            const iqr = q3 - q1;
            return iqr === 0 ? 0 : (value - q1) / iqr;
          default:
            return value;
        }
      });
    });

    const processed = data.map((d, index) => {
      const newFeatures = [...d.features];
      if (selectedFeatures.length > 0) {
        selectedFeatures.forEach((featureIndex, scaledIndex) => {
          newFeatures[featureIndex] = scaledFeatures[scaledIndex][index];
        });
      } else {
        scaledFeatures.forEach((featureData, featureIndex) => {
          newFeatures[featureIndex] = featureData[index];
        });
      }
      return { ...d, features: newFeatures };
    });

    addLog(`スケーリング処理完了: ${method}方法`);
    return processed;
  };

  // 外れ値処理
  const handleOutliers = (data: any[], method: string) => {
    addLog(`外れ値処理開始: ${method}方法`);

    if (method === 'none') return data;

    const features = featureNames.map((_, index) => 
      data.map(d => d.features[index]).filter(v => !isNaN(v))
    );

    let outlierIndices = new Set<number>();

    features.forEach(featureData => {
      if (featureData.length === 0) return;

      const sorted = [...featureData].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;

      if (method === 'iqr') {
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        featureData.forEach((value, index) => {
          if (value < lowerBound || value > upperBound) {
            outlierIndices.add(index);
          }
        });
      } else if (method === 'zscore') {
        const mean = featureData.reduce((a, b) => a + b, 0) / featureData.length;
        const std = Math.sqrt(featureData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / featureData.length);
        
        featureData.forEach((value, index) => {
          const zscore = Math.abs((value - mean) / std);
          if (zscore > 3) {
            outlierIndices.add(index);
          }
        });
      }
    });

    const processed = data.filter((_, index) => !outlierIndices.has(index));
    addLog(`外れ値処理完了: ${data.length - processed.length}件の外れ値を削除`);
    return processed;
  };


  // カテゴリカル変数処理
  const handleCategoricalFeatures = (data: any[], method: string) => {
    addLog(`カテゴリカル変数処理開始: ${method}方法`);
    
    if (!featureTypes) return data;
    
    const processed = data.map(d => {
      const newFeatures = d.features.map((value: any, index: number) => {
        const featureType = featureTypes[index];
        
        if (featureType === 'categorical') {
          if (isNaN(value)) return value; // 欠損値はそのまま
          
          if (method === 'label') {
            // ラベルエンコーディング（既に数値化されている）
            return value;
          } else if (method === 'onehot') {
            // ワンホットエンコーディング（簡略化）
            return value;
          }
        }
        
        return value;
      });
      
      return { ...d, features: newFeatures };
    });
    
    addLog(`カテゴリカル変数処理完了`);
    return processed;
  };

  // 相関係数を計算


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          データ前処理
        </h2>
      </div>

      <div className="p-6">
        {/* 生データ表示ボタン */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">前処理設定</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300"
            >
              {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showRawData ? '生データを隠す' : '生データを表示'}</span>
            </button>
            <button
              onClick={resetPreprocessing}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-300"
            >
              <Play className="w-4 h-4" />
              <span>リセット</span>
            </button>
          </div>
        </div>

        {/* 生データ表示 */}
        {showRawData && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h4 className="text-lg font-bold text-white mb-4">生データ ({currentData.length}件)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-2 text-white/80">行番号</th>
                    {featureNames.map((name, index) => (
                      <th key={index} className="text-left p-2 text-white/80">
                        {name}
                        <div className="text-xs text-white/60">
                          {featureTypes?.[index] === 'categorical' ? 'カテゴリカル' : '数値'}
                        </div>
                      </th>
                    ))}
                    <th className="text-left p-2 text-white/80">ターゲット</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.slice(rawDataPage * rawDataPageSize, (rawDataPage + 1) * rawDataPageSize).map((row, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="p-2 text-white/70">{rawDataPage * rawDataPageSize + index + 1}</td>
                      {row.features.map((value: any, featureIndex: number) => (
                        <td key={featureIndex} className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            isNaN(value) || value === null || value === undefined
                              ? 'bg-red-500/20 text-red-300' // 欠損値
                              : featureTypes?.[featureIndex] === 'categorical'
                              ? 'bg-blue-500/20 text-blue-300' // カテゴリカル
                              : 'bg-green-500/20 text-green-300' // 数値
                          }`}>
                            {isNaN(value) || value === null || value === undefined ? 'NaN' : value}
                          </span>
                        </td>
                      ))}
                      <td className="p-2 text-yellow-300 font-bold">{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-white/70 text-sm">
                表示中: {rawDataPage * rawDataPageSize + 1}-{Math.min((rawDataPage + 1) * rawDataPageSize, currentData.length)} / {currentData.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setRawDataPage(Math.max(0, rawDataPage - 1))}
                  disabled={rawDataPage === 0}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
                >
                  前へ
                </button>
                <button
                  onClick={() => setRawDataPage(Math.min(Math.floor(currentData.length / rawDataPageSize), rawDataPage + 1))}
                  disabled={rawDataPage >= Math.floor(currentData.length / rawDataPageSize)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 適用済みステップ */}
        {appliedSteps.length > 0 && (
          <div className="bg-green-500/20 rounded-xl p-4 mb-6 border border-green-400/30">
            <h4 className="text-lg font-bold text-white mb-3">適用済みステップ</h4>
            <div className="flex flex-wrap gap-2">
              {appliedSteps.map((step, index) => (
                <span key={index} className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm">
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 前処理設定 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 欠損値処理 */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">欠損値処理</h3>
            <select
              value={preprocessingSteps.missingValueStrategy}
              onChange={(e) => setPreprocessingSteps(prev => ({
                ...prev,
                missingValueStrategy: e.target.value
              }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
            >
              <option value="mean">平均値で補完</option>
              <option value="median">中央値で補完</option>
              <option value="mode">最頻値で補完</option>
              <option value="drop">欠損値のあるサンプルを削除</option>
            </select>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">適用する特徴量を選択:</label>
                <button
                  onClick={() => setShowFeatureSelector('missingValue')}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  詳細選択
                </button>
              </div>
              <div className="text-white/50 text-xs mb-2">
                選択済み: {selectedFeaturesForPreprocessing.missingValue.length} / {featureNames.length}
              </div>
            </div>
            
            <button
              onClick={applyMissingValueHandling}
              disabled={isProcessing || selectedFeaturesForPreprocessing.missingValue.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>適用</span>
            </button>
          </div>

          {/* スケーリング */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">スケーリング</h3>
            <select
              value={preprocessingSteps.scalingMethod}
              onChange={(e) => setPreprocessingSteps(prev => ({
                ...prev,
                scalingMethod: e.target.value
              }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
            >
              <option value="none">スケーリングなし</option>
              <option value="standard">標準化 (Z-score)</option>
              <option value="minmax">Min-Max正規化</option>
              <option value="robust">Robust正規化</option>
            </select>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/70 text-sm">適用する特徴量を選択:</label>
                <button
                  onClick={() => setShowFeatureSelector('scaling')}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  詳細選択
                </button>
              </div>
              <div className="text-white/50 text-xs mb-2">
                選択済み: {selectedFeaturesForPreprocessing.scaling.length} / {featureNames.length}
              </div>
            </div>
            
            <button
              onClick={applyScaling}
              disabled={isProcessing || selectedFeaturesForPreprocessing.scaling.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>適用</span>
            </button>
          </div>

          {/* 外れ値処理 */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-3">外れ値処理</h3>
            <select
              value={preprocessingSteps.outlierMethod}
              onChange={(e) => setPreprocessingSteps(prev => ({
                ...prev,
                outlierMethod: e.target.value
              }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
            >
              <option value="none">外れ値処理なし</option>
              <option value="iqr">IQR法</option>
              <option value="zscore">Z-score法</option>
            </select>
            <button
              onClick={applyOutlierHandling}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>適用</span>
            </button>
          </div>

          {/* カテゴリカル変数処理 */}
          {featureTypes && featureTypes.some(type => type === 'categorical') && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">カテゴリカル変数処理</h3>
              <select
                value={preprocessingSteps.categoricalHandling}
                onChange={(e) => setPreprocessingSteps(prev => ({
                  ...prev,
                  categoricalHandling: e.target.value
                }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-3"
              >
                <option value="label">ラベルエンコーディング</option>
                <option value="onehot">ワンホットエンコーディング</option>
                <option value="none">処理なし</option>
              </select>
              <p className="text-white/70 text-sm mb-3">
                カテゴリカル変数: {featureTypes.filter(type => type === 'categorical').length}個
              </p>
              <button
                onClick={applyCategoricalHandling}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>適用</span>
              </button>
            </div>
          )}
        </div>

        {/* 確定ボタン */}
        <div className="text-center mb-6">
          <button
            onClick={finalizePreprocessing}
            disabled={isProcessing}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            前処理を確定
          </button>
        </div>

        {/* 処理ログ */}
        {processingLog.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              処理ログ
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {processingLog.map((log, index) => (
                <div key={index} className="text-sm text-white/70 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 現在のデータ統計 */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
          <h3 className="text-lg font-bold text-white mb-3">現在のデータ統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentData.length}</div>
              <div className="text-sm text-white/70">サンプル数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {currentData[0]?.features?.length || 0}
              </div>
              <div className="text-sm text-white/70">特徴量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {((currentData.length / data.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-white/70">データ保持率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {appliedSteps.length}
              </div>
              <div className="text-sm text-white/70">適用済みステップ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 特徴量選択モーダル */}
      {showFeatureSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {showFeatureSelector === 'missingValue' && '欠損値処理の対象特徴量を選択'}
                {showFeatureSelector === 'scaling' && 'スケーリングの対象特徴量を選択'}
                {showFeatureSelector === 'categorical' && 'カテゴリカル処理の対象特徴量を選択'}
                {showFeatureSelector === 'outlier' && '外れ値処理の対象特徴量を選択'}
              </h2>
              <button
                onClick={() => setShowFeatureSelector(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {featureNames.map((name, index) => {
                const isSelected = selectedFeaturesForPreprocessing[showFeatureSelector].includes(index);
                const isApplicable = showFeatureSelector === 'categorical' ? 
                  featureTypes?.[index] === 'categorical' : 
                  featureTypes?.[index] === 'numerical';
                
                return (
                  <label key={index} className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-gray-100 hover:bg-gray-200'
                  } ${!isApplicable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isApplicable}
                      onChange={(e) => {
                        const newFeatures = e.target.checked
                          ? [...selectedFeaturesForPreprocessing[showFeatureSelector], index]
                          : selectedFeaturesForPreprocessing[showFeatureSelector].filter(i => i !== index);
                        setSelectedFeaturesForPreprocessing(prev => ({
                          ...prev,
                          [showFeatureSelector]: newFeatures
                        }));
                      }}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 text-sm font-medium truncate">{name}</div>
                      <div className="text-gray-500 text-xs">
                        {featureTypes?.[index] === 'categorical' ? 'カテゴリ' : '数値'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-gray-600 text-sm">
                選択済み: {selectedFeaturesForPreprocessing[showFeatureSelector].length} / {featureNames.length} 特徴量
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setSelectedFeaturesForPreprocessing(prev => ({
                      ...prev,
                      [showFeatureSelector]: []
                    }));
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  すべて解除
                </button>
                <button
                  onClick={() => {
                    const applicableFeatures = featureNames
                      .map((_, index) => index)
                      .filter(index => {
                        if (showFeatureSelector === 'categorical') {
                          return featureTypes?.[index] === 'categorical';
                        }
                        return featureTypes?.[index] === 'numerical';
                      });
                    setSelectedFeaturesForPreprocessing(prev => ({
                      ...prev,
                      [showFeatureSelector]: applicableFeatures
                    }));
                  }}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  すべて選択
                </button>
                <button
                  onClick={() => setShowFeatureSelector(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


