// 競技問題管理システム
export interface CompetitionProblem {
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
  evaluation: {
    metric: string;
    threshold: number;
  };
}

export interface ProblemConfig {
  enableAutoStart: boolean;
  enableNotifications: boolean;
  timezone: string;
  defaultDuration: number;
}

export interface ProblemEvent {
  id: string;
  type: 'problem_start' | 'problem_end' | 'submission_received';
  problemId: string;
  timestamp: number;
  message: string;
  data?: any;
}

export class CompetitionProblemManager {
  private problems: Map<string, CompetitionProblem> = new Map();
  private currentProblem: CompetitionProblem | null = null;
  private events: ProblemEvent[] = [];
  private config: ProblemConfig;
  private listeners: Set<(event: ProblemEvent) => void> = new Set();

  constructor(config: ProblemConfig = {
    enableAutoStart: true,
    enableNotifications: true,
    timezone: 'Asia/Tokyo',
    defaultDuration: 7 * 24 * 60 * 60 * 1000 // 7日
  }) {
    this.config = config;
    this.initializeProblems();
  }

  // 問題を初期化
  private initializeProblems(): void {
    const problems: CompetitionProblem[] = [
      {
        id: 'comp_001',
        title: '売上予測チャレンジ',
        description: '店舗の売上を予測する回帰問題',
        type: 'regression',
        difficulty: 'easy',
        startTime: Date.now(),
        endTime: Date.now() + this.config.defaultDuration,
        maxSubmissions: 5,
        isActive: true,
        dataset: {
          type: 'sales',
          size: 1000,
          features: 8
        },
        evaluation: {
          metric: 'RMSE',
          threshold: 0.1
        }
      },
      {
        id: 'comp_002',
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
        },
        evaluation: {
          metric: 'Accuracy',
          threshold: 0.8
        }
      },
      {
        id: 'comp_003',
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
        },
        evaluation: {
          metric: 'F1-Score',
          threshold: 0.85
        }
      }
    ];

    problems.forEach(problem => {
      this.problems.set(problem.id, problem);
    });

    this.currentProblem = problems.find(p => p.isActive) || null;
  }

  // 問題を開始
  startProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    // 現在の問題を終了
    if (this.currentProblem) {
      this.endProblem(this.currentProblem.id);
    }

    // 新しい問題を開始
    problem.isActive = true;
    problem.startTime = Date.now();
    problem.endTime = Date.now() + this.config.defaultDuration;
    this.currentProblem = problem;

    const event: ProblemEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_start',
      problemId: problem.id,
      timestamp: Date.now(),
      message: `問題「${problem.title}」が開始されました`
    };

    this.events.push(event);
    this.notifyListeners(event);
    return true;
  }

  // 問題を終了
  endProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem || !problem.isActive) return false;

    problem.isActive = false;
    
    if (this.currentProblem?.id === problemId) {
      this.currentProblem = null;
    }

    const event: ProblemEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem_end',
      problemId: problem.id,
      timestamp: Date.now(),
      message: `問題「${problem.title}」が終了しました`
    };

    this.events.push(event);
    this.notifyListeners(event);
    return true;
  }

  // 提出を受け付け
  receiveSubmission(problemId: string, submission: any): boolean {
    const problem = this.problems.get(problemId);
    if (!problem || !problem.isActive) return false;

    const event: ProblemEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'submission_received',
      problemId: problem.id,
      timestamp: Date.now(),
      message: `問題「${problem.title}」に提出がありました`,
      data: submission
    };

    this.events.push(event);
    this.notifyListeners(event);
    return true;
  }

  // 現在の問題を取得
  getCurrentProblem(): CompetitionProblem | null {
    return this.currentProblem;
  }

  // 全問題を取得
  getAllProblems(): CompetitionProblem[] {
    return Array.from(this.problems.values());
  }

  // アクティブな問題を取得
  getActiveProblems(): CompetitionProblem[] {
    return this.getAllProblems().filter(p => p.isActive);
  }

  // 問題を取得
  getProblem(problemId: string): CompetitionProblem | undefined {
    return this.problems.get(problemId);
  }

  // イベント履歴を取得
  getEvents(): ProblemEvent[] {
    return [...this.events];
  }

  // 問題の残り時間を取得
  getRemainingTime(problemId: string): number {
    const problem = this.problems.get(problemId);
    if (!problem || !problem.isActive) return 0;
    return Math.max(0, problem.endTime - Date.now());
  }

  // 問題の進捗率を取得
  getProgressPercentage(problemId: string): number {
    const problem = this.problems.get(problemId);
    if (!problem || !problem.isActive) return 0;
    const total = problem.endTime - problem.startTime;
    const elapsed = Date.now() - problem.startTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  // 統計情報を取得
  getStats(): {
    totalProblems: number;
    activeProblems: number;
    completedProblems: number;
    totalEvents: number;
    problemsByType: Record<string, number>;
    problemsByDifficulty: Record<string, number>;
  } {
    const allProblems = this.getAllProblems();
    const activeProblems = allProblems.filter(p => p.isActive);
    const completedProblems = allProblems.filter(p => !p.isActive && p.startTime > 0);
    
    const problemsByType: Record<string, number> = {};
    const problemsByDifficulty: Record<string, number> = {};

    allProblems.forEach(problem => {
      problemsByType[problem.type] = (problemsByType[problem.type] || 0) + 1;
      problemsByDifficulty[problem.difficulty] = (problemsByDifficulty[problem.difficulty] || 0) + 1;
    });

    return {
      totalProblems: allProblems.length,
      activeProblems: activeProblems.length,
      completedProblems: completedProblems.length,
      totalEvents: this.events.length,
      problemsByType,
      problemsByDifficulty
    };
  }

  // リスナーを追加
  addListener(listener: (event: ProblemEvent) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (event: ProblemEvent) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(event: ProblemEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Problem manager listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<ProblemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): ProblemConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.problems.clear();
    this.events = [];
    this.currentProblem = null;
  }
}

// シングルトンインスタンス
export const competitionProblemManager = new CompetitionProblemManager();

