// 動的リーダーボード管理システム

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  modelName: string;
  accuracy: number;
  submissionTime: Date;
  hyperparameters: Record<string, any>;
  isCurrentUser: boolean;
}

export interface LeaderboardStats {
  totalParticipants: number;
  totalSubmissions: number;
  highestAccuracy: number;
  averageAccuracy: number;
  timeRemaining: string;
  nextUpdate: string;
}

export class DynamicLeaderboard {
  private submissions: LeaderboardEntry[] = [];
  private currentUser: string = '';
  private startTime: Date = new Date();
  private problemDuration: number = 7 * 24 * 60 * 60 * 1000; // 7日間
  private leaderboardId: string = '';
  private userId: string = '';

  constructor() {
    // ユーザーIDを生成または取得
    this.userId = this.getOrCreateUserId();
    this.currentUser = this.generatePlayerName();
    
    // 動的なリーダーボードIDを生成
    this.leaderboardId = `leaderboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Dynamic leaderboard initialized with ID:', this.leaderboardId);
    console.log('Current user:', this.currentUser, 'User ID:', this.userId);
    
    // 初期データを生成
    this.generateInitialData();
  }

  // ユーザーIDを取得または生成
  private getOrCreateUserId(): string {
    const storageKey = 'ml_battle_user_id';
    let userId = localStorage.getItem(storageKey);
    
    if (!userId) {
      // 新しいユーザーIDを生成
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, userId);
      console.log('新しいユーザーIDを生成:', userId);
    } else {
      console.log('既存のユーザーIDを使用:', userId);
    }
    
    return userId;
  }

  // プレイヤー名を生成
  private generatePlayerName(): string {
    const adjectives = ['Swift', 'Bright', 'Sharp', 'Bold', 'Quick', 'Smart', 'Wise', 'Strong', 'Fast', 'Cool'];
    const nouns = ['Warrior', 'Ninja', 'Master', 'Expert', 'Wizard', 'Hero', 'Champion', 'Legend', 'Pro', 'Ace'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${noun}${number}`;
  }

  // 初期データを生成
  private generateInitialData(): void {
    // 空の状態で開始
    this.submissions = [];
  }

  // 提出を追加
  addSubmission(modelName: string, accuracy: number, hyperparameters: Record<string, any>): void {
    const submission: LeaderboardEntry = {
      rank: 0, // 後で計算
      playerName: this.currentUser,
      modelName,
      accuracy,
      submissionTime: new Date(),
      hyperparameters,
      isCurrentUser: true
    };

    // 既存の現在のユーザーの提出を削除
    this.submissions = this.submissions.filter(sub => !sub.isCurrentUser);
    
    // 新しい提出を追加
    this.submissions.push(submission);
    
    // 精度でソートしてランクを更新
    this.updateRankings();
  }

  // ランキングを更新
  private updateRankings(): void {
    this.submissions.sort((a, b) => b.accuracy - a.accuracy);
    this.submissions.forEach((sub, index) => {
      sub.rank = index + 1;
    });
  }

  // リーダーボードを取得
  getLeaderboard(): LeaderboardEntry[] {
    return [...this.submissions];
  }

  // 現在のユーザーの順位を取得
  getCurrentUserRank(): number {
    const currentUserSubmission = this.submissions.find(sub => sub.isCurrentUser);
    return currentUserSubmission ? currentUserSubmission.rank : 0;
  }

  // 統計情報を取得
  getStats(): LeaderboardStats {
    const totalParticipants = new Set(this.submissions.map(sub => sub.playerName)).size;
    const totalSubmissions = this.submissions.length;
    const highestAccuracy = Math.max(...this.submissions.map(sub => sub.accuracy));
    const averageAccuracy = this.submissions.reduce((sum, sub) => sum + sub.accuracy, 0) / totalSubmissions;
    
    // 残り時間を計算
    const now = new Date();
    const endTime = new Date(this.startTime.getTime() + this.problemDuration);
    const timeRemaining = endTime.getTime() - now.getTime();
    
    const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    // 次の更新時間（月曜日 09:00）
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    nextMonday.setHours(9, 0, 0, 0);

    return {
      totalParticipants,
      totalSubmissions,
      highestAccuracy,
      averageAccuracy,
      timeRemaining: `${days}日 ${hours}時間`,
      nextUpdate: nextMonday.toLocaleString('ja-JP', { 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  }

  // 問題をリセット（週次更新）
  resetProblem(): void {
    this.submissions = [];
    this.startTime = new Date();
    this.generateInitialData();
  }
}

// シングルトンインスタンス
export const dynamicLeaderboard = new DynamicLeaderboard();
