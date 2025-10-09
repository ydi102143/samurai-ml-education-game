import { Activity } from 'lucide-react';
import type { TrainingProgress as Progress } from '../types/ml';

interface Props {
  progress: Progress;
}

export function TrainingProgress({ progress }: Props) {
  // progressがnullの場合はデフォルト値を設定
  if (!progress) {
    return (
      <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-green-600 animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-green-900" />
          <h3 className="text-lg font-bold text-green-900">訓練中...</h3>
        </div>
        <div className="text-center text-green-700">
          学習を開始しています...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-lg p-6 shadow-lg border-2 border-green-600 animate-pulse">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-green-900" />
        <h3 className="text-lg font-bold text-green-900">訓練中...</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-green-900">進捗</span>
            <span className="text-lg font-bold text-green-800">
              {progress.epoch || 0} / {progress.total || 100}
              {progress.progress && ` (${progress.progress}%)`}
            </span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300"
              style={{ width: `${progress.progress || Math.min((progress.epoch || 0) / (progress.total || 100) * 100, 100)}%` }}
            />
          </div>
          {progress.message && (
            <div className="mt-2 text-sm text-green-700 text-center">
              {progress.message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 p-3 rounded-lg border border-green-300">
            <div className="text-xs font-medium text-green-900 mb-1">損失</div>
            <div className="text-xl font-bold text-green-800">
              {progress.loss?.toFixed(4) || '0.0000'}
            </div>
          </div>
          {(progress.accuracy || 0) > 0 && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-300">
              <div className="text-xs font-medium text-green-900 mb-1">精度</div>
              <div className="text-xl font-bold text-green-800">
                {((progress.accuracy || 0) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {(progress.elapsed || progress.eta) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
              <div className="text-xs font-medium text-blue-900 mb-1">経過時間</div>
              <div className="text-lg font-bold text-blue-800">
                {progress.elapsed ? `${(progress.elapsed / 1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
              <div className="text-xs font-medium text-blue-900 mb-1">残り時間</div>
              <div className="text-lg font-bold text-blue-800">
                {progress.eta ? `${(progress.eta / 1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
