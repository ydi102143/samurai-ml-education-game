import { TrendingUp } from 'lucide-react';
import type { Dataset } from '../types/ml';
import { calculateFeatureStats } from '../utils/statistics';

interface Props {
  dataset: Dataset;
}

export function StatisticsPanel({ dataset }: Props) {
  const stats = calculateFeatureStats(dataset);

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-green-600">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-900" />
        <h3 className="text-lg font-bold text-green-900">統計情報</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-green-300">
              <th className="px-2 py-2 text-left text-green-900">特徴量</th>
              <th className="px-2 py-2 text-right text-green-900">平均</th>
              <th className="px-2 py-2 text-right text-green-900">中央値</th>
              <th className="px-2 py-2 text-right text-green-900">標準偏差</th>
              <th className="px-2 py-2 text-right text-green-900">最小値</th>
              <th className="px-2 py-2 text-right text-green-900">最大値</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, i) => (
              <tr key={i} className="border-b border-green-200 hover:bg-green-50">
                <td className="px-2 py-2 font-medium text-green-900">{stat.name}</td>
                <td className="px-2 py-2 text-right text-green-800">{stat.mean.toFixed(3)}</td>
                <td className="px-2 py-2 text-right text-green-800">{stat.median.toFixed(3)}</td>
                <td className="px-2 py-2 text-right text-green-800">{stat.std.toFixed(3)}</td>
                <td className="px-2 py-2 text-right text-green-800">{stat.min.toFixed(3)}</td>
                <td className="px-2 py-2 text-right text-green-800">{stat.max.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {stats.map((stat, i) => {
          return (
            <div key={i} className="bg-green-50 p-3 rounded border border-green-300">
              <div className="text-sm font-medium text-green-900 mb-2">{stat.name}</div>
              <div className="relative h-8 bg-green-100 rounded">
                <div
                  className="absolute h-full bg-green-300 rounded-l"
                  style={{
                    left: '0%',
                    width: `${((stat.q1 - stat.min) / (stat.max - stat.min)) * 100}%`,
                  }}
                />
                <div
                  className="absolute h-full bg-green-500"
                  style={{
                    left: `${((stat.q1 - stat.min) / (stat.max - stat.min)) * 100}%`,
                    width: `${((stat.q3 - stat.q1) / (stat.max - stat.min)) * 100}%`,
                  }}
                />
                <div
                  className="absolute h-full bg-green-300 rounded-r"
                  style={{
                    left: `${((stat.q3 - stat.min) / (stat.max - stat.min)) * 100}%`,
                    width: `${((stat.max - stat.q3) / (stat.max - stat.min)) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-red-600"
                  style={{
                    left: `${((stat.mean - stat.min) / (stat.max - stat.min)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-green-700 mt-1">
                <span>最小: {stat.min.toFixed(2)}</span>
                <span>Q1: {stat.q1.toFixed(2)}</span>
                <span className="font-bold text-red-700">平均: {stat.mean.toFixed(2)}</span>
                <span>Q3: {stat.q3.toFixed(2)}</span>
                <span>最大: {stat.max.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
