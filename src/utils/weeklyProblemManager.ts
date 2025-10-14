import { getRandomAdvancedProblemDataset, type AdvancedProblemDataset } from '../data/advancedProblemDatasets';

export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: string; // データセット名
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  publicLeaderboard: any[];
  privateLeaderboard: any[];
  timeLimit: number; // 秒
}

class WeeklyProblemManager {
  private static instance: WeeklyProblemManager;
  private currentProblem: WeeklyProblem | null = null;
  private problems: WeeklyProblem[] = [];
  private privateResults: {[problemId: string]: any[]} = {};

  private constructor() {
    this.initializeProblems();
    this.updateCurrentProblem();
  }

  public static getInstance(): WeeklyProblemManager {
    if (!WeeklyProblemManager.instance) {
      WeeklyProblemManager.instance = new WeeklyProblemManager();
    }
    return WeeklyProblemManager.instance;
  }

  private initializeProblems() {
    // 過去の問題を生成（実際の実装ではデータベースから読み込み）
    const categories = ['金融', '医療', 'EC', '製造業', '教育'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 10; i++) {
      const dataset = getRandomAdvancedProblemDataset();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7)); // 過去の週
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      this.problems.push({
        id: `weekly_${i + 1}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: difficulties[i % 3],
        category: categories[i % categories.length],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: false,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60 // 7日間
      });
    }
  }

  private updateCurrentProblem() {
    const now = new Date();
    
    // 日本標準時での現在時刻
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 現在の週の問題を探す
    const currentWeekStart = this.getWeekStart(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    let currentProblem = this.problems.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return start <= now && now < end;
    });

    // 現在の問題がない場合は新しい問題を作成
    if (!currentProblem) {
      const dataset = getRandomAdvancedProblemDataset();
      currentProblem = {
        id: `weekly_${Date.now()}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: 'medium',
        category: '金融',
        startDate: currentWeekStart.toISOString(),
        endDate: currentWeekEnd.toISOString(),
        isActive: true,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60
      };
      this.problems.unshift(currentProblem);
    }

    this.currentProblem = currentProblem;
  }

  private getWeekStart(date: Date): Date {
    // 日本標準時（JST）に変換
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const weekStart = new Date(jstDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    // UTCに戻す
    return new Date(weekStart.getTime() - (9 * 60 * 60 * 1000));
  }

  public getCurrentWeeklyProblem(): WeeklyProblem | null {
    this.updateCurrentProblem();
    return this.currentProblem;
  }

  public isProblemActive(problemId: string): boolean {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return false;

    const now = new Date();
    const start = new Date(problem.startDate);
    const end = new Date(problem.endDate);
    
    return start <= now && now < end;
  }

  public getTimeRemaining(problemId: string): number {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return 0;

    const now = new Date();
    const end = new Date(problem.endDate);
    
    // 日本標準時での残り時間を計算
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const jstEnd = new Date(end.getTime() + (9 * 60 * 60 * 1000));
    
    return Math.max(0, Math.floor((jstEnd.getTime() - jstNow.getTime()) / 1000));
  }

  public updateWeeklyProblems() {
    this.updateCurrentProblem();
  }

  public getProblemHistory(): WeeklyProblem[] {
    return this.problems.slice(0, 5); // 過去5週間の問題
  }

  public addPublicSubmission(problemId: string, submission: any) {
    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      problem.publicLeaderboard.push(submission);
      problem.publicLeaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }

  public getPublicLeaderboard(problemId: string): any[] {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.publicLeaderboard : [];
  }

  public setPrivateResults(problemId: string, results: any[]) {
    this.privateResults[problemId] = results;
  }

  public getPrivateResults(problemId: string): any[] {
    return this.privateResults[problemId] || [];
  }

  public getPrivateLeaderboard(problemId: string): any[] {
    const results = this.getPrivateResults(problemId);
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // 週間問題の自動更新（毎日実行）
  public checkAndUpdateProblems() {
    const now = new Date();
    const currentProblem = this.getCurrentWeeklyProblem();
    
    if (currentProblem) {
      const endDate = new Date(currentProblem.endDate);
      
      // 問題が終了した場合、Private結果を生成
      if (now >= endDate && !this.privateResults[currentProblem.id]) {
        this.generatePrivateResults(currentProblem.id);
      }
    }
  }

  private generatePrivateResults(problemId: string) {
    // Private結果のシミュレーション
    const publicResults = this.getPublicLeaderboard(problemId);
    const privateResults = publicResults.map((result, index) => ({
      ...result,
      privateScore: result.score * (0.8 + Math.random() * 0.4), // 80-120%の範囲で変動
      rank: index + 1
    }));

    this.setPrivateResults(problemId, privateResults);
  }

  public getNextProblemStartTime(): Date {
    const now = new Date();
    const nextMonday = this.getWeekStart(now);
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    return nextMonday;
  }
}

export const weeklyProblemManager = WeeklyProblemManager.getInstance();

// 毎日問題をチェックする（実際の実装ではcronジョブなどで実行）
setInterval(() => {
  weeklyProblemManager.checkAndUpdateProblems();
}, 24 * 60 * 60 * 1000); // 24時間ごと
export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: string; // データセット名
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  publicLeaderboard: any[];
  privateLeaderboard: any[];
  timeLimit: number; // 秒
}

class WeeklyProblemManager {
  private static instance: WeeklyProblemManager;
  private currentProblem: WeeklyProblem | null = null;
  private problems: WeeklyProblem[] = [];
  private privateResults: {[problemId: string]: any[]} = {};

  private constructor() {
    this.initializeProblems();
    this.updateCurrentProblem();
  }

  public static getInstance(): WeeklyProblemManager {
    if (!WeeklyProblemManager.instance) {
      WeeklyProblemManager.instance = new WeeklyProblemManager();
    }
    return WeeklyProblemManager.instance;
  }

  private initializeProblems() {
    // 過去の問題を生成（実際の実装ではデータベースから読み込み）
    const categories = ['金融', '医療', 'EC', '製造業', '教育'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 10; i++) {
      const dataset = getRandomAdvancedProblemDataset();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7)); // 過去の週
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      this.problems.push({
        id: `weekly_${i + 1}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: difficulties[i % 3],
        category: categories[i % categories.length],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: false,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60 // 7日間
      });
    }
  }

  private updateCurrentProblem() {
    const now = new Date();
    
    // 日本標準時での現在時刻
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 現在の週の問題を探す
    const currentWeekStart = this.getWeekStart(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    let currentProblem = this.problems.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return start <= now && now < end;
    });

    // 現在の問題がない場合は新しい問題を作成
    if (!currentProblem) {
      const dataset = getRandomAdvancedProblemDataset();
      currentProblem = {
        id: `weekly_${Date.now()}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: 'medium',
        category: '金融',
        startDate: currentWeekStart.toISOString(),
        endDate: currentWeekEnd.toISOString(),
        isActive: true,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60
      };
      this.problems.unshift(currentProblem);
    }

    this.currentProblem = currentProblem;
  }

  private getWeekStart(date: Date): Date {
    // 日本標準時（JST）に変換
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const weekStart = new Date(jstDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    // UTCに戻す
    return new Date(weekStart.getTime() - (9 * 60 * 60 * 1000));
  }

  public getCurrentWeeklyProblem(): WeeklyProblem | null {
    this.updateCurrentProblem();
    return this.currentProblem;
  }

  public isProblemActive(problemId: string): boolean {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return false;

    const now = new Date();
    const start = new Date(problem.startDate);
    const end = new Date(problem.endDate);
    
    return start <= now && now < end;
  }

  public getTimeRemaining(problemId: string): number {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return 0;

    const now = new Date();
    const end = new Date(problem.endDate);
    
    // 日本標準時での残り時間を計算
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const jstEnd = new Date(end.getTime() + (9 * 60 * 60 * 1000));
    
    return Math.max(0, Math.floor((jstEnd.getTime() - jstNow.getTime()) / 1000));
  }

  public updateWeeklyProblems() {
    this.updateCurrentProblem();
  }

  public getProblemHistory(): WeeklyProblem[] {
    return this.problems.slice(0, 5); // 過去5週間の問題
  }

  public addPublicSubmission(problemId: string, submission: any) {
    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      problem.publicLeaderboard.push(submission);
      problem.publicLeaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }

  public getPublicLeaderboard(problemId: string): any[] {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.publicLeaderboard : [];
  }

  public setPrivateResults(problemId: string, results: any[]) {
    this.privateResults[problemId] = results;
  }

  public getPrivateResults(problemId: string): any[] {
    return this.privateResults[problemId] || [];
  }

  public getPrivateLeaderboard(problemId: string): any[] {
    const results = this.getPrivateResults(problemId);
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // 週間問題の自動更新（毎日実行）
  public checkAndUpdateProblems() {
    const now = new Date();
    const currentProblem = this.getCurrentWeeklyProblem();
    
    if (currentProblem) {
      const endDate = new Date(currentProblem.endDate);
      
      // 問題が終了した場合、Private結果を生成
      if (now >= endDate && !this.privateResults[currentProblem.id]) {
        this.generatePrivateResults(currentProblem.id);
      }
    }
  }

  private generatePrivateResults(problemId: string) {
    // Private結果のシミュレーション
    const publicResults = this.getPublicLeaderboard(problemId);
    const privateResults = publicResults.map((result, index) => ({
      ...result,
      privateScore: result.score * (0.8 + Math.random() * 0.4), // 80-120%の範囲で変動
      rank: index + 1
    }));

    this.setPrivateResults(problemId, privateResults);
  }

  public getNextProblemStartTime(): Date {
    const now = new Date();
    const nextMonday = this.getWeekStart(now);
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    return nextMonday;
  }
}

export const weeklyProblemManager = WeeklyProblemManager.getInstance();

// 毎日問題をチェックする（実際の実装ではcronジョブなどで実行）
setInterval(() => {
  weeklyProblemManager.checkAndUpdateProblems();
}, 24 * 60 * 60 * 1000); // 24時間ごと
export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: string; // データセット名
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  publicLeaderboard: any[];
  privateLeaderboard: any[];
  timeLimit: number; // 秒
}

class WeeklyProblemManager {
  private static instance: WeeklyProblemManager;
  private currentProblem: WeeklyProblem | null = null;
  private problems: WeeklyProblem[] = [];
  private privateResults: {[problemId: string]: any[]} = {};

  private constructor() {
    this.initializeProblems();
    this.updateCurrentProblem();
  }

  public static getInstance(): WeeklyProblemManager {
    if (!WeeklyProblemManager.instance) {
      WeeklyProblemManager.instance = new WeeklyProblemManager();
    }
    return WeeklyProblemManager.instance;
  }

  private initializeProblems() {
    // 過去の問題を生成（実際の実装ではデータベースから読み込み）
    const categories = ['金融', '医療', 'EC', '製造業', '教育'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 10; i++) {
      const dataset = getRandomAdvancedProblemDataset();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7)); // 過去の週
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      this.problems.push({
        id: `weekly_${i + 1}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: difficulties[i % 3],
        category: categories[i % categories.length],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: false,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60 // 7日間
      });
    }
  }

  private updateCurrentProblem() {
    const now = new Date();
    
    // 日本標準時での現在時刻
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 現在の週の問題を探す
    const currentWeekStart = this.getWeekStart(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    let currentProblem = this.problems.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return start <= now && now < end;
    });

    // 現在の問題がない場合は新しい問題を作成
    if (!currentProblem) {
      const dataset = getRandomAdvancedProblemDataset();
      currentProblem = {
        id: `weekly_${Date.now()}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: 'medium',
        category: '金融',
        startDate: currentWeekStart.toISOString(),
        endDate: currentWeekEnd.toISOString(),
        isActive: true,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60
      };
      this.problems.unshift(currentProblem);
    }

    this.currentProblem = currentProblem;
  }

  private getWeekStart(date: Date): Date {
    // 日本標準時（JST）に変換
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const weekStart = new Date(jstDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    // UTCに戻す
    return new Date(weekStart.getTime() - (9 * 60 * 60 * 1000));
  }

  public getCurrentWeeklyProblem(): WeeklyProblem | null {
    this.updateCurrentProblem();
    return this.currentProblem;
  }

  public isProblemActive(problemId: string): boolean {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return false;

    const now = new Date();
    const start = new Date(problem.startDate);
    const end = new Date(problem.endDate);
    
    return start <= now && now < end;
  }

  public getTimeRemaining(problemId: string): number {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return 0;

    const now = new Date();
    const end = new Date(problem.endDate);
    
    // 日本標準時での残り時間を計算
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const jstEnd = new Date(end.getTime() + (9 * 60 * 60 * 1000));
    
    return Math.max(0, Math.floor((jstEnd.getTime() - jstNow.getTime()) / 1000));
  }

  public updateWeeklyProblems() {
    this.updateCurrentProblem();
  }

  public getProblemHistory(): WeeklyProblem[] {
    return this.problems.slice(0, 5); // 過去5週間の問題
  }

  public addPublicSubmission(problemId: string, submission: any) {
    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      problem.publicLeaderboard.push(submission);
      problem.publicLeaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }

  public getPublicLeaderboard(problemId: string): any[] {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.publicLeaderboard : [];
  }

  public setPrivateResults(problemId: string, results: any[]) {
    this.privateResults[problemId] = results;
  }

  public getPrivateResults(problemId: string): any[] {
    return this.privateResults[problemId] || [];
  }

  public getPrivateLeaderboard(problemId: string): any[] {
    const results = this.getPrivateResults(problemId);
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // 週間問題の自動更新（毎日実行）
  public checkAndUpdateProblems() {
    const now = new Date();
    const currentProblem = this.getCurrentWeeklyProblem();
    
    if (currentProblem) {
      const endDate = new Date(currentProblem.endDate);
      
      // 問題が終了した場合、Private結果を生成
      if (now >= endDate && !this.privateResults[currentProblem.id]) {
        this.generatePrivateResults(currentProblem.id);
      }
    }
  }

  private generatePrivateResults(problemId: string) {
    // Private結果のシミュレーション
    const publicResults = this.getPublicLeaderboard(problemId);
    const privateResults = publicResults.map((result, index) => ({
      ...result,
      privateScore: result.score * (0.8 + Math.random() * 0.4), // 80-120%の範囲で変動
      rank: index + 1
    }));

    this.setPrivateResults(problemId, privateResults);
  }

  public getNextProblemStartTime(): Date {
    const now = new Date();
    const nextMonday = this.getWeekStart(now);
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    return nextMonday;
  }
}

export const weeklyProblemManager = WeeklyProblemManager.getInstance();

// 毎日問題をチェックする（実際の実装ではcronジョブなどで実行）
setInterval(() => {
  weeklyProblemManager.checkAndUpdateProblems();
}, 24 * 60 * 60 * 1000); // 24時間ごと
export interface WeeklyProblem {
  id: string;
  title: string;
  description: string;
  dataset: string; // データセット名
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
  publicLeaderboard: any[];
  privateLeaderboard: any[];
  timeLimit: number; // 秒
}

class WeeklyProblemManager {
  private static instance: WeeklyProblemManager;
  private currentProblem: WeeklyProblem | null = null;
  private problems: WeeklyProblem[] = [];
  private privateResults: {[problemId: string]: any[]} = {};

  private constructor() {
    this.initializeProblems();
    this.updateCurrentProblem();
  }

  public static getInstance(): WeeklyProblemManager {
    if (!WeeklyProblemManager.instance) {
      WeeklyProblemManager.instance = new WeeklyProblemManager();
    }
    return WeeklyProblemManager.instance;
  }

  private initializeProblems() {
    // 過去の問題を生成（実際の実装ではデータベースから読み込み）
    const categories = ['金融', '医療', 'EC', '製造業', '教育'];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 10; i++) {
      const dataset = getRandomAdvancedProblemDataset();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7)); // 過去の週
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      this.problems.push({
        id: `weekly_${i + 1}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: difficulties[i % 3],
        category: categories[i % categories.length],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: false,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60 // 7日間
      });
    }
  }

  private updateCurrentProblem() {
    const now = new Date();
    
    // 日本標準時での現在時刻
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 現在の週の問題を探す
    const currentWeekStart = this.getWeekStart(now);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    let currentProblem = this.problems.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return start <= now && now < end;
    });

    // 現在の問題がない場合は新しい問題を作成
    if (!currentProblem) {
      const dataset = getRandomAdvancedProblemDataset();
      currentProblem = {
        id: `weekly_${Date.now()}`,
        title: dataset.name,
        description: dataset.description,
        dataset: dataset.id,
        difficulty: 'medium',
        category: '金融',
        startDate: currentWeekStart.toISOString(),
        endDate: currentWeekEnd.toISOString(),
        isActive: true,
        publicLeaderboard: [],
        privateLeaderboard: [],
        timeLimit: 7 * 24 * 60 * 60
      };
      this.problems.unshift(currentProblem);
    }

    this.currentProblem = currentProblem;
  }

  private getWeekStart(date: Date): Date {
    // 日本標準時（JST）に変換
    const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const weekStart = new Date(jstDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    // UTCに戻す
    return new Date(weekStart.getTime() - (9 * 60 * 60 * 1000));
  }

  public getCurrentWeeklyProblem(): WeeklyProblem | null {
    this.updateCurrentProblem();
    return this.currentProblem;
  }

  public isProblemActive(problemId: string): boolean {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return false;

    const now = new Date();
    const start = new Date(problem.startDate);
    const end = new Date(problem.endDate);
    
    return start <= now && now < end;
  }

  public getTimeRemaining(problemId: string): number {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) return 0;

    const now = new Date();
    const end = new Date(problem.endDate);
    
    // 日本標準時での残り時間を計算
    const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const jstEnd = new Date(end.getTime() + (9 * 60 * 60 * 1000));
    
    return Math.max(0, Math.floor((jstEnd.getTime() - jstNow.getTime()) / 1000));
  }

  public updateWeeklyProblems() {
    this.updateCurrentProblem();
  }

  public getProblemHistory(): WeeklyProblem[] {
    return this.problems.slice(0, 5); // 過去5週間の問題
  }

  public addPublicSubmission(problemId: string, submission: any) {
    const problem = this.problems.find(p => p.id === problemId);
    if (problem) {
      problem.publicLeaderboard.push(submission);
      problem.publicLeaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  }

  public getPublicLeaderboard(problemId: string): any[] {
    const problem = this.problems.find(p => p.id === problemId);
    return problem ? problem.publicLeaderboard : [];
  }

  public setPrivateResults(problemId: string, results: any[]) {
    this.privateResults[problemId] = results;
  }

  public getPrivateResults(problemId: string): any[] {
    return this.privateResults[problemId] || [];
  }

  public getPrivateLeaderboard(problemId: string): any[] {
    const results = this.getPrivateResults(problemId);
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  // 週間問題の自動更新（毎日実行）
  public checkAndUpdateProblems() {
    const now = new Date();
    const currentProblem = this.getCurrentWeeklyProblem();
    
    if (currentProblem) {
      const endDate = new Date(currentProblem.endDate);
      
      // 問題が終了した場合、Private結果を生成
      if (now >= endDate && !this.privateResults[currentProblem.id]) {
        this.generatePrivateResults(currentProblem.id);
      }
    }
  }

  private generatePrivateResults(problemId: string) {
    // Private結果のシミュレーション
    const publicResults = this.getPublicLeaderboard(problemId);
    const privateResults = publicResults.map((result, index) => ({
      ...result,
      privateScore: result.score * (0.8 + Math.random() * 0.4), // 80-120%の範囲で変動
      rank: index + 1
    }));

    this.setPrivateResults(problemId, privateResults);
  }

  public getNextProblemStartTime(): Date {
    const now = new Date();
    const nextMonday = this.getWeekStart(now);
    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }
    return nextMonday;
  }
}

export const weeklyProblemManager = WeeklyProblemManager.getInstance();

// 毎日問題をチェックする（実際の実装ではcronジョブなどで実行）
setInterval(() => {
  weeklyProblemManager.checkAndUpdateProblems();
}, 24 * 60 * 60 * 1000); // 24時間ごと