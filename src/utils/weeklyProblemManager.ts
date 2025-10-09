import { BattleDatabase } from './battleDatabase';

export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  publicLeaderboard: any[];
  privateLeaderboard: any[];
  timeLimit: number; // 1週間の制限時間（秒）
}

export class WeeklyProblemManager {
  private static readonly WEEKLY_PROBLEMS_KEY = 'weekly_problems';
  private static readonly CURRENT_WEEK_KEY = 'current_week_problem';

  // 週次問題を生成
  static generateWeeklyProblems(): WeeklyProblem[] {
    console.log('週次問題を生成中...');
    const problems: WeeklyProblem[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (startDate.getDay() || 7) + 1); // 月曜日開始

    const problemTemplates = [
      {
        title: '現代株価予測チャレンジ',
        description: '過去の株価データから将来の株価を予測し、投資戦略を提案する',
        dataset: 'modern_stock_prediction',
        difficulty: 'easy' as const,
        category: '金融分析'
      },
      {
        title: '感情分析マスター',
        description: 'テキストデータから感情を分析し、ユーザーの満足度を予測する',
        dataset: 'modern_sentiment_analysis',
        difficulty: 'easy' as const,
        category: '自然言語処理'
      },
      {
        title: '画像分類エキスパート',
        description: '画像データを分類し、物体認識の精度を競う',
        dataset: 'modern_image_classification',
        difficulty: 'medium' as const,
        category: 'コンピュータビジョン'
      },
      {
        title: '推薦システム最適化',
        description: 'ユーザーの行動データから最適な推薦を提案する',
        dataset: 'modern_recommendation',
        difficulty: 'medium' as const,
        category: '推薦システム'
      },
      {
        title: '不正検出システム',
        description: '取引データから不正なパターンを検出し、セキュリティを向上させる',
        dataset: 'modern_fraud_detection',
        difficulty: 'hard' as const,
        category: 'セキュリティ'
      }
    ];

    // 過去12週分の問題を生成
    for (let week = 0; week < 12; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // 1週間の制限時間

      const template = problemTemplates[week % problemTemplates.length];
      const problem: WeeklyProblem = {
        id: `weekly_${week + 1}`,
        title: `${template.title} (第${week + 1}週)`,
        description: template.description,
        dataset: template.dataset,
        difficulty: template.difficulty,
        category: template.category,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        isActive: week === 0, // 最新週のみアクティブ
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60 // 1週間の制限時間（秒）
      };

      console.log(`週次問題 ${week + 1} を生成:`, problem);
      problems.push(problem);
    }

    return problems;
  }

  // 現在の週次問題を取得
  static getCurrentWeeklyProblem(): WeeklyProblem | null {
    const problems = this.getWeeklyProblems();
    const currentProblem = problems.find(p => p.isActive);
    return currentProblem || null;
  }

  // 週次問題リストを取得
  static getWeeklyProblems(): WeeklyProblem[] {
    const stored = localStorage.getItem(this.WEEKLY_PROBLEMS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // 初回生成
    const problems = this.generateWeeklyProblems();
    localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
    return problems;
  }

  // 週次問題を更新
  static updateWeeklyProblems(): void {
    const problems = this.getWeeklyProblems();
    const now = new Date();

    // 各問題のアクティブ状態を更新
    problems.forEach(problem => {
      const startDate = new Date(problem.startDate);
      const endDate = new Date(problem.endDate);
      problem.isActive = now >= startDate && now <= endDate;
    });

    localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
  }

  // 問題のリーダーボードを更新
  static async updateProblemLeaderboard(problemId: string): Promise<void> {
    const problems = this.getWeeklyProblems();
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    try {
      // Publicリーダーボード（日頃の評価）
      const publicLeaderboard = await BattleDatabase.getProblemLeaderboard(problemId, 10, false);
      problem.publicLeaderboard = publicLeaderboard;

      // Privateリーダーボード（最終評価）
      const privateLeaderboard = await BattleDatabase.getProblemLeaderboard(problemId, 10, true);
      problem.privateLeaderboard = privateLeaderboard;

      localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
    }
  }

  // 現在の週次問題を強制的に更新（第1週から開始）
  static forceUpdateCurrentProblem(): WeeklyProblem | null {
    // 既存の週次問題をクリア
    localStorage.removeItem(this.WEEKLY_PROBLEMS_KEY);
    localStorage.removeItem(this.CURRENT_WEEK_KEY);
    
    // 新しい週次問題を生成
    const problems = this.generateWeeklyProblems();
    localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
    
    // 第1週の問題をアクティブにする
    if (problems.length > 0) {
      problems[0].isActive = true;
      localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
      console.log('週次問題をリセット:', problems[0]);
      return problems[0];
    }
    
    return null;
  }

  // リアルタイムで週次問題を更新（実際の時間軸で自動更新）
  static updateWeeklyProblemsRealtime(): WeeklyProblem | null {
    const problems = this.getWeeklyProblems();
    const now = new Date();
    
    // 問題がない場合は生成
    if (problems.length === 0) {
      this.generateWeeklyProblems();
      return this.getCurrentWeeklyProblem();
    }
    
    // 実際の時間軸で現在の週を計算
    const startDate = new Date('2024-01-01T00:00:00Z'); // UTC基準
    const currentWeek = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const problemIndex = currentWeek % problems.length;
    
    // 全ての問題を非アクティブにする
    problems.forEach(p => p.isActive = false);
    
    // 現在の週の問題をアクティブにする
    if (problems[problemIndex]) {
      problems[problemIndex].isActive = true;
      // 実際の時間に基づいて開始日と終了日を更新
      const weekStart = new Date(startDate.getTime() + currentWeek * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      problems[problemIndex].startDate = weekStart.toISOString();
      problems[problemIndex].endDate = weekEnd.toISOString();
      
      localStorage.setItem(this.WEEKLY_PROBLEMS_KEY, JSON.stringify(problems));
      console.log(`週次問題を自動更新: 週${currentWeek + 1}`, problems[problemIndex]);
      return problems[problemIndex];
    }
    
    return null;
  }

  // 問題の期間をチェック
  static isProblemActive(problemId: string): boolean {
    const problem = this.getWeeklyProblems().find(p => p.id === problemId);
    if (!problem) return false;

    const now = new Date();
    const startDate = new Date(problem.startDate);
    const endDate = new Date(problem.endDate);
    return now >= startDate && now <= endDate;
  }

  // 問題の残り時間を取得
  static getProblemTimeRemaining(problemId: string): string {
    const problem = this.getWeeklyProblems().find(p => p.id === problemId);
    if (!problem) return '終了';

    const now = new Date();
    const endDate = new Date(problem.endDate);
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return '終了';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}日${hours}時間`;
    if (hours > 0) return `${hours}時間${minutes}分`;
    return `${minutes}分`;
  }
}
