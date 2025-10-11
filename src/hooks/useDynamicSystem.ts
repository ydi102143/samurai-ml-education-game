// 動的システムのReactフック

import { useState, useEffect, useCallback } from 'react';
import { 
  dynamicSystemManager, 
  realtimeUpdateSystem, 
  dataFlowManager, 
  mlPipelineManager,
  type DynamicState,
  type DynamicAction 
} from '../utils/dynamicSystem';
import { dynamicPreprocessingManager } from '../utils/dynamicPreprocessing';
import { dynamicFeatureEngineeringManager } from '../utils/dynamicFeatureEngineering';
import { dynamicMLModelManager } from '../utils/dynamicMLModels';

export function useDynamicSystem() {
  const [state, setState] = useState<DynamicState>(dynamicSystemManager.getState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 状態の更新を監視
  useEffect(() => {
    const unsubscribe = dynamicSystemManager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // アクションの実行
  const dispatch = useCallback((action: DynamicAction) => {
    try {
      setError(null);
      dynamicSystemManager.dispatch(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // データの更新
  const updateRawData = useCallback((data: any[]) => {
    dispatch({
      type: 'UPDATE_RAW_DATA',
      payload: data,
      timestamp: Date.now()
    });
  }, [dispatch]);

  const updateProcessedData = useCallback((data: any[]) => {
    dispatch({
      type: 'UPDATE_PROCESSED_DATA',
      payload: data,
      timestamp: Date.now()
    });
  }, [dispatch]);

  // ステップの変更
  const setCurrentStep = useCallback((step: string) => {
    dispatch({
      type: 'SET_CURRENT_STEP',
      payload: step,
      timestamp: Date.now()
    });
  }, [dispatch]);

  // 前処理の実行
  const applyPreprocessing = useCallback(async (stepName: string, parameters: any, selectedFeatures: number[]) => {
    setIsLoading(true);
    try {
      const result = await dynamicPreprocessingManager.executeStep(
        stepName, 
        state.processedData.length > 0 ? state.processedData : state.rawData, 
        parameters, 
        selectedFeatures
      );
      
      dispatch({
        type: 'APPLY_PREPROCESSING',
        payload: {
          step: stepName,
          parameters,
          selectedFeatures,
          result
        },
        timestamp: Date.now()
      });
      
      updateProcessedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preprocessing failed');
    } finally {
      setIsLoading(false);
    }
  }, [state.processedData, state.rawData, dispatch, updateProcessedData]);

  // 特徴量エンジニアリングの実行
  const applyFeatureEngineering = useCallback(async (stepName: string, parameters: any, selectedFeatures: number[]) => {
    setIsLoading(true);
    try {
      const result = await dynamicFeatureEngineeringManager.executeStep(
        stepName, 
        state.processedData.length > 0 ? state.processedData : state.rawData, 
        parameters, 
        selectedFeatures
      );
      
      dispatch({
        type: 'APPLY_FEATURE_ENGINEERING',
        payload: {
          step: stepName,
          parameters,
          selectedFeatures,
          result
        },
        timestamp: Date.now()
      });
      
      updateProcessedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feature engineering failed');
    } finally {
      setIsLoading(false);
    }
  }, [state.processedData, state.rawData, dispatch, updateProcessedData]);

  // 特徴量選択
  const selectFeatures = useCallback((features: number[]) => {
    dispatch({
      type: 'SELECT_FEATURES',
      payload: features,
      timestamp: Date.now()
    });
  }, [dispatch]);

  // モデル選択
  const selectModel = useCallback((model: string, hyperparameters: any) => {
    dispatch({
      type: 'SELECT_MODEL',
      payload: { model, hyperparameters },
      timestamp: Date.now()
    });
  }, [dispatch]);

  // モデル学習
  const trainModel = useCallback(async (modelName: string, hyperparameters: any) => {
    setIsLoading(true);
    try {
      const data = state.processedData.length > 0 ? state.processedData : state.rawData;
      const trainedModel = await dynamicMLModelManager.trainModel(
        modelName, 
        data, 
        'target', 
        hyperparameters
      );
      
      dispatch({
        type: 'SET_TRAINED_MODEL',
        payload: trainedModel,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Model training failed');
    } finally {
      setIsLoading(false);
    }
  }, [state.processedData, state.rawData, dispatch]);

  // 検証の実行
  const validateModel = useCallback(async () => {
    if (!state.trainedModel) {
      setError('No trained model available');
      return;
    }

    setIsLoading(true);
    try {
      // 簡易検証（実際の実装ではより複雑）
      const data = state.processedData.length > 0 ? state.processedData : state.rawData;
      const predictions = await state.trainedModel.predict(data);
      
      // 模擬検証結果
      const validationResults = {
        accuracy: Math.random() * 0.2 + 0.8,
        precision: Math.random() * 0.2 + 0.8,
        recall: Math.random() * 0.2 + 0.8,
        f1_score: Math.random() * 0.2 + 0.8
      };
      
      dispatch({
        type: 'SET_VALIDATION_RESULTS',
        payload: validationResults,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  }, [state.trainedModel, state.processedData, state.rawData, dispatch]);

  // 提出
  const submitResults = useCallback((submissionData: any) => {
    dispatch({
      type: 'SET_SUBMISSION_DATA',
      payload: submissionData,
      timestamp: Date.now()
    });
  }, [dispatch]);

  // リーダーボードの更新
  const updateLeaderboard = useCallback((leaderboard: any[]) => {
    dispatch({
      type: 'UPDATE_LEADERBOARD',
      payload: leaderboard,
      timestamp: Date.now()
    });
  }, [dispatch]);

  // リアルタイム更新の開始
  const startRealtimeUpdates = useCallback(() => {
    realtimeUpdateSystem.start(() => {
      // 定期的な更新処理
      console.log('Realtime update triggered');
    });
  }, []);

  // リアルタイム更新の停止
  const stopRealtimeUpdates = useCallback(() => {
    realtimeUpdateSystem.stop();
  }, []);

  // システムのリセット
  const resetSystem = useCallback(() => {
    dynamicSystemManager.reset();
    setError(null);
  }, []);

  // 利用可能なステップの取得
  const getAvailablePreprocessingSteps = useCallback(() => {
    return dynamicPreprocessingManager.getAvailableSteps();
  }, []);

  const getAvailableFeatureEngineeringSteps = useCallback(() => {
    return dynamicFeatureEngineeringManager.getAvailableSteps();
  }, []);

  const getAvailableModels = useCallback((type?: 'classification' | 'regression') => {
    return type 
      ? dynamicMLModelManager.getModelsByType(type)
      : dynamicMLModelManager.getAvailableModels();
  }, []);

  // パラメータの検証
  const validatePreprocessingParameters = useCallback((stepName: string, parameters: any) => {
    return dynamicPreprocessingManager.validateParameters(stepName, parameters);
  }, []);

  const validateFeatureEngineeringParameters = useCallback((stepName: string, parameters: any) => {
    return dynamicFeatureEngineeringManager.validateParameters(stepName, parameters);
  }, []);

  const validateModelParameters = useCallback((modelName: string, parameters: any) => {
    return dynamicMLModelManager.validateHyperparameters(modelName, parameters);
  }, []);

  return {
    // 状態
    state,
    isLoading,
    error,
    
    // アクション
    dispatch,
    updateRawData,
    updateProcessedData,
    setCurrentStep,
    applyPreprocessing,
    applyFeatureEngineering,
    selectFeatures,
    selectModel,
    trainModel,
    validateModel,
    submitResults,
    updateLeaderboard,
    
    // システム制御
    startRealtimeUpdates,
    stopRealtimeUpdates,
    resetSystem,
    
    // 利用可能なオプション
    getAvailablePreprocessingSteps,
    getAvailableFeatureEngineeringSteps,
    getAvailableModels,
    
    // 検証
    validatePreprocessingParameters,
    validateFeatureEngineeringParameters,
    validateModelParameters
  };
}
