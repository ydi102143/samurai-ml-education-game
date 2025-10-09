import { io, Socket } from 'socket.io-client';
import { mockSocketServer } from './mockSocketServer';
import { createClient } from '@supabase/supabase-js';
import { SecurityManager } from './securityManager';

export interface RealtimeUpdate {
  type: 'progress' | 'message' | 'participant_join' | 'participant_leave' | 'battle_start' | 'battle_end' | 'weekly_problem_change' | 'participant_count_update' | 'submission_count_update';
  data: any;
  timestamp: string;
  userId: string;
  roomId: string;
}

export interface ParticipantUpdate {
  userId: string;
  username: string;
  progress: number;
  currentStep: string;
  isReady: boolean;
  lastActivity: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  roomId: string;
}

export class RealtimeManager {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private callbacks: Map<string, Function[]> = new Map();
  private supabase: any = null;
  private supabaseChannel: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isReconnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Supabase Realtimeを使用
    this.setupSupabaseRealtime();
  }

  private setupSupabaseRealtime() {
    try {
      // 開発環境のセキュリティチェック
      SecurityManager.checkDevelopmentSecurity();
      
      // 本番環境でのみ本番セキュリティチェック
      if (import.meta.env.PROD) {
        SecurityManager.checkProductionSecurity();
      }
      
      // セキュアなSupabase設定の取得
      const config = SecurityManager.getSecureSupabaseConfig();
      
      if (!config) {
        console.error('Supabase設定の取得に失敗しました');
        this.emit('error', new Error('Supabase設定が無効です'));
        return;
      }
      
      this.supabase = createClient(config.url, config.key);
      console.log('Supabase Realtime接続を開始');
      
      // 接続テスト
      this.supabase.from('battle_events').select('count').limit(1).then(() => {
        console.log('Supabase Realtime接続完了');
        this.emit('connected');
      }).catch((error) => {
        console.error('Supabase接続エラー:', error);
        this.emit('error', error);
      });
    } catch (error) {
      console.error('Supabase初期化エラー:', error);
      this.emit('error', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket接続完了');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket接続切断');
      this.emit('disconnected');
    });

    this.socket.on('realtime_update', (update: RealtimeUpdate) => {
      this.emit('realtime_update', update);
    });

    this.socket.on('participant_update', (update: ParticipantUpdate) => {
      this.emit('participant_update', update);
    });

    this.socket.on('chat_message', (message: ChatMessage) => {
      this.emit('chat_message', message);
    });

    this.socket.on('battle_start', (data: any) => {
      this.emit('battle_start', data);
    });

    this.socket.on('battle_end', (data: any) => {
      this.emit('battle_end', data);
    });

    this.socket.on('weekly_problem_change', (data: any) => {
      this.emit('weekly_problem_change', data);
    });

    this.socket.on('participant_count_update', (data: any) => {
      this.emit('participant_count_update', data);
    });

    this.socket.on('submission_count_update', (data: any) => {
      this.emit('submission_count_update', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocketエラー:', error);
      this.emit('error', error);
    });
  }

  connect(userId: string, roomId: string) {
    this.userId = userId;
    this.roomId = roomId;
    
    if (this.supabase) {
      this.setupSupabaseChannel(roomId);
    } else if (import.meta.env.DEV) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.joinRoom(roomId, userId, 'プレイヤー');
    } else if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  private setupSupabaseChannel(roomId: string) {
    if (!this.supabase) return;
    
    // 既存のチャンネルを解除
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
    }
    
    // 新しいチャンネルを作成
    this.supabaseChannel = this.supabase
      .channel(`battle_room_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_events',
        filter: `room_id=eq.${roomId}`
      }, (payload: any) => {
        this.handleSupabaseUpdate(payload);
      })
      .on('broadcast', { event: 'battle_progress' }, (payload: any) => {
        this.handleBattleProgress(payload);
      })
      .on('broadcast', { event: 'chat_message' }, (payload: any) => {
        this.handleChatMessage(payload);
      })
      .subscribe();
  }

  private handleSupabaseUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.emit('participant_update', {
          userId: newRecord.user_id,
          username: newRecord.username,
          status: newRecord.status,
          progress: newRecord.progress
        });
        break;
      case 'UPDATE':
        this.emit('realtime_update', {
          type: 'progress',
          data: newRecord,
          timestamp: new Date().toISOString(),
          userId: newRecord.user_id,
          roomId: newRecord.room_id
        });
        break;
      case 'DELETE':
        this.emit('participant_update', {
          userId: oldRecord.user_id,
          username: oldRecord.username,
          status: 'left',
          progress: 0
        });
        break;
    }
  }

  private handleBattleProgress(payload: any) {
    this.emit('realtime_update', {
      type: 'progress',
      data: payload,
      timestamp: new Date().toISOString(),
      userId: payload.userId,
      roomId: payload.roomId
    });
  }

  private handleChatMessage(payload: any) {
    this.emit('chat_message', {
      id: payload.id,
      userId: payload.userId,
      username: payload.username,
      message: payload.message,
      timestamp: payload.timestamp,
      roomId: payload.roomId
    });
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
    this.userId = null;
    this.roomId = null;
  }

  joinRoom(roomId: string, username: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { roomId, username });
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  sendProgress(progress: number, currentStep: string, isReady: boolean = false) {
    console.log('進捗送信:', { progress, currentStep, isReady, userId: this.userId, roomId: this.roomId });
    
    if (this.supabase && this.supabaseChannel) {
      // Supabase Realtimeを使用してブロードキャスト
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'battle_progress',
        payload: {
          userId: this.userId,
          roomId: this.roomId,
          progress,
          currentStep,
          isReady,
          timestamp: new Date().toISOString()
        }
      });
    } else if (import.meta.env.DEV && this.userId) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.updateProgress(this.userId, progress, currentStep, isReady);
    } else if (this.socket && this.socket.connected && this.roomId) {
      this.socket.emit('progress_update', {
        roomId: this.roomId,
        progress,
        currentStep,
        isReady,
        timestamp: new Date().toISOString()
      });
    }
  }

  sendChatMessage(message: string) {
    if (this.supabase && this.supabaseChannel) {
      // Supabase Realtimeを使用してブロードキャスト
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'chat_message',
        payload: {
          id: Date.now().toString(),
          userId: this.userId,
          username: 'プレイヤー', // 実際のユーザー名を取得
          message,
          timestamp: new Date().toISOString(),
          roomId: this.roomId
        }
      });
    } else if (import.meta.env.DEV && this.roomId && this.userId) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.sendChatMessage(this.roomId, this.userId, message);
    } else if (this.socket && this.socket.connected && this.roomId && this.userId) {
      this.socket.emit('chat_message', {
        roomId: this.roomId,
        userId: this.userId,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  startBattle(roomId: string) {
    if (import.meta.env.DEV) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.startBattle(roomId);
    } else if (this.socket && this.socket.connected) {
      this.socket.emit('start_battle', { roomId });
    }
  }

  endBattle(roomId: string, result: any) {
    if (import.meta.env.DEV && this.userId) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.endBattle(roomId, this.userId, result);
    } else if (this.socket && this.socket.connected) {
      this.socket.emit('end_battle', { roomId, result });
    }
  }

  /**
   * グローバル更新をブロードキャスト
   */
  broadcastUpdate(update: RealtimeUpdate) {
    if (import.meta.env.DEV) {
      // 開発環境ではモックサーバーを使用
      mockSocketServer.broadcastUpdate(update);
    } else if (this.socket && this.socket.connected) {
      this.socket.emit('broadcast_update', update);
    }
  }

  // イベントリスナーの管理
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // 接続状態の確認
  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // ルーム情報の取得
  getCurrentRoom(): string | null {
    return this.roomId;
  }

  getCurrentUser(): string | null {
    return this.userId;
  }
}

// シングルトンインスタンス
export const realtimeManager = new RealtimeManager();
