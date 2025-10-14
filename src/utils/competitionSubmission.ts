// コンペティション提出管理システム
export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  modelType: string;
  hyperparameters: Record<string, any>;
  features: string[];
  predictions: number[];
  accuracy: number;
  score: number;
  submittedAt: number;
  status: 'pending' | 'evaluating' | 'completed' | 'failed';
  evaluationResult?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc?: number;
    mae?: number;
    rmse?: number;
    r2?: number;
  };
}

export interface SubmissionConfig {
  maxSubmissionsPerProblem: number;
  evaluationTimeout: number;
  enableAutoEvaluation: boolean;
  enableLeaderboard: boolean;
}

export interface SubmissionStats {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  submissionsByModel: Record<string, number>;
  submissionsByProblem: Record<string, number>;
}

export class CompetitionSubmissionManager {
  private submissions: Map<string, Submission> = new Map();
  private config: SubmissionConfig;
  private listeners: Set<(submission: Submission) => void> = new Set();

  constructor(config: SubmissionConfig = {
    maxSubmissionsPerProblem: 5,
    evaluationTimeout: 30000,
    enableAutoEvaluation: true,
    enableLeaderboard: true
  }) {
    this.config = config;
  }

  // 提出を作成
  createSubmission(
    userId: string,
    problemId: string,
    modelType: string,
    hyperparameters: Record<string, any>,
    features: string[],
    predictions: number[]
  ): Submission {
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const submission: Submission = {
      id: submissionId,
      userId,
      problemId,
      modelType,
      hyperparameters,
      features,
      predictions,
      accuracy: 0,
      score: 0,
      submittedAt: Date.now(),
      status: 'pending'
    };

    this.submissions.set(submissionId, submission);

    if (this.config.enableAutoEvaluation) {
      this.evaluateSubmission(submission);
    }

    this.notifyListeners(submission);
    return submission;
  }

  // 提出を評価
  async evaluateSubmission(submission: Submission): Promise<void> {
    submission.status = 'evaluating';
    this.notifyListeners(submission);

    try {
      // 評価タイムアウトを設定
      const evaluationPromise = this.performEvaluation(submission);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Evaluation timeout')), this.config.evaluationTimeout)
      );

      await Promise.race([evaluationPromise, timeoutPromise]);
      
      submission.status = 'completed';
    } catch (error) {
      console.error('Submission evaluation failed:', error);
      submission.status = 'failed';
    }

    this.notifyListeners(submission);
  }

  // 評価を実行
  private async performEvaluation(submission: Submission): Promise<void> {
    // 模擬的な評価処理
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // ランダムな評価結果を生成（実際の実装では真の評価を行う）
    const accuracy = 0.6 + Math.random() * 0.4; // 60-100%
    const precision = accuracy + (Math.random() - 0.5) * 0.1;
    const recall = accuracy + (Math.random() - 0.5) * 0.1;
    const f1Score = 2 * (precision * recall) / (precision + recall);

    submission.accuracy = accuracy;
    submission.score = accuracy * 100;
    submission.evaluationResult = {
      accuracy,
      precision,
      recall,
      f1Score,
      auc: Math.random() * 0.3 + 0.7, // 70-100%
      mae: Math.random() * 0.5 + 0.1, // 0.1-0.6
      rmse: Math.random() * 0.8 + 0.2, // 0.2-1.0
      r2: Math.random() * 0.4 + 0.6 // 60-100%
    };
  }

  // 提出を取得
  getSubmission(submissionId: string): Submission | undefined {
    return this.submissions.get(submissionId);
  }

  // ユーザーの提出を取得
  getUserSubmissions(userId: string): Submission[] {
    return Array.from(this.submissions.values())
      .filter(submission => submission.userId === userId)
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }

  // 問題の提出を取得
  getProblemSubmissions(problemId: string): Submission[] {
    return Array.from(this.submissions.values())
      .filter(submission => submission.problemId === problemId)
      .sort((a, b) => b.score - a.score);
  }

  // 全提出を取得
  getAllSubmissions(): Submission[] {
    return Array.from(this.submissions.values())
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }

  // 提出数を確認
  getUserSubmissionCount(userId: string, problemId: string): number {
    return this.getUserSubmissions(userId)
      .filter(submission => submission.problemId === problemId).length;
  }

  // 提出制限をチェック
  canSubmit(userId: string, problemId: string): boolean {
    const submissionCount = this.getUserSubmissionCount(userId, problemId);
    return submissionCount < this.config.maxSubmissionsPerProblem;
  }

  // 提出を削除
  removeSubmission(submissionId: string): boolean {
    const removed = this.submissions.delete(submissionId);
    if (removed) {
      console.log(`Submission ${submissionId} removed`);
    }
    return removed;
  }

  // 統計情報を取得
  getStats(): SubmissionStats {
    const allSubmissions = this.getAllSubmissions();
    const successfulSubmissions = allSubmissions.filter(s => s.status === 'completed');
    const failedSubmissions = allSubmissions.filter(s => s.status === 'failed');

    const submissionsByModel: Record<string, number> = {};
    const submissionsByProblem: Record<string, number> = {};
    let totalAccuracy = 0;
    let bestAccuracy = 0;

    allSubmissions.forEach(submission => {
      submissionsByModel[submission.modelType] = (submissionsByModel[submission.modelType] || 0) + 1;
      submissionsByProblem[submission.problemId] = (submissionsByProblem[submission.problemId] || 0) + 1;
      
      if (submission.accuracy > 0) {
        totalAccuracy += submission.accuracy;
        bestAccuracy = Math.max(bestAccuracy, submission.accuracy);
      }
    });

    return {
      totalSubmissions: allSubmissions.length,
      successfulSubmissions: successfulSubmissions.length,
      failedSubmissions: failedSubmissions.length,
      averageAccuracy: successfulSubmissions.length > 0 ? totalAccuracy / successfulSubmissions.length : 0,
      bestAccuracy,
      submissionsByModel,
      submissionsByProblem
    };
  }

  // リーダーボードを取得
  getLeaderboard(problemId?: string): Submission[] {
    let submissions = this.getAllSubmissions()
      .filter(s => s.status === 'completed');

    if (problemId) {
      submissions = submissions.filter(s => s.problemId === problemId);
    }

    // スコアでソート（降順）
    return submissions.sort((a, b) => b.score - a.score);
  }

  // トップNを取得
  getTopSubmissions(n: number, problemId?: string): Submission[] {
    return this.getLeaderboard(problemId).slice(0, n);
  }

  // ユーザーの最高スコアを取得
  getUserBestScore(userId: string, problemId?: string): number {
    const userSubmissions = this.getUserSubmissions(userId)
      .filter(s => s.status === 'completed');

    if (problemId) {
      const problemSubmissions = userSubmissions.filter(s => s.problemId === problemId);
      return problemSubmissions.length > 0 ? Math.max(...problemSubmissions.map(s => s.score)) : 0;
    }

    return userSubmissions.length > 0 ? Math.max(...userSubmissions.map(s => s.score)) : 0;
  }

  // リスナーを追加
  addListener(listener: (submission: Submission) => void): void {
    this.listeners.add(listener);
  }

  // リスナーを削除
  removeListener(listener: (submission: Submission) => void): void {
    this.listeners.delete(listener);
  }

  // リスナーに通知
  private notifyListeners(submission: Submission): void {
    this.listeners.forEach(listener => {
      try {
        listener(submission);
      } catch (error) {
        console.error('Submission listener error:', error);
      }
    });
  }

  // 設定を更新
  updateConfig(newConfig: Partial<SubmissionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 設定を取得
  getConfig(): SubmissionConfig {
    return { ...this.config };
  }

  // データをクリア
  clear(): void {
    this.submissions.clear();
  }
}

// シングルトンインスタンス
export const competitionSubmissionManager = new CompetitionSubmissionManager();

