import { useState, useEffect } from 'react';
import { Users, MessageCircle, Send, Trophy, Target, Sword } from 'lucide-react';
import { SimpleMLWorkflow } from './SimpleMLWorkflow';
import { realtimeManager } from '../utils/realtimeManager';
import { userManager } from '../utils/userManager';

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
  const [newMessage, setNewMessage] = useState('');

  const user = userManager.getCurrentUser();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

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

    const handleError = (error: any) => {
      console.error('リアルタイム接続エラー:', error);
      setError(error.message || '接続エラーが発生しました');
    };

    // イベントリスナーを登録
    realtimeManager.subscribe('connected', handleConnected);
    realtimeManager.subscribe('disconnected', handleDisconnected);
    realtimeManager.subscribe('error', handleError);

    // 接続状態を設定
    setIsConnected(true);

    return () => {
      realtimeManager.unsubscribe('connected', handleConnected);
      realtimeManager.unsubscribe('disconnected', handleDisconnected);
      realtimeManager.unsubscribe('error', handleError);
    };
  }, [user]);

  // 参加者更新の処理
  useEffect(() => {
    const handleParticipantUpdate = (data: any) => {
      if (data.type === 'participant_update') {
        const update = data.data;
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(update.userId, {
            userId: update.userId,
            username: update.username,
            isReady: update.progress > 0,
            progress: update.progress,
            currentStep: update.currentStep,
            lastActivity: update.lastUpdate
          });
          return newMap;
        });
      }
    };

    realtimeManager.subscribe('participant_update', handleParticipantUpdate);

    return () => {
      realtimeManager.unsubscribe('participant_update', handleParticipantUpdate);
    };
  }, []);

  // チャットメッセージの処理
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      if (data.type === 'chat_message') {
        const message = data.data;
        setChatMessages(prev => [...prev, message]);
      }
    };

    realtimeManager.subscribe('chat_message', handleChatMessage);

    return () => {
      realtimeManager.unsubscribe('chat_message', handleChatMessage);
    };
  }, []);

  // バトル開始の処理
  const startBattle = () => {
    console.log('バトル開始');
    setBattleStartTime(Date.now());
    setIsBattleActive(true);
    setTimeRemaining(3600); // 1時間
    realtimeManager.startBattle('battle_room');
  };

  // バトル終了の処理
  const endBattle = () => {
    console.log('バトル終了');
    setIsBattleActive(false);
    setBattleStartTime(null);
    setTimeRemaining(0);
    realtimeManager.endBattle('battle_room', { results: battleResults });
  };

  // チャットメッセージ送信
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || 'Unknown',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    realtimeManager.sendChatMessage(user.id, user.username || 'Unknown', newMessage);
    setNewMessage('');
  };

  // 進捗更新
  const updateProgress = (progress: number, step: string) => {
    setMyProgress(progress);
    // 参加者として自分を更新
    if (user) {
      const selfUpdate = {
        userId: user.id,
        username: user.username || 'Unknown',
        progress,
        currentStep: step,
        lastUpdate: new Date().toISOString()
      };
      realtimeManager.subscribe('participant_update', () => {});
    }
  };

  // 時間更新
  useEffect(() => {
    if (!isBattleActive || !battleStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - battleStartTime;
      const remaining = Math.max(0, 3600000 - elapsed); // 1時間 - 経過時間
      setTimeRemaining(Math.floor(remaining / 1000));
      
      if (remaining <= 0) {
        endBattle();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBattleActive, battleStartTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-400 mx-auto mb-4" />
          <p className="text-2xl text-purple-100 font-bold">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">エラーが発生しました</h2>
          <p className="text-red-800 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (showBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="p-6">
          <button
            onClick={() => setShowBattle(false)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ← バトル一覧に戻る
          </button>
          <SimpleMLWorkflow onBack={() => setShowBattle(false)} />
        </div>
      </div>
    );
  }

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
              ←
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Sword className="w-8 h-8 mr-3" />
              マルチプレイヤーバトル
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? '接続中' : '切断中'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* バトル情報 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                バトル情報
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-blue-300 mb-1">
                    {isBattleActive ? Math.floor(timeRemaining / 60) : 0}
                  </div>
                  <div className="text-sm text-white/70">残り時間（分）</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-green-300 mb-1">
                    {participants.size}
                  </div>
                  <div className="text-sm text-white/70">参加者数</div>
                </div>
              </div>

              <div className="flex space-x-4">
                {!isBattleActive ? (
                  <button
                    onClick={startBattle}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    バトル開始
                  </button>
                ) : (
                  <button
                    onClick={endBattle}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    バトル終了
                  </button>
                )}
                <button
                  onClick={() => setShowBattle(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  機械学習開始
                </button>
              </div>
            </div>

            {/* 参加者一覧 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                参加者 ({participants.size}人)
              </h2>
              
              <div className="space-y-3">
                {Array.from(participants.values()).map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        participant.isReady ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{participant.username}</div>
                        <div className="text-sm text-white/70">{participant.currentStep}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70">進捗</div>
                      <div className="text-lg font-bold text-blue-300">{participant.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* チャット */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                チャット
              </h2>
              
              <div className="space-y-3 mb-4 h-64 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">{message.username}</span>
                      <span className="text-xs text-white/50">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white/80 text-sm">{message.message}</p>
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
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 結果 */}
            {battleResults.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  結果
                </h2>
                
                <div className="space-y-3">
                  {battleResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{result.username}</div>
                          <div className="text-sm text-white/70">{result.modelType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-300">{result.accuracy.toFixed(2)}%</div>
                        <div className="text-sm text-white/70">{result.trainingTime}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Users, MessageCircle, Send, Trophy, Target, Sword } from 'lucide-react';
import { SimpleMLWorkflow } from './SimpleMLWorkflow';
import { realtimeManager } from '../utils/realtimeManager';
import { userManager } from '../utils/userManager';

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
  const [newMessage, setNewMessage] = useState('');

  const user = userManager.getCurrentUser();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

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

    const handleError = (error: any) => {
      console.error('リアルタイム接続エラー:', error);
      setError(error.message || '接続エラーが発生しました');
    };

    // イベントリスナーを登録
    realtimeManager.subscribe('connected', handleConnected);
    realtimeManager.subscribe('disconnected', handleDisconnected);
    realtimeManager.subscribe('error', handleError);

    // 接続状態を設定
    setIsConnected(true);

    return () => {
      realtimeManager.unsubscribe('connected', handleConnected);
      realtimeManager.unsubscribe('disconnected', handleDisconnected);
      realtimeManager.unsubscribe('error', handleError);
    };
  }, [user]);

  // 参加者更新の処理
  useEffect(() => {
    const handleParticipantUpdate = (data: any) => {
      if (data.type === 'participant_update') {
        const update = data.data;
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(update.userId, {
            userId: update.userId,
            username: update.username,
            isReady: update.progress > 0,
            progress: update.progress,
            currentStep: update.currentStep,
            lastActivity: update.lastUpdate
          });
          return newMap;
        });
      }
    };

    realtimeManager.subscribe('participant_update', handleParticipantUpdate);

    return () => {
      realtimeManager.unsubscribe('participant_update', handleParticipantUpdate);
    };
  }, []);

  // チャットメッセージの処理
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      if (data.type === 'chat_message') {
        const message = data.data;
        setChatMessages(prev => [...prev, message]);
      }
    };

    realtimeManager.subscribe('chat_message', handleChatMessage);

    return () => {
      realtimeManager.unsubscribe('chat_message', handleChatMessage);
    };
  }, []);

  // バトル開始の処理
  const startBattle = () => {
    console.log('バトル開始');
    setBattleStartTime(Date.now());
    setIsBattleActive(true);
    setTimeRemaining(3600); // 1時間
    realtimeManager.startBattle('battle_room');
  };

  // バトル終了の処理
  const endBattle = () => {
    console.log('バトル終了');
    setIsBattleActive(false);
    setBattleStartTime(null);
    setTimeRemaining(0);
    realtimeManager.endBattle('battle_room', { results: battleResults });
  };

  // チャットメッセージ送信
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username || 'Unknown',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    realtimeManager.sendChatMessage(user.id, user.username || 'Unknown', newMessage);
    setNewMessage('');
  };

  // 進捗更新
  const updateProgress = (progress: number, step: string) => {
    setMyProgress(progress);
    // 参加者として自分を更新
    if (user) {
      const selfUpdate = {
        userId: user.id,
        username: user.username || 'Unknown',
        progress,
        currentStep: step,
        lastUpdate: new Date().toISOString()
      };
      realtimeManager.subscribe('participant_update', () => {});
    }
  };

  // 時間更新
  useEffect(() => {
    if (!isBattleActive || !battleStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - battleStartTime;
      const remaining = Math.max(0, 3600000 - elapsed); // 1時間 - 経過時間
      setTimeRemaining(Math.floor(remaining / 1000));
      
      if (remaining <= 0) {
        endBattle();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBattleActive, battleStartTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-400 mx-auto mb-4" />
          <p className="text-2xl text-purple-100 font-bold">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-white/95 rounded-lg shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">エラーが発生しました</h2>
          <p className="text-red-800 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (showBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="p-6">
          <button
            onClick={() => setShowBattle(false)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ← バトル一覧に戻る
          </button>
          <SimpleMLWorkflow onBack={() => setShowBattle(false)} />
        </div>
      </div>
    );
  }

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
              ←
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Sword className="w-8 h-8 mr-3" />
              マルチプレイヤーバトル
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? '接続中' : '切断中'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* バトル情報 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                バトル情報
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-blue-300 mb-1">
                    {isBattleActive ? Math.floor(timeRemaining / 60) : 0}
                  </div>
                  <div className="text-sm text-white/70">残り時間（分）</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-green-300 mb-1">
                    {participants.size}
                  </div>
                  <div className="text-sm text-white/70">参加者数</div>
                </div>
              </div>

              <div className="flex space-x-4">
                {!isBattleActive ? (
                  <button
                    onClick={startBattle}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    バトル開始
                  </button>
                ) : (
                  <button
                    onClick={endBattle}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    バトル終了
                  </button>
                )}
                <button
                  onClick={() => setShowBattle(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  機械学習開始
                </button>
              </div>
            </div>

            {/* 参加者一覧 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                参加者 ({participants.size}人)
              </h2>
              
              <div className="space-y-3">
                {Array.from(participants.values()).map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        participant.isReady ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <div className="font-medium text-white">{participant.username}</div>
                        <div className="text-sm text-white/70">{participant.currentStep}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/70">進捗</div>
                      <div className="text-lg font-bold text-blue-300">{participant.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* チャット */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                チャット
              </h2>
              
              <div className="space-y-3 mb-4 h-64 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">{message.username}</span>
                      <span className="text-xs text-white/50">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white/80 text-sm">{message.message}</p>
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
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 結果 */}
            {battleResults.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  結果
                </h2>
                
                <div className="space-y-3">
                  {battleResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{result.username}</div>
                          <div className="text-sm text-white/70">{result.modelType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-300">{result.accuracy.toFixed(2)}%</div>
                        <div className="text-sm text-white/70">{result.trainingTime}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


