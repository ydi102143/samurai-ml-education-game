// ユーザー管理システム（経験値制度廃止）
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  lastActiveAt: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  bestScore: number;
  currentStreak: number;
}

export class UserManager {
  private static instance: UserManager;
  private currentUser: User | null = null;

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  // 現在のユーザーを取得
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ユーザーを設定
  setUser(user: User): void {
    this.currentUser = user;
    this.saveUserToStorage();
  }

  // ユーザーをログイン
  loginUser(username: string, email?: string): User {
    // 既存のユーザーをチェック
    const existingUser = this.loadUserFromStorage();
    
    if (existingUser && existingUser.username === username) {
      this.currentUser = existingUser;
      this.updateLastActive();
      return existingUser;
    }

    // 新しいユーザーを作成（経験値制度廃止）
    const newUser: User = {
      id: this.generateUserId(),
      username,
      email,
      avatar: this.generateAvatar(username),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      bestScore: 0,
      currentStreak: 0
    };

    this.currentUser = newUser;
    this.saveUserToStorage();
    return newUser;
  }

  // ユーザーをログアウト
  logoutUser(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // バトル結果を更新（経験値制度廃止）
  updateBattleResult(won: boolean, score: number): void {
    if (!this.currentUser) return;

    const user = this.currentUser;
    user.totalBattles++;
    
    if (won) {
      user.wins++;
      user.currentStreak++;
    } else {
      user.losses++;
      user.currentStreak = 0;
    }

    user.winRate = user.totalBattles > 0 ? user.wins / user.totalBattles : 0;
    
    if (score > user.bestScore) {
      user.bestScore = score;
    }

    // 経験値制度廃止

    this.updateUser(user);
  }

  // ユーザーIDを生成
  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `user_${timestamp}_${random}`;
  }

  // アバターを生成
  private generateAvatar(username: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const colorIndex = username.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  }

  // ユーザーを更新
  private updateUser(user: User): void {
    this.currentUser = user;
    this.saveUserToStorage();
  }

  // 最後のアクティブ時間を更新
  private updateLastActive(): void {
    if (this.currentUser) {
      this.currentUser.lastActiveAt = new Date().toISOString();
      this.saveUserToStorage();
    }
  }

  // ユーザーをストレージに保存
  private saveUserToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // ストレージからユーザーを読み込み
  private loadUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('ユーザーデータの読み込みに失敗:', error);
      return null;
    }
  }

  // レベル情報を取得（経験値制度廃止）
  getLevelInfo(): {
    level: number;
    experience: number;
    nextLevelExp: number;
    progress: number;
  } {
    // 経験値制度廃止のため、固定値を返す
    return { level: 1, experience: 0, nextLevelExp: 0, progress: 0 };
  }
}

// シングルトンインスタンスをエクスポート
export const userManager = UserManager.getInstance();