import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, AlertCircle, Clock, Target, Trophy } from 'lucide-react';
import type { CompetitionProblem, ModelEvaluation } from '../types/competition';
import { DataExplorer } from './DataExplorer';
import { PreprocessingTab } from './PreprocessingTab';
import { FeatureSelector } from './FeatureSelector';
import { TrainingProgress as TrainingProgressComponent } from './TrainingProgress';
import { HyperparameterPanel } from './HyperparameterPanel';

interface BattleChallengeViewProps {
  problem: CompetitionProblem;
  onBack: () => void;
  onSubmit: (submission: any) => void;
}

export function BattleChallengeView({ problem, onBack, onSubmit }: BattleChallengeViewProps) {
  const [currentStep, setCurrentStep] = useState<'data' | 'preprocessing' | 'features' | 'model' | 'train' | 'evaluate' | 'result'>('data');
  const [dataset, setDataset] = useState<any>(null);
  const [preprocessedDataset, setPreprocessedDataset] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvaluationMetrics, setSelectedEvaluationMetrics] = useState<string[]>([]);
  const [dataSplitSettings, setDataSplitSettings] = useState({
    trainRatio: 0.7,
    validationRatio: 0.15,
    testRatio: 0.15
  });

  // データセット読み込み
  useEffect(() => {
    if (problem.dataset) {
      setDataset(problem.dataset);
      setPreprocessedDataset(problem.dataset);
    }
  }, [problem]);

  // 学習開始
  const handleTrain = async () => {
    if (!selectedModel || selectedFeatures.length === 0) {
      alert('モデルと特徴量を選択してください');
      return;
    }

    setIsTraining(true);
    setCurrentStep('train');
    setTrainingProgress({ progress: 0, epoch: 0, loss: 0, accuracy: 0 });

    // 学習シミュレーション
    const totalEpochs = 100;
    for (let epoch = 0; epoch < totalEpochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const progress = (epoch + 1) / totalEpochs;
      const loss = Math.max(0.1, 1 - progress + Math.random() * 0.2);
      const accuracy = Math.min(0.95, progress * 0.8 + Math.random() * 0.2);
      
      setTrainingProgress({
        progress: progress * 100,
        epoch: epoch + 1,
        loss: loss,
        accuracy: accuracy
      });
    }

    // 結果生成
    const finalResult = {
      model: selectedModel,
      accuracy: 0.85 + Math.random() * 0.1,
      loss: 0.1 + Math.random() * 0.1,
      trainingTime: 5 + Math.random() * 10,
      hyperparameters
    };

    setResult(finalResult);
    setIsTraining(false);
    setCurrentStep('evaluate');
  };

  // 評価実行
  const handleEvaluate = async () => {
    if (!result) return;

    setIsEvaluating(true);
    
    // 評価シミュレーション
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const evaluationResult: ModelEvaluation = {
      validationScore: result.accuracy,
      testScore: result.accuracy * 0.95,
      predictions: [],
      actual: [],
      trainingTime: result.trainingTime,
      modelComplexity: 1.0,
      metrics: {
        accuracy: result.accuracy,
        precision: result.accuracy * 0.95,
        recall: result.accuracy * 0.9,
        f1_score: result.accuracy * 0.92,
        mae: 0.1 + Math.random() * 0.05,
        rmse: 0.15 + Math.random() * 0.05
      }
    };

    setEvaluation(evaluationResult);
    setIsEvaluating(false);
    setCurrentStep('result');
  };

  // 提出
  const handleSubmit = async () => {
    if (!evaluation) return;

    setIsSubmitting(true);
    
    const submission = {
      problemId: problem.id,
      model: selectedModel,
      features: selectedFeatures,
      hyperparameters,
      evaluation,
      dataSplit: dataSplitSettings,
      timestamp: new Date().toISOString()
    };

    try {
      await onSubmit(submission);
      alert('提出が完了しました！');
    } catch (error) {
      alert('提出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{problem.title}</h1>
              <p className="text-white/70">{problem.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/70">
              残り時間: {problem.timeLimit ? `${Math.floor(problem.timeLimit / 60)}分` : '無制限'}
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : ['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].indexOf(currentStep) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white/50'
                }`}>
                  {index + 1}
                </div>
                {index < 6 && (
                  <div className={`w-8 h-0.5 ${
                    ['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].indexOf(currentStep) > index
                      ? 'bg-green-600'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {currentStep === 'data' && dataset && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">データ探索</h2>
              <DataExplorer dataset={dataset} />
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('preprocessing')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  次へ: 前処理
                </button>
              </div>
            </div>
          )}

          {currentStep === 'preprocessing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">前処理</h2>
              <PreprocessingTab
                dataset={dataset}
                onPreprocess={(processed: any) => setPreprocessedDataset(processed)}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('data')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: データ探索
                </button>
                <button
                  onClick={() => setCurrentStep('features')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  次へ: 特徴量選択
                </button>
              </div>
            </div>
          )}

          {currentStep === 'features' && preprocessedDataset && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">特徴量選択</h2>
              <FeatureSelector
                dataset={preprocessedDataset}
                selectedFeatures={selectedFeatures}
                onFeaturesChange={setSelectedFeatures}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('preprocessing')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: 前処理
                </button>
                <button
                  onClick={() => setCurrentStep('model')}
                  disabled={selectedFeatures.length === 0}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                >
                  次へ: モデル選択
                </button>
              </div>
            </div>
          )}

          {currentStep === 'model' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">モデル選択</h2>
              <HyperparameterPanel
                modelType={selectedModel}
                parameters={hyperparameters}
                onParametersChange={setHyperparameters}
                onClose={() => {}}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('features')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: 特徴量選択
                </button>
                <button
                  onClick={handleTrain}
                  disabled={!selectedModel}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                >
                  学習開始
                </button>
              </div>
            </div>
          )}

          {currentStep === 'train' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">学習中</h2>
              {trainingProgress && <TrainingProgressComponent progress={trainingProgress} />}
            </div>
          )}

          {currentStep === 'evaluate' && result && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">評価</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">学習結果</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{result.accuracy.toFixed(3)}</div>
                    <div className="text-white/70">精度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{result.loss.toFixed(3)}</div>
                    <div className="text-white/70">損失</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  {isEvaluating ? '評価中...' : '評価実行'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'result' && evaluation && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">結果</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">評価結果</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{evaluation.metrics.precision?.toFixed(3) || '0.000'}</div>
                    <div className="text-white/70">適合率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{evaluation.metrics.f1_score?.toFixed(3) || '0.000'}</div>
                    <div className="text-white/70">F1スコア</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  {isSubmitting ? '提出中...' : '結果を提出'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { CompetitionProblem, ModelEvaluation } from '../types/competition';
import { DataExplorer } from './DataExplorer';
import { PreprocessingTab } from './PreprocessingTab';
import { FeatureSelector } from './FeatureSelector';
import { TrainingProgress as TrainingProgressComponent } from './TrainingProgress';
import { HyperparameterPanel } from './HyperparameterPanel';

interface BattleChallengeViewProps {
  problem: CompetitionProblem;
  onBack: () => void;
  onSubmit: (submission: any) => void;
}

export function BattleChallengeView({ problem, onBack, onSubmit }: BattleChallengeViewProps) {
  const [currentStep, setCurrentStep] = useState<'data' | 'preprocessing' | 'features' | 'model' | 'train' | 'evaluate' | 'result'>('data');
  const [dataset, setDataset] = useState<any>(null);
  const [preprocessedDataset, setPreprocessedDataset] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvaluationMetrics, setSelectedEvaluationMetrics] = useState<string[]>([]);
  const [dataSplitSettings, setDataSplitSettings] = useState({
    trainRatio: 0.7,
    validationRatio: 0.15,
    testRatio: 0.15
  });

  // データセット読み込み
  useEffect(() => {
    if (problem.dataset) {
      setDataset(problem.dataset);
      setPreprocessedDataset(problem.dataset);
    }
  }, [problem]);

  // 学習開始
  const handleTrain = async () => {
    if (!selectedModel || selectedFeatures.length === 0) {
      alert('モデルと特徴量を選択してください');
      return;
    }

    setIsTraining(true);
    setCurrentStep('train');
    setTrainingProgress({ progress: 0, epoch: 0, loss: 0, accuracy: 0 });

    // 学習シミュレーション
    const totalEpochs = 100;
    for (let epoch = 0; epoch < totalEpochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const progress = (epoch + 1) / totalEpochs;
      const loss = Math.max(0.1, 1 - progress + Math.random() * 0.2);
      const accuracy = Math.min(0.95, progress * 0.8 + Math.random() * 0.2);
      
      setTrainingProgress({
        progress: progress * 100,
        epoch: epoch + 1,
        loss: loss,
        accuracy: accuracy
      });
    }

    // 結果生成
    const finalResult = {
      model: selectedModel,
      accuracy: 0.85 + Math.random() * 0.1,
      loss: 0.1 + Math.random() * 0.1,
      trainingTime: 5 + Math.random() * 10,
      hyperparameters
    };

    setResult(finalResult);
    setIsTraining(false);
    setCurrentStep('evaluate');
  };

  // 評価実行
  const handleEvaluate = async () => {
    if (!result) return;

    setIsEvaluating(true);
    
    // 評価シミュレーション
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const evaluationResult: ModelEvaluation = {
      validationScore: result.accuracy,
      testScore: result.accuracy * 0.95,
      predictions: [],
      actual: [],
      trainingTime: result.trainingTime,
      modelComplexity: 1.0,
      metrics: {
        accuracy: result.accuracy,
        precision: result.accuracy * 0.95,
        recall: result.accuracy * 0.9,
        f1_score: result.accuracy * 0.92,
        mae: 0.1 + Math.random() * 0.05,
        rmse: 0.15 + Math.random() * 0.05
      }
    };

    setEvaluation(evaluationResult);
    setIsEvaluating(false);
    setCurrentStep('result');
  };

  // 提出
  const handleSubmit = async () => {
    if (!evaluation) return;

    setIsSubmitting(true);
    
    const submission = {
      problemId: problem.id,
      model: selectedModel,
      features: selectedFeatures,
      hyperparameters,
      evaluation,
      dataSplit: dataSplitSettings,
      timestamp: new Date().toISOString()
    };

    try {
      await onSubmit(submission);
      alert('提出が完了しました！');
    } catch (error) {
      alert('提出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{problem.title}</h1>
              <p className="text-white/70">{problem.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/70">
              残り時間: {problem.timeLimit ? `${Math.floor(problem.timeLimit / 60)}分` : '無制限'}
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : ['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].indexOf(currentStep) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white/50'
                }`}>
                  {index + 1}
                </div>
                {index < 6 && (
                  <div className={`w-8 h-0.5 ${
                    ['data', 'preprocessing', 'features', 'model', 'train', 'evaluate', 'result'].indexOf(currentStep) > index
                      ? 'bg-green-600'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {currentStep === 'data' && dataset && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">データ探索</h2>
              <DataExplorer dataset={dataset} />
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('preprocessing')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  次へ: 前処理
                </button>
              </div>
            </div>
          )}

          {currentStep === 'preprocessing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">前処理</h2>
              <PreprocessingTab
                dataset={dataset}
                onPreprocess={(processed: any) => setPreprocessedDataset(processed)}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('data')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: データ探索
                </button>
                <button
                  onClick={() => setCurrentStep('features')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  次へ: 特徴量選択
                </button>
              </div>
            </div>
          )}

          {currentStep === 'features' && preprocessedDataset && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">特徴量選択</h2>
              <FeatureSelector
                dataset={preprocessedDataset}
                selectedFeatures={selectedFeatures}
                onFeaturesChange={setSelectedFeatures}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('preprocessing')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: 前処理
                </button>
                <button
                  onClick={() => setCurrentStep('model')}
                  disabled={selectedFeatures.length === 0}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                >
                  次へ: モデル選択
                </button>
              </div>
            </div>
          )}

          {currentStep === 'model' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">モデル選択</h2>
              <HyperparameterPanel
                modelType={selectedModel}
                parameters={hyperparameters}
                onParametersChange={setHyperparameters}
                onClose={() => {}}
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('features')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  戻る: 特徴量選択
                </button>
                <button
                  onClick={handleTrain}
                  disabled={!selectedModel}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                >
                  学習開始
                </button>
              </div>
            </div>
          )}

          {currentStep === 'train' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">学習中</h2>
              {trainingProgress && <TrainingProgressComponent progress={trainingProgress} />}
            </div>
          )}

          {currentStep === 'evaluate' && result && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">評価</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">学習結果</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{result.accuracy.toFixed(3)}</div>
                    <div className="text-white/70">精度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{result.loss.toFixed(3)}</div>
                    <div className="text-white/70">損失</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  {isEvaluating ? '評価中...' : '評価実行'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'result' && evaluation && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">結果</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">評価結果</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{evaluation.metrics.precision?.toFixed(3) || '0.000'}</div>
                    <div className="text-white/70">適合率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{evaluation.metrics.f1_score?.toFixed(3) || '0.000'}</div>
                    <div className="text-white/70">F1スコア</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg font-bold transition-colors"
                >
                  {isSubmitting ? '提出中...' : '結果を提出'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
