import React, { useState, useEffect } from 'react';
import { X, Settings, Info, RotateCcw } from 'lucide-react';

interface HyperparameterPanelProps {
  modelType: string;
  parameters: Record<string, any>;
  onParametersChange: (parameters: Record<string, any>) => void;
  onClose: () => void;
}

export function HyperparameterPanel({ 
  modelType, 
  parameters, 
  onParametersChange, 
  onClose 
}: HyperparameterPanelProps) {
  const [localParameters, setLocalParameters] = useState<Record<string, any>>(parameters);

  // モデル別のデフォルトパラメータ
  const getDefaultParameters = (modelType: string) => {
    switch (modelType) {
      case 'logistic_regression':
        return {
          learning_rate: 0.01,
          max_iterations: 1000,
          regularization: 0.1,
          solver: 'lbfgs'
        };
      case 'linear_regression':
        return {
          learning_rate: 0.01,
          max_iterations: 1000,
          regularization: 0.1
        };
      case 'neural_network':
        return {
          learning_rate: 0.01,
          max_iterations: 100,
          hidden_layers: 2,
          hidden_units: 16,
          dropout_rate: 0.2,
          activation: 'relu',
          optimizer: 'adam'
        };
      case 'knn':
        return {
          k: 5,
          distance_metric: 'euclidean',
          weights: 'uniform'
        };
      case 'random_forest':
        return {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1,
          max_features: 'sqrt'
        };
      case 'svm':
        return {
          C: 1.0,
          kernel: 'rbf',
          gamma: 'scale',
          degree: 3
        };
      default:
        return {};
    }
  };

  // パラメータの説明
  const getParameterDescription = (param: string, modelType: string) => {
    const descriptions: Record<string, Record<string, string>> = {
      logistic_regression: {
        learning_rate: '学習率: モデルの学習速度を制御します（0.001-1.0）',
        max_iterations: '最大反復回数: 学習の最大回数（100-10000）',
        regularization: '正則化: 過学習を防ぐ強度（0.0-1.0）',
        solver: 'ソルバー: 最適化アルゴリズム'
      },
      linear_regression: {
        learning_rate: '学習率: モデルの学習速度を制御します（0.001-1.0）',
        max_iterations: '最大反復回数: 学習の最大回数（100-10000）',
        regularization: '正則化: 過学習を防ぐ強度（0.0-1.0）'
      },
      neural_network: {
        learning_rate: '学習率: モデルの学習速度を制御します（0.001-1.0）',
        max_iterations: 'エポック数: 学習の回数（10-1000）',
        hidden_layers: '隠れ層数: ニューラルネットワークの層数（1-5）',
        hidden_units: '隠れユニット数: 各層のニューロン数（4-128）',
        dropout_rate: 'ドロップアウト率: 過学習防止の強度（0.0-0.8）',
        activation: '活性化関数: ニューロンの活性化方法',
        optimizer: 'オプティマイザー: 最適化アルゴリズム'
      },
      knn: {
        k: '近傍数: 予測に使用する近いデータの数（1-20）',
        distance_metric: '距離指標: データ間の距離計算方法',
        weights: '重み付け: 近傍データの重み付け方法'
      },
      random_forest: {
        n_estimators: '決定木数: 使用する決定木の数（10-500）',
        max_depth: '最大深度: 各決定木の最大の深さ（1-20）',
        min_samples_split: '分割最小サンプル数: ノード分割に必要な最小サンプル数（2-20）',
        min_samples_leaf: '葉最小サンプル数: 葉ノードの最小サンプル数（1-10）',
        max_features: '最大特徴数: 各分割で考慮する特徴数'
      },
      svm: {
        C: '正則化パラメータ: 誤分類の許容度（0.1-100）',
        kernel: 'カーネル: データの変換方法',
        gamma: 'ガンマ: カーネルの影響範囲（scale, auto, 数値）',
        degree: '次数: 多項式カーネルの次数（1-10）'
      }
    };
    return descriptions[modelType]?.[param] || '';
  };

  // パラメータの型を取得
  const getParameterType = (param: string, modelType: string) => {
    const numericParams = ['learning_rate', 'max_iterations', 'regularization', 'k', 'n_estimators', 'max_depth', 'min_samples_split', 'min_samples_leaf', 'C', 'degree', 'hidden_layers', 'hidden_units', 'dropout_rate'];
    const selectParams = ['solver', 'activation', 'optimizer', 'distance_metric', 'weights', 'kernel', 'gamma', 'max_features'];
    
    if (numericParams.includes(param)) return 'number';
    if (selectParams.includes(param)) return 'select';
    return 'text';
  };

  // 選択肢を取得
  const getSelectOptions = (param: string, modelType: string) => {
    const options: Record<string, Record<string, string[]>> = {
      logistic_regression: {
        solver: ['lbfgs', 'liblinear', 'newton-cg', 'sag', 'saga']
      },
      neural_network: {
        activation: ['relu', 'sigmoid', 'tanh', 'linear'],
        optimizer: ['adam', 'sgd', 'rmsprop', 'adagrad']
      },
      knn: {
        distance_metric: ['euclidean', 'manhattan', 'minkowski'],
        weights: ['uniform', 'distance']
      },
      random_forest: {
        max_features: ['sqrt', 'log2', 'auto', '0.5', '0.8']
      },
      svm: {
        kernel: ['rbf', 'linear', 'poly', 'sigmoid'],
        gamma: ['scale', 'auto', '0.001', '0.01', '0.1', '1.0']
      }
    };
    return options[modelType]?.[param] || [];
  };

  // 数値パラメータの範囲を取得
  const getParameterRange = (param: string, modelType: string) => {
    const ranges: Record<string, Record<string, { min: number; max: number; step: number }>> = {
      logistic_regression: {
        learning_rate: { min: 0.001, max: 1.0, step: 0.001 },
        max_iterations: { min: 100, max: 10000, step: 100 },
        regularization: { min: 0.0, max: 1.0, step: 0.01 }
      },
      linear_regression: {
        learning_rate: { min: 0.001, max: 1.0, step: 0.001 },
        max_iterations: { min: 100, max: 10000, step: 100 },
        regularization: { min: 0.0, max: 1.0, step: 0.01 }
      },
      neural_network: {
        learning_rate: { min: 0.001, max: 1.0, step: 0.001 },
        max_iterations: { min: 10, max: 1000, step: 10 },
        hidden_layers: { min: 1, max: 5, step: 1 },
        hidden_units: { min: 4, max: 128, step: 4 },
        dropout_rate: { min: 0.0, max: 0.8, step: 0.1 }
      },
      knn: {
        k: { min: 1, max: 20, step: 1 }
      },
      random_forest: {
        n_estimators: { min: 10, max: 500, step: 10 },
        max_depth: { min: 1, max: 20, step: 1 },
        min_samples_split: { min: 2, max: 20, step: 1 },
        min_samples_leaf: { min: 1, max: 10, step: 1 }
      },
      svm: {
        C: { min: 0.1, max: 100, step: 0.1 },
        degree: { min: 1, max: 10, step: 1 }
      }
    };
    return ranges[modelType]?.[param] || { min: 0, max: 100, step: 1 };
  };

  useEffect(() => {
    const defaults = getDefaultParameters(modelType);
    setLocalParameters({ ...defaults, ...parameters });
  }, [modelType, parameters]);

  const handleParameterChange = (param: string, value: any) => {
    const newParams = { ...localParameters, [param]: value };
    setLocalParameters(newParams);
  };

  const handleSave = () => {
    onParametersChange(localParameters);
    onClose();
  };

  const handleReset = () => {
    const defaults = getDefaultParameters(modelType);
    setLocalParameters(defaults);
  };

  const modelDisplayName = {
    'logistic_regression': 'ロジスティック回帰',
    'linear_regression': '線形回帰',
    'neural_network': 'ニューラルネットワーク',
    'knn': 'k近傍法',
    'random_forest': 'ランダムフォレスト',
    'svm': 'サポートベクターマシン'
  }[modelType] || modelType;

  const defaultParams = getDefaultParameters(modelType);
  const paramEntries = Object.entries(defaultParams);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">ハイパーパラメータ設定</h2>
                <p className="text-blue-100">{modelDisplayName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* パラメータ設定 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paramEntries.map(([param, defaultValue]) => {
              const paramType = getParameterType(param, modelType);
              const description = getParameterDescription(param, modelType);
              const currentValue = localParameters[param] ?? defaultValue;

              return (
                <div key={param} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-3">
                    <label className="block text-sm font-bold text-gray-800 mb-1">
                      {param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="text-xs text-gray-600 mb-2">{description}</p>
                  </div>

                  {paramType === 'number' ? (
                    <div>
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleParameterChange(param, parseFloat(e.target.value) || 0)}
                        min={getParameterRange(param, modelType).min}
                        max={getParameterRange(param, modelType).max}
                        step={getParameterRange(param, modelType).step}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{getParameterRange(param, modelType).min}</span>
                        <span>{getParameterRange(param, modelType).max}</span>
                      </div>
                    </div>
                  ) : paramType === 'select' ? (
                    <select
                      value={currentValue}
                      onChange={(e) => handleParameterChange(param, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getSelectOptions(param, modelType).map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleParameterChange(param, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>デフォルトに戻す</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
