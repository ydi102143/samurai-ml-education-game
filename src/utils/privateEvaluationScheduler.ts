import { CompetitionSubmissionManager } from './competitionSubmission';
import { CompetitionProblemManager } from './competitionProblemManager';

export class PrivateEvaluationScheduler {
  private static scheduledEvaluations: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 問題のPrivate評価をスケジュール
   */
  static schedulePrivateEvaluation(problemId: string, evaluationDate: Date): void {
    const now = new Date();
    const timeUntilEvaluation = evaluationDate.getTime() - now.getTime();

    if (timeUntilEvaluation <= 0) {
      // 既に評価日時を過ぎている場合は即座に実行
      this.executePrivateEvaluation(problemId);
      return;
    }

    // 既存のスケジュールをキャンセル
    this.cancelPrivateEvaluation(problemId);

    // 新しいスケジュールを設定
    const timeoutId = setTimeout(() => {
      this.executePrivateEvaluation(problemId);
      this.scheduledEvaluations.delete(problemId);
    }, timeUntilEvaluation);

    this.scheduledEvaluations.set(problemId, timeoutId);
    
    console.log(`Private評価をスケジュールしました: ${problemId} - ${evaluationDate.toLocaleString()}`);
  }

  /**
   * Private評価を実行
   */
  private static async executePrivateEvaluation(problemId: string): Promise<void> {
    try {
      console.log(`Private評価を開始: ${problemId}`);
      
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (!problem) {
        console.error(`問題が見つかりません: ${problemId}`);
        return;
      }

      // 全ての提出を取得
      const submissions = CompetitionSubmissionManager.getSubmissions(problemId);
      
      // 各提出をPrivate評価で再評価
      for (const submission of submissions) {
        try {
          const privateEvaluation = await CompetitionSubmissionManager.evaluatePrivateSubmission(
            problemId,
            submission.id
          );
          
          console.log(`Private評価完了: ${submission.username} - スコア: ${privateEvaluation.testScore}`);
        } catch (error) {
          console.error(`Private評価エラー (${submission.username}):`, error);
        }
      }

      // リーダーボードを更新
      await CompetitionSubmissionManager.updateLeaderboard(problemId);
      
      console.log(`Private評価完了: ${problemId}`);
    } catch (error) {
      console.error(`Private評価実行エラー:`, error);
    }
  }

  /**
   * スケジュールをキャンセル
   */
  static cancelPrivateEvaluation(problemId: string): void {
    const timeoutId = this.scheduledEvaluations.get(problemId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledEvaluations.delete(problemId);
      console.log(`Private評価スケジュールをキャンセル: ${problemId}`);
    }
  }

  /**
   * 問題作成時に自動的にPrivate評価をスケジュール
   */
  static scheduleForNewProblem(problemId: string): void {
    const evaluationDate = new Date();
    evaluationDate.setDate(evaluationDate.getDate() + 7); // 1週間後
    
    this.schedulePrivateEvaluation(problemId, evaluationDate);
  }

  /**
   * 全てのスケジュールをクリア
   */
  static clearAllSchedules(): void {
    for (const [problemId, timeoutId] of this.scheduledEvaluations) {
      clearTimeout(timeoutId);
    }
    this.scheduledEvaluations.clear();
    console.log('全てのPrivate評価スケジュールをクリアしました');
  }
}


