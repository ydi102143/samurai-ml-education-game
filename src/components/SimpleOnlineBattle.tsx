import { useState, useEffect } from 'react';
import { Sword, Users, Trophy, Send, Target, Clock, ChevronRight, MessageCircle } from 'lucide-react';
import { OnlineBattleView } from './OnlineBattleView';
import { WeeklyProblemManager, WeeklyProblem } from '../utils/weeklyProblemManager';
import { userManager } from '../utils/userManager';
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleTeamManager } from '../utils/simpleTeamManager';
import { SimpleChatManager } from '../utils/simpleChatManager';
import { SimpleBattleManager } from '../utils/simpleBattleManager';
import type { 
  SimpleTeam, 
  SimpleChatMessage, 
  SimpleBattleRoom, 
  SimpleLeaderboardEntry,
  SimpleBattleState
} from '../types/simpleBattle';

interface SimpleOnlineBattleProps {
  onBack: () => void;
}

export function SimpleOnlineBattle({ onBack }: SimpleOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
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
  const [userTeam, setUserTeam] = useState<SimpleTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<SimpleTeam[]>([]);
  const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<SimpleChatMessage[]>([]);
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [battleState, setBattleState] = useState<SimpleBattleState | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const user = userManager.getCurrentUser();

  // 初期化
  useEffect(() => {
    loadCurrentProblem();
    loadAvailableTeams();
    loadBattleRooms();
  }, []);

  // チーム内チャットの購読
  useEffect(() => {
    if (userTeam) {
      const unsubscribe = SimpleChatManager.subscribeToMessages(userTeam.id, (message) => {
        setTeamChatMessages(prev => [...prev, message]);
      });
      
      // 既存のメッセージを読み込み
      const messages = SimpleChatManager.getMessages(userTeam.id);
      setTeamChatMessages(messages);

      return unsubscribe;
    }
  }, [userTeam]);

  // グローバルチャットの購読
  useEffect(() => {
    const unsubscribe = SimpleChatManager.subscribeToMessages(undefined, (message) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    // 既存のメッセージを読み込み
    const messages = SimpleChatManager.getMessages();
    setChatMessages(messages);

    return unsubscribe;
  }, []);

  // 現在の問題を読み込み
  const loadCurrentProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // バトルルームを作成
      const room = SimpleBattleManager.createBattleRoom(
        problem.id,
        problem.name,
        'individual',
        10,
        3600
      );
      setRoomId(room.id);
      setBattleState(SimpleBattleManager.getBattleState(room.id));
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // チーム一覧を読み込み
  const loadAvailableTeams = async () => {
    try {
      const teams = SimpleTeamManager.getAvailableTeams();
      setAvailableTeams(teams);
      
      // ユーザーの現在のチームを取得
      if (user) {
        const currentTeam = SimpleTeamManager.getUserTeam(user.id);
        setUserTeam(currentTeam);
      }
    } catch (error) {
      console.error('チーム一覧読み込みエラー:', error);
    }
  };

  // バトルルーム一覧を読み込み
  const loadBattleRooms = async () => {
    try {
      const rooms = SimpleBattleManager.getAvailableBattleRooms();
      console.log('利用可能なバトルルーム:', rooms);
    } catch (error) {
      console.error('バトルルーム読み込みエラー:', error);
    }
  };

  // リーダーボード読み込み
  const loadLeaderboard = async (problemId: string) => {
    try {
      console.log('リーダーボード読み込み開始:', problemId);
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      console.log('リーダーボードデータ:', leaderboardData);
      
      if (leaderboardData && leaderboardData.submissions) {
        const leaderboardEntries: SimpleLeaderboardEntry[] = leaderboardData.submissions.map((sub, index) => ({
          rank: index + 1,
          userId: sub.userId,
          username: sub.username,
          teamId: undefined,
          teamName: undefined,
          score: sub.score || 0,
          modelType: sub.modelType || 'Unknown',
          submittedAt: sub.submittedAt.toISOString(),
          isCurrentUser: sub.userId === user?.id
        }));
        setLeaderboard(leaderboardEntries);
      } else {
        console.log('リーダーボードデータが空です');
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  // 週間問題の残り時間計算（動的更新）
  useEffect(() => {
    const calculateWeeklyTimeRemaining = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);
      
      const timeDiff = nextMonday.getTime() - now.getTime();
      setWeeklyTimeRemaining(Math.max(0, Math.floor(timeDiff / 1000)));
    };

    calculateWeeklyTimeRemaining();
    const interval = setInterval(calculateWeeklyTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // バトル時間の計算
  useEffect(() => {
    if (isBattleActive && battleStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - battleStartTime;
        setTimeRemaining(Math.floor(elapsed / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBattleActive, battleStartTime]);

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

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    // チーム戦の場合はチームが選択されているかチェック
    if (battleMode === 'team' && !userTeam) {
      setShowTeamSelector(true);
      return;
    }

    setShowChallenge(true);
    setIsBattleActive(true);
    setBattleStartTime(Date.now());
    setMyProgress(0);
    
    // チーム戦の場合はチーム内チャットを初期化
    if (battleMode === 'team' && userTeam) {
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

  const handleBattleEnd = () => {
    setShowChallenge(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
    loadCurrentProblem(); // リーダーボードを更新
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

  if (showChallenge && currentProblem && user) {
    return (
      <OnlineBattleView
        problemId={currentProblem.id}
        problemTitle={currentProblem.name}
        problemDescription={currentProblem.description}
        dataset={{
          train: currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7)),
          test: currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7)),
          featureNames: currentProblem.featureNames,
          labelName: currentProblem.targetName,
          classes: currentProblem.classes || []
        }}
        difficulty="medium"
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
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
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
                  オンライン対戦
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
                      <h2 className="text-2xl font-bold text-white">{currentProblem?.name || '問題を読み込み中...'}</h2>
                      <p className="text-white/70">{currentProblem?.description || ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.featureNames?.length || 0}</div>
                    <div className="text-sm text-white/80">特徴量数</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.data?.length || 0}</div>
                    <div className="text-sm text-white/80">サンプル数</div>
                  </div>
                </div>
              </div>

              {/* 参加モード選択 */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  参加モードを選択
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button
                    onClick={() => setBattleMode('individual')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'individual'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👤</div>
                      <div className="text-xl font-bold mb-2">個人で参加</div>
                      <div className="text-sm opacity-70">一人でバトルに参加</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setBattleMode('team')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'team'
                        ? 'border-green-400 bg-green-400/20 text-green-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👥</div>
                      <div className="text-xl font-bold mb-2">チームで参加</div>
                      <div className="text-sm opacity-70">チームメンバーと協力</div>
                    </div>
                  </button>
                </div>

                {battleMode === 'team' && userTeam && (
                  <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-300 font-bold">選択中のチーム: {userTeam.name}</div>
                        <div className="text-green-200 text-sm">メンバー数: {userTeam.members.length}人</div>
                      </div>
                      <button
                        onClick={() => setShowTeamSelector(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        チーム変更
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleStartBattle}
                    className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 マルチプレイヤー戦を開始
                  </button>
                </div>
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

              {/* 参加者 */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">👥 参加者 ({battleState?.participants.length || 0}人)</h3>
                </div>
                <div className="space-y-3">
                  {battleState?.participants.length === 0 ? (
                    <p className="text-white/60 text-center py-4">まだ参加者がいません。</p>
                  ) : (
                    battleState.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{participant.username}</span>
                            {participant.teamName && (
                              <div className="text-sm text-blue-300">チーム: {participant.teamName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isReady && (
                            <span className="text-green-400 text-sm font-bold">✅ 準備完了</span>
                          )}
                          <div className="text-sm text-white/70">
                            {participant.progress}% 完了
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* チーム戦の場合のみチャットを表示 */}
              {battleMode === 'team' && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">💬 チームチャット</h3>
                  </div>
                  
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {teamChatMessages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.messageType === 'system' 
                          ? 'bg-yellow-500/20 text-yellow-200' 
                          : 'bg-white/10 text-white'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm">{message.username}</span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="チーム内メッセージを入力..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && chatMessage.trim()) {
                          if (userTeam) {
                            SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          }
                          setChatMessage('');
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    />
                    <button
                      onClick={() => {
                        if (chatMessage.trim() && userTeam) {
                          SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          setChatMessage('');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* リーダーボード */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🏆 リーダーボード</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-lg">まだ提出がありません。</p>
                      <p className="text-white/40 text-sm mt-2">最初の提出をしてリーダーボードに参加しましょう！</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {entry.rank}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{entry.username}</span>
                            <div className="text-sm text-white/70">{entry.modelType || 'Unknown'}</div>
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
                        const team = SimpleTeamManager.createTeam(teamName, '新しく作成されたチーム', 5);
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
                              const joinedTeam = SimpleTeamManager.joinTeam(team.id);
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

import { OnlineBattleView } from './OnlineBattleView';
import { WeeklyProblemManager, WeeklyProblem } from '../utils/weeklyProblemManager';
import { userManager } from '../utils/userManager';
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleTeamManager } from '../utils/simpleTeamManager';
import { SimpleChatManager } from '../utils/simpleChatManager';
import { SimpleBattleManager } from '../utils/simpleBattleManager';
import type { 
  SimpleTeam, 
  SimpleChatMessage, 
  SimpleBattleRoom, 
  SimpleLeaderboardEntry,
  SimpleBattleState
} from '../types/simpleBattle';

interface SimpleOnlineBattleProps {
  onBack: () => void;
}

export function SimpleOnlineBattle({ onBack }: SimpleOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
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
  const [userTeam, setUserTeam] = useState<SimpleTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<SimpleTeam[]>([]);
  const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<SimpleChatMessage[]>([]);
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [battleState, setBattleState] = useState<SimpleBattleState | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const user = userManager.getCurrentUser();

  // 初期化
  useEffect(() => {
    loadCurrentProblem();
    loadAvailableTeams();
    loadBattleRooms();
  }, []);

  // チーム内チャットの購読
  useEffect(() => {
    if (userTeam) {
      const unsubscribe = SimpleChatManager.subscribeToMessages(userTeam.id, (message) => {
        setTeamChatMessages(prev => [...prev, message]);
      });
      
      // 既存のメッセージを読み込み
      const messages = SimpleChatManager.getMessages(userTeam.id);
      setTeamChatMessages(messages);

      return unsubscribe;
    }
  }, [userTeam]);

  // グローバルチャットの購読
  useEffect(() => {
    const unsubscribe = SimpleChatManager.subscribeToMessages(undefined, (message) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    // 既存のメッセージを読み込み
    const messages = SimpleChatManager.getMessages();
    setChatMessages(messages);

    return unsubscribe;
  }, []);

  // 現在の問題を読み込み
  const loadCurrentProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // バトルルームを作成
      const room = SimpleBattleManager.createBattleRoom(
        problem.id,
        problem.name,
        'individual',
        10,
        3600
      );
      setRoomId(room.id);
      setBattleState(SimpleBattleManager.getBattleState(room.id));
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // チーム一覧を読み込み
  const loadAvailableTeams = async () => {
    try {
      const teams = SimpleTeamManager.getAvailableTeams();
      setAvailableTeams(teams);
      
      // ユーザーの現在のチームを取得
      if (user) {
        const currentTeam = SimpleTeamManager.getUserTeam(user.id);
        setUserTeam(currentTeam);
      }
    } catch (error) {
      console.error('チーム一覧読み込みエラー:', error);
    }
  };

  // バトルルーム一覧を読み込み
  const loadBattleRooms = async () => {
    try {
      const rooms = SimpleBattleManager.getAvailableBattleRooms();
      console.log('利用可能なバトルルーム:', rooms);
    } catch (error) {
      console.error('バトルルーム読み込みエラー:', error);
    }
  };

  // リーダーボード読み込み
  const loadLeaderboard = async (problemId: string) => {
    try {
      console.log('リーダーボード読み込み開始:', problemId);
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      console.log('リーダーボードデータ:', leaderboardData);
      
      if (leaderboardData && leaderboardData.submissions) {
        const leaderboardEntries: SimpleLeaderboardEntry[] = leaderboardData.submissions.map((sub, index) => ({
          rank: index + 1,
          userId: sub.userId,
          username: sub.username,
          teamId: undefined,
          teamName: undefined,
          score: sub.score || 0,
          modelType: sub.modelType || 'Unknown',
          submittedAt: sub.submittedAt.toISOString(),
          isCurrentUser: sub.userId === user?.id
        }));
        setLeaderboard(leaderboardEntries);
      } else {
        console.log('リーダーボードデータが空です');
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  // 週間問題の残り時間計算（動的更新）
  useEffect(() => {
    const calculateWeeklyTimeRemaining = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);
      
      const timeDiff = nextMonday.getTime() - now.getTime();
      setWeeklyTimeRemaining(Math.max(0, Math.floor(timeDiff / 1000)));
    };

    calculateWeeklyTimeRemaining();
    const interval = setInterval(calculateWeeklyTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // バトル時間の計算
  useEffect(() => {
    if (isBattleActive && battleStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - battleStartTime;
        setTimeRemaining(Math.floor(elapsed / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBattleActive, battleStartTime]);

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

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    // チーム戦の場合はチームが選択されているかチェック
    if (battleMode === 'team' && !userTeam) {
      setShowTeamSelector(true);
      return;
    }

    setShowChallenge(true);
    setIsBattleActive(true);
    setBattleStartTime(Date.now());
    setMyProgress(0);
    
    // チーム戦の場合はチーム内チャットを初期化
    if (battleMode === 'team' && userTeam) {
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

  const handleBattleEnd = () => {
    setShowChallenge(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
    loadCurrentProblem(); // リーダーボードを更新
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

  if (showChallenge && currentProblem && user) {
    return (
      <OnlineBattleView
        problemId={currentProblem.id}
        problemTitle={currentProblem.name}
        problemDescription={currentProblem.description}
        dataset={{
          train: currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7)),
          test: currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7)),
          featureNames: currentProblem.featureNames,
          labelName: currentProblem.targetName,
          classes: currentProblem.classes || []
        }}
        difficulty="medium"
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
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
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
                  オンライン対戦
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
                      <h2 className="text-2xl font-bold text-white">{currentProblem?.name || '問題を読み込み中...'}</h2>
                      <p className="text-white/70">{currentProblem?.description || ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.featureNames?.length || 0}</div>
                    <div className="text-sm text-white/80">特徴量数</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.data?.length || 0}</div>
                    <div className="text-sm text-white/80">サンプル数</div>
                  </div>
                </div>
              </div>

              {/* 参加モード選択 */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  参加モードを選択
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button
                    onClick={() => setBattleMode('individual')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'individual'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👤</div>
                      <div className="text-xl font-bold mb-2">個人で参加</div>
                      <div className="text-sm opacity-70">一人でバトルに参加</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setBattleMode('team')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'team'
                        ? 'border-green-400 bg-green-400/20 text-green-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👥</div>
                      <div className="text-xl font-bold mb-2">チームで参加</div>
                      <div className="text-sm opacity-70">チームメンバーと協力</div>
                    </div>
                  </button>
                </div>

                {battleMode === 'team' && userTeam && (
                  <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-300 font-bold">選択中のチーム: {userTeam.name}</div>
                        <div className="text-green-200 text-sm">メンバー数: {userTeam.members.length}人</div>
                      </div>
                      <button
                        onClick={() => setShowTeamSelector(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        チーム変更
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleStartBattle}
                    className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 マルチプレイヤー戦を開始
                  </button>
                </div>
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

              {/* 参加者 */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">👥 参加者 ({battleState?.participants.length || 0}人)</h3>
                </div>
                <div className="space-y-3">
                  {battleState?.participants.length === 0 ? (
                    <p className="text-white/60 text-center py-4">まだ参加者がいません。</p>
                  ) : (
                    battleState.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{participant.username}</span>
                            {participant.teamName && (
                              <div className="text-sm text-blue-300">チーム: {participant.teamName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isReady && (
                            <span className="text-green-400 text-sm font-bold">✅ 準備完了</span>
                          )}
                          <div className="text-sm text-white/70">
                            {participant.progress}% 完了
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* チーム戦の場合のみチャットを表示 */}
              {battleMode === 'team' && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">💬 チームチャット</h3>
                  </div>
                  
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {teamChatMessages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.messageType === 'system' 
                          ? 'bg-yellow-500/20 text-yellow-200' 
                          : 'bg-white/10 text-white'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm">{message.username}</span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="チーム内メッセージを入力..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && chatMessage.trim()) {
                          if (userTeam) {
                            SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          }
                          setChatMessage('');
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    />
                    <button
                      onClick={() => {
                        if (chatMessage.trim() && userTeam) {
                          SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          setChatMessage('');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* リーダーボード */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🏆 リーダーボード</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-lg">まだ提出がありません。</p>
                      <p className="text-white/40 text-sm mt-2">最初の提出をしてリーダーボードに参加しましょう！</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {entry.rank}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{entry.username}</span>
                            <div className="text-sm text-white/70">{entry.modelType || 'Unknown'}</div>
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
                        const team = SimpleTeamManager.createTeam(teamName, '新しく作成されたチーム', 5);
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
                              const joinedTeam = SimpleTeamManager.joinTeam(team.id);
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
import { OnlineBattleView } from './OnlineBattleView';
import { WeeklyProblemManager, WeeklyProblem } from '../utils/weeklyProblemManager';
import { userManager } from '../utils/userManager';
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleTeamManager } from '../utils/simpleTeamManager';
import { SimpleChatManager } from '../utils/simpleChatManager';
import { SimpleBattleManager } from '../utils/simpleBattleManager';
import type { 
  SimpleTeam, 
  SimpleChatMessage, 
  SimpleBattleRoom, 
  SimpleLeaderboardEntry,
  SimpleBattleState
} from '../types/simpleBattle';

interface SimpleOnlineBattleProps {
  onBack: () => void;
}

export function SimpleOnlineBattle({ onBack }: SimpleOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
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
  const [userTeam, setUserTeam] = useState<SimpleTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<SimpleTeam[]>([]);
  const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<SimpleChatMessage[]>([]);
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [battleState, setBattleState] = useState<SimpleBattleState | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const user = userManager.getCurrentUser();

  // 初期化
  useEffect(() => {
    loadCurrentProblem();
    loadAvailableTeams();
    loadBattleRooms();
  }, []);

  // チーム内チャットの購読
  useEffect(() => {
    if (userTeam) {
      const unsubscribe = SimpleChatManager.subscribeToMessages(userTeam.id, (message) => {
        setTeamChatMessages(prev => [...prev, message]);
      });
      
      // 既存のメッセージを読み込み
      const messages = SimpleChatManager.getMessages(userTeam.id);
      setTeamChatMessages(messages);

      return unsubscribe;
    }
  }, [userTeam]);

  // グローバルチャットの購読
  useEffect(() => {
    const unsubscribe = SimpleChatManager.subscribeToMessages(undefined, (message) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    // 既存のメッセージを読み込み
    const messages = SimpleChatManager.getMessages();
    setChatMessages(messages);

    return unsubscribe;
  }, []);

  // 現在の問題を読み込み
  const loadCurrentProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // バトルルームを作成
      const room = SimpleBattleManager.createBattleRoom(
        problem.id,
        problem.name,
        'individual',
        10,
        3600
      );
      setRoomId(room.id);
      setBattleState(SimpleBattleManager.getBattleState(room.id));
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // チーム一覧を読み込み
  const loadAvailableTeams = async () => {
    try {
      const teams = SimpleTeamManager.getAvailableTeams();
      setAvailableTeams(teams);
      
      // ユーザーの現在のチームを取得
      if (user) {
        const currentTeam = SimpleTeamManager.getUserTeam(user.id);
        setUserTeam(currentTeam);
      }
    } catch (error) {
      console.error('チーム一覧読み込みエラー:', error);
    }
  };

  // バトルルーム一覧を読み込み
  const loadBattleRooms = async () => {
    try {
      const rooms = SimpleBattleManager.getAvailableBattleRooms();
      console.log('利用可能なバトルルーム:', rooms);
    } catch (error) {
      console.error('バトルルーム読み込みエラー:', error);
    }
  };

  // リーダーボード読み込み
  const loadLeaderboard = async (problemId: string) => {
    try {
      console.log('リーダーボード読み込み開始:', problemId);
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      console.log('リーダーボードデータ:', leaderboardData);
      
      if (leaderboardData && leaderboardData.submissions) {
        const leaderboardEntries: SimpleLeaderboardEntry[] = leaderboardData.submissions.map((sub, index) => ({
          rank: index + 1,
          userId: sub.userId,
          username: sub.username,
          teamId: undefined,
          teamName: undefined,
          score: sub.score || 0,
          modelType: sub.modelType || 'Unknown',
          submittedAt: sub.submittedAt.toISOString(),
          isCurrentUser: sub.userId === user?.id
        }));
        setLeaderboard(leaderboardEntries);
      } else {
        console.log('リーダーボードデータが空です');
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  // 週間問題の残り時間計算（動的更新）
  useEffect(() => {
    const calculateWeeklyTimeRemaining = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);
      
      const timeDiff = nextMonday.getTime() - now.getTime();
      setWeeklyTimeRemaining(Math.max(0, Math.floor(timeDiff / 1000)));
    };

    calculateWeeklyTimeRemaining();
    const interval = setInterval(calculateWeeklyTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // バトル時間の計算
  useEffect(() => {
    if (isBattleActive && battleStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - battleStartTime;
        setTimeRemaining(Math.floor(elapsed / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBattleActive, battleStartTime]);

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

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    // チーム戦の場合はチームが選択されているかチェック
    if (battleMode === 'team' && !userTeam) {
      setShowTeamSelector(true);
      return;
    }

    setShowChallenge(true);
    setIsBattleActive(true);
    setBattleStartTime(Date.now());
    setMyProgress(0);
    
    // チーム戦の場合はチーム内チャットを初期化
    if (battleMode === 'team' && userTeam) {
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

  const handleBattleEnd = () => {
    setShowChallenge(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
    loadCurrentProblem(); // リーダーボードを更新
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

  if (showChallenge && currentProblem && user) {
    return (
      <OnlineBattleView
        problemId={currentProblem.id}
        problemTitle={currentProblem.name}
        problemDescription={currentProblem.description}
        dataset={{
          train: currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7)),
          test: currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7)),
          featureNames: currentProblem.featureNames,
          labelName: currentProblem.targetName,
          classes: currentProblem.classes || []
        }}
        difficulty="medium"
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
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
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
                  オンライン対戦
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
                      <h2 className="text-2xl font-bold text-white">{currentProblem?.name || '問題を読み込み中...'}</h2>
                      <p className="text-white/70">{currentProblem?.description || ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.featureNames?.length || 0}</div>
                    <div className="text-sm text-white/80">特徴量数</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.data?.length || 0}</div>
                    <div className="text-sm text-white/80">サンプル数</div>
                  </div>
                </div>
              </div>

              {/* 参加モード選択 */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  参加モードを選択
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button
                    onClick={() => setBattleMode('individual')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'individual'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👤</div>
                      <div className="text-xl font-bold mb-2">個人で参加</div>
                      <div className="text-sm opacity-70">一人でバトルに参加</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setBattleMode('team')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'team'
                        ? 'border-green-400 bg-green-400/20 text-green-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👥</div>
                      <div className="text-xl font-bold mb-2">チームで参加</div>
                      <div className="text-sm opacity-70">チームメンバーと協力</div>
                    </div>
                  </button>
                </div>

                {battleMode === 'team' && userTeam && (
                  <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-300 font-bold">選択中のチーム: {userTeam.name}</div>
                        <div className="text-green-200 text-sm">メンバー数: {userTeam.members.length}人</div>
                      </div>
                      <button
                        onClick={() => setShowTeamSelector(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        チーム変更
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleStartBattle}
                    className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 マルチプレイヤー戦を開始
                  </button>
                </div>
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

              {/* 参加者 */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">👥 参加者 ({battleState?.participants.length || 0}人)</h3>
                </div>
                <div className="space-y-3">
                  {battleState?.participants.length === 0 ? (
                    <p className="text-white/60 text-center py-4">まだ参加者がいません。</p>
                  ) : (
                    battleState.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{participant.username}</span>
                            {participant.teamName && (
                              <div className="text-sm text-blue-300">チーム: {participant.teamName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isReady && (
                            <span className="text-green-400 text-sm font-bold">✅ 準備完了</span>
                          )}
                          <div className="text-sm text-white/70">
                            {participant.progress}% 完了
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* チーム戦の場合のみチャットを表示 */}
              {battleMode === 'team' && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">💬 チームチャット</h3>
                  </div>
                  
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {teamChatMessages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.messageType === 'system' 
                          ? 'bg-yellow-500/20 text-yellow-200' 
                          : 'bg-white/10 text-white'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm">{message.username}</span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="チーム内メッセージを入力..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && chatMessage.trim()) {
                          if (userTeam) {
                            SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          }
                          setChatMessage('');
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    />
                    <button
                      onClick={() => {
                        if (chatMessage.trim() && userTeam) {
                          SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          setChatMessage('');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* リーダーボード */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🏆 リーダーボード</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-lg">まだ提出がありません。</p>
                      <p className="text-white/40 text-sm mt-2">最初の提出をしてリーダーボードに参加しましょう！</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {entry.rank}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{entry.username}</span>
                            <div className="text-sm text-white/70">{entry.modelType || 'Unknown'}</div>
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
                        const team = SimpleTeamManager.createTeam(teamName, '新しく作成されたチーム', 5);
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
                              const joinedTeam = SimpleTeamManager.joinTeam(team.id);
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

import { OnlineBattleView } from './OnlineBattleView';
import { WeeklyProblemManager, WeeklyProblem } from '../utils/weeklyProblemManager';
import { userManager } from '../utils/userManager';
import { getRandomOnlineProblemDataset, type OnlineProblemDataset } from '../data/onlineProblemDatasets';
import { CompetitionSubmissionManager } from '../utils/competitionSubmission';
import { SimpleTeamManager } from '../utils/simpleTeamManager';
import { SimpleChatManager } from '../utils/simpleChatManager';
import { SimpleBattleManager } from '../utils/simpleBattleManager';
import type { 
  SimpleTeam, 
  SimpleChatMessage, 
  SimpleBattleRoom, 
  SimpleLeaderboardEntry,
  SimpleBattleState
} from '../types/simpleBattle';

interface SimpleOnlineBattleProps {
  onBack: () => void;
}

export function SimpleOnlineBattle({ onBack }: SimpleOnlineBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<OnlineProblemDataset | null>(null);
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
  const [userTeam, setUserTeam] = useState<SimpleTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<SimpleTeam[]>([]);
  const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<SimpleChatMessage[]>([]);
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [battleState, setBattleState] = useState<SimpleBattleState | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const user = userManager.getCurrentUser();

  // 初期化
  useEffect(() => {
    loadCurrentProblem();
    loadAvailableTeams();
    loadBattleRooms();
  }, []);

  // チーム内チャットの購読
  useEffect(() => {
    if (userTeam) {
      const unsubscribe = SimpleChatManager.subscribeToMessages(userTeam.id, (message) => {
        setTeamChatMessages(prev => [...prev, message]);
      });
      
      // 既存のメッセージを読み込み
      const messages = SimpleChatManager.getMessages(userTeam.id);
      setTeamChatMessages(messages);

      return unsubscribe;
    }
  }, [userTeam]);

  // グローバルチャットの購読
  useEffect(() => {
    const unsubscribe = SimpleChatManager.subscribeToMessages(undefined, (message) => {
      setChatMessages(prev => [...prev, message]);
    });
    
    // 既存のメッセージを読み込み
    const messages = SimpleChatManager.getMessages();
    setChatMessages(messages);

    return unsubscribe;
  }, []);

  // 現在の問題を読み込み
  const loadCurrentProblem = async () => {
    try {
      setLoading(true);
      const problem = getRandomOnlineProblemDataset();
      setCurrentProblem(problem);
      
      // バトルルームを作成
      const room = SimpleBattleManager.createBattleRoom(
        problem.id,
        problem.name,
        'individual',
        10,
        3600
      );
      setRoomId(room.id);
      setBattleState(SimpleBattleManager.getBattleState(room.id));
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError('問題の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // チーム一覧を読み込み
  const loadAvailableTeams = async () => {
    try {
      const teams = SimpleTeamManager.getAvailableTeams();
      setAvailableTeams(teams);
      
      // ユーザーの現在のチームを取得
      if (user) {
        const currentTeam = SimpleTeamManager.getUserTeam(user.id);
        setUserTeam(currentTeam);
      }
    } catch (error) {
      console.error('チーム一覧読み込みエラー:', error);
    }
  };

  // バトルルーム一覧を読み込み
  const loadBattleRooms = async () => {
    try {
      const rooms = SimpleBattleManager.getAvailableBattleRooms();
      console.log('利用可能なバトルルーム:', rooms);
    } catch (error) {
      console.error('バトルルーム読み込みエラー:', error);
    }
  };

  // リーダーボード読み込み
  const loadLeaderboard = async (problemId: string) => {
    try {
      console.log('リーダーボード読み込み開始:', problemId);
      const leaderboardData = await CompetitionSubmissionManager.getLeaderboard(problemId);
      console.log('リーダーボードデータ:', leaderboardData);
      
      if (leaderboardData && leaderboardData.submissions) {
        const leaderboardEntries: SimpleLeaderboardEntry[] = leaderboardData.submissions.map((sub, index) => ({
          rank: index + 1,
          userId: sub.userId,
          username: sub.username,
          teamId: undefined,
          teamName: undefined,
          score: sub.score || 0,
          modelType: sub.modelType || 'Unknown',
          submittedAt: sub.submittedAt.toISOString(),
          isCurrentUser: sub.userId === user?.id
        }));
        setLeaderboard(leaderboardEntries);
      } else {
        console.log('リーダーボードデータが空です');
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('リーダーボード読み込みエラー:', error);
    }
  };

  // 週間問題の残り時間計算（動的更新）
  useEffect(() => {
    const calculateWeeklyTimeRemaining = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
      nextMonday.setHours(0, 0, 0, 0);
      
      const timeDiff = nextMonday.getTime() - now.getTime();
      setWeeklyTimeRemaining(Math.max(0, Math.floor(timeDiff / 1000)));
    };

    calculateWeeklyTimeRemaining();
    const interval = setInterval(calculateWeeklyTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // バトル時間の計算
  useEffect(() => {
    if (isBattleActive && battleStartTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - battleStartTime;
        setTimeRemaining(Math.floor(elapsed / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isBattleActive, battleStartTime]);

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

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    // チーム戦の場合はチームが選択されているかチェック
    if (battleMode === 'team' && !userTeam) {
      setShowTeamSelector(true);
      return;
    }

    setShowChallenge(true);
    setIsBattleActive(true);
    setBattleStartTime(Date.now());
    setMyProgress(0);
    
    // チーム戦の場合はチーム内チャットを初期化
    if (battleMode === 'team' && userTeam) {
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

  const handleBattleEnd = () => {
    setShowChallenge(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
    loadCurrentProblem(); // リーダーボードを更新
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

  if (showChallenge && currentProblem && user) {
    return (
      <OnlineBattleView
        problemId={currentProblem.id}
        problemTitle={currentProblem.name}
        problemDescription={currentProblem.description}
        dataset={{
          train: currentProblem.data.slice(0, Math.floor(currentProblem.data.length * 0.7)),
          test: currentProblem.data.slice(Math.floor(currentProblem.data.length * 0.7)),
          featureNames: currentProblem.featureNames,
          labelName: currentProblem.targetName,
          classes: currentProblem.classes || []
        }}
        difficulty="medium"
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
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
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
                  オンライン対戦
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
                      <h2 className="text-2xl font-bold text-white">{currentProblem?.name || '問題を読み込み中...'}</h2>
                      <p className="text-white/70">{currentProblem?.description || ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.featureNames?.length || 0}</div>
                    <div className="text-sm text-white/80">特徴量数</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{currentProblem?.data?.length || 0}</div>
                    <div className="text-sm text-white/80">サンプル数</div>
                  </div>
                </div>
              </div>

              {/* 参加モード選択 */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/30 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  参加モードを選択
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <button
                    onClick={() => setBattleMode('individual')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'individual'
                        ? 'border-blue-400 bg-blue-400/20 text-blue-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👤</div>
                      <div className="text-xl font-bold mb-2">個人で参加</div>
                      <div className="text-sm opacity-70">一人でバトルに参加</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setBattleMode('team')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      battleMode === 'team'
                        ? 'border-green-400 bg-green-400/20 text-green-300'
                        : 'border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">👥</div>
                      <div className="text-xl font-bold mb-2">チームで参加</div>
                      <div className="text-sm opacity-70">チームメンバーと協力</div>
                    </div>
                  </button>
                </div>

                {battleMode === 'team' && userTeam && (
                  <div className="mb-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-300 font-bold">選択中のチーム: {userTeam.name}</div>
                        <div className="text-green-200 text-sm">メンバー数: {userTeam.members.length}人</div>
                      </div>
                      <button
                        onClick={() => setShowTeamSelector(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        チーム変更
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleStartBattle}
                    className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🚀 マルチプレイヤー戦を開始
                  </button>
                </div>
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

              {/* 参加者 */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">👥 参加者 ({battleState?.participants.length || 0}人)</h3>
                </div>
                <div className="space-y-3">
                  {battleState?.participants.length === 0 ? (
                    <p className="text-white/60 text-center py-4">まだ参加者がいません。</p>
                  ) : (
                    battleState.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{participant.username}</span>
                            {participant.teamName && (
                              <div className="text-sm text-blue-300">チーム: {participant.teamName}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {participant.isReady && (
                            <span className="text-green-400 text-sm font-bold">✅ 準備完了</span>
                          )}
                          <div className="text-sm text-white/70">
                            {participant.progress}% 完了
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* チーム戦の場合のみチャットを表示 */}
              {battleMode === 'team' && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">💬 チームチャット</h3>
                  </div>
                  
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {teamChatMessages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.messageType === 'system' 
                          ? 'bg-yellow-500/20 text-yellow-200' 
                          : 'bg-white/10 text-white'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm">{message.username}</span>
                          <span className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="チーム内メッセージを入力..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && chatMessage.trim()) {
                          if (userTeam) {
                            SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          }
                          setChatMessage('');
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    />
                    <button
                      onClick={() => {
                        if (chatMessage.trim() && userTeam) {
                          SimpleChatManager.sendTeamMessage(userTeam.id, chatMessage);
                          setChatMessage('');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* リーダーボード */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">🏆 リーダーボード</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/60 text-lg">まだ提出がありません。</p>
                      <p className="text-white/40 text-sm mt-2">最初の提出をしてリーダーボードに参加しましょう！</p>
                    </div>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {entry.rank}
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">{entry.username}</span>
                            <div className="text-sm text-white/70">{entry.modelType || 'Unknown'}</div>
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
                        const team = SimpleTeamManager.createTeam(teamName, '新しく作成されたチーム', 5);
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
                              const joinedTeam = SimpleTeamManager.joinTeam(team.id);
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