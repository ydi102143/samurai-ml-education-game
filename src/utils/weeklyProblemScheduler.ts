import { CompetitionProblemManager } from './competitionProblemManager';
import { realtimeManager } from './realtimeManager';
import type { CompetitionProblem } from '../types/competition';

export class WeeklyProblemScheduler {
  private static currentWeek = 0;
  private static problemRotationInterval: NodeJS.Timeout | null = null;
  private static readonly WEEK_DURATION = 7 * 24 * 60 * 60 * 1000; // 7日
  private static isInitialized = false;
  private static readonly JST_OFFSET = 9 * 60 * 60 * 1000; // JST (UTC+9) のミリ秒オフセット
  private static readonly START_TIME = new Date('2024-01-01T00:00:00+09:00'); // 日本時間基準の開始時刻

  /**
   * 週次問題切り替えシステムを開始
   */
  static startWeeklyRotation(): void {
    if (this.isInitialized) {
      console.log('週次問題切り替えシステムは既に開始されています');
      return;
    }

    console.log('週次問題切り替えシステムを開始します');
    this.isInitialized = true;
    
    // 日本時間基準で現在の週を計算
    this.currentWeek = this.getCurrentWeekFromStart();
    console.log(`現在の週: ${this.currentWeek} (日本時間基準)`);

    // 現在の週の問題を生成
    this.generateWeeklyProblems();

    // 週次切り替えのタイマーを設定（1週間ごと）
    this.scheduleWeeklyRotation();

    console.log(`週次問題切り替えシステム開始 - 現在の週: ${this.currentWeek}`);
  }

  /**
   * 次の週に切り替え
   */
  static rotateToNextWeek(): void {
    this.currentWeek = this.getCurrentWeekFromStart();
    console.log(`週次問題切り替え: 第${this.currentWeek}週開始 (日本時間基準)`);
    
    // 新しい週の問題を生成
    this.generateWeeklyProblems();
    
    // 前週の問題をアーカイブ
    this.archivePreviousWeekProblems();
    
    // リアルタイムで週次問題切り替えを通知
    this.notifyWeeklyProblemChange();
    
    // 次の週次切り替えをスケジュール
    this.scheduleWeeklyRotation();
  }

  /**
   * 現在の週を取得
   */
  static getCurrentWeek(): number {
    return this.currentWeek;
  }

  /**
   * 開始時刻からの現在の週を取得（日本時間基準）
   */
  private static getCurrentWeekFromStart(): number {
    const now = new Date();
    const jstNow = new Date(now.getTime() + this.JST_OFFSET);
    
    // 開始時刻からの経過時間を計算
    const elapsedTime = jstNow.getTime() - this.START_TIME.getTime();
    
    // 週数を計算（1から開始）
    const weekNumber = Math.floor(elapsedTime / this.WEEK_DURATION) + 1;
    
    return Math.max(1, weekNumber);
  }

  /**
   * 週次切り替えをスケジュール（1週間ごと）
   */
  private static scheduleWeeklyRotation(): void {
    // 既存のタイマーをクリア
    if (this.problemRotationInterval) {
      clearTimeout(this.problemRotationInterval);
    }

    const now = new Date();
    const jstNow = new Date(now.getTime() + this.JST_OFFSET);
    
    // 次の週の開始時刻を計算
    const currentWeekStart = new Date(this.START_TIME.getTime() + (this.currentWeek - 1) * this.WEEK_DURATION);
    const nextWeekStart = new Date(currentWeekStart.getTime() + this.WEEK_DURATION);
    
    // UTC時間に変換
    const nextWeekStartUTC = new Date(nextWeekStart.getTime() - this.JST_OFFSET);
    
    const timeUntilNextWeek = nextWeekStartUTC.getTime() - now.getTime();
    
    console.log(`次の週次切り替え: ${nextWeekStart.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
    
    this.problemRotationInterval = setTimeout(() => {
      this.rotateToNextWeek();
    }, timeUntilNextWeek);
  }

  /**
   * 現在の週の問題を取得
   */
  static getCurrentWeekProblem(): CompetitionProblem | null {
    const weekId = `week_${this.currentWeek}`;
    return CompetitionProblemManager.getProblem(weekId);
  }

  /**
   * 週次問題を生成
   */
  private static async generateWeeklyProblems(): Promise<void> {
    const weekId = `week_${this.currentWeek}`;
    const problemTypes = ['classification', 'regression'];
    const selectedType = problemTypes[this.currentWeek % problemTypes.length];
    
    console.log(`第${this.currentWeek}週の問題を生成中: ${selectedType}`);
    
    try {
      // 週次問題を生成
      await CompetitionProblemManager.createProblem(
        weekId,
        `第${this.currentWeek}週 ${selectedType === 'classification' ? '分類' : '回帰'}問題`,
        `週次コンペティション問題 - ${selectedType}。今週は${selectedType === 'classification' ? '分類' : '回帰'}問題に挑戦してください。`,
        this.generateWeeklyData(selectedType),
        this.getWeeklyFeatureNames(selectedType),
        'target',
        selectedType,
        selectedType === 'classification' ? ['クラスA', 'クラスB', 'クラスC', 'クラスD'] : undefined
      );
      
      console.log(`第${this.currentWeek}週の問題生成完了: ${weekId}`);
    } catch (error) {
      console.error(`第${this.currentWeek}週の問題生成エラー:`, error);
    }
  }

  /**
   * 前週の問題をアーカイブ
   */
  private static archivePreviousWeekProblems(): void {
    const previousWeekId = `week_${this.currentWeek - 1}`;
    const problem = CompetitionProblemManager.getProblem(previousWeekId);
    
    if (problem) {
      // 問題の終了時間を現在時刻に設定（アーカイブ）
      problem.endTime = new Date();
      console.log(`前週の問題をアーカイブしました: ${previousWeekId}`);
    }
  }

  /**
   * 週次データを生成
   */
  private static generateWeeklyData(problemType: 'classification' | 'regression'): any[] {
    const dataCount = 5000 + Math.random() * 3000; // 5000-8000件のランダムなデータ数
    
    if (problemType === 'classification') {
      return this.generateClassificationWeeklyData(Math.floor(dataCount));
    } else {
      return this.generateRegressionWeeklyData(Math.floor(dataCount));
    }
  }

  /**
   * 分類問題用の週次データを生成
   */
  private static generateClassificationWeeklyData(count: number): any[] {
    const data = [];
    const classes = ['クラスA', 'クラスB', 'クラスC', 'クラスD'];
    
    for (let i = 0; i < count; i++) {
      const classIndex = Math.floor(Math.random() * classes.length);
      
      // 週次バリエーション（週によって異なるパターン）
      const weekPattern = Math.sin(this.currentWeek * 0.5) * 0.3 + 0.7;
      
      const features = [
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern,
        Math.random() * 100 * weekPattern
      ];
      
      // クラスに応じた特徴パターン
      if (classIndex > 0) {
        features[classIndex - 1] += 50 + Math.random() * 50;
        features[7] += 30;
      }
      
      data.push({
        features,
        label: classes[classIndex]
      });
    }
    
    return data;
  }

  /**
   * 回帰問題用の週次データを生成
   */
  private static generateRegressionWeeklyData(count: number): any[] {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      // 週次バリエーション（週によって異なる複雑さ）
      const weekComplexity = 1 + Math.sin(this.currentWeek * 0.3) * 0.5;
      
      const features = [
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity,
        Math.random() * 100 * weekComplexity
      ];
      
      // 複雑な予測式（週によって変化）
      const predictedValue = features.reduce((sum, feature, index) => {
        const weight = (index + 1) * 0.1 * weekComplexity;
        return sum + feature * weight;
      }, 0) + (Math.random() - 0.5) * 50;
      
      data.push({
        features,
        label: Math.max(0, predictedValue)
      });
    }
    
    return data;
  }

  /**
   * 週次特徴量名を取得
   */
  private static getWeeklyFeatureNames(problemType: 'classification' | 'regression'): string[] {
    if (problemType === 'classification') {
      return [
        '特徴量1', '特徴量2', '特徴量3', '特徴量4', '特徴量5',
        '特徴量6', '特徴量7', '特徴量8', '特徴量9', '特徴量10'
      ];
    } else {
      return [
        '入力変数1', '入力変数2', '入力変数3', '入力変数4', '入力変数5',
        '入力変数6', '入力変数7', '入力変数8', '入力変数9', '入力変数10'
      ];
    }
  }

  /**
   * 週次問題切り替えシステムを停止
   */
  static stopWeeklyRotation(): void {
    if (this.problemRotationInterval) {
      clearTimeout(this.problemRotationInterval);
      this.problemRotationInterval = null;
    }
    this.isInitialized = false;
    console.log('週次問題切り替えシステムを停止しました');
  }

  /**
   * 次の問題切り替えまでの残り時間を取得（ミリ秒）
   */
  static getTimeUntilNextRotation(): number {
    const now = new Date();
    const jstNow = new Date(now.getTime() + this.JST_OFFSET);
    
    // 現在の週の開始時刻を計算
    const currentWeekStart = new Date(this.START_TIME.getTime() + (this.currentWeek - 1) * this.WEEK_DURATION);
    const nextWeekStart = new Date(currentWeekStart.getTime() + this.WEEK_DURATION);
    
    // UTC時間に変換
    const nextWeekStartUTC = new Date(nextWeekStart.getTime() - this.JST_OFFSET);
    
    return nextWeekStartUTC.getTime() - now.getTime();
  }

  /**
   * 現在の週の進捗を取得（0-1）
   */
  static getCurrentWeekProgress(): number {
    const now = new Date();
    const jstNow = new Date(now.getTime() + this.JST_OFFSET);
    
    // 現在の週の開始時刻を計算
    const currentWeekStart = new Date(this.START_TIME.getTime() + (this.currentWeek - 1) * this.WEEK_DURATION);
    
    // 現在の週内での経過時間を計算
    const elapsed = jstNow.getTime() - currentWeekStart.getTime();
    
    return Math.min(1, Math.max(0, elapsed / this.WEEK_DURATION));
  }

  /**
   * 現在の日本時間を取得
   */
  static getCurrentJSTTime(): Date {
    const now = new Date();
    return new Date(now.getTime() + this.JST_OFFSET);
  }

  /**
   * 週の開始時刻を取得（日本時間）
   */
  static getWeekStartTime(weekNumber: number): Date {
    const weekStart = new Date(this.START_TIME.getTime() + (weekNumber - 1) * this.WEEK_DURATION);
    return weekStart;
  }

  /**
   * 週の終了時刻を取得（日本時間）
   */
  static getWeekEndTime(weekNumber: number): Date {
    const weekStart = this.getWeekStartTime(weekNumber);
    return new Date(weekStart.getTime() + this.WEEK_DURATION);
  }

  /**
   * 週次問題切り替えをリアルタイムで通知
   */
  private static notifyWeeklyProblemChange(): void {
    try {
      const currentProblem = this.getCurrentWeekProblem();
      if (currentProblem) {
        // リアルタイム更新を送信
        realtimeManager.broadcastUpdate({
          type: 'weekly_problem_change',
          data: {
            week: this.currentWeek,
            problem: {
              id: currentProblem.id,
              title: currentProblem.title,
              description: currentProblem.description,
              difficulty: currentProblem.difficulty,
              timeLimit: currentProblem.timeLimit,
              participantCount: currentProblem.participantCount || 0
            },
            nextRotation: this.getTimeUntilNextRotation(),
            progress: this.getCurrentWeekProgress()
          },
          timestamp: new Date().toISOString(),
          userId: 'system',
          roomId: 'global'
        });

        console.log(`週次問題切り替え通知送信: 第${this.currentWeek}週`);
      }
    } catch (error) {
      console.error('週次問題切り替え通知エラー:', error);
    }
  }

  /**
   * 参加者数をリアルタイムで更新
   */
  static updateParticipantCount(problemId: string, delta: number): void {
    try {
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (problem) {
        // 参加者数を更新
        problem.participantCount = (problem.participantCount || 0) + delta;
        
        // リアルタイムで参加者数更新を通知
        realtimeManager.broadcastUpdate({
          type: 'participant_count_update',
          data: {
            problemId,
            participantCount: problem.participantCount,
            week: this.currentWeek
          },
          timestamp: new Date().toISOString(),
          userId: 'system',
          roomId: 'global'
        });

        console.log(`参加者数更新: ${problemId} - ${problem.participantCount}人`);
      }
    } catch (error) {
      console.error('参加者数更新エラー:', error);
    }
  }

  /**
   * 提出数をリアルタイムで更新
   */
  static updateSubmissionCount(problemId: string, delta: number): void {
    try {
      const problem = CompetitionProblemManager.getProblem(problemId);
      if (problem) {
        // 提出数を更新
        problem.submissionCount = (problem.submissionCount || 0) + delta;
        
        // リアルタイムで提出数更新を通知
        realtimeManager.broadcastUpdate({
          type: 'submission_count_update',
          data: {
            problemId,
            submissionCount: problem.submissionCount,
            week: this.currentWeek
          },
          timestamp: new Date().toISOString(),
          userId: 'system',
          roomId: 'global'
        });

        console.log(`提出数更新: ${problemId} - ${problem.submissionCount}件`);
      }
    } catch (error) {
      console.error('提出数更新エラー:', error);
    }
  }

  /**
   * 週次問題の統計情報をリアルタイムで取得
   */
  static getWeeklyStats(): {
    week: number;
    problem: CompetitionProblem | null;
    participantCount: number;
    submissionCount: number;
    timeUntilNext: number;
    progress: number;
  } {
    const problem = this.getCurrentWeekProblem();
    return {
      week: this.currentWeek,
      problem,
      participantCount: problem?.participantCount || 0,
      submissionCount: problem?.submissionCount || 0,
      timeUntilNext: this.getTimeUntilNextRotation(),
      progress: this.getCurrentWeekProgress()
    };
  }
}
