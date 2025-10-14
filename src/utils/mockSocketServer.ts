// モックWebSocketサーバー（開発用）
// 実際の本番環境では、Node.js + Socket.ioサーバーが必要

export class MockSocketServer {
  private static instance: MockSocketServer;
  private rooms: Map<string, any> = new Map();
  private participants: Map<string, any> = new Map();
  private chatMessages: any[] = [];

  static getInstance(): MockSocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  // ルーム作成
  createRoom(roomData: any) {
    this.rooms.set(roomData.id, roomData);
    return roomData;
  }

  // ルーム参加
  joinRoom(roomId: string, userId: string, username: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = {
        userId,
        username,
        isReady: false,
        progress: 0,
        currentStep: 'data',
        joinedAt: new Date().toISOString()
      };
      
      room.participants = room.participants || [];
      room.participants.push(participant);
      
      this.participants.set(userId, { roomId, ...participant });
      
      return true;
    }
    return false;
  }

  // ルーム退出
  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter((p: any) => p.userId !== userId);
      this.participants.delete(userId);
      return true;
    }
    return false;
  }

  // 進捗更新
  updateProgress(userId: string, progress: number, currentStep: string, isReady: boolean) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.progress = progress;
      participant.currentStep = currentStep;
      participant.isReady = isReady;
      participant.lastActivity = new Date().toISOString();
      
      // ルーム内の他の参加者に通知
      this.broadcastToRoom(participant.roomId, 'participant_update', participant);
    }
  }

  // チャットメッセージ送信
  sendChatMessage(roomId: string, userId: string, message: string) {
    const participant = this.participants.get(userId);
    if (participant) {
      const chatMessage = {
        id: 'msg-' + Date.now(),
        userId,
        username: participant.username,
        message,
        timestamp: new Date().toISOString(),
        roomId
      };
      
      this.chatMessages.push(chatMessage);
      this.broadcastToRoom(roomId, 'chat_message', chatMessage);
    }
  }

  // バトル開始
  startBattle(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
      this.broadcastToRoom(roomId, 'battle_start', { roomId, startedAt: room.startedAt });
    }
  }

  // バトル終了
  endBattle(roomId: string, userId: string, result: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = this.participants.get(userId);
      if (participant) {
        participant.result = result;
        participant.completedAt = new Date().toISOString();
        
        // 全員が完了したかチェック
        const allCompleted = room.participants.every((p: any) => p.result);
        if (allCompleted) {
          room.status = 'finished';
          room.finishedAt = new Date().toISOString();
          this.broadcastToRoom(roomId, 'battle_end', { roomId, results: room.participants });
        }
      }
    }
  }

  // ルーム内ブロードキャスト
  private broadcastToRoom(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (room && room.participants) {
      // 実際のWebSocketサーバーでは、ここでSocket.ioのemitを行う
      console.log(`Broadcasting to room ${roomId}:`, event, data);
      
      // モック実装: 参加者にイベントを配信
      room.participants.forEach((participant: any) => {
        // 実際の実装では、各参加者のWebSocket接続にイベントを送信
        console.log(`Sending ${event} to ${participant.username}:`, data);
      });
    }
  }

  // ルーム情報取得
  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  // 参加者情報取得
  getParticipant(userId: string) {
    return this.participants.get(userId);
  }

  // チャットメッセージ取得
  getChatMessages(roomId: string) {
    return this.chatMessages.filter(msg => msg.roomId === roomId);
  }

  // グローバル更新ブロードキャスト
  broadcastUpdate(update: any) {
    console.log(`[MockServer] グローバル更新ブロードキャスト:`, update);
    // 全参加者にグローバル更新を送信
    if (this.callbacks && this.callbacks.size > 0) {
      this.callbacks.forEach((callback, userId) => {
        callback('realtime_update', update);
      });
    }
  }
}

export const mockSocketServer = MockSocketServer.getInstance();


export class MockSocketServer {
  private static instance: MockSocketServer;
  private rooms: Map<string, any> = new Map();
  private participants: Map<string, any> = new Map();
  private chatMessages: any[] = [];

  static getInstance(): MockSocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  // ルーム作成
  createRoom(roomData: any) {
    this.rooms.set(roomData.id, roomData);
    return roomData;
  }

  // ルーム参加
  joinRoom(roomId: string, userId: string, username: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = {
        userId,
        username,
        isReady: false,
        progress: 0,
        currentStep: 'data',
        joinedAt: new Date().toISOString()
      };
      
      room.participants = room.participants || [];
      room.participants.push(participant);
      
      this.participants.set(userId, { roomId, ...participant });
      
      return true;
    }
    return false;
  }

  // ルーム退出
  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter((p: any) => p.userId !== userId);
      this.participants.delete(userId);
      return true;
    }
    return false;
  }

  // 進捗更新
  updateProgress(userId: string, progress: number, currentStep: string, isReady: boolean) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.progress = progress;
      participant.currentStep = currentStep;
      participant.isReady = isReady;
      participant.lastActivity = new Date().toISOString();
      
      // ルーム内の他の参加者に通知
      this.broadcastToRoom(participant.roomId, 'participant_update', participant);
    }
  }

  // チャットメッセージ送信
  sendChatMessage(roomId: string, userId: string, message: string) {
    const participant = this.participants.get(userId);
    if (participant) {
      const chatMessage = {
        id: 'msg-' + Date.now(),
        userId,
        username: participant.username,
        message,
        timestamp: new Date().toISOString(),
        roomId
      };
      
      this.chatMessages.push(chatMessage);
      this.broadcastToRoom(roomId, 'chat_message', chatMessage);
    }
  }

  // バトル開始
  startBattle(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
      this.broadcastToRoom(roomId, 'battle_start', { roomId, startedAt: room.startedAt });
    }
  }

  // バトル終了
  endBattle(roomId: string, userId: string, result: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = this.participants.get(userId);
      if (participant) {
        participant.result = result;
        participant.completedAt = new Date().toISOString();
        
        // 全員が完了したかチェック
        const allCompleted = room.participants.every((p: any) => p.result);
        if (allCompleted) {
          room.status = 'finished';
          room.finishedAt = new Date().toISOString();
          this.broadcastToRoom(roomId, 'battle_end', { roomId, results: room.participants });
        }
      }
    }
  }

  // ルーム内ブロードキャスト
  private broadcastToRoom(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (room && room.participants) {
      // 実際のWebSocketサーバーでは、ここでSocket.ioのemitを行う
      console.log(`Broadcasting to room ${roomId}:`, event, data);
      
      // モック実装: 参加者にイベントを配信
      room.participants.forEach((participant: any) => {
        // 実際の実装では、各参加者のWebSocket接続にイベントを送信
        console.log(`Sending ${event} to ${participant.username}:`, data);
      });
    }
  }

  // ルーム情報取得
  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  // 参加者情報取得
  getParticipant(userId: string) {
    return this.participants.get(userId);
  }

  // チャットメッセージ取得
  getChatMessages(roomId: string) {
    return this.chatMessages.filter(msg => msg.roomId === roomId);
  }

  // グローバル更新ブロードキャスト
  broadcastUpdate(update: any) {
    console.log(`[MockServer] グローバル更新ブロードキャスト:`, update);
    // 全参加者にグローバル更新を送信
    if (this.callbacks && this.callbacks.size > 0) {
      this.callbacks.forEach((callback, userId) => {
        callback('realtime_update', update);
      });
    }
  }
}

export const mockSocketServer = MockSocketServer.getInstance();

export class MockSocketServer {
  private static instance: MockSocketServer;
  private rooms: Map<string, any> = new Map();
  private participants: Map<string, any> = new Map();
  private chatMessages: any[] = [];

  static getInstance(): MockSocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  // ルーム作成
  createRoom(roomData: any) {
    this.rooms.set(roomData.id, roomData);
    return roomData;
  }

  // ルーム参加
  joinRoom(roomId: string, userId: string, username: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = {
        userId,
        username,
        isReady: false,
        progress: 0,
        currentStep: 'data',
        joinedAt: new Date().toISOString()
      };
      
      room.participants = room.participants || [];
      room.participants.push(participant);
      
      this.participants.set(userId, { roomId, ...participant });
      
      return true;
    }
    return false;
  }

  // ルーム退出
  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter((p: any) => p.userId !== userId);
      this.participants.delete(userId);
      return true;
    }
    return false;
  }

  // 進捗更新
  updateProgress(userId: string, progress: number, currentStep: string, isReady: boolean) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.progress = progress;
      participant.currentStep = currentStep;
      participant.isReady = isReady;
      participant.lastActivity = new Date().toISOString();
      
      // ルーム内の他の参加者に通知
      this.broadcastToRoom(participant.roomId, 'participant_update', participant);
    }
  }

  // チャットメッセージ送信
  sendChatMessage(roomId: string, userId: string, message: string) {
    const participant = this.participants.get(userId);
    if (participant) {
      const chatMessage = {
        id: 'msg-' + Date.now(),
        userId,
        username: participant.username,
        message,
        timestamp: new Date().toISOString(),
        roomId
      };
      
      this.chatMessages.push(chatMessage);
      this.broadcastToRoom(roomId, 'chat_message', chatMessage);
    }
  }

  // バトル開始
  startBattle(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
      this.broadcastToRoom(roomId, 'battle_start', { roomId, startedAt: room.startedAt });
    }
  }

  // バトル終了
  endBattle(roomId: string, userId: string, result: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = this.participants.get(userId);
      if (participant) {
        participant.result = result;
        participant.completedAt = new Date().toISOString();
        
        // 全員が完了したかチェック
        const allCompleted = room.participants.every((p: any) => p.result);
        if (allCompleted) {
          room.status = 'finished';
          room.finishedAt = new Date().toISOString();
          this.broadcastToRoom(roomId, 'battle_end', { roomId, results: room.participants });
        }
      }
    }
  }

  // ルーム内ブロードキャスト
  private broadcastToRoom(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (room && room.participants) {
      // 実際のWebSocketサーバーでは、ここでSocket.ioのemitを行う
      console.log(`Broadcasting to room ${roomId}:`, event, data);
      
      // モック実装: 参加者にイベントを配信
      room.participants.forEach((participant: any) => {
        // 実際の実装では、各参加者のWebSocket接続にイベントを送信
        console.log(`Sending ${event} to ${participant.username}:`, data);
      });
    }
  }

  // ルーム情報取得
  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  // 参加者情報取得
  getParticipant(userId: string) {
    return this.participants.get(userId);
  }

  // チャットメッセージ取得
  getChatMessages(roomId: string) {
    return this.chatMessages.filter(msg => msg.roomId === roomId);
  }

  // グローバル更新ブロードキャスト
  broadcastUpdate(update: any) {
    console.log(`[MockServer] グローバル更新ブロードキャスト:`, update);
    // 全参加者にグローバル更新を送信
    if (this.callbacks && this.callbacks.size > 0) {
      this.callbacks.forEach((callback, userId) => {
        callback('realtime_update', update);
      });
    }
  }
}

export const mockSocketServer = MockSocketServer.getInstance();


export class MockSocketServer {
  private static instance: MockSocketServer;
  private rooms: Map<string, any> = new Map();
  private participants: Map<string, any> = new Map();
  private chatMessages: any[] = [];

  static getInstance(): MockSocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  // ルーム作成
  createRoom(roomData: any) {
    this.rooms.set(roomData.id, roomData);
    return roomData;
  }

  // ルーム参加
  joinRoom(roomId: string, userId: string, username: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = {
        userId,
        username,
        isReady: false,
        progress: 0,
        currentStep: 'data',
        joinedAt: new Date().toISOString()
      };
      
      room.participants = room.participants || [];
      room.participants.push(participant);
      
      this.participants.set(userId, { roomId, ...participant });
      
      return true;
    }
    return false;
  }

  // ルーム退出
  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter((p: any) => p.userId !== userId);
      this.participants.delete(userId);
      return true;
    }
    return false;
  }

  // 進捗更新
  updateProgress(userId: string, progress: number, currentStep: string, isReady: boolean) {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.progress = progress;
      participant.currentStep = currentStep;
      participant.isReady = isReady;
      participant.lastActivity = new Date().toISOString();
      
      // ルーム内の他の参加者に通知
      this.broadcastToRoom(participant.roomId, 'participant_update', participant);
    }
  }

  // チャットメッセージ送信
  sendChatMessage(roomId: string, userId: string, message: string) {
    const participant = this.participants.get(userId);
    if (participant) {
      const chatMessage = {
        id: 'msg-' + Date.now(),
        userId,
        username: participant.username,
        message,
        timestamp: new Date().toISOString(),
        roomId
      };
      
      this.chatMessages.push(chatMessage);
      this.broadcastToRoom(roomId, 'chat_message', chatMessage);
    }
  }

  // バトル開始
  startBattle(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
      this.broadcastToRoom(roomId, 'battle_start', { roomId, startedAt: room.startedAt });
    }
  }

  // バトル終了
  endBattle(roomId: string, userId: string, result: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = this.participants.get(userId);
      if (participant) {
        participant.result = result;
        participant.completedAt = new Date().toISOString();
        
        // 全員が完了したかチェック
        const allCompleted = room.participants.every((p: any) => p.result);
        if (allCompleted) {
          room.status = 'finished';
          room.finishedAt = new Date().toISOString();
          this.broadcastToRoom(roomId, 'battle_end', { roomId, results: room.participants });
        }
      }
    }
  }

  // ルーム内ブロードキャスト
  private broadcastToRoom(roomId: string, event: string, data: any) {
    const room = this.rooms.get(roomId);
    if (room && room.participants) {
      // 実際のWebSocketサーバーでは、ここでSocket.ioのemitを行う
      console.log(`Broadcasting to room ${roomId}:`, event, data);
      
      // モック実装: 参加者にイベントを配信
      room.participants.forEach((participant: any) => {
        // 実際の実装では、各参加者のWebSocket接続にイベントを送信
        console.log(`Sending ${event} to ${participant.username}:`, data);
      });
    }
  }

  // ルーム情報取得
  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  // 参加者情報取得
  getParticipant(userId: string) {
    return this.participants.get(userId);
  }

  // チャットメッセージ取得
  getChatMessages(roomId: string) {
    return this.chatMessages.filter(msg => msg.roomId === roomId);
  }

  // グローバル更新ブロードキャスト
  broadcastUpdate(update: any) {
    console.log(`[MockServer] グローバル更新ブロードキャスト:`, update);
    // 全参加者にグローバル更新を送信
    if (this.callbacks && this.callbacks.size > 0) {
      this.callbacks.forEach((callback, userId) => {
        callback('realtime_update', update);
      });
    }
  }
}

export const mockSocketServer = MockSocketServer.getInstance();