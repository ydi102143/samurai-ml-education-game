// バトルシステムの管理
export interface BattleRoom {
  id: string;
  name: string;
  participants: string[];
  maxParticipants: number;
  status: 'waiting' | 'active' | 'finished';
  problemId: string;
  startTime?: number;
  endTime?: number;
  results: BattleResult[];
}

export interface BattleResult {
  userId: string;
  username: string;
  score: number;
  accuracy: number;
  modelName: string;
  submittedAt: number;
  rank: number;
}

export interface BattleProblem {
  id: string;
  title: string;
  description: string;
  datasetType: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // 分
  maxSubmissions: number;
}

export class BattleRoomManager {
  private rooms: Map<string, BattleRoom> = new Map();
  private listeners: Set<(rooms: BattleRoom[]) => void> = new Set();

  // ルームを作成
  createRoom(name: string, maxParticipants: number = 4): BattleRoom {
    const room: BattleRoom = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      participants: [],
      maxParticipants,
      status: 'waiting',
      problemId: '',
      results: []
    };

    this.rooms.set(room.id, room);
    this.notifyListeners();
    return room;
  }

  // ルームに参加
  joinRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting' || room.participants.length >= room.maxParticipants) {
      return false;
    }

    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      this.notifyListeners();
    }
    return true;
  }

  // ルームから退出
  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const index = room.participants.indexOf(userId);
    if (index > -1) {
      room.participants.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // ルームを開始
  startRoom(roomId: string, problemId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'waiting' || room.participants.length < 2) {
      return false;
    }

    room.status = 'active';
    room.problemId = problemId;
    room.startTime = Date.now();
    room.endTime = room.startTime + 30 * 60 * 1000; // 30分

    this.notifyListeners();
    return true;
  }

  // ルームを終了
  finishRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'active') return false;

    room.status = 'finished';
    this.notifyListeners();
    return true;
  }

  // ルーム一覧を取得
  getRooms(): BattleRoom[] {
    return Array.from(this.rooms.values());
  }

  // 特定のルームを取得
  getRoom(roomId: string): BattleRoom | undefined {
    return this.rooms.get(roomId);
  }

  // リスナーを追加
  addListener(listener: (rooms: BattleRoom[]) => void) {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (rooms: BattleRoom[]) => void) {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getRooms()));
  }
}

export class BattleProblemManager {
  private problems: Map<string, BattleProblem> = new Map();

  constructor() {
    this.initializeProblems();
  }

  // 問題を初期化
  private initializeProblems() {
    const problems: BattleProblem[] = [
      {
        id: 'battle_001',
        title: '売上予測チャレンジ',
        description: '店舗の売上を予測する回帰問題',
        datasetType: 'regression',
        difficulty: 'easy',
        timeLimit: 30,
        maxSubmissions: 5
      },
      {
        id: 'battle_002',
        title: '顧客分類チャレンジ',
        description: '顧客を分類する分類問題',
        datasetType: 'classification',
        difficulty: 'medium',
        timeLimit: 45,
        maxSubmissions: 3
      },
      {
        id: 'battle_003',
        title: '不正検出チャレンジ',
        description: '不正な取引を検出する分類問題',
        datasetType: 'classification',
        difficulty: 'hard',
        timeLimit: 60,
        maxSubmissions: 2
      }
    ];

    problems.forEach(problem => {
      this.problems.set(problem.id, problem);
    });
  }

  // 問題一覧を取得
  getProblems(): BattleProblem[] {
    return Array.from(this.problems.values());
  }

  // 特定の問題を取得
  getProblem(problemId: string): BattleProblem | undefined {
    return this.problems.get(problemId);
  }

  // 難易度別の問題を取得
  getProblemsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): BattleProblem[] {
    return this.getProblems().filter(p => p.difficulty === difficulty);
  }
}

export class BattleResultEvaluator {
  // バトル結果を評価
  evaluateResult(
    userId: string,
    username: string,
    modelName: string,
    predictions: number[],
    actualValues: number[],
    problemType: 'classification' | 'regression'
  ): BattleResult {
    let score: number;
    let accuracy: number;

    if (problemType === 'classification') {
      accuracy = this.calculateClassificationAccuracy(predictions, actualValues);
      score = accuracy * 100;
    } else {
      const mse = this.calculateMSE(predictions, actualValues);
      const r2 = this.calculateR2(predictions, actualValues);
      accuracy = Math.max(0, r2);
      score = Math.max(0, r2 * 100);
    }

    return {
      userId,
      username,
      score,
      accuracy,
      modelName,
      submittedAt: Date.now(),
      rank: 0
    };
  }

  // 分類精度を計算
  private calculateClassificationAccuracy(predictions: number[], actualValues: number[]): number {
    if (predictions.length !== actualValues.length) return 0;
    
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (Math.round(predictions[i]) === actualValues[i]) {
        correct++;
      }
    }
    
    return correct / predictions.length;
  }

  // 平均二乗誤差を計算
  private calculateMSE(predictions: number[], actualValues: number[]): number {
    if (predictions.length !== actualValues.length) return Infinity;
    
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const diff = predictions[i] - actualValues[i];
      sum += diff * diff;
    }
    
    return sum / predictions.length;
  }

  // R²スコアを計算
  private calculateR2(predictions: number[], actualValues: number[]): number {
    if (predictions.length !== actualValues.length) return 0;
    
    const actualMean = actualValues.reduce((sum, val) => sum + val, 0) / actualValues.length;
    const ssRes = predictions.reduce((sum, pred, i) => {
      const diff = pred - actualValues[i];
      return sum + diff * diff;
    }, 0);
    const ssTot = actualValues.reduce((sum, val) => {
      const diff = val - actualMean;
      return sum + diff * diff;
    }, 0);
    
    return 1 - (ssRes / ssTot);
  }
}

export class BattleRealTimeManager {
  private updateCallbacks: Set<() => void> = new Set();

  // 更新コールバックを追加
  addUpdateCallback(callback: () => void) {
    this.updateCallbacks.add(callback);
  }

  // 更新コールバックを削除
  removeUpdateCallback(callback: () => void) {
    this.updateCallbacks.delete(callback);
  }

  // 更新を通知
  notifyUpdate() {
    this.updateCallbacks.forEach(callback => callback());
  }
}

export class BattleStatisticsManager {
  private statistics: Map<string, any> = new Map();

  // 統計を更新
  updateStatistics(roomId: string, stats: any) {
    this.statistics.set(roomId, {
      ...stats,
      lastUpdated: Date.now()
    });
  }

  // 統計を取得
  getStatistics(roomId: string): any {
    return this.statistics.get(roomId);
  }

  // 全統計を取得
  getAllStatistics(): Map<string, any> {
    return new Map(this.statistics);
  }
}

export class BattleSystem {
  private roomManager: BattleRoomManager;
  private problemManager: BattleProblemManager;
  private resultEvaluator: BattleResultEvaluator;
  private realTimeManager: BattleRealTimeManager;
  private statisticsManager: BattleStatisticsManager;

  constructor() {
    this.roomManager = new BattleRoomManager();
    this.problemManager = new BattleProblemManager();
    this.resultEvaluator = new BattleResultEvaluator();
    this.realTimeManager = new BattleRealTimeManager();
    this.statisticsManager = new BattleStatisticsManager();
  }

  // ルーム管理
  get roomManager() {
    return this.roomManager;
  }

  // 問題管理
  get problemManager() {
    return this.problemManager;
  }

  // 結果評価
  get resultEvaluator() {
    return this.resultEvaluator;
  }

  // リアルタイム管理
  get realTimeManager() {
    return this.realTimeManager;
  }

  // 統計管理
  get statisticsManager() {
    return this.statisticsManager;
  }

  // バトル結果を提出
  submitResult(
    roomId: string,
    userId: string,
    username: string,
    modelName: string,
    predictions: number[],
    actualValues: number[],
    problemType: 'classification' | 'regression'
  ): BattleResult | null {
    const room = this.roomManager.getRoom(roomId);
    if (!room || room.status !== 'active') return null;

    const result = this.resultEvaluator.evaluateResult(
      userId,
      username,
      modelName,
      predictions,
      actualValues,
      problemType
    );

    // 結果をルームに追加
    room.results.push(result);

    // ランキングを更新
    this.updateRankings(room);

    // 統計を更新
    this.updateRoomStatistics(room);

    // リアルタイム更新を通知
    this.realTimeManager.notifyUpdate();

    return result;
  }

  // ランキングを更新
  private updateRankings(room: BattleRoom) {
    room.results.sort((a, b) => b.score - a.score);
    room.results.forEach((result, index) => {
      result.rank = index + 1;
    });
  }

  // ルーム統計を更新
  private updateRoomStatistics(room: BattleRoom) {
    const stats = {
      totalSubmissions: room.results.length,
      averageScore: room.results.length > 0 
        ? room.results.reduce((sum, r) => sum + r.score, 0) / room.results.length 
        : 0,
      topScore: room.results.length > 0 ? Math.max(...room.results.map(r => r.score)) : 0,
      participants: room.participants.length,
      activeParticipants: room.results.length
    };

    this.statisticsManager.updateStatistics(room.id, stats);
  }
}

// シングルトンインスタンス
export const battleSystem = new BattleSystem();

