import { Maximize2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { formatNumber } from '../utils/format';
import type { Dataset } from '../types/ml';

interface Props {
  dataset: Dataset;
}

const COLORS = ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#1e3a8a', '#3b82f6'];

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

          // 戦国時代のデータに合わせたスケール調整
          const xValues = data.map(d => d.x);
          const yValues = data.map(d => d.y);
          const xMin = Math.min(...xValues);
          const xMax = Math.max(...xValues);
          const yMin = Math.min(...yValues);
          const yMax = Math.max(...yValues);
          
          // 戦国時代のデータに適した軸の範囲設定
          const xRange = xMax - xMin;
          const yRange = yMax - yMin;
          const xPadding = xRange > 0 ? xRange * 0.05 : 1; // 5%のパディング
          const yPadding = yRange > 0 ? yRange * 0.05 : 1;
          
          const xDomain = [Math.max(0, xMin - xPadding), xMax + xPadding];
          const yDomain = [Math.max(0, yMin - yPadding), yMax + yPadding];

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
                    domain={xDomain}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      // 戦国時代のデータに合わせた表示形式
                      const unit = dataset.raw?.featureUnits?.[i] || '';
                      if (unit) {
                        if (unit === 'm/s') return `${Math.round(value * 10) / 10}${unit}`;
                        if (unit === 'm') return `${Math.round(value * 10) / 10}${unit}`;
                        if (unit === '隻') return `${Math.round(value)}${unit}`;
                        if (unit === '点') return `${Math.round(value)}${unit}`;
                        if (unit === '段階') return `${Math.round(value)}${unit}`;
                        if (unit === '文') return `${Math.round(value)}${unit}`;
                        if (unit === '年') return `${Math.round(value)}${unit}`;
                        if (unit === '歳') return `${Math.round(value)}${unit}`;
                        if (unit === '℃') return `${Math.round(value)}${unit}`;
                        if (unit === 'mm') return `${Math.round(value)}${unit}`;
                        if (unit === '時間') return `${Math.round(value)}h`;
                        if (unit === 'kg') return `${Math.round(value)}${unit}`;
                        if (unit === '両') return `${Math.round(value)}${unit}`;
                        if (unit === '石') return `${Math.round(value)}${unit}`;
                        return `${Math.round(value)}${unit}`;
                      }
                      return formatNumber(value).toString();
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={dataset.featureNames[j]}
                    domain={yDomain}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      // 戦国時代のデータに合わせた表示形式
                      const unit = dataset.raw?.featureUnits?.[j] || '';
                      if (unit) {
                        if (unit === 'm/s') return `${Math.round(value * 10) / 10}${unit}`;
                        if (unit === 'm') return `${Math.round(value * 10) / 10}${unit}`;
                        if (unit === '隻') return `${Math.round(value)}${unit}`;
                        if (unit === '点') return `${Math.round(value)}${unit}`;
                        if (unit === '段階') return `${Math.round(value)}${unit}`;
                        if (unit === '文') return `${Math.round(value)}${unit}`;
                        if (unit === '年') return `${Math.round(value)}${unit}`;
                        if (unit === '歳') return `${Math.round(value)}${unit}`;
                        if (unit === '℃') return `${Math.round(value)}${unit}`;
                        if (unit === 'mm') return `${Math.round(value)}${unit}`;
                        if (unit === '時間') return `${Math.round(value)}h`;
                        if (unit === 'kg') return `${Math.round(value)}${unit}`;
                        if (unit === '両') return `${Math.round(value)}${unit}`;
                        if (unit === '石') return `${Math.round(value)}${unit}`;
                        return `${Math.round(value)}${unit}`;
                      }
                      return formatNumber(value).toString();
                    }}
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
                              {dataset.featureNames[i]}: {(() => {
                                const unit = dataset.raw?.featureUnits?.[i] || '';
                                if (unit) {
                                  return `${Math.round(data.x)}${unit}`;
                                }
                                return formatNumber(data.x);
                              })()}
                            </p>
                            <p className="font-medium" style={{ color: 'var(--accent-strong)' }}>
                              {dataset.featureNames[j]}: {(() => {
                                const unit = dataset.raw?.featureUnits?.[j] || '';
                                if (unit) {
                                  return `${Math.round(data.y)}${unit}`;
                                }
                                return formatNumber(data.y);
                              })()}
                            </p>
                            {isClassification ? (
                              <p className="font-bold" style={{ color: 'var(--gold)' }}>
                                クラス: {dataset.classes![data.label]}
                              </p>
                            ) : (
                              <p className="font-bold" style={{ color: 'var(--gold)' }}>
                                {dataset.labelName}: {(() => {
                                  const unit = dataset.raw?.featureUnits?.[dataset.featureNames.length] || '';
                                  if (unit) {
                                    return `${Math.round(data.value)}${unit}`;
                                  }
                                  return formatNumber(data.value);
                                })()}
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
