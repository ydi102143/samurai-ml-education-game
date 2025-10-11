// 動的システムを統合したEnhancedOnlineBattleコンポーネント

import { useState, useEffect } from 'react';
import { Sword, Trophy } from 'lucide-react';
import { getRandomAdvancedProblemDataset, type AdvancedProblemDataset } from '../data/advancedProblemDatasets';
import { type LeaderboardEntry } from '../utils/realtimeProblemSystem';
import { EDAPanel } from './EDAPanel';
import { PreprocessingPanel } from './PreprocessingPanel';
import { FeatureEngineeringPanel } from './FeatureEngineeringPanel';
import { dataProcessingSystem } from '../utils/dataProcessingSystem';
import { datasetManager } from '../utils/datasetManager';
import { dynamicMLSystem } from '../utils/dynamicMLSystem';
import { realMLSystem } from '../utils/realMLSystem';
import { realDataProcessor } from '../utils/realDataProcessing';
import { realDatasetGenerator } from '../utils/realDatasetGenerator';

interface DynamicEnhancedOnlineBattleProps {
  onBack: () => void;
}

type Step = 'data' | 'eda' | 'data_split' | 'preprocessing' | 'feature_engineering' | 'feature_selection' | 'model_selection' | 'training' | 'validation' | 'submission' | 'leaderboard';

export function DynamicEnhancedOnlineBattle({ onBack }: DynamicEnhancedOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<AdvancedProblemDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ステップ管理
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // モデル選択関連
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [modelSelectionKey, setModelSelectionKey] = useState(0);
  
  // 学習進捗
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  
  // 検証結果
  const [validationResult, setValidationResult] = useState<any>(null);

  // 問題の読み込み
  const loadProblem = async () => {
    try {
      setLoading(true);
      
      // 実際のデータセットを生成
      const realDatasets = realDatasetGenerator.getAllDatasets();
      const randomDataset = realDatasets[Math.floor(Math.random() * realDatasets.length)];
      
      // AdvancedProblemDataset形式に変換
      const problem: AdvancedProblemDataset = {
        id: randomDataset.id,
        name: randomDataset.name,
        description: randomDataset.description,
        data: randomDataset.data,
        featureNames: randomDataset.featureNames,
        featureTypes: randomDataset.featureTypes,
        targetColumn: randomDataset.targetName,
        problemType: randomDataset.type,
        difficulty: randomDataset.difficulty,
        sampleCount: randomDataset.sampleCount,
        featureCount: randomDataset.featureCount,
        missingValueRate: randomDataset.missingValueRate
      };
      
      setCurrentProblem(problem);
      
      // デバッグ用ログ
      console.log('Loaded problem:', problem);
      console.log('Feature names:', problem.featureNames);
      console.log('Feature count:', problem.featureCount);
      
      // データセット管理システムに初期化（同期的に実行）
      const versionId = datasetManager.initializeFromProblem({
        name: problem.name,
        description: problem.description,
        data: problem.data,
        featureNames: problem.featureNames,
        featureTypes: problem.featureTypes,
        targetColumn: problem.targetColumn,
        problemType: problem.problemType
      });
      
      // 実際の機械学習システムにデータを設定
      realMLSystem.setTrainingData({
        features: problem.data.map(item => item.features),
        labels: problem.data.map(item => item.label),
        featureNames: problem.featureNames
      });
      
      // 初期化完了を確認
      const currentDataset = datasetManager.getCurrentDataset();
      if (currentDataset) {
        console.log('Real dataset initialized successfully:', currentDataset.name);
      } else {
        console.error('Failed to initialize dataset');
      }
      
      setError(null);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblem();
  }, []);


  // リアルタイム更新用のuseEffect
  useEffect(() => {
    const interval = setInterval(() => {
      // 学習進捗を更新
      if (currentStep === 'training') {
        const progress = realMLSystem.getTrainingProgress();
        if (progress) {
          setTrainingProgress(progress);
          console.log('Training progress updated:', progress);
          
          if (progress.status === 'completed' || progress.status === 'failed') {
            console.log('Training finished, updating UI');
          }
        }
      }
      
      // 検証結果を更新
      if (currentStep === 'validation') {
        const result = realMLSystem.getValidationResult();
        if (result) {
          setValidationResult(result);
          console.log('Validation result updated:', result);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep]);

  
  // データ分割の状態
  const [trainRatio, setTrainRatio] = useState(70);
  const [validationRatio, setValidationRatio] = useState(30);
  
  const forceModelSelectionUpdate = () => {
    console.log('Force model selection update');
    setModelSelectionKey(prev => {
      const newKey = prev + 1;
      console.log('Model selection key updated:', newKey);
      return newKey;
    });
  };

  const handleModelSelect = (modelId: string) => {
    console.log('handleModelSelect called with:', modelId);
    
    // まずローカル状態を更新
    setSelectedModelId(modelId);
    
    // 実際の機械学習システムでモデルを選択
    const success = realMLSystem.selectModel(modelId);
    console.log('Real model selection success:', success);
    
    if (success) {
      forceModelSelectionUpdate();
      console.log('UI state updated, selectedModelId:', modelId);
    } else {
      console.error('Failed to select model:', modelId);
      // 失敗した場合は選択を解除
      setSelectedModelId(null);
    }
  };

  // データセット変更のリスナー
  useEffect(() => {
    const handleDatasetChange = (dataset: any) => {
      // データセットが変更された時の処理
      console.log('Dataset changed:', dataset);
    };

    datasetManager.addListener(handleDatasetChange);

    return () => {
      datasetManager.removeListener(handleDatasetChange);
    };
  }, []);

  // モデル選択状態のデバッグ
  useEffect(() => {
    console.log('Selected model ID:', selectedModelId);
    console.log('RealML selected model:', realMLSystem.getSelectedModel()?.name);
  }, [selectedModelId]);

  // realMLSystemの状態変更を監視
  useEffect(() => {
    const interval = setInterval(() => {
      const realSelectedModel = realMLSystem.getSelectedModel();
      if (realSelectedModel && realSelectedModel.id !== selectedModelId) {
        console.log('Syncing model selection:', realSelectedModel.id);
        setSelectedModelId(realSelectedModel.id);
        forceModelSelectionUpdate();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [selectedModelId]);

  // モデル選択の状態を強制的に同期
  useEffect(() => {
    if (selectedModelId) {
      const realSelectedModel = realMLSystem.getSelectedModel();
      if (!realSelectedModel || realSelectedModel.id !== selectedModelId) {
        console.log('Forcing model selection sync:', selectedModelId);
        realMLSystem.selectModel(selectedModelId);
      }
    }
  }, [selectedModelId]);


  // リーダーボードの読み込み
  const loadLeaderboard = () => {
    // 模擬リーダーボードデータ
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        userName: 'プレイヤー1',
        modelType: 'Random Forest',
        publicScore: 0.8567,
        timestamp: Date.now() - 3600000,
        overallScore: 0.8567
      },
      {
        id: '2',
        userName: 'プレイヤー2',
        modelType: 'Neural Network',
        publicScore: 0.8234,
        timestamp: Date.now() - 7200000,
        overallScore: 0.8234
      }
    ];
    setLeaderboard(mockLeaderboard);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">問題を読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-bold mb-4">エラー</div>
          <div className="text-white">{error}</div>
          <button
            onClick={loadProblem}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-bold mb-4">問題が見つかりません</div>
          <p className="text-xl font-bold">問題を読み込めませんでした。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* 左側ヘッダー */}
      <div className="w-80 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col">
        {/* ロゴ・タイトル */}
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            🚀 動的MLコンテスト
          </h1>
          <p className="text-white/70 text-sm">リアルタイム機械学習システム</p>
        </div>

        {/* ナビゲーション */}
        <div className="flex-1 p-4">
          <h2 className="text-lg font-bold text-white mb-4">ワークフロー</h2>
          <div className="space-y-2">
            {[
              { id: 'data', name: 'データ', icon: '📊' },
              { id: 'eda', name: 'EDA', icon: '🔍' },
              { id: 'data_split', name: 'データ分割', icon: '📊' },
              { id: 'preprocessing', name: '前処理', icon: '⚙️' },
              { id: 'feature_engineering', name: '特徴量エンジニアリング', icon: '🔧' },
              { id: 'feature_selection', name: '特徴量選択', icon: '🔍' },
              { id: 'model_selection', name: 'モデル選択', icon: '🎯' },
              { id: 'training', name: '学習', icon: '🧠' },
              { id: 'validation', name: '検証', icon: '✅' },
              { id: 'submission', name: '提出', icon: '📤' },
              { id: 'leaderboard', name: 'リーダーボード', icon: '🏆' }
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{step.icon}</span>
                <span className="font-bold">{step.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 下部ボタン */}
        <div className="p-4 border-t border-white/20 space-y-3">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold">リーダーボード</span>
          </button>
          <button
            onClick={onBack}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300"
          >
            <Sword className="w-5 h-5" />
            <span className="font-bold">ホームに戻る</span>
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* 現在のステップ表示 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                {['📊 データ確認', '🔍 データ探索', '📊 データ分割', '⚙️ 前処理', '🔧 特徴量エンジニアリング', '🔍 特徴量選択', '🎯 モデル選択', '🧠 学習', '✅ 検証', '📤 提出', '🏆 リーダーボード'][['data', 'eda', 'data_split', 'preprocessing', 'feature_engineering', 'feature_selection', 'model_selection', 'training', 'validation', 'submission', 'leaderboard'].indexOf(currentStep)]}
              </h2>
              <p className="text-white/80 text-lg">
                {currentStep === 'data' && '問題の詳細を確認してください'}
                {currentStep === 'eda' && 'データを探索して理解を深めましょう'}
                {currentStep === 'data_split' && 'データを訓練・検証に分割します'}
                {currentStep === 'preprocessing' && 'データをクリーニングして準備します'}
                {currentStep === 'feature_engineering' && '新しい特徴量を作成・変換します'}
                {currentStep === 'feature_selection' && '重要な特徴量を選択します'}
                {currentStep === 'model_selection' && 'モデルとハイパーパラメータを選択します'}
                {currentStep === 'training' && 'モデルを学習させます'}
                {currentStep === 'validation' && 'モデルの汎化性能を確認します'}
                {currentStep === 'submission' && '結果を提出します'}
                {currentStep === 'leaderboard' && '結果を確認します'}
              </p>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="mx-6 mb-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
            <p className="text-blue-200">処理中...</p>
          </div>
        )}

        {/* リーダーボード表示 */}
        {showLeaderboard && (
          <div className="mx-6 mb-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  リーダーボード
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/80 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">まだ提出がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30'
                          : index < 3
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-400 text-black'
                            : index < 3
                            ? 'bg-gray-400 text-white'
                            : 'bg-white/20 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{entry.userName || 'プレイヤー'}</div>
                          <div className="text-white/60 text-sm">
                            {entry.modelType} • {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">
                          {entry.overallScore?.toFixed(4) || 'N/A'}
                        </div>
                        <div className="text-white/60 text-sm">精度</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="flex-1 mx-6">
          {currentStep === 'data' && (
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                データ確認
              </h3>
              <div className="space-y-8">
                {/* データセット選択 */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">🗂️</span>
                    データセット選択
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {datasetManager.getAvailableDatasets().map((dataset) => (
                      <div
                        key={dataset.id}
                        onClick={() => {
                          datasetManager.switchDataset(dataset.id);
                          // 状態を更新
                          setCurrentStep('data');
                        }}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          datasetManager.getCurrentDataset()?.id === dataset.id
                            ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-white font-bold text-lg">{dataset.name}</h5>
                          {datasetManager.getCurrentDataset()?.id === dataset.id && (
                            <span className="text-blue-400 text-sm font-medium flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                              選択中
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mb-4 leading-relaxed">{dataset.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-white/60 text-sm">
                            <span>サンプル数:</span>
                            <span className="font-bold text-white">{dataset.data.length}</span>
                          </div>
                          <div className="flex justify-between text-white/60 text-sm">
                            <span>特徴量数:</span>
                            <span className="font-bold text-white">{dataset.featureNames.length}</span>
                          </div>
                          <div className="flex justify-between text-white/60 text-sm">
                            <span>タイプ:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dataset.problemType === 'classification' 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {dataset.problemType === 'classification' ? '分類' : '回帰'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 問題の詳細 */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">📋</span>
                    問題の詳細
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium">問題タイプ:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          currentProblem.problemType === 'classification' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {currentProblem.problemType === 'classification' ? '分類' : '回帰'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium">データサイズ:</span>
                        <span className="text-white font-bold">{currentProblem.data.length} サンプル</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium">特徴量数:</span>
                        <span className="text-white font-bold">{currentProblem.featureNames.length} 個</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium">数値特徴量:</span>
                        <span className="text-white font-bold">{currentProblem.featureTypes.filter(t => t === 'numerical').length} 個</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium">カテゴリ特徴量:</span>
                        <span className="text-white font-bold">{currentProblem.featureTypes.filter(t => t === 'categorical').length} 個</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <span className="text-white/80 font-medium block mb-2">説明:</span>
                        <p className="text-white/90 text-sm leading-relaxed">{currentProblem.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* データ統計 */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    データ統計
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 text-center border border-red-500/30">
                      <div className="text-3xl font-bold text-red-300 mb-2">
                        {Object.values(dataProcessingSystem.getDataStatistics()?.missingValues || {}).reduce((a: number, b: number) => a + b, 0)}
                      </div>
                      <div className="text-white/80 text-sm font-medium">欠損値</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 text-center border border-green-500/30">
                      <div className="text-3xl font-bold text-green-300 mb-2">
                        {currentProblem.data.length - Object.values(dataProcessingSystem.getDataStatistics()?.missingValues || {}).reduce((a: number, b: number) => a + b, 0)}
                      </div>
                      <div className="text-white/80 text-sm font-medium">完全な行</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 text-center border border-yellow-500/30">
                      <div className="text-3xl font-bold text-yellow-300 mb-2">0</div>
                      <div className="text-white/80 text-sm font-medium">重複行</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 text-center border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-300 mb-2">
                        {(JSON.stringify(currentProblem.data).length / 1024 / 1024).toFixed(2)}MB
                      </div>
                      <div className="text-white/80 text-sm font-medium">メモリ使用量</div>
                    </div>
                  </div>
                </div>

                {/* データプレビュー（改善版） */}
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-2">👁️</span>
                    データプレビュー
                  </h4>
                  <div className="overflow-x-auto max-h-96 rounded-lg border border-white/10">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white/10">
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-white/70 w-12">#</th>
                          {currentProblem.featureNames.slice(0, 8).map((name, index) => (
                            <th key={index} className="text-left p-2 text-white/70 min-w-24">
                              <div className="flex flex-col">
                                <span>{name}</span>
                                <span className="text-xs text-white/50">
                                  {currentProblem.featureTypes[index] === 'numerical' ? '数値' : 'カテゴリ'}
                                </span>
                              </div>
                            </th>
                          ))}
                          {currentProblem.featureNames.length > 8 && (
                            <th className="text-left p-2 text-white/70">...</th>
                          )}
                          <th className="text-left p-2 text-white/70 min-w-24">
                            <div className="flex flex-col">
                              <span>ターゲット</span>
                              <span className="text-xs text-white/50">
                                {currentProblem.problemType === 'classification' ? '分類' : '回帰'}
                              </span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProblem.data.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-2 text-white/60 text-xs">{index + 1}</td>
                            {currentProblem.featureNames.slice(0, 8).map((name, nameIndex) => (
                              <td key={nameIndex} className="p-2 text-white/80 text-xs">
                                {(() => {
                                  const value = row.features[nameIndex];
                                  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
                                    return <span className="text-red-400">NaN</span>;
                                  } else if (typeof value === 'number') {
                                    return value.toFixed(2);
                                  } else {
                                    const str = String(value);
                                    return str.length > 10 ? str.substring(0, 10) + '...' : str;
                                  }
                                })()}
                              </td>
                            ))}
                            {currentProblem.featureNames.length > 8 && (
                              <td className="p-2 text-white/60 text-xs">...</td>
                            )}
                            <td className="p-2 text-yellow-300 text-xs font-bold">
                              {currentProblem.problemType === 'classification' ? 
                                (typeof row.label === 'string' ? row.label : `クラス${row.label}`) :
                                (typeof row.label === 'number' ? row.label.toFixed(2) : String(row.label))
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-center text-white/60 text-sm">
                    表示: 最初の10行 / 全{currentProblem.data.length}行
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'eda' && (
            <EDAPanel
              data={datasetManager.getCurrentDataset()?.data || currentProblem.data}
              problemType={currentProblem.problemType}
              featureNames={datasetManager.getCurrentDataset()?.featureNames || currentProblem.featureNames}
              featureTypes={datasetManager.getCurrentDataset()?.featureTypes || currentProblem.featureTypes}
            />
          )}

          {currentStep === 'preprocessing' && (
            <PreprocessingPanel
              data={datasetManager.getCurrentDataset()?.data || currentProblem.data}
              featureNames={datasetManager.getCurrentDataset()?.featureNames || currentProblem.featureNames}
              featureTypes={datasetManager.getCurrentDataset()?.featureTypes || currentProblem.featureTypes}
              onPreprocessedData={async (data, featureNames, featureTypes) => {
                // 動的システムに統合
                const result = await dataProcessingSystem.executePreprocessing({
                  selectedFeatures: featureNames.map((_, index) => index),
                  missingValueStrategy: 'mean',
                  scalingMethod: 'standard',
                  encodingMethod: 'label',
                  outlierRemoval: false,
                  outlierThreshold: 3
                });
                
                if (result.success) {
                  console.log('Preprocessing completed:', result.data);
                  // データセット管理システムを更新
                  datasetManager.updateCurrentDataset({
                    data: result.data || data,
                    featureNames: result.featureNames || featureNames,
                    featureTypes: result.featureTypes || featureTypes
                  });
                  // 状態を更新
                  setCurrentStep('feature_engineering');
                } else {
                  console.error('Preprocessing failed:', result.error);
                }
              }}
            />
          )}

          {currentStep === 'feature_engineering' && (
            <FeatureEngineeringPanel
              data={datasetManager.getCurrentDataset()?.data || currentProblem.data}
              featureNames={datasetManager.getCurrentDataset()?.featureNames || currentProblem.featureNames}
              featureTypes={datasetManager.getCurrentDataset()?.featureTypes || currentProblem.featureTypes}
              onEngineeredData={async (data, featureNames, featureTypes) => {
                // 動的システムに統合
                const result = await dataProcessingSystem.executeFeatureEngineering({
                  selectedFeatures: featureNames.map((_, index) => index),
                  transformations: {
                    polynomial: true,
                    interaction: true,
                    log: false,
                    sqrt: false,
                    square: false
                  },
                  aggregations: {
                    mean: true,
                    std: true,
                    max: false,
                    min: false,
                    count: false
                  },
                  dimensionalityReduction: {
                    method: 'none',
                    components: 10
                  }
                });
                
                if (result.success) {
                  console.log('Feature engineering completed:', result.data);
                  // データセット管理システムを更新
                  datasetManager.updateCurrentDataset({
                    data: result.data || data,
                    featureNames: result.featureNames || featureNames,
                    featureTypes: result.featureTypes || featureTypes
                  });
                  // 状態を更新
                  setCurrentStep('feature_selection');
                } else {
                  console.error('Feature engineering failed:', result.error);
                }
              }}
              onFeatureSelect={() => {}}
              selectedFeatures={[]}
            />
          )}

          {/* 他のステップの実装は既存のコンポーネントを参考に実装 */}
          {currentStep === 'data_split' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">📊 データ分割設定</h3>
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-6 text-center">分割比率を設定してください</h4>
                  
                  {/* 分割比率スライダー */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">訓練データ比率 (%)</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="60"
                          max="90"
                          value={trainRatio}
                          className="flex-1"
                          onChange={(e) => {
                            const newTrainRatio = parseInt(e.target.value);
                            setTrainRatio(newTrainRatio);
                            setValidationRatio(100 - newTrainRatio);
                          }}
                        />
                        <span className="text-white text-lg font-mono w-16 text-center">{trainRatio}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">検証データ比率 (%)</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={validationRatio}
                          className="flex-1"
                          onChange={(e) => {
                            const newValidationRatio = parseInt(e.target.value);
                            setValidationRatio(newValidationRatio);
                            setTrainRatio(100 - newValidationRatio);
                          }}
                        />
                        <span className="text-white text-lg font-mono w-16 text-center">{validationRatio}%</span>
                      </div>
                    </div>
                    
                    <div className="text-center text-white/60 text-sm">
                      合計: 100% (テストデータは運営側で管理)
                    </div>
                  </div>
                </div>

                {/* 実行ボタン */}
                <div className="text-center">
                  <button 
                    onClick={async () => {
                      const result = await dataProcessingSystem.executeDataSplit({
                        trainRatio: trainRatio,
                        validationRatio: validationRatio,
                        randomSeed: 42,
                        stratify: true
                      });
                      
                      if (result.success) {
                        console.log('Data split completed:', result.data);
                        setCurrentStep('preprocessing');
                      } else {
                        console.error('Data split failed:', result.error);
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    データ分割を実行
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'feature_selection' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🔍 特徴量選択</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 選択方法 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">選択方法</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="featureSelectionMethod"
                          value="manual"
                          defaultChecked
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="text-white font-medium">手動選択</div>
                          <div className="text-white/60 text-sm">特徴量を手動で選択</div>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="featureSelectionMethod"
                          value="correlation"
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="text-white font-medium">相関分析</div>
                          <div className="text-white/60 text-sm">ターゲットとの相関が高い特徴量を選択</div>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="featureSelectionMethod"
                          value="variance"
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="text-white font-medium">分散分析</div>
                          <div className="text-white/60 text-sm">分散が大きい特徴量を選択</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 特徴量一覧 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">特徴量一覧</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {currentProblem?.featureNames?.map((feature, index) => (
                        <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white/5">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                          />
                          <span className="text-white text-sm">{feature}</span>
                        </label>
                      )) || []}
                    </div>
                    <div className="mt-4 text-white/60 text-sm">
                      選択済み: {currentProblem?.featureNames?.length || 0} / {currentProblem?.featureNames?.length || 0} 特徴量
                    </div>
                  </div>
                </div>

                {/* 実行ボタン */}
                <div className="text-center">
                  <button 
                    onClick={() => setCurrentStep('model_selection')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    特徴量選択を完了
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'model_selection' && (
            <div className="bg-white/5 rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">🎯 モデル選択</h3>
                <p className="text-white/70 text-lg">問題に最適な機械学習モデルを選択してください</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* モデル一覧 */}
                <div className="lg:col-span-2">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-white font-bold text-xl mb-6 flex items-center">
                      <span className="mr-2">🤖</span>
                      利用可能なモデル
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentProblem ? realMLSystem.getAvailableModels(currentProblem.problemType).map((model) => {
                        const isSelected = selectedModelId === model.id;
                        return (
                          <div 
                            key={model.id} 
                            className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected
                                ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-2xl shadow-blue-500/30' 
                                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                            }`}
                            onClick={() => {
                              console.log('Model card clicked:', model.id, model.name);
                              handleModelSelect(model.id);
                            }}
                          >
                            {/* 選択インジケーター */}
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg">✓</span>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <h5 className="text-white font-bold text-lg">{model.name}</h5>
                                <div className="flex flex-col items-end space-y-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    model.type === 'classification' 
                                      ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                                      : 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                                  }`}>
                                    {model.type === 'classification' ? '分類' : '回帰'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    model.complexity === 'low' 
                                      ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                                      : model.complexity === 'medium' 
                                      ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50' 
                                      : 'bg-red-500/30 text-red-300 border border-red-400/50'
                                  }`}>
                                    {model.complexity === 'low' ? '低複雑度' : model.complexity === 'medium' ? '中複雑度' : '高複雑度'}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-white/80 text-sm leading-relaxed">{model.description}</p>
                              
                              {/* ハイパーパラメータ表示 */}
                              <div className="space-y-2">
                                <h6 className="text-white/70 text-xs font-bold uppercase tracking-wide">主要パラメータ</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(model.hyperparameters).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-white/60">{key}:</span>
                                      <span className="text-white/90 font-mono">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="col-span-2 text-center py-12">
                          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <div className="text-white/60">問題を読み込み中...</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ハイパーパラメータ設定 */}
                <div className="lg:col-span-1">
                  <div className="bg-white/10 rounded-xl p-6 sticky top-6">
                    <h4 className="text-white font-bold text-xl mb-6 flex items-center">
                      <span className="mr-2">⚙️</span>
                      ハイパーパラメータ
                    </h4>
                    
                    {selectedModelId ? (
                      <div className="space-y-6">
                        {/* 選択中のモデル表示 */}
                        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-4">
                          <div className="text-blue-300 text-sm font-bold mb-2">選択中のモデル</div>
                          <div className="text-white font-bold text-lg">{realMLSystem.getSelectedModel()?.name}</div>
                          <div className="text-white/70 text-sm mt-1">
                            {realMLSystem.getSelectedModel()?.type === 'classification' ? '分類' : '回帰'} • 
                            {realMLSystem.getSelectedModel()?.complexity === 'low' ? '低複雑度' : 
                             realMLSystem.getSelectedModel()?.complexity === 'medium' ? '中複雑度' : '高複雑度'}
                          </div>
                        </div>
                        
                        {/* ハイパーパラメータ調整 */}
                        <div className="space-y-4">
                          {Object.entries(realMLSystem.getSelectedModel()?.hyperparameters || {}).map(([key, value]) => (
                            <div key={key} className="space-y-3">
                              <label className="text-white/90 text-sm font-bold block capitalize">
                                {key.replace(/_/g, ' ')}
                              </label>
                              
                              {typeof value === 'number' ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/60 text-xs">
                                      {key === 'learning_rate' ? '0.0001' : key === 'epochs' ? '10' : '1'}
                                    </span>
                                    <span className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded">
                                      {value}
                                    </span>
                                    <span className="text-white/60 text-xs">
                                      {key === 'learning_rate' ? '0.1' : key === 'epochs' ? '1000' : '100'}
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min={key === 'learning_rate' ? 0.0001 : key === 'epochs' ? 10 : 1}
                                    max={key === 'learning_rate' ? 0.1 : key === 'epochs' ? 1000 : 100}
                                    step={key === 'learning_rate' ? 0.0001 : 1}
                                    value={value}
                                    onChange={(e) => {
                                      const newValue = parseFloat(e.target.value);
                                      realMLSystem.updateHyperparameters(
                                        realMLSystem.getSelectedModel()!.id,
                                        { [key]: newValue }
                                      );
                                      forceModelSelectionUpdate();
                                    }}
                                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                  />
                                </div>
                              ) : (
                                <select
                                  value={value}
                                  onChange={(e) => {
                                    realMLSystem.updateHyperparameters(
                                      realMLSystem.getSelectedModel()!.id,
                                      { [key]: e.target.value }
                                    );
                                    forceModelSelectionUpdate();
                                  }}
                                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                  {key === 'optimizer' ? (
                                    ['adam', 'sgd', 'rmsprop'].map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))
                                  ) : (
                                    <option value={value}>{value}</option>
                                  )}
                                </select>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* 学習開始ボタン */}
                        <div className="pt-4">
                          <button 
                            onClick={async () => {
                              if (selectedModelId || realMLSystem.getSelectedModel()) {
                                try {
                                  setCurrentStep('training');
                                  
                                  // 学習進捗を監視（学習開始前に設定）
                                  const progressInterval = setInterval(() => {
                                    const progress = realMLSystem.getTrainingProgress();
                                    if (progress) {
                                      setTrainingProgress(progress);
                                      console.log('Training progress:', progress);
                                      
                                      if (progress.status === 'completed' || progress.status === 'failed') {
                                        clearInterval(progressInterval);
                                        console.log('Training finished with status:', progress.status);
                                        if (progress.status === 'completed') {
                                          // 学習完了後、自動的に検証ステップに移動
                                          setCurrentStep('validation');
                                        }
                                      }
                                    }
                                  }, 100);
                                  
                                  // 実際の機械学習システムで学習を開始（非同期）
                                  realMLSystem.startTraining().catch(error => {
                                    console.error('Training failed:', error);
                                    clearInterval(progressInterval);
                                  });
                                  
                                } catch (error) {
                                  console.error('Training start failed:', error);
                                }
                              }
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-xl">🚀</span>
                              <span>学習を開始</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-white/40 text-6xl mb-4">🎯</div>
                        <div className="text-white/60 text-lg mb-2">モデルを選択してください</div>
                        <div className="text-white/40 text-sm">左側のモデルから選択すると、ここでハイパーパラメータを調整できます</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'training' && (
            <div className="bg-white/5 rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">🧠 モデル学習</h3>
                <p className="text-white/70 text-lg">選択したモデルを学習中です</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 学習進捗 */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center">
                    <span className="mr-2">📊</span>
                    学習進捗
                  </h4>
                  <div className="space-y-6">
                    {(() => {
                      const progress = trainingProgress || realMLSystem.getTrainingProgress();
                      console.log('Training progress in UI:', progress);
                      if (!progress) {
                        return (
                          <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <div className="text-white/60">学習を開始してください</div>
                          </div>
                        );
                      }

                      const epochProgress = (progress.epoch / progress.totalEpochs) * 100;
                      const remainingTime = progress.status === 'training' 
                        ? Math.max(0, (progress.totalEpochs - progress.epoch) * 0.1)
                        : 0;

                      return (
                        <>
                          {/* エポック進捗バー */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-white/80 text-sm font-bold">
                              <span>エポック進捗</span>
                              <span className="bg-white/10 px-3 py-1 rounded-full">
                                {progress.epoch}/{progress.totalEpochs}
                              </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 relative"
                                style={{width: `${epochProgress}%`}}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                            <div className="text-center text-white/60 text-sm">
                              進捗: {epochProgress.toFixed(1)}%
                            </div>
                          </div>
                          
                          {/* メトリクス表示 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-400/30 rounded-xl p-4 text-center">
                              <div className="text-red-300 text-sm font-bold mb-2">損失 (Loss)</div>
                              <div className="text-white text-2xl font-bold font-mono">
                                {progress.loss.toFixed(4)}
                              </div>
                              <div className="text-red-300/70 text-xs mt-1">
                                {progress.status === 'training' ? '減少中...' : '完了'}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 rounded-xl p-4 text-center">
                              <div className="text-green-300 text-sm font-bold mb-2">精度 (Accuracy)</div>
                              <div className="text-white text-2xl font-bold font-mono">
                                {(progress.accuracy * 100).toFixed(2)}%
                              </div>
                              <div className="text-green-300/70 text-xs mt-1">
                                {progress.status === 'training' ? '向上中...' : '完了'}
                              </div>
                            </div>
                          </div>
                          
                          {/* 残り時間 */}
                          {progress.status === 'training' && (
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <div className="text-white/70 text-sm mb-2">推定残り時間</div>
                              <div className="text-white text-lg font-bold">
                                {Math.ceil(remainingTime)} 秒
                              </div>
                            </div>
                          )}
                          
                          {/* 学習状態 */}
                          <div className="flex items-center justify-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              progress.status === 'training' ? 'bg-blue-500 animate-pulse' : 
                              progress.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-white/80 font-bold">
                              {progress.status === 'training' ? '学習中...' : 
                               progress.status === 'completed' ? '学習完了' : '学習失敗'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 学習ログ */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center">
                    <span className="mr-2">📝</span>
                    学習ログ
                  </h4>
                  <div className="bg-black/30 rounded-xl p-4 h-96 overflow-y-auto font-mono text-sm border border-white/10">
                    {(() => {
                      const progress = trainingProgress || realMLSystem.getTrainingProgress();
                      if (!progress) {
                        return (
                          <div className="text-white/60 text-center py-8">
                            <div className="text-4xl mb-2">📊</div>
                            <div>学習を開始してください</div>
                          </div>
                        );
                      }

                      const logs = [
                        <div key="start" className="text-green-400 flex items-center space-x-2">
                          <span className="text-green-500">●</span>
                          <span>[INFO] 学習開始: {progress.startTime.toLocaleTimeString()}</span>
                        </div>,
                        <div key="model" className="text-blue-400 flex items-center space-x-2">
                          <span className="text-blue-500">●</span>
                          <span>[INFO] モデル: {realMLSystem.getSelectedModel()?.name}</span>
                        </div>,
                      ];

                      if (progress.status === 'training' || progress.status === 'completed') {
                        for (let i = 1; i <= Math.min(progress.epoch, 15); i++) {
                          const epochLoss = 1.0 - (i / progress.totalEpochs) * 0.8 + (Math.random() - 0.5) * 0.1;
                          const epochAcc = (i / progress.totalEpochs) * 0.9 + (Math.random() - 0.5) * 0.05;
                          logs.push(
                            <div key={i} className="text-yellow-400 flex items-center space-x-2 py-1">
                              <span className="text-yellow-500">●</span>
                              <span>[TRAIN] Epoch {i.toString().padStart(3, '0')}/{progress.totalEpochs} - Loss: {epochLoss.toFixed(3)} - Acc: {(epochAcc * 100).toFixed(1)}%</span>
                            </div>
                          );
                        }
                      }

                      if (progress.status === 'completed') {
                        logs.push(
                          <div key="complete" className="text-green-400 flex items-center space-x-2 py-1">
                            <span className="text-green-500">●</span>
                            <span>[INFO] 学習完了: {progress.endTime?.toLocaleTimeString()}</span>
                          </div>
                        );
                      }

                      if (progress.status === 'failed') {
                        logs.push(
                          <div key="failed" className="text-red-400 flex items-center space-x-2 py-1">
                            <span className="text-red-500">●</span>
                            <span>[ERROR] 学習失敗</span>
                          </div>
                        );
                      }

                      return logs;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'validation' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">✅ モデル検証</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 検証結果 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">検証結果</h4>
                    <div className="space-y-4">
                      {(() => {
                        const result = validationResult || realMLSystem.getValidationResult();
                        if (!result) {
                          return (
                            <div className="text-center py-8 text-white/60">
                              検証を実行してください
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 rounded p-3 text-center">
                                <div className="text-white/70 text-sm">精度</div>
                                <div className="text-white text-2xl font-bold">
                                  {(result.accuracy * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div className="bg-white/5 rounded p-3 text-center">
                                <div className="text-white/70 text-sm">F1スコア</div>
                                <div className="text-white text-2xl font-bold">
                                  {result.f1Score.toFixed(3)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded p-3 text-center">
                                <div className="text-white/70 text-sm">適合率</div>
                                <div className="text-white text-2xl font-bold">
                                  {result.precision.toFixed(3)}
                                </div>
                              </div>
                              <div className="bg-white/5 rounded p-3 text-center">
                                <div className="text-white/70 text-sm">再現率</div>
                                <div className="text-white text-2xl font-bold">
                                  {result.recall.toFixed(3)}
                                </div>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">混同行列</div>
                              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                <div className="bg-green-500/20 p-2 rounded">
                                  <div className="text-white font-bold">{result.confusionMatrix[0][0]}</div>
                                  <div className="text-white/70">真陽性</div>
                                </div>
                                <div className="bg-red-500/20 p-2 rounded">
                                  <div className="text-white font-bold">{result.confusionMatrix[0][1]}</div>
                                  <div className="text-white/70">偽陽性</div>
                                </div>
                                <div className="bg-red-500/20 p-2 rounded">
                                  <div className="text-white font-bold">{result.confusionMatrix[1][0]}</div>
                                  <div className="text-white/70">偽陰性</div>
                                </div>
                                <div className="bg-green-500/20 p-2 rounded">
                                  <div className="text-white font-bold">{result.confusionMatrix[1][1]}</div>
                                  <div className="text-white/70">真陰性</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center text-white/60 text-sm">
                              実行時間: {result.executionTime}ms
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 検証設定 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">検証設定</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">検証戦略</label>
                        <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="holdout">ホールドアウト</option>
                          <option value="cv">交差検証</option>
                          <option value="stratified">層化交差検証</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">検証データ比率</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="10"
                            max="40"
                            defaultValue="30"
                            className="flex-1"
                          />
                          <span className="text-white text-sm font-mono w-12">30%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">交差検証分割数</label>
                        <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="5">5分割</option>
                          <option value="10">10分割</option>
                        </select>
                      </div>
                      <div className="text-center">
                        <button
                          onClick={async () => {
                            try {
                              await realMLSystem.executeValidation();
                              // 状態を更新
                              setCurrentStep('validation');
                            } catch (error) {
                              console.error('Validation failed:', error);
                            }
                          }}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                        >
                          検証を実行
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 検証実行ボタン */}
                <div className="text-center">
                  <button 
                    onClick={async () => {
                      try {
                        await realMLSystem.executeValidation();
                        setCurrentStep('submission');
                      } catch (error) {
                        console.error('Validation failed:', error);
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    検証を実行
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'submission' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">📤 結果提出</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 提出内容 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">提出内容</h4>
                    <div className="space-y-4">
                      {(() => {
                        const selectedModel = realMLSystem.getSelectedModel();
                        const validationResult = realMLSystem.getValidationResult();
                        const currentDataset = dataProcessingSystem.getCurrentDataset();
                        
                        if (!selectedModel || !validationResult) {
                          return (
                            <div className="text-center py-8 text-white/60">
                              モデルの学習と検証を完了してください
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">使用モデル</div>
                              <div className="text-white font-medium">{selectedModel.name}</div>
                            </div>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">検証精度</div>
                              <div className="text-white font-medium">{(validationResult.accuracy * 100).toFixed(1)}%</div>
                            </div>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">特徴量数</div>
                              <div className="text-white font-medium">{currentDataset?.featureNames.length || 0}個</div>
                            </div>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">ハイパーパラメータ</div>
                              <div className="text-white font-medium text-xs">
                                {Object.entries(selectedModel.hyperparameters)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')}
                              </div>
                            </div>
                            <div className="bg-white/5 rounded p-3">
                              <div className="text-white/70 text-sm mb-2">処理履歴</div>
                              <div className="text-white font-medium text-xs">
                                {currentDataset?.operations.map(op => op.name).join(' → ') || 'なし'}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 提出設定 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">提出設定</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">提出名</label>
                        <input
                          type="text"
                          defaultValue="My Best Model v1.0"
                          className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">コメント</label>
                        <textarea
                          rows={3}
                          placeholder="モデルの説明や工夫した点を記入してください..."
                          className="w-full p-2 bg-white/10 border border-white/20 rounded text-white resize-none"
                        />
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-400/30 rounded p-3">
                        <div className="text-yellow-300 text-sm">
                          <strong>注意:</strong> 提出後は修正できません。<br/>
                          最終確認をしてから提出してください。
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 提出履歴 */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-4">提出履歴</h4>
                  <div className="space-y-2">
                    {(() => {
                      const submissionHistory = realMLSystem.getSubmissionHistory();
                      if (submissionHistory.length === 0) {
                        return (
                          <div className="text-center py-4 text-white/60">
                            まだ提出がありません
                          </div>
                        );
                      }

                      return submissionHistory.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <div>
                            <div className="text-white font-medium">{submission.modelName}</div>
                            <div className="text-white/60 text-sm">
                              精度: {(submission.validationAccuracy * 100).toFixed(1)}% - {submission.submissionTime.toLocaleString()}
                            </div>
                          </div>
                          <span className="text-white/50 text-sm">提出済み</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 提出ボタン */}
                <div className="text-center">
                  <button 
                    onClick={async () => {
                      try {
                        // 提出名とコメントを取得（実際の実装では入力フィールドから取得）
                        const submissionName = `Model_${Date.now()}`;
                        const comment = 'Dynamic ML System submission';
                        
                        // モデルを提出
                        realMLSystem.submitModel(submissionName, comment);
                        console.log('Model submitted:', submission);
                        
                        // Public/Privateデータを生成
                        const publicPrivateResult = await dataProcessingSystem.generatePublicPrivateData(0.7);
                        
                        if (publicPrivateResult.success) {
                          console.log('Public/Private data generated:', publicPrivateResult.data);
                          setCurrentStep('leaderboard');
                        } else {
                          console.error('Public/Private data generation failed:', publicPrivateResult.error);
                        }
                      } catch (error) {
                        console.error('Submission failed:', error);
                      }
                    }}
                    disabled={!realMLSystem.getSelectedModel() || !realMLSystem.getValidationResult()}
                    className={`px-8 py-3 font-bold rounded-lg transition-colors ${
                      realMLSystem.getSelectedModel() && realMLSystem.getValidationResult()
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    結果を提出する
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'leaderboard' && (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">🏆 リーダーボード</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 順位表示 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">あなたの順位</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">3位</div>
                      <div className="text-white/70 text-sm">精度: 87.5%</div>
                      <div className="text-white/70 text-sm">提出時刻: 14:35:45</div>
                    </div>
                  </div>

                  {/* 統計情報 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">統計情報</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70 text-sm">参加者数</span>
                        <span className="text-white font-medium">127人</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70 text-sm">提出数</span>
                        <span className="text-white font-medium">89件</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70 text-sm">最高精度</span>
                        <span className="text-white font-medium">92.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70 text-sm">平均精度</span>
                        <span className="text-white font-medium">78.9%</span>
                      </div>
                    </div>
                  </div>

                  {/* 残り時間 */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-bold mb-4">残り時間</h4>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">2日 14時間</div>
                      <div className="text-white/70 text-sm">次の問題まで</div>
                      <div className="text-white/60 text-xs mt-2">
                        月曜日 09:00 に更新
                      </div>
                    </div>
                  </div>
                </div>

                {/* リーダーボード一覧 */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-4">ランキング</h4>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: "MLMaster", accuracy: 92.3, time: "13:45:22" },
                      { rank: 2, name: "DataWizard", accuracy: 89.7, time: "14:12:15" },
                      { rank: 3, name: "あなた", accuracy: 87.5, time: "14:35:45" },
                      { rank: 4, name: "AIExplorer", accuracy: 86.2, time: "14:28:33" },
                      { rank: 5, name: "ModelBuilder", accuracy: 84.8, time: "14:15:07" }
                    ].map((entry) => (
                      <div key={entry.rank} className={`flex items-center justify-between p-3 rounded ${
                        entry.rank === 3 ? 'bg-yellow-500/20 border border-yellow-400/30' : 'bg-white/5'
                      }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            entry.rank === 1 ? 'bg-yellow-500 text-black' :
                            entry.rank === 2 ? 'bg-gray-400 text-black' :
                            entry.rank === 3 ? 'bg-orange-500 text-black' :
                            'bg-white/20 text-white'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <div className="text-white font-medium">{entry.name}</div>
                            <div className="text-white/60 text-sm">{entry.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{entry.accuracy}%</div>
                          <div className="text-white/60 text-sm">精度</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="text-center space-x-4">
                  <button 
                    onClick={() => setCurrentStep('data')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                  >
                    新しい問題に挑戦
                  </button>
                  <button 
                    onClick={() => setCurrentStep('submission')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    再提出
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
