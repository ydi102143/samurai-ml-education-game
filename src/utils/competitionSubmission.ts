import type { CompetitionSubmission, CompetitionLeaderboard, ModelEvaluation } from '../types/competition';
import { CompetitionEvaluator } from './competitionEvaluation';
import { CompetitionProblemManager } from './competitionProblemManager';
import { BattleDatabase } from './battleDatabase';
import { realtimeManager } from './realtimeManager';

export class CompetitionSubmissionManager {
  private static submissions: Map<string, CompetitionSubmission[]> = new Map();
  private static leaderboards: Map<string, CompetitionLeaderboard> = new Map();

  /**
   * 提出を作成
   */
  static async createSubmission(
    problemId: string,
    userId: string,
    username: string,
    selectedFeatures: number[],
    modelType: string,
    parameters: Record<string, any>,
    preprocessing: {
      method: 'none' | 'normalize' | 'standardize' | 'encode';
      encodedFeatures?: number[];
    },
    teamId?: string,
    teamMembers?: string[]
  ): Promise<CompetitionSubmission> {
    const problem = CompetitionProblemManager.getProblem(problemId);
    if (!problem) {
      throw new Error('問題が見つかりません');
    }

    // 問題がアクティブかチェック
    if (!CompetitionProblemManager.isProblemActive(problemId)) {
      throw new Error('この問題は既に終了しています');
    }

    // プレイヤー用データで評価
    const evaluation = await CompetitionEvaluator.evaluatePlayerModel(
      problem.dataset,
      selectedFeatures,
      modelType,
      parameters,
      preprocessing
    );

    // 提出を作成
    const score = Math.round(evaluation.validationScore * 100); // 0-100のスコアに変換
    
    const submission: CompetitionSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      problemId,
      predictions: evaluation.predictions,
      probabilities: evaluation.probabilities,
      selectedFeatures,
      modelType,
      parameters,
      preprocessing,
      submittedAt: new Date(),
      score: score, // スコアを設定
      teamId,
      teamMembers
    };

    // 提出を保存
    if (!this.submissions.has(problemId)) {
      this.submissions.set(problemId, []);
    }
    this.submissions.get(problemId)!.push(submission);

    // BattleDatabaseに保存
    try {
      console.log('保存するスコア:', score, 'validationScore:', evaluation.validationScore);
      
      await BattleDatabase.saveBattleResult({
        problemId: submission.problemId,
        roomId: `comp_${submission.problemId}`,
        userId: submission.userId,
        username: submission.username,
        accuracy: evaluation.validationScore,
        score: score, // 正しいスコアを保存
        trainingTime: evaluation.trainingTime,
        modelType: submission.modelType,
        parameters: submission.parameters,
        isPrivate: false,
        battleType: submission.teamId ? 'team' : 'individual',
        teamId: submission.teamId,
        teamMembers: submission.teamMembers?.map(member => ({ userId: member, username: member }))
      });
      
      console.log('BattleDatabaseに保存完了 - スコア:', score);
    } catch (error) {
      console.error('BattleDatabaseへの保存に失敗:', error);
    }

    // リーダーボードを即座に更新
    await this.updateLeaderboard(problemId);
    
    // リアルタイム更新をブロードキャスト
    this.broadcastLeaderboardUpdate(problemId);
    
    console.log('リーダーボード更新完了:', problemId);

    return submission;
  }

  /**
   * リーダーボード更新をブロードキャスト
   */
  private static broadcastLeaderboardUpdate(problemId: string) {
    try {
      const leaderboard = this.getLeaderboard(problemId);
      if (leaderboard) {
        realtimeManager.broadcastLeaderboardUpdate(problemId, leaderboard);
        console.log('リーダーボード更新をブロードキャスト:', problemId);
      }
    } catch (error) {
      console.error('リーダーボードブロードキャストエラー:', error);
    }
  }

  /**
   * 提出を取得
   */
  static getSubmissions(problemId: string): CompetitionSubmission[] {
    return this.submissions.get(problemId) || [];
  }

  /**
   * ユーザーの提出を取得
   */
  static getUserSubmissions(problemId: string, userId: string): CompetitionSubmission[] {
    const submissions = this.getSubmissions(problemId);
    return submissions.filter(sub => sub.userId === userId);
  }

  /**
   * リーダーボードを取得
   */
  static getLeaderboard(problemId: string, limit: number = 20): CompetitionLeaderboard | null {
    const leaderboard = this.leaderboards.get(problemId);
    if (leaderboard) {
      return leaderboard;
    }
    
    // リーダーボードが存在しない場合は空のリーダーボードを返す
    return {
      problemId,
      submissions: [],
      lastUpdated: new Date(),
      totalSubmissions: 0,
      participantCount: 0
    };
  }

  /**
   * リーダーボードを更新
   */
  private static async updateLeaderboard(problemId: string, limit: number = 100): Promise<void> {
    const problem = CompetitionProblemManager.getProblem(problemId);
    if (!problem) return;

    const submissions = this.getSubmissions(problemId);
    
    // 提出データをそのまま使用（スコアは既に保存済み）
    const evaluatedSubmissions = submissions.map(submission => ({
      ...submission,
      score: submission.score || 0 // 既存のスコアを使用
    }));

    // スコア順でソート
    evaluatedSubmissions.sort((a, b) => (b.score || 0) - (a.score || 0));

    // ランクを設定
    evaluatedSubmissions.forEach((submission, index) => {
      submission.rank = index + 1;
    });

    // リーダーボードを作成
    const leaderboard: CompetitionLeaderboard = {
      problemId,
      submissions: evaluatedSubmissions.slice(0, limit),
      lastUpdated: new Date(),
      totalSubmissions: evaluatedSubmissions.length,
      participantCount: new Set(evaluatedSubmissions.map(s => s.userId)).size
    };

    this.leaderboards.set(problemId, leaderboard);

    // BattleDatabaseからもリーダーボードを取得して同期
    try {
      const battleLeaderboard = await BattleDatabase.getProblemLeaderboard(problemId, 'individual', limit);
      console.log('BattleDatabaseリーダーボード同期:', battleLeaderboard);
    } catch (error) {
      console.error('リーダーボード同期エラー:', error);
    }

    // 問題の統計を更新
    CompetitionProblemManager.updateSubmissionCount(problemId, evaluatedSubmissions.length);
    CompetitionProblemManager.updateParticipantCount(problemId, leaderboard.participantCount);
  }

  /**
   * Private評価を実行
   */
  static async evaluatePrivateSubmission(
    problemId: string,
    submissionId: string
  ): Promise<ModelEvaluation> {
    const problem = CompetitionProblemManager.getProblem(problemId);
    if (!problem) {
      throw new Error('問題が見つかりません');
    }

    const submission = this.getSubmissions(problemId).find(s => s.id === submissionId);
    if (!submission) {
      throw new Error('提出が見つかりません');
    }

    // Private評価（テストデータで評価）
    const evaluation = await CompetitionEvaluator.evaluateOfficialModel(problem.dataset, submission);
    
    // 提出のスコアを更新
    submission.score = evaluation.testScore;
    submission.privateScore = evaluation.testScore;
    submission.privateEvaluationDate = new Date();
    
    return evaluation;
  }

  /**
   * 提出の統計を取得
   */
  static getSubmissionStats(problemId: string): {
    totalSubmissions: number;
    participantCount: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
  } {
    const submissions = this.getSubmissions(problemId);
    const scores = submissions.map(s => s.score || 0).filter(s => s > 0);
    
    return {
      totalSubmissions: submissions.length,
      participantCount: new Set(submissions.map(s => s.userId)).size,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0
    };
  }

  /**
   * 提出の履歴を取得
   */
  static getSubmissionHistory(problemId: string, userId: string): {
    submissions: CompetitionSubmission[];
    bestScore: number;
    improvement: number;
    rank: number;
  } {
    const userSubmissions = this.getUserSubmissions(problemId, userId);
    const allSubmissions = this.getSubmissions(problemId);
    
    const bestScore = userSubmissions.length > 0 
      ? Math.max(...userSubmissions.map(s => s.score || 0))
      : 0;
    
    const improvement = userSubmissions.length > 1
      ? (userSubmissions[userSubmissions.length - 1].score || 0) - (userSubmissions[0].score || 0)
      : 0;
    
    const userBestSubmission = userSubmissions.find(s => s.score === bestScore);
    const rank = userBestSubmission ? userBestSubmission.rank || 0 : 0;
    
    return {
      submissions: userSubmissions,
      bestScore,
      improvement,
      rank
    };
  }

  /**
   * 提出を削除
   */
  static deleteSubmission(problemId: string, submissionId: string): boolean {
    const submissions = this.getSubmissions(problemId);
    const index = submissions.findIndex(s => s.id === submissionId);
    
    if (index === -1) return false;
    
    submissions.splice(index, 1);
    this.updateLeaderboard(problemId);
    return true;
  }

  /**
   * 全ての提出をクリア
   */
  static clearSubmissions(problemId: string): void {
    this.submissions.delete(problemId);
    this.leaderboards.delete(problemId);
  }

  /**
   * 提出の制限をチェック
   */
  static checkSubmissionLimit(problemId: string, userId: string): {
    canSubmit: boolean;
    remainingSubmissions: number;
    maxSubmissions: number;
  } {
    const problem = CompetitionProblemManager.getProblem(problemId);
    if (!problem) {
      return { canSubmit: false, remainingSubmissions: 0, maxSubmissions: 0 };
    }

    const userSubmissions = this.getUserSubmissions(problemId, userId);
    const remainingSubmissions = problem.constraints.maxSubmissions - userSubmissions.length;
    
    return {
      canSubmit: remainingSubmissions > 0,
      remainingSubmissions: Math.max(0, remainingSubmissions),
      maxSubmissions: problem.constraints.maxSubmissions
    };
  }
}

