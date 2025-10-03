import { Grid3x3 as Grid3X3 } from 'lucide-react';

interface Props {
  confusionMatrix: number[][];
  classes: string[];
}

export function ConfusionMatrixView({ confusionMatrix, classes }: Props) {
  const total = confusionMatrix.flat().reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...confusionMatrix.flat());

  const getColor = (value: number): string => {
    const intensity = value / maxValue;
    if (intensity > 0.7) return 'bg-green-600 text-white';
    if (intensity > 0.4) return 'bg-green-400 text-green-900';
    if (intensity > 0.1) return 'bg-green-200 text-green-900';
    return 'bg-green-50 text-green-700';
  };

  const calculateMetrics = () => {
    const metrics = classes.map((_, i) => {
      const tp = confusionMatrix[i][i];
      const fp = confusionMatrix.reduce((sum, row, idx) => sum + (idx !== i ? row[i] : 0), 0);
      const fn = confusionMatrix[i].reduce((sum, val, idx) => sum + (idx !== i ? val : 0), 0);

      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;

      return { class: classes[i], precision, recall, f1 };
    });
    return metrics;
  };

  const metrics = calculateMetrics();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-300">
      <div className="flex items-center space-x-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-blue-700" />
        <h3 className="text-lg font-bold text-gray-900">予測の正確さを見てみよう</h3>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        モデルが「正しく予測できた数」を表にしたものです。左上から右下への斜め線の数字が大きいほど、よく当たっています。
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* ヘッダー行 */}
          <div className="flex items-end mb-2">
            <div className="w-20" />
            <div className="flex-1 text-center">
              <div className="text-sm font-bold text-blue-900 mb-1">予測値</div>
              <div className="flex justify-center space-x-1">
                {classes.map((cls, i) => (
                  <div key={i} className="w-20 text-xs font-medium text-blue-800 px-1">
                    {cls}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 混合行列本体 */}
          <div className="flex">
            {/* 実際の値ラベル（縦） */}
            <div className="flex flex-col justify-center mr-2">
              <div className="text-sm font-bold text-blue-900 mb-1 -rotate-90 origin-center whitespace-nowrap" style={{ width: '80px', transform: 'rotate(-90deg) translateX(-20px)' }}>
                実際の値
              </div>
            </div>

            {/* 混合行列のセル */}
            <div className="flex flex-col space-y-1">
              {confusionMatrix.map((row, i) => (
                <div key={i} className="flex items-center space-x-1">
                  <div className="w-16 text-xs font-medium text-blue-800 text-right pr-2">
                    {classes[i]}
                  </div>
                  <div className="flex space-x-1">
                    {row.map((value, j) => (
                      <div
                        key={j}
                        className={`w-20 h-12 flex items-center justify-center rounded font-bold transition-all hover:scale-110 ${getColor(value)}`}
                      >
                        <div className="text-center">
                          <div className="text-lg">{value}</div>
                          <div className="text-xs opacity-75">
                            {((value / total) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-bold text-blue-900">クラス別の性能指標</h4>
        {metrics.map((metric, i) => (
          <div key={i} className="bg-blue-50 p-3 rounded border border-blue-300">
            <div className="text-sm font-bold text-blue-900 mb-2">{metric.class}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-blue-700">適合率</div>
                <div className="font-bold text-blue-900">{(metric.precision * 100).toFixed(1)}%</div>
                <div className="h-2 bg-blue-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${metric.precision * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-blue-700">再現率</div>
                <div className="font-bold text-blue-900">{(metric.recall * 100).toFixed(1)}%</div>
                <div className="h-2 bg-blue-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${metric.recall * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-blue-700">F1スコア</div>
                <div className="font-bold text-blue-900">{(metric.f1 * 100).toFixed(1)}%</div>
                <div className="h-2 bg-blue-200 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${metric.f1 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-amber-50 p-3 rounded border border-amber-400">
        <p className="text-sm text-amber-900">
          <span className="font-bold">ヒント：</span>
          適合率は「予測が正しい確率」、再現率は「見逃しの少なさ」を表します。
          両方のバランスを取ることが重要です。
        </p>
      </div>
    </div>
  );
}
