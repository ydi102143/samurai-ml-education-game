import { useState, useEffect } from 'react';
import { ArrowLeft, Play, ChevronRight, Eye, Trophy, Target, Upload, Settings } from 'lucide-react';
import { DynamicLearningSystem } from '../utils/dynamicLearningSystem';
import { userManager } from '../utils/userManager';
import { SmartDefaults } from '../utils/smartDefaults';
// import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
// import { CompetitionEvaluator } from '../utils/competitionEvaluation'; // 動的学習システムで代替
import { unifiedDataManager } from '../utils/unifiedDataManager';
import type { Dataset, ModelResult, TrainingProgress } from '../types/ml';
import type { CompetitionProblem, ModelEvaluation } from '../types/competition';
import { DataExplorer } from './DataExplorer';
import { PreprocessingTab } from './PreprocessingTab';
import { FeatureSelector } from './FeatureSelector';
import { TrainingProgress as TrainingProgressComponent } from './TrainingProgress';
import { HyperparameterPanel } from './HyperparameterPanel';

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
}

export function BattleChallengeView({ 
  problemId, 
  problemTitle, 
  problemDescription,
  dataset,
  difficulty,
  timeLimit,
  onBack,
  isMultiplayer = false,
  participants = [],
  roomId: _roomId = 'default-room',
  // userId,
  username,
}: BattleChallengeViewProps) {
  // ユーザー情報を取得
  const currentUser = userManager.getCurrentUser();
  // const finalUserId = userId || currentUser?.id || 'anonymous';
  const finalUsername = username || currentUser?.username || 'プレイヤー';
  
  const [datasetData, setDatasetData] = useState<Dataset | null>(null);
  const [preprocessedDataset, setPreprocessedDataset] = useState<Dataset | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  
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
  // const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [competitionProblem, setCompetitionProblem] = useState<CompetitionProblem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedEvaluationMetrics, setSelectedEvaluationMetrics] = useState<('accuracy' | 'mae' | 'f1_score' | 'precision' | 'recall' | 'mse' | 'rmse')[]>(['accuracy']);
  const [dataSplitSettings, setDataSplitSettings] = useState({
    trainRatio: 0.7,
    validationRatio: 0.2,
    testRatio: 0.1,
    randomSeed: 42,
    stratified: true
  });

  // リアルタイムバトルフック（簡易版）
  // const realtimeBattle = useRealtimeBattle(roomId, finalUserId, finalUsername);

  // 初期化
  useEffect(() => {
    setDatasetData(dataset);
    setPreprocessedDataset(dataset);
    
    // 特徴量を自動選択（最初の3つ）
    if (dataset.featureNames && dataset.featureNames.length > 0) {
      const autoSelectedFeatures = dataset.featureNames.slice(0, Math.min(3, dataset.featureNames.length)).map((_, index) => index);
      setSelectedFeatures(autoSelectedFeatures);
    }
    
    // コンペティション問題を設定
    setCompetitionProblem({
      id: problemId,
      title: problemTitle,
      description: problemDescription || '',
      problemType: (dataset.classes && dataset.classes.length > 2 ? 'multiclass_classification' : 
                   dataset.classes && dataset.classes.length === 2 ? 'binary_classification' : 'regression') as 'binary_classification' | 'multiclass_classification' | 'regression',
      difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      timeLimit: timeLimit || 3600,
      dataset: {
        data: [...dataset.train, ...dataset.test],
        train: dataset.train,
        test: dataset.test,
        validation: dataset.test,
        featureNames: dataset.featureNames,
        labelName: dataset.labelName,
        classes: dataset.classes || [],
        problemType: (dataset.classes && dataset.classes.length > 0 ? 'classification' : 'regression') as 'classification' | 'regression',
        defaultMetric: (dataset.classes && dataset.classes.length > 0 ? 'accuracy' : 'mae') as 'accuracy' | 'mae',
        description: problemDescription || '',
        metric: (dataset.classes && dataset.classes.length > 0 ? 'accuracy' : 'mae') as 'accuracy' | 'mae'
      },
      metric: (dataset.classes && dataset.classes.length > 0 ? 'accuracy' : 'mae') as 'accuracy' | 'mae',
      constraints: {
        maxFeatures: dataset.featureNames.length,
        maxTrainingTime: timeLimit || 3600,
        maxSubmissions: 100,
        allowedModels: ['logistic_regression', 'linear_regression', 'neural_network']
      },
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participantCount: 0,
      submissionCount: 0
    });
  }, [dataset, problemId, problemTitle, problemDescription, difficulty, timeLimit]);

  // リーダーボード読み込み
  // const loadLeaderboard = async () => {
  //   try {
  //     const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
  //     setLeaderboard(leaderboardData?.submissions || []);
  //   } catch (error) {
  //     console.error('リーダーボード読み込みエラー:', error);
  //   }
  // };

  // useEffect(() => {
  //   loadLeaderboard();
  // }, [problemId]);

  // 提出機能（統一データマネージャー使用）

  // 評価実行（動的学習システム統合済み）

  // 学習実行（完全版）
  const handleTrain = async () => {
    console.log('=== 学習開始 ===');
    console.log('データセット:', !!preprocessedDataset);
    console.log('特徴量:', selectedFeatures);
    console.log('モデル:', selectedModel);
    console.log('パラメータ:', parameters);

    if (!preprocessedDataset) {
      setError('前処理データがありません');
      return;
    }

    if (selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      setTrainingProgress(null);

      // パラメータ設定
      const userLevel = 1;
      const smartParameters = SmartDefaults.getRecommendedParameters(selectedModel, userLevel);
      const finalParameters = Object.keys(parameters).length > 0 ? parameters : smartParameters;

      console.log('最終パラメータ:', finalParameters);

      // 学習設定
      const learningConfig = {
        modelType: selectedModel,
        parameters: finalParameters,
        selectedFeatures: selectedFeatures,
        evaluationMetrics: selectedEvaluationMetrics,
        dataSplit: {
          trainRatio: dataSplitSettings.trainRatio,
          validationRatio: dataSplitSettings.validationRatio,
          testRatio: dataSplitSettings.testRatio,
          randomSeed: dataSplitSettings.randomSeed,
          stratified: dataSplitSettings.stratified
        }
      };

      console.log('学習設定:', learningConfig);

      // 学習実行
      const learningResult = await DynamicLearningSystem.trainModel(
        preprocessedDataset,
        learningConfig,
        (progress) => {
          console.log('学習進捗:', {
            epoch: progress.epoch,
            total: progress.total,
            message: progress.message,
            loss: progress.loss,
            accuracy: progress.accuracy,
            progress: progress.progress
          });
          setTrainingProgress(progress);
        }
      );

      console.log('学習結果:', learningResult);

      // 結果を設定
      setResult(learningResult.result);
      setTrainedModel(learningResult.model);
      setCurrentStep('evaluation');
      
      console.log('学習完了 - 評価ステップに移動');
    } catch (error) {
      console.error('学習エラー:', error);
      setError(`学習に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsTraining(false);
    }
  };

  // 評価実行（完全版）
  const handleEvaluate = async () => {
    console.log('=== 評価開始 ===');
    console.log('コンペティション問題:', !!competitionProblem);
    console.log('前処理データ:', !!preprocessedDataset);
    console.log('特徴量:', selectedFeatures);
    console.log('モデル:', selectedModel);

    if (!preprocessedDataset) {
      setError('前処理データがありません');
      return;
    }

    if (selectedFeatures.length === 0) {
      setError('特徴量が選択されていません');
      return;
    }

    try {
      setError(null);
      setIsEvaluating(true);

      // パラメータ設定
      const userLevel = 1;
      const smartParameters = SmartDefaults.getRecommendedParameters(selectedModel, userLevel);
      const finalParameters = Object.keys(parameters).length > 0 ? parameters : smartParameters;

      // 評価設定
      const learningConfig = {
        modelType: selectedModel,
        parameters: finalParameters,
        selectedFeatures: selectedFeatures,
        evaluationMetrics: selectedEvaluationMetrics,
        dataSplit: {
          trainRatio: dataSplitSettings.trainRatio,
          validationRatio: dataSplitSettings.validationRatio,
          testRatio: dataSplitSettings.testRatio,
          randomSeed: dataSplitSettings.randomSeed,
          stratified: dataSplitSettings.stratified
        }
      };

      console.log('評価設定:', learningConfig);

      // 評価実行
      const learningResult = await DynamicLearningSystem.trainModel(
        preprocessedDataset,
        learningConfig
      );

      console.log('評価結果:', learningResult);

      // 評価結果を設定
      const evaluationResult = {
        validationScore: learningResult.result.accuracy,
        testScore: learningResult.result.accuracy,
        metrics: {
          accuracy: learningResult.result.accuracy,
          precision: learningResult.result.precision,
          recall: learningResult.result.recall,
          f1_score: learningResult.result.f1_score,
          mae: learningResult.result.accuracy, // 回帰問題の場合
          mse: learningResult.result.accuracy,
          rmse: learningResult.result.accuracy
        },
        predictions: learningResult.result.predictions.map(p => typeof p === 'string' ? parseFloat(p) : p),
        actual: learningResult.result.actual.map(a => typeof a === 'string' ? parseFloat(a) : a),
        trainingTime: learningResult.trainingTime / 1000,
        modelComplexity: learningResult.result.accuracy, // モデル複雑度として精度を使用
        config: learningConfig
      };

      setEvaluation(evaluationResult);
      setResult({
        accuracy: learningResult.result.accuracy,
        training_time: learningResult.trainingTime / 1000,
        precision: learningResult.result.precision,
        recall: learningResult.result.recall,
        f1_score: learningResult.result.f1_score,
        predictions: learningResult.result.predictions,
        actual: learningResult.result.actual
      });
      setTrainedModel(learningResult.model);
      setCurrentStep('submission');
      
      console.log('評価完了 - 提出ステップに移動');
    } catch (error) {
      console.error('評価エラー:', error);
      setError(`評価に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 提出実行（完全版）
  const handleSubmit = async () => {
    console.log('=== 提出開始 ===');
    console.log('評価結果:', !!evaluation);
    console.log('学習済みモデル:', !!trainedModel);

    if (!evaluation) {
      setError('評価結果がありません。先に評価を実行してください。');
      return;
    }

    if (!trainedModel) {
      setError('学習済みモデルがありません。先に学習を実行してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const user = userManager.getCurrentUser();
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      console.log('提出ユーザー:', user.username);

      // 提出データの準備
      const submissionData = {
        problemId: competitionProblem?.id || problemId,
        userId: user.id,
        username: user.username,
        selectedFeatures: selectedFeatures,
        modelType: selectedModel,
        parameters: parameters,
        preprocessing: {}, // 前処理情報
        teamId: undefined,
        teamMembers: undefined,
        evaluationResult: evaluation,
        score: Math.round(evaluation.validationScore * 100) // 0-100のスコアに変換
      };

      console.log('提出データ:', submissionData);

      // 統一データマネージャーで提出
      const submission = await unifiedDataManager.submitResult(
        submissionData.problemId,
        submissionData.userId,
        submissionData.username,
        submissionData.selectedFeatures,
        submissionData.modelType,
        submissionData.parameters,
        submissionData.preprocessing,
        submissionData.teamId,
        submissionData.teamMembers,
        submissionData.evaluationResult,
        submissionData.score
      );

      console.log('提出完了:', submission);

      // ユーザー統計を更新
      const battleResult = {
        won: evaluation.validationScore >= 0.7, // 70%以上を勝利とする
        score: Math.round(evaluation.validationScore * 100),
        modelType: selectedModel,
        problemType: competitionProblem?.problemType || 'unknown'
      };
      
      userManager.updateBattleResult(battleResult.won, battleResult.score);
      
      console.log('提出完了 - リーダーボードに反映');
    } catch (error) {
      console.error('提出エラー:', error);
      setError(`提出に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
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
                     onPreprocess={setPreprocessedDataset}
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
                           onClose={() => setShowParameterPanel(false)}
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
                  
                  {/* 評価指標選択 */}
                  <div className="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-3">評価指標を選択</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['accuracy', 'precision', 'recall', 'f1_score', 'mae', 'mse', 'rmse'] as const).map(metric => (
                        <label key={metric} className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={selectedEvaluationMetrics.includes(metric)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvaluationMetrics([...selectedEvaluationMetrics, metric]);
                              } else {
                                setSelectedEvaluationMetrics(selectedEvaluationMetrics.filter(m => m !== metric));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* データ分割設定 */}
                  <div className="mb-6 p-4 bg-white bg-opacity-10 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-3">データ分割設定</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm mb-1">学習データ比率</label>
                        <input
                          type="range"
                          min="0.5"
                          max="0.9"
                          step="0.1"
                          value={dataSplitSettings.trainRatio}
                          onChange={(e) => setDataSplitSettings({
                            ...dataSplitSettings,
                            trainRatio: parseFloat(e.target.value),
                            validationRatio: (1 - parseFloat(e.target.value)) * 0.5,
                            testRatio: (1 - parseFloat(e.target.value)) * 0.5
                          })}
                          className="w-full"
                        />
                        <div className="text-white text-sm">{Math.round(dataSplitSettings.trainRatio * 100)}%</div>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">ランダムシード</label>
                        <input
                          type="number"
                          value={dataSplitSettings.randomSeed}
                          onChange={(e) => setDataSplitSettings({
                            ...dataSplitSettings,
                            randomSeed: parseInt(e.target.value) || 42
                          })}
                          className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="checkbox"
                          checked={dataSplitSettings.stratified}
                          onChange={(e) => setDataSplitSettings({
                            ...dataSplitSettings,
                            stratified: e.target.checked
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">層化サンプリングを使用</span>
                      </label>
                    </div>
                  </div>
                  
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
                        {selectedEvaluationMetrics.map(metric => (
                          <div key={metric} className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                              {Math.round((evaluation.metrics[metric as keyof typeof evaluation.metrics] || 0) * 100)}%
                            </div>
                            <div className="text-sm text-white">{metric}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-white">
                        <div>データ分割: 学習{Math.round(dataSplitSettings.trainRatio * 100)}% / 検証{Math.round(dataSplitSettings.validationRatio * 100)}% / テスト{Math.round(dataSplitSettings.testRatio * 100)}%</div>
                        <div>ランダムシード: {dataSplitSettings.randomSeed}</div>
                        <div>層化サンプリング: {dataSplitSettings.stratified ? '有効' : '無効'}</div>
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
                          {isSubmitting ? '提出中...' : 'リーダーボードに提出'}
                        </button>
                      </div>

                       {evaluation && (
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
