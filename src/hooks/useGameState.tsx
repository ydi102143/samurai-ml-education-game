import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Region, UserProfile, UserRegionProgress, MLModel } from '../types/database';
import { getRegions, getUserProfile, getUserRegionProgress, getMLModels, createUserProfile, initializeUserProgress } from '../lib/database';

interface GameState {
  user: UserProfile | null;
  regions: Region[];
  progress: Record<string, UserRegionProgress>;
  models: MLModel[];
  loading: boolean;
  error: string | null;
  currentView: 'home' | 'map' | 'challenge';
  selectedRegion: string | null;
  setCurrentView: (view: 'home' | 'map' | 'challenge') => void;
  setSelectedRegion: (regionId: string | null) => void;
  initializeUser: (name: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [progress, setProgress] = useState<Record<string, UserRegionProgress>>({});
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'challenge'>('home');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const initializeUser = async (name: string) => {
    try {
      setError(null);
      const newUser = await createUserProfile(name);
      setUser(newUser);
      await initializeUserProgress(newUser.id);
      await refreshProgress();
    } catch (error) {
      console.error('Failed to initialize user:', error);
      setError('ユーザーの初期化に失敗しました。もう一度お試しください。');
    }
  };

  const refreshProgress = async () => {
    if (!user) return;

    try {
      setError(null);
      const userProgress = await getUserRegionProgress(user.id);
      const progressMap: Record<string, UserRegionProgress> = {};
      
      // 開放条件をチェックして進捗を更新
      for (const region of regions) {
        const existingProgress = userProgress.find(p => p.region_id === region.id);
        const isUnlocked = checkUnlockCondition(region, progressMap, regions);
        
        if (existingProgress) {
          progressMap[region.id] = {
            ...existingProgress,
            is_unlocked: isUnlocked
          };
        } else {
          progressMap[region.id] = {
            id: `progress_${region.id}`,
            user_id: user.id,
            region_id: region.id,
            is_unlocked: isUnlocked,
            is_completed: false,
            best_accuracy: 0,
            stars: 0,
            attempts: 0,
            first_completed_at: null,
            last_attempt_at: null,
            created_at: new Date().toISOString()
          };
        }
      }
      
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
      setError('進捗データの取得に失敗しました。');
    }
  };

  const checkUnlockCondition = (region: Region, progressMap: Record<string, UserRegionProgress>, allRegions: Region[]): boolean => {
    // 開放条件がない場合は開放
    if (!region.unlock_condition) {
      return true;
    }
    
    // 開放条件の地域が完了しているかチェック
    const requiredProgress = progressMap[region.unlock_condition];
    if (requiredProgress?.is_completed) {
      return true;
    }
    
    // 前のレベルの問題をすべて完了しているかチェック
    const previousLevel = region.difficulty - 1;
    if (previousLevel > 0) {
      const previousLevelRegions = allRegions.filter(r => r.difficulty === previousLevel);
      const allPreviousCompleted = previousLevelRegions.every(r => {
        const progress = progressMap[r.id];
        return progress?.is_completed || false;
      });
      
      if (allPreviousCompleted) {
        return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);


        // ローカル開発用：モックデータを直接使用
        const regionsData = await getRegions();
        const modelsData = await getMLModels();

        if (!regionsData || regionsData.length === 0) {
          throw new Error('No regions data available');
        }

        if (!modelsData || modelsData.length === 0) {
          throw new Error('No models data available');
        }

        setRegions(regionsData);
        setModels(modelsData);

        const storedUserId = localStorage.getItem('samurai_user_id');
        if (storedUserId) {
          const userData = await getUserProfile(storedUserId);
          if (userData) {
            setUser(userData);
            // 既存ユーザーの場合、段階的に開放
            const userProgress = await getUserRegionProgress(userData.id);
            const progressMap: Record<string, UserRegionProgress> = {};
            
            // 開放条件をチェックして進捗を更新
            for (const region of regionsData) {
              const existingProgress = userProgress.find(p => p.region_id === region.id);
              const isUnlocked = checkUnlockCondition(region, progressMap, regionsData);
              
              if (existingProgress) {
                progressMap[region.id] = {
                  ...existingProgress,
                  is_unlocked: isUnlocked
                };
              } else {
                progressMap[region.id] = {
                  id: `progress_${region.id}`,
                  user_id: userData.id,
                  region_id: region.id,
                  is_unlocked: isUnlocked,
                  is_completed: false,
                  best_accuracy: 0,
                  stars: 0,
                  attempts: 0,
                  first_completed_at: null,
                  last_attempt_at: null,
                  created_at: new Date().toISOString()
                };
              }
            }
            setProgress(progressMap);
          } else {
            // ユーザーが見つからない場合、モックユーザーを作成
            const mockUser: UserProfile = {
              id: storedUserId,
              shogun_name: 'テスト将軍',
              level: 1,
              total_xp: 0,
              title: '足軽',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUser(mockUser);
            
            // 段階的に開放
            const progressMap: Record<string, UserRegionProgress> = {};
            for (const region of regionsData) {
              const isUnlocked = checkUnlockCondition(region, progressMap, regionsData);
              progressMap[region.id] = {
                id: `progress_${region.id}`,
                user_id: mockUser.id,
                region_id: region.id,
                is_unlocked: isUnlocked,
                is_completed: false,
                best_accuracy: 0,
                stars: 0,
                attempts: 0,
                first_completed_at: null,
                last_attempt_at: null,
                created_at: new Date().toISOString()
              };
            }
            setProgress(progressMap);
          }
        } else {
          // 新規ユーザーの場合、段階的に開放
          const defaultUserId = `user_${Date.now()}`;
          const defaultUser: UserProfile = {
            id: defaultUserId,
            shogun_name: 'ゲスト将軍',
            level: 1,
            total_xp: 0,
            title: '足軽',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(defaultUser);
          
          // 段階的に開放
          const progressMap: Record<string, UserRegionProgress> = {};
          for (const region of regionsData) {
            const isUnlocked = checkUnlockCondition(region, progressMap, regionsData);
            progressMap[region.id] = {
              id: `progress_${region.id}`,
              user_id: defaultUserId,
              region_id: region.id,
              is_unlocked: isUnlocked,
              is_completed: false,
              best_accuracy: 0,
              stars: 0,
              attempts: 0,
              first_completed_at: null,
              last_attempt_at: null,
              created_at: new Date().toISOString()
            };
          }
          setProgress(progressMap);
        }
      } catch (error) {
        console.error('Failed to load game data:', error);
        if (error instanceof Error) {
          if (error.message === 'Timeout') {
            setError('データの読み込みに時間がかかりすぎています。ネットワーク接続を確認してください。');
          } else if (error.message.includes('No regions') || error.message.includes('No models')) {
            setError('データベースが空です。管理者に連絡してください。');
          } else {
            setError('データの読み込みに失敗しました。ページを再読み込みしてください。');
          }
        } else {
          setError('予期しないエラーが発生しました。');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('samurai_user_id', user.id);
    }
  }, [user]);

  return (
    <GameContext.Provider
      value={{
        user,
        regions,
        progress,
        models,
        loading,
        error,
        currentView,
        selectedRegion,
        setCurrentView,
        setSelectedRegion,
        initializeUser,
        refreshProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within GameProvider');
  }
  return context;
}
