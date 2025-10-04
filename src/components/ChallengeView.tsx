import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Loader, ChevronRight, Eye, Sparkles, Trophy, Filter } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import { getDatasetForRegion } from '../data/datasets';
import { createModel } from '../utils/mlModels';
import { updateRegionProgress, saveAttempt, unlockRegion } from '../lib/database';
import type { Dataset, ModelResult, TrainingProgress, DataPoint } from '../types/ml';
import { DataExplorer } from './DataExplorer';
import { PreprocessingTab } from './PreprocessingTab';
import { FeatureSelector } from './FeatureSelector';
import { ModelSelector } from './ModelSelector';
import { TrainingProgress as TrainingProgressComponent } from './TrainingProgress';
import { ResultsDashboard } from './ResultsDashboard';

type Step = 'data' | 'preprocessing' | 'features' | 'model' | 'train' | 'result';

export function ChallengeView() {
  const { user, regions, progress, selectedRegion, setCurrentView, refreshProgress } = useGameState();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [originalDataset, setOriginalDataset] = useState<Dataset | null>(null);
  const [preprocessedDataset, setPreprocessedDataset] = useState<Dataset | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('logistic_regression');
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [result, setResult] = useState<ModelResult | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('data');

  const region = regions.find(r => r.id === selectedRegion);
  const regionProgress = selectedRegion ? progress[selectedRegion] : null;

  useEffect(() => {
    if (selectedRegion && region) {
      console.log('Loading dataset for region:', selectedRegion);
      const data = getDatasetForRegion(selectedRegion);
      console.log('Dataset loaded:', { 
        hasData: !!data, 
        trainLength: data?.train?.length,
        hasRaw: !!data?.raw,
        featureNames: data?.featureNames 
      });
      setOriginalDataset(data);
      setDataset(data);
      setPreprocessedDataset(data);
      setSelectedFeatures(data.featureNames.map((_, i) => i));
      setResult(null);
      setTrainingProgress(null);
      setCurrentStep('data');

      if (region.problem_type === 'classification') {
        const numClasses = data.classes?.length || 2;
        if (numClasses > 2) {
          setSelectedModel('neural_network');
        } else {
          setSelectedModel('logistic_regression');
        }
      } else if (region.problem_type === 'regression') {
        setSelectedModel('linear_regression');
      } else {
        setSelectedModel('logistic_regression');
      }

      setParameters({});
    }
  }, [selectedRegion, region]);

  useEffect(() => {
    if (preprocessedDataset && selectedFeatures.length > 0) {
      const filterFeatures = (point: DataPoint): DataPoint => ({
        features: selectedFeatures.map(i => point.features[i]),
        label: point.label
      });

      const filteredDataset: Dataset = {
        train: preprocessedDataset.train.map(filterFeatures),
        test: preprocessedDataset.test.map(filterFeatures),
        featureNames: selectedFeatures.map(i => preprocessedDataset.featureNames[i]),
        labelName: preprocessedDataset.labelName,
        classes: preprocessedDataset.classes,
        raw: preprocessedDataset.raw
      };

      setDataset(filteredDataset);
    }
  }, [selectedFeatures, preprocessedDataset]);

  const handlePreprocess = (processed: Dataset) => {
    console.log('handlePreprocess called with:', { 
      hasProcessed: !!processed, 
      trainLength: processed?.train?.length,
      featureNames: processed?.featureNames 
    });
    setPreprocessedDataset(processed);
    setDataset(processed);
    setSelectedFeatures(processed.featureNames.map((_, i) => i));
    setCurrentStep('features');
  };

  const handleTrain = async () => {
    if (!dataset || !user || !selectedRegion) return;

    setIsTraining(true);
    setResult(null);
    setTrainingProgress(null);
    setCurrentStep('train');

    try {
      const model = createModel(selectedModel);

      await model.train(dataset, parameters, (progress) => {
        setTrainingProgress(progress);
      });

      const evaluation = model.evaluate(dataset);
      setResult(evaluation);

      await saveAttempt({
        user_id: user.id,
        region_id: selectedRegion,
        model_type: selectedModel,
        parameters,
        accuracy: evaluation.accuracy,
        precision: evaluation.precision || null,
        recall: evaluation.recall || null,
        f1_score: evaluation.f1_score || null,
        training_time: evaluation.training_time,
      });

      const currentBest = regionProgress?.best_accuracy || 0;
      if (evaluation.accuracy > currentBest) {
        let stars = 0;
        const requiredAccuracy = region?.required_accuracy || 0.8;
        if (evaluation.accuracy >= requiredAccuracy) {
          stars = 1;
          if (evaluation.accuracy >= requiredAccuracy + 0.05) stars = 2;
          if (evaluation.accuracy >= requiredAccuracy + 0.1) stars = 3;
        }

        const isCompleted = evaluation.accuracy >= requiredAccuracy;

        await updateRegionProgress(user.id, selectedRegion, {
          is_completed: isCompleted,
          best_accuracy: evaluation.accuracy,
          stars,
          attempts: (regionProgress?.attempts || 0) + 1,
          last_attempt_at: new Date().toISOString(),
        });

        if (isCompleted && region?.unlock_condition === null) {
          const nextRegion = regions.find(r => r.unlock_condition === selectedRegion);
          if (nextRegion) {
            await unlockRegion(user.id, nextRegion.id);
          }
        }

        await refreshProgress();
      }

      setCurrentStep('result');
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  if (!region || !dataset || !originalDataset || !preprocessedDataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'data' as Step, label: 'データを見る', icon: Eye, completed: currentStep !== 'data' },
    { id: 'preprocessing' as Step, label: '前処理', icon: Filter, completed: currentStep === 'features' || currentStep === 'model' || currentStep === 'train' || currentStep === 'result' },
    { id: 'features' as Step, label: '特徴を選ぶ', icon: Filter, completed: currentStep === 'model' || currentStep === 'train' || currentStep === 'result' },
    { id: 'model' as Step, label: 'モデルを選ぶ', icon: Sparkles, completed: currentStep === 'train' || currentStep === 'result' },
    { id: 'train' as Step, label: '学習する', icon: Play, completed: currentStep === 'result' },
    { id: 'result' as Step, label: '結果を見る', icon: Trophy, completed: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
          <div className="p-6" style={{ background: 'linear-gradient(to right, var(--accent-strong), var(--accent))' }}>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView('map')}
                className="flex items-center space-x-2 text-yellow-100 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">マップに戻る</span>
              </button>
              <div className="text-center flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {region.name}の課題
                </h1>
                <p className="text-sm mt-1 text-white/85">{region.daimyo}</p>
              </div>
              <div className="w-32" />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap md:space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCurrent = currentStep === step.id;
                const isClickable = step.completed || isCurrent;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => isClickable && setCurrentStep(step.id)}
                      disabled={!isClickable}
                      className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all border-2 ${
                        isCurrent
                          ? 'bg-white shadow-lg scale-105'
                          : step.completed
                          ? 'bg-white/30 text-white hover:bg-white/40 border-white/40'
                          : 'bg-white/10 text-white/60 cursor-not-allowed border-white/20'
                      }`}
                      style={{ 
                        color: isCurrent ? '#1e3a8a' : undefined,
                        borderColor: isCurrent ? 'var(--gold)' : undefined
                      }}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm font-medium hidden sm:inline">
                        {step.label}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/50 mx-1 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 md:p-6 border-2 border-yellow-200">
              <h2 className="text-lg font-bold text-gray-900 mb-2">課題の説明</h2>
              <p className="text-gray-800 leading-relaxed mb-3">
                {region.problem_description}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-medium">目標:</span>
                  <span className="font-bold text-green-700">
                    正解率 {(region.required_accuracy * 100).toFixed(0)}% 以上
                  </span>
                </div>
                {regionProgress?.best_accuracy && regionProgress.best_accuracy > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 font-medium">自己ベスト:</span>
                    <span className="font-bold text-blue-700">
                      {(regionProgress.best_accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {currentStep === 'data' && (
              <div className="space-y-6">
                <DataExplorer dataset={originalDataset} />
                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep('preprocessing')}
                    className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
                  >
                    <span>次へ：前処理</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'preprocessing' && originalDataset && (
              <div className="space-y-6">
                <PreprocessingTab
                  dataset={originalDataset}
                  onPreprocessedDataset={handlePreprocess}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('data')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る：データを見る</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('features')}
                    className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
                  >
                    <span>前処理なしで次へ：特徴を選ぶ</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'features' && dataset && (
              <div className="space-y-6">
                <FeatureSelector
                  dataset={dataset}
                  selectedFeatures={selectedFeatures}
                  onFeaturesChange={setSelectedFeatures}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('data')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る：データを見る</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('model')}
                    disabled={selectedFeatures.length === 0}
                    className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
                  >
                    <span>次へ：モデルを選ぶ</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'model' && (
              <div className="space-y-6">
                <ModelSelector
                  regionType={region.problem_type}
                  selectedModel={selectedModel}
                  parameters={parameters}
                  onModelChange={setSelectedModel}
                  onParametersChange={setParameters}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('features')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>戻る：特徴を選ぶ</span>
                  </button>
                  <button
                    onClick={handleTrain}
                    disabled={isTraining}
                    className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(to right, #6ea36f, #3f7d4a)' }}
                  >
                    <Play className="w-5 h-5" />
                    <span>学習を開始</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'train' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
                  <div className="text-center mb-6">
                    <Loader className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">学習中...</h3>
                    <p className="text-gray-600">
                      モデルがデータから学んでいます。しばらくお待ちください。
                    </p>
                  </div>
                  {trainingProgress && <TrainingProgressComponent progress={trainingProgress} />}
                </div>
              </div>
            )}

            {currentStep === 'result' && result && (
              <div className="space-y-6">
                <ResultsDashboard
                  result={result}
                  dataset={dataset}
                  requiredAccuracy={region.required_accuracy}
                  modelType={selectedModel}
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('features')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>特徴を変えて再挑戦</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('map')}
                    className="flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-strong))' }}
                  >
                    <span>マップに戻る</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
