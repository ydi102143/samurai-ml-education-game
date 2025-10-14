import { useState, useEffect } from 'react';
import { BarChart3, Info, Download, RefreshCw } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { simpleDataManager } from '../utils/simpleDataManager';

interface EDAPanelProps {
  data: any[];
  problemType: 'classification' | 'regression';
  featureNames?: string[];
  displayFeatureTypes?: ('numerical' | 'categorical')[];
  showProcessedData?: boolean;
  processedDataset?: any;
  currentDataset?: any;
}

// ヒストグラムデータ生成関数
const generateHistogramData = (data: any[], featureIndex: number) => {
  const values = data.map(item => item.features[featureIndex]).filter(val => !isNaN(val) && val !== null && val !== undefined);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = 20;
  const binSize = (max - min) / binCount;
  
  const bins = Array.from({ length: binCount }, (_, i) => ({
    bin: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0
  }));
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex].count++;
  });
  
  return bins;
};

// ボックスプロットデータ生成関数
const generateBoxPlotData = (data: any[], featureIndex: number) => {
  const values = data.map(item => item.features[featureIndex]).filter(val => !isNaN(val) && val !== null && val !== undefined);
  const sorted = values.sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q2 = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  return [
    { category: 'Min', value: min },
    { category: 'Q1', value: q1 },
    { category: 'Median', value: q2 },
    { category: 'Q3', value: q3 },
    { category: 'Max', value: max }
  ];
};

export function EDAPanel({ data, problemType, featureNames: propFeatureNames, displayFeatureTypes: propFeatureTypes, showProcessedData = false, processedDataset, currentDataset }: EDAPanelProps) {
  const [processedData, setProcessedData] = useState<any>(null);
  
  // 処理済みデータを取得（定期的に更新）
  useEffect(() => {
    const updateProcessedData = () => {
      const currentProcessedData = simpleDataManager.getProcessedDataset();
      if (currentProcessedData) {
        setProcessedData(currentProcessedData);
        console.log('EDAPanel: Processed data updated', currentProcessedData);
      }
    };
    
    // 初回取得
    updateProcessedData();
    
    // 定期的に更新
    const interval = setInterval(updateProcessedData, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 表示するデータを決定（動的に切り替え）
  let displayData: any[] = [];
  let displayFeatureNames: string[] = [];
  let displayFeatureTypes: ('numerical' | 'categorical')[] = [];

  console.log('EDAPanel data selection:', {
    showProcessedData,
    hasProcessedDataset: !!processedDataset,
    hasProcessedData: !!processedData,
    dataLength: data?.length,
    currentDatasetFeatureNames: currentDataset?.featureNames?.length
  });

  if (showProcessedData && processedData) {
    // simpleDataManagerからの処理済みデータ（全てのカラムを含む）
    displayData = processedData.data.map((row: any[], i: number) => ({
      features: row,
      target: processedData.targetValues[i] || 0
    }));
    displayFeatureNames = processedData.featureNames;
    displayFeatureTypes = processedData.featureTypes;
    console.log('Using processedData from simpleDataManager:', {
      dataLength: displayData.length,
      featureNamesLength: displayFeatureNames.length,
      featureNames: displayFeatureNames,
      targetValues: processedData.targetValues.slice(0, 5)
    });
  } else if (showProcessedData && processedDataset) {
    // 加工済みデータを表示（全てのカラムを含む）
    displayData = processedDataset.data.map((row: any[], i: number) => ({
      features: row,
      target: processedDataset.targetValues[i] || 0
    }));
    displayFeatureNames = processedDataset.featureNames;
    displayFeatureTypes = processedDataset.featureTypes;
    console.log('Using processedDataset:', {
      dataLength: displayData.length,
      featureNamesLength: displayFeatureNames.length,
      featureNames: displayFeatureNames,
      targetValues: processedDataset.targetValues.slice(0, 5)
    });
  } else {
    // 生データを表示（リアルタイムで更新されたデータ）
    displayData = data || [];
    displayFeatureNames = propFeatureNames || (data && data.length > 0 && data[0] && data[0].features ? 
      Array.from({ length: data[0].features.length }, (_, i) => `特徴量${i + 1}`) : []);
    displayFeatureTypes = propFeatureTypes || displayFeatureNames.map(() => 'numerical' as 'numerical' | 'categorical');
    console.log('Using raw data:', {
      dataLength: displayData.length,
      featureNamesLength: displayFeatureNames.length,
      featureNames: displayFeatureNames,
      firstRowFeatures: displayData[0]?.features?.length,
      firstRowTarget: displayData[0]?.target
    });
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'visualization'>('overview');
  const [visualizationType, setVisualizationType] = useState<'scatter' | 'histogram' | 'boxplot'>('scatter');
  const [selectedXFeature, setSelectedXFeature] = useState<number>(0);
  const [selectedYFeature, setSelectedYFeature] = useState<number>(1);

  // データの基本統計を計算
  const calculateStats = () => {
    if (!displayData || displayData.length === 0 || !displayFeatureNames || displayFeatureNames.length === 0) return null;

    const stats = displayFeatureNames.map((name, index) => {
      const allValues = displayData.map(d => d.features && d.features[index] !== undefined ? d.features[index] : null);
      const validValues = allValues.filter(v => {
        if (v === null || v === undefined) return false;
        if (typeof v === 'number' && isNaN(v)) return false;
        if (typeof v === 'string' && v === 'NaN') return false;
        return true;
      });
      const sorted = validValues.sort((a, b) => a - b);
      
      return {
        name,
        index,
        count: validValues.length,
        mean: validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0,
        median: validValues.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0,
        std: validValues.length > 0 ? Math.sqrt(validValues.reduce((a, b) => a + Math.pow(b - (validValues.reduce((a, b) => a + b, 0) / validValues.length), 2), 0) / validValues.length) : 0,
        min: validValues.length > 0 ? Math.min(...validValues) : 0,
        max: validValues.length > 0 ? Math.max(...validValues) : 0,
        missing: allValues.length - validValues.length
      };
    });

    return stats;
  };


  // ターゲットの分布を計算
  const calculateTargetDistribution = () => {
    if (!displayData || displayData.length === 0) return null;

    const targetValues = displayData.map(d => d.label).filter(v => !isNaN(v) && v !== null && v !== undefined);
    
        if (problemType === 'classification') {
          const uniqueValues = [...new Set(targetValues)];
          const distribution = uniqueValues.map(value => ({
            value,
            count: targetValues.filter(v => v === value).length,
            percentage: (targetValues.filter(v => v === value).length / targetValues.length) * 100
          }));
          return { type: 'classification', data: distribution.sort((a, b) => b.count - a.count) };
        } else {
          // 回帰問題の場合、統計値を計算
          const sorted = targetValues.sort((a, b) => a - b);
          const mean = targetValues.reduce((a, b) => a + b, 0) / targetValues.length;
          const std = Math.sqrt(targetValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / targetValues.length);
          
          return {
            type: 'regression',
            data: [{
              mean,
              std,
              min: Math.min(...targetValues),
              max: Math.max(...targetValues),
              median: sorted[Math.floor(sorted.length / 2)],
              count: targetValues.length
            }]
          };
        }
  };



  const stats = calculateStats();
  const targetDist = calculateTargetDistribution();

  if (!displayData || displayData.length === 0 || !displayFeatureNames || displayFeatureNames.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats || !targetDist) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-white/70">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            データ探索・分析 (EDA)
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">
                データ表示
              </span>
              {processedDataset && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  前処理済み
                </span>
              )}
              <button
                onClick={() => {
                  const newProcessedData = simpleDataManager.getProcessedDataset();
                  if (newProcessedData) {
                    setProcessedData(newProcessedData);
                  }
                }}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
                title="データを更新"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* タブナビゲーション */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-xl p-1">
          {[
            { id: 'overview', label: '概要', icon: Info, emoji: '📊' },
            { id: 'data', label: 'データ表示', icon: Download, emoji: '📋' },
            { id: 'visualization', label: '可視化', icon: BarChart3, emoji: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                データ概要
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-300 mb-2">{displayData.length}</div>
                  <div className="text-sm text-white/80 font-medium">サンプル数</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                  <div className="text-3xl font-bold text-green-300 mb-2">{displayFeatureNames.length}</div>
                  <div className="text-sm text-white/80 font-medium">特徴量数</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                  <div className="text-3xl font-bold text-purple-300 mb-2">
                    {problemType === 'classification' ? '分類' : '回帰'}
                  </div>
                  <div className="text-sm text-white/80 font-medium">問題タイプ</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-300 mb-2">
                    {problemType === 'classification' ? 
                      (targetDist as any)?.length || 0 : 
                      '∞'
                    }
                  </div>
                  <div className="text-sm text-white/80 font-medium">
                    {problemType === 'classification' ? 'クラス数' : '連続値'}
                  </div>
                </div>
              </div>
              
              {/* 特徴量の詳細情報 */}
              <div className="mt-8">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="text-2xl mr-2">🔍</span>
                  特徴量詳細
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayFeatureNames.map((name, index) => {
                    if (!displayData || displayData.length === 0) {
                      return (
                        <div key={index} className="bg-white/10 rounded-xl p-5 border border-white/20">
                          <h5 className="font-bold text-white mb-2">{name}</h5>
                          <p className="text-white/60">データがありません</p>
                        </div>
                      );
                    }
                    
                    const values = displayData.map(item => {
                      if (!item || !item.features || !Array.isArray(item.features)) {
                        return null;
                      }
                      return item.features[index];
                    }).filter(val => {
                      if (val === null || val === undefined) return false;
                      if (typeof val === 'number' && isNaN(val)) return false;
                      if (typeof val === 'string' && val === 'NaN') return false;
                      return true;
                    });
                    const missingCount = displayData.length - values.length;
                    const isNumerical = displayFeatureTypes?.[index] === 'numerical';
                    
                    return (
                      <div key={index} className="bg-white/10 rounded-xl p-5 border border-white/20 hover:border-white/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-white text-lg">{name}</h5>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isNumerical ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {isNumerical ? '数値' : 'カテゴリ'}
                          </span>
                        </div>
                        <div className="text-sm text-white/70">
                          欠損値: {missingCount}件 ({((missingCount / displayData.length) * 100).toFixed(1)}%)
                        </div>
                        {isNumerical && values.length > 0 && (
                          <div className="text-sm text-white/70 mt-1">
                            範囲: {Math.min(...values).toFixed(2)} - {Math.max(...values).toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visualization' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">グラフ表示</h3>
              
            {/* グラフタイプ選択 */}
            <div className="mb-4">
              <label className="text-white/70 text-sm mb-2 block">グラフタイプ</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'scatter', label: '散布図', icon: '📈' },
                  { value: 'histogram', label: 'ヒストグラム', icon: '📊' },
                  { value: 'boxplot', label: 'ボックスプロット', icon: '📦' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setVisualizationType(type.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      visualizationType === type.value
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

              {/* 特徴量選択 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">X軸特徴量</label>
                  <select
                    value={selectedXFeature}
                    onChange={(e) => setSelectedXFeature(Number(e.target.value))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {displayFeatureNames.map((name, index) => (
                      <option key={index} value={index}>{name} ({displayFeatureTypes?.[index] === 'categorical' ? 'カテゴリカル' : '数値'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Y軸特徴量</label>
                  <select
                    value={selectedYFeature}
                    onChange={(e) => setSelectedYFeature(Number(e.target.value))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {displayFeatureNames.map((name, index) => (
                      <option key={index} value={index}>{name} ({displayFeatureTypes?.[index] === 'categorical' ? 'カテゴリカル' : '数値'})</option>
                    ))}
                  </select>
                </div>
              </div>

            {/* グラフ表示エリア */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/20 min-h-[400px]">
              {visualizationType === 'scatter' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">散布図: {displayFeatureNames[selectedXFeature]} vs {displayFeatureNames[selectedYFeature]}</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={displayData.map((item) => {
                        const xValue = item.features[selectedXFeature];
                        const yValue = item.features[selectedYFeature];
                        const targetValue = item.target || item.label;
                        
                        return {
                          x: (typeof xValue === 'number' && !isNaN(xValue)) ? xValue : 0,
                          y: (typeof yValue === 'number' && !isNaN(yValue)) ? yValue : 0,
                          label: targetValue !== null && targetValue !== undefined ? targetValue : 'N/A'
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name={displayFeatureNames[selectedXFeature]}
                          stroke="#9CA3AF"
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name={displayFeatureNames[selectedYFeature]}
                          stroke="#9CA3AF"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Scatter 
                          dataKey="y" 
                          fill="#3B82F6" 
                          fillOpacity={0.6}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {visualizationType === 'histogram' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">ヒストグラム: {displayFeatureNames[selectedXFeature]}</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateHistogramData(displayData, selectedXFeature)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="bin" 
                          stroke="#9CA3AF"
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {visualizationType === 'boxplot' && (
                <div className="space-y-4">
                  <h4 className="text-white font-bold">ボックスプロット: {displayFeatureNames[selectedXFeature]}</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateBoxPlotData(displayData, selectedXFeature)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="category" 
                          stroke="#9CA3AF"
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Bar dataKey="value" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        )}






        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">データ表示</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-white/70 text-sm">
                    全 {displayData.length} 行
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="p-2 text-white/80 text-left">行番号</th>
                      {displayFeatureNames.map((name, index) => (
                        <th key={index} className="p-2 text-white/80 text-left min-w-[100px]">
                          <div className="flex flex-col">
                            <span className="font-bold">{name}</span>
                            <span className="text-xs text-white/60">
                              {displayFeatureTypes?.[index] === 'categorical' ? 'カテゴリ' : '数値'}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="p-2 text-white/80 text-left">ターゲット</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-2 text-white/60">
                          {rowIndex + 1}
                        </td>
                        {row.features.map((value: any, colIndex: number) => (
                          <td key={colIndex} className="p-2 text-white">
                            {(() => {
                              // 値がnull、undefined、またはNaNの場合はNaNを表示
                              if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
                                return <span className="text-red-400 font-bold">NaN</span>;
                              }
                              
                              // カテゴリカル変数の場合
                              if (displayFeatureTypes?.[colIndex] === 'categorical') {
                                return <span className="text-blue-300">{String(value)}</span>;
                              } else {
                                // 数値変数の場合
                                return <span className="text-green-300">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>;
                              }
                            })()}
                          </td>
                        ))}
                        <td className="p-2 text-yellow-300 font-bold">
                          {(() => {
                            const targetValue = row.target || row.label;
                            if (targetValue === null || targetValue === undefined || (typeof targetValue === 'number' && isNaN(targetValue))) {
                              return <span className="text-red-400 font-bold">NaN</span>;
                            }
                            if (problemType === 'classification') {
                              return typeof targetValue === 'string' ? targetValue : `クラス${targetValue}`;
                            } else {
                              return typeof targetValue === 'number' ? targetValue.toFixed(2) : String(targetValue);
                            }
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-white/60 text-xs">
                全 {displayData.length} 行を表示中
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


