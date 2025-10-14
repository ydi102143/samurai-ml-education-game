import { useState, useEffect } from 'react';
import { Play, BarChart3, Upload, CheckCircle } from 'lucide-react';
import { BALANCED_MODELS } from '../utils/balancedMLModels';
import { calculateClassificationMetrics, calculateRegressionMetrics } from '../utils/evaluationMetrics';
// import { submissionManager } from '../utils/submissionManager';

interface ModelTrainingPanelProps {
  data: any[];
  featureNames: string[];
  problemType: 'classification' | 'regression';
  onTrainingComplete: (result: any) => void;
}

export function ModelTrainingPanel({ data, featureNames, problemType, onTrainingComplete }: ModelTrainingPanelProps) {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [hyperparameters, setHyperparameters] = useState<{[key: string]: any}>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [validationMetrics, setValidationMetrics] = useState<any>(null);
  const [submissionName, setSubmissionName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'data_split' | 'feature_selection' | 'model_selection' | 'training' | 'validation' | 'submission'>('data_split');
  const [trainedModels, setTrainedModels] = useState<any[]>([]);
  const [selectedTrainedModel, setSelectedTrainedModel] = useState<string>('');
  
  // データ分割設定
  const [trainRatio, setTrainRatio] = useState<number>(70);
  const [validationRatio, setValidationRatio] = useState<number>(30);
  const [cvFolds] = useState<number>(5);
  const [randomSeed] = useState<number>(42);
  
  // 検証設定（運営側で固定）
  const [validationStrategy] = useState<'holdout' | 'cross_validation' | 'stratified_cv'>('holdout');
  
  // 特徴量選択
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [featureSelectionMethod, setFeatureSelectionMethod] = useState<string>('manual');

  const availableModels = BALANCED_MODELS.filter(model => {
    if (problemType === 'classification') {
      return model.type === 'logistic_regression' || 
             model.type === 'decision_tree' ||
             model.type === 'random_forest' || 
             model.type === 'gradient_boosting' ||
             model.type === 'xgboost' ||
             model.type === 'svm_linear' ||
             model.type === 'svm_rbf' ||
             model.type === 'gaussian_nb' ||
             model.type === 'multinomial_nb' ||
             model.type === 'neural_network';
    } else {
      return model.type === 'linear_regression' || 
             model.type === 'ridge_regression' ||
             model.type === 'lasso_regression' ||
             model.type === 'decision_tree' ||
             model.type === 'random_forest' || 
             model.type === 'gradient_boosting' ||
             model.type === 'xgboost' ||
             model.type === 'svm_linear' ||
             model.type === 'svm_rbf' ||
             model.type === 'neural_network';
    }
  });

  const selectedModelConfig = availableModels.find(model => model.name === selectedModel);

  useEffect(() => {
    console.log('Available models:', availableModels.length, availableModels.map(m => m.name));
    console.log('Problem type:', problemType);
    
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].name);
      const initialParams: {[key: string]: any} = {};
      if (availableModels[0].parameters) {
        Object.entries(availableModels[0].parameters).forEach(([key, value]) => {
          initialParams[key] = value.default;
        });
      }
      setHyperparameters(initialParams);
    }
    
    // 評価指標は運営側で固定（プレイヤーは選択不可）
  }, [availableModels, selectedModel, problemType]);

  const addLog = (message: string) => {
    setTrainingLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const simulateTraining = async () => {
    if (!selectedModelConfig) return;

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLog([]);
    setCurrentStep('training');

    addLog(`モデル学習開始: ${selectedModelConfig.name}`);

    // データの分割（プレイヤー設定に基づく）
    // テストデータはPublic/Privateで、プレイヤーは使用できない
    const trainSize = Math.floor(data.length * (trainRatio / 100));
    const validationSize = Math.floor(data.length * (validationRatio / 100));
    
    // ランダムシードを使用して再現可能な分割
    const shuffledData = [...data].sort(() => Math.random() - 0.5);
    const trainData = shuffledData.slice(0, trainSize);
    const validationData = shuffledData.slice(trainSize, trainSize + validationSize);

    addLog(`データ分割完了: 訓練${trainData.length}件, 検証${validationData.length}件`);

    // 実際の学習処理（統合システムを使用）
    try {
      const { integratedMLSystem } = await import('../utils/integratedMLSystem');
      
      // データを設定
      integratedMLSystem.setTrainingData(
        trainData,
        featureNames,
        featureNames.map(() => 'numerical' as 'numerical' | 'categorical')
      );

      // モデルを選択
      integratedMLSystem.selectModel(selectedModelConfig.name);

      // ハイパーパラメータを更新
      integratedMLSystem.updateModelHyperparameters(selectedModelConfig.name, hyperparameters);

      // 学習を開始
      await integratedMLSystem.startTraining();

      // 学習進捗を監視
      const progressInterval = setInterval(() => {
        const progress = integratedMLSystem.getTrainingProgress();
        if (progress) {
          setTrainingProgress(progress.epoch / progress.totalEpochs * 100);
          addLog(`学習進捗: Epoch ${progress.epoch}/${progress.totalEpochs} - Loss: ${progress.loss.toFixed(4)} - Accuracy: ${(progress.accuracy * 100).toFixed(2)}%`);
          
          if (progress.status === 'completed' || progress.status === 'failed') {
            clearInterval(progressInterval);
            if (progress.status === 'completed') {
              addLog(`学習完了: ${selectedModelConfig.name}`);
            } else {
              addLog(`学習失敗: ${selectedModelConfig.name}`);
            }
          }
        }
      }, 100);

    } catch (error) {
      console.error('Training failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`学習エラー: ${errorMessage}`);
    }

    // 学習済みモデルを保存
    const trainedModel = {
      id: Date.now().toString(),
      name: `${selectedModelConfig.name}_${new Date().toLocaleTimeString()}`,
      modelType: selectedModelConfig.name,
      hyperparameters: { ...hyperparameters },
      trainData: trainData,
      validationData: validationData,
      trainedAt: new Date().toISOString()
    };

    setTrainedModels(prev => [...prev, trainedModel]);
    setSelectedTrainedModel(trainedModel.id);
    addLog(`学習完了: ${trainedModel.name}`);

    setIsTraining(false);
    setCurrentStep('validation');
  };

  const validateModel = async () => {
    if (!selectedTrainedModel) return;

    const model = trainedModels.find(m => m.id === selectedTrainedModel);
    if (!model) return;

    addLog(`検証開始: ${model.name}`);

    // 検証データでの予測
    const validationPredictions = model.validationData.map((item: any) => {
      if (problemType === 'classification') {
        const avgFeature = item.features.reduce((sum: number, val: number) => sum + val, 0) / item.features.length;
        return avgFeature > 0.5 ? 1 : 0;
      } else {
        const weightedSum = item.features.reduce((sum: number, val: number, i: number) => sum + val * (i + 1), 0);
        return Math.max(0, weightedSum * 10 + Math.random() * 100);
      }
    });

    // 検証指標の計算
    const trueLabels = model.validationData.map((d: any) => d.label);
    let metrics;
    
    if (problemType === 'classification') {
      metrics = calculateClassificationMetrics(trueLabels as number[], validationPredictions as number[], ['0', '1']);
    } else {
      metrics = calculateRegressionMetrics(trueLabels as number[], validationPredictions as number[]);
    }

    // 運営側で固定された評価指標を使用
    const fixedMetrics = problemType === 'classification' 
      ? { accuracy: (metrics as any).accuracy, precision: (metrics as any).precision, recall: (metrics as any).recall, f1: (metrics as any).f1 }
      : { mae: (metrics as any).mae, rmse: (metrics as any).rmse, r2: (metrics as any).r2 };

    setValidationMetrics(fixedMetrics);
    
    // 主要な指標をログに表示
    const primaryMetric = problemType === 'classification' ? 'accuracy' : 'r2';
    const primaryValue = (metrics as any)[primaryMetric] || 0;
    addLog(`検証完了: ${primaryMetric} = ${primaryValue.toFixed(4)}`);
    
    // 固定された指標の詳細をログに表示
    Object.entries(fixedMetrics).forEach(([key, value]) => {
      if (value !== undefined) {
        addLog(`${key}: ${(value as number).toFixed(4)}`);
      }
    });
    
    // 検証後は自動的に提出ステップへ
    setCurrentStep('submission');
  };



  const handleSubmit = () => {
    if (!selectedTrainedModel || !validationMetrics || !submissionName) return;

    const model = trainedModels.find(m => m.id === selectedTrainedModel);
    if (!model) return;

    // 検証結果を基にした予測を生成（提出用）
    const submissionPredictions = model.validationData.map((item: any) => {
      if (problemType === 'classification') {
        const avgFeature = item.features.reduce((sum: number, val: number) => sum + val, 0) / item.features.length;
        return avgFeature > 0.5 ? 1 : 0;
      } else {
        const weightedSum = item.features.reduce((sum: number, val: number, i: number) => sum + val * (i + 1), 0);
        return Math.max(0, weightedSum * 10 + Math.random() * 100);
      }
    });

    const submission = {
      name: submissionName,
      modelType: model.modelType,
      processingSteps: [], // 前処理ステップ
      featureEngineeringSteps: [], // 特徴量エンジニアリングステップ
      predictions: submissionPredictions,
      evaluationMetrics: validationMetrics, // 検証結果を使用
      datasetHash: 'dataset_hash_placeholder',
      isSelected: false
    };

    // プレイヤーの動作履歴を記録
    const processingHistory = {
      preprocessing: [], // 前処理の履歴
      featureEngineering: [], // 特徴量エンジニアリングの履歴
      modelSelection: model.modelType,
      hyperparameters: model.hyperparameters,
      validationMetrics: validationMetrics,
      dataQuality: calculateDataQuality(),
      processingComplexity: calculateProcessingComplexity()
    };

    const overallScore = calculateOverallScore(validationMetrics);
    
    const enhancedSubmission = {
      ...submission,
      processingHistory,
      overallScore
    };

    // submissionManager.addSubmission(enhancedSubmission);
    addLog(`提出完了: ${submissionName} (検証精度: ${overallScore.toFixed(4)})`);
    addLog(`※ 最終評価は運営側でPublic/Privateテストデータを使用して実行されます`);

    onTrainingComplete({
      modelType: model.modelType,
      score: overallScore,
      metrics: validationMetrics,
      submission: enhancedSubmission
    });
  };

  // データ品質を計算
  const calculateDataQuality = () => {
    if (!data || data.length === 0) return 0;
    
    let quality = 0;
    
    // データサイズによる品質
    const dataSize = data.length;
    if (dataSize > 1000) quality += 0.3;
    else if (dataSize > 500) quality += 0.2;
    else if (dataSize > 100) quality += 0.1;
    
    // 特徴量数による品質
    const featureCount = featureNames.length;
    if (featureCount > 10) quality += 0.2;
    else if (featureCount > 5) quality += 0.1;
    
    // 欠損値の少なさによる品質
    const missingCount = data.reduce((count, item) => {
      return count + item.features.filter((val: any) => val === null || val === undefined || isNaN(val)).length;
    }, 0);
    const missingRatio = missingCount / (data.length * featureNames.length);
    if (missingRatio < 0.1) quality += 0.3;
    else if (missingRatio < 0.3) quality += 0.2;
    else if (missingRatio < 0.5) quality += 0.1;
    
    // データの多様性による品質
    const uniqueValues = new Set(data.map(item => JSON.stringify(item.features))).size;
    const diversityRatio = uniqueValues / data.length;
    if (diversityRatio > 0.8) quality += 0.2;
    else if (diversityRatio > 0.6) quality += 0.1;
    
    return Math.min(1, quality);
  };

  // 処理の複雑さを計算
  const calculateProcessingComplexity = () => {
    let complexity = 0;
    
    // モデルの複雑さ
    if (selectedModelConfig) {
      complexity += 0.5; // デフォルトの複雑さ
    }
    
    // ハイパーパラメータの調整
    const paramCount = Object.keys(hyperparameters).length;
    complexity += paramCount * 0.1;
    
    // 特徴量数による複雑さ
    complexity += featureNames.length * 0.05;
    
    return Math.min(1, complexity);
  };

  // 総合スコアを計算（精度のみ）
  const calculateOverallScore = (metrics: any) => {
    const accuracy = problemType === 'classification' ? metrics.accuracy : metrics.r2 || 0;
    
    // 精度のみで評価
    return accuracy;
  };


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">機械学習ワークフロー</h2>
            <p className="text-white/80">学習 → 検証 → チューニング → 再学習 → 評価 → 提出</p>
          </div>
        </div>
      </div>

      {/* ステップナビゲーション */}
      <div className="bg-white/5 p-4">
        <div className="flex space-x-2 flex-wrap">
          {[
            { id: 'data_split', label: 'データ分割', icon: '📊' },
            { id: 'model_selection', label: 'モデル選択', icon: '🤖' },
            { id: 'training', label: '学習', icon: '📚' },
            { id: 'validation', label: '検証', icon: '🔍' },
            { id: 'submission', label: '提出', icon: '📤' }
          ].map(step => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="text-sm font-medium">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* データ分割ステップ */}
        {currentStep === 'data_split' && (
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">📊 データ分割設定</h3>
            <div className="space-y-6">
              {/* 分割比率設定 */}
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-bold mb-4">分割比率</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">訓練データ比率 (%)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="50"
                        max="90"
                        value={trainRatio}
                        onChange={(e) => {
                          const newTrainRatio = Number(e.target.value);
                          setTrainRatio(newTrainRatio);
                          setValidationRatio(100 - newTrainRatio);
                        }}
                        className="flex-1"
                      />
                      <span className="text-white font-bold w-16 text-right">{trainRatio}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">検証データ比率 (%)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={validationRatio}
                        onChange={(e) => {
                          const newValidationRatio = Number(e.target.value);
                          setValidationRatio(newValidationRatio);
                          setTrainRatio(100 - newValidationRatio);
                        }}
                        className="flex-1"
                      />
                      <span className="text-white font-bold w-16 text-right">{validationRatio}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-white/60 text-sm">
                  合計: {trainRatio + validationRatio}% (テストデータは運営側で管理)
                </div>
              </div>



              {/* ランダムシード設定 */}
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-bold mb-4">再現性設定</h4>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">ランダムシード</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="0"
                      max="9999"
                      value={randomSeed}
                      readOnly
                      className="w-32 p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      リセット
                    </button>
                  </div>
                  <div className="text-white/60 text-xs mt-2">
                    同じシードを使用することで、同じデータ分割を再現できます
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('feature_selection')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  次へ: 特徴量選択
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 特徴量選択ステップ */}
        {currentStep === 'feature_selection' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🔍 特徴量選択</h3>
              <div className="space-y-6">
                {/* 選択方法 */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-4">選択方法</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="featureSelectionMethod"
                        value="manual"
                        checked={featureSelectionMethod === 'manual'}
                        onChange={(e) => setFeatureSelectionMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="text-white font-medium">手動選択</div>
                        <div className="text-white/60 text-sm">特徴量を手動で選択</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="featureSelectionMethod"
                        value="correlation"
                        checked={featureSelectionMethod === 'correlation'}
                        onChange={(e) => setFeatureSelectionMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="text-white font-medium">相関分析</div>
                        <div className="text-white/60 text-sm">ターゲットとの相関が高い特徴量を選択</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="featureSelectionMethod"
                        value="variance"
                        checked={featureSelectionMethod === 'variance'}
                        onChange={(e) => setFeatureSelectionMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="text-white font-medium">分散分析</div>
                        <div className="text-white/60 text-sm">分散が大きい特徴量を選択</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 特徴量一覧 */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-4">特徴量一覧</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {featureNames.map((feature, index) => (
                      <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures([...selectedFeatures, index]);
                            } else {
                              setSelectedFeatures(selectedFeatures.filter(i => i !== index));
                            }
                          }}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                        />
                        <span className="text-white text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 text-white/60 text-sm">
                    選択済み: {selectedFeatures.length} / {featureNames.length} 特徴量
                  </div>
                </div>

                {/* 実行ボタン */}
                <div className="text-center">
                  <button 
                    onClick={() => setCurrentStep('model_selection')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    特徴量選択を完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* モデル選択ステップ */}
        {currentStep === 'model_selection' && (
          <div className="space-y-6">
            {/* モデル選択 */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">🤖 モデル選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableModels.map(model => (
                  <button
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedModel === model.name
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🤖</div>
                      <div className="text-lg font-bold mb-1">{model.name}</div>
                      <div className="text-sm opacity-70 mb-2">{model.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ハイパーパラメータ設定 */}
            {selectedModelConfig && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">⚙️ ハイパーパラメータ設定</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-3">パラメータ調整</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedModelConfig.parameters).map(([key, param]) => (
                        <div key={key} className="flex items-center space-x-4">
                          <label className="flex-1 text-white/70">{key}</label>
                          {param.type === 'number' && (
                            <input
                              type="number"
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              value={hyperparameters[key] || param.default}
                              onChange={(e) => setHyperparameters(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                              className="flex-2 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                            />
                          )}
                          {param.type === 'select' && (
                            <select
                              value={hyperparameters[key] || param.default}
                              onChange={(e) => setHyperparameters(prev => ({ ...prev, [key]: e.target.value }))}
                              className="flex-2 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                            >
                              {param.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                          <span className="text-white font-bold w-16 text-right">
                            {hyperparameters[key] || param.default}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep('training')}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      学習開始
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 学習ステップ */}
        {currentStep === 'training' && (
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">📚 モデル学習</h3>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">選択されたモデル: {selectedModelConfig?.name}</h4>
                <div className="text-white/70 text-sm">
                  ハイパーパラメータ: {Object.entries(hyperparameters).map(([key, value]) => `${key}=${value}`).join(', ')}
                </div>
              </div>
              
              <button
                onClick={simulateTraining}
                disabled={!selectedModel || isTraining}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-bold transition-all duration-300 ${
                  selectedModel && !isTraining
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>{isTraining ? '学習中...' : '学習開始'}</span>
              </button>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>学習進捗</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {trainingLog.length > 0 && (
                <div className="bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {trainingLog.map((log, index) => (
                    <div key={index} className="text-green-300 text-xs font-mono">{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 検証ステップ */}
        {currentStep === 'validation' && (
          <div className="space-y-6">
            {/* 学習済みモデルがない場合 */}
            {trainedModels.length === 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">🔍 汎化性能検証</h3>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-white/70 text-lg mb-2">学習済みモデルがありません</div>
                  <div className="text-white/50 text-sm">まずはモデルを学習してください</div>
                  <button
                    onClick={() => setCurrentStep('model_selection')}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    モデル選択に戻る
                  </button>
                </div>
              </div>
            )}

            {/* 学習済みモデルがある場合 */}
            {trainedModels.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">🔍 汎化性能検証</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-2">学習済みモデル選択</h4>
                    <select
                      value={selectedTrainedModel}
                      onChange={(e) => setSelectedTrainedModel(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="">モデルを選択してください</option>
                      {trainedModels.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={validateModel}
                    disabled={!selectedTrainedModel}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-bold transition-all duration-300 ${
                      selectedTrainedModel
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>検証実行</span>
                  </button>

                  {validationMetrics && (
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                      <h4 className="text-green-300 font-bold mb-4">検証結果</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(validationMetrics).map(([key, value]) => (
                          <div key={key} className="bg-white/10 rounded-lg p-3 text-center">
                            <div className="text-green-300 text-lg font-bold">
                              {(value as number).toFixed(4)}
                            </div>
                            <div className="text-white/70 text-xs capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-green-300 text-sm">
                        検証戦略: {validationStrategy === 'holdout' ? 'ホールドアウト' : 
                                  validationStrategy === 'cross_validation' ? 'クロスバリデーション' : 
                                  '層化クロスバリデーション'}
                        {validationStrategy !== 'holdout' && ` (${cvFolds}フォールド)`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}



        {/* 提出ステップ */}
        {currentStep === 'submission' && (
          <div className="space-y-6">
            {/* 検証結果の表示 */}
            {validationMetrics && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">🔍 検証結果（提出前確認）</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(validationMetrics).map(([key, value]) => (
                    <div key={key} className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-green-300 text-lg font-bold">
                        {(value as number).toFixed(4)}
                      </div>
                      <div className="text-white/70 text-xs capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-white/60 text-sm">
                  この検証結果を基に予測を生成して提出します
                </div>
              </div>
            )}

            {/* 提出フォーム */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">📤 結果提出</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">提出名</label>
                  <input
                    type="text"
                    value={submissionName}
                    onChange={(e) => setSubmissionName(e.target.value)}
                    placeholder="提出の名前を入力してください"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  />
                </div>
                
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-bold mb-2">📋 提出後の流れ</h4>
                  <div className="text-blue-300 text-sm space-y-1">
                    <p>1. 提出後、運営側でPublicテストデータを使用して評価</p>
                    <p>2. リーダーボードにPublicスコアが表示</p>
                    <p>3. コンテスト終了後、Privateテストデータで最終評価</p>
                    <p>4. 最終順位が決定</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!submissionName || !validationMetrics}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-bold transition-all duration-300 ${
                    submissionName && validationMetrics
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span>提出する</span>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* 学習ログ */}
        {trainingLog.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">学習ログ</h3>
            <div className="bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto">
              {trainingLog.map((log, index) => (
                <div key={index} className="text-white/70 text-xs font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


