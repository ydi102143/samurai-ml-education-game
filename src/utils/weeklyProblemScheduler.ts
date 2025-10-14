// 週次問題スケジューラー
export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  endTime: number;
  maxSubmissions: number;
  isActive: boolean;
  dataset: {
    type: string;
    size: number;
    features: number;
  };
}

export interface ScheduleConfig {
  problemDuration: number; // ミリ秒
  breakDuration: number; // ミリ秒
  enableAutoStart: boolean;
  enableNotifications: boolean;
  timezone: string;
}

export interface ScheduleEvent {
  id: string;
  type: 'problem_start' | 'problem_end' | 'break_start' | 'break_end';
  problemId?: string;
  timestamp: number;
  message: string;
}

export class WeeklyProblemScheduler {
  private problems: Map<string, WeeklyProblem> = new Map();
  private currentProblem: WeeklyProblem | null = null;
  private schedule: ScheduleEvent[] = [];
  private config: ScheduleConfig;
  private scheduler: NodeJS.Timeout | null = null;
  private listeners: Set<(event: ScheduleEvent) => void> = new Set();

  constructor(config: ScheduleConfig = {
    problemDuration: 7 * 24 * 60 * 60 * 1000, // 7日
    breakDuration: 24 * 60 * 60 * 1000, // 1日
    enableAutoStart: true,
    enableNotifications: true,
    timezone: 'Asia/Tokyo'
  }) {
    this.config = config;
    this.initializeProblems();
    this.startScheduler();
  }

  // 問題を初期化
  private initializeProblems(): void {
    const problems: WeeklyProblem[] = [
      {
        id: 'weekly_001',
        title: '売上予測チャレンジ',
        description: '店舗の売上を予測する回帰問題',
        type: 'regression',
        difficulty: 'easy',
        startTime: Date.now(),
        endTime: Date.now() + this.config.problemDuration,
        maxSubmissions: 5,
        isActive: true,
        dataset: {
          type: 'sales',
          size: 1000,
          features: 8
        }
      },
      {
        id: 'weekly_002',
        title: '顧客分類チャレンジ',
        description: '顧客を分類する分類問題',
        type: 'classification',
        difficulty: 'medium',
        startTime: 0,
        endTime: 0,
        maxSubmissions: 3,
        isActive: false,
        dataset: {
          type: 'customer',
          size: 800,
          features: 6
        }
      },
      {
        id: 'weekly_003',
        title: '不正検出チャレンジ',
        description: '不正な取引を検出する分類問題',
        type: 'classification',
        difficulty: 'hard',
        startTime: 0,
        endTime: 0,
        maxSubmissions: 2,
        isActive: false,
        dataset: {
          type: 'fraud',
          size: 1500,
          features: 12
        }
      }
    ];

    problems.forEach(problem => {
      this.problems.set(problem.id, problem);
    });

    this.currentProblem = problems.find(p => p.isActive) || null;
  }

  // スケジューラーを開始
  private startScheduler(): void {
    if (!this.config.enableAutoStart) return;

    this.scheduler = setInterval(() => {
      this.checkSchedule();
    }, 60000); // 1分ごとにチェック
  }

  // スケジュールをチェック
  private checkSchedule(): void {
    const now = Date.now();

    if (this.currentProblem) {
      if (now >= this.currentProblem.endTime) {
        this.endCurrentProblem();
      }
    } else {
      this.startNextProblem();
    }
  }

  // 現在の問題を終了
  private endCurrentProblem(): void {
    if (!this.currentProblem) return;

    this.currentProblem.isActive = false;
    
    const event: ScheduleEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_end',
      problemId: this.currentProblem.id,
      timestamp: Date.now(),
      message: `問題「${this.currentProblem.title}」が終了しました`
    };

    this.schedule.push(event);
    this.notifyListeners(event);

    this.currentProblem = null;

    // 休憩期間を設定
    setTimeout(() => {
      this.startNextProblem();
    }, this.config.breakDuration);
  }

  // 次の問題を開始
  private startNextProblem(): void {
    const availableProblems = Array.from(this.problems.values())
      .filter(p => !p.isActive && p.startTime === 0);

    if (availableProblems.length === 0) {
      // 全ての問題が終了した場合、最初の問題を再開
      this.resetProblems();
      return;
    }

    const nextProblem = availableProblems[0];
    nextProblem.isActive = true;
    nextProblem.startTime = Date.now();
    nextProblem.endTime = Date.now() + this.config.problemDuration;

    this.currentProblem = nextProblem;

    const event: ScheduleEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_start',
      problemId: nextProblem.id,
      timestamp: Date.now(),
      message: `問題「${nextProblem.title}」が開始されました`
    };

    this.schedule.push(event);
    this.notifyListeners(event);
  }

  // 問題をリセット
  private resetProblems(): void {
    this.problems.forEach(problem => {
      problem.isActive = false;
      problem.startTime = 0;
      problem.endTime = 0;
    });

    // 最初の問題を開始
    const firstProblem = Array.from(this.problems.values())[0];
    if (firstProblem) {
      firstProblem.isActive = true;
      firstProblem.startTime = Date.now();
      firstProblem.endTime = Date.now() + this.config.problemDuration;
      this.currentProblem = firstProblem;
    }
  }

  // 問題を手動で開始
  startProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    // 現在の問題を終了
    if (this.currentProblem) {
      this.endCurrentProblem();
    }

    // 新しい問題を開始
    problem.isActive = true;
    problem.startTime = Date.now();
    problem.endTime = Date.now() + this.config.problemDuration;
    this.currentProblem = problem;

    const event: ScheduleEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_start',
      problemId: problem.id,
      timestamp: Date.now(),
      message: `問題「${problem.title}」が手動で開始されました`
    };

    this.schedule.push(event);
    this.notifyListeners(event);
    return true;
  }

  // 問題を手動で終了
  endProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem || !problem.isActive) return false;

    problem.isActive = false;
    
    if (this.currentProblem?.id === problemId) {
      this.currentProblem = null;
    }

    const event: ScheduleEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_end',
      problemId: problem.id,
      timestamp: Date.now(),
      message: `問題「${problem.title}」が手動で終了されました`
    };

    this.schedule.push(event);
    this.notifyListeners(event);
    return true;
  }

  // 現在の問題を取得
  getCurrentProblem(): WeeklyProblem | null {
    return this.currentProblem;
  }

  // 全問題を取得
  getAllProblems(): WeeklyProblem[] {
    return Array.from(this.problems.values());
  }

  // アクティブな問題を取得
  getActiveProblems(): WeeklyProblem[] {
    return this.getAllProblems().filter(p => p.isActive);
  }

  // スケジュール履歴を取得
  getScheduleHistory(): ScheduleEvent[] {
    return [...this.schedule];
  }

  // 次の問題を取得
  getNextProblem(): WeeklyProblem | null {
    const availableProblems = Array.from(this.problems.values())
      .filter(p => !p.isActive && p.startTime === 0);
    return availableProblems[0] || null;
  }

  // 残り時間を取得
  getRemainingTime(): number {
    if (!this.currentProblem) return 0;
    return Math.max(0, this.currentProblem.endTime - Date.now());
  }

  // 進捗率を取得
  getProgressPercentage(): number {
    if (!this.currentProblem) return 0;
    const total = this.currentProblem.endTime - this.currentProblem.startTime;
    const elapsed = Date.now() - this.currentProblem.startTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  // 統計情報を取得
  getStats(): {
    totalProblems: number;
    activeProblems: number;
    completedProblems: number;
    totalEvents: number;
    averageProblemDuration: number;
  } {
    const allProblems = this.getAllProblems();
    const activeProblems = allProblems.filter(p => p.isActive);
    const completedProblems = allProblems.filter(p => !p.isActive && p.startTime > 0);
    
    const totalDuration = completedProblems.reduce((sum, p) => 
      sum + (p.endTime - p.startTime), 0);
    const averageDuration = completedProblems.length > 0 
      ? totalDuration / completedProblems.length 
      : 0;

    return {
      totalProblems: allProblems.length,
      activeProblems: activeProblems.length,
      completedProblems: completedProblems.length,
      totalEvents: this.schedule.length,
      averageProblemDuration: averageDuration
    };
  }

  // リスナーを追加
  addListener(listener: (event: ScheduleEvent) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (event: ScheduleEvent) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(event: ScheduleEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Schedule listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enableAutoStart !== undefined) {
      if (newConfig.enableAutoStart && !this.scheduler) {
        this.startScheduler();
      } else if (!newConfig.enableAutoStart && this.scheduler) {
        clearInterval(this.scheduler);
        this.scheduler = null;
      }
    }
  }

  // 設定を取得
  getConfig(): ScheduleConfig {
    return { ...this.config };
  }

  // 破棄
  destroy(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
export const weeklyProblemScheduler = new WeeklyProblemScheduler();

