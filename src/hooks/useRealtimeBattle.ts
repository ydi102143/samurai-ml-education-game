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
  }, [roomId, userId, username]);

  // 参加者更新の処理
  useEffect(() => {
    const handleParticipantUpdate = (data: any) => {
      if (data.type === 'participant_update') {
        const update = data.data as ParticipantUpdate;
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(update.userId, update);
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
        const message = data.data as ChatMessage;
        setChatMessages(prev => [...prev, message]);
      }
    };

    realtimeManager.subscribe('chat_message', handleChatMessage);

    return () => {
      realtimeManager.unsubscribe('chat_message', handleChatMessage);
    };
  }, []);

  // バトル状態の処理
  useEffect(() => {
    const handleBattleStart = (data: any) => {
      if (data.type === 'battle_start') {
        setBattleStatus('active');
      }
    };

    const handleBattleEnd = (data: any) => {
      if (data.type === 'battle_end') {
        setBattleStatus('finished');
      }
    };

    realtimeManager.subscribe('battle_start', handleBattleStart);
    realtimeManager.subscribe('battle_end', handleBattleEnd);

    return () => {
      realtimeManager.unsubscribe('battle_start', handleBattleStart);
      realtimeManager.unsubscribe('battle_end', handleBattleEnd);
    };
  }, []);

  // 進捗を送信
  const sendProgress = useCallback((progress: number, currentStep: string) => {
    const update: ParticipantUpdate = {
      userId,
      username,
      progress,
      currentStep,
      lastUpdate: new Date().toISOString()
    };

    realtimeManager.subscribe('participant_update', () => {});
    console.log('進捗送信:', update);
  }, [userId, username]);

  // チャットメッセージを送信
  const sendMessage = useCallback((message: string) => {
    realtimeManager.sendChatMessage(userId, username, message);
  }, [userId, username]);

  // ルームに参加
  const joinRoom = useCallback(() => {
    console.log('ルームに参加:', { roomId, userId, username });
    // 参加者として自分を追加
    const selfUpdate: ParticipantUpdate = {
      userId,
      username,
      progress: 0,
      currentStep: 'waiting',
      lastUpdate: new Date().toISOString()
    };
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, selfUpdate);
      return newMap;
    });
  }, [roomId, userId, username]);

  // ルームから退出
  const leaveRoom = useCallback(() => {
    console.log('ルームから退出:', { roomId, userId });
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, [roomId, userId]);

  // バトル開始
  const startBattle = useCallback(() => {
    console.log('バトル開始:', roomId);
    setBattleStatus('active');
    realtimeManager.startBattle(roomId);
  }, [roomId]);

  // バトル終了
  const endBattle = useCallback((result: any) => {
    console.log('バトル終了:', { roomId, result });
    setBattleStatus('finished');
    realtimeManager.endBattle(roomId, result);
  }, [roomId]);

  // リーダーボード更新
  const updateLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await BattleDatabase.getLeaderboard(10, false);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
    }
  }, []);

  // 初期リーダーボード読み込み
  useEffect(() => {
    updateLeaderboard();
  }, [updateLeaderboard]);

  return {
    isConnected,
    participants: Array.from(participants.values()),
    chatMessages,
    battleStatus,
    error,
    leaderboard,
    sendProgress,
    sendMessage,
    joinRoom,
    leaveRoom,
    startBattle,
    endBattle,
    updateLeaderboard
  };
}

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
  }, [roomId, userId, username]);

  // 参加者更新の処理
  useEffect(() => {
    const handleParticipantUpdate = (data: any) => {
      if (data.type === 'participant_update') {
        const update = data.data as ParticipantUpdate;
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(update.userId, update);
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
        const message = data.data as ChatMessage;
        setChatMessages(prev => [...prev, message]);
      }
    };

    realtimeManager.subscribe('chat_message', handleChatMessage);

    return () => {
      realtimeManager.unsubscribe('chat_message', handleChatMessage);
    };
  }, []);

  // バトル状態の処理
  useEffect(() => {
    const handleBattleStart = (data: any) => {
      if (data.type === 'battle_start') {
        setBattleStatus('active');
      }
    };

    const handleBattleEnd = (data: any) => {
      if (data.type === 'battle_end') {
        setBattleStatus('finished');
      }
    };

    realtimeManager.subscribe('battle_start', handleBattleStart);
    realtimeManager.subscribe('battle_end', handleBattleEnd);

    return () => {
      realtimeManager.unsubscribe('battle_start', handleBattleStart);
      realtimeManager.unsubscribe('battle_end', handleBattleEnd);
    };
  }, []);

  // 進捗を送信
  const sendProgress = useCallback((progress: number, currentStep: string) => {
    const update: ParticipantUpdate = {
      userId,
      username,
      progress,
      currentStep,
      lastUpdate: new Date().toISOString()
    };

    realtimeManager.subscribe('participant_update', () => {});
    console.log('進捗送信:', update);
  }, [userId, username]);

  // チャットメッセージを送信
  const sendMessage = useCallback((message: string) => {
    realtimeManager.sendChatMessage(userId, username, message);
  }, [userId, username]);

  // ルームに参加
  const joinRoom = useCallback(() => {
    console.log('ルームに参加:', { roomId, userId, username });
    // 参加者として自分を追加
    const selfUpdate: ParticipantUpdate = {
      userId,
      username,
      progress: 0,
      currentStep: 'waiting',
      lastUpdate: new Date().toISOString()
    };
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, selfUpdate);
      return newMap;
    });
  }, [roomId, userId, username]);

  // ルームから退出
  const leaveRoom = useCallback(() => {
    console.log('ルームから退出:', { roomId, userId });
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, [roomId, userId]);

  // バトル開始
  const startBattle = useCallback(() => {
    console.log('バトル開始:', roomId);
    setBattleStatus('active');
    realtimeManager.startBattle(roomId);
  }, [roomId]);

  // バトル終了
  const endBattle = useCallback((result: any) => {
    console.log('バトル終了:', { roomId, result });
    setBattleStatus('finished');
    realtimeManager.endBattle(roomId, result);
  }, [roomId]);

  // リーダーボード更新
  const updateLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await BattleDatabase.getLeaderboard(10, false);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
    }
  }, []);

  // 初期リーダーボード読み込み
  useEffect(() => {
    updateLeaderboard();
  }, [updateLeaderboard]);

  return {
    isConnected,
    participants: Array.from(participants.values()),
    chatMessages,
    battleStatus,
    error,
    leaderboard,
    sendProgress,
    sendMessage,
    joinRoom,
    leaveRoom,
    startBattle,
    endBattle,
    updateLeaderboard
  };
}


