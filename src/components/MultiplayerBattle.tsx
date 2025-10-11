import { useState, useEffect } from 'react';
import { Users, MessageCircle, Send, Trophy, Target, Sword } from 'lucide-react';
import { EnhancedOnlineBattle } from './EnhancedOnlineBattle';
import { realtimeManager } from '../utils/realtimeManager';
import { userManager } from '../utils/userManager';
import { getRandomAdvancedProblemDataset, type AdvancedProblemDataset } from '../data/advancedProblemDatasets';

interface MultiplayerBattleProps {
  onBack: () => void;
}

interface Participant {
  userId: string;
  username: string;
  isReady: boolean;
  progress: number;
  currentStep: string;
  lastActivity: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export function MultiplayerBattle({ onBack }: MultiplayerBattleProps) {
  const [currentProblem, setCurrentProblem] = useState<AdvancedProblemDataset | null>(null);
  const [showBattle, setShowBattle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleMode, setBattleMode] = useState<'individual' | 'team'>('individual');
  const [battleStartTime, setBattleStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [battleResults, setBattleResults] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<number>(0);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const user = userManager.getCurrentUser();

  useEffect(() => {
    loadCurrentProblem();
  }, []);

  // リアルタイム接続の管理
  useEffect(() => {
    if (!user) return;

    const handleConnected = () => {
      console.log('リアルタイム接続完了');
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      console.log('リアルタイム接続切断');
      setIsConnected(false);
    };

    const handleParticipantUpdate = (data: any) => {
      const participant = data.data;
      setParticipants(prev => {
        const newMap = new Map(prev);
        newMap.set(participant.userId, participant);
        return newMap;
      });
    };

    const handleChatMessage = (data: any) => {
      const message = data.data;
      setChatMessages(prev => [...prev, message]);
    };

    realtimeManager.on('connected', handleConnected);
    realtimeManager.on('disconnected', handleDisconnected);
    realtimeManager.on('participant_update', handleParticipantUpdate);
    realtimeManager.on('chat_message', handleChatMessage);

    // 接続開始
    realtimeManager.connect(user.id, 'multiplayer_room');

    return () => {
      realtimeManager.off('connected', handleConnected);
      realtimeManager.off('disconnected', handleDisconnected);
      realtimeManager.off('participant_update', handleParticipantUpdate);
      realtimeManager.off('chat_message', handleChatMessage);
      realtimeManager.disconnect();
    };
  }, [user]);

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
      const problem = getRandomAdvancedProblemDataset();
      setCurrentProblem(problem);
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      setError(`問題の読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBattle = () => {
    if (!currentProblem || !user) return;
    
    setBattleStartTime(Date.now());
    setIsBattleActive(true);
    setTimeRemaining(0);
    setMyProgress(0);
    setBattleResults([]);
    setShowBattle(true);
  };


  const sendChatMessage = (message: string) => {
    if (!user) return;
    
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      username: user.username,
      message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, chatMessage]);
    realtimeManager.broadcast('chat_message', chatMessage);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBattleEnd = () => {
    setShowBattle(false);
    setIsBattleActive(false);
    setBattleStartTime(null);
  };

  if (showBattle && currentProblem && user) {
    return (
      <EnhancedOnlineBattle
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
              <h2 className="text-3xl font-bold text-blue-900 mb-4">問題が見つかりません</h2>
              <p className="text-lg text-blue-700 mb-6">利用可能な問題がありません。</p>
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
                <div className="text-white/80 font-bold text-lg">接続状態</div>
                <div className="text-white text-2xl font-mono">
                  {isConnected ? '🟢 接続中' : '🔴 切断中'}
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
                      <h2 className="text-3xl font-bold text-white mb-2">{currentProblem.name}</h2>
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-bold border border-blue-400/30">
                          {currentProblem.domain}
                        </span>
                        <span className="bg-green-500/20 text-green-200 px-4 py-2 rounded-full text-sm font-bold border border-green-400/30">
                          {currentProblem.difficulty}
                        </span>
                        <span className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full text-sm font-bold border border-purple-400/30">
                          {currentProblem.problemType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70 font-medium">ステータス</div>
                    <div className="font-bold text-lg text-green-400">
                      🟢 アクティブ
                    </div>
                  </div>
                </div>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">{currentProblem.description}</p>
                
                {/* データセット詳細情報 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
                  <h4 className="font-bold text-white text-lg mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    データセット情報
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-300">{currentProblem.featureNames?.length || 0}</div>
                      <div className="text-sm text-white/70">特徴量数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300">{currentProblem.data?.length || 0}</div>
                      <div className="text-sm text-white/70">サンプル数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-300">{currentProblem.problemType || 'Unknown'}</div>
                      <div className="text-sm text-white/70">問題タイプ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-300">{currentProblem.difficulty || 'Unknown'}</div>
                      <div className="text-sm text-white/70">難易度</div>
                    </div>
                  </div>
                </div>
                
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
                      onClick={() => setBattleMode('team')}
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
                  disabled={isBattleActive}
                  className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                    !isBattleActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isBattleActive ? '⚡ バトル進行中...' : '🚀 マルチプレイヤー戦を開始'}
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
                  {chatMessages.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                      まだメッセージはありません
                    </p>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div key={index} className="mb-3 p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="font-bold text-blue-300 text-sm">
                          {message.username}
                        </div>
                        <div className="text-white/90">{message.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="メッセージを入力..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all duration-300"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          sendChatMessage(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input.value.trim()) {
                        sendChatMessage(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}