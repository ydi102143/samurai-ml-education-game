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
  private currentUser: string = 'あなた';
  private startTime: Date = new Date();
  private problemDuration: number = 7 * 24 * 60 * 60 * 1000; // 7日間
  private leaderboardId: string = '';

  constructor() {
    // 動的なリーダーボードIDを生成
    this.leaderboardId = `leaderboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Dynamic leaderboard initialized with ID:', this.leaderboardId);
    
    // 初期データを生成
    this.generateInitialData();
  }

  // 初期データを生成
  private generateInitialData(): void {
    const sampleNames = [
      'AI_Master', 'DataWizard', 'ML_Expert', 'CodeNinja', 'AlgorithmKing',
      'NeuralNet', 'DeepLearner', 'ModelBuilder', 'FeatureEngineer', 'DataScientist'
    ];

    for (let i = 0; i < 10; i++) {
      this.submissions.push({
        rank: i + 1,
        playerName: sampleNames[i],
        modelName: `Model_v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
        accuracy: 0.75 + Math.random() * 0.2, // 75-95%
        submissionTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        hyperparameters: {
          epochs: Math.floor(Math.random() * 50) + 20,
          learning_rate: (Math.random() * 0.01 + 0.001).toFixed(4),
          batch_size: [16, 32, 64][Math.floor(Math.random() * 3)]
        },
        isCurrentUser: false
      });
    }
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
