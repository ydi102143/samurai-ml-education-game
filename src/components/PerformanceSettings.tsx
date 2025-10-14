import React, { useState, useEffect } from 'react';
import { Settings, Zap, Cpu, HardDrive, Gauge, CheckCircle, AlertTriangle } from 'lucide-react';
// import { performanceOptimizer } from '../utils/performanceOptimizer'; // 無効化

interface PerformanceSettingsProps {
  onClose: () => void;
}

export function PerformanceSettings({ onClose }: PerformanceSettingsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = () => {
    // const performanceStats = performanceOptimizer.getPerformanceStats();
    setStats({
      memoryUsage: 'N/A',
      gpuAvailable: false,
      backend: 'stable'
    });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // パフォーマンス最適化を実行（無効化）
      console.log('パフォーマンス最適化は無効化されています');
      loadPerformanceStats();
    } catch (error) {
      console.error('最適化エラー:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? '利用可能' : '利用不可';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>パフォーマンス情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            パフォーマンス設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* デバイス情報 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            デバイス情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">WebGL</span>
                {getStatusIcon(stats.webglSupported)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.webglSupported)}`}>
                {getStatusText(stats.webglSupported)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">GPU</span>
                {getStatusIcon(stats.gpuAvailable)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.gpuAvailable)}`}>
                {getStatusText(stats.gpuAvailable)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU コア数</span>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.hardwareConcurrency || '不明'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">メモリ</span>
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.memory || '不明'}
              </p>
            </div>
          </div>
        </div>

        {/* 最適化設定 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            最適化設定
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">自動最適化</h4>
              <p className="text-sm text-blue-700 mb-3">
                デバイスの性能に応じて学習パラメータを自動調整します
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• バッチサイズ最適化</div>
                <div>• エポック数調整</div>
                <div>• 学習率調整</div>
                <div>• メモリ管理</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">GPU最適化</h4>
              <p className="text-sm text-green-700 mb-3">
                GPUが利用可能な場合、大幅な高速化が期待できます
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• WebGL アクセラレーション</div>
                <div>• 並列処理</div>
                <div>• 大きなバッチサイズ</div>
                <div>• 高速メモリ</div>
              </div>
            </div>
          </div>
        </div>

        {/* 推奨事項 */}
        {stats.recommendations && stats.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              推奨事項
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {stats.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                最適化中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                最適化実行
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { performanceOptimizer } from '../utils/performanceOptimizer'; // 無効化

interface PerformanceSettingsProps {
  onClose: () => void;
}

export function PerformanceSettings({ onClose }: PerformanceSettingsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = () => {
    // const performanceStats = performanceOptimizer.getPerformanceStats();
    setStats({
      memoryUsage: 'N/A',
      gpuAvailable: false,
      backend: 'stable'
    });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // パフォーマンス最適化を実行（無効化）
      console.log('パフォーマンス最適化は無効化されています');
      loadPerformanceStats();
    } catch (error) {
      console.error('最適化エラー:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? '利用可能' : '利用不可';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>パフォーマンス情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            パフォーマンス設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* デバイス情報 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            デバイス情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">WebGL</span>
                {getStatusIcon(stats.webglSupported)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.webglSupported)}`}>
                {getStatusText(stats.webglSupported)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">GPU</span>
                {getStatusIcon(stats.gpuAvailable)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.gpuAvailable)}`}>
                {getStatusText(stats.gpuAvailable)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU コア数</span>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.hardwareConcurrency || '不明'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">メモリ</span>
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.memory || '不明'}
              </p>
            </div>
          </div>
        </div>

        {/* 最適化設定 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            最適化設定
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">自動最適化</h4>
              <p className="text-sm text-blue-700 mb-3">
                デバイスの性能に応じて学習パラメータを自動調整します
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• バッチサイズ最適化</div>
                <div>• エポック数調整</div>
                <div>• 学習率調整</div>
                <div>• メモリ管理</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">GPU最適化</h4>
              <p className="text-sm text-green-700 mb-3">
                GPUが利用可能な場合、大幅な高速化が期待できます
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• WebGL アクセラレーション</div>
                <div>• 並列処理</div>
                <div>• 大きなバッチサイズ</div>
                <div>• 高速メモリ</div>
              </div>
            </div>
          </div>
        </div>

        {/* 推奨事項 */}
        {stats.recommendations && stats.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              推奨事項
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {stats.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                最適化中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                最適化実行
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
// import { performanceOptimizer } from '../utils/performanceOptimizer'; // 無効化

interface PerformanceSettingsProps {
  onClose: () => void;
}

export function PerformanceSettings({ onClose }: PerformanceSettingsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = () => {
    // const performanceStats = performanceOptimizer.getPerformanceStats();
    setStats({
      memoryUsage: 'N/A',
      gpuAvailable: false,
      backend: 'stable'
    });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // パフォーマンス最適化を実行（無効化）
      console.log('パフォーマンス最適化は無効化されています');
      loadPerformanceStats();
    } catch (error) {
      console.error('最適化エラー:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? '利用可能' : '利用不可';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>パフォーマンス情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            パフォーマンス設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* デバイス情報 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            デバイス情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">WebGL</span>
                {getStatusIcon(stats.webglSupported)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.webglSupported)}`}>
                {getStatusText(stats.webglSupported)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">GPU</span>
                {getStatusIcon(stats.gpuAvailable)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.gpuAvailable)}`}>
                {getStatusText(stats.gpuAvailable)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU コア数</span>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.hardwareConcurrency || '不明'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">メモリ</span>
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.memory || '不明'}
              </p>
            </div>
          </div>
        </div>

        {/* 最適化設定 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            最適化設定
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">自動最適化</h4>
              <p className="text-sm text-blue-700 mb-3">
                デバイスの性能に応じて学習パラメータを自動調整します
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• バッチサイズ最適化</div>
                <div>• エポック数調整</div>
                <div>• 学習率調整</div>
                <div>• メモリ管理</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">GPU最適化</h4>
              <p className="text-sm text-green-700 mb-3">
                GPUが利用可能な場合、大幅な高速化が期待できます
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• WebGL アクセラレーション</div>
                <div>• 並列処理</div>
                <div>• 大きなバッチサイズ</div>
                <div>• 高速メモリ</div>
              </div>
            </div>
          </div>
        </div>

        {/* 推奨事項 */}
        {stats.recommendations && stats.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              推奨事項
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {stats.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                最適化中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                最適化実行
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { performanceOptimizer } from '../utils/performanceOptimizer'; // 無効化

interface PerformanceSettingsProps {
  onClose: () => void;
}

export function PerformanceSettings({ onClose }: PerformanceSettingsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = () => {
    // const performanceStats = performanceOptimizer.getPerformanceStats();
    setStats({
      memoryUsage: 'N/A',
      gpuAvailable: false,
      backend: 'stable'
    });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // パフォーマンス最適化を実行（無効化）
      console.log('パフォーマンス最適化は無効化されています');
      loadPerformanceStats();
    } catch (error) {
      console.error('最適化エラー:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (status: boolean) => {
    return status ? '利用可能' : '利用不可';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>パフォーマンス情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            パフォーマンス設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* デバイス情報 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            デバイス情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">WebGL</span>
                {getStatusIcon(stats.webglSupported)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.webglSupported)}`}>
                {getStatusText(stats.webglSupported)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">GPU</span>
                {getStatusIcon(stats.gpuAvailable)}
              </div>
              <p className={`text-sm ${getStatusColor(stats.gpuAvailable)}`}>
                {getStatusText(stats.gpuAvailable)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">CPU コア数</span>
                <Cpu className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.hardwareConcurrency || '不明'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">メモリ</span>
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">
                {stats.device?.memory || '不明'}
              </p>
            </div>
          </div>
        </div>

        {/* 最適化設定 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            最適化設定
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">自動最適化</h4>
              <p className="text-sm text-blue-700 mb-3">
                デバイスの性能に応じて学習パラメータを自動調整します
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• バッチサイズ最適化</div>
                <div>• エポック数調整</div>
                <div>• 学習率調整</div>
                <div>• メモリ管理</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">GPU最適化</h4>
              <p className="text-sm text-green-700 mb-3">
                GPUが利用可能な場合、大幅な高速化が期待できます
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• WebGL アクセラレーション</div>
                <div>• 並列処理</div>
                <div>• 大きなバッチサイズ</div>
                <div>• 高速メモリ</div>
              </div>
            </div>
          </div>
        </div>

        {/* 推奨事項 */}
        {stats.recommendations && stats.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              推奨事項
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {stats.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                最適化中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                最適化実行
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}