import { useState, useEffect } from 'react';
import { ArrowLeft, Play, ChevronRight, Eye, Sparkles, Trophy, Target, MessageCircle, Send, Upload, Award, Settings } from 'lucide-react';
import { getDatasetForRegion } from '../data/datasets';
import { createStableModel } from '../utils/stableMLModels';
import { useRealtimeBattle } from '../hooks/useRealtimeBattle';
import { userManager } from '../utils/userManager';
import { ErrorHandler } from '../utils/errorHandler';
import { SmartDefaults } from '../utils/smartDefaults';
import { CompetitionProblemManager } from '../utils/competitionProblemManager';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { CompetitionEvaluator } from '../utils/competitionEvaluation';
import { unifiedDataManager } from '../utils/unifiedDataManager';
import { errorRecovery } from '../utils/errorRecovery';
import type { Dataset, ModelResult, TrainingProgress } from '../types/ml';
import type { CompetitionProblem, CompetitionSubmission, ModelEvaluation } from '../types/competition';
import { DataExplorer } from './DataExplorer';
import { PreprocessingTab } from './PreprocessingTab';
import { FeatureSelector } from './FeatureSelector';
import { TrainingProgress as TrainingProgressComponent } from './TrainingProgress';
import { HyperparameterPanel } from './HyperparameterPanel';
import { PerformanceSettings } from './PerformanceSettings';

type Step = 'data' | 'preprocessing' | 'features' | 'model' | 'evaluation' | 'submission';

interface BattleChallengeViewProps {
  problemId: string;
  problemTitle: string;
  problemDescription?: string;
  dataset: Dataset;
  difficulty?: string;
  timeLimit?: number;
  onComplete: (result: any) => void;
  onBack: () => void;
  isMultiplayer?: boolean;
  participants?: any[];
  roomId?: string;
  userId?: string;
  username?: string;
  userTeam?: any;
  onLeaderboardUpdate?: () => void;
}

export function BattleChallengeView({ 
  problemId, 
  problemTitle, 
  dataset,
  onBack,
  isMultiplayer = false,
  participants = [],
  roomId = 'default-room',
  userId,
  username,
  userTeam,
  onLeaderboardUpdate
}: BattleChallengeViewProps) {
  // ユーザー情報を取得
  const currentUser = userManager.getCurrentUser();
  const finalUserId = userId || currentUser?.id || 'anonymous';
  const finalUsername = username || currentUser?.username || 'プレイヤー';
  
  const [datasetData, setDatasetData] = useState<Dataset | null>(null);
  const [preprocessedDataset, setPreprocessedDataset] = useState<Dataset | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  
  // オンライン対戦では制限されたモデルのみ使用可能
  const availableModels = [
    { id: 'logistic_regression', name: 'ロジスティック回帰' },
    { id: 'linear_regression', name: '線形回帰' },
    { id: 'neural_network', name: 'ニューラルネットワーク' }
  ];
  
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [showParameterPanel, setShowParameterPanel] = useState(false);
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [result, setResult] = useState<ModelResult | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [competitionProblem, setCompetitionProblem] = useState<CompetitionProblem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [, setSubmission] = useState<CompetitionSubmission | null>(null);
  const [preprocessing] = useState<{
    method: 'none' | 'normalize' | 'standardize' | 'encode';
    encodedFeatures?: number[];
  }>({ method: 'none' });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [learningTips, setLearningTips] = useState<string[]>([]);
  const [, setTrainedModel] = useState<any>(null);
  const [, setSavedModelId] = useState<string | null>(null);
  
  const [battleStatus, setBattleStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);

  // リアルタイムバトルフック
  const realtimeBattle = useRealtimeBattle(roomId, finalUserId, finalUsername);

  // 初期化
  useEffect(() => {
    setDatasetData(dataset);
    setPreprocessedDataset(dataset);
    setBattleStatus('active');
    
    // チームメンバー情報を設定
    if (userTeam && userTeam.members) {
      setTeamMembers(userTeam.members.map((member: any) => member.username));
    }
  }, [dataset, userTeam]);

  // リーダーボード読み込み
  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      setLeaderboard(leaderboardData?.submissions || []);
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [problemId]);

  // 提出機能（統一データマネージャー使用）
  const submitToLeaderboard = async (evaluationResult: ModelEvaluation) => {
    try {
      setIsSubmitting(true);
      setSubmissionStatus('提出中...');
      
      console.log('提出開始:', {
        problemId,
        userId: finalUserId,
        username: finalUsername,
        selectedFeatures,
        modelType: selectedModel,
        parameters,
        preprocessing,
        evaluationResult
      });

      // 評価結果を含めて提出
      const submission = await errorRecovery.executeWithRetry(
        async () => {
          return await unifiedDataManager.submitResult(
            problemId,
            finalUserId,
            finalUsername,
            selectedFeatures,
            selectedModel,
            parameters,
            preprocessing,
            userTeam?.id,
            userTeam?.members,
            evaluationResult // 評価結果を追加
          );
        },
        'submit_to_leaderboard',
        'リーダーボード提出'
      );

      setSubmission(submission);
      setSubmissionStatus('提出完了！');
      
      // 参加者数と提出数をリアルタイムで更新
      await unifiedDataManager.updateParticipantCount(problemId, participants.length);
      await unifiedDataManager.updateSubmissionCount(problemId, leaderboard.length + 1);
      
      // リーダーボードを再読み込み
      await loadLeaderboard();
      
      if (onLeaderboardUpdate) {
        onLeaderboardUpdate();
      }
      
    } catch (error) {
      console.error('提出エラー:', error);
      setSubmissionStatus('提出に失敗しました');
      setError(`提出に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 評価実行
  const evaluateCurrentSetup = async () => {
    try {
      setIsEvaluating(true);
      setError(null);
      
      console.log('評価開始:', {
        problemId: problemId,
        selectedFeatures: selectedFeatures,
        selectedModel: selectedModel,
        parameters: parameters,
        preprocessing: preprocessing
      });

      // バックエンドの準備を確認（簡易版）
      console.log('TensorFlow.jsバックエンドの準備を確認中...');
      
      // 簡易的なバックエンドチェック
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.jsが読み込まれていません');
      }
      
      const backend = tf.getBackend();
      if (!backend) {
        console.warn('バックエンドが利用できません。フォールバックモードで実行します。');
      }

      if (!competitionProblem || !preprocessedDataset || selectedFeatures.length === 0) {
        throw new Error('コンペティション問題、前処理データ、または特徴量が選択されていません');
      }

      // コンペティション評価を実行（ユーザー設定のパラメータを使用）
      const user = userManager.getCurrentUser();
      const userLevel = user?.level || 1;
      const smartParameters = SmartDefaults.getRecommendedParameters(selectedModel, userLevel);
      const finalParameters = Object.keys(parameters).length > 0 ? parameters : smartParameters;
      
      const evaluation = await CompetitionEvaluator.evaluatePlayerModel(
        competitionProblem.dataset,
        selectedFeatures,
        selectedModel,
        finalParameters,
        preprocessing
      );

      console.log('コンペティション評価完了:', evaluation);
      return evaluation;
    } catch (error) {
      console.error('評価エラーの詳細:', error);
      console.error('エラースタック:', (error as Error).stack);
      throw error;
    } finally {
      setIsEvaluating(false);
    }
  };

  // 学習実行
  const handleTrain = async () => {
    if (!preprocessedDataset || selectedFeatures.length === 0) {
      setError('データまたは特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setTrainingProgress(null);

      const model = createStableModel(selectedModel);
      const user = userManager.getCurrentUser();
      const userLevel = user?.level || 1;
      const smartParameters = SmartDefaults.getRecommendedParameters(selectedModel, userLevel);
      const finalParameters = Object.keys(parameters).length > 0 ? parameters : smartParameters;

      await model.train(preprocessedDataset, finalParameters, (progress) => {
        setTrainingProgress(progress);
      });

      const result = model.evaluate(preprocessedDataset);
      setResult(result);
      setTrainedModel(model);
      setCurrentStep('evaluation');
    } catch (error) {
      console.error('学習に失敗:', error);
      setError(`学習に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsTraining(false);
    }
  };

  // 評価実行
  const handleEvaluate = async () => {
    try {
      setError(null);
      const evaluation = await evaluateCurrentSetup();
      setEvaluation(evaluation);
      setResult({
        accuracy: evaluation.validationScore,
        training_time: evaluation.trainingTime || 0,
        precision: evaluation.metrics.precision || 0,
        recall: evaluation.metrics.recall || 0,
        f1_score: evaluation.metrics.f1_score || 0
      });
      setShowResults(true);
      setCurrentStep('submission');
    } catch (error) {
      console.error('評価エラー:', error);
      setError(`評価に失敗しました: ${(error as Error).message}`);
    }
  };

  // 提出実行
  const handleSubmit = async () => {
    if (!evaluation) {
      setError('評価結果がありません');
      return;
    }

    try {
      await submitToLeaderboard(evaluation);
      setCurrentStep('submission');
    } catch (error) {
      console.error('提出エラー:', error);
      setError(`提出に失敗しました: ${(error as Error).message}`);
    }
  };

  // ステップ進行度計算
  const getStepProgress = () => {
    const steps = ['data', 'preprocessing', 'features', 'model', 'evaluation', 'submission'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // ステップ進行
  const nextStep = () => {
    const steps: Step[] = ['data', 'preprocessing', 'features', 'model', 'evaluation', 'submission'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['data', 'preprocessing', 'features', 'model', 'evaluation', 'submission'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* ヘッダー */}
      <div className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{problemTitle}</h1>
                <p className="text-white text-opacity-80">オンライン対戦</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(getStepProgress())}%</div>
                <div className="text-sm text-yellow-200">進捗</div>
              </div>
              {isMultiplayer && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{participants.length}</div>
                  <div className="text-sm text-yellow-200">参加者</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <h2 className="text-xl font-bold text-white mb-4">ステップ</h2>
              <div className="space-y-2">
                {[
                  { id: 'data', name: 'データ探索', icon: Eye },
                  { id: 'preprocessing', name: '前処理', icon: Settings },
                  { id: 'features', name: '特徴量選択', icon: Target },
                  { id: 'model', name: 'モデル学習', icon: Play },
                  { id: 'evaluation', name: '評価', icon: Trophy },
                  { id: 'submission', name: '提出', icon: Upload }
                ].map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = ['data', 'preprocessing', 'features', 'model', 'evaluation', 'submission'].indexOf(currentStep) > ['data', 'preprocessing', 'features', 'model', 'evaluation', 'submission'].indexOf(step.id);
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id as Step)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-yellow-500 text-black'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{step.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              {/* エラー表示 */}
              {error && (
                <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* データ探索ステップ */}
              {currentStep === 'data' && datasetData && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">データ探索</h2>
                  <DataExplorer dataset={datasetData} />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* 前処理ステップ */}
              {currentStep === 'preprocessing' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">前処理</h2>
                  <PreprocessingTab
                    dataset={datasetData!}
                    onDatasetChange={setPreprocessedDataset}
                  />
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* 特徴量選択ステップ */}
              {currentStep === 'features' && preprocessedDataset && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">特徴量選択</h2>
                  <FeatureSelector
                    dataset={preprocessedDataset}
                    selectedFeatures={selectedFeatures}
                    onFeaturesChange={setSelectedFeatures}
                  />
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                    >
                      次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* モデル学習ステップ */}
              {currentStep === 'model' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">モデル学習</h2>
                  
                  {/* モデル選択 */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">モデルタイプ</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white"
                    >
                      {availableModels.map(model => (
                        <option key={model.id} value={model.id} className="bg-gray-800">
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* パラメータ設定 */}
                  <div className="mb-6">
                    <button
                      onClick={() => setShowParameterPanel(!showParameterPanel)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      {showParameterPanel ? 'パラメータを隠す' : 'パラメータを設定'}
                    </button>
                    
                    {showParameterPanel && (
                      <div className="mt-4">
                        <HyperparameterPanel
                          modelType={selectedModel}
                          parameters={parameters}
                          onParametersChange={setParameters}
                        />
                      </div>
                    )}
                  </div>

                  {/* 学習実行 */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleTrain}
                      disabled={isTraining}
                      className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                        isTraining
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isTraining ? '学習中...' : '学習開始'}
                    </button>
                  </div>

                  {/* 学習進捗 */}
                  {isTraining && trainingProgress && (
                    <div className="mt-6">
                      <TrainingProgressComponent progress={trainingProgress} />
                    </div>
                  )}

                  {/* 学習結果 */}
                  {result && (
                    <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
                      <h3 className="text-lg font-bold text-white mb-2">学習結果</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(result.accuracy * 100)}%</div>
                          <div className="text-sm text-white">精度</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{result.training_time.toFixed(2)}s</div>
                          <div className="text-sm text-white">学習時間</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    {result && (
                      <button
                        onClick={nextStep}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                      >
                        次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 評価ステップ */}
              {currentStep === 'evaluation' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">評価</h2>
                  
                  {isEvaluating ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                      <p className="text-white text-lg">評価中...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={handleEvaluate}
                        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg text-lg transition-colors"
                      >
                        評価実行
                      </button>
                    </div>
                  )}

                  {/* 評価結果 */}
                  {evaluation && (
                    <div className="mt-6 p-6 bg-white bg-opacity-10 rounded-lg">
                      <h3 className="text-xl font-bold text-white mb-4">評価結果</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(evaluation.validationScore * 100)}%</div>
                          <div className="text-sm text-white">スコア</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round((evaluation.metrics.accuracy || 0) * 100)}%</div>
                          <div className="text-sm text-white">精度</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round((evaluation.metrics.precision || 0) * 100)}%</div>
                          <div className="text-sm text-white">適合率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round((evaluation.metrics.recall || 0) * 100)}%</div>
                          <div className="text-sm text-white">再現率</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    {evaluation && (
                      <button
                        onClick={nextStep}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                      >
                        次へ <ChevronRight className="w-5 h-5 inline ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 提出ステップ */}
              {currentStep === 'submission' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">提出</h2>
                  
                  {evaluation ? (
                    <div>
                      <div className="mb-6 p-6 bg-white bg-opacity-10 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-4">提出内容</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{Math.round(evaluation.validationScore * 100)}%</div>
                            <div className="text-sm text-white">スコア</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{selectedModel}</div>
                            <div className="text-sm text-white">モデル</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{selectedFeatures.length}</div>
                            <div className="text-sm text-white">特徴量数</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{finalUsername}</div>
                            <div className="text-sm text-white">ユーザー</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                            isSubmitting
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {isSubmitting ? submissionStatus : 'リーダーボードに提出'}
                        </button>
                      </div>

                      {submissionResult && (
                        <div className="mt-6 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
                          <p className="text-green-200 text-center">提出が完了しました！</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white text-lg">評価を先に実行してください</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                    >
                      完了
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
