import { TeamChatMessage, ChatReaction, Team } from '../types/onlineBattle';
import { TeamManager } from './teamManager';
import { userManager } from './userManager';

export class TeamChatManager {
  private static teamMessages: Map<string, TeamChatMessage[]> = new Map();
  private static messageSubscribers: Map<string, Set<(message: TeamChatMessage) => void>> = new Map();

  // チーム内メッセージ送信
  static sendTeamMessage(teamId: string, message: string, messageType: 'text' | 'system' | 'announcement' = 'text'): TeamChatMessage {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const team = TeamManager.getTeam(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    // チームメンバーかチェック
    const isMember = team.members.some(member => member.userId === user.id);
    if (!isMember) {
      throw new Error('チームメンバーではありません');
    }

    const chatMessage: TeamChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      userId: user.id,
      username: user.username,
      message,
      messageType,
      timestamp: new Date().toISOString(),
      isEdited: false,
      reactions: []
    };

    // メッセージを保存
    if (!this.teamMessages.has(teamId)) {
      this.teamMessages.set(teamId, []);
    }
    this.teamMessages.get(teamId)!.push(chatMessage);

    // 購読者に通知
    this.notifySubscribers(teamId, chatMessage);

    console.log('チームメッセージを送信しました:', chatMessage);
    return chatMessage;
  }

  // システムメッセージ送信
  static sendSystemMessage(teamId: string, message: string): TeamChatMessage {
    return this.sendTeamMessage(teamId, message, 'system');
  }

  // アナウンスメッセージ送信
  static sendAnnouncement(teamId: string, message: string): TeamChatMessage {
    return this.sendTeamMessage(teamId, message, 'announcement');
  }

  // チームメッセージ取得
  static getTeamMessages(teamId: string, limit: number = 50): TeamChatMessage[] {
    const messages = this.teamMessages.get(teamId) || [];
    return messages.slice(-limit);
  }

  // メッセージ編集
  static editMessage(teamId: string, messageId: string, newMessage: string): TeamChatMessage {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const messages = this.teamMessages.get(teamId);
    if (!messages) {
      throw new Error('チームが見つかりません');
    }

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      throw new Error('メッセージが見つかりません');
    }

    const message = messages[messageIndex];
    if (message.userId !== user.id) {
      throw new Error('自分のメッセージのみ編集できます');
    }

    if (message.messageType !== 'text') {
      throw new Error('システムメッセージは編集できません');
    }

    message.message = newMessage;
    message.isEdited = true;
    message.editedAt = new Date().toISOString();

    console.log('メッセージを編集しました:', message);
    return message;
  }

  // メッセージ削除
  static deleteMessage(teamId: string, messageId: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const messages = this.teamMessages.get(teamId);
    if (!messages) {
      throw new Error('チームが見つかりません');
    }

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      throw new Error('メッセージが見つかりません');
    }

    const message = messages[messageIndex];
    if (message.userId !== user.id) {
      throw new Error('自分のメッセージのみ削除できます');
    }

    messages.splice(messageIndex, 1);
    console.log('メッセージを削除しました:', messageId);
  }

  // リアクション追加
  static addReaction(teamId: string, messageId: string, emoji: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const messages = this.teamMessages.get(teamId);
    if (!messages) {
      throw new Error('チームが見つかりません');
    }

    const message = messages.find(msg => msg.id === messageId);
    if (!message) {
      throw new Error('メッセージが見つかりません');
    }

    // 既存のリアクションをチェック
    const existingReaction = message.reactions.find(reaction => 
      reaction.userId === user.id && reaction.emoji === emoji
    );

    if (existingReaction) {
      // 既存のリアクションを削除
      message.reactions = message.reactions.filter(reaction => 
        !(reaction.userId === user.id && reaction.emoji === emoji)
      );
    } else {
      // 新しいリアクションを追加
      const reaction: ChatReaction = {
        emoji,
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString()
      };
      message.reactions.push(reaction);
    }

    console.log('リアクションを更新しました:', { messageId, emoji, userId: user.id });
  }

  // メッセージ購読
  static subscribeToTeamMessages(teamId: string, callback: (message: TeamChatMessage) => void): () => void {
    if (!this.messageSubscribers.has(teamId)) {
      this.messageSubscribers.set(teamId, new Set());
    }
    
    this.messageSubscribers.get(teamId)!.add(callback);

    // 購読解除関数を返す
    return () => {
      const subscribers = this.messageSubscribers.get(teamId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.messageSubscribers.delete(teamId);
        }
      }
    };
  }

  // 購読者に通知
  private static notifySubscribers(teamId: string, message: TeamChatMessage): void {
    const subscribers = this.messageSubscribers.get(teamId);
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

  // チームメッセージ検索
  static searchTeamMessages(teamId: string, query: string): TeamChatMessage[] {
    const messages = this.teamMessages.get(teamId) || [];
    const searchTerm = query.toLowerCase();
    
    return messages.filter(message => 
      message.message.toLowerCase().includes(searchTerm) ||
      message.username.toLowerCase().includes(searchTerm)
    );
  }

  // メッセージ統計取得
  static getTeamMessageStats(teamId: string): {
    totalMessages: number;
    messagesByType: Record<string, number>;
    messagesByUser: Record<string, number>;
    mostActiveHour: number;
    averageMessagesPerDay: number;
  } {
    const messages = this.teamMessages.get(teamId) || [];
    
    const messagesByType: Record<string, number> = {};
    const messagesByUser: Record<string, number> = {};
    const messagesByHour: Record<number, number> = {};
    
    messages.forEach(message => {
      // タイプ別カウント
      messagesByType[message.messageType] = (messagesByType[message.messageType] || 0) + 1;
      
      // ユーザー別カウント
      messagesByUser[message.userId] = (messagesByUser[message.userId] || 0) + 1;
      
      // 時間別カウント
      const hour = new Date(message.timestamp).getHours();
      messagesByHour[hour] = (messagesByHour[hour] || 0) + 1;
    });

    // 最もアクティブな時間を計算
    const mostActiveHour = Object.entries(messagesByHour)
      .reduce((max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max, { hour: 0, count: 0 })
      .hour;

    // 1日あたりの平均メッセージ数を計算
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const daysDiff = firstMessage && lastMessage ? 
      Math.max(1, Math.ceil((new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    const averageMessagesPerDay = messages.length / daysDiff;

    return {
      totalMessages: messages.length,
      messagesByType,
      messagesByUser,
      mostActiveHour,
      averageMessagesPerDay
    };
  }

  // チームメッセージクリア
  static clearTeamMessages(teamId: string): void {
    this.teamMessages.delete(teamId);
    console.log('チームメッセージをクリアしました:', teamId);
  }

  // 全チームメッセージ取得（管理者用）
  static getAllTeamMessages(): Map<string, TeamChatMessage[]> {
    return new Map(this.teamMessages);
  }
}

