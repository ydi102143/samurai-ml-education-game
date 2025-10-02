import { BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FeatureImportance } from '../types/ml';

interface Props {
  featureImportance: FeatureImportance[];
}

export function FeatureImportanceChart({ featureImportance }: Props) {
  const chartData = featureImportance.map(fi => ({
    name: fi.featureName,
    importance: fi.importance * 100,
  }));

  const colors = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

  return (
    <div className="bg-white/95 rounded-lg p-6 shadow-lg border-2 border-green-600">
      <div className="flex items-center space-x-2 mb-4">
        <BarChartIcon className="w-5 h-5 text-green-900" />
        <h3 className="text-lg font-bold text-green-900">特徴量の重要度</h3>
      </div>

      <p className="text-sm text-green-800 mb-4">
        各特徴量がモデルの予測にどれだけ影響を与えているかを示します。重要度が高い特徴量ほど、予測精度の向上に貢献しています。
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
          <XAxis type="number" domain={[0, 100]} stroke="#166534" />
          <YAxis type="category" dataKey="name" stroke="#166534" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #16a34a',
              borderRadius: '8px',
            }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <div className="bg-green-50 p-3 rounded border border-green-300">
          <p className="text-sm text-green-900">
            <span className="font-bold">ヒント：</span>
            重要度の低い特徴量を除外することで、モデルがシンプルになり、過学習を防ぐことができます。
          </p>
        </div>
      </div>
    </div>
  );
}
