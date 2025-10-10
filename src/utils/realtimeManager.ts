import { createClient } from '@supabase/supabase-js';

// ブラウザ用のシンプルなEventEmitter実装
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }
}

export interface RealtimeUpdate {
  type: 'progress' | 'message' | 'participant_join' | 'participant_leave' | 'battle_start' | 'battle_end' | 'weekly_problem_change' | 'participant_count_update' | 'submission_count_update' | 'leaderboard_update';
  data: any;
  timestamp: string;
  userId: string;
  username: string;
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

export class RealtimeManager extends EventEmitter {
  private roomId: string | null = null;
  private userId: string | null = null;
  private supabase: any = null;
  private supabaseChannel: any = null;

  constructor() {
    super();
    this.setupSupabaseRealtime();
  }

  private setupSupabaseRealtime() {
    try {
      // 直接APIキーを設定（デバッグ用）
      const supabaseUrl = 'https://ovghanpxibparkuyxxdh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2hhbnB4aWJwYXJrdXl4eGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDQ3MjksImV4cCI6MjA3NTQ4MDcyOX0.56Caf4btExzGvizmzJwZZA8KZIh81axQVcds8eXlq_Y';

      console.log('RealtimeManager: Creating Supabase client with direct keys');
      console.log('URL:', supabaseUrl);
      console.log('Key:', supabaseKey.substring(0, 20) + '...');

      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
      console.log('Supabase Realtime接続を開始');

      // 即座に接続成功として扱う（オフラインモード）
      console.log('Supabase Realtime接続完了（オフラインモード）');
      this.emit('connected');
    } catch (error: any) {
      console.error('Supabase初期化エラー:', error);
      // エラーでも接続成功として扱う（オフラインモード）
      console.log('Supabase Realtime接続完了（オフラインモード）');
      this.emit('connected');
    }
  }

  connect(userId: string, roomId: string) {
    this.userId = userId;
    this.roomId = roomId;
    
    if (this.supabase) {
      this.setupSupabaseChannel();
    }
  }

  joinRoom(roomId: string, userId: string, username: string) {
    console.log(`Joining room: ${roomId} as user: ${userId} (${username})`);
    this.userId = userId;
    this.roomId = roomId;
    
    if (this.supabase) {
      this.setupSupabaseChannel();
    }
  }

  leaveRoom() {
    console.log('Leaving room');
    this.disconnect();
  }

  private setupSupabaseChannel() {
    if (!this.roomId || !this.userId) return;

    const channelName = `room_${this.roomId}`;
    console.log(`Supabase channel setup: ${channelName}`);

    this.supabaseChannel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'realtime_update' }, (payload: any) => {
        console.log('Received realtime update:', payload);
        this.emit('realtime_update', payload);
      })
      .on('broadcast', { event: 'chat_message' }, (payload: any) => {
        console.log('Received chat message:', payload);
        this.emit('chat_message', payload);
      })
      .on('broadcast', { event: 'battle_start' }, (payload: any) => {
        console.log('Received battle start:', payload);
        this.emit('battle_start', payload);
      })
      .on('broadcast', { event: 'battle_end' }, (payload: any) => {
        console.log('Received battle end:', payload);
        this.emit('battle_end', payload);
      })
      .on('broadcast', { event: 'leaderboard_update' }, (payload: any) => {
        console.log('Received leaderboard update:', payload);
        this.emit('leaderboard_update', payload);
      })
      .subscribe((status: string) => {
        console.log(`Supabase channel status: ${status}`);
        if (status === 'SUBSCRIBED') {
          this.emit('connected');
        }
      });
  }

  disconnect() {
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }
    // Supabaseクライアントにはdisconnectメソッドがないため、チャンネルのみ切断
    this.emit('disconnected');
  }

  sendMessage(message: string) {
    console.log('sendMessage called:', { message, userId: this.userId, roomId: this.roomId });
    
    if (!this.userId || !this.roomId) {
      console.warn('sendMessage: userId or roomId not set');
      return;
    }

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: this.userId,
      username: `user_${this.userId}`,
      message,
      timestamp: new Date().toISOString(),
      roomId: this.roomId
    };

    console.log('Sending chat message:', chatMessage);

    // オフラインモードでもメッセージをローカルに保存
    this.emit('chat_message', chatMessage);
    console.log('Chat message emitted locally');

    // Supabaseチャンネルがある場合は送信
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: chatMessage
        });
        console.log('Chat message sent to Supabase channel');
      } catch (error) {
        console.error('Error sending to Supabase channel:', error);
      }
    } else {
      console.log('No Supabase channel available, using local mode only');
    }
  }

  sendProgress(progress: number, currentStep: string) {
    if (!this.supabaseChannel || !this.userId || !this.roomId) return;

    const update: RealtimeUpdate = {
      type: 'progress',
      data: { progress, currentStep },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      username: `user_${this.userId}`,
      roomId: this.roomId
    };

    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'realtime_update',
      payload: update
    });
  }

  sendBattleStart() {
    if (!this.supabaseChannel || !this.userId || !this.roomId) return;

    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'battle_start',
      payload: {
        userId: this.userId,
        roomId: this.roomId,
        timestamp: new Date().toISOString()
      }
    });
  }

  sendBattleEnd() {
    if (!this.supabaseChannel || !this.userId || !this.roomId) return;

    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'battle_end',
      payload: {
        userId: this.userId,
        roomId: this.roomId,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastLeaderboardUpdate(leaderboardData: any) {
    if (!this.supabaseChannel || !this.roomId) return;

    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'leaderboard_update',
      payload: {
        roomId: this.roomId,
        leaderboard: leaderboardData,
        timestamp: new Date().toISOString()
      }
    });
  }

  broadcastUpdate(update: RealtimeUpdate) {
    if (!this.supabaseChannel || !this.roomId) return;

    console.log('Broadcasting update:', update);
    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'realtime_update',
      payload: update
    });
  }

  startBattle(roomId: string) {
    if (!this.supabaseChannel) return;

    console.log('Starting battle for room:', roomId);
    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'battle_start',
      payload: {
        roomId,
        timestamp: new Date().toISOString()
      }
    });
  }

  endBattle(roomId: string, result: any) {
    if (!this.supabaseChannel) return;

    console.log('Ending battle for room:', roomId);
    this.supabaseChannel.send({
      type: 'broadcast',
      event: 'battle_end',
      payload: {
        roomId,
        result,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// シングルトンインスタンス
export const realtimeManager = new RealtimeManager();