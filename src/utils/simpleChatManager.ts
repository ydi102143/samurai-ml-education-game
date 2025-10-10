import { SimpleChatMessage } from '../types/simpleBattle';
import { userManager } from './userManager';

export class SimpleChatManager {
  private static messages: Map<string, SimpleChatMessage[]> = new Map();
  private static messageSubscribers: Map<string, Set<(message: SimpleChatMessage) => void>> = new Map();

  // メッセージ送信
  static sendMessage(message: string, teamId?: string): SimpleChatMessage {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const chatMessage: SimpleChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: user.username,
      message,
      timestamp: new Date().toISOString(),
      teamId,
      messageType: 'text'
    };

    // メッセージを保存
    const key = teamId || 'global';
    if (!this.messages.has(key)) {
      this.messages.set(key, []);
    }
    this.messages.get(key)!.push(chatMessage);

    // 購読者に通知
    this.notifySubscribers(key, chatMessage);

    console.log('メッセージを送信しました:', chatMessage);
    return chatMessage;
  }

  // システムメッセージ送信
  static sendSystemMessage(message: string, teamId?: string): SimpleChatMessage {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const chatMessage: SimpleChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      username: 'システム',
      message,
      timestamp: new Date().toISOString(),
      teamId,
      messageType: 'system'
    };

    // メッセージを保存
    const key = teamId || 'global';
    if (!this.messages.has(key)) {
      this.messages.set(key, []);
    }
    this.messages.get(key)!.push(chatMessage);

    // 購読者に通知
    this.notifySubscribers(key, chatMessage);

    console.log('システムメッセージを送信しました:', chatMessage);
    return chatMessage;
  }

  // メッセージ取得
  static getMessages(teamId?: string, limit: number = 50): SimpleChatMessage[] {
    const key = teamId || 'global';
    const messages = this.messages.get(key) || [];
    return messages.slice(-limit);
  }

  // メッセージ購読
  static subscribeToMessages(teamId: string | undefined, callback: (message: SimpleChatMessage) => void): () => void {
    const key = teamId || 'global';
    if (!this.messageSubscribers.has(key)) {
      this.messageSubscribers.set(key, new Set());
    }
    
    this.messageSubscribers.get(key)!.add(callback);

    // 購読解除関数を返す
    return () => {
      const subscribers = this.messageSubscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.messageSubscribers.delete(key);
        }
      }
    };
  }

  // 購読者に通知
  private static notifySubscribers(key: string, message: SimpleChatMessage): void {
    const subscribers = this.messageSubscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('メッセージ購読者への通知エラー:', error);
        }
      });
    }
  }

  // メッセージ検索
  static searchMessages(query: string, teamId?: string): SimpleChatMessage[] {
    const key = teamId || 'global';
    const messages = this.messages.get(key) || [];
    const searchTerm = query.toLowerCase();
    
    return messages.filter(message => 
      message.message.toLowerCase().includes(searchTerm) ||
      message.username.toLowerCase().includes(searchTerm)
    );
  }

  // メッセージクリア
  static clearMessages(teamId?: string): void {
    const key = teamId || 'global';
    this.messages.delete(key);
    console.log('メッセージをクリアしました:', key);
  }

  // 全メッセージ取得
  static getAllMessages(): Map<string, SimpleChatMessage[]> {
    return new Map(this.messages);
  }
}

