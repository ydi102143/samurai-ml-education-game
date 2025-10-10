// 日次問題管理システム（本格運用用）
import { BattleDatabase } from './battleDatabase';
import { OfflineFirstManager } from './offlineFirstManager';

export interface DailyProblem {
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
  timeLimit: number;
  maxParticipants: number;
  currentParticipants: number;
}

export class DailyProblemManager {
  private static readonly DAILY_PROBLEMS_KEY = 'daily_problems';
  private static readonly CURRENT_PROBLEM_KEY = 'current_daily_problem';
  
  // 今日の新しい問題を生成
  static generateTodayProblem(): DailyProblem {
    const today = new Date();
    const problemId = `daily_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    
    const problems = [
      {
        title: '🏦 金融データ分析チャレンジ',
        description: '銀行の取引データから不正取引を検出するAIを構築しよう',
        dataset: 'modern_fraud_detection',
        difficulty: 'hard' as const,
        category: '金融・セキュリティ'
      },
      {
        title: '📈 株価予測マスター',
        description: '過去の株価データから将来の価格を予測し、投資戦略を提案しよう',
        dataset: 'modern_stock_prediction',
        difficulty: 'medium' as const,
        category: '金融・投資'
      },
      {
        title: '💬 感情分析エキスパート',
        description: 'SNSの投稿から感情を分析し、ユーザーの満足度を予測しよう',
        dataset: 'modern_sentiment_analysis',
        difficulty: 'easy' as const,
        category: '自然言語処理'
      },
      {
        title: '🖼️ 画像認識チャレンジ',
        description: '画像データを分類し、物体認識の精度を競おう',
        dataset: 'modern_image_classification',
        difficulty: 'medium' as const,
        category: 'コンピュータビジョン'
      },
      {
        title: '🎯 推薦システム最適化',
        description: 'ユーザーの行動データから最適な推薦を提案しよう',
        dataset: 'modern_recommendation',
        difficulty: 'hard' as const,
        category: '推薦システム'
      }
    ];
    
    // 今日の日付に基づいて問題を選択（毎日異なる問題）
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedProblem = problems[dayOfYear % problems.length];
    
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    
    const problem: DailyProblem = {
      id: problemId,
      title: selectedProblem.title,
      description: selectedProblem.description,
      dataset: selectedProblem.dataset,
      difficulty: selectedProblem.difficulty,
      category: selectedProblem.category,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true,
      publicLeaderboard: [],
      privateLeaderboard: [],
      timeLimit: 24 * 60 * 60, // 24時間
      maxParticipants: 100,
      currentParticipants: 0
    };
    
    console.log('今日の問題を生成:', problem);
    return problem;
  }
  
  // 現在の日次問題を取得
  static getCurrentDailyProblem(): DailyProblem | null {
    const today = new Date();
    const problemId = `daily_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    
    // ローカルストレージから取得
    const stored = localStorage.getItem(this.CURRENT_PROBLEM_KEY);
    if (stored) {
      const problem = JSON.parse(stored);
      if (problem.id === problemId) {
        return problem;
      }
    }
    
    // 新しい問題を生成
    const newProblem = this.generateTodayProblem();
    localStorage.setItem(this.CURRENT_PROBLEM_KEY, JSON.stringify(newProblem));
    return newProblem;
  }
  
  // 問題のリーダーボードを更新
  static async updateProblemLeaderboard(problemId: string): Promise<void> {
    try {
      // オフラインファーストでリーダーボードを取得
      const publicLeaderboard = await OfflineFirstManager.getData('battle_result');
      const privateLeaderboard = await OfflineFirstManager.getData('battle_result');
      
      // 問題IDでフィルタリング
      const problemPublic = publicLeaderboard.filter((entry: any) => entry.problemId === problemId);
      const problemPrivate = privateLeaderboard.filter((entry: any) => entry.problemId === problemId);
      
      // スコア順でソート
      const sortedPublic = problemPublic.sort((a: any, b: any) => b.accuracy - a.accuracy);
      const sortedPrivate = problemPrivate.sort((a: any, b: any) => b.accuracy - a.accuracy);
      
      // 現在の問題を更新
      const currentProblem = this.getCurrentDailyProblem();
      if (currentProblem) {
        currentProblem.publicLeaderboard = sortedPublic.slice(0, 20);
        currentProblem.privateLeaderboard = sortedPrivate.slice(0, 20);
        localStorage.setItem(this.CURRENT_PROBLEM_KEY, JSON.stringify(currentProblem));
      }
    } catch (error) {
      console.error('リーダーボード更新エラー:', error);
    }
  }
  
  // 問題の参加者数を更新
  static updateParticipantCount(problemId: string, increment: boolean = true): void {
    const currentProblem = this.getCurrentDailyProblem();
    if (currentProblem && currentProblem.id === problemId) {
      if (increment) {
        currentProblem.currentParticipants = Math.min(currentProblem.currentParticipants + 1, currentProblem.maxParticipants);
      } else {
        currentProblem.currentParticipants = Math.max(currentProblem.currentParticipants - 1, 0);
      }
      localStorage.setItem(this.CURRENT_PROBLEM_KEY, JSON.stringify(currentProblem));
    }
  }
  
  // 問題の残り時間を取得
  static getProblemTimeRemaining(problemId: string): string {
    const problem = this.getCurrentDailyProblem();
    if (!problem || problem.id !== problemId) return '終了';
    
    const now = new Date();
    const endDate = new Date(problem.endDate);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return '終了';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else {
      return `${minutes}分`;
    }
  }
  
  // 問題がアクティブかチェック
  static isProblemActive(problemId: string): boolean {
    const problem = this.getCurrentDailyProblem();
    if (!problem || problem.id !== problemId) return false;
    
    const now = new Date();
    const startDate = new Date(problem.startDate);
    const endDate = new Date(problem.endDate);
    return now >= startDate && now <= endDate;
  }
  
  // 問題の統計を取得
  static getProblemStats(problemId: string): {
    totalSubmissions: number;
    averageAccuracy: number;
    bestAccuracy: number;
    topParticipants: Array<{ username: string; accuracy: number; submittedAt: string }>;
  } {
    const problem = this.getCurrentDailyProblem();
    if (!problem || problem.id !== problemId) {
      return {
        totalSubmissions: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        topParticipants: []
      };
    }
    
    const leaderboard = problem.publicLeaderboard || [];
    const totalSubmissions = leaderboard.length;
    const averageAccuracy = leaderboard.length > 0 
      ? leaderboard.reduce((sum: number, entry: any) => sum + entry.accuracy, 0) / leaderboard.length 
      : 0;
    const bestAccuracy = leaderboard.length > 0 ? leaderboard[0].accuracy : 0;
    const topParticipants = leaderboard.slice(0, 5).map((entry: any) => ({
      username: entry.username,
      accuracy: entry.accuracy,
      submittedAt: entry.submittedAt
    }));
    
    return {
      totalSubmissions,
      averageAccuracy,
      bestAccuracy,
      topParticipants
    };
  }
}




