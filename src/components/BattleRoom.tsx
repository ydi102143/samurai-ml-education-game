import { useState, useEffect } from 'react';
import { Users, Clock, Trophy, Play, Settings, Crown, Sword, Shield } from 'lucide-react';
import { BattleSystem } from '../utils/battleSystem';
import { BattleChallengeView } from './BattleChallengeView';
import { BattleDatabase } from '../utils/battleDatabase';
import { userManager } from '../utils/userManager';
import type { BattleRoom, BattleParticipant, BattleLeaderboard } from '../types/battle';
import type { ModelResult } from '../types/ml';

interface Props {
  onBack: () => void;
}

export function BattleRoom({ onBack }: Props) {
  const [battleSystem] = useState(() => new BattleSystem());
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'rooms'>('rooms');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDifficulty, setNewRoomDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [newRoomTimeLimit, setNewRoomTimeLimit] = useState(300);
  const [selectedRoom, setSelectedRoom] = useState<BattleRoom | null>(null);
  const [isInBattle, setIsInBattle] = useState(false);
  const [battleResult, setBattleResult] = useState<ModelResult | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      // 動的にルーム一覧を取得（現在は空の配列）
      // 実際の実装では、リアルタイムサーバーからルーム情報を取得
      setRooms([]);
    } catch (error) {
      console.error('ルーム一覧の読み込みに失敗:', error);
      setRooms([]);
    }
  };


  const createRoom = () => {
    if (!newRoomName.trim()) return;
    
    const room = battleSystem.roomManager.createRoom(
      'current-user',
      newRoomName,
      4,
      'classification',
      newRoomDifficulty,
      newRoomTimeLimit
    );
    
    setRooms(prev => [...prev, room]);
    setIsCreatingRoom(false);
    setNewRoomName('');
  };

  const joinRoom = (roomId: string) => {
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) {
      alert('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }
    
    const success = battleSystem.roomManager.joinRoom(roomId, currentUser.id, currentUser.username);
    if (success) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
        setIsInBattle(true);
      }
    }
  };

  const getUserId = () => {
    const currentUser = userManager.getCurrentUser();
    return currentUser?.id || 'anonymous';
  };

  const getUsername = () => {
    const currentUser = userManager.getCurrentUser();
    return currentUser?.username || 'プレイヤー';
  };

  const handleBattleComplete = (result: ModelResult) => {
    setBattleResult(result);
    setIsInBattle(false);
    
    // バトル結果を処理
    console.log('バトル完了:', result);
  };

  const getProblemId = (difficulty: string, problemType: string) => {
    // 難易度と問題タイプに基づいて問題IDを決定
    const problemMap: Record<string, Record<string, string>> = {
      'beginner': {
        'classification': 'modern_sentiment_analysis',
        'regression': 'modern_recommendation'
      },
      'intermediate': {
        'classification': 'modern_fraud_detection',
        'regression': 'modern_stock_prediction'
      },
      'advanced': {
        'classification': 'modern_image_classification',
        'regression': 'modern_stock_prediction'
      }
    };
    return problemMap[difficulty]?.[problemType] || 'modern_sentiment_analysis';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '不明';
    }
  };

  if (isInBattle && selectedRoom) {
    const problemId = getProblemId(selectedRoom.difficulty, selectedRoom.problemType);
    const participants = selectedRoom.participants.map(p => ({
      username: p.username,
      progress: Math.floor(Math.random() * 100), // モック進捗
      isReady: p.isReady
    }));

    return (
      <BattleChallengeView
        problemId={problemId}
        problemTitle={`${selectedRoom.name} - ${getDifficultyLabel(selectedRoom.difficulty)}`}
        timeLimit={selectedRoom.timeLimit}
        onComplete={handleBattleComplete}
        onBack={() => setIsInBattle(false)}
        isMultiplayer={true}
        participants={participants}
        roomId={selectedRoom.id}
        userId={getUserId()}
        username={getUsername()}
      />
    );
  }

  if (battleResult) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
            <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">🎉 バトル完了！</h1>
                <p className="text-lg text-yellow-200">{selectedRoom?.name}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-800">{Math.round(battleResult.accuracy * 100)}%</div>
                  <div className="text-sm text-green-600">精度</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-800">{Math.round(battleResult.trainingTime)}秒</div>
                  <div className="text-sm text-blue-600">学習時間</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-800">1位</div>
                  <div className="text-sm text-purple-600">順位</div>
                </div>
              </div>

              <div className="text-center space-x-4">
                <button
                  onClick={() => {
                    setBattleResult(null);
                    setSelectedRoom(null);
                  }}
                  className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  他のバトルに参加
                </button>
                <button
                  onClick={onBack}
                  className="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden border-4" style={{ borderColor: 'var(--gold)', background: 'var(--ink-white)' }}>
          {/* ヘッダー */}
          <div className="p-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)' }}>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-white hover:text-yellow-200 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20"
              >
                <Sword className="w-5 h-5" />
                <span className="font-medium">戻る</span>
              </button>
              <div className="text-center flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  オンライン対戦
                </h1>
                <p className="text-lg mt-2 text-yellow-200">他のプレイヤーと機械学習で対戦しよう</p>
              </div>
              <div className="w-32" />
            </div>

            {/* タブナビゲーション */}
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === 'rooms'
                    ? 'bg-yellow-400 text-blue-900 font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>バトルルーム</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-yellow-400 text-blue-900 font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>リーダーボード</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'rooms' && (
              <div>
                {/* ルーム作成ボタン */}
                <div className="mb-6">
                  <button
                    onClick={() => setIsCreatingRoom(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg border-2 border-yellow-400 shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <Play className="w-6 h-6 inline-block mr-2" />
                    新しいバトルルームを作成
                  </button>
                </div>

                {/* ルーム作成フォーム */}
                {isCreatingRoom && (
                  <div className="mb-6 p-6 bg-slate-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">新しいルームを作成</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">ルーム名</label>
                        <input
                          type="text"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="例: 初心者向け戦国データ分析"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">難易度</label>
                        <select
                          value={newRoomDifficulty}
                          onChange={(e) => setNewRoomDifficulty(e.target.value as any)}
                          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                          <option value="beginner">初級</option>
                          <option value="intermediate">中級</option>
                          <option value="advanced">上級</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">制限時間（秒）</label>
                        <input
                          type="number"
                          value={newRoomTimeLimit}
                          onChange={(e) => setNewRoomTimeLimit(Number(e.target.value))}
                          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          min="60"
                          max="1800"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={createRoom}
                          className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          作成
                        </button>
                        <button
                          onClick={() => setIsCreatingRoom(false)}
                          className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ルーム一覧 */}
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-lg border-2 border-slate-300 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-blue-900">{room.name}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(room.difficulty)}`}>
                                {getDifficultyLabel(room.difficulty)}
                              </span>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{Math.floor(room.timeLimit / 60)}分</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Users className="w-4 h-4" />
                                <span>{room.participants.length}/{room.maxParticipants}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600 mb-2">
                              ステータス: <span className="font-bold text-blue-600">{room.status === 'waiting' ? '待機中' : '進行中'}</span>
                            </div>
                            <button
                              onClick={() => joinRoom(room.id)}
                              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              参加
                            </button>
                          </div>
                        </div>
                        
                        {/* 参加者一覧 */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-2">参加者</h4>
                          <div className="flex flex-wrap gap-2">
                            {room.participants.map((participant, index) => (
                              <div key={participant.userId} className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full">
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                                <span className="text-sm font-medium text-slate-700">{participant.username}</span>
                                {participant.isReady && <Shield className="w-4 h-4 text-green-500" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">🏆 リーダーボード</h2>
                  <p className="text-slate-600">オンライン対戦の成績ランキング</p>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div key={player.userId} className={`p-4 rounded-lg border-2 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
                      'bg-white border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-blue-900 w-8">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-900">{player.username}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>戦績: {player.wins}勝{player.losses}敗</span>
                              <span>勝率: {Math.round(player.winRate * 100)}%</span>
                              <span>連勝: {player.streak}回</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-900">{Math.round(player.totalScore)}pt</div>
                          <div className="text-sm text-slate-600">総スコア</div>
                        </div>
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
