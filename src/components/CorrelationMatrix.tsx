import { Grid3x3 as Grid3X3 } from 'lucide-react';
import type { Dataset } from '../types/ml';
import { calculateCorrelationMatrix } from '../utils/statistics';

interface Props {
  dataset: Dataset;
}

export function CorrelationMatrix({ dataset }: Props) {
  const correlationMatrix = calculateCorrelationMatrix(dataset);

  const getColor = (value: number): string => {
    if (value > 0.7) return 'bg-red-600';
    if (value > 0.5) return 'bg-red-500';
    if (value > 0.3) return 'bg-orange-400';
    if (value > 0.1) return 'bg-yellow-300';
    if (value > -0.1) return 'bg-gray-200';
    if (value > -0.3) return 'bg-blue-300';
    if (value > -0.5) return 'bg-blue-400';
    if (value > -0.7) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  const getTextColor = (value: number): string => {
    if (Math.abs(value) > 0.5) return 'text-white';
    return 'text-gray-900';
  };

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-teal-600">
      <div className="flex items-center space-x-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-teal-900" />
        <h3 className="text-lg font-bold text-teal-900">相関行列</h3>
      </div>

      <div className="mb-4 text-sm text-teal-800">
        <p>特徴量間の相関係数を表示しています。</p>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs">強い正の相関 (0.7~1.0)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-xs">相関なし (-0.1~0.1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-xs">強い負の相関 (-1.0~-0.7)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-teal-300 bg-teal-50 p-2"></th>
              {dataset.featureNames.map((name, i) => (
                <th key={i} className="border-2 border-teal-300 bg-teal-50 p-2 text-xs font-bold text-teal-900">
                  {name.slice(0, 6)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correlationMatrix.map((row, i) => (
              <tr key={i}>
                <td className="border-2 border-teal-300 bg-teal-50 p-2 text-xs font-bold text-teal-900">
                  {dataset.featureNames[i].slice(0, 6)}
                </td>
                {row.map((value, j) => (
                  <td
                    key={j}
                    className={`border-2 border-teal-300 p-2 text-center ${getColor(value)} ${getTextColor(value)}`}
                  >
                    <span className="text-xs font-bold">{value.toFixed(2)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-teal-50 p-4 rounded border border-teal-300">
        <h4 className="text-sm font-bold text-teal-900 mb-2">相関係数の解釈</h4>
        <ul className="text-xs text-teal-800 space-y-1">
          <li>• <strong>1.0</strong>: 完全な正の相関（一方が増えれば他方も増える）</li>
          <li>• <strong>0.0</strong>: 相関なし（関係性がない）</li>
          <li>• <strong>-1.0</strong>: 完全な負の相関（一方が増えれば他方は減る）</li>
          <li>• 対角線上の1.0は自分自身との相関を示します</li>
        </ul>
      </div>
    </div>
  );
}
