import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Clock, Award, Zap } from 'lucide-react';

interface EvaluationResultsProps {
  result: {
    accuracy: number;
    trainingTime: number;
    predictions: number[];
    actual: number[];
    detailedMetrics?: {
      accuracy?: number;
      precision?: number;
      recall?: number;
      f1Score?: number;
      mae?: number;
      rmse?: number;
      r2?: number;
    };
    modelInfo?: {
      modelType: string;
      selectedFeatures: number[];
      parameters: any;
      trainingTime: number;
      featureImportance?: number[];
    };
  };
  problemType: 'classification' | 'regression';
  featureNames: string[];
}

export function EvaluationResults({ result, problemType, featureNames }: EvaluationResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'predictions' | 'features'>('overview');

  const tabs = [
    { id: 'overview', label: '概要', icon: BarChart3 },
    { id: 'metrics', label: 'メトリクス', icon: TrendingUp },
    { id: 'predictions', label: '予測結果', icon: Target },
    { id: 'features', label: '特徴量', icon: Zap }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Award className="w-6 h-6 mr-2" />
          評価結果
        </h2>
      </div>

      <div className="p-6">
        {/* タブナビゲーション */}
        <div className="flex space-x-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 基本スコア */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">精度</h3>
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {Math.round(result.accuracy * 100)}%
                </div>
                <div className="text-sm text-white/70">
                  {problemType === 'classification' ? '分類精度' : '決定係数'}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-400/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">学習時間</h3>
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {result.trainingTime.toFixed(2)}s
                </div>
                <div className="text-sm text-white/70">モデル学習時間</div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">予測数</h3>
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {result.predictions.length}
                </div>
                <div className="text-sm text-white/70">テストサンプル数</div>
              </div>
            </div>

            {/* モデル情報 */}
            {result.modelInfo && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">モデル情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/70 mb-1">モデルタイプ</div>
                    <div className="text-white font-bold">{result.modelInfo.modelType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">選択特徴量数</div>
                    <div className="text-white font-bold">{result.modelInfo.selectedFeatures.length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {problemType === 'classification' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {result.detailedMetrics?.accuracy ? Math.round(result.detailedMetrics.accuracy * 100) : Math.round(result.accuracy * 100)}%
                  </div>
                  <div className="text-sm text-white/70">精度 (Accuracy)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {result.detailedMetrics?.precision ? Math.round(result.detailedMetrics.precision * 100) : 'N/A'}%
                  </div>
                  <div className="text-sm text-white/70">適合率 (Precision)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {result.detailedMetrics?.recall ? Math.round(result.detailedMetrics.recall * 100) : 'N/A'}%
                  </div>
                  <div className="text-sm text-white/70">再現率 (Recall)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {result.detailedMetrics?.f1Score ? Math.round(result.detailedMetrics.f1Score * 100) : 'N/A'}%
                  </div>
                  <div className="text-sm text-white/70">F1スコア</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {result.detailedMetrics?.mae ? result.detailedMetrics.mae.toFixed(4) : 'N/A'}
                  </div>
                  <div className="text-sm text-white/70">MAE (平均絶対誤差)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {result.detailedMetrics?.rmse ? result.detailedMetrics.rmse.toFixed(4) : 'N/A'}
                  </div>
                  <div className="text-sm text-white/70">RMSE (二乗平均平方根誤差)</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {result.detailedMetrics?.r2 ? result.detailedMetrics.r2.toFixed(4) : 'N/A'}
                  </div>
                  <div className="text-sm text-white/70">R² (決定係数)</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">予測結果サンプル (最初の20件)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-2 text-white/80">サンプル</th>
                      <th className="text-left p-2 text-white/80">実際の値</th>
                      <th className="text-left p-2 text-white/80">予測値</th>
                      <th className="text-left p-2 text-white/80">正解/不正解</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.predictions.slice(0, 20).map((prediction, index) => {
                      const actual = result.actual[index];
                      const isCorrect = problemType === 'classification' 
                        ? Math.round(prediction) === Math.round(actual)
                        : Math.abs(prediction - actual) < 0.1; // 回帰の場合は閾値で判定
                      
                      return (
                        <tr key={index} className="border-b border-white/10">
                          <td className="p-2 text-white/70">{index + 1}</td>
                          <td className="p-2 text-white">{actual}</td>
                          <td className="p-2 text-white">{prediction.toFixed(4)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              isCorrect 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {isCorrect ? '正解' : '不正解'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && result.modelInfo && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">選択された特徴量</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.modelInfo.selectedFeatures.map((featureIndex, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                    <div className="text-white font-bold text-sm">
                      {featureNames[featureIndex] || `特徴量${featureIndex}`}
                    </div>
                    <div className="text-white/60 text-xs">インデックス: {featureIndex}</div>
                  </div>
                ))}
              </div>
            </div>

            {result.modelInfo.featureImportance && (
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">特徴量重要度</h3>
                <div className="space-y-2">
                  {result.modelInfo.featureImportance.map((importance, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-32 text-white text-sm">
                        {featureNames[result.modelInfo!.selectedFeatures[index]] || `特徴量${result.modelInfo!.selectedFeatures[index]}`}
                      </div>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <div className="w-16 text-white text-sm text-right">
                        {(importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
