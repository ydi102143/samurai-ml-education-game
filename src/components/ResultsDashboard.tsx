import { Trophy, TrendingUp, Target, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ModelResult, Dataset } from '../types/ml';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { ConfusionMatrixView } from './ConfusionMatrixView';
import { LearningTips } from './LearningTips';

interface Props {
  result: ModelResult;
  dataset: Dataset;
  requiredAccuracy: number;
  modelType?: string;
}

export function ResultsDashboard({ result, dataset, requiredAccuracy, modelType }: Props) {
  const isPassed = result.accuracy >= requiredAccuracy;

  const comparisonData = result.predictions.slice(0, 20).map((pred, i) => ({
    index: i + 1,
    predicted: Number(pred),
    actual: Number(result.actual[i]),
  }));

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg p-6 shadow-lg border-4 ${
          isPassed
            ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-600'
            : 'bg-gradient-to-br from-orange-100 to-orange-50 border-orange-600'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Trophy
              className={`w-8 h-8 ${isPassed ? 'text-green-700' : 'text-orange-700'}`}
            />
            <div>
              <h3 className={`text-2xl font-bold ${isPassed ? 'text-green-900' : 'text-orange-900'}`}>
                {isPassed ? '🎉 成功！課題クリア！' : '💪 もう少し！'}
              </h3>
              <p className={`text-sm ${isPassed ? 'text-green-700' : 'text-orange-700'}`}>
                {isPassed ? 'AIの予測がとても正確でした！' : '設定を調整してもう一度挑戦してみよう！'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${
                isPassed ? 'text-green-700' : 'text-orange-700'
              }`}
            >
              {(result.accuracy * 100).toFixed(1)}%
            </div>
            <div className={`text-sm ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
              正解率
            </div>
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">必要精度</span>
            <span className="text-sm font-bold text-gray-900">
              {(requiredAccuracy * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full border-r-2 border-red-500"
              style={{ left: `${requiredAccuracy * 100}%` }}
            />
            <div
              className={`h-full transition-all duration-1000 ${
                isPassed
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(result.accuracy * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 rounded-lg p-4 shadow border-2 border-blue-600">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-medium text-blue-900">精度</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {(result.accuracy * 100).toFixed(1)}%
          </div>
        </div>

        {result.precision !== undefined && (
          <div className="bg-white/90 rounded-lg p-4 shadow border-2 border-purple-600">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-medium text-purple-900">適合率</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {(result.precision * 100).toFixed(1)}%
            </div>
          </div>
        )}

        {result.recall !== undefined && (
          <div className="bg-white/90 rounded-lg p-4 shadow border-2 border-pink-600">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pink-700" />
              <span className="text-xs font-medium text-pink-900">再現率</span>
            </div>
            <div className="text-2xl font-bold text-pink-800">
              {(result.recall * 100).toFixed(1)}%
            </div>
          </div>
        )}

        <div className="bg-white/90 rounded-lg p-4 shadow border-2 border-gray-600">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-medium text-gray-900">訓練時間</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {result.training_time}秒
          </div>
        </div>
      </div>

      {result.confusion_matrix && dataset.classes && (
        <ConfusionMatrixView
          confusionMatrix={result.confusion_matrix}
          classes={dataset.classes}
        />
      )}

      {result.feature_importance && result.feature_importance.length > 0 && (
        <FeatureImportanceChart featureImportance={result.feature_importance} />
      )}

      <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-teal-600">
        <h4 className="text-lg font-bold text-teal-900 mb-4">予測 vs 実測値（最初の20件）</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: 'サンプル', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: '値', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} name="実測値" />
            <Line type="monotone" dataKey="predicted" stroke="#dc2626" strokeWidth={2} name="予測値" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dataset.classes && (
        <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-600">
          <h4 className="text-lg font-bold text-amber-900 mb-3">アドバイス</h4>
          <ul className="space-y-2 text-sm text-amber-800">
            {result.accuracy < requiredAccuracy ? (
              <>
                <li className="flex items-start">
                  <span className="mr-2">💡</span>
                  <span>パラメータを調整してみましょう。学習率を変更すると結果が改善するかもしれません。</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💡</span>
                  <span>別のモデルを試してみるのも良い方法です。</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💡</span>
                  <span>イテレーション数を増やすと、より良い結果が得られることがあります。</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <span className="mr-2">🎉</span>
                  <span>素晴らしい！課題をクリアしました。次の地域に挑戦しましょう！</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⭐</span>
                  <span>より高い精度を目指して、さらなる改善に挑戦してみてください。</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* 学習のヒント */}
      <LearningTips 
        accuracy={result.accuracy} 
        requiredAccuracy={requiredAccuracy} 
        modelType={modelType || ''} 
      />
    </div>
  );
}
