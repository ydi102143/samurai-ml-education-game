import { Maximize2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { formatNumber } from '../utils/format';
import type { Dataset } from '../types/ml';

interface Props {
  dataset: Dataset;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ScatterPlotMatrix({ dataset }: Props) {
  // 生データがあればそれを使用して散布図を描画
  const rawSource = dataset.raw?.train?.length ? dataset.raw.train : dataset.train;
  const sampleSize = Math.min(rawSource.length, 200);
  const sampledData = rawSource.slice(0, sampleSize) as { features: number[]; label: number | string }[];

  const featurePairs: [number, number][] = [];
  for (let i = 0; i < dataset.featureNames.length; i++) {
    for (let j = i + 1; j < dataset.featureNames.length; j++) {
      featurePairs.push([i, j]);
    }
  }

  const topPairs = featurePairs.slice(0, 6);

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-pink-600">
      <div className="flex items-center space-x-2 mb-4">
        <Maximize2 className="w-5 h-5 text-pink-900" />
        <h3 className="text-lg font-bold text-pink-900">散布図行列（主要な特徴量ペア）</h3>
      </div>

      <div className="text-sm text-pink-800 mb-4">
        特徴量間の関係性を視覚的に確認できます。
        {dataset.classes && '色分けはクラスを表しています。'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topPairs.map(([i, j], index) => {
          const data = sampledData.map(point => ({
            x: point.features[i] as number,
            y: point.features[j] as number,
            label: Number(point.label),
          }));

          const labelGroups = dataset.classes
            ? [...new Set(data.map(d => d.label))].sort()
            : [0];

          return (
            <div key={index} className="bg-pink-50 p-3 rounded border border-pink-300">
              <h4 className="text-xs font-bold text-pink-900 mb-2 text-center">
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
                          <div className="bg-white p-2 border border-pink-300 rounded shadow text-xs">
                            <p className="text-pink-900">
                              {dataset.featureNames[i]}: {formatNumber(data.x)}
                            </p>
                            <p className="text-pink-900">
                              {dataset.featureNames[j]}: {formatNumber(data.y)}
                            </p>
                            {dataset.classes && (
                              <p className="text-pink-900 font-bold">
                                クラス: {dataset.classes[data.label]}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {labelGroups.map((label, idx) => (
                    <Scatter
                      key={label}
                      name={dataset.classes ? dataset.classes[label] : `グループ ${label}`}
                      data={data.filter(d => d.label === label)}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {featurePairs.length > 6 && (
        <div className="mt-4 text-center text-sm text-pink-700">
          主要な{topPairs.length}組の特徴量ペアを表示しています
          （全{featurePairs.length}組）
        </div>
      )}
    </div>
  );
}
