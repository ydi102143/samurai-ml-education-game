import { useState, useMemo } from 'react';
import { Database, BarChart, Grid3x3 as Grid3X3, Maximize2, TrendingUp, AlertTriangle, Lightbulb, Target, Eye } from 'lucide-react';
import type { Dataset } from '../types/ml';
import { StatisticsPanel } from './StatisticsPanel';
import { DistributionCharts } from './DistributionCharts';
import { CorrelationMatrix } from './CorrelationMatrix';
import { ScatterPlotMatrix } from './ScatterPlotMatrix';
import { calculateDataInsights, suggestDataImprovements, detectAnomalies } from '../utils/dataAnalysis';
import { formatNumber } from '../utils/format';

interface Props {
  dataset: Dataset;
}

type Tab = 'overview' | 'statistics' | 'distribution' | 'correlation' | 'scatter' | 'insights';

export function DataExplorer({ dataset }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  // 表は正規化後の比較用として残すが、統計や分布は別コンポーネント側でraw優先

  const insights = useMemo(() => calculateDataInsights(dataset), [dataset]);
  const anomalies = useMemo(() => detectAnomalies(dataset), [dataset]);
  const suggestions = useMemo(() => suggestDataImprovements(insights, dataset), [insights, dataset]);

  const tabs: { id: Tab; label: string; icon: typeof Database; description: string }[] = [
    { id: 'overview', label: 'データの中身', icon: Database, description: '実際のデータを見てみよう' },
    { id: 'statistics', label: '数値の特徴', icon: TrendingUp, description: '平均・最大・ばらつきを確認' },
    { id: 'distribution', label: '値の広がり', icon: BarChart, description: 'どの値が多いかヒストグラムで確認' },
    { id: 'correlation', label: '関係性', icon: Grid3X3, description: '特徴同士の相関を見る' },
    { id: 'scatter', label: '散らばり具合', icon: Maximize2, description: '2つの特徴の関係を見る' },
    { id: 'insights', label: 'アドバイス', icon: Lightbulb, description: '次の一手のヒント' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
      <div className="p-4 rounded-t-xl" style={{ background: 'linear-gradient(to right, #1e3a8a, #1e40af)' }}>
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <h3 className="text-lg font-bold text-white">データを調べよう</h3>
        </div>
        <p className="text-sm text-white/85">データをよく観察して、パターンや特徴を見つけよう！</p>
      </div>

      <div className="border-b" style={{ borderColor: 'var(--gold)', background: 'rgba(30,58,138,0.06)' }}>
        <div className="flex space-x-2 p-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-3 rounded-lg transition-all whitespace-nowrap min-w-[120px] border-2 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md scale-105 font-bold'
                    : 'bg-white/40 hover:bg-white/60 border-white/50'
                }`}
                style={{ 
                  color: activeTab === tab.id ? '#1e3a8a' : '#1e3a8a',
                  borderColor: activeTab === tab.id ? 'var(--gold)' : 'rgba(30,58,138,0.3)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" style={{ color: activeTab === tab.id ? '#1e3a8a' : '#1e3a8a' }} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                <span className="text-xs" style={{ color: activeTab === tab.id ? '#374151' : '#1e3a8a' }}>{tab.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* タブ別ヒント */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-b" style={{ borderColor: 'var(--gold)' }}>
        {activeTab === 'overview' && (
          <div className="text-sm text-slate-800 flex items-start space-x-2">
            <Eye className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">見方のコツ</div>
              <div>単位や桁を確認し、常識的な値かをチェック。生データ（raw）があれば比較して理解を深めよう。</div>
            </div>
          </div>
        )}
        {activeTab === 'distribution' && (
          <div className="text-sm text-slate-800 flex items-start space-x-2">
            <BarChart className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">読み取りポイント</div>
              <div>山型＝自然な分布。片寄りや二峰性のときは前処理（正規化/標準化）を検討しよう。</div>
            </div>
          </div>
        )}
        {activeTab === 'correlation' && (
          <div className="text-sm text-slate-800 flex items-start space-x-2">
            <Grid3X3 className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">読み取りポイント</div>
              <div>相関の高い特徴は有力候補。同じ情報の重複は減らしてシンプルに。</div>
            </div>
          </div>
        )}
        {activeTab === 'scatter' && (
          <div className="text-sm text-slate-800 flex items-start space-x-2">
            <Maximize2 className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">読み取りポイント</div>
              <div>直線/曲線の形が見えたら、それに合うモデル（線形/非線形）を選ぼう。</div>
            </div>
          </div>
        )}
        {activeTab === 'statistics' && (
          <div className="text-sm text-blue-800 flex items-start space-x-2">
            <TrendingUp className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">読み取りポイント</div>
              <div>平均±標準偏差の範囲が常識的か、外れ値が多すぎないかを確認しよう。</div>
            </div>
          </div>
        )}
        {activeTab === 'insights' && (
          <div className="text-sm text-slate-800 flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-bold">次の一手</div>
              <div>必要に応じて前処理タブで正規化/標準化を試し、相関の高い特徴を中心に選んでみよう。</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded border border-blue-300">
              <div className="text-sm font-medium text-blue-900 mb-1">データ数</div>
              <div className="text-lg font-bold text-blue-800">
                訓練: {dataset.train.length} / テスト: {dataset.test.length}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-300">
              <div className="text-sm font-medium text-blue-900 mb-2">特徴量</div>
              <div className="space-y-1">
                {dataset.featureNames.map((name, i) => (
                  <div key={i} className="text-xs text-blue-800 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {dataset.classes && (
              <div className="bg-blue-50 p-3 rounded border border-blue-300">
                <div className="text-sm font-medium text-blue-900 mb-2">クラス</div>
                <div className="flex flex-wrap gap-2">
                  {dataset.classes.map((cls, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded font-medium"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 生データ（前処理前） */}
            {dataset.raw && (
              <div className="bg-green-50 p-3 rounded border border-green-300">
                <div className="text-sm font-medium text-green-900 mb-2">生データ（前処理前）</div>
                <div className="overflow-x-auto bg-white rounded border border-green-200">
                  <table className="w-full text-sm">
                    <thead className="bg-green-100">
                      <tr className="border-b border-green-300">
                        {dataset.featureNames.map((name, i) => (
                          <th key={i} className="px-2 py-2 text-left text-green-900 font-semibold">
                            {name}
                            {dataset.raw?.featureUnits?.[i] && (
                              <span className="text-green-700 ml-1">({dataset.raw.featureUnits[i]})</span>
                            )}
                          </th>
                        ))}
                        <th className="px-2 py-2 text-left text-green-900 font-semibold">ラベル</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {dataset.raw.train.slice(0, 5).map((point, i) => (
                        <tr key={i} className="border-b border-green-200 hover:bg-green-50">
                          {point.features.map((val, j) => (
                            <td key={j} className="px-2 py-2 text-green-900">
                              {typeof val === 'number' ? formatNumber(val) : val}
                            </td>
                          ))}
                          <td className="px-2 py-2 text-green-900 font-medium">
                            {Array.isArray(dataset.classes) && typeof point.label === 'number'
                              ? dataset.classes[point.label] ?? point.label
                              : point.label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 正規化テーブルは前処理タブで対応するため非表示 */}
          </div>
        )}

        {activeTab === 'statistics' && <StatisticsPanel dataset={dataset} />}
        {activeTab === 'distribution' && <DistributionCharts dataset={dataset} />}
        {activeTab === 'correlation' && <CorrelationMatrix dataset={dataset} />}
        {activeTab === 'scatter' && <ScatterPlotMatrix dataset={dataset} />}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-400">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                <h4 className="text-lg font-bold text-amber-900">データ改善の提案</h4>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm text-amber-800">
                    <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            {insights.classBalance && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-400">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart className="w-5 h-5 text-blue-700" />
                  <h4 className="text-lg font-bold text-blue-900">クラスバランス</h4>
                </div>
                <div className="space-y-2">
                  {Object.entries(insights.classBalance).map(([className, count]) => {
                    const total = Object.values(insights.classBalance!).reduce((a, b) => a + b, 0);
                    const percentage = (count / total * 100).toFixed(1);
                    return (
                      <div key={className} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-blue-900">{className}</span>
                          <span className="text-blue-700">{count}件 ({percentage}%)</span>
                        </div>
                        <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {insights.outliers.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-400">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                  <h4 className="text-lg font-bold text-red-900">外れ値の検出</h4>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  {insights.outliers.length}個の外れ値が検出されました（表示上限20個）。これらは通常のパターンから大きく外れたデータポイントです。
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {insights.outliers.slice(0, 10).map((outlier, i) => (
                    <div key={i} className="bg-white p-2 rounded border border-red-300 text-xs">
                      <span className="font-medium text-red-900">
                        データ#{outlier.index + 1}
                      </span>
                      <span className="text-red-700 ml-2">
                        {dataset.featureNames[outlier.featureIndex]}: {outlier.value.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {anomalies.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-400">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-orange-700" />
                  <h4 className="text-lg font-bold text-orange-900">異常データの検出</h4>
                </div>
                <p className="text-sm text-orange-800">
                  {anomalies.length}個の異常なデータポイントが検出されました。複数の特徴量で同時に異常な値を持つデータです。
                </p>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-400">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="w-5 h-5 text-green-700" />
                <h4 className="text-lg font-bold text-green-900">データ品質スコア</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-800">完全性</span>
                    <span className="font-bold text-green-900">100%</span>
                  </div>
                  <div className="h-2 bg-green-200 rounded-full">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-800">バランス</span>
                    <span className="font-bold text-green-900">
                      {insights.classBalance ? (
                        (() => {
                          const counts = Object.values(insights.classBalance);
                          const max = Math.max(...counts);
                          const min = Math.min(...counts);
                          const balance = (min / max * 100);
                          return `${balance.toFixed(0)}%`;
                        })()
                      ) : '100%'}
                    </span>
                  </div>
                  <div className="h-2 bg-green-200 rounded-full">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{
                        width: insights.classBalance ?
                          (() => {
                            const counts = Object.values(insights.classBalance);
                            const max = Math.max(...counts);
                            const min = Math.min(...counts);
                            return `${(min / max * 100).toFixed(0)}%`;
                          })() : '100%'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-800">異常値の少なさ</span>
                    <span className="font-bold text-green-900">
                      {(((dataset.train.length + dataset.test.length - insights.outliers.length) / (dataset.train.length + dataset.test.length)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-green-200 rounded-full">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{
                        width: `${(((dataset.train.length + dataset.test.length - insights.outliers.length) / (dataset.train.length + dataset.test.length)) * 100).toFixed(0)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
