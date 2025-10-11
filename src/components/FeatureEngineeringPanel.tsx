import { useState } from 'react';
import { Wrench, Plus, Trash2, Calculator, Target, CheckSquare, BarChart3, Layers, Filter, Zap } from 'lucide-react';

interface FeatureEngineeringPanelProps {
  data: any[];
  featureNames: string[];
  featureTypes?: ('numerical' | 'categorical')[];
  onEngineeredData: (data: any[], featureNames: string[]) => void;
  onFeatureSelect: (features: number[]) => void;
  selectedFeatures: number[];
}

interface FeatureOperation {
  id: string;
  type: 'polynomial' | 'interaction' | 'log' | 'sqrt' | 'square' | 'ratio' | 'difference' | 'sum' | 'mean' | 'std' | 'target_encoding' | 'onehot_encoding' | 'label_encoding' | 'aggregation' | 'pca' | 'lda' | 'tsne' | 'umap';
  name: string;
  description: string;
  features: number[];
  params?: any;
  customName?: string; // カスタム名を追加
}

export function FeatureEngineeringPanel({ data, featureNames, featureTypes, onEngineeredData, onFeatureSelect, selectedFeatures }: FeatureEngineeringPanelProps) {
  const [operations, setOperations] = useState<FeatureOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineeredData, setEngineeredData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'creation' | 'transformation' | 'aggregation' | 'reduction'>('creation');
  const [currentFeatureNames, setCurrentFeatureNames] = useState<string[]>(featureNames);

  // 新しい特徴量操作を追加
  const addOperation = (type: FeatureOperation['type']) => {
    const baseName = getOperationName(type);
    const newOperation: FeatureOperation = {
      id: `op_${Date.now()}`,
      type,
      name: baseName,
      description: getOperationDescription(type),
      features: [], // 空で開始、ユーザーが選択
      params: getDefaultParams(type),
      customName: baseName // カスタム名を追加
    };
    setOperations(prev => [...prev, newOperation]);
  };

  // 操作の特徴量を更新
  const updateOperationFeatures = (id: string, features: number[]) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, features } : op
    ));
  };

  const getOperationName = (type: FeatureOperation['type']) => {
    const names = {
      polynomial: '多項式特徴量',
      interaction: '交互作用特徴量',
      log: '対数変換',
      sqrt: '平方根変換',
      square: '二乗特徴量',
      ratio: '比率特徴量',
      difference: '差分特徴量',
      sum: '合計特徴量',
      mean: '平均特徴量',
      std: '標準偏差特徴量',
      target_encoding: 'ターゲットエンコーディング',
      onehot_encoding: 'ワンホットエンコーディング',
      label_encoding: 'ラベルエンコーディング'
    };
    return names[type];
  };

  const getOperationDescription = (type: FeatureOperation['type']) => {
    const descriptions = {
      polynomial: '選択した特徴量の多項式項を生成',
      interaction: '選択した特徴量間の交互作用項を生成',
      log: '選択した特徴量の対数変換を適用',
      sqrt: '選択した特徴量の平方根変換を適用',
      square: '選択した特徴量の二乗を計算',
      ratio: '選択した特徴量の比率を計算',
      difference: '選択した特徴量の差分を計算',
      sum: '選択した特徴量の合計を計算',
      mean: '選択した特徴量の平均を計算',
      std: '選択した特徴量の標準偏差を計算',
      target_encoding: 'カテゴリカル変数をターゲットの平均でエンコーディング',
      onehot_encoding: 'カテゴリカル変数をワンホットエンコーディング',
      label_encoding: 'カテゴリカル変数をラベルエンコーディング'
    };
    return descriptions[type];
  };

  const getDefaultParams = (type: FeatureOperation['type']) => {
    switch (type) {
      case 'polynomial':
        return { degree: 2 };
      case 'interaction':
        return { includeSelf: false };
      default:
        return {};
    }
  };

  // 特徴量操作を削除
  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
  };

  // 特徴量操作を実行
  const executeOperations = async () => {
    setIsProcessing(true);
    
    try {
      let processedData = [...data];
      let currentFeatureNames = [...featureNames];
      let currentSelectedFeatures = [...selectedFeatures];

      for (const operation of operations) {
        const result = await executeOperation(processedData, currentFeatureNames, operation);
        processedData = result.data;
        currentFeatureNames = result.featureNames;
        currentSelectedFeatures = result.selectedFeatures;
      }

      // 特徴量エンジニアリング後のデータを保存
      setEngineeredData(processedData);
      setCurrentFeatureNames(currentFeatureNames);
      
      // 親コンポーネントに新しいデータを通知
      onEngineeredData(processedData, currentFeatureNames);
      
      console.log('特徴量エンジニアリング完了:', processedData.length, 'サンプル,', currentFeatureNames.length, '特徴量');

    } catch (error) {
      console.error('特徴エンジニアリングエラー:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 個別の特徴量操作を実行
  const executeOperation = async (data: any[], featureNames: string[], operation: FeatureOperation) => {
    const newFeatures: number[] = [];
    const newFeatureNames: string[] = [...featureNames];

    switch (operation.type) {
      case 'polynomial':
        for (const featureIndex of operation.features) {
          const values = data.map(d => d.features[featureIndex]);
          const degree = operation.params?.degree || 2;
          
          for (let d = 2; d <= degree; d++) {
            const polyValues = values.map(v => Math.pow(v, d));
            newFeatures.push(data[0].features.length + newFeatures.length);
            
            data = data.map((d, i) => ({
              ...d,
              features: [...d.features, polyValues[i]]
            }));
            
            newFeatureNames.push(`${featureNames[featureIndex]}^${d}`);
          }
        }
        break;

      case 'interaction':
        for (let i = 0; i < operation.features.length; i++) {
          for (let j = i + 1; j < operation.features.length; j++) {
            const feature1 = operation.features[i];
            const feature2 = operation.features[j];
            
            const values1 = data.map(d => d.features[feature1]);
            const values2 = data.map(d => d.features[feature2]);
            
            const interactionValues = values1.map((v1, idx) => v1 * values2[idx]);
            newFeatures.push(data[0].features.length + newFeatures.length);
            
            data = data.map((d, idx) => ({
              ...d,
              features: [...d.features, interactionValues[idx]]
            }));
            
            newFeatureNames.push(`${featureNames[feature1]} × ${featureNames[feature2]}`);
          }
        }
        break;

      case 'log':
        for (const featureIndex of operation.features) {
          const values = data.map(d => d.features[featureIndex]);
          const logValues = values.map(v => Math.log(Math.abs(v) + 1)); // +1 to avoid log(0)
          newFeatures.push(data[0].features.length + newFeatures.length);
          
          data = data.map((d, i) => ({
            ...d,
            features: [...d.features, logValues[i]]
          }));
          
          newFeatureNames.push(`log(${featureNames[featureIndex]})`);
        }
        break;

      case 'sqrt':
        for (const featureIndex of operation.features) {
          const values = data.map(d => d.features[featureIndex]);
          const sqrtValues = values.map(v => Math.sqrt(Math.abs(v)));
          newFeatures.push(data[0].features.length + newFeatures.length);
          
          data = data.map((d, i) => ({
            ...d,
            features: [...d.features, sqrtValues[i]]
          }));
          
          newFeatureNames.push(`sqrt(${featureNames[featureIndex]})`);
        }
        break;

      case 'square':
        for (const featureIndex of operation.features) {
          const values = data.map(d => d.features[featureIndex]);
          const squareValues = values.map(v => v * v);
          newFeatures.push(data[0].features.length + newFeatures.length);
          
          data = data.map((d, i) => ({
            ...d,
            features: [...d.features, squareValues[i]]
          }));
          
          newFeatureNames.push(`${featureNames[featureIndex]}^2`);
        }
        break;

      case 'ratio':
        if (operation.features.length >= 2) {
          const feature1 = operation.features[0];
          const feature2 = operation.features[1];
          
          const values1 = data.map(d => d.features[feature1]);
          const values2 = data.map(d => d.features[feature2]);
          
          const ratioValues = values1.map((v1, idx) => 
            values2[idx] === 0 ? 0 : v1 / values2[idx]
          );
          newFeatures.push(data[0].features.length + newFeatures.length);
          
          data = data.map((d, idx) => ({
            ...d,
            features: [...d.features, ratioValues[idx]]
          }));
          
          newFeatureNames.push(`${featureNames[feature1]} / ${featureNames[feature2]}`);
        }
        break;

      case 'difference':
        if (operation.features.length >= 2) {
          const feature1 = operation.features[0];
          const feature2 = operation.features[1];
          
          const values1 = data.map(d => d.features[feature1]);
          const values2 = data.map(d => d.features[feature2]);
          
          const diffValues = values1.map((v1, idx) => v1 - values2[idx]);
          newFeatures.push(data[0].features.length + newFeatures.length);
          
          data = data.map((d, idx) => ({
            ...d,
            features: [...d.features, diffValues[idx]]
          }));
          
          newFeatureNames.push(`${featureNames[feature1]} - ${featureNames[feature2]}`);
        }
        break;

      case 'sum':
        const sumValues = data.map(d => 
          operation.features.reduce((sum, idx) => sum + d.features[idx], 0)
        );
        newFeatures.push(data[0].features.length + newFeatures.length);
        
        data = data.map((d, i) => ({
          ...d,
          features: [...d.features, sumValues[i]]
        }));
        
        newFeatureNames.push(`sum(${operation.features.map(i => featureNames[i]).join(', ')})`);
        break;

      case 'mean':
        const meanValues = data.map(d => {
          const values = operation.features.map(idx => d.features[idx]);
          return values.reduce((sum, v) => sum + v, 0) / values.length;
        });
        newFeatures.push(data[0].features.length + newFeatures.length);
        
        data = data.map((d, i) => ({
          ...d,
          features: [...d.features, meanValues[i]]
        }));
        
        newFeatureNames.push(`mean(${operation.features.map(i => featureNames[i]).join(', ')})`);
        break;

      case 'std':
        const stdValues = data.map(d => {
          const values = operation.features.map(idx => d.features[idx]);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
          return Math.sqrt(variance);
        });
        newFeatures.push(data[0].features.length + newFeatures.length);
        
        data = data.map((d, i) => ({
          ...d,
          features: [...d.features, stdValues[i]]
        }));
        
        newFeatureNames.push(`std(${operation.features.map(i => featureNames[i]).join(', ')})`);
        break;
    }

    return {
      data,
      featureNames: newFeatureNames,
      selectedFeatures: [...selectedFeatures, ...newFeatures]
    };
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Wrench className="w-6 h-6 mr-2" />
          🔧 特徴量エンジニアリング & 選択 🔧
        </h2>
        <p className="text-white/80 mt-2">特徴量の作成・変換・選択・集約・次元削減を行いましょう</p>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white/5 p-4">
        <div className="flex space-x-2 flex-wrap">
          {[
            { id: 'creation', label: '特徴量作成', icon: Plus },
            { id: 'transformation', label: '特徴量変換', icon: Zap },
            { id: 'aggregation', label: '集約特徴', icon: BarChart3 },
            { id: 'reduction', label: '次元削減', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* 特徴量作成タブ */}
        {activeTab === 'creation' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">特徴量操作を追加</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { type: 'polynomial', icon: Calculator, label: '多項式' },
              { type: 'interaction', icon: Target, label: '交互作用' },
              { type: 'log', icon: Calculator, label: '対数' },
              { type: 'sqrt', icon: Calculator, label: '平方根' },
              { type: 'square', icon: Calculator, label: '二乗' },
              { type: 'ratio', icon: Calculator, label: '比率' },
              { type: 'difference', icon: Calculator, label: '差分' },
              { type: 'sum', icon: Calculator, label: '合計' },
              { type: 'mean', icon: Calculator, label: '平均' },
              { type: 'std', icon: Calculator, label: '標準偏差' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addOperation(type as FeatureOperation['type'])}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-all duration-300"
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{label}</div>
              </button>
            ))}
              </div>
            </div>

            {/* 操作一覧 */}
            {operations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">追加された操作</h3>
                <div className="space-y-3">
                  {operations.map((operation, index) => (
                    <div key={operation.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={operation.customName || operation.name}
                              onChange={(e) => {
                                const newOperations = [...operations];
                                newOperations[index].customName = e.target.value;
                                setOperations(newOperations);
                              }}
                              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-bold"
                              placeholder="特徴量名を入力"
                            />
                          </div>
                          <p className="text-sm text-white/70">{operation.description}</p>
                        </div>
                        <button
                          onClick={() => removeOperation(operation.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-white/70">使用する特徴量を選択:</label>
                          <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                            {featureNames.map((name, index) => (
                              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={operation.features.includes(index)}
                                  onChange={(e) => {
                                    const newFeatures = e.target.checked
                                      ? [...operation.features, index]
                                      : operation.features.filter(i => i !== index);
                                    updateOperationFeatures(operation.id, newFeatures);
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                                />
                                <span className="text-white text-sm">{name}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {operation.features.map(featureIndex => (
                              <span
                                key={featureIndex}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                              >
                                {featureNames[featureIndex]}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {operation.type === 'polynomial' && (
                          <div>
                            <label className="text-sm text-white/70">次数:</label>
                            <input
                              type="number"
                              min="2"
                              max="5"
                              value={operation.params?.degree || 2}
                              onChange={(e) => {
                                const newOperations = [...operations];
                                newOperations[index].params = {
                                  ...newOperations[index].params,
                                  degree: parseInt(e.target.value)
                                };
                                setOperations(newOperations);
                              }}
                              className="ml-2 w-16 p-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 特徴量選択タブ */}
        {activeTab === 'selection' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">特徴量選択</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentFeatureNames.map((name, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onFeatureSelect([...selectedFeatures, index]);
                        } else {
                          onFeatureSelect(selectedFeatures.filter(i => i !== index));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{name}</div>
                      <div className="text-white/50 text-xs">
                        {featureTypes?.[index] === 'categorical' ? 'カテゴリカル' : '数値'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-white/70 text-sm">
                選択済み: {selectedFeatures.length} / {currentFeatureNames.length} 特徴量
              </div>
            </div>
          </div>
        )}

        {/* 特徴量変換タブ */}
        {activeTab === 'transformation' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">特徴量変換</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { type: 'log', label: '対数変換', description: 'log(x + 1)', applicable: 'numerical' },
                  { type: 'sqrt', label: '平方根変換', description: '√x', applicable: 'numerical' },
                  { type: 'square', label: '二乗変換', description: 'x²', applicable: 'numerical' },
                  { type: 'normalize', label: '正規化', description: '(x - min) / (max - min)', applicable: 'numerical' },
                  { type: 'standardize', label: '標準化', description: '(x - mean) / std', applicable: 'numerical' },
                  { type: 'robust_scale', label: 'ロバストスケール', description: '(x - median) / IQR', applicable: 'numerical' },
                  { type: 'target_encoding', label: 'ターゲットエンコーディング', description: 'カテゴリカル変数をターゲットの平均でエンコーディング', applicable: 'categorical' },
                  { type: 'onehot_encoding', label: 'ワンホットエンコーディング', description: 'カテゴリカル変数をワンホットエンコーディング', applicable: 'categorical' },
                  { type: 'label_encoding', label: 'ラベルエンコーディング', description: 'カテゴリカル変数をラベルエンコーディング', applicable: 'categorical' }
                ].map(({ type, label, description, applicable }) => (
                  <button
                    key={type}
                    onClick={() => addOperation(type as FeatureOperation['type'])}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-all duration-300 text-left"
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-white/60 mt-1">{description}</div>
                    <div className="text-xs text-blue-300 mt-1">
                      {applicable === 'numerical' ? '数値変数用' : 'カテゴリカル変数用'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作一覧 */}
            {operations.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">追加された操作</h3>
                <div className="space-y-3">
                  {operations.map((operation, index) => (
                    <div key={operation.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={operation.customName || operation.name}
                              onChange={(e) => {
                                const newOperations = [...operations];
                                newOperations[index].customName = e.target.value;
                                setOperations(newOperations);
                              }}
                              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm font-bold"
                              placeholder="特徴量名を入力"
                            />
                          </div>
                          <p className="text-sm text-white/70">{operation.description}</p>
                        </div>
                        <button
                          onClick={() => removeOperation(operation.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 特徴量選択 */}
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-white mb-2">適用する特徴量を選択</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {currentFeatureNames.map((name, featureIndex) => {
                            const isSelected = operation.features.includes(featureIndex);
                            const isApplicable = operation.type.includes('encoding') ? 
                              featureTypes?.[featureIndex] === 'categorical' : 
                              featureTypes?.[featureIndex] === 'numerical';
                            
                            return (
                              <label key={featureIndex} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${
                                isSelected ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-white/5 hover:bg-white/10'
                              } ${!isApplicable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!isApplicable}
                                  onChange={(e) => {
                                    const newFeatures = e.target.checked
                                      ? [...operation.features, featureIndex]
                                      : operation.features.filter(i => i !== featureIndex);
                                    updateOperationFeatures(operation.id, newFeatures);
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-white text-xs font-medium truncate">{name}</div>
                                  <div className="text-white/50 text-xs">
                                    {featureTypes?.[featureIndex] === 'categorical' ? 'カテゴリ' : '数値'}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-white/70 text-xs">
                          選択済み: {operation.features.length} / {currentFeatureNames.length} 特徴量
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 集約特徴タブ */}
        {activeTab === 'aggregation' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">集約特徴</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { type: 'sum', label: '合計', description: '選択した特徴量の合計', applicable: 'numerical' },
                  { type: 'mean', label: '平均', description: '選択した特徴量の平均', applicable: 'numerical' },
                  { type: 'std', label: '標準偏差', description: '選択した特徴量の標準偏差', applicable: 'numerical' },
                  { type: 'aggregation', label: 'カスタム集約', description: '複数の集約関数を組み合わせ', applicable: 'numerical' }
                ].map(({ type, label, description, applicable }) => (
                  <button
                    key={type}
                    onClick={() => addOperation(type as FeatureOperation['type'])}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-all duration-300 text-left"
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-white/60 mt-1">{description}</div>
                    <div className="text-xs text-blue-300 mt-1">
                      {applicable === 'numerical' ? '数値変数用' : 'カテゴリカル変数用'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 次元削減タブ */}
        {activeTab === 'reduction' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">次元削減</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { type: 'pca', label: 'PCA', description: '主成分分析', applicable: 'numerical' },
                  { type: 'lda', label: 'LDA', description: '線形判別分析', applicable: 'numerical' },
                  { type: 'tsne', label: 't-SNE', description: 't分布確率的近傍埋め込み', applicable: 'numerical' },
                  { type: 'umap', label: 'UMAP', description: '一様多様体近似と投影', applicable: 'numerical' }
                ].map(({ type, label, description, applicable }) => (
                  <button
                    key={type}
                    onClick={() => addOperation(type as FeatureOperation['type'])}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-all duration-300 text-left"
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-white/60 mt-1">{description}</div>
                    <div className="text-xs text-blue-300 mt-1">
                      {applicable === 'numerical' ? '数値変数用' : 'カテゴリカル変数用'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 実行ボタン */}
        {operations.length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={executeOperations}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 ${
                isProcessing
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Wrench className="w-5 h-5 inline mr-2 animate-spin" />
                  特徴エンジニアリング実行中...
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5 inline mr-2" />
                  特徴エンジニアリングを実行
                </>
              )}
            </button>
          </div>
        )}

        {/* 結果表示 */}
        {engineeredData.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
            <h3 className="text-lg font-bold text-white mb-3">特徴エンジニアリング結果</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{engineeredData.length}</div>
                <div className="text-sm text-white/70">サンプル数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {engineeredData[0]?.features?.length || 0}
                </div>
                <div className="text-sm text-white/70">特徴量数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {operations.length}
                </div>
                <div className="text-sm text-white/70">実行操作数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {((engineeredData[0]?.features?.length || 0) / featureNames.length).toFixed(1)}x
                </div>
                <div className="text-sm text-white/70">特徴量増加率</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
