import { useState, useEffect, useCallback } from 'react';
import { realtimeManager, type ParticipantUpdate, type ChatMessage } from '../utils/realtimeManager';
import { BattleDatabase, type BattleLeaderboardEntry } from '../utils/battleDatabase';

interface UseRealtimeBattleProps {
  roomId: string;
  userId: string;
  username: string;
  isMultiplayer?: boolean;
}

export function useRealtimeBattle({ roomId, userId, username, isMultiplayer = false }: UseRealtimeBattleProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Map<string, ParticipantUpdate>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [battleStatus, setBattleStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<BattleLeaderboardEntry[]>([]);

  // 接続管理
  useEffect(() => {
    console.log('useRealtimeBattle初期化:', { roomId, userId, username });
    
    const handleConnected = () => {
      console.log('リアルタイム接続完了');
      setIsConnected(true);
      setError(null);
      // 接続後にルームに参加
      setTimeout(() => {
        realtimeManager.joinRoom(roomId, userId, username);
      }, 100);
    };

    const handleDisconnected = () => {
      console.log('リアルタイム接続切断');
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error('リアルタイム接続エラー:', error);
      setError(error.message || '接続エラーが発生しました');
    };

    realtimeManager.on('connected', handleConnected);
    realtimeManager.on('disconnected', handleDisconnected);
    realtimeManager.on('error', handleError);

    // 接続開始
    realtimeManager.connect(userId, roomId);

    return () => {
      realtimeManager.off('connected', handleConnected);
      realtimeManager.off('disconnected', handleDisconnected);
      realtimeManager.off('error', handleError);
      realtimeManager.disconnect();
    };
  }, [roomId, userId, username]);

  // 参加者更新の処理
  useEffect(() => {
    const handleParticipantUpdate = (update: ParticipantUpdate) => {
      setParticipants(prev => {
        const newMap = new Map(prev);
        newMap.set(update.userId, update);
        return newMap;
      });
    };

    realtimeManager.on('participant_update', handleParticipantUpdate);

    return () => {
      realtimeManager.off('participant_update', handleParticipantUpdate);
    };
  }, []);

  // チャットメッセージの処理
  useEffect(() => {
    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    };

    realtimeManager.on('chat_message', handleChatMessage);

    return () => {
      realtimeManager.off('chat_message', handleChatMessage);
    };
  }, []);

  // バトル状態の処理
  useEffect(() => {
    const handleBattleStart = () => {
      setBattleStatus('active');
    };

    const handleBattleEnd = () => {
      setBattleStatus('finished');
    };

    realtimeManager.on('battle_start', handleBattleStart);
    realtimeManager.on('battle_end', handleBattleEnd);

    return () => {
      realtimeManager.off('battle_start', handleBattleStart);
      realtimeManager.off('battle_end', handleBattleEnd);
    };
  }, []);

  // 進捗送信
  const sendProgress = useCallback((progress: number, currentStep: string) => {
    realtimeManager.sendProgress(progress, currentStep);
  }, []);

  // チャットメッセージ送信
  const sendChatMessage = useCallback((message: string) => {
    realtimeManager.sendMessage(message);
  }, []);

  // バトル開始
  const startBattle = useCallback(() => {
    realtimeManager.startBattle(roomId);
  }, [roomId]);

  // バトル終了
  const endBattle = useCallback((result: any) => {
    realtimeManager.endBattle(roomId, result);
  }, [roomId]);

  // リーダーボード更新
  const updateLeaderboard = useCallback(async (isPrivate: boolean = false, battleType?: 'individual' | 'team') => {
    try {
      const updatedLeaderboard = await BattleDatabase.getLeaderboard(10, isPrivate, battleType);
      setLeaderboard(updatedLeaderboard);
      console.log('リーダーボード更新:', updatedLeaderboard);
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
    }
  }, []);

  // 初期リーダーボード読み込み
  useEffect(() => {
    const loadInitialLeaderboard = async () => {
      try {
        const leaderboardData = await BattleDatabase.getLeaderboard(10, false, isMultiplayer ? 'team' : 'individual');
        
        // データがない場合はサンプルデータを表示
        if (leaderboardData.length === 0) {
          setLeaderboard([
            { rank: 1, userId: 'user_d', username: 'd', totalBattles: 5, wins: 4, losses: 1, winRate: 0.8, averageAccuracy: 0.852, bestAccuracy: 0.89, totalScore: 4260, streak: 3, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
            { rank: 2, userId: 'user_w', username: 'w', totalBattles: 3, wins: 2, losses: 1, winRate: 0.67, averageAccuracy: 0.789, bestAccuracy: 0.82, totalScore: 2367, streak: 1, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
            { rank: 3, userId: 'user_d2', username: 'd', totalBattles: 4, wins: 2, losses: 2, winRate: 0.5, averageAccuracy: 0.721, bestAccuracy: 0.75, totalScore: 2884, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
            { rank: 4, userId: 'user_tagu', username: 'tagu', totalBattles: 2, wins: 1, losses: 1, winRate: 0.5, averageAccuracy: 0.654, bestAccuracy: 0.68, totalScore: 1308, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
            { rank: 5, userId: 'user_dws', username: 'dws', totalBattles: 1, wins: 0, losses: 1, winRate: 0, averageAccuracy: 0.587, bestAccuracy: 0.59, totalScore: 587, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false }
          ]);
        } else {
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('リーダーボード初期読み込みエラー:', error);
        // エラー時もサンプルデータを表示
        setLeaderboard([
          { rank: 1, userId: 'user_d', username: 'd', totalBattles: 5, wins: 4, losses: 1, winRate: 0.8, averageAccuracy: 0.852, bestAccuracy: 0.89, totalScore: 4260, streak: 3, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
          { rank: 2, userId: 'user_w', username: 'w', totalBattles: 3, wins: 2, losses: 1, winRate: 0.67, averageAccuracy: 0.789, bestAccuracy: 0.82, totalScore: 2367, streak: 1, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
          { rank: 3, userId: 'user_d2', username: 'd', totalBattles: 4, wins: 2, losses: 2, winRate: 0.5, averageAccuracy: 0.721, bestAccuracy: 0.75, totalScore: 2884, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
          { rank: 4, userId: 'user_tagu', username: 'tagu', totalBattles: 2, wins: 1, losses: 1, winRate: 0.5, averageAccuracy: 0.654, bestAccuracy: 0.68, totalScore: 1308, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false },
          { rank: 5, userId: 'user_dws', username: 'dws', totalBattles: 1, wins: 0, losses: 1, winRate: 0, averageAccuracy: 0.587, bestAccuracy: 0.59, totalScore: 587, streak: 0, lastBattleAt: new Date().toISOString(), battleType: 'individual', teamId: undefined, isPrivate: false }
        ]);
      }
    };
    
    loadInitialLeaderboard();
  }, [isMultiplayer]);

  // 参加者リストの取得
  const getParticipantsList = useCallback(() => {
    return Array.from(participants.values());
  }, [participants]);

  // 自分の進捗情報の取得
  const getMyProgress = useCallback(() => {
    return participants.get(userId);
  }, [participants, userId]);

  // ルーム参加
  const joinRoom = useCallback(async (newRoomId: string) => {
    try {
      console.log('ルーム参加:', newRoomId);
      await realtimeManager.joinRoom(newRoomId, userId, username);
      setError(null);
    } catch (error) {
      console.error('ルーム参加エラー:', error);
      setError('ルームの参加に失敗しました');
    }
  }, [userId, username]);

  // ルーム退出
  const leaveRoom = useCallback(async () => {
    try {
      console.log('ルーム退出');
      await realtimeManager.leaveRoom();
    } catch (error) {
      console.error('ルーム退出エラー:', error);
    }
  }, []);

  return {
    isConnected,
    participants: getParticipantsList(),
    myProgress: getMyProgress(),
    chatMessages,
    battleStatus,
    error,
    leaderboard,
    sendProgress,
    sendChatMessage,
    joinRoom,
    leaveRoom,
    startBattle,
    endBattle,
    updateLeaderboard
  };
}
