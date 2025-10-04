import React, { useMemo, useState } from 'react';
import { Settings, SlidersHorizontal, Check } from 'lucide-react';
import type { Dataset, DataPoint } from '../types/ml';

interface Props {
  dataset: Dataset;
  onPreprocessedDataset: (processed: Dataset) => void;
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

// 標準化は仕様変更により廃止

export function PreprocessingTab({ dataset, onPreprocessedDataset }: Props) {
  const [method, setMethod] = useState<'none' | 'normalize' | 'encode'>('none');
  const [encodeTargets, setEncodeTargets] = useState<number[]>([]);

  function encodeSelected(ds: Dataset, featureIndexes: number[]): Dataset {
    const mapCache: Record<number, Map<string, number>> = {};
    ds.train.forEach(p => {
      p.features.forEach((v, i) => {
        if (!featureIndexes.includes(i)) return;
        const key = String(v);
        if (!mapCache[i]) mapCache[i] = new Map();
        if (!mapCache[i].has(key)) mapCache[i].set(key, mapCache[i].size);
      });
    });
    const transformPoint = (p: DataPoint): DataPoint => ({
      features: p.features.map((v, i) => featureIndexes.includes(i) ? (mapCache[i].get(String(v)) ?? 0) : v),
      label: p.label,
    });
    return {
      ...ds,
      train: ds.train.map(transformPoint),
      test: ds.test.map(transformPoint),
    };
  }

  const preview = useMemo(() => {
    if (method === 'encode') return encodeSelected(dataset, encodeTargets);
    if (method === 'normalize') return normalizeDataset(dataset);
    return dataset;
  }, [method, dataset, encodeTargets]);

  // プレビュー用のデータを取得
  const previewData = useMemo(() => {
    console.log('previewData calculation:', { method, hasDataset: !!dataset, hasRaw: !!dataset?.raw });
    
    if (method === 'none') {
      // 前処理なしの場合は生データを表示
      const rawData = dataset.raw || dataset;
      console.log('Using raw data:', { hasRaw: !!rawData, trainLength: rawData?.train?.length });
      return rawData;
    }
    // 前処理ありの場合は処理済みデータを表示
    console.log('Using processed data:', { hasPreview: !!preview, trainLength: preview?.train?.length });
    return preview;
  }, [method, dataset, preview]);

  // プレビューデータが存在しない場合のフォールバック
  const safePreviewData = previewData || dataset;

  // デバッグ用ログ
  console.log('PreprocessingTab Debug:', {
    method,
    hasDataset: !!dataset,
    hasRaw: !!dataset.raw,
    hasPreview: !!preview,
    previewDataKeys: previewData ? Object.keys(previewData) : 'no previewData',
    safePreviewDataKeys: safePreviewData ? Object.keys(safePreviewData) : 'no safePreviewData',
    safePreviewDataTrain: safePreviewData?.train?.length || 0,
    datasetTrain: dataset?.train?.length || 0
  });


  return (
    <div className="rounded-xl shadow-lg border-2 overflow-hidden" style={{ background: 'var(--ink-white)', borderColor: 'var(--gold)' }}>
      <div className="p-4 rounded-t-xl" style={{ background: 'linear-gradient(to right, var(--accent-strong), var(--accent))' }}>
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <h3 className="text-lg font-bold text-white">データの前処理</h3>
        </div>
        <p className="text-sm text-white/85">生データを機械学習に適した形に整えよう（EDAで生データも確認できます）</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setMethod('none')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='none'?'border-yellow-500 bg-yellow-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">前処理なし</div>
                <div className="text-xs text-gray-600">元のスケールのまま使う</div>
              </div>
            </div>
            {method==='none' && <Check className="w-5 h-5 text-yellow-600" />}
          </button>
          
          <button
            onClick={() => setMethod('encode')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='encode'?'border-yellow-500 bg-yellow-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">カテゴリ数値化</div>
                <div className="text-xs text-gray-600">カテゴリを整数IDに符号化（ラベルエンコード）</div>
              </div>
            </div>
            {method==='encode' && <Check className="w-5 h-5 text-yellow-600" />}
          </button>
          <button
            onClick={() => setMethod('normalize')}
            className={`flex items-center justify-between p-4 rounded-lg border-2 ${method==='normalize'?'border-yellow-500 bg-yellow-50':'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-800" />
              <div>
                <div className="font-bold text-gray-900">正規化（0-1）</div>
                <div className="text-xs text-gray-600">各特徴量を0〜1に揃える</div>
              </div>
            </div>
            {method==='normalize' && <Check className="w-5 h-5 text-yellow-600" />}
          </button>
        </div>

        {method==='encode' && (
          <div className="text-sm text-gray-700">
            <div className="font-semibold mb-2">数値化する特徴量を選択（カテゴリ → 整数）</div>
            <div className="flex flex-wrap gap-2">
              {dataset.featureNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() => setEncodeTargets(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i])}
                  className={`px-3 py-1 rounded border ${encodeTargets.includes(i)?'bg-emerald-100 border-emerald-400 text-emerald-800':'bg-white border-gray-300 text-gray-700'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm">
          <div className="font-semibold mb-2 text-gray-900">プレビュー（先頭5件）</div>
          {safePreviewData && safePreviewData.train && safePreviewData.train.length > 0 ? (
            <div className="overflow-x-auto rounded bg-white border-2 border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    {safePreviewData.featureNames.map((n, i) => (
                      <th key={i} className="px-3 py-3 text-left font-semibold text-gray-900">{n}</th>
                    ))}
                    <th className="px-3 py-3 text-left font-semibold text-gray-900">ラベル</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {safePreviewData.train.slice(0, 5).map((p, r) => (
                    <tr key={r} className="border-b border-gray-100 hover:bg-gray-50">
                      {p.features.map((v, c) => (
                        <td key={c} className="px-3 py-3 text-gray-800">{typeof v === 'number' ? v.toFixed(3) : v}</td>
                      ))}
                      <td className="px-3 py-3 font-medium text-gray-900">{typeof p.label === 'number' ? p.label.toFixed(3) : p.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded border-2 border-gray-200 text-center text-gray-600">
              <div className="mb-2">データを読み込み中...</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>デバッグ情報:</div>
                <div>dataset存在: {dataset ? 'Yes' : 'No'}</div>
                <div>raw存在: {dataset?.raw ? 'Yes' : 'No'}</div>
                <div>preview存在: {preview ? 'Yes' : 'No'}</div>
                <div>safePreviewData存在: {safePreviewData ? 'Yes' : 'No'}</div>
                <div>train配列長: {safePreviewData?.train?.length || 0}</div>
                <div>method: {method}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onPreprocessedDataset(preview)}
            className="text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
            style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
          >
            前処理を適用して次へ
          </button>
        </div>
      </div>
    </div>
  );
}


