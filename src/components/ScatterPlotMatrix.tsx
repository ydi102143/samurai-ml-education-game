import { Maximize2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { formatNumber } from '../utils/format';
import type { Dataset } from '../types/ml';

interface Props {
  dataset: Dataset;
}

// 戦国時代テーマに合った色設定（問題タイプ別）
const getColorsForProblem = (problemType: string, classes?: string[]) => {
  if (problemType === 'classification' && classes) {
    // 分類問題の色分け
    if (classes.includes('中国') || classes.includes('南蛮') || classes.includes('朝鮮') || classes.includes('日本')) {
      // 堺（産地分類）
      return ['#DC143C', '#228B22', '#DAA520', '#4B0082']; // 中国、朝鮮、南蛮、日本
    } else if (classes.includes('槍兵') || classes.includes('弓兵') || classes.includes('鉄砲隊') || classes.includes('騎馬隊')) {
      // 尾張（兵種分類）
      return ['#8B4513', '#DC143C', '#228B22', '#DAA520']; // 槍兵、弓兵、鉄砲隊、騎馬隊
    } else if (classes.includes('敗北') || classes.includes('勝利')) {
      // 薩摩（戦果分類）
      return ['#DC143C', '#228B22']; // 敗北、勝利
    } else if (classes.includes('低い') || classes.includes('中程度') || classes.includes('高い')) {
      // 相模（繁栄度分類）
      return ['#8B4513', '#DAA520', '#228B22']; // 低い、中程度、高い
    } else if (classes.includes('危険') || classes.includes('注意') || classes.includes('安全')) {
      // 高松（安全性分類）
      return ['#DC143C', '#DAA520', '#228B22']; // 危険、注意、安全
    }
  }
  
  // デフォルトの戦国時代テーマ色
  return [
    '#8B4513', // 茶色（土・大地）
    '#DC143C', // 深紅（血・戦）
    '#228B22', // 森緑（自然・農業）
    '#DAA520', // 金色（権力・富）
    '#4B0082', // 紫（高貴・神秘）
    '#B22222', // 赤レンガ（城・建築）
    '#2F4F4F', // ダークスレート（石・鉱物）
    '#CD853F'  // ペルー（木材・工芸）
  ];
};

export function ScatterPlotMatrix({ dataset }: Props) {
  // 生データがあればそれを使用して散布図を描画
  const rawSource = dataset.raw?.train?.length ? dataset.raw.train : dataset.train;
  const sampleSize = Math.min(rawSource.length, 200);
  const sampledData = rawSource.slice(0, sampleSize) as { features: number[]; label: number | string }[];
  const isClassification = dataset.classes && dataset.classes.length > 0;
  
  // データが存在しない場合の早期リターン
  if (!dataset || !sampledData || sampledData.length === 0) {
    return (
      <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2" style={{ borderColor: 'var(--gold)' }}>
        <div className="text-center text-gray-500">
          データが読み込まれていません
        </div>
      </div>
    );
  }
  
  
  // 問題タイプに応じた色設定
  const colors = getColorsForProblem(
    isClassification ? 'classification' : 'regression',
    dataset.classes
  );

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
        <br />
        <span className="text-xs text-gray-500">
          🎨 戦国時代テーマの色で表示：{isClassification ? '各クラスが異なる色で表示されます' : '回帰問題は茶色系で表示されます'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topPairs.map(([i, j], index) => {
          const data = sampledData.map(point => {
            // 生データを使用する場合、正規化前の値を使用
            const xValue = dataset.raw ? point.features[i] as number : (point.features[i] as number);
            const yValue = dataset.raw ? point.features[j] as number : (point.features[j] as number);
            
            // ラベルの処理を改善
            let labelValue: number;
            if (isClassification) {
              if (typeof point.label === 'string') {
                // 文字列ラベルの場合は、クラス配列のインデックスを取得
                const classIndex = dataset.classes?.indexOf(point.label) ?? 0;
                labelValue = classIndex;
              } else {
                labelValue = Number(point.label);
              }
            } else {
              labelValue = Number(point.label);
            }
            
            return {
              x: xValue,
              y: yValue,
              label: labelValue,
              value: labelValue, // 回帰用の値
            };
          });


          // データが空の場合はスキップ
          if (data.length === 0) {
            return (
            <div key={index} className="p-3 rounded border" style={{ 
              background: 'linear-gradient(135deg, #f8f4e6 0%, #f0e6d2 100%)', 
              borderColor: 'var(--gold)',
              borderWidth: '2px'
            }}>
              <h4 className="text-xs font-bold mb-2 text-center" style={{ color: 'var(--accent-strong)' }}>
                {dataset.featureNames[i]} vs {dataset.featureNames[j]}
              </h4>
              <div className="text-center text-gray-500 text-xs">データがありません</div>
            </div>
            );
          }

          // データがすべて同じ値の場合は警告
          const xValues = data.map(d => d.x);
          const yValues = data.map(d => d.y);
          const xUnique = [...new Set(xValues)];
          const yUnique = [...new Set(yValues)];
          
          if (xUnique.length === 1 && yUnique.length === 1) {
            return (
            <div key={index} className="p-3 rounded border" style={{ 
              background: 'linear-gradient(135deg, #f8f4e6 0%, #f0e6d2 100%)', 
              borderColor: 'var(--gold)',
              borderWidth: '2px'
            }}>
              <h4 className="text-xs font-bold mb-2 text-center" style={{ color: 'var(--accent-strong)' }}>
                {dataset.featureNames[i]} vs {dataset.featureNames[j]}
              </h4>
              <div className="text-center text-gray-500 text-xs">データの変化がありません</div>
            </div>
            );
          }

          // 戦国時代のデータに合わせたスケール調整
          const xMin = xValues.length > 0 ? Math.min(...xValues) : 0;
          const xMax = xValues.length > 0 ? Math.max(...xValues) : 1;
          const yMin = yValues.length > 0 ? Math.min(...yValues) : 0;
          const yMax = yValues.length > 0 ? Math.max(...yValues) : 1;
          
          
          // 戦国時代のデータに適した軸の範囲設定
          const xRange = xMax - xMin;
          const yRange = yMax - yMin;
          const xPadding = xRange > 0 ? xRange * 0.1 : 0.1; // 10%のパディング
          const yPadding = yRange > 0 ? yRange * 0.1 : 0.1;
          
          // データがすべて同じ値の場合の処理
          const xDomain = xRange === 0 ? [xMin - 0.1, xMin + 0.1] : [Math.max(0, xMin - xPadding), xMax + xPadding];
          const yDomain = yRange === 0 ? [yMin - 0.1, yMin + 0.1] : [Math.max(0, yMin - yPadding), yMax + yPadding];
          

          const labelGroups = isClassification
            ? [...new Set(data.map(d => d.label))].sort()
            : [0];

          return (
            <div key={index} className="p-3 rounded border" style={{ 
              background: 'linear-gradient(135deg, #f8f4e6 0%, #f0e6d2 100%)', 
              borderColor: 'var(--gold)',
              borderWidth: '2px'
            }}>
              <h4 className="text-xs font-bold mb-2 text-center" style={{ color: 'var(--accent-strong)' }}>
                {dataset.featureNames[i]} vs {dataset.featureNames[j]}
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#8B4513" strokeOpacity={0.3} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={dataset.featureNames[i]}
                    domain={xDomain}
                    tick={{ fontSize: 10, fill: '#8B4513' }}
                    axisLine={{ stroke: '#8B4513' }}
                    tickLine={{ stroke: '#8B4513' }}
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
                    tick={{ fontSize: 10, fill: '#8B4513' }}
                    axisLine={{ stroke: '#8B4513' }}
                    tickLine={{ stroke: '#8B4513' }}
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
                    labelGroups.map((label, idx) => {
                      const labelData = data.filter(d => d.label === label);
                      return labelData.length > 0 ? (
                    <Scatter
                      key={label}
                      name={dataset.classes ? dataset.classes[label] : `グループ ${label}`}
                          data={labelData}
                          fill={colors[idx % colors.length]}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          fillOpacity={0.8}
                          r={4}
                        />
                      ) : null;
                    })
                  ) : (
                    data.length > 0 ? (
                      <Scatter
                        data={data}
                        fill={colors[0]}
                        fillOpacity={0.8}
                        stroke={colors[1] || colors[0]}
                        strokeWidth={2}
                        r={4}
                      />
                    ) : null
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
