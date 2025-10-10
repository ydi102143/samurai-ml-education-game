import { useState, useEffect } from 'react';
import { Users, MessageCircle, Send, Trophy, Target, Sword } from 'lucide-react';
import { OnlineBattleView } from './OnlineBattleView';
import { WeeklyProblemManager, WeeklyProblem } from '../utils/weeklyProblemManager';
import { userManager } from '../utils/userManager';
import { useRealtimeBattle } from '../hooks/useRealtimeBattle';
import { getWeeklyProblem } from '../data/onlineDatasets';
import type { OnlineDataset } from '../data/onlineDatasets';
import { CompetitionProblemManager } from '../utils/competitionProblemManager';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { TeamManager } from '../utils/teamManager';
import { TeamChatManager } from '../utils/teamChatManager';
import type { Team, TeamChatMessage, LeaderboardEntry } from '../types/onlineBattle';

interface MultiplayerBattleProps {
  onBack: () => void;
}

// データセット名から実際のデータを取得
const getDatasetByName = async (datasetName: string): Promise<OnlineDataset> => {
  const problems = getWeeklyProblem();
  switch (datasetName) {
    case 'modern_stock_prediction':
      return problems[0]; // 株価予測データセット
    case 'modern_sentiment_analysis':
      return problems[1]; // 感情分析データセット
    case 'modern_image_classification':
      return problems[2]; // 画像分類データセット
    case 'modern_customer_churn':
      return problems[3]; // 顧客離脱データセット
    case 'modern_housing_price':
      return problems[4]; // 住宅価格データセット
    default:
      // デフォルトは株価予測データセット
      return problems[0];
  }
};

// コンペティション問題として登録
const registerCompetitionProblem = async (problem: WeeklyProblem & { dataset: OnlineDataset }) => {
  try {
    // 既に登録されているかチェック
    const existingProblem = CompetitionProblemManager.getProblem(problem.id);
    if (existingProblem) {
      console.log('問題は既に登録されています:', problem.id);
      return;
    }

    // コンペティション問題として登録
    await CompetitionProblemManager.createProblem(
      problem.id,
      problem.title,
      problem.description,
      problem.dataset.data,
      problem.dataset.featureNames,
      problem.dataset.targetName,
      problem.dataset.problemType,
      problem.dataset.classes
    );
    
    console.log('コンペティション問題を登録しました:', problem.id);
  } catch (error) {
    console.error('問題登録エラー:', error);
    // エラーが発生しても続行
  }
};

export function MultiplayerBattle({ onBack }: MultiplayerBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<{
    id: string;
    title: string;
    description: string;
    dataset: OnlineDataset;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    publicLeaderboard: any[];
    privateLeaderboard: any[];
    timeLimit: number;
  } | null>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleMode, setBattleMode] = useState<'individual' | 'team'>('individual');
  const [battleStartTime, setBattleStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [weeklyTimeRemaining, setWeeklyTimeRemaining] = useState<number>(0);
  const [battleResults, setBattleResults] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<number>(0);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([]);
  const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);

  const user = userManager.getCurrentUser();
  
  const {
    participants,
    chatMessages,
    sendChatMessage,
    joinRoom,
    isConnected
  } = useRealtimeBattle({
    roomId: roomId || 'default',
    userId: user?.id || '',
    username: user?.username || '',
    isMultiplayer: true
  });

  useEffect(() => {
    loadCurrentProblem();
    loadAvailableTeams();
  }, []);

  // チーム内チャットの購読
  useEffect(() => {
    if (userTeam) {
      const unsubscribe = TeamChatManager.subscribeToTeamMessages(userTeam.id, (message) => {
        setTeamChatMessages(prev => [...prev, message]);
      });
      
      // 既存のメッセージを読み込み
      const messages = TeamChatManager.getTeamMessages(userTeam.id);
      setTeamChatMessages(messages);

      return unsubscribe;
    }
  }, [userTeam]);

  // リーダーボード読み込み
  useEffect(() => {
    if (currentProblem) {
      loadLeaderboard(currentProblem.id);
    }
  }, [currentProblem]);

  // リーダーボードの定期的な更新
  useEffect(() => {
    if (!currentProblem) return;
    
    const interval = setInterval(() => {
      loadLeaderboard(currentProblem.id);
    }, 10000); // 10秒ごとに更新
    
    return () => clearInterval(interval);
  }, [currentProblem]);

  // 週間問題の残り時間計算（動的更新）
  useEffect(() => {
    const calculateWeeklyTimeRemaining = () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // 今週の日曜日
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // 来週の日曜日
      
      const remaining = Math.max(0, Math.floor((endOfWeek.getTime() - now.getTime()) / 1000));
      setWeeklyTimeRemaining(remaining);
      
      // 週間問題が終了した場合の処理
      if (remaining === 0) {
        console.log('週間問題が終了しました。新しい問題を読み込み中...');
        // 新しい週間問題を読み込み
        loadCurrentProblem();
      }
    };

    // 初回計算
    calculateWeeklyTimeRemaining();

    // 1秒ごとに動的更新
    const interval = setInterval(calculateWeeklyTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // リアルタイムタイマー（バトル進行時間）
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBattleActive && battleStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - battleStartTime) / 1000);
        setTimeRemaining(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBattleActive, battleStartTime]);

  const loadCurrentProblem = async () => {
    try {
      setLoading(true);
      WeeklyProblemManager.updateWeeklyProblems();
      const problem = WeeklyProblemManager.getCurrentWeeklyProblem();
      
      if (problem) {
        // データセット名から実際のデータを取得
        const dataset = await getDatasetByName(problem.dataset);
        const problemWithDataset = {
          ...problem,
          dataset: dataset
        };
        setCurrentProblem(problemWithDataset);

        // コンペティション問題として登録
        await registerCompetitionProblem(problemWithDataset as any);

        const newRoomId = `weekly_${problem.id}_multiplayer`;
        setRoomId(newRoomId);
        await joinRoom(newRoomId);
      } else {
        setError('利用可能な問題がありません');
      }
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError(`問題の読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // チーム一覧を読み込み
  const loadAvailableTeams = async () => {
    try {
      const teams = TeamManager.getAvailableTeams();
      setAvailableTeams(teams);
      
      // ユーザーの現在のチームを取得
      if (user) {
        const currentTeam = TeamManager.getUserTeam(user.id);
        setUserTeam(currentTeam);
      }
    } catch (error) {
      console.error('チーム一覧読み込みエラー:', error);
    }
  };

  const loadLeaderboard = async (problemId: string) => {
    try {
      console.log('リーダーボード読み込み開始:', problemId);
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      console.log('リーダーボードデータ:', leaderboardData);
      
      if (leaderboardData && leaderboardData.submissions) {
        // CompetitionSubmissionをLeaderboardEntryに変換
        const leaderboardEntries: LeaderboardEntry[] = leaderboardData.submissions.map((sub, index) => ({
          rank: index + 1,
          userId: sub.userId,
          username: sub.username,
          teamId: undefined,
          teamName: undefined,
          score: sub.score || 0,
          modelType: sub.modelType || 'Unknown',
          submissionCount: 1,
          bestScore: sub.score || 0,
          averageScore: sub.score || 0,
          lastSubmission: sub.submittedAt.toISOString(),
          battleStats: {
            totalBattles: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            averageScore: 0,
            bestScore: 0,
            currentStreak: 0,
            rank: 0,
            level: 1,
            experience: 0
          },
          isOnline: true,
          isCurrentUser: sub.userId === user?.id
        }));
        setLocalLeaderboard(leaderboardEntries);
      } else {
        console.log('リーダーボードデータが空です');
        setLocalLeaderboard([]);
      }
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    // チーム戦の場合はチームが選択されているかチェック
    if (battleMode === 'team' && !userTeam) {
      setError('チームを選択してください');
      return;
    }
    
    setBattleStartTime(Date.now());
    setIsBattleActive(true);
    setTimeRemaining(0);
    setMyProgress(0);
    setBattleResults([]);
    setShowChallenge(true);
    
    if (battleMode === 'team' && userTeam) {
      console.log('チーム戦開始:', userTeam);
      // チーム戦の場合はチーム内チャットを初期化
      setTeamChatMessages([]);
    }
  };

  const handleBattleComplete = async (result: any) => {
    console.log('バトル完了:', result);
    
    // 結果を正しい形式に変換
    const battleResult = {
      score: result.score || 0,
      modelType: result.modelType || 'Unknown',
      trainingTime: result.trainingTime || 0,
      won: result.won || false,
      submission: result.submission
    };
    
    setBattleResults(prev => [...prev, battleResult]);
    setMyProgress(100);
    setIsBattleActive(false);
    setShowChallenge(false);
    
    // リーダーボードを再読み込み
    if (currentProblem) {
      await loadLeaderboard(currentProblem.id);
    }
  };


  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWeeklyTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
      return `${days}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleBattleEnd = () => {
    setShowChallenge(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
    loadCurrentProblem(); // リーダーボードを更新
  };

  if (showChallenge && currentProblem && user) {
    return (
      <OnlineBattleView
        problemId={currentProblem.id}
        problemTitle={currentProblem.title}
        problemDescription={currentProblem.description}
        dataset={{
          train: currentProblem.dataset?.data || [],
          test: currentProblem.dataset?.data?.slice(0, Math.floor((currentProblem.dataset?.data?.length || 0) * 0.3)) || [],
          featureNames: currentProblem.dataset?.featureNames || [],
          labelName: currentProblem.dataset?.targetName || 'target',
          classes: currentProblem.dataset?.classes || []
        }}
        difficulty={currentProblem.difficulty}
        timeLimit={3600} // 1時間の制限時間
        onComplete={(result) => {
          console.log('マルチプレイヤーバトル完了:', result);
          handleBattleComplete(result);
        }}
        isMultiplayer={battleMode === 'team'}
        roomId={roomId}
        userId={user.id}
        username={user.username}
        onBack={handleBattleEnd}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
            <p className="text-2xl text-yellow-100 font-bold">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-red-900 mb-4">エラーが発生しました</h2>
              <p className="text-lg text-red-700 mb-6">{error}</p>
              <button
                onClick={onBack}
                className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">今週の問題はありません</h2>
              <p className="text-lg text-blue-700 mb-6">来週の新しい問題をお待ちください。</p>
              <button
                onClick={onBack}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = WeeklyProblemManager.isProblemActive(currentProblem.id);
  const participantsList = Array.from(participants.values());
  
  // 現在のユーザーを参加者リストに追加（まだ参加していない場合）
  if (user && !participantsList.find(p => p.userId === user.id)) {
    participantsList.push({
      userId: user.id,
      username: user.username,
      isReady: true,
      progress: myProgress,
      currentStep: 'data',
      lastActivity: new Date().toISOString()
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sword className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  マルチプレイヤー戦
                </h1>
                <p className="text-white/80 text-lg">他のプレイヤーと協力して問題を解決</p>
              </div>
              <div className="text-right">
                <div className="text-white/80 font-bold text-lg">週間問題残り時間</div>
                <div className="text-white text-3xl font-mono">
                  {formatWeeklyTime(weeklyTimeRemaining)}
                </div>
                {isBattleActive && (
                  <div className="text-green-300 text-sm font-bold">
                    ⚡ バトル進行中 ({formatTime(timeRemaining)})
                  </div>
                )}
                <div className="text-xs text-white/60 mt-2">
                  接続状態: {isConnected ? '🟢 接続中' : '🔴 切断中'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              {/* 現在の問題 */}
              <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{currentProblem.title}</h2>
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-bold border border-blue-400/30">
                          {currentProblem.category}
                        </span>
                        <span className="bg-green-500/20 text-green-200 px-4 py-2 rounded-full text-sm font-bold border border-green-400/30">
                          {currentProblem.difficulty}
                        </span>
                        <span className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full text-sm font-bold border border-purple-400/30">
                          {currentProblem.dataset?.problemType || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70 font-medium">ステータス</div>
                    <div className={`font-bold text-lg ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {isActive ? '🟢 アクティブ' : '🔴 終了'}
                    </div>
                  </div>
                </div>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">{currentProblem.description}</p>
                
                {/* データセット詳細情報 */}
                {currentProblem.dataset && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
                    <h4 className="font-bold text-white text-lg mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      データセット情報
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-300">{currentProblem.dataset.featureNames?.length || 0}</div>
                        <div className="text-sm text-white/70">特徴量数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-300">{currentProblem.dataset.data?.length || 0}</div>
                        <div className="text-sm text-white/70">サンプル数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-300">{currentProblem.dataset.problemType || 'Unknown'}</div>
                        <div className="text-sm text-white/70">問題タイプ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-300">{currentProblem.dataset.difficulty || 'Unknown'}</div>
                        <div className="text-sm text-white/70">難易度</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 参加モード選択 */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    参加モードを選択
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setBattleMode('individual')}
                      className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 ${
                        battleMode === 'individual'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Users className="w-6 h-6" />
                      <span>個人で参加</span>
                    </button>
                    <button
                      onClick={() => {
                        setBattleMode('team');
                        setShowTeamSelector(true);
                      }}
                      className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 ${
                        battleMode === 'team'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Users className="w-6 h-6" />
                      <span>チームで参加</span>
                    </button>
                  </div>
                </div>
                
                {/* 進捗表示 */}
                {isBattleActive && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-white">進捗</span>
                      <span className="text-xl font-bold text-yellow-300">{myProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${myProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartBattle}
                  disabled={!isActive || isBattleActive}
                  className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isActive && !isBattleActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isBattleActive ? '⚡ バトル進行中...' : isActive ? '🚀 マルチプレイヤー戦を開始' : '❌ 問題終了'}
                </button>
              </div>

              {/* バトル結果 */}
              {battleResults.length > 0 && (
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 mb-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">🏆 バトル結果</h3>
                  </div>
                  <div className="space-y-4">
                    {battleResults.map((result, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-bold text-lg">提出 #{index + 1}</span>
                          <span className="text-yellow-300 font-bold text-xl">
                            {result.score ? Math.min(100, Math.max(0, result.score)).toFixed(1) : 'N/A'}%
                          </span>
                        </div>
                        <div className="text-sm text-white/80 flex space-x-4">
                          <span>🤖 モデル: {result.modelType || 'Unknown'}</span>
                          <span>⏱️ 時間: {result.trainingTime ? `${(result.trainingTime / 1000).toFixed(2)}s` : 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 参加者リスト */}
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">👥 参加者 ({Math.max(1, participantsList.length)}人)</h3>
                </div>
                <div className="space-y-3">
                  {participantsList.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white text-lg">{participant.username}</span>
                      </div>
                      <div className="text-sm text-white/80 font-medium">
                        {participant.isReady ? '✅ 準備完了' : '⏳ 準備中'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* チャット */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">💬 チャット</h3>
                </div>
                <div className="h-64 overflow-y-auto border border-white/20 rounded-xl p-4 mb-4 bg-white/5 backdrop-blur-sm">
                  {(() => {
                    const displayMessages = battleMode === 'team' ? teamChatMessages : chatMessages;
                    return displayMessages.length === 0 ? (
                      <p className="text-white/60 text-center py-8">
                        {battleMode === 'team' ? 'チーム内チャットが開始されました' : 'まだメッセージはありません'}
                      </p>
                    ) : (
                      displayMessages.map((message, index) => (
                        <div key={index} className="mb-3 p-3 bg-white/10 rounded-lg border border-white/20">
                          <div className="font-bold text-blue-300 text-sm">
                            {message.username}
                            {battleMode === 'team' && userTeam?.leaderId === message.userId && (
                              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">リーダー</span>
                            )}
                          </div>
                          <div className="text-white/90">{message.message}</div>
                        </div>
                      ))
                    );
                  })()}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder={battleMode === 'team' ? 'チーム内メッセージを入力...' : 'メッセージを入力...'}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          const message = input.value.trim();
                          if (battleMode === 'team' && userTeam) {
                            // チーム内チャットに送信
                            try {
                              TeamChatManager.sendTeamMessage(userTeam.id, message);
                              input.value = '';
                            } catch (error) {
                              console.error('チームメッセージ送信エラー:', error);
                            }
                          } else {
                            // 通常のチャット
                            sendChatMessage(message);
                            input.value = '';
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input.value.trim()) {
                        const message = input.value.trim();
                        if (battleMode === 'team' && userTeam) {
                          // チーム内チャットに送信
                          try {
                            TeamChatManager.sendTeamMessage(userTeam.id, message);
                            input.value = '';
                          } catch (error) {
                            console.error('チームメッセージ送信エラー:', error);
                          }
                        } else {
                          // 通常のチャット
                          sendChatMessage(message);
                          input.value = '';
                        }
                      }
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const testMessage = `🧪 テストメッセージ ${new Date().toLocaleTimeString()}`;
                      console.log('テストメッセージ送信:', testMessage);
                      if (battleMode === 'team' && userTeam) {
                        // チーム内チャットに送信
                        try {
                          TeamChatManager.sendTeamMessage(userTeam.id, testMessage);
                          console.log('チームチャットに送信:', testMessage);
                        } catch (error) {
                          console.error('チームメッセージ送信エラー:', error);
                        }
                      } else {
                        // 通常のチャット
                        sendChatMessage(testMessage);
                        console.log('通常チャットに送信:', testMessage);
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-all duration-300 text-sm"
                    title="チャット機能のテスト"
                  >
                    🧪 テスト
                  </button>
                </div>
              </div>

              {/* リーダーボード */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🏆 リーダーボード</h3>
                </div>
                <div className="space-y-3">
                  {localLeaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-lg">まだ提出がありません。</p>
                      <p className="text-white/40 text-sm mt-2">最初の提出をしてリーダーボードに参加しましょう！</p>
                    </div>
                  ) : (
                    localLeaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {entry.rank}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{entry.username}</span>
                            <div className="text-sm text-white/70">{entry.modelType || 'ロジスティック回帰'}</div>
                          </div>
                        </div>
                        <span className="font-bold text-yellow-300 text-xl">
                          {isNaN(entry.score || 0) ? '0.0' : Math.min(100, Math.max(0, entry.score || 0)).toFixed(1)}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* チーム選択モーダル */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">チームを選択</h2>
              <button
                onClick={() => setShowTeamSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 新しいチーム作成 */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-gray-700 mb-2">新しいチームを作成</h3>
                <p className="text-gray-600 mb-4">チームリーダーとして新しいチームを作成できます</p>
                <button
                  onClick={() => {
                    const teamName = prompt('チーム名を入力してください:');
                    if (teamName) {
                      try {
                        const team = TeamManager.createTeam(teamName, '新しく作成されたチーム', 5, false);
                        setUserTeam(team);
                        setShowTeamSelector(false);
                        loadAvailableTeams(); // チーム一覧を再読み込み
                        console.log('チームを作成しました:', team);
                      } catch (error) {
                        console.error('チーム作成エラー:', error);
                        alert('チームの作成に失敗しました: ' + (error as Error).message);
                      }
                    }
                  }}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  チームを作成
                </button>
              </div>

              {/* 既存のチーム一覧 */}
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4">参加可能なチーム</h3>
                {availableTeams.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">参加可能なチームはありません</p>
                ) : (
                  <div className="space-y-3">
                    {availableTeams.map((team) => (
                      <div key={team.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800">{team.name}</h4>
                          <p className="text-sm text-gray-600">
                            メンバー: {team.members.length}人 / リーダー: {team.leaderName}
                          </p>
                          <p className="text-xs text-gray-500">{team.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            try {
                              const joinedTeam = TeamManager.joinTeam(team.id);
                              setUserTeam(joinedTeam);
                              setShowTeamSelector(false);
                              loadAvailableTeams(); // チーム一覧を再読み込み
                              console.log('チームに参加しました:', joinedTeam);
                            } catch (error) {
                              console.error('チーム参加エラー:', error);
                              alert('チームへの参加に失敗しました: ' + (error as Error).message);
                            }
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          参加
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
