// シンプルで確実に動作する機械学習ワークフロー

import { useState, useEffect } from 'react';
import { Play, BarChart3, Settings, Upload, ArrowLeft, RefreshCw, Trophy, CheckSquare } from 'lucide-react';
import { EDAPanel } from './EDAPanel';
import { simpleDataManager, type SimpleDataset, type ProcessedDataset } from '../utils/simpleDataManager';
import { simpleMLManager, type SimpleModel, type TrainingResult, type ValidationResult } from '../utils/simpleMLManager';
import { realtimeSystem, type LeaderboardEntry, type ChatMessage, type Participant, type WeeklyProblem } from '../utils/realtimeSystem';
import { weeklyProblemSystem, type WeeklyProblem as WeeklyProblemType } from '../utils/weeklyProblemSystem';
import { scoringSystem } from '../utils/scoringSystem';

interface SimpleMLWorkflowProps {
  onBack: () => void;
}

type Step = 'data' | 'eda' | 'preprocessing' | 'feature_engineering' | 'feature_selection' | 'data_split' | 'model_selection' | 'validation' | 'submission';

export function SimpleMLWorkflow({ onBack }: SimpleMLWorkflowProps) {
  // 基本状態
  const [currentStep, setCurrentStep] = useState<Step>('data');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // データ関連
  const [currentDataset, setCurrentDataset] = useState<SimpleDataset | null>(null);
  const [processedDataset, setProcessedDataset] = useState<ProcessedDataset | null>(null);
  const [dataSplit, setDataSplit] = useState<{
    train: { data: number[][], targets: number[] };
    validation: { data: number[][], targets: number[] };
    test: { data: number[][], targets: number[] };
  } | null>(null);
  const [trainRatio, setTrainRatio] = useState(0.7);
  const [validationRatio, setValidationRatio] = useState(0.2);
  const [testRatio, setTestRatio] = useState(0.1);
  
  // モデル関連
  const [availableModels, setAvailableModels] = useState<SimpleModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<SimpleModel | null>(null);
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({});
  
  // 学習・検証結果
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [testResult, setTestResult] = useState<ValidationResult | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // 特徴エンジニアリング関連
  const [featureEngineeringOptions, setFeatureEngineeringOptions] = useState({
    transformations: {
      polynomial: false,
      interaction: false,
      log: false,
      sqrt: false,
      square: false
    },
    aggregations: {
      mean: false,
      std: false,
      max: false,
      min: false,
      count: false
    },
    dimensionalityReduction: {
      method: 'none' as 'none' | 'pca' | 'lda' | 'tsne',
      components: 2
    }
  });

  // 特徴量選択関連
  const [featureSelectionOptions, setFeatureSelectionOptions] = useState({
    method: 'correlation' as 'correlation' | 'importance' | 'manual' | 'variance' | 'mutual_info',
    threshold: 0.1,
    maxFeatures: 10,
    selectedFeatures: [] as number[]
  });

  // 前処理関連
  const [preprocessingOptions, setPreprocessingOptions] = useState({
    missingValueStrategy: 'remove' as 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill' | 'interpolate' | 'knn',
    selectedMissingColumns: [] as number[],
    outlierStrategy: 'none' as 'none' | 'iqr' | 'zscore' | 'isolation_forest' | 'local_outlier_factor',
    outlierThreshold: 1.5,
    selectedOutlierColumns: [] as number[],
    scalingStrategy: 'none' as 'none' | 'minmax' | 'standard' | 'robust' | 'maxabs' | 'quantile',
    selectedScalingColumns: [] as number[],
    categoricalEncoding: undefined as 'label' | 'onehot' | 'target' | 'binary' | 'hash' | 'frequency' | 'ordinal' | undefined,
    selectedCategoricalColumns: [] as number[]
  });

  // リアルタイム機能
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentProblem, setCurrentProblem] = useState<WeeklyProblem | null>(null);
  const [weeklyProblem, setWeeklyProblem] = useState<WeeklyProblemType | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('ユーザー');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  
  // EDA表示制御
  const [showProcessedData, setShowProcessedData] = useState(false);

  // ユーザー名を取得
  useEffect(() => {
    const getUserName = () => {
      const storageKey = 'ml_battle_user_id';
      const userId = localStorage.getItem(storageKey);
      
      if (userId) {
        // 既存のユーザーIDからプレイヤー名を生成（一貫性のため）
        const adjectives = ['Swift', 'Bright', 'Sharp', 'Bold', 'Quick', 'Smart', 'Wise', 'Strong', 'Fast', 'Cool'];
        const nouns = ['Warrior', 'Ninja', 'Master', 'Expert', 'Wizard', 'Hero', 'Champion', 'Legend', 'Pro', 'Ace'];
        
        // ユーザーIDから一貫したプレイヤー名を生成
        const hash = userId.split('_').pop() || '';
        const adjectiveIndex = parseInt(hash.substring(0, 2), 36) % adjectives.length;
        const nounIndex = parseInt(hash.substring(2, 4), 36) % nouns.length;
        const number = parseInt(hash.substring(4, 7), 36) % 999 + 1;
        
        const playerName = `${adjectives[adjectiveIndex]}${nouns[nounIndex]}${number}`;
        setUsername(playerName);
      } else {
        // 新しいユーザーIDを生成
        const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(storageKey, newUserId);
        
        const adjectives = ['Swift', 'Bright', 'Sharp', 'Bold', 'Quick', 'Smart', 'Wise', 'Strong', 'Fast', 'Cool'];
        const nouns = ['Warrior', 'Ninja', 'Master', 'Expert', 'Wizard', 'Hero', 'Champion', 'Legend', 'Pro', 'Ace'];
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        
        setUsername(`${adjective}${noun}${number}`);
      }
    };

    getUserName();
  }, []);

  // 初期化
  useEffect(() => {
    loadAvailableModels();
    loadRandomDataset();
    loadRealtimeData();
    loadWeeklyProblem();
    updateParticipantStatus('online');
    
    // リアルタイム更新の登録
    const unsubscribe = realtimeSystem.onUpdate(() => {
      loadRealtimeData();
    });

    // 週次問題更新を購読
    weeklyProblemSystem.onProblemUpdate((problem) => {
      setWeeklyProblem(problem);
      // 問題が変更されたらモデルも更新
      if (problem) {
        loadAvailableModels();
      }
    });

    // スコアリングシステム更新を購読
    scoringSystem.onLeaderboardUpdate((leaderboard) => {
      // scoringSystemのLeaderboardEntryをrealtimeSystemの形式に変換
      const convertedLeaderboard = leaderboard.map((entry, index) => ({
        id: entry.userId,
        username: entry.teamName,
        score: entry.publicScore,
        accuracy: entry.publicScore,
        modelName: entry.modelName,
        timestamp: entry.lastSubmission.getTime(),
        rank: entry.rank
      }));
      setLeaderboard(convertedLeaderboard);
    });

    // タイマーを開始
    const timer = setInterval(() => {
      setTimeRemaining(weeklyProblemSystem.getTimeRemaining());
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // リアルタイムデータの読み込み
  const loadRealtimeData = () => {
    setLeaderboard(realtimeSystem.getLeaderboard());
    setChatMessages(realtimeSystem.getChatMessages());
    setParticipants(realtimeSystem.getParticipants());
    setCurrentProblem(realtimeSystem.getCurrentProblem());
  };

  // 週次問題の読み込み
  const loadWeeklyProblem = () => {
    const problem = weeklyProblemSystem.getCurrentProblem();
    setWeeklyProblem(problem);
    
    // 問題が変更されたらモデルも更新
    if (problem) {
      loadAvailableModels();
    }
  };

  // 利用可能なモデルを読み込み
  const loadAvailableModels = () => {
    const allModels = simpleMLManager.getAvailableModels();
    
    // 週次問題のタイプを優先し、なければデータセットのタイプを使用
    let problemType = null;
    if (weeklyProblem) {
      problemType = weeklyProblem.type;
    } else if (currentDataset) {
      problemType = currentDataset.type;
    }
    
    if (problemType) {
      const filteredModels = allModels.filter(model => model.type === problemType);
      setAvailableModels(filteredModels);
      console.log(`問題タイプ "${problemType}" に基づいて ${filteredModels.length} 個のモデルを表示`);
    } else {
      setAvailableModels(allModels);
      console.log('すべてのモデルを表示');
    }
  };

  // 特徴量の型を判定する関数
  const getFeatureTypes = (dataset: any) => {
    if (!dataset || !dataset.data || dataset.data.length === 0) {
      return dataset?.featureNames?.map(() => 'numerical') || [];
    }
    
    return dataset.featureNames.map((_: string, index: number) => {
      // データセットにfeatureTypesが定義されている場合はそれを使用
      if (dataset.featureTypes && dataset.featureTypes[index]) {
        return dataset.featureTypes[index];
      }
      
      // データから型を推定
      const values = dataset.data.map((row: any[]) => row[index]).filter((val: any) => val !== null && val !== undefined && val !== '');
      if (values.length === 0) return 'numerical';
      
      // 全ての値が数値かチェック
      const allNumeric = values.every((val: any) => typeof val === 'number' || !isNaN(Number(val)));
      if (allNumeric) return 'numerical';
      
      // 文字列の場合はカテゴリカル
      return 'categorical';
    });
  };

  // ランダムなデータセットを読み込み
  const loadRandomDataset = () => {
    setLoading(true);
    setError(null);
    
    try {
      // 週次問題のタイプに基づいてデータセットを生成
      let datasetType = 'random';
      if (weeklyProblem) {
        if (weeklyProblem.type === 'classification') {
          datasetType = 'classification';
        } else if (weeklyProblem.type === 'regression') {
          datasetType = 'regression';
        }
      } else {
        // 週次問題がない場合はランダムに選択
        datasetType = Math.random() > 0.5 ? 'classification' : 'regression';
      }
      
      const dataset = simpleDataManager.generateDataset(datasetType as 'classification' | 'regression');
      
      if (!dataset || !dataset.data || dataset.data.length === 0) {
        throw new Error('データセットの生成に失敗しました');
      }
      
      setCurrentDataset(dataset);
      simpleDataManager.setCurrentDataset(dataset);
      setCurrentStep('eda');
      updateParticipantStatus('online');
      
      // データセットが読み込まれたら、適切なモデルを読み込み
      loadAvailableModels();
      
      console.log(`データセットタイプ "${datasetType}" でデータセットを生成:`, dataset.name);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データセットの読み込みに失敗しました';
      setError(errorMessage);
      console.error('Dataset loading error:', err);
    } finally {
      setLoading(false);
    }
  };


  // 前処理をスキップして特徴エンジニアリングに進む
  const skipPreprocessing = () => {
    setProcessedDataset(null); // 前処理済みデータをクリア
    setCurrentStep('feature_engineering');
  };

  // 欠損値処理を実行
  const executeMissingValueProcessing = () => {
    if (!currentDataset) {
      setError('データセットが選択されていません');
      return;
    }

    try {
      const options = {
        missingValueStrategy: preprocessingOptions.missingValueStrategy,
        selectedFeatures: preprocessingOptions.selectedMissingColumns.length > 0 
          ? preprocessingOptions.selectedMissingColumns 
          : undefined,
        updateRawData: true // 生データも更新
      };
      
      const processed = simpleDataManager.processData(options);
      setProcessedDataset(processed);
      setShowProcessedData(true);
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '欠損値処理に失敗しました';
      setError(errorMessage);
      console.error('Missing value processing error:', err);
    }
  };

  // 外れ値処理を実行
  const executeOutlierProcessing = () => {
    if (!currentDataset) {
      setError('データセットが選択されていません');
      return;
    }

    try {
      const options = {
        outlierStrategy: preprocessingOptions.outlierStrategy,
        outlierThreshold: preprocessingOptions.outlierThreshold,
        selectedFeatures: preprocessingOptions.selectedOutlierColumns.length > 0 
          ? preprocessingOptions.selectedOutlierColumns 
          : undefined,
        updateRawData: true // 生データも更新
      };
      
      const processed = simpleDataManager.processData(options);
      setProcessedDataset(processed);
      setShowProcessedData(true);
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '外れ値処理に失敗しました';
      setError(errorMessage);
      console.error('Outlier processing error:', err);
    }
  };

  // 正規化・標準化を実行
  const executeScalingProcessing = () => {
    if (!currentDataset) {
      setError('データセットが選択されていません');
      return;
    }

    try {
      const options = {
        scalingStrategy: preprocessingOptions.scalingStrategy,
        selectedFeatures: preprocessingOptions.selectedScalingColumns.length > 0 
          ? preprocessingOptions.selectedScalingColumns 
          : undefined,
        updateRawData: true // 生データも更新
      };
      
      const processed = simpleDataManager.processData(options);
      setProcessedDataset(processed);
      setShowProcessedData(true);
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '正規化・標準化に失敗しました';
      setError(errorMessage);
      console.error('Scaling processing error:', err);
    }
  };

  // カテゴリカルエンコーディングを実行
  const executeCategoricalEncoding = () => {
    if (!currentDataset) {
      setError('データセットが選択されていません');
      return;
    }

    try {
      const options = {
        categoricalEncoding: preprocessingOptions.categoricalEncoding,
        selectedFeatures: preprocessingOptions.selectedCategoricalColumns.length > 0 
          ? preprocessingOptions.selectedCategoricalColumns 
          : undefined,
        updateRawData: true // 生データも更新
      };
      
      const processed = simpleDataManager.processData(options);
      setProcessedDataset(processed);
      setShowProcessedData(true);
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'カテゴリカルエンコーディングに失敗しました';
      setError(errorMessage);
      console.error('Categorical encoding error:', err);
    }
  };

  // すべての前処理を実行
  const executeAllPreprocessing = () => {
    if (!currentDataset) {
      setError('データセットが選択されていません');
      return;
    }

    try {
      const options = {
        missingValueStrategy: preprocessingOptions.missingValueStrategy,
        outlierStrategy: preprocessingOptions.outlierStrategy,
        outlierThreshold: preprocessingOptions.outlierThreshold,
        scalingStrategy: preprocessingOptions.scalingStrategy,
        categoricalEncoding: preprocessingOptions.categoricalEncoding,
        selectedFeatures: [
          ...preprocessingOptions.selectedMissingColumns,
          ...preprocessingOptions.selectedOutlierColumns,
          ...preprocessingOptions.selectedScalingColumns,
          ...preprocessingOptions.selectedCategoricalColumns
        ].filter((value, index, self) => self.indexOf(value) === index), // 重複を除去
        updateRawData: true // 生データも更新
      };
      
      const processed = simpleDataManager.processData(options);
      setProcessedDataset(processed);
      setShowProcessedData(true);
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
      
      setCurrentStep('feature_engineering');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '前処理に失敗しました';
      setError(errorMessage);
      console.error('All preprocessing error:', err);
    }
  };

  // ワークフローをリセット
  const resetWorkflow = () => {
    setCurrentStep('eda');
    setCurrentDataset(null);
    setProcessedDataset(null);
    setDataSplit(null);
    setSelectedModel(null);
    setTrainingResult(null);
    setValidationResult(null);
    setTestResult(null);
    setError(null);
    setLoading(false);
    setFeatureEngineeringOptions({
      transformations: {
        polynomial: false,
        interaction: false,
        log: false,
        sqrt: false,
        square: false,
      },
      aggregations: {
        mean: false,
        std: false,
        max: false,
        min: false,
        count: false,
      },
      dimensionalityReduction: {
        method: 'none' as 'none' | 'pca' | 'lda' | 'tsne',
        components: 2
      }
    });
    setFeatureSelectionOptions({
      method: 'correlation',
      threshold: 0.1,
      maxFeatures: 10,
      selectedFeatures: []
    });
    
    // データマネージャーとMLマネージャーもリセット
    simpleDataManager.reset();
    simpleMLManager.reset();
    
    // 新しいランダムデータセットを読み込み
    loadRandomDataset();
    updateParticipantStatus('online');
  };

  // 特徴エンジニアリングを実行
  const executeFeatureEngineering = () => {
    if (!processedDataset) {
      setError('前処理済みデータがありません');
      return;
    }

    try {
      const result = simpleDataManager.executeFeatureEngineering({
        selectedFeatures: Array.from({ length: processedDataset.featureNames.length }, (_, i) => i),
        transformations: featureEngineeringOptions.transformations,
        aggregations: featureEngineeringOptions.aggregations,
        dimensionalityReduction: featureEngineeringOptions.dimensionalityReduction
      });
      setProcessedDataset(result);
      setShowProcessedData(true); // 加工済みデータを表示
      
      // 生データも更新
      const updatedDataset = simpleDataManager.getCurrentDataset();
      if (updatedDataset) {
        setCurrentDataset(updatedDataset);
      }
      
      setCurrentStep('feature_selection');
    } catch (err) {
      setError('特徴エンジニアリングに失敗しました');
      console.error('Feature engineering error:', err);
    }
  };

  // 特徴量選択を実行
  const executeFeatureSelection = () => {
    if (!processedDataset && !currentDataset) {
      setError('データがありません');
      return;
    }

    try {
      // 前処理済みデータがある場合はそれを使用、ない場合は生データを使用
      const sourceDataset = processedDataset || currentDataset;
      if (!sourceDataset) {
        setError('データがありません');
        return;
      }

      const result = simpleDataManager.selectFeatures(featureSelectionOptions);
      setProcessedDataset(result);
      setShowProcessedData(true); // 加工済みデータを表示
      setCurrentStep('data_split');
    } catch (err) {
      setError('特徴量選択に失敗しました');
      console.error('Feature selection error:', err);
    }
  };

  // データ分割を実行
  const executeDataSplit = () => {
    if (!processedDataset && !currentDataset) {
      setError('データがありません。前処理を実行するか、データを読み込んでください。');
      return;
    }
    
    try {
      const split = simpleDataManager.splitData(trainRatio, validationRatio, testRatio);
      setDataSplit(split);
      setCurrentStep('model_selection');
    } catch (err) {
      setError('データ分割に失敗しました');
      console.error('Data split error:', err);
    }
  };

  // モデルを選択
  const selectModel = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setHyperparameters({ ...model.hyperparameters });
    }
  };

  // ハイパーパラメータを更新
  const updateHyperparameter = (key: string, value: any) => {
    setHyperparameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 学習を実行
  const startTraining = async () => {
    if (!selectedModel) {
      setError('モデルを選択してください');
      return;
    }
    
    if (!dataSplit) {
      setError('データが分割されていません。データ分割を実行してください。');
      return;
    }

    setIsTraining(true);
    setError(null);
    updateParticipantStatus('training');

    try {
      // モデルを選択
      simpleMLManager.selectModel(selectedModel.id);
      simpleMLManager.updateHyperparameters(hyperparameters);
      
      // 学習データを設定
      simpleMLManager.setTrainingData(dataSplit.train);
      simpleMLManager.setValidationData(dataSplit.validation);
      simpleMLManager.setTestData(dataSplit.test);
      
      // 学習を実行
      const result = await simpleMLManager.train();
      setTrainingResult(result);
      setCurrentStep('validation');
      updateParticipantStatus('online');
    } catch (err) {
      setError('学習に失敗しました');
      console.error('Training error:', err);
    } finally {
      setIsTraining(false);
    }
  };

  // 検証を実行
  const executeValidation = async () => {
    if (!selectedModel) {
      setError('モデルが選択されていません');
      return;
    }

    setIsValidating(true);
    setError(null);
    updateParticipantStatus('validating');

    try {
      // 検証結果をクリアしてから新しい検証を実行
      setValidationResult(null);
      const result = await simpleMLManager.validate();
      setValidationResult(result);
      setCurrentStep('submission');
      updateParticipantStatus('online');
    } catch (err) {
      setError('検証に失敗しました');
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };


  // 結果を提出（テスト評価を自動実行）
  const submitResults = async () => {
    if (!selectedModel || !weeklyProblem) {
      setError('モデルまたは問題がありません');
      return;
    }

    setIsEvaluating(true);
    setError(null);
    updateParticipantStatus('validating');

    try {
      // テストデータで自動評価を実行
      const testResult = await simpleMLManager.evaluateOnTestData();
      setTestResult(testResult);

      const result = simpleMLManager.submitResults();
      if (result.success) {
        // スコアリングシステムに提出
        scoringSystem.addSubmission({
          userId: username,
          problemId: weeklyProblem.id,
          modelName: selectedModel.name,
          score: testResult.accuracy,
          publicScore: 0, // 後で計算される
          privateScore: 0, // 後で計算される
          metadata: {
            hyperparameters: hyperparameters,
            preprocessing: processedDataset?.processingSteps || [],
            featureEngineering: featureEngineeringOptions.transformations ? 
              Object.keys(featureEngineeringOptions.transformations).filter(
                key => featureEngineeringOptions.transformations[key as keyof typeof featureEngineeringOptions.transformations]
              ) : [],
            trainingTime: trainingResult?.trainingTime || 0,
            validationTime: 0,
          }
        });
        
        // リアルタイムシステムにも追加（テストスコアを使用）
        const score = testResult.accuracy * 100;
        realtimeSystem.addScore(username, score, testResult.accuracy, selectedModel.name);
        
        // 参加者ステータスを更新
        realtimeSystem.updateParticipantStatus(username, 'online', 'submission');
        
        alert(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('提出に失敗しました');
      console.error('Submission error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // チャットメッセージ送信
  const sendMessage = () => {
    if (newMessage.trim()) {
      realtimeSystem.sendMessage(username, newMessage.trim());
      setNewMessage('');
    }
  };

  // 参加者ステータス更新
  const updateParticipantStatus = (status: Participant['status']) => {
    realtimeSystem.updateParticipantStatus(username, status, currentStep);
  };

  // ステップのナビゲーション
  const steps = [
    { id: 'data', name: 'データ選択', icon: BarChart3 },
    { id: 'eda', name: 'EDA', icon: BarChart3 },
    { id: 'preprocessing', name: '前処理', icon: Settings },
    { id: 'feature_engineering', name: '特徴エンジニアリング', icon: Settings },
    { id: 'feature_selection', name: '特徴量選択', icon: Settings },
    { id: 'data_split', name: 'データ分割', icon: Settings },
    { id: 'model_selection', name: 'モデル選択・学習', icon: Play },
    { id: 'validation', name: '検証', icon: CheckSquare },
    { id: 'submission', name: '提出', icon: Upload }
  ];

  // const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);
  
  // ステップの完了状態を判定（無効化）
  const isStepCompleted = (stepId: string) => {
    return false; // 完了状態の表示を無効化
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>戻る</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold">機械学習ワークフロー</h1>
                {weeklyProblem && (
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <span className="bg-blue-600/20 px-2 py-1 rounded">
                      {weeklyProblem.title}
                    </span>
                    <span className="bg-green-600/20 px-2 py-1 rounded">
                      {weeklyProblem.evaluation.metric}
                    </span>
                    <span className="bg-red-600/20 px-2 py-1 rounded">
                      残り: {timeRemaining.days > 0 ? `${timeRemaining.days}日 ` : ''}{timeRemaining.hours}時間 {timeRemaining.minutes}分
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5" />
                <span>リーダーボード</span>
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <span>💬</span>
                <span>チャット</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* リーダーボードモーダル */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">リーダーボード</h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                      </span>
                      <div>
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-sm text-white/60">{entry.modelName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{entry.score.toFixed(2)}</div>
                      <div className="text-sm text-white/60">{(entry.accuracy * 100).toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* チャットモーダル */}
        {showChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">チャット</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'system'
                        ? 'bg-blue-500/20 text-blue-300'
                        : message.username === username
                        ? 'bg-green-500/20 text-green-300 ml-8'
                        : 'bg-white/5 text-white mr-8'
                    }`}
                  >
                    <div className="font-semibold text-sm">{message.username}</div>
                    <div>{message.message}</div>
                    <div className="text-xs opacity-60">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-white/60"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー - ステップナビゲーション */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-6">ワークフロー</h2>
              <div className="space-y-2">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id as Step)}
                      disabled={false}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{step.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* リセットボタン */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={resetWorkflow}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">ワークフローをリセット</span>
                </button>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="ml-3">読み込み中...</span>
                </div>
              )}

              {/* データ選択ステップ */}
              {currentStep === 'data' && currentDataset && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">データセット選択</h2>
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">{currentDataset.name}</h3>
                    <p className="text-white/70 mb-4">{currentDataset.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">タイプ:</span>
                        <span className="ml-2 text-white">
                          {currentDataset.type === 'classification' ? '分類' : '回帰'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">サンプル数:</span>
                        <span className="ml-2 text-white">{currentDataset.data.length}</span>
                      </div>
                      <div>
                        <span className="text-white/60">特徴量数:</span>
                        <span className="ml-2 text-white">{currentDataset.featureNames.length}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep('eda')}
                      className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      データを確認
                    </button>
                  </div>
                </div>
              )}

              {/* EDAステップ */}
              {currentStep === 'eda' && currentDataset && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">探索的データ分析 (EDA)</h2>
                  
                  {/* データ状態表示 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-white/80 text-sm">
                        データ表示
                      </span>
                      {processedDataset && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          前処理済み
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setShowProcessedData(!showProcessedData);
                        }}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                      >
                        {showProcessedData ? '元データ表示' : '処理後データ表示'}
                      </button>
                    </div>
                  </div>

                  {/* EDAパネル */}
                  <EDAPanel
                    data={currentDataset.data.map((row, i) => ({
                      features: row,
                      target: currentDataset.targetValues[i] || 0
                    }))}
                    problemType={currentDataset.type}
                    featureNames={currentDataset.featureNames}
                    displayFeatureTypes={getFeatureTypes(currentDataset)}
                    showProcessedData={showProcessedData}
                    processedDataset={processedDataset}
                    currentDataset={currentDataset}
                  />

                  <div className="flex justify-between">
                    <button
                      onClick={skipPreprocessing}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      前処理をスキップ
                    </button>
                    <button
                      onClick={() => setCurrentStep('preprocessing')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      前処理に進む
                    </button>
                  </div>
                </div>
              )}

              {/* 前処理ステップ */}
              {currentStep === 'preprocessing' && currentDataset && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">前処理</h2>
                  
                  {/* 欠損値処理 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">欠損値処理</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">処理方法</label>
                        <select 
                          value={preprocessingOptions.missingValueStrategy}
                          onChange={(e) => setPreprocessingOptions(prev => ({
                            ...prev,
                            missingValueStrategy: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="remove">削除</option>
                          <option value="mean">平均値で埋める</option>
                          <option value="median">中央値で埋める</option>
                          <option value="mode">最頻値で埋める</option>
                          <option value="forward_fill">前方埋め</option>
                          <option value="backward_fill">後方埋め</option>
                          <option value="interpolate">線形補間</option>
                          <option value="knn">KNN補間</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">適用するカラム</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {currentDataset.featureNames.map((name, index) => (
                            <label key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={preprocessingOptions.selectedMissingColumns.includes(index)}
                                onChange={(e) => {
                                  const newColumns = preprocessingOptions.selectedMissingColumns;
                                  if (e.target.checked) {
                                    setPreprocessingOptions(prev => ({
                                      ...prev,
                                      selectedMissingColumns: [...newColumns, index]
                                    }));
                                  } else {
                                    setPreprocessingOptions(prev => ({
                                      ...prev,
                                      selectedMissingColumns: newColumns.filter(i => i !== index)
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-white">{name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={executeMissingValueProcessing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        欠損値処理を実行
                      </button>
                    </div>
                  </div>

                  {/* 外れ値処理 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">外れ値処理</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">処理方法</label>
                        <select 
                          value={preprocessingOptions.outlierStrategy}
                          onChange={(e) => setPreprocessingOptions(prev => ({
                            ...prev,
                            outlierStrategy: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="none">処理しない</option>
                          <option value="iqr">IQR法</option>
                          <option value="zscore">Z-score法</option>
                          <option value="isolation_forest">Isolation Forest</option>
                          <option value="local_outlier_factor">Local Outlier Factor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">閾値</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={preprocessingOptions.outlierThreshold}
                          onChange={(e) => setPreprocessingOptions(prev => ({
                            ...prev,
                            outlierThreshold: parseFloat(e.target.value)
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white" 
                          placeholder="1.5" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">適用するカラム（数値のみ）</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {currentDataset.featureNames.map((name, index) => {
                            const featureTypes = getFeatureTypes(currentDataset);
                            const isNumerical = featureTypes[index] === 'numerical';
                            return (
                              <label key={index} className={`flex items-center space-x-2 ${!isNumerical ? 'opacity-50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={preprocessingOptions.selectedOutlierColumns.includes(index)}
                                  onChange={(e) => {
                                    const newColumns = preprocessingOptions.selectedOutlierColumns;
                                    if (e.target.checked) {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedOutlierColumns: [...newColumns, index]
                                      }));
                                    } else {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedOutlierColumns: newColumns.filter(i => i !== index)
                                      }));
                                    }
                                  }}
                                  disabled={!isNumerical}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${isNumerical ? 'text-white' : 'text-white/50'}`}>
                                  {name} {isNumerical ? '(数値)' : '(カテゴリ)'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={executeOutlierProcessing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        外れ値処理を実行
                      </button>
                    </div>
                  </div>

                  {/* スケーリング */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">正規化・標準化</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">スケーリング方法</label>
                        <select 
                          value={preprocessingOptions.scalingStrategy}
                          onChange={(e) => setPreprocessingOptions(prev => ({
                            ...prev,
                            scalingStrategy: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="none">スケーリングしない</option>
                          <option value="minmax">Min-Max正規化</option>
                          <option value="standard">標準化</option>
                          <option value="robust">Robust正規化</option>
                          <option value="maxabs">MaxAbs正規化</option>
                          <option value="quantile">分位点正規化</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">適用するカラム（数値のみ）</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {currentDataset.featureNames.map((name, index) => {
                            const featureTypes = getFeatureTypes(currentDataset);
                            const isNumerical = featureTypes[index] === 'numerical';
                            return (
                              <label key={index} className={`flex items-center space-x-2 ${!isNumerical ? 'opacity-50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={preprocessingOptions.selectedScalingColumns.includes(index)}
                                  onChange={(e) => {
                                    const newColumns = preprocessingOptions.selectedScalingColumns;
                                    if (e.target.checked) {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedScalingColumns: [...newColumns, index]
                                      }));
                                    } else {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedScalingColumns: newColumns.filter(i => i !== index)
                                      }));
                                    }
                                  }}
                                  disabled={!isNumerical}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${isNumerical ? 'text-white' : 'text-white/50'}`}>
                                  {name} {isNumerical ? '(数値)' : '(カテゴリ)'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={executeScalingProcessing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        正規化・標準化を実行
                      </button>
                    </div>
                  </div>

                  {/* カテゴリカル変数エンコーディング */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">カテゴリカル変数エンコーディング</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">エンコーディング方法</label>
                        <select 
                          value={preprocessingOptions.categoricalEncoding}
                          onChange={(e) => setPreprocessingOptions(prev => ({
                            ...prev,
                            categoricalEncoding: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="none">適用しない</option>
                          <option value="label">ラベルエンコーディング</option>
                          <option value="onehot">ワンホットエンコーディング</option>
                          <option value="target">ターゲットエンコーディング</option>
                          <option value="binary">バイナリエンコーディング</option>
                          <option value="hash">ハッシュエンコーディング</option>
                          <option value="frequency">頻度エンコーディング</option>
                          <option value="ordinal">順序エンコーディング</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">適用するカラム（カテゴリカルのみ）</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {currentDataset.featureNames.map((name, index) => {
                            const featureTypes = getFeatureTypes(currentDataset);
                            const isCategorical = featureTypes[index] === 'categorical';
                            return (
                              <label key={index} className={`flex items-center space-x-2 ${!isCategorical ? 'opacity-50' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={preprocessingOptions.selectedCategoricalColumns.includes(index)}
                                  onChange={(e) => {
                                    const newColumns = preprocessingOptions.selectedCategoricalColumns;
                                    if (e.target.checked) {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedCategoricalColumns: [...newColumns, index]
                                      }));
                                    } else {
                                      setPreprocessingOptions(prev => ({
                                        ...prev,
                                        selectedCategoricalColumns: newColumns.filter(i => i !== index)
                                      }));
                                    }
                                  }}
                                  disabled={!isCategorical}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${isCategorical ? 'text-white' : 'text-white/50'}`}>
                                  {name} {isCategorical ? '(カテゴリ)' : '(数値)'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={executeCategoricalEncoding}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        カテゴリカルエンコーディングを実行
                      </button>
                    </div>
                  </div>

                  {/* 前処理後のデータプレビュー */}
                  {processedDataset && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">前処理後のデータプレビュー</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/60">サンプル数:</span>
                            <span className="text-white ml-2">{processedDataset.data.length}</span>
                          </div>
                          <div>
                            <span className="text-white/60">特徴量数:</span>
                            <span className="text-white ml-2">{processedDataset.featureNames.length}</span>
                          </div>
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-white/20 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-white/10">
                              <tr>
                                {processedDataset.featureNames.slice(0, 5).map((name, index) => (
                                  <th key={index} className="px-3 py-2 text-left text-white/80">{name}</th>
                                ))}
                                <th className="px-3 py-2 text-left text-white/80">...</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processedDataset.data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-b border-white/10">
                                  {row.slice(0, 5).map((val, j) => (
                                    <td key={j} className="px-3 py-2 text-white/60">
                                      {typeof val === 'number' ? val.toFixed(3) : val}
                                    </td>
                                  ))}
                                  <td className="px-3 py-2 text-white/40">...</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={skipPreprocessing}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      前処理をスキップ
                    </button>
                    <div className="flex space-x-3">
                      {processedDataset && (
                        <button
                          onClick={() => {
                            setShowProcessedData(true);
                            setCurrentStep('eda');
                          }}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          EDAで確認
                        </button>
                      )}
                      <button
                        onClick={executeAllPreprocessing}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        すべての前処理を実行
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 特徴エンジニアリングステップ */}
              {currentStep === 'feature_engineering' && currentDataset && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">特徴エンジニアリング</h2>
                  
                  {/* 数学的変換 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">数学的変換</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">変換方法</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'polynomial', label: '多項式特徴量', description: '特徴量同士の掛け算' },
                            { key: 'log', label: '対数変換', description: 'log(x)' },
                            { key: 'sqrt', label: '平方根変換', description: '√x' },
                            { key: 'square', label: '二乗変換', description: 'x²' },
                            { key: 'exponential', label: '指数変換', description: 'e^x' },
                            { key: 'reciprocal', label: '逆数変換', description: '1/x' }
                          ].map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={featureEngineeringOptions.transformations[key as keyof typeof featureEngineeringOptions.transformations]}
                                  onChange={(e) => setFeatureEngineeringOptions(prev => ({
                                    ...prev,
                                    transformations: {
                                      ...prev.transformations,
                                      [key]: e.target.checked
                                    }
                                  }))}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-white">{label}</span>
                              </label>
                              <p className="text-xs text-white/60 ml-7">{description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">適用するカラム（数値のみ）</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {currentDataset.featureNames.map((name, index) => (
                            <label key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-white">{name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">新しい特徴量の命名規則</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="namingRule"
                              value="auto"
                              defaultChecked
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-white">自動命名（例: log_age, sqrt_income）</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="namingRule"
                              value="custom"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-white">カスタム命名</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 統計的集約 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">統計的集約</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">集約方法</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'mean', label: '平均値', description: '全数値特徴量の平均' },
                            { key: 'std', label: '標準偏差', description: '全数値特徴量の標準偏差' },
                            { key: 'max', label: '最大値', description: '全数値特徴量の最大値' },
                            { key: 'min', label: '最小値', description: '全数値特徴量の最小値' },
                            { key: 'median', label: '中央値', description: '全数値特徴量の中央値' },
                            { key: 'variance', label: '分散', description: '全数値特徴量の分散' }
                          ].map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={featureEngineeringOptions.aggregations[key as keyof typeof featureEngineeringOptions.aggregations]}
                                  onChange={(e) => setFeatureEngineeringOptions(prev => ({
                                    ...prev,
                                    aggregations: {
                                      ...prev.aggregations,
                                      [key]: e.target.checked
                                    }
                                  }))}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-white">{label}</span>
                              </label>
                              <p className="text-xs text-white/60 ml-7">{description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">集約特徴量の名前</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-white/80 mb-1">平均値特徴量名</label>
                            <input
                              type="text"
                              placeholder="mean_features"
                              className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-white/80 mb-1">最大値特徴量名</label>
                            <input
                              type="text"
                              placeholder="max_features"
                              className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 特徴量組み合わせ */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">特徴量組み合わせ</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">組み合わせ方法</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'interaction', label: '交互作用項', description: '特徴量同士の掛け算' },
                            { key: 'ratio', label: '比率特徴量', description: '特徴量の比率' },
                            { key: 'difference', label: '差分特徴量', description: '特徴量の差' },
                            { key: 'sum', label: '合計特徴量', description: '特徴量の合計' }
                          ].map(({ key, label, description }) => (
                            <div key={key} className="space-y-2">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={key === 'interaction' ? featureEngineeringOptions.transformations.interaction : false}
                                  onChange={(e) => {
                                    if (key === 'interaction') {
                                      setFeatureEngineeringOptions(prev => ({
                                        ...prev,
                                        transformations: {
                                          ...prev.transformations,
                                          interaction: e.target.checked
                                        }
                                      }));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-white">{label}</span>
                              </label>
                              <p className="text-xs text-white/60 ml-7">{description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">組み合わせる特徴量ペアを選択</label>
                        <div className="max-h-40 overflow-y-auto border border-white/20 rounded-lg p-4">
                          <div className="text-sm text-white/60 mb-2">例: age × income → age_income_interaction</div>
                          <div className="space-y-2">
                            {currentDataset.featureNames.slice(0, 3).map((name1, i) => 
                              currentDataset.featureNames.slice(i + 1, 4).map((name2, j) => (
                                <label key={`${i}-${j}`} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-white">{name1} × {name2}</span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 次元削減 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">次元削減</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">手法</label>
                        <select
                          value={featureEngineeringOptions.dimensionalityReduction.method}
                          onChange={(e) => setFeatureEngineeringOptions(prev => ({
                            ...prev,
                            dimensionalityReduction: {
                              ...prev.dimensionalityReduction,
                              method: e.target.value as 'none' | 'pca' | 'lda' | 'tsne'
                            }
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="none">なし</option>
                          <option value="pca">PCA（主成分分析）</option>
                          <option value="lda">LDA（線形判別分析）</option>
                          <option value="tsne">t-SNE（非線形次元削減）</option>
                        </select>
                      </div>
                      
                      {featureEngineeringOptions.dimensionalityReduction.method !== 'none' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">次元数</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={featureEngineeringOptions.dimensionalityReduction.components}
                              onChange={(e) => setFeatureEngineeringOptions(prev => ({
                                ...prev,
                                dimensionalityReduction: {
                                  ...prev.dimensionalityReduction,
                                  components: parseInt(e.target.value)
                                }
                              }))}
                              className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">新しい特徴量の名前</label>
                            <div className="grid grid-cols-2 gap-4">
                              {Array.from({ length: featureEngineeringOptions.dimensionalityReduction.components }, (_, i) => (
                                <div key={i}>
                                  <label className="block text-sm text-white/80 mb-1">第{i + 1}主成分</label>
                                  <input
                                    type="text"
                                    placeholder={`PC${i + 1}`}
                                    className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep('feature_selection')}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      スキップ
                    </button>
                    <div className="flex space-x-3">
                      {processedDataset && (
                        <button
                          onClick={() => {
                            setShowProcessedData(true);
                            setCurrentStep('eda');
                          }}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          EDAで確認
                        </button>
                      )}
                      <button
                        onClick={executeFeatureEngineering}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        特徴エンジニアリングを実行
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 特徴量選択ステップ */}
              {currentStep === 'feature_selection' && currentDataset && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">特徴量選択</h2>
                  
                  {/* データソースの表示 */}
                  {!processedDataset && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300">
                      <p>前処理をスキップしました。生データから特徴量を選択します。</p>
                    </div>
                  )}
                  
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">選択手法</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">手法</label>
                        <select
                          value={featureSelectionOptions.method}
                          onChange={(e) => setFeatureSelectionOptions(prev => ({
                            ...prev,
                            method: e.target.value as 'correlation' | 'importance' | 'manual' | 'variance' | 'mutual_info'
                          }))}
                          className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                        >
                          <option value="correlation">相関分析</option>
                          <option value="importance">重要度</option>
                          <option value="variance">分散</option>
                          <option value="mutual_info">相互情報量</option>
                          <option value="manual">手動選択</option>
                        </select>
                      </div>

                      {featureSelectionOptions.method === 'correlation' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">相関閾値</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={featureSelectionOptions.threshold}
                            onChange={(e) => setFeatureSelectionOptions(prev => ({
                              ...prev,
                              threshold: parseFloat(e.target.value)
                            }))}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                          />
                        </div>
                      )}

                      {(featureSelectionOptions.method === 'importance' || featureSelectionOptions.method === 'mutual_info') && (
                        <div>
                          <label className="block text-sm font-medium mb-2">最大特徴量数</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={featureSelectionOptions.maxFeatures}
                            onChange={(e) => setFeatureSelectionOptions(prev => ({
                              ...prev,
                              maxFeatures: parseInt(e.target.value)
                            }))}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                          />
                        </div>
                      )}

                      {featureSelectionOptions.method === 'variance' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">分散閾値</label>
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={featureSelectionOptions.threshold}
                            onChange={(e) => setFeatureSelectionOptions(prev => ({
                              ...prev,
                              threshold: parseFloat(e.target.value)
                            }))}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white"
                          />
                        </div>
                      )}

                      {featureSelectionOptions.method === 'manual' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">特徴量を選択</label>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {(processedDataset || currentDataset)?.featureNames.map((name, index) => (
                              <label key={index} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={featureSelectionOptions.selectedFeatures.includes(index)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFeatureSelectionOptions(prev => ({
                                        ...prev,
                                        selectedFeatures: [...prev.selectedFeatures, index]
                                      }));
                                    } else {
                                      setFeatureSelectionOptions(prev => ({
                                        ...prev,
                                        selectedFeatures: prev.selectedFeatures.filter(i => i !== index)
                                      }));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-white">{name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep('data_split')}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      スキップ
                    </button>
                    <button
                      onClick={executeFeatureSelection}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      特徴量選択を実行
                    </button>
                  </div>
                </div>
              )}


              {/* データ分割ステップ */}
              {currentStep === 'data_split' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">データ分割</h2>
                  {!processedDataset && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300">
                      <p>前処理をスキップしました。生データをそのまま使用します。</p>
                    </div>
                  )}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">分割比率を設定</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">学習データ</label>
                        <input
                          type="range"
                          min="0.5"
                          max="0.9"
                          step="0.1"
                          value={trainRatio}
                          onChange={(e) => setTrainRatio(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center mt-2 text-lg font-bold">{Math.round(trainRatio * 100)}%</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">検証データ</label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.4"
                          step="0.1"
                          value={validationRatio}
                          onChange={(e) => setValidationRatio(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center mt-2 text-lg font-bold">{Math.round(validationRatio * 100)}%</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">テストデータ</label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.4"
                          step="0.1"
                          value={testRatio}
                          onChange={(e) => setTestRatio(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center mt-2 text-lg font-bold">{Math.round(testRatio * 100)}%</div>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="text-sm text-white/60 mb-4">
                        合計: {Math.round((trainRatio + validationRatio + testRatio) * 100)}%
                        {Math.abs(trainRatio + validationRatio + testRatio - 1) > 0.01 && (
                          <span className="text-red-400 ml-2">※ 合計が100%になるように調整してください</span>
                        )}
                      </div>
                      <button
                        onClick={executeDataSplit}
                        disabled={Math.abs(trainRatio + validationRatio + testRatio - 1) > 0.01}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        データを分割
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* モデル選択・学習ステップ */}
              {currentStep === 'model_selection' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">モデル選択・学習</h2>
                  
                  {/* モデル選択 */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">モデル選択</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {availableModels.map((model) => (
                        <div
                          key={model.id}
                          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedModel?.id === model.id
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          onClick={() => selectModel(model.id)}
                        >
                          <h3 className="text-lg font-semibold mb-2">{model.name}</h3>
                          <p className="text-white/70 mb-4">{model.description}</p>
                          <div className="space-y-2">
                            {Object.entries(model.hyperparameters).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-white/60">{key}:</span>
                                <input
                                  type="number"
                                  value={hyperparameters[key] || value}
                                  onChange={(e) => updateHyperparameter(key, parseFloat(e.target.value))}
                                  className="w-20 px-2 py-1 bg-white/10 rounded text-white text-right"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 学習実行 */}
                  {selectedModel && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">学習実行</h3>
                      {isTraining ? (
                        <div className="text-center py-8">
                          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p>学習中...</p>
                        </div>
                      ) : trainingResult ? (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold">学習結果</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-white/60">精度:</span>
                              <span className="ml-2 text-white">{(trainingResult.accuracy * 100).toFixed(2)}%</span>
                            </div>
                            <div>
                              <span className="text-white/60">損失:</span>
                              <span className="ml-2 text-white">{trainingResult.loss.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-white/60">学習時間:</span>
                              <span className="ml-2 text-white">{trainingResult.trainingTime}ms</span>
                            </div>
                          </div>
                          <div className="flex space-x-4 mt-6">
                            <button
                              onClick={startTraining}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              再学習
                            </button>
                            <button
                              onClick={() => setCurrentStep('validation')}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                              検証に進む
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <button
                            onClick={startTraining}
                            disabled={!dataSplit}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-lg font-semibold transition-colors"
                          >
                            学習を開始
                          </button>
                          {!dataSplit && (
                            <p className="mt-2 text-red-400 text-sm">データ分割を先に実行してください</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {/* 検証ステップ */}
              {currentStep === 'validation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">検証</h2>
                  {isValidating ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>検証中...</p>
                    </div>
                  ) : validationResult ? (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">検証結果</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-white/60">精度:</span>
                          <span className="ml-2 text-white">{(validationResult.accuracy * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-white/60">損失:</span>
                          <span className="ml-2 text-white">{validationResult.loss.toFixed(4)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <button
                          onClick={executeValidation}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          再検証
                        </button>
                        <button
                          onClick={() => setCurrentStep('submission')}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          結果を提出
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <button
                        onClick={executeValidation}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition-colors"
                      >
                        検証を実行
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 提出ステップ */}
              {currentStep === 'submission' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">結果提出</h2>
                  
                  {/* 検証結果の表示 */}
                  {validationResult && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">検証結果</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-white/60">検証精度:</span>
                          <span className="ml-2 text-white">{(validationResult.accuracy * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-white/60">検証損失:</span>
                          <span className="ml-2 text-white">{validationResult.loss.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 提出ボタン */}
                  <div className="bg-white/5 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">最終提出</h3>
                    <p className="text-white/70 mb-6">
                      提出ボタンを押すと、テストデータで自動評価が実行され、結果がリーダーボードに反映されます。
                    </p>
                    
                    {isEvaluating ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>テスト評価中...</p>
                      </div>
                    ) : (
                      <button
                        onClick={submitResults}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition-colors"
                      >
                        結果を提出
                      </button>
                    )}
                  </div>

                  {/* テスト結果の表示（提出後） */}
                  {testResult && (
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">最終結果（テストデータ）</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-white/60">テスト精度:</span>
                          <span className="ml-2 text-white font-bold text-lg">{(testResult.accuracy * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-white/60">テスト損失:</span>
                          <span className="ml-2 text-white">{testResult.loss.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleMLWorkflow;
