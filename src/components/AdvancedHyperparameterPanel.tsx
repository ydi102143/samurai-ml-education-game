import { useState, useEffect } from 'react';
import { Settings, Zap, RotateCcw, Target, TrendingUp, Clock } from 'lucide-react';
import { BALANCED_MODELS, ModelBalancer, type BalancedModel } from '../utils/balancedMLModels';

interface AdvancedHyperparameterPanelProps {
  selectedModel: string;
  onParametersChange: (parameters: any) => void;
  featureCount: number;
  dataSize: number;
}

export function AdvancedHyperparameterPanel({
  selectedModel,
  onParametersChange,
  featureCount,
  dataSize
}: AdvancedHyperparameterPanelProps) {
  const [model, setModel] = useState<BalancedModel | null>(null);
  const [parameters, setParameters] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // モデル情報を取得
  useEffect(() => {
    const modelInfo = BALANCED_MODELS.find(m => m.type === selectedModel);
    if (modelInfo) {
      setModel(modelInfo);
      
      // デフォルトパラメータを設定
      const defaultParams: any = {};
      Object.keys(modelInfo.parameters).forEach(key => {
        defaultParams[key] = modelInfo.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  }, [selectedModel, onParametersChange]);

  // 推奨設定を計算
  useEffect(() => {
    if (model) {
      const availableModels = ModelBalancer.getAvailableModels(featureCount);
      const currentModel = availableModels.find(m => m.type === selectedModel);
      
      if (currentModel) {
        const expectedAccuracy = ModelBalancer.adjustExpectedAccuracy(currentModel, featureCount, dataSize);
        const trainingTime = ModelBalancer.adjustTrainingTime(currentModel, featureCount, dataSize);
        const complexityScore = ModelBalancer.calculateComplexityScore(currentModel, parameters);
        const recommendationScore = ModelBalancer.calculateRecommendationScore(
          currentModel,
          featureCount,
          dataSize
        );

        setRecommendations({
          expectedAccuracy,
          trainingTime,
          complexityScore,
          recommendationScore,
          isRecommended: recommendationScore > 0.7
        });
      }
    }
  }, [model, featureCount, dataSize, parameters]);

  // パラメータを更新
  const updateParameter = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  // 自動最適化
  const optimizeParameters = async () => {
    if (!model) return;

    setIsOptimizing(true);
    
    // 簡易的な最適化（実際の実装ではより高度な最適化を使用）
    const optimizedParams = { ...parameters };
    
    // データサイズに基づいてエポック数を調整
    if (model.parameters.epochs) {
      const baseEpochs = model.parameters.epochs.default;
      const adjustedEpochs = Math.min(
        model.parameters.epochs.max || baseEpochs * 2,
        Math.max(
          model.parameters.epochs.min || baseEpochs / 2,
          Math.floor(baseEpochs * Math.sqrt(dataSize / 100))
        )
      );
      optimizedParams.epochs = adjustedEpochs;
    }

    // 特徴量数に基づいて学習率を調整
    if (model.parameters.learningRate) {
      const baseLR = model.parameters.learningRate.default;
      const adjustedLR = Math.min(
        model.parameters.learningRate.max || baseLR * 2,
        Math.max(
          model.parameters.learningRate.min || baseLR / 2,
          baseLR * Math.sqrt(featureCount / 10)
        )
      );
      optimizedParams.learningRate = adjustedLR;
    }

    // ニューラルネットワークの場合、隠れ層ユニット数を調整
    if (model.type === 'neural_network_small' && model.parameters.hiddenUnits) {
      const baseUnits = model.parameters.hiddenUnits.default;
      const adjustedUnits = Math.min(
        model.parameters.hiddenUnits.max || baseUnits * 2,
        Math.max(
          model.parameters.hiddenUnits.min || baseUnits / 2,
          Math.floor(baseUnits * Math.sqrt(featureCount / 10))
        )
      );
      optimizedParams.hiddenUnits = adjustedUnits;
    }

    // パラメータを更新
    setParameters(optimizedParams);
    onParametersChange(optimizedParams);
    
    setIsOptimizing(false);
  };

  // パラメータをリセット
  const resetParameters = () => {
    if (model) {
      const defaultParams: any = {};
      Object.keys(model.parameters).forEach(key => {
        defaultParams[key] = model.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  };

  if (!model) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-white/70">モデルを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            ハイパーパラメータ調整
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={optimizeParameters}
              disabled={isOptimizing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 inline mr-1 animate-spin" />
                  最適化中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 inline mr-1" />
                  自動最適化
                </>
              )}
            </button>
            <button
              onClick={resetParameters}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              リセット
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* モデル情報 */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{model.name}</h3>
          <p className="text-white/70 mb-4">{model.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.maxFeatures}</div>
              <div className="text-sm text-white/70">最大特徴量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.trainingTime}s</div>
              <div className="text-sm text-white/70">予想学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(model.expectedAccuracy * 100)}%
              </div>
              <div className="text-sm text-white/70">期待精度</div>
            </div>
          </div>
        </div>

        {/* 推奨情報 */}
        {recommendations && (
          <div className={`rounded-xl p-4 mb-6 border ${
            recommendations.isRecommended
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              推奨情報
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(recommendations.expectedAccuracy * 100)}%
                </div>
                <div className="text-sm text-white/70">予想精度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(recommendations.trainingTime)}s
                </div>
                <div className="text-sm text-white/70">予想学習時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {recommendations.complexityScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-white/70">複雑さ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(recommendations.recommendationScore * 100)}%
                </div>
                <div className="text-sm text-white/70">推奨度</div>
              </div>
            </div>
          </div>
        )}

        {/* パラメータ設定 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">パラメータ設定</h3>
          
          {Object.keys(model.parameters).map(key => {
            const param = model.parameters[key];
            const value = parameters[key] || param.default;
            
            return (
              <div key={key} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-white/70">{param.description}</p>
                  </div>
                  <div className="text-sm text-white/60">
                    現在: {value}
                  </div>
                </div>
                
                {param.type === 'number' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      value={value}
                      onChange={(e) => updateParameter(key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{param.min || 0}</span>
                      <span>{param.max || 100}</span>
                    </div>
                  </div>
                )}
                
                {param.type === 'select' && (
                  <select
                    value={value}
                    onChange={(e) => updateParameter(key, e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {param.options?.map(option => (
                      <option key={option} value={option} className="bg-gray-800">
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {param.type === 'boolean' && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateParameter(key, e.target.checked)}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <span className="text-white">{value ? '有効' : '無効'}</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* 現在の設定サマリー */}
        <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            現在の設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(parameters).map(key => (
              <div key={key} className="flex justify-between">
                <span className="text-white/70 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-white font-bold">{parameters[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { BALANCED_MODELS, ModelBalancer, type BalancedModel } from '../utils/balancedMLModels';

interface AdvancedHyperparameterPanelProps {
  selectedModel: string;
  onParametersChange: (parameters: any) => void;
  featureCount: number;
  dataSize: number;
}

export function AdvancedHyperparameterPanel({
  selectedModel,
  onParametersChange,
  featureCount,
  dataSize
}: AdvancedHyperparameterPanelProps) {
  const [model, setModel] = useState<BalancedModel | null>(null);
  const [parameters, setParameters] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // モデル情報を取得
  useEffect(() => {
    const modelInfo = BALANCED_MODELS.find(m => m.type === selectedModel);
    if (modelInfo) {
      setModel(modelInfo);
      
      // デフォルトパラメータを設定
      const defaultParams: any = {};
      Object.keys(modelInfo.parameters).forEach(key => {
        defaultParams[key] = modelInfo.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  }, [selectedModel, onParametersChange]);

  // 推奨設定を計算
  useEffect(() => {
    if (model) {
      const availableModels = ModelBalancer.getAvailableModels(featureCount);
      const currentModel = availableModels.find(m => m.type === selectedModel);
      
      if (currentModel) {
        const expectedAccuracy = ModelBalancer.adjustExpectedAccuracy(currentModel, featureCount, dataSize);
        const trainingTime = ModelBalancer.adjustTrainingTime(currentModel, featureCount, dataSize);
        const complexityScore = ModelBalancer.calculateComplexityScore(currentModel, parameters);
        const recommendationScore = ModelBalancer.calculateRecommendationScore(
          currentModel,
          featureCount,
          dataSize
        );

        setRecommendations({
          expectedAccuracy,
          trainingTime,
          complexityScore,
          recommendationScore,
          isRecommended: recommendationScore > 0.7
        });
      }
    }
  }, [model, featureCount, dataSize, parameters]);

  // パラメータを更新
  const updateParameter = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  // 自動最適化
  const optimizeParameters = async () => {
    if (!model) return;

    setIsOptimizing(true);
    
    // 簡易的な最適化（実際の実装ではより高度な最適化を使用）
    const optimizedParams = { ...parameters };
    
    // データサイズに基づいてエポック数を調整
    if (model.parameters.epochs) {
      const baseEpochs = model.parameters.epochs.default;
      const adjustedEpochs = Math.min(
        model.parameters.epochs.max || baseEpochs * 2,
        Math.max(
          model.parameters.epochs.min || baseEpochs / 2,
          Math.floor(baseEpochs * Math.sqrt(dataSize / 100))
        )
      );
      optimizedParams.epochs = adjustedEpochs;
    }

    // 特徴量数に基づいて学習率を調整
    if (model.parameters.learningRate) {
      const baseLR = model.parameters.learningRate.default;
      const adjustedLR = Math.min(
        model.parameters.learningRate.max || baseLR * 2,
        Math.max(
          model.parameters.learningRate.min || baseLR / 2,
          baseLR * Math.sqrt(featureCount / 10)
        )
      );
      optimizedParams.learningRate = adjustedLR;
    }

    // ニューラルネットワークの場合、隠れ層ユニット数を調整
    if (model.type === 'neural_network_small' && model.parameters.hiddenUnits) {
      const baseUnits = model.parameters.hiddenUnits.default;
      const adjustedUnits = Math.min(
        model.parameters.hiddenUnits.max || baseUnits * 2,
        Math.max(
          model.parameters.hiddenUnits.min || baseUnits / 2,
          Math.floor(baseUnits * Math.sqrt(featureCount / 10))
        )
      );
      optimizedParams.hiddenUnits = adjustedUnits;
    }

    // パラメータを更新
    setParameters(optimizedParams);
    onParametersChange(optimizedParams);
    
    setIsOptimizing(false);
  };

  // パラメータをリセット
  const resetParameters = () => {
    if (model) {
      const defaultParams: any = {};
      Object.keys(model.parameters).forEach(key => {
        defaultParams[key] = model.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  };

  if (!model) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-white/70">モデルを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            ハイパーパラメータ調整
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={optimizeParameters}
              disabled={isOptimizing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 inline mr-1 animate-spin" />
                  最適化中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 inline mr-1" />
                  自動最適化
                </>
              )}
            </button>
            <button
              onClick={resetParameters}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              リセット
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* モデル情報 */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{model.name}</h3>
          <p className="text-white/70 mb-4">{model.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.maxFeatures}</div>
              <div className="text-sm text-white/70">最大特徴量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.trainingTime}s</div>
              <div className="text-sm text-white/70">予想学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(model.expectedAccuracy * 100)}%
              </div>
              <div className="text-sm text-white/70">期待精度</div>
            </div>
          </div>
        </div>

        {/* 推奨情報 */}
        {recommendations && (
          <div className={`rounded-xl p-4 mb-6 border ${
            recommendations.isRecommended
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              推奨情報
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(recommendations.expectedAccuracy * 100)}%
                </div>
                <div className="text-sm text-white/70">予想精度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(recommendations.trainingTime)}s
                </div>
                <div className="text-sm text-white/70">予想学習時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {recommendations.complexityScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-white/70">複雑さ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(recommendations.recommendationScore * 100)}%
                </div>
                <div className="text-sm text-white/70">推奨度</div>
              </div>
            </div>
          </div>
        )}

        {/* パラメータ設定 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">パラメータ設定</h3>
          
          {Object.keys(model.parameters).map(key => {
            const param = model.parameters[key];
            const value = parameters[key] || param.default;
            
            return (
              <div key={key} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-white/70">{param.description}</p>
                  </div>
                  <div className="text-sm text-white/60">
                    現在: {value}
                  </div>
                </div>
                
                {param.type === 'number' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      value={value}
                      onChange={(e) => updateParameter(key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{param.min || 0}</span>
                      <span>{param.max || 100}</span>
                    </div>
                  </div>
                )}
                
                {param.type === 'select' && (
                  <select
                    value={value}
                    onChange={(e) => updateParameter(key, e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {param.options?.map(option => (
                      <option key={option} value={option} className="bg-gray-800">
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {param.type === 'boolean' && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateParameter(key, e.target.checked)}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <span className="text-white">{value ? '有効' : '無効'}</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* 現在の設定サマリー */}
        <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            現在の設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(parameters).map(key => (
              <div key={key} className="flex justify-between">
                <span className="text-white/70 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-white font-bold">{parameters[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { BALANCED_MODELS, ModelBalancer, type BalancedModel } from '../utils/balancedMLModels';

interface AdvancedHyperparameterPanelProps {
  selectedModel: string;
  onParametersChange: (parameters: any) => void;
  featureCount: number;
  dataSize: number;
}

export function AdvancedHyperparameterPanel({
  selectedModel,
  onParametersChange,
  featureCount,
  dataSize
}: AdvancedHyperparameterPanelProps) {
  const [model, setModel] = useState<BalancedModel | null>(null);
  const [parameters, setParameters] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // モデル情報を取得
  useEffect(() => {
    const modelInfo = BALANCED_MODELS.find(m => m.type === selectedModel);
    if (modelInfo) {
      setModel(modelInfo);
      
      // デフォルトパラメータを設定
      const defaultParams: any = {};
      Object.keys(modelInfo.parameters).forEach(key => {
        defaultParams[key] = modelInfo.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  }, [selectedModel, onParametersChange]);

  // 推奨設定を計算
  useEffect(() => {
    if (model) {
      const availableModels = ModelBalancer.getAvailableModels(featureCount);
      const currentModel = availableModels.find(m => m.type === selectedModel);
      
      if (currentModel) {
        const expectedAccuracy = ModelBalancer.adjustExpectedAccuracy(currentModel, featureCount, dataSize);
        const trainingTime = ModelBalancer.adjustTrainingTime(currentModel, featureCount, dataSize);
        const complexityScore = ModelBalancer.calculateComplexityScore(currentModel, parameters);
        const recommendationScore = ModelBalancer.calculateRecommendationScore(
          currentModel,
          featureCount,
          dataSize
        );

        setRecommendations({
          expectedAccuracy,
          trainingTime,
          complexityScore,
          recommendationScore,
          isRecommended: recommendationScore > 0.7
        });
      }
    }
  }, [model, featureCount, dataSize, parameters]);

  // パラメータを更新
  const updateParameter = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  // 自動最適化
  const optimizeParameters = async () => {
    if (!model) return;

    setIsOptimizing(true);
    
    // 簡易的な最適化（実際の実装ではより高度な最適化を使用）
    const optimizedParams = { ...parameters };
    
    // データサイズに基づいてエポック数を調整
    if (model.parameters.epochs) {
      const baseEpochs = model.parameters.epochs.default;
      const adjustedEpochs = Math.min(
        model.parameters.epochs.max || baseEpochs * 2,
        Math.max(
          model.parameters.epochs.min || baseEpochs / 2,
          Math.floor(baseEpochs * Math.sqrt(dataSize / 100))
        )
      );
      optimizedParams.epochs = adjustedEpochs;
    }

    // 特徴量数に基づいて学習率を調整
    if (model.parameters.learningRate) {
      const baseLR = model.parameters.learningRate.default;
      const adjustedLR = Math.min(
        model.parameters.learningRate.max || baseLR * 2,
        Math.max(
          model.parameters.learningRate.min || baseLR / 2,
          baseLR * Math.sqrt(featureCount / 10)
        )
      );
      optimizedParams.learningRate = adjustedLR;
    }

    // ニューラルネットワークの場合、隠れ層ユニット数を調整
    if (model.type === 'neural_network_small' && model.parameters.hiddenUnits) {
      const baseUnits = model.parameters.hiddenUnits.default;
      const adjustedUnits = Math.min(
        model.parameters.hiddenUnits.max || baseUnits * 2,
        Math.max(
          model.parameters.hiddenUnits.min || baseUnits / 2,
          Math.floor(baseUnits * Math.sqrt(featureCount / 10))
        )
      );
      optimizedParams.hiddenUnits = adjustedUnits;
    }

    // パラメータを更新
    setParameters(optimizedParams);
    onParametersChange(optimizedParams);
    
    setIsOptimizing(false);
  };

  // パラメータをリセット
  const resetParameters = () => {
    if (model) {
      const defaultParams: any = {};
      Object.keys(model.parameters).forEach(key => {
        defaultParams[key] = model.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  };

  if (!model) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-white/70">モデルを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            ハイパーパラメータ調整
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={optimizeParameters}
              disabled={isOptimizing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 inline mr-1 animate-spin" />
                  最適化中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 inline mr-1" />
                  自動最適化
                </>
              )}
            </button>
            <button
              onClick={resetParameters}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              リセット
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* モデル情報 */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{model.name}</h3>
          <p className="text-white/70 mb-4">{model.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.maxFeatures}</div>
              <div className="text-sm text-white/70">最大特徴量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.trainingTime}s</div>
              <div className="text-sm text-white/70">予想学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(model.expectedAccuracy * 100)}%
              </div>
              <div className="text-sm text-white/70">期待精度</div>
            </div>
          </div>
        </div>

        {/* 推奨情報 */}
        {recommendations && (
          <div className={`rounded-xl p-4 mb-6 border ${
            recommendations.isRecommended
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              推奨情報
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(recommendations.expectedAccuracy * 100)}%
                </div>
                <div className="text-sm text-white/70">予想精度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(recommendations.trainingTime)}s
                </div>
                <div className="text-sm text-white/70">予想学習時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {recommendations.complexityScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-white/70">複雑さ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(recommendations.recommendationScore * 100)}%
                </div>
                <div className="text-sm text-white/70">推奨度</div>
              </div>
            </div>
          </div>
        )}

        {/* パラメータ設定 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">パラメータ設定</h3>
          
          {Object.keys(model.parameters).map(key => {
            const param = model.parameters[key];
            const value = parameters[key] || param.default;
            
            return (
              <div key={key} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-white/70">{param.description}</p>
                  </div>
                  <div className="text-sm text-white/60">
                    現在: {value}
                  </div>
                </div>
                
                {param.type === 'number' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      value={value}
                      onChange={(e) => updateParameter(key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{param.min || 0}</span>
                      <span>{param.max || 100}</span>
                    </div>
                  </div>
                )}
                
                {param.type === 'select' && (
                  <select
                    value={value}
                    onChange={(e) => updateParameter(key, e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {param.options?.map(option => (
                      <option key={option} value={option} className="bg-gray-800">
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {param.type === 'boolean' && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateParameter(key, e.target.checked)}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <span className="text-white">{value ? '有効' : '無効'}</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* 現在の設定サマリー */}
        <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            現在の設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(parameters).map(key => (
              <div key={key} className="flex justify-between">
                <span className="text-white/70 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-white font-bold">{parameters[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { BALANCED_MODELS, ModelBalancer, type BalancedModel } from '../utils/balancedMLModels';

interface AdvancedHyperparameterPanelProps {
  selectedModel: string;
  onParametersChange: (parameters: any) => void;
  featureCount: number;
  dataSize: number;
}

export function AdvancedHyperparameterPanel({
  selectedModel,
  onParametersChange,
  featureCount,
  dataSize
}: AdvancedHyperparameterPanelProps) {
  const [model, setModel] = useState<BalancedModel | null>(null);
  const [parameters, setParameters] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // モデル情報を取得
  useEffect(() => {
    const modelInfo = BALANCED_MODELS.find(m => m.type === selectedModel);
    if (modelInfo) {
      setModel(modelInfo);
      
      // デフォルトパラメータを設定
      const defaultParams: any = {};
      Object.keys(modelInfo.parameters).forEach(key => {
        defaultParams[key] = modelInfo.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  }, [selectedModel, onParametersChange]);

  // 推奨設定を計算
  useEffect(() => {
    if (model) {
      const availableModels = ModelBalancer.getAvailableModels(featureCount);
      const currentModel = availableModels.find(m => m.type === selectedModel);
      
      if (currentModel) {
        const expectedAccuracy = ModelBalancer.adjustExpectedAccuracy(currentModel, featureCount, dataSize);
        const trainingTime = ModelBalancer.adjustTrainingTime(currentModel, featureCount, dataSize);
        const complexityScore = ModelBalancer.calculateComplexityScore(currentModel, parameters);
        const recommendationScore = ModelBalancer.calculateRecommendationScore(
          currentModel,
          featureCount,
          dataSize
        );

        setRecommendations({
          expectedAccuracy,
          trainingTime,
          complexityScore,
          recommendationScore,
          isRecommended: recommendationScore > 0.7
        });
      }
    }
  }, [model, featureCount, dataSize, parameters]);

  // パラメータを更新
  const updateParameter = (key: string, value: any) => {
    const newParameters = { ...parameters, [key]: value };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  // 自動最適化
  const optimizeParameters = async () => {
    if (!model) return;

    setIsOptimizing(true);
    
    // 簡易的な最適化（実際の実装ではより高度な最適化を使用）
    const optimizedParams = { ...parameters };
    
    // データサイズに基づいてエポック数を調整
    if (model.parameters.epochs) {
      const baseEpochs = model.parameters.epochs.default;
      const adjustedEpochs = Math.min(
        model.parameters.epochs.max || baseEpochs * 2,
        Math.max(
          model.parameters.epochs.min || baseEpochs / 2,
          Math.floor(baseEpochs * Math.sqrt(dataSize / 100))
        )
      );
      optimizedParams.epochs = adjustedEpochs;
    }

    // 特徴量数に基づいて学習率を調整
    if (model.parameters.learningRate) {
      const baseLR = model.parameters.learningRate.default;
      const adjustedLR = Math.min(
        model.parameters.learningRate.max || baseLR * 2,
        Math.max(
          model.parameters.learningRate.min || baseLR / 2,
          baseLR * Math.sqrt(featureCount / 10)
        )
      );
      optimizedParams.learningRate = adjustedLR;
    }

    // ニューラルネットワークの場合、隠れ層ユニット数を調整
    if (model.type === 'neural_network_small' && model.parameters.hiddenUnits) {
      const baseUnits = model.parameters.hiddenUnits.default;
      const adjustedUnits = Math.min(
        model.parameters.hiddenUnits.max || baseUnits * 2,
        Math.max(
          model.parameters.hiddenUnits.min || baseUnits / 2,
          Math.floor(baseUnits * Math.sqrt(featureCount / 10))
        )
      );
      optimizedParams.hiddenUnits = adjustedUnits;
    }

    // パラメータを更新
    setParameters(optimizedParams);
    onParametersChange(optimizedParams);
    
    setIsOptimizing(false);
  };

  // パラメータをリセット
  const resetParameters = () => {
    if (model) {
      const defaultParams: any = {};
      Object.keys(model.parameters).forEach(key => {
        defaultParams[key] = model.parameters[key].default;
      });
      setParameters(defaultParams);
      onParametersChange(defaultParams);
    }
  };

  if (!model) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-white/70">モデルを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            ハイパーパラメータ調整
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={optimizeParameters}
              disabled={isOptimizing}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {isOptimizing ? (
                <>
                  <Zap className="w-4 h-4 inline mr-1 animate-spin" />
                  最適化中...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 inline mr-1" />
                  自動最適化
                </>
              )}
            </button>
            <button
              onClick={resetParameters}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              リセット
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* モデル情報 */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-2">{model.name}</h3>
          <p className="text-white/70 mb-4">{model.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.maxFeatures}</div>
              <div className="text-sm text-white/70">最大特徴量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{model.trainingTime}s</div>
              <div className="text-sm text-white/70">予想学習時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(model.expectedAccuracy * 100)}%
              </div>
              <div className="text-sm text-white/70">期待精度</div>
            </div>
          </div>
        </div>

        {/* 推奨情報 */}
        {recommendations && (
          <div className={`rounded-xl p-4 mb-6 border ${
            recommendations.isRecommended
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              推奨情報
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(recommendations.expectedAccuracy * 100)}%
                </div>
                <div className="text-sm text-white/70">予想精度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(recommendations.trainingTime)}s
                </div>
                <div className="text-sm text-white/70">予想学習時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {recommendations.complexityScore.toFixed(1)}/5
                </div>
                <div className="text-sm text-white/70">複雑さ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(recommendations.recommendationScore * 100)}%
                </div>
                <div className="text-sm text-white/70">推奨度</div>
              </div>
            </div>
          </div>
        )}

        {/* パラメータ設定 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">パラメータ設定</h3>
          
          {Object.keys(model.parameters).map(key => {
            const param = model.parameters[key];
            const value = parameters[key] || param.default;
            
            return (
              <div key={key} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-white/70">{param.description}</p>
                  </div>
                  <div className="text-sm text-white/60">
                    現在: {value}
                  </div>
                </div>
                
                {param.type === 'number' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      value={value}
                      onChange={(e) => updateParameter(key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{param.min || 0}</span>
                      <span>{param.max || 100}</span>
                    </div>
                  </div>
                )}
                
                {param.type === 'select' && (
                  <select
                    value={value}
                    onChange={(e) => updateParameter(key, e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {param.options?.map(option => (
                      <option key={option} value={option} className="bg-gray-800">
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {param.type === 'boolean' && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateParameter(key, e.target.checked)}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                    />
                    <span className="text-white">{value ? '有効' : '無効'}</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* 現在の設定サマリー */}
        <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            現在の設定
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(parameters).map(key => (
              <div key={key} className="flex justify-between">
                <span className="text-white/70 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-white font-bold">{parameters[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}