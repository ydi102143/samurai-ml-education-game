import React, { useMemo, useState } from 'react';
import { Settings, SlidersHorizontal, Check } from 'lucide-react';
import type { Dataset, DataPoint } from '../types/ml';

interface Props {
  dataset: Dataset;
  onApply: (processed: Dataset) => void;
}

function normalizeDataset(ds: Dataset): Dataset {
  const numFeatures = ds.featureNames.length;
  const mins = Array(numFeatures).fill(Infinity);
  const maxs = Array(numFeatures).fill(-Infinity);
  const source = ds.raw?.train?.length ? ds.raw : { train: ds.train, test: ds.test };

  source!.train.forEach(p => {
    for (let i = 0; i < numFeatures; i++) {
      const v = p.features[i] as number;
      mins[i] = Math.min(mins[i], v);
      maxs[i] = Math.max(maxs[i], v);
    }
  });

  const transform = (p: DataPoint): DataPoint => ({
    features: p.features.map((v, i) => {
      const range = maxs[i] - mins[i];
      if (!isFinite(range) || range === 0) return 0;
      return (v as number - mins[i]) / range;
    }),
    label: p.label,
  });

  return {
    train: source!.train.map(transform),
    test: source!.test.map(transform),
    featureNames: ds.featureNames,
    labelName: ds.labelName,
    classes: ds.classes,
    raw: ds.raw,
  };
}

function standardizeDataset(ds: Dataset): Dataset {
  const numFeatures = ds.featureNames.length;
  const means = Array(numFeatures).fill(0);
  const stds = Array(numFeatures).fill(0);
  const source = ds.raw?.train?.length ? ds.raw : { train: ds.train, test: ds.test };

  // mean
  source!.train.forEach(p => {
    for (let i = 0; i < numFeatures; i++) {
      means[i] += (p.features[i] as number);
    }
  });
  for (let i = 0; i < numFeatures; i++) {
    means[i] /= source!.train.length || 1;
  }
  // std
  source!.train.forEach(p => {
    for (let i = 0; i < numFeatures; i++) {
      const diff = (p.features[i] as number) - means[i];
      stds[i] += diff * diff;
    }
  });
  for (let i = 0; i < numFeatures; i++) {
    stds[i] = Math.sqrt(stds[i] / (source!.train.length || 1)) || 1;
  }

  const transform = (p: DataPoint): DataPoint => ({
    features: p.features.map((v, i) => (((v as number) - means[i]) / stds[i])),
    label: p.label,
  });

  return {
    train: source!.train.map(transform),
    test: source!.test.map(transform),
    featureNames: ds.featureNames,
    labelName: ds.labelName,
    classes: ds.classes,
    raw: ds.raw,
  };
}

export function PreprocessingTab({ dataset, onApply }: Props) {
  const [method, setMethod] = useState<'none' | 'normalize' | 'standardize'>('none');

  const preview = useMemo(() => {
    if (method === 'normalize') return normalizeDataset(dataset);
    if (method === 'standardize') return standardizeDataset(dataset);
    return dataset;
  }, [method, dataset]);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-t-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5 text-white" />
          <h3 className="text-lg font-bold text-white">データの前処理</h3>
        </div>
        <p className="text-orange-100 text-sm">生データを機械学習に適した形に整えよう（EDAで生データも確認できます）</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setMethod('none')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='none'?'border-emerald-500 bg-emerald-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">前処理なし</div>
                <div className="text-xs text-gray-600">元のスケールのまま使う</div>
              </div>
            </div>
            {method==='none' && <Check className="w-5 h-5 text-emerald-600" />}
          </button>
          <button
            onClick={() => setMethod('normalize')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='normalize'?'border-emerald-500 bg-emerald-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">正規化（0-1）</div>
                <div className="text-xs text-gray-600">各特徴量を0〜1に揃える</div>
              </div>
            </div>
            {method==='normalize' && <Check className="w-5 h-5 text-emerald-600" />}
          </button>
          <button
            onClick={() => setMethod('standardize')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='standardize'?'border-emerald-500 bg-emerald-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">標準化（Zスコア）</div>
                <div className="text-xs text-gray-600">平均0・標準偏差1に揃える</div>
              </div>
            </div>
            {method==='standardize' && <Check className="w-5 h-5 text-emerald-600" />}
          </button>
        </div>

        <div className="text-sm text-gray-700">
          <div className="font-semibold mb-2">プレビュー（先頭5件）</div>
          <div className="overflow-x-auto bg-orange-50 border border-orange-200 rounded">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-orange-200">
                  {preview.featureNames.map((n, i) => (
                    <th key={i} className="px-2 py-2 text-left text-orange-900">{n}</th>
                  ))}
                  <th className="px-2 py-2 text-left text-orange-900">ラベル</th>
                </tr>
              </thead>
              <tbody>
                {preview.train.slice(0, 5).map((p, r) => (
                  <tr key={r} className="border-b border-orange-100">
                    {p.features.map((v, c) => (
                      <td key={c} className="px-2 py-2 text-orange-800">{typeof v === 'number' ? v.toFixed(3) : v}</td>
                    ))}
                    <td className="px-2 py-2 text-orange-800 font-medium">{typeof p.label === 'number' ? p.label.toFixed(3) : p.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onApply(preview)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
          >
            前処理を適用して次へ
          </button>
        </div>
      </div>
    </div>
  );
}


