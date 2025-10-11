// リアルタイム問題管理システム

export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: any;
  featureNames: string[];
  problemType: 'classification' | 'regression';
  targetName: string;
  classes?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxSubmissions: number;
  currentSubmissions: number;
  publicTestSize: number; // 公開テストデータの割合
  privateTestSize: number; // プライベートテストデータの割合
}

export interface ProblemSubmission {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  teamId?: string;
  teamName?: string;
  modelType: string;
  features: number[];
  parameters: any;
  publicScore: number;
  privateScore?: number;
  submittedAt: Date;
  isProcessed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  teamId?: string;
  teamName?: string;
  publicScore: number;
  privateScore?: number;
  overallScore?: number;
  modelType: string;
  submittedAt: Date;
  isFinal: boolean;
}

export class RealtimeProblemSystem {
  private static currentProblem: WeeklyProblem | null = null;
  private static submissions: Map<string, ProblemSubmission> = new Map();
  private static leaderboard: LeaderboardEntry[] = [];
  private static problemHistory: WeeklyProblem[] = [];

  // 週次問題の開始
  static startWeeklyProblem(problem: WeeklyProblem): void {
    // 前の問題を終了
    if (this.currentProblem) {
      this.endWeeklyProblem();
    }

    this.currentProblem = problem;
    this.submissions.clear();
    this.leaderboard = [];
    
    console.log(`週次問題開始: ${problem.title}`);
  }

  // 週次問題の終了
  static endWeeklyProblem(): void {
    if (!this.currentProblem) return;

    // プライベートスコアを計算
    this.calculatePrivateScores();
    
    // 最終リーダーボードを更新
    this.updateFinalLeaderboard();
    
    // 問題履歴に追加
    this.problemHistory.push({ ...this.currentProblem, isActive: false });
    
    console.log(`週次問題終了: ${this.currentProblem.title}`);
    this.currentProblem = null;
  }

  // 現在の問題取得
  static getCurrentProblem(): WeeklyProblem | null {
    return this.currentProblem;
  }

  // 問題提出
  static submitSolution(
    userId: string,
    userName: string,
    teamId: string | undefined,
    teamName: string | undefined,
    modelType: string,
    features: number[],
    parameters: any,
    publicScore: number
  ): { success: boolean; message: string; submissionId?: string } {
    if (!this.currentProblem) {
      return { success: false, message: '現在アクティブな問題がありません' };
    }

    if (!this.currentProblem.isActive) {
      return { success: false, message: '問題の提出期間が終了しています' };
    }

    if (this.currentProblem.currentSubmissions >= this.currentProblem.maxSubmissions) {
      return { success: false, message: '提出上限に達しています' };
    }

    // ユーザーの提出回数チェック
    const userSubmissions = Array.from(this.submissions.values())
      .filter(s => s.userId === userId && s.problemId === this.currentProblem!.id);
    
    if (userSubmissions.length >= 3) { // 1日3回まで
      return { success: false, message: '1日の提出上限に達しています' };
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submission: ProblemSubmission = {
      id: submissionId,
      problemId: this.currentProblem.id,
      userId,
      userName,
      teamId,
      teamName,
      modelType,
      features,
      parameters,
      publicScore,
      submittedAt: new Date(),
      isProcessed: false
    };

    this.submissions.set(submissionId, submission);
    this.currentProblem.currentSubmissions++;
    
    // リーダーボードを更新
    this.updateLeaderboard();
    
    console.log(`提出完了: ${userName} - スコア: ${publicScore}`);
    
    return { success: true, message: '提出が完了しました', submissionId };
  }

  // リーダーボード更新
  private static updateLeaderboard(): void {
    const problemSubmissions = Array.from(this.submissions.values())
      .filter(s => s.problemId === this.currentProblem?.id)
      .sort((a, b) => b.publicScore - a.publicScore);

    this.leaderboard = problemSubmissions.map((submission, index) => ({
      rank: index + 1,
      userId: submission.userId,
      userName: submission.userName,
      teamId: submission.teamId,
      teamName: submission.teamName,
      publicScore: submission.publicScore,
      privateScore: submission.privateScore,
      modelType: submission.modelType,
      submittedAt: submission.submittedAt,
      isFinal: false
    }));
  }

  // プライベートスコア計算
  private static calculatePrivateScores(): void {
    if (!this.currentProblem) return;

    // プライベートテストデータで評価
    const privateTestData = this.generatePrivateTestData(this.currentProblem);
    
    for (const submission of this.submissions.values()) {
      if (submission.problemId === this.currentProblem.id) {
        // 実際の実装では、モデルを再構築してプライベートデータで評価
        const privateScore = this.evaluateModel(submission, privateTestData);
        submission.privateScore = privateScore;
        submission.isProcessed = true;
      }
    }
  }

  // 最終リーダーボード更新
  private static updateFinalLeaderboard(): void {
    const problemSubmissions = Array.from(this.submissions.values())
      .filter(s => s.problemId === this.currentProblem?.id && s.privateScore !== undefined)
      .sort((a, b) => (b.privateScore || 0) - (a.privateScore || 0));

    this.leaderboard = problemSubmissions.map((submission, index) => ({
      rank: index + 1,
      userId: submission.userId,
      userName: submission.userName,
      teamId: submission.teamId,
      teamName: submission.teamName,
      publicScore: submission.publicScore,
      privateScore: submission.privateScore,
      modelType: submission.modelType,
      submittedAt: submission.submittedAt,
      isFinal: true
    }));
  }

  // リーダーボード取得
  static getLeaderboard(limit: number = 50): LeaderboardEntry[] {
    return this.leaderboard.slice(0, limit);
  }

  // ユーザーの提出履歴取得
  static getUserSubmissions(userId: string): ProblemSubmission[] {
    return Array.from(this.submissions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // チームの提出履歴取得
  static getTeamSubmissions(teamId: string): ProblemSubmission[] {
    return Array.from(this.submissions.values())
      .filter(s => s.teamId === teamId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // 問題統計取得
  static getProblemStats(): {
    totalSubmissions: number;
    uniqueUsers: number;
    uniqueTeams: number;
    averageScore: number;
    topScore: number;
  } {
    const problemSubmissions = Array.from(this.submissions.values())
      .filter(s => s.problemId === this.currentProblem?.id);

    const uniqueUsers = new Set(problemSubmissions.map(s => s.userId)).size;
    const uniqueTeams = new Set(problemSubmissions.map(s => s.teamId).filter(Boolean)).size;
    const scores = problemSubmissions.map(s => s.publicScore);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      totalSubmissions: problemSubmissions.length,
      uniqueUsers,
      uniqueTeams,
      averageScore,
      topScore
    };
  }

  // プライベートテストデータ生成（シミュレーション）
  private static generatePrivateTestData(problem: WeeklyProblem): any[] {
    // 実際の実装では、問題のデータセットからプライベート部分を抽出
    // ここでは簡略化してシミュレーション
    const testSize = Math.floor(problem.dataset.length * problem.privateTestSize);
    return problem.dataset.slice(-testSize);
  }

  // モデル評価（シミュレーション）
  private static evaluateModel(submission: ProblemSubmission, testData: any[]): number {
    // 実際の実装では、提出されたモデルを再構築して評価
    // ここでは簡略化してシミュレーション
    const baseScore = submission.publicScore;
    const noise = (Math.random() - 0.5) * 0.1; // ±5%のノイズ
    return Math.max(0, Math.min(1, baseScore + noise));
  }

  // 問題履歴取得
  static getProblemHistory(): WeeklyProblem[] {
    return this.problemHistory.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
  }

  // 週次問題の自動開始（シミュレーション）
  static startNextWeeklyProblem(): void {
    const problems = [
      {
        id: `problem_${Date.now()}`,
        title: '高級住宅価格予測',
        description: '複雑な住宅データから価格を予測する高度な回帰問題',
        dataset: [], // 実際のデータセット
        featureNames: ['土地面積', '建物面積', '築年数', 'リノベーション年', '部屋数'],
        problemType: 'regression' as const,
        targetName: '価格（万円）',
        difficulty: 'hard' as const,
        domain: '不動産',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
        isActive: true,
        maxSubmissions: 1000,
        currentSubmissions: 0,
        publicTestSize: 0.3,
        privateTestSize: 0.7
      }
    ];

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    this.startWeeklyProblem(randomProblem);
  }

  // 問題の自動終了チェック
  static checkProblemExpiration(): void {
    if (this.currentProblem && this.currentProblem.endDate < new Date()) {
      this.endWeeklyProblem();
    }
  }

  // システム初期化
  static initialize(): void {
    // 定期的に問題の期限をチェック
    setInterval(() => {
      this.checkProblemExpiration();
    }, 60 * 1000); // 1分ごと

    // 週次問題の自動開始（毎週月曜日）
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7);
    nextMonday.setHours(9, 0, 0, 0);
    
    const timeUntilMonday = nextMonday.getTime() - now.getTime();
    setTimeout(() => {
      this.startNextWeeklyProblem();
    }, timeUntilMonday);
  }
}
