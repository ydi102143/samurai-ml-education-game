// 提出管理システム
export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  modelName: string;
  score: number;
  publicScore: number;
  privateScore: number;
  submittedAt: Date;
  status: 'pending' | 'evaluated' | 'failed';
  metadata: {
    hyperparameters: Record<string, any>;
    preprocessing: string[];
    featureEngineering: string[];
    trainingTime: number;
    validationTime: number;
  };
}

export interface SubmissionStats {
  totalSubmissions: number;
  evaluatedSubmissions: number;
  failedSubmissions: number;
  averageScore: number;
  bestScore: number;
  submissionsByModel: Record<string, number>;
  submissionsByProblem: Record<string, number>;
}

export class SubmissionManager {
  private submissions: Map<string, Submission> = new Map();
  private userSubmissions: Map<string, string[]> = new Map();
  private problemSubmissions: Map<string, string[]> = new Map();
  private listeners: Set<(submissions: Submission[]) => void> = new Set();

  // 提出を追加
  addSubmission(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>): Submission {
    const newSubmission: Submission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: new Date(),
      status: 'pending'
    };

    this.submissions.set(newSubmission.id, newSubmission);
    
    // ユーザー別提出を更新
    if (!this.userSubmissions.has(newSubmission.userId)) {
      this.userSubmissions.set(newSubmission.userId, []);
    }
    this.userSubmissions.get(newSubmission.userId)!.push(newSubmission.id);
    
    // 問題別提出を更新
    if (!this.problemSubmissions.has(newSubmission.problemId)) {
      this.problemSubmissions.set(newSubmission.problemId, []);
    }
    this.problemSubmissions.get(newSubmission.problemId)!.push(newSubmission.id);

    this.notifyListeners();
    return newSubmission;
  }

  // 提出を更新
  updateSubmission(submissionId: string, updates: Partial<Submission>): boolean {
    const submission = this.submissions.get(submissionId);
    if (!submission) return false;

    const updatedSubmission = { ...submission, ...updates };
    this.submissions.set(submissionId, updatedSubmission);
    this.notifyListeners();
    return true;
  }

  // 提出を取得
  getSubmission(submissionId: string): Submission | undefined {
    return this.submissions.get(submissionId);
  }

  // ユーザーの提出を取得
  getUserSubmissions(userId: string): Submission[] {
    const submissionIds = this.userSubmissions.get(userId) || [];
    return submissionIds.map(id => this.submissions.get(id)!).filter(Boolean);
  }

  // 問題の提出を取得
  getProblemSubmissions(problemId: string): Submission[] {
    const submissionIds = this.problemSubmissions.get(problemId) || [];
    return submissionIds.map(id => this.submissions.get(id)!).filter(Boolean);
  }

  // 全提出を取得
  getAllSubmissions(): Submission[] {
    return Array.from(this.submissions.values());
  }

  // 提出を削除
  deleteSubmission(submissionId: string): boolean {
    const submission = this.submissions.get(submissionId);
    if (!submission) return false;

    // ユーザー別提出から削除
    const userSubmissions = this.userSubmissions.get(submission.userId);
    if (userSubmissions) {
      const index = userSubmissions.indexOf(submissionId);
      if (index > -1) {
        userSubmissions.splice(index, 1);
      }
    }

    // 問題別提出から削除
    const problemSubmissions = this.problemSubmissions.get(submission.problemId);
    if (problemSubmissions) {
      const index = problemSubmissions.indexOf(submissionId);
      if (index > -1) {
        problemSubmissions.splice(index, 1);
      }
    }

    this.submissions.delete(submissionId);
    this.notifyListeners();
    return true;
  }

  // 提出を評価
  evaluateSubmission(submissionId: string, publicScore: number, privateScore: number): boolean {
    return this.updateSubmission(submissionId, {
      publicScore,
      privateScore,
      score: publicScore,
      status: 'evaluated'
    });
  }

  // 提出を失敗としてマーク
  markSubmissionFailed(submissionId: string, reason: string): boolean {
    return this.updateSubmission(submissionId, {
      status: 'failed'
    });
  }

  // 統計情報を取得
  getStats(): SubmissionStats {
    const allSubmissions = this.getAllSubmissions();
    const evaluatedSubmissions = allSubmissions.filter(s => s.status === 'evaluated');
    const failedSubmissions = allSubmissions.filter(s => s.status === 'failed');

    const averageScore = evaluatedSubmissions.length > 0
      ? evaluatedSubmissions.reduce((sum, s) => sum + s.score, 0) / evaluatedSubmissions.length
      : 0;

    const bestScore = evaluatedSubmissions.length > 0
      ? Math.max(...evaluatedSubmissions.map(s => s.score))
      : 0;

    const submissionsByModel: Record<string, number> = {};
    const submissionsByProblem: Record<string, number> = {};

    allSubmissions.forEach(submission => {
      submissionsByModel[submission.modelName] = (submissionsByModel[submission.modelName] || 0) + 1;
      submissionsByProblem[submission.problemId] = (submissionsByProblem[submission.problemId] || 0) + 1;
    });

    return {
      totalSubmissions: allSubmissions.length,
      evaluatedSubmissions: evaluatedSubmissions.length,
      failedSubmissions: failedSubmissions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      submissionsByModel,
      submissionsByProblem
    };
  }

  // ユーザーの統計情報を取得
  getUserStats(userId: string): {
    totalSubmissions: number;
    evaluatedSubmissions: number;
    averageScore: number;
    bestScore: number;
    submissionsByModel: Record<string, number>;
  } {
    const userSubmissions = this.getUserSubmissions(userId);
    const evaluatedSubmissions = userSubmissions.filter(s => s.status === 'evaluated');

    const averageScore = evaluatedSubmissions.length > 0
      ? evaluatedSubmissions.reduce((sum, s) => sum + s.score, 0) / evaluatedSubmissions.length
      : 0;

    const bestScore = evaluatedSubmissions.length > 0
      ? Math.max(...evaluatedSubmissions.map(s => s.score))
      : 0;

    const submissionsByModel: Record<string, number> = {};
    userSubmissions.forEach(submission => {
      submissionsByModel[submission.modelName] = (submissionsByModel[submission.modelName] || 0) + 1;
    });

    return {
      totalSubmissions: userSubmissions.length,
      evaluatedSubmissions: evaluatedSubmissions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      submissionsByModel
    };
  }

  // 問題の統計情報を取得
  getProblemStats(problemId: string): {
    totalSubmissions: number;
    evaluatedSubmissions: number;
    averageScore: number;
    bestScore: number;
    submissionsByModel: Record<string, number>;
  } {
    const problemSubmissions = this.getProblemSubmissions(problemId);
    const evaluatedSubmissions = problemSubmissions.filter(s => s.status === 'evaluated');

    const averageScore = evaluatedSubmissions.length > 0
      ? evaluatedSubmissions.reduce((sum, s) => sum + s.score, 0) / evaluatedSubmissions.length
      : 0;

    const bestScore = evaluatedSubmissions.length > 0
      ? Math.max(...evaluatedSubmissions.map(s => s.score))
      : 0;

    const submissionsByModel: Record<string, number> = {};
    problemSubmissions.forEach(submission => {
      submissionsByModel[submission.modelName] = (submissionsByModel[submission.modelName] || 0) + 1;
    });

    return {
      totalSubmissions: problemSubmissions.length,
      evaluatedSubmissions: evaluatedSubmissions.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      submissionsByModel
    };
  }

  // リスナーを追加
  addListener(listener: (submissions: Submission[]) => void) {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (submissions: Submission[]) => void) {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getAllSubmissions()));
  }

  // データをクリア
  clear() {
    this.submissions.clear();
    this.userSubmissions.clear();
    this.problemSubmissions.clear();
    this.notifyListeners();
  }

  // データをエクスポート
  exportData(): string {
    return JSON.stringify({
      submissions: Array.from(this.submissions.values()),
      userSubmissions: Object.fromEntries(this.userSubmissions),
      problemSubmissions: Object.fromEntries(this.problemSubmissions)
    });
  }

  // データをインポート
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      this.submissions.clear();
      this.userSubmissions.clear();
      this.problemSubmissions.clear();

      // 提出を復元
      if (parsed.submissions) {
        parsed.submissions.forEach((submission: Submission) => {
          this.submissions.set(submission.id, submission);
        });
      }

      // ユーザー別提出を復元
      if (parsed.userSubmissions) {
        Object.entries(parsed.userSubmissions).forEach(([userId, submissionIds]) => {
          this.userSubmissions.set(userId, submissionIds as string[]);
        });
      }

      // 問題別提出を復元
      if (parsed.problemSubmissions) {
        Object.entries(parsed.problemSubmissions).forEach(([problemId, submissionIds]) => {
          this.problemSubmissions.set(problemId, submissionIds as string[]);
        });
      }

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const submissionManager = new SubmissionManager();

