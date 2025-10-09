import { CompetitionProblemManager } from './competitionProblemManager';
import { CompetitionSubmissionManager } from './competitionSubmission';
import { WeeklyProblemScheduler } from './weeklyProblemScheduler';
import { realtimeManager } from './realtimeManager';
import type { CompetitionProblem, CompetitionSubmission, ModelEvaluation } from '../types/competition';

/**
 * 統一データ管理システム
 * ローカルストレージとSupabaseの二重管理を解決
 */
export class UnifiedDataManager {
  private static instance: UnifiedDataManager;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  static getInstance(): UnifiedDataManager {
    if (!this.instance) {
      this.instance = new UnifiedDataManager();
    }
    return this.instance;
  }

  /**
   * 問題データの統一取得
   */
  async getProblem(problemId: string): Promise<CompetitionProblem | null> {
    const cacheKey = `problem_${problemId}`;
    
    // キャッシュチェック
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 週次問題を優先
      const weeklyProblem = WeeklyProblemScheduler.getCurrentWeekProblem();
      if (weeklyProblem && weeklyProblem.id === problemId) {
        this.setCachedData(cacheKey, weeklyProblem);
        return weeklyProblem;
      }

      // 通常の問題を取得
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (problem) {
        this.setCachedData(cacheKey, problem);
        return problem;
      }

      return null;
    } catch (error) {
      console.error('問題取得エラー:', error);
      return null;
    }
  }

  /**
   * リーダーボードの統一取得
   */
  async getLeaderboard(problemId: string, limit: number = 20): Promise<any> {
    const cacheKey = `leaderboard_${problemId}_${limit}`;
    
    // キャッシュチェック
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const leaderboard = await CompetitionSubmissionManager.getLeaderboard(problemId, limit);
      this.setCachedData(cacheKey, leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('リーダーボード取得エラー:', error);
      return { submissions: [], total: 0 };
    }
  }

  /**
   * 提出の統一処理
   */
  async submitResult(
    problemId: string,
    userId: string,
    username: string,
    selectedFeatures: number[],
    modelType: string,
    parameters: any,
    preprocessing: any,
    teamId?: string,
    teamMembers?: any[],
    evaluationResult?: ModelEvaluation,
    score?: number
  ): Promise<CompetitionSubmission> {
    try {
      // 提出を作成
      const submission = await CompetitionSubmissionManager.createSubmission(
        problemId,
        userId,
        username,
        selectedFeatures,
        modelType,
        parameters,
        preprocessing,
        teamId,
        teamMembers
      );

      // リアルタイム更新
      this.broadcastSubmissionUpdate(problemId, submission);
      
      // キャッシュクリア
      this.clearCache(`leaderboard_${problemId}`);
      this.clearCache(`problem_${problemId}`);

      return submission;
    } catch (error) {
      console.error('提出エラー:', error);
      throw error;
    }
  }

  /**
   * 週次統計の統一取得
   */
  getWeeklyStats() {
    return WeeklyProblemScheduler.getWeeklyStats();
  }

  /**
   * 参加者数の統一更新
   */
  updateParticipantCount(problemId: string, delta: number) {
    try {
      WeeklyProblemScheduler.updateParticipantCount(problemId, delta);
      
      // 問題の参加者数も更新
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (problem) {
        problem.participantCount = (problem.participantCount || 0) + delta;
      }
    } catch (error) {
      console.error('参加者数更新エラー:', error);
    }
  }

  /**
   * 提出数の統一更新
   */
  updateSubmissionCount(problemId: string, delta: number) {
    try {
      WeeklyProblemScheduler.updateSubmissionCount(problemId, delta);
      
      // 問題の提出数も更新
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (problem) {
        problem.submissionCount = (problem.submissionCount || 0) + delta;
      }
    } catch (error) {
      console.error('提出数更新エラー:', error);
    }
  }

  /**
   * リアルタイム更新のブロードキャスト
   */
  private broadcastSubmissionUpdate(problemId: string, submission: CompetitionSubmission) {
    try {
      realtimeManager.broadcastUpdate({
        type: 'submission_count_update',
        data: {
          problemId,
          submissionId: submission.id,
          userId: submission.userId,
          username: submission.username,
          score: submission.score,
          timestamp: submission.submittedAt
        },
        timestamp: new Date().toISOString(),
        userId: 'system',
        roomId: 'global'
      });
    } catch (error) {
      console.error('リアルタイム更新エラー:', error);
    }
  }

  /**
   * キャッシュ管理
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(key: string) {
    this.cache.delete(key);
  }

  /**
   * 全キャッシュクリア
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * データ整合性チェック
   */
  async validateDataConsistency(problemId: string): Promise<boolean> {
    try {
      const problem = await this.getProblem(problemId);
      const leaderboard = await this.getLeaderboard(problemId);
      
      if (!problem) return false;
      
      // 参加者数と提出数の整合性チェック
      const actualSubmissions = leaderboard.submissions?.length || 0;
      const reportedSubmissions = problem.submissionCount || 0;
      
      if (Math.abs(actualSubmissions - reportedSubmissions) > 1) {
        console.warn('データ不整合を検出:', {
          problemId,
          actualSubmissions,
          reportedSubmissions
        });
        
        // 自動修正
        problem.submissionCount = actualSubmissions;
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('データ整合性チェックエラー:', error);
      return false;
    }
  }
}

export const unifiedDataManager = UnifiedDataManager.getInstance();
