import { Maximize2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { formatNumber } from '../utils/format';
import type { Dataset } from '../types/ml';

interface Props {
  dataset: Dataset;
}

const COLORS = ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];

export function ScatterPlotMatrix({ dataset }: Props) {
  // 生データがあればそれを使用して散布図を描画
  const rawSource = dataset.raw?.train?.length ? dataset.raw.train : dataset.train;
  const sampleSize = Math.min(rawSource.length, 200);
  const sampledData = rawSource.slice(0, sampleSize) as { features: number[]; label: number | string }[];
  const isClassification = dataset.classes && dataset.classes.length > 0;

  const featurePairs: [number, number][] = [];
  for (let i = 0; i < dataset.featureNames.length; i++) {
    for (let j = i + 1; j < dataset.featureNames.length; j++) {
      featurePairs.push([i, j]);
    }
  }

  const topPairs = featurePairs.slice(0, 6);

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2" style={{ borderColor: 'var(--gold)' }}>
      <div className="flex items-center space-x-2 mb-4">
        <Maximize2 className="w-5 h-5" style={{ color: 'var(--accent-strong)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--accent-strong)' }}>散布図行列（主要な特徴量ペア）</h3>
      </div>

      <div className="text-sm mb-4" style={{ color: 'var(--accent-strong)' }}>
        特徴量間の関係性を視覚的に確認できます。
        {isClassification ? '色分けはクラスを表しています。' : '色の濃さは目的変数の値を表しています。'}
        <br />
        <span className="text-xs text-gray-600">
          💡 {isClassification 
            ? '直線的な関係があれば線形モデル、曲線的な関係があれば非線形モデルが適しています'
            : '特徴量と目的変数の関係を確認し、予測に有効な特徴量を見つけましょう'
          }
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topPairs.map(([i, j], index) => {
          const data = sampledData.map(point => ({
            x: point.features[i] as number,
            y: point.features[j] as number,
            label: isClassification ? Number(point.label) : point.label as number,
            value: point.label as number, // 回帰用の値
          }));

          const labelGroups = isClassification
            ? [...new Set(data.map(d => d.label))].sort()
            : [0];

          return (
            <div key={index} className="bg-blue-50 p-3 rounded border" style={{ borderColor: 'var(--gold)' }}>
              <h4 className="text-xs font-bold mb-2 text-center" style={{ color: 'var(--accent-strong)' }}>
                {dataset.featureNames[i]} vs {dataset.featureNames[j]}
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={dataset.featureNames[i]}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={dataset.featureNames[j]}
                    tick={{ fontSize: 10 }}
                  />
                  <ZAxis range={[50, 50]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg text-xs" style={{ borderColor: 'var(--gold)' }}>
                            <p className="font-medium" style={{ color: 'var(--accent-strong)' }}>
                              {dataset.featureNames[i]}: {formatNumber(data.x)}
                            </p>
                            <p className="font-medium" style={{ color: 'var(--accent-strong)' }}>
                              {dataset.featureNames[j]}: {formatNumber(data.y)}
                            </p>
                            {isClassification ? (
                              <p className="font-bold" style={{ color: 'var(--gold)' }}>
                                クラス: {dataset.classes![data.label]}
                              </p>
                            ) : (
                              <p className="font-bold" style={{ color: 'var(--gold)' }}>
                                {dataset.labelName}: {formatNumber(data.value)}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {isClassification ? (
                    labelGroups.map((label, idx) => (
                      <Scatter
                        key={label}
                        name={dataset.classes ? dataset.classes[label] : `グループ ${label}`}
                        data={data.filter(d => d.label === label)}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))
                  ) : (
                    <Scatter
                      data={data}
                      fill="#1e40af"
                      fillOpacity={0.6}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {featurePairs.length > 6 && (
        <div className="mt-4 text-center text-sm" style={{ color: 'var(--accent-strong)' }}>
          主要な{topPairs.length}組の特徴量ペアを表示しています
          （全{featurePairs.length}組）
        </div>
      )}
    </div>
  );
}
