import type { 
  BattleRoom, 
  BattleParticipant, 
  BattleProblem, 
  BattleResult, 
  BattleLeaderboard,
  BattleChatMessage,
  BattleAchievement,
  BattleSettings,
  BattleStatistics,
  BattleRealTimeUpdate
} from '../types/battle';

// バトルルーム管理システム
export class BattleRoomManager {
  private rooms: Map<string, BattleRoom> = new Map();
  private participants: Map<string, string> = new Map(); // userId -> roomId

  createRoom(
    hostId: string,
    name: string,
    maxParticipants: number = 4,
    problemType: 'classification' | 'regression' = 'classification',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    timeLimit: number = 300
  ): BattleRoom {
    const roomId = this.generateRoomId();
    const room: BattleRoom = {
      id: roomId,
      name,
      hostId,
      participants: [],
      maxParticipants,
      status: 'waiting',
      problemType,
      difficulty,
      timeLimit,
      createdAt: new Date().toISOString()
    };

    this.rooms.set(roomId, room);
    this.participants.set(hostId, roomId);
    
    return room;
  }

  joinRoom(roomId: string, userId: string, username: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting') {
      return false;
    }

    if (room.participants.length >= room.maxParticipants) {
      return false;
    }

    // 既に参加している場合は拒否
    if (room.participants.some(p => p.userId === userId)) {
      return false;
    }

    const participant: BattleParticipant = {
      userId,
      username,
      isReady: false,
      joinedAt: new Date().toISOString()
    };

    room.participants.push(participant);
    this.participants.set(userId, roomId);

    return true;
  }

  leaveRoom(userId: string): boolean {
    const roomId = this.participants.get(userId);
    if (!roomId) return false;

    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.participants = room.participants.filter(p => p.userId !== userId);
    this.participants.delete(userId);

    // ホストが退出した場合、新しいホストを選ぶ
    if (room.hostId === userId && room.participants.length > 0) {
      room.hostId = room.participants[0].userId;
    }

    // 参加者がいなくなった場合、ルームを削除
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
    }

    return true;
  }

  startBattle(roomId: string, hostId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) {
      return false;
    }

    if (room.participants.length < 2) {
      return false;
    }

    // 全員が準備完了しているかチェック
    const allReady = room.participants.every(p => p.isReady);
    if (!allReady) {
      return false;
    }

    room.status = 'active';
    room.startedAt = new Date().toISOString();

    return true;
  }

  finishBattle(roomId: string, results: BattleResult[]): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'active') {
      return false;
    }

    room.status = 'finished';
    room.finishedAt = new Date().toISOString();

    // 結果を参加者に反映
    results.forEach(result => {
      const participant = room.participants.find(p => p.userId === result.participantId);
      if (participant) {
        participant.score = result.finalScore;
        participant.rank = result.rank;
        participant.accuracy = result.accuracy;
        participant.trainingTime = result.trainingTime;
        participant.modelType = result.modelType;
      }
    });

    return true;
  }

  getRoom(roomId: string): BattleRoom | undefined {
    return this.rooms.get(roomId);
  }

  getUserRoom(userId: string): BattleRoom | undefined {
    const roomId = this.participants.get(userId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getAvailableRooms(): BattleRoom[] {
    return Array.from(this.rooms.values()).filter(room => room.status === 'waiting');
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// バトル問題管理システム
export class BattleProblemManager {
  private problems: Map<string, BattleProblem> = new Map();

  constructor() {
    this.initializeDefaultProblems();
  }

  private initializeDefaultProblems(): void {
    // 分類問題
    this.addProblem({
      id: 'classification_beginner_1',
      title: '現代株価予測チャレンジ',
      description: '過去の株価データから将来の株価を予測し、投資戦略を提案する',
      dataset: 'modern_stock_prediction',
      problemType: 'classification',
      difficulty: 'beginner',
      timeLimit: 300,
      evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1'],
      features: ['始値', '出来高', '時価総額', 'PER', '負債比率', '売上成長率', '利益率'],
      sampleSize: 1000,
      testSize: 200,
      createdAt: new Date().toISOString()
    });

    this.addProblem({
      id: 'classification_intermediate_1',
      title: '感情分析マスター',
      description: 'テキストデータから感情を分析し、ユーザーの満足度を予測する',
      dataset: 'modern_sentiment_analysis',
      problemType: 'classification',
      difficulty: 'intermediate',
      timeLimit: 600,
      evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1', 'auc'],
      features: ['単語数', 'ポジティブ単語比率', 'ネガティブ単語比率', 'ニュートラル単語比率', '感嘆符比率', '疑問符比率', '大文字比率'],
      sampleSize: 2000,
      testSize: 400,
      createdAt: new Date().toISOString()
    });

    // 回帰問題
    this.addProblem({
      id: 'regression_beginner_1',
      title: '画像分類エキスパート',
      description: '画像データを分類し、物体認識の精度を競う',
      dataset: 'modern_image_classification',
      problemType: 'regression',
      difficulty: 'beginner',
      timeLimit: 300,
      evaluationMetrics: ['mse', 'rmse', 'mae', 'r2'],
      features: ['ピクセル値', '色相', '彩度', '明度', 'エッジ密度', 'テクスチャ', '形状特徴'],
      sampleSize: 800,
      testSize: 200,
      createdAt: new Date().toISOString()
    });

    this.addProblem({
      id: 'regression_advanced_1',
      title: '推薦システム最適化',
      description: 'ユーザーの行動データから最適な推薦を提案する',
      dataset: 'modern_recommendation',
      problemType: 'regression',
      difficulty: 'advanced',
      timeLimit: 900,
      evaluationMetrics: ['mse', 'rmse', 'mae', 'r2', 'adjusted_r2'],
      features: ['ユーザー年齢', 'ユーザー収入', 'ユーザー活動度', 'アイテム価格', 'アイテム評価', 'アイテムカテゴリ', 'アイテム人気度'],
      sampleSize: 5000,
      testSize: 1000,
      createdAt: new Date().toISOString()
    });
  }

  addProblem(problem: BattleProblem): void {
    this.problems.set(problem.id, problem);
  }

  getProblem(problemId: string): BattleProblem | undefined {
    return this.problems.get(problemId);
  }

  getProblemsByDifficulty(difficulty: string): BattleProblem[] {
    return Array.from(this.problems.values()).filter(p => p.difficulty === difficulty);
  }

  getProblemsByType(problemType: string): BattleProblem[] {
    return Array.from(this.problems.values()).filter(p => p.problemType === problemType);
  }

  getRandomProblem(difficulty?: string, problemType?: string): BattleProblem | undefined {
    let filteredProblems = Array.from(this.problems.values());
    
    if (difficulty) {
      filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
    }
    
    if (problemType) {
      filteredProblems = filteredProblems.filter(p => p.problemType === problemType);
    }
    
    if (filteredProblems.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    return filteredProblems[randomIndex];
  }
}

// バトル結果評価システム
export class BattleResultEvaluator {
  evaluateBattle(
    problem: BattleProblem,
    participantResults: Array<{
      userId: string;
      accuracy: number;
      trainingTime: number;
      modelType: string;
      additionalMetrics?: Record<string, number>;
    }>
  ): BattleResult[] {
    const results: BattleResult[] = [];
    
    // スコア計算
    participantResults.forEach((result, index) => {
      const baseScore = result.accuracy * 1000;
      const timeBonus = Math.max(0, (problem.timeLimit - result.trainingTime) / 10);
      const modelBonus = this.getModelBonus(result.modelType, problem.difficulty);
      
      const finalScore = baseScore + timeBonus + modelBonus;
      
      results.push({
        battleId: '', // 実際の実装では適切なIDを設定
        participantId: result.userId,
        finalScore,
        accuracy: result.accuracy,
        precision: result.additionalMetrics?.precision,
        recall: result.additionalMetrics?.recall,
        f1Score: result.additionalMetrics?.f1Score,
        mse: result.additionalMetrics?.mse,
        rmse: result.additionalMetrics?.rmse,
        r2: result.additionalMetrics?.r2,
        trainingTime: result.trainingTime,
        modelType: result.modelType,
        rank: 0, // 後で設定
        isWinner: false, // 後で設定
        completedAt: new Date().toISOString()
      });
    });
    
    // ランキング
    results.sort((a, b) => b.finalScore - a.finalScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
      result.isWinner = index === 0;
    });
    
    return results;
  }

  private getModelBonus(modelType: string, difficulty: string): number {
    const modelBonuses: Record<string, Record<string, number>> = {
      'beginner': {
        'logistic_regression': 0,
        'linear_regression': 0,
        'knn': 10,
        'neural_network': 20
      },
      'intermediate': {
        'logistic_regression': 0,
        'linear_regression': 0,
        'knn': 5,
        'neural_network': 10,
        'ensemble': 15
      },
      'advanced': {
        'logistic_regression': -10,
        'linear_regression': -10,
        'knn': 0,
        'neural_network': 5,
        'ensemble': 10,
        'svm': 15
      }
    };
    
    return modelBonuses[difficulty]?.[modelType] || 0;
  }
}

// リアルタイム更新システム
export class BattleRealTimeManager {
  private updates: Map<string, BattleRealTimeUpdate[]> = new Map();

  addUpdate(battleId: string, update: BattleRealTimeUpdate): void {
    if (!this.updates.has(battleId)) {
      this.updates.set(battleId, []);
    }
    
    const battleUpdates = this.updates.get(battleId)!;
    battleUpdates.push(update);
    
    // 古い更新を削除（最新100件のみ保持）
    if (battleUpdates.length > 100) {
      battleUpdates.splice(0, battleUpdates.length - 100);
    }
  }

  getUpdates(battleId: string, since?: string): BattleRealTimeUpdate[] {
    const updates = this.updates.get(battleId) || [];
    
    if (since) {
      return updates.filter(update => update.timestamp > since);
    }
    
    return updates;
  }

  clearUpdates(battleId: string): void {
    this.updates.delete(battleId);
  }
}

// バトル統計管理システム
export class BattleStatisticsManager {
  private statistics: Map<string, BattleStatistics> = new Map();

  updateStatistics(userId: string, result: BattleResult): void {
    let stats = this.statistics.get(userId);
    
    if (!stats) {
      stats = this.initializeStatistics(userId);
    }
    
    // 基本統計の更新
    stats.totalBattles++;
    if (result.isWinner) {
      stats.wins++;
      stats.battleStreak++;
      stats.longestStreak = Math.max(stats.longestStreak, stats.battleStreak);
    } else {
      stats.losses++;
      stats.battleStreak = 0;
    }
    
    stats.winRate = stats.wins / stats.totalBattles;
    stats.averageAccuracy = (stats.averageAccuracy * (stats.totalBattles - 1) + result.accuracy) / stats.totalBattles;
    stats.bestAccuracy = Math.max(stats.bestAccuracy, result.accuracy);
    stats.averageTrainingTime = (stats.averageTrainingTime * (stats.totalBattles - 1) + result.trainingTime) / stats.totalBattles;
    stats.fastestTraining = Math.min(stats.fastestTraining, result.trainingTime);
    stats.lastBattleAt = new Date().toISOString();
    
    // モデル使用統計
    this.updateModelUsage(stats, result.modelType);
    
    this.statistics.set(userId, stats);
  }

  private initializeStatistics(userId: string): BattleStatistics {
    return {
      userId,
      totalBattles: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      averageTrainingTime: 0,
      fastestTraining: Infinity,
      favoriteModel: '',
      mostUsedFeatures: [],
      battleStreak: 0,
      longestStreak: 0,
      achievements: [],
      rank: 0,
      totalXP: 0,
      level: 1,
      lastBattleAt: '',
      createdAt: new Date().toISOString()
    };
  }

  private updateModelUsage(stats: BattleStatistics, modelType: string): void {
    // モデル使用統計の更新（簡易版）
    if (!stats.favoriteModel) {
      stats.favoriteModel = modelType;
    }
  }

  getStatistics(userId: string): BattleStatistics | undefined {
    return this.statistics.get(userId);
  }

  getLeaderboard(limit: number = 10): BattleLeaderboard[] {
    const allStats = Array.from(this.statistics.values());
    
    return allStats
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit)
      .map((stats, index) => ({
        userId: stats.userId,
        username: `Player${stats.userId.slice(-4)}`, // 簡易的なユーザー名
        totalBattles: stats.totalBattles,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.winRate,
        averageScore: stats.averageAccuracy * 1000,
        bestScore: stats.bestAccuracy * 1000,
        rank: index + 1,
        streak: stats.battleStreak,
        lastBattleAt: stats.lastBattleAt
      }));
  }
}

// バトルシステムのメインクラス
export class BattleSystem {
  public roomManager: BattleRoomManager;
  public problemManager: BattleProblemManager;
  public resultEvaluator: BattleResultEvaluator;
  public realTimeManager: BattleRealTimeManager;
  public statisticsManager: BattleStatisticsManager;

  constructor() {
    this.roomManager = new BattleRoomManager();
    this.problemManager = new BattleProblemManager();
    this.resultEvaluator = new BattleResultEvaluator();
    this.realTimeManager = new BattleRealTimeManager();
    this.statisticsManager = new BattleStatisticsManager();
  }

  // バトル開始の流れ
  async startBattleFlow(roomId: string, hostId: string): Promise<{
    success: boolean;
    problem?: BattleProblem;
    message?: string;
  }> {
    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'ルームが見つかりません' };
    }

    if (room.hostId !== hostId) {
      return { success: false, message: 'ホストのみが開始できます' };
    }

    if (room.participants.length < 2) {
      return { success: false, message: '最低2人の参加者が必要です' };
    }

    const allReady = room.participants.every(p => p.isReady);
    if (!allReady) {
      return { success: false, message: '全員が準備完了していません' };
    }

    // 問題を選択
    const problem = this.problemManager.getRandomProblem(room.difficulty, room.problemType);
    if (!problem) {
      return { success: false, message: '適切な問題が見つかりません' };
    }

    // バトル開始
    const started = this.roomManager.startBattle(roomId, hostId);
    if (!started) {
      return { success: false, message: 'バトル開始に失敗しました' };
    }

    return { success: true, problem };
  }

  // バトル終了の流れ
  async finishBattleFlow(
    roomId: string,
    participantResults: Array<{
      userId: string;
      accuracy: number;
      trainingTime: number;
      modelType: string;
      additionalMetrics?: Record<string, number>;
    }>
  ): Promise<{
    success: boolean;
    results?: BattleResult[];
    message?: string;
  }> {
    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      return { success: false, message: 'ルームが見つかりません' };
    }

    if (room.status !== 'active') {
      return { success: false, message: 'アクティブなバトルではありません' };
    }

    // 問題を取得
    const problem = this.problemManager.getRandomProblem(room.difficulty, room.problemType);
    if (!problem) {
      return { success: false, message: '問題が見つかりません' };
    }

    // 結果を評価
    const results = this.resultEvaluator.evaluateBattle(problem, participantResults);

    // 統計を更新
    results.forEach(result => {
      this.statisticsManager.updateStatistics(result.participantId, result);
    });

    // バトル終了
    const finished = this.roomManager.finishBattle(roomId, results);
    if (!finished) {
      return { success: false, message: 'バトル終了に失敗しました' };
    }

    return { success: true, results };
  }
}
