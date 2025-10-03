import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { Dataset } from '../types/ml';
import { createHistogram, calculateClassDistribution } from '../utils/statistics';
import { formatNumber } from '../utils/format';

interface Props {
  dataset: Dataset;
}

const COLORS = ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];

export function DistributionCharts({ dataset }: Props) {
  const classDistribution = calculateClassDistribution(dataset);
  
  const isDiscrete = (vals: (number | string)[]): boolean => {
    const unique = Array.from(new Set(vals.map(v => typeof v === 'number' ? Number(v) : String(v))));
    if (unique.length <= 12) return true;
    const nums = vals.filter(v => typeof v === 'number') as number[];
    if (nums.length === vals.length) {
      const allIntLike = nums.every(v => Math.abs(v - Math.round(v)) < 1e-6);
      if (allIntLike && unique.length <= 24) return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {dataset.classes && classDistribution.length > 0 && (
        <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2" style={{ borderColor: 'var(--gold)' }}>
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-strong)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--accent-strong)' }}>クラス分布</h3>
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--accent-strong)' }}>
            各クラスのデータ数と割合を確認できます。
            <br />
            <span className="text-xs text-gray-600">
              💡 バランスが良いと機械学習の精度が向上しやすくなります
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={classDistribution}
                    dataKey="count"
                    nameKey="class"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(item) => `${item.class}: ${item.count}`}
                  >
                    {classDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {classDistribution.map((item, i) => (
              <div
                key={i}
                className="bg-blue-50 p-3 rounded border text-center"
                style={{ borderColor: 'var(--gold)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'var(--accent-strong)' }}>{item.class}</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--accent-strong)' }}>{item.count}</div>
                <div className="text-xs" style={{ color: 'var(--gold)' }}>
                  {((item.count / dataset.train.length) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2" style={{ borderColor: 'var(--gold)' }}>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-strong)' }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--accent-strong)' }}>特徴量の分布</h3>
        </div>
        <div className="text-sm mb-4" style={{ color: 'var(--accent-strong)' }}>
          各特徴量の値の分布を確認できます。カテゴリ変数は棒グラフ、連続変数はヒストグラムで表示されます。
          <br />
          <span className="text-xs text-gray-600">
            💡 正規分布に近い形だと機械学習の精度が向上しやすくなります
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataset.featureNames.map((name, i) => {
            // 生データ（raw）があれば必ずそれを利用して分布を描画
            const rawVals = (dataset.raw?.train?.map(d => d.features[i]) ?? dataset.train.map(d => d.features[i]));
            const useDiscrete = isDiscrete(rawVals as (number | string)[]);

            if (useDiscrete) {
              const freqMap = new Map<string, number>();
              for (const v of rawVals as (number | string)[]) {
                const key = typeof v === 'number' ? String(v) : v;
                freqMap.set(key, (freqMap.get(key) || 0) + 1);
              }
              const data = Array.from(freqMap.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([category, count]) => ({ category, count }));

              return (
                <div key={i} className="bg-blue-50 p-4 rounded border" style={{ borderColor: 'var(--gold)' }}>
                  <h4 className="text-sm font-bold mb-3 text-center" style={{ color: 'var(--accent-strong)' }}>{name}（カテゴリ）</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip formatter={(v: any) => formatNumber(v)} />
                      <Bar dataKey="count" fill="#fb923c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }

            const values = (rawVals as number[]);
            const histogram = createHistogram(values, 15);
            return (
              <div key={i} className="bg-blue-50 p-4 rounded border" style={{ borderColor: 'var(--gold)' }}>
                <h4 className="text-sm font-bold mb-3 text-center" style={{ color: 'var(--accent-strong)' }}>{name}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={histogram}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(v: any) => formatNumber(v)} />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
