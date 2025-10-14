import { useState, useEffect } from 'react';
import { Sword, Trophy } from 'lucide-react';
import { getRandomAdvancedProblemDataset, type AdvancedProblemDataset } from '../data/advancedProblemDatasets';
// import { type LeaderboardEntry } from '../utils/realtimeProblemSystem';
import { EDAPanel } from './EDAPanel';
import { PreprocessingPanel } from './PreprocessingPanel';
import { FeatureEngineeringPanel } from './FeatureEngineeringPanel';
// リアルタイム管理（必要に応じて実装）

interface EnhancedOnlineBattleProps {
  onBack: () => void;
}

type Step = 'data' | 'eda' | 'data_split' | 'preprocessing' | 'feature_engineering' | 'feature_selection' | 'model_selection' | 'training' | 'validation' | 'submission' | 'leaderboard';

export function EnhancedOnlineBattle({ onBack }: EnhancedOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<AdvancedProblemDataset | null>(null);
  // 週間問題（必要に応じて実装）
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  
  // データ関連
  const [processedData, setProcessedData] = useState<any[]>([]);
  
  
  // リーダーボード関連
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // リアルタイム関連
  // リアルタイム関連の状態（必要に応じて使用）
  

  // 初期化
  useEffect(() => {
    loadProblem();
    loadLeaderboard();
    
    // リアルタイム問題システム（必要に応じて実装）
    
    // リアルタイム管理（必要に応じて実装）
  }, []);



  // 週間問題のカウントダウン（必要に応じて実装）

  const loadProblem = async () => {
    try {
      setLoading(true);
      
      // 週間問題（必要に応じて実装）
      
      // 問題データを取得
      const problem = getRandomAdvancedProblemDataset();
      
      setCurrentProblem(problem);
      
      // データを初期化
      setProcessedData(problem.data);
      
      console.log('問題読み込み完了:', problem.name);
    } catch (err) {
      console.error('問題読み込みエラー:', err);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };


  const loadLeaderboard = async () => {
    try {
      const leaderboardData: any[] = []; // リーダーボードデータ（必要に応じて実装）
      setLeaderboard(leaderboardData);
      console.log('リーダーボード読み込み完了:', leaderboardData);
    } catch (err) {
      console.error('リーダーボード読み込みエラー:', err);
      setLeaderboard([]);
    }
  };

  // データ更新関数
  const updateDataHistory = (newData: any[], operation: string) => {
    setProcessedData(newData);
    console.log(`${operation}が完了しました`);
  };

  // 時間フォーマット関数（必要に応じて使用）

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-orange-900 text-white p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center text-red-900">
          <p className="text-2xl font-bold mb-4">エラーが発生しました</p>
          <p className="mb-6">{error}</p>
          <button onClick={onBack} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <p className="text-xl font-bold">問題を読み込めませんでした。</p>
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
            🚀 MLコンテスト
          </h1>
          <p className="text-white/70 text-sm">データ分析・前処理・モデル構築</p>
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
                onClick={() => setCurrentStep(step.id as Step)}
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
                            {entry.modelType || 'Unknown'} • {entry.publicScore ? `${entry.publicScore.toFixed(2)}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          {entry.overallScore ? `${Math.round(entry.overallScore * 100)}%` : entry.publicScore ? `${Math.round(entry.publicScore * 100)}%` : 'N/A'}
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
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">問題を読み込み中...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 text-center">
              <div className="text-red-300 text-xl font-bold mb-2">エラー</div>
              <div className="text-red-200">{error}</div>
            </div>
          )}

          {currentProblem && !loading && !error && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                {/* ステップコンテンツ */}
                {currentStep === 'data' && (
                  <div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl mb-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                          <div className="text-2xl">🎯</div>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">{currentProblem.name}</h2>
                          <p className="text-white/70 text-lg">{currentProblem.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{currentProblem.featureNames.length}</div>
                          <div className="text-sm text-white/80">特徴量数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{currentProblem.data.length}</div>
                          <div className="text-sm text-white/80">サンプル数</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{currentProblem.problemType}</div>
                          <div className="text-sm text-white/80">問題タイプ</div>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400">{currentProblem.difficulty}</div>
                          <div className="text-sm text-white/80">難易度</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4">
                        <h3 className="text-lg font-bold text-white mb-3">📋 問題の詳細</h3>
                        <div className="space-y-2 text-white/80">
                          <p><strong>ドメイン:</strong> {currentProblem.domain}</p>
                          <p><strong>ターゲット変数:</strong> {currentProblem.targetName}</p>
                          {currentProblem.classes && (
                            <p><strong>クラス:</strong> {currentProblem.classes.join(', ')}</p>
                          )}
                          <p><strong>特徴量の種類:</strong> 数値変数 {currentProblem.featureTypes?.filter(t => t === 'numerical').length || 0}個, カテゴリ変数 {currentProblem.featureTypes?.filter(t => t === 'categorical').length || 0}個</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'eda' && (
                  <EDAPanel
                    data={processedData}
                    problemType={currentProblem.problemType}
                  />
                )}

                {currentStep === 'data_split' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">📊 データ分割設定</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 分割比率 */}
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-bold mb-4">分割比率</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="text-white/70 text-sm mb-2 block">訓練データ比率 (%)</label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="range"
                                  min="60"
                                  max="90"
                                  value={70}
                                  className="flex-1"
                                  onChange={() => {
                                    // スライダーの値を更新
                                  }}
                                />
                                <span className="text-white text-sm font-mono w-12">70%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-white/70 text-sm mb-2 block">検証データ比率 (%)</label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="range"
                                  min="10"
                                  max="40"
                                  value={30}
                                  className="flex-1"
                                  onChange={() => {
                                    // スライダーの値を更新
                                  }}
                                />
                                <span className="text-white text-sm font-mono w-12">30%</span>
                              </div>
                            </div>
                            <div className="text-center text-white/60 text-sm">
                              合計: 100% (テストデータは運営側で管理)
                            </div>
                          </div>
                        </div>
                        
                        {/* 検証戦略 */}
                        <div className="bg-white/10 rounded-lg p-4">
                          <h4 className="text-white font-bold mb-4">検証戦略</h4>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="validationStrategy" 
                                value="holdout" 
                                defaultChecked 
                                className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 focus:ring-2" 
                              />
                              <div>
                                <div className="text-white font-medium">ホールドアウト検証</div>
                                <div className="text-white/60 text-sm">単純な訓練/検証分割</div>
                              </div>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="validationStrategy" 
                                value="cross_validation" 
                                className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 focus:ring-2" 
                              />
                              <div>
                                <div className="text-white font-medium">クロスバリデーション</div>
                                <div className="text-white/60 text-sm">データを複数のフォールドに分割して検証</div>
                              </div>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="validationStrategy" 
                                value="stratified_cv" 
                                className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 focus:ring-blue-500 focus:ring-2" 
                              />
                              <div>
                                <div className="text-white font-medium">層化クロスバリデーション</div>
                                <div className="text-white/60 text-sm">クラス比率を保持した分割</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* カラム選択 */}
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">カラム選択</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">特徴量カラム</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                              {currentProblem?.featureNames.map((feature, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-white text-sm">{feature}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">ターゲットカラム</label>
                            <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white">
                              <option value={currentProblem?.targetName}>{currentProblem?.targetName}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">層化カラム（層化クロスバリデーション用）</label>
                            <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white">
                              <option value="">選択してください</option>
                              {currentProblem?.featureNames.map((feature, index) => (
                                <option key={index} value={feature}>{feature}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* 説明 */}
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-bold mb-2">📋 データ分割の説明</h4>
                        <div className="text-blue-300 text-sm space-y-1">
                          <p>• 訓練データ: モデルの学習に使用</p>
                          <p>• 検証データ: モデルの汎化性能を確認</p>
                          <p>• テストデータ: 最終評価用（運営側で管理）</p>
                          <p>• 層化分割: 分類問題でクラス比率を保持</p>
                        </div>
                      </div>

                      {/* 実行ボタン */}
                      <div className="text-center">
                        <button 
                          onClick={() => setCurrentStep('preprocessing')}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                          データ分割を実行
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'preprocessing' && (
                  <PreprocessingPanel
                    data={processedData}
                    featureNames={currentProblem.featureNames}
                    featureTypes={currentProblem.featureTypes}
                    onPreprocessedData={(data) => updateDataHistory(data, '前処理')}
                  />
                )}

                {currentStep === 'feature_engineering' && (
                  <FeatureEngineeringPanel
                    data={processedData}
                    featureNames={currentProblem.featureNames}
                    featureTypes={currentProblem.featureTypes}
                    onEngineeredData={(data) => updateDataHistory(data, '特徴量エンジニアリング')}
                    onFeatureSelect={() => {}}
                    selectedFeatures={[]}
                  />
                )}

                {currentStep === 'feature_selection' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">🔍 特徴量選択</h3>
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">選択方法</h4>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="radio" name="featureSelectionMethod" value="manual" defaultChecked className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-white font-medium">手動選択</div>
                              <div className="text-white/60 text-sm">特徴量を手動で選択</div>
                            </div>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="radio" name="featureSelectionMethod" value="correlation" className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-white font-medium">相関分析</div>
                              <div className="text-white/60 text-sm">ターゲットとの相関が高い特徴量を選択</div>
                            </div>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="radio" name="featureSelectionMethod" value="variance" className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="text-white font-medium">分散分析</div>
                              <div className="text-white/60 text-sm">分散が大きい特徴量を選択</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">特徴量一覧</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                          {currentProblem?.featureNames.map((feature, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white/5">
                              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-500 bg-white/10 border-white/30 rounded focus:ring-blue-500" />
                              <span className="text-white text-sm">{feature}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-4 text-white/60 text-sm">
                          選択済み: {currentProblem?.featureNames.length || 0} / {currentProblem?.featureNames.length || 0} 特徴量
                        </div>
                      </div>

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
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">🎯 モデル選択</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'ロジスティック回帰', type: 'logistic_regression', description: '線形分類器、解釈しやすい' },
                          { name: 'ランダムフォレスト', type: 'random_forest', description: 'アンサンブル学習、頑健性が高い' },
                          { name: 'SVM', type: 'svm', description: '高次元データに強い' },
                          { name: 'ニューラルネットワーク', type: 'neural_network', description: '複雑なパターンを学習' },
                          { name: '勾配ブースティング', type: 'gradient_boosting', description: '高い精度が期待できる' },
                          { name: '決定木', type: 'decision_tree', description: '解釈しやすく、ルールベース' }
                        ].map((model, index) => (
                          <div key={index} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer border border-white/20 hover:border-blue-400/50">
                            <h4 className="text-white font-bold mb-2">{model.name}</h4>
                            <p className="text-white/70 text-sm mb-3">{model.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-400 text-xs font-medium">選択可能</span>
                              <div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">ハイパーパラメータ設定</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">学習率</label>
                            <input
                              type="range"
                              min="0.001"
                              max="0.1"
                              step="0.001"
                              defaultValue="0.01"
                              className="w-full"
                            />
                            <div className="text-white text-sm mt-1">0.01</div>
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">正則化強度</label>
                            <input
                              type="range"
                              min="0.1"
                              max="10"
                              step="0.1"
                              defaultValue="1.0"
                              className="w-full"
                            />
                            <div className="text-white text-sm mt-1">1.0</div>
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">最大反復回数</label>
                            <input
                              type="number"
                              min="100"
                              max="10000"
                              step="100"
                              defaultValue="1000"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                            />
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">ランダムシード</label>
                            <input
                              type="number"
                              min="0"
                              max="9999"
                              defaultValue="42"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button 
                          onClick={() => setCurrentStep('training')}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                          モデルを選択して学習開始
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'training' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">🧠 モデル学習</h3>
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">学習進行状況</h4>
                        <div className="space-y-4">
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <div className="text-white text-sm">学習中... 65% 完了</div>
                          <div className="text-white/60 text-xs">推定残り時間: 2分30秒</div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">学習ログ</h4>
                        <div className="bg-black/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <div className="text-green-400 text-sm font-mono">
                            <div>Epoch 1/100 - Loss: 0.6234 - Accuracy: 0.7234</div>
                            <div>Epoch 2/100 - Loss: 0.5891 - Accuracy: 0.7456</div>
                            <div>Epoch 3/100 - Loss: 0.5567 - Accuracy: 0.7689</div>
                            <div>Epoch 4/100 - Loss: 0.5234 - Accuracy: 0.7891</div>
                            <div>Epoch 5/100 - Loss: 0.4901 - Accuracy: 0.8123</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button 
                          onClick={() => setCurrentStep('validation')}
                          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                          学習完了
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'validation' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">✅ モデル検証</h3>
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">検証結果</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 text-center">
                            <div className="text-green-300 text-2xl font-bold">0.8567</div>
                            <div className="text-green-200 text-sm">精度</div>
                          </div>
                          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 text-center">
                            <div className="text-blue-300 text-2xl font-bold">0.8234</div>
                            <div className="text-blue-200 text-sm">適合率</div>
                          </div>
                          <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 text-center">
                            <div className="text-purple-300 text-2xl font-bold">0.8901</div>
                            <div className="text-purple-200 text-sm">再現率</div>
                          </div>
                          <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4 text-center">
                            <div className="text-orange-300 text-2xl font-bold">0.8567</div>
                            <div className="text-orange-200 text-sm">F1スコア</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">検証戦略</h4>
                        <div className="text-white/70 text-sm">
                          <p>ホールドアウト検証を使用</p>
                          <p>訓練データ: 70% | 検証データ: 30%</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <button 
                          onClick={() => setCurrentStep('submission')}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                          検証完了 - 提出へ進む
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'submission' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">📤 結果提出</h3>
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">提出情報</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">提出名</label>
                            <input
                              type="text"
                              placeholder="例: RandomForest_v1"
                              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            />
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-2 block">モデル情報</label>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white text-sm">
                                <p>モデル: ランダムフォレスト</p>
                                <p>検証精度: 85.67%</p>
                                <p>特徴量数: {currentProblem?.featureNames.length || 0}</p>
                                <p>提出日時: {new Date().toLocaleString('ja-JP')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">提出前確認</h4>
                        <div className="space-y-2 text-white/70 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>データ前処理が完了しています</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>特徴量エンジニアリングが完了しています</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>モデル学習が完了しています</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>検証が完了しています</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button 
                          onClick={() => setCurrentStep('leaderboard')}
                          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >
                          結果を提出する
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'leaderboard' && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">🏆 リーダーボード</h2>
                    <div className="space-y-4">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            index === 0
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                              : index === 1
                              ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30'
                              : index === 2
                              ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30'
                              : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0
                                  ? 'bg-yellow-500 text-black'
                                  : index === 1
                                  ? 'bg-gray-400 text-white'
                                  : index === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white/20 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-white font-bold">{entry.userName || 'プレイヤー'}</div>
                                <div className="text-white/70 text-sm">{entry.modelType}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                {entry.overallScore?.toFixed(4) || 'N/A'}
                              </div>
                              <div className="text-white/70 text-sm">精度</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



