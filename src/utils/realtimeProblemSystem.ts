// リアルタイム問題管理システム
export interface Problem {
  id: string;
  title: string;
  description: string;
  type: 'classification' | 'regression';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  maxSubmissions: number;
  isActive: boolean;
  startTime: number;
  endTime: number;
}

export interface ProblemStats {
  totalProblems: number;
  activeProblems: number;
  problemsByType: Record<string, number>;
  problemsByDifficulty: Record<string, number>;
  averageTimeLimit: number;
}

export class RealtimeProblemSystem {
  private problems: Map<string, Problem> = new Map();
  private activeProblem: Problem | null = null;
  private listeners: Set<(problem: Problem | null) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeProblems();
    this.startUpdateLoop();
  }

  // 問題を初期化
  private initializeProblems(): void {
    const problems: Problem[] = [
      {
        id: 'problem_001',
        title: '売上予測チャレンジ',
        description: '店舗の売上を予測する回帰問題',
        type: 'regression',
        difficulty: 'easy',
        timeLimit: 30,
        maxSubmissions: 5,
        isActive: true,
        startTime: Date.now(),
        endTime: Date.now() + 30 * 60 * 1000
      },
      {
        id: 'problem_002',
        title: '顧客分類チャレンジ',
        description: '顧客を分類する分類問題',
        type: 'classification',
        difficulty: 'medium',
        timeLimit: 45,
        maxSubmissions: 3,
        isActive: false,
        startTime: 0,
        endTime: 0
      },
      {
        id: 'problem_003',
        title: '不正検出チャレンジ',
        description: '不正な取引を検出する分類問題',
        type: 'classification',
        difficulty: 'hard',
        timeLimit: 60,
        maxSubmissions: 2,
        isActive: false,
        startTime: 0,
        endTime: 0
      }
    ];

    problems.forEach(problem => {
      this.problems.set(problem.id, problem);
    });

    // アクティブな問題を設定
    this.activeProblem = problems.find(p => p.isActive) || null;
  }

  // 更新ループを開始
  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      this.updateProblemStatus();
    }, 1000);
  }

  // 問題ステータスを更新
  private updateProblemStatus(): void {
    if (this.activeProblem) {
      const now = Date.now();
      if (now >= this.activeProblem.endTime) {
        this.endProblem(this.activeProblem.id);
      }
    }
  }

  // 問題を開始
  startProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    // 現在のアクティブな問題を終了
    if (this.activeProblem) {
      this.endProblem(this.activeProblem.id);
    }

    // 新しい問題を開始
    problem.isActive = true;
    problem.startTime = Date.now();
    problem.endTime = problem.startTime + problem.timeLimit * 60 * 1000;
    
    this.activeProblem = problem;
    this.notifyListeners();
    return true;
  }

  // 問題を終了
  endProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    problem.isActive = false;
    if (this.activeProblem?.id === problemId) {
      this.activeProblem = null;
    }
    
    this.notifyListeners();
    return true;
  }

  // 問題を取得
  getProblem(problemId: string): Problem | undefined {
    return this.problems.get(problemId);
  }

  // 全問題を取得
  getAllProblems(): Problem[] {
    return Array.from(this.problems.values());
  }

  // アクティブな問題を取得
  getActiveProblem(): Problem | null {
    return this.activeProblem;
  }

  // 問題を追加
  addProblem(problem: Omit<Problem, 'id' | 'startTime' | 'endTime'>): Problem {
    const newProblem: Problem = {
      ...problem,
      id: `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: 0,
      endTime: 0
    };

    this.problems.set(newProblem.id, newProblem);
    this.notifyListeners();
    return newProblem;
  }

  // 問題を更新
  updateProblem(problemId: string, updates: Partial<Problem>): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    const updatedProblem = { ...problem, ...updates };
    this.problems.set(problemId, updatedProblem);
    
    if (this.activeProblem?.id === problemId) {
      this.activeProblem = updatedProblem;
    }
    
    this.notifyListeners();
    return true;
  }

  // 問題を削除
  removeProblem(problemId: string): boolean {
    const problem = this.problems.get(problemId);
    if (!problem) return false;

    if (problem.isActive) {
      this.endProblem(problemId);
    }

    this.problems.delete(problemId);
    this.notifyListeners();
    return true;
  }

  // 統計情報を取得
  getStats(): ProblemStats {
    const allProblems = this.getAllProblems();
    const activeProblems = allProblems.filter(p => p.isActive);
    const problemsByType: Record<string, number> = {};
    const problemsByDifficulty: Record<string, number> = {};
    let totalTimeLimit = 0;

    allProblems.forEach(problem => {
      problemsByType[problem.type] = (problemsByType[problem.type] || 0) + 1;
      problemsByDifficulty[problem.difficulty] = (problemsByDifficulty[problem.difficulty] || 0) + 1;
      totalTimeLimit += problem.timeLimit;
    });

    return {
      totalProblems: allProblems.length,
      activeProblems: activeProblems.length,
      problemsByType,
      problemsByDifficulty,
      averageTimeLimit: allProblems.length > 0 ? totalTimeLimit / allProblems.length : 0
    };
  }

  // リスナーを追加
  addListener(listener: (problem: Problem | null) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (problem: Problem | null) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.activeProblem);
      } catch (error) {
        console.error('Problem listener error:', error);
      }
    });
  }

  // 破棄
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.listeners.clear();
  }
}

// シングルトンインスタンス
export const realtimeProblemSystem = new RealtimeProblemSystem();

