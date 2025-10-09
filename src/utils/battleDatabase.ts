// バトル結果のデータベース管理
import { supabase } from '../lib/supabase';

export interface BattleSubmission {
  id: string;
  userId: string;
  username: string;
  roomId: string;
  problemId: string;
  accuracy: number;
  trainingTime: number;
  modelType: string;
  parameters: Record<string, number>;
  submittedAt: string;
  rank?: number;
  score?: number;
  isPrivate?: boolean; // Private/Public判定
  battleType: 'individual' | 'team'; // 個人戦かチーム戦か
  teamId?: string; // チーム戦の場合のチームID
  teamMembers?: string[]; // チームメンバーのリスト
}

export interface BattleLeaderboardEntry {
  userId: string;
  username: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalScore: number;
  rank: number;
  streak: number;
  lastBattleAt: string;
  battleType: 'individual' | 'team';
  isPrivate?: boolean;
  teamId?: string;
}

export interface ProblemLeaderboardEntry {
  userId: string;
  username: string;
  accuracy: number;
  score: number;
  rank: number;
  submittedAt: string;
  modelType: string;
  trainingTime: number;
  isPrivate?: boolean;
  battleType: 'individual' | 'team';
}

export class BattleDatabase {
  // バトル結果を保存
  static async saveBattleResult(submission: Omit<BattleSubmission, 'id'>): Promise<BattleSubmission> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSubmission: BattleSubmission = {
      ...submission,
      id
    };

    // まずローカルストレージに保存（即座に利用可能）
    this.saveToLocalStorage(newSubmission);
    console.log('ローカルストレージに保存完了:', newSubmission);

    // オフラインモードの場合はローカルストレージのみ使用
    if (navigator.onLine === false) {
      console.log('オフラインモード: ローカルストレージのみ使用');
      return newSubmission;
    }

    // Supabaseに保存を試行（バックグラウンド）
    try {
      console.log('Supabaseに保存を試行:', {
        room_id: submission.roomId,
        user_id: submission.userId,
        username: submission.username,
        problem_id: submission.problemId,
        accuracy: submission.accuracy,
        training_time: Math.round(Number(submission.trainingTime)),
        model_type: submission.modelType,
        battle_type: submission.battleType
      });

      const { data, error } = await supabase
        .from('battle_results')
        .insert([{
          room_id: submission.roomId,
          user_id: submission.userId,
          username: submission.username,
          problem_id: submission.problemId,
          accuracy: submission.accuracy,
          training_time: Math.round(Number(submission.trainingTime)),
          model_type: submission.modelType,
          parameters: submission.parameters,
          is_private: submission.isPrivate,
          battle_type: submission.battleType,
          team_id: submission.teamId,
          team_members: submission.teamMembers,
          score: submission.score
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase保存エラー:', error);
        console.error('エラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // エラーを記録して後で再試行
        this.scheduleRetry(newSubmission);
      } else {
        console.log('Supabaseに保存完了:', data);
        // 成功したらローカルストレージから削除
        this.removeFromLocalStorage(newSubmission.id);
      }
    } catch (error) {
      console.error('Supabase接続エラー:', error);
      // エラーを記録して後で再試行
      this.scheduleRetry(newSubmission);
    }

    return newSubmission;
  }

  // ローカルストレージに保存（フォールバック）
  private static saveToLocalStorage(submission: BattleSubmission) {
    const existingSubmissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('battle_submissions', JSON.stringify(existingSubmissions));
    console.log('ローカルストレージに保存:', submission);
  }

  // 再試行をスケジュール
  private static scheduleRetry(submission: BattleSubmission) {
    const retryQueue = JSON.parse(localStorage.getItem('retry_queue') || '[]');
    retryQueue.push({
      ...submission,
      retryCount: 0,
      nextRetry: Date.now() + 5000 // 5秒後に再試行
    });
    localStorage.setItem('retry_queue', JSON.stringify(retryQueue));
  }

  // ローカルストレージから削除
  private static removeFromLocalStorage(submissionId: string) {
    const existingSubmissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    const filtered = existingSubmissions.filter((s: BattleSubmission) => s.id !== submissionId);
    localStorage.setItem('battle_submissions', JSON.stringify(filtered));
  }

  // 再試行キューを処理
  static async processRetryQueue() {
    const retryQueue = JSON.parse(localStorage.getItem('retry_queue') || '[]');
    const now = Date.now();
    
    for (let i = retryQueue.length - 1; i >= 0; i--) {
      const item = retryQueue[i];
      
      if (now >= item.nextRetry && item.retryCount < 3) {
        try {
          await this.saveBattleResult(item);
          retryQueue.splice(i, 1); // 成功したら削除
        } catch (error) {
          item.retryCount++;
          item.nextRetry = Date.now() + (5000 * Math.pow(2, item.retryCount)); // 指数バックオフ
        }
      }
    }
    
    localStorage.setItem('retry_queue', JSON.stringify(retryQueue));
  }

  // チーム管理機能
  static createTeam(leaderId: string, leaderUsername: string): string {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const team = {
      id: teamId,
      leader: leaderId,
      members: [leaderId],
      usernames: [leaderUsername],
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // ローカルストレージに保存
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.push(team);
    localStorage.setItem('teams', JSON.stringify(teams));
    
    return teamId;
  }

  static joinTeam(teamId: string, userId: string, username: string): boolean {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const team = teams.find((t: any) => t.id === teamId);
    
    if (!team || !team.isActive) {
      return false;
    }
    
    if (!team.members.includes(userId)) {
      team.members.push(userId);
      team.usernames.push(username);
      localStorage.setItem('teams', JSON.stringify(teams));
    }
    
    return true;
  }

  static getTeam(teamId: string): any | null {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    return teams.find((t: any) => t.id === teamId) || null;
  }

  // リーダーボードを取得（Private/Public分離、Kaggleスタイル）
  static async getLeaderboard(
    limit: number = 10, 
    isPrivate: boolean = false,
    battleType?: 'individual' | 'team'
  ): Promise<BattleLeaderboardEntry[]> {
    // Supabaseから取得を試行
    try {
      let query = supabase
        .from('leaderboard_view')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      // battle_typeカラムが存在しないため、フィルタリングをスキップ
      // if (battleType) {
      //   query = query.eq('battle_type', battleType);
      // }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase取得エラー:', error);
        // エラーの場合はローカルストレージから取得
        return this.getLeaderboardFromLocal(limit, isPrivate, battleType);
      }

      if (data && data.length > 0) {
        console.log('Supabaseからリーダーボード取得:', data);
        return data.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          username: entry.username,
          totalBattles: entry.total_battles,
          wins: entry.wins,
          losses: entry.losses,
          winRate: entry.total_battles > 0 ? entry.wins / entry.total_battles : 0,
          averageAccuracy: entry.average_accuracy,
          bestAccuracy: entry.best_accuracy,
          totalScore: entry.total_score,
          lastBattleAt: entry.last_battle_at,
          isPrivate: entry.is_private,
          battleType: entry.battle_type,
          teamId: entry.team_id,
          teamMembers: entry.team_members,
          level: 1,
          streak: entry.streak || 0
        }));
      }
    } catch (error) {
      console.error('Supabase接続エラー:', error);
    }

    // フォールバック: ローカルストレージから取得
    return this.getLeaderboardFromLocal(limit, isPrivate, battleType);
  }

  // ローカルストレージからリーダーボードを取得
  private static getLeaderboardFromLocal(
    limit: number, 
    isPrivate: boolean, 
    battleType?: 'individual' | 'team'
  ): BattleLeaderboardEntry[] {
    const submissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    
    console.log('ローカルストレージから取得した提出データ:', submissions);
    
    // Private/Publicとバトルタイプでフィルタリング
    const filteredSubmissions = submissions.filter((sub: BattleSubmission) => {
      const privateMatch = isPrivate ? sub.isPrivate === true : sub.isPrivate !== true;
      const typeMatch = !battleType || sub.battleType === battleType;
      return privateMatch && typeMatch;
    });
    
    console.log('フィルタリング後の提出データ:', filteredSubmissions);

    // 個人戦とチーム戦を統合したリーダーボード
    return this.getUnifiedLeaderboard(filteredSubmissions, limit);

    const userStats = new Map<string, {
      userId: string;
      username: string;
      totalBattles: number;
      wins: number;
      losses: number;
      accuracies: number[];
      totalScore: number;
      lastBattleAt: string;
      battleType: 'individual' | 'team';
      isPrivate: boolean;
    }>();

    filteredSubmissions.forEach((submission: BattleSubmission) => {
      const userId = submission.userId;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          username: submission.username,
          totalBattles: 0,
          wins: 0,
          losses: 0,
          accuracies: [],
          totalScore: 0,
          lastBattleAt: submission.submittedAt,
          battleType: submission.battleType,
          isPrivate: submission.isPrivate || false
        });
      }

      const stats = userStats.get(userId)!;
      stats.totalBattles++;
      stats.accuracies.push(submission.accuracy);
      
      // Kaggleスタイルのスコア計算（精度ベース + ボーナス）
      const baseScore = submission.accuracy * 1000;
      const timeBonus = Math.max(0, 100 - submission.trainingTime); // 時間ボーナス
      const modelBonus = submission.modelType === 'neural_network' ? 50 : 0; // モデルボーナス
      stats.totalScore += baseScore + timeBonus + modelBonus;
      
      stats.lastBattleAt = submission.submittedAt;
    });

    // リーダーボードエントリを生成
    const leaderboard: BattleLeaderboardEntry[] = Array.from(userStats.values())
      .map((stats, index) => ({
        userId: stats.userId,
        username: stats.username,
        totalBattles: stats.totalBattles,
        wins: stats.wins,
        losses: stats.totalBattles - stats.wins,
        winRate: stats.totalBattles > 0 ? stats.wins / stats.totalBattles : 0,
        averageAccuracy: stats.accuracies.length > 0 
          ? stats.accuracies.reduce((a, b) => a + b, 0) / stats.accuracies.length 
          : 0,
        bestAccuracy: stats.accuracies.length > 0 ? Math.max(...stats.accuracies) : 0,
        totalScore: stats.totalScore,
        rank: index + 1,
        streak: 0,
        lastBattleAt: stats.lastBattleAt,
        battleType: stats.battleType,
        isPrivate: stats.isPrivate,
        teamId: undefined
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    // ランクを再計算
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  // 統合リーダーボードを取得（個人戦とチーム戦を統合）
  static getUnifiedLeaderboard(submissions: BattleSubmission[], limit: number): BattleLeaderboardEntry[] {
    const stats = new Map<string, {
      userId: string;
      username: string;
      totalBattles: number;
      wins: number;
      losses: number;
      accuracies: number[];
      totalScore: number;
      lastBattleAt: string;
      isPrivate: boolean;
      battleType: 'individual' | 'team';
      teamId?: string;
      teamMembers?: string[];
    }>();

    submissions.forEach((submission: BattleSubmission) => {
      const key = submission.battleType === 'team' ? submission.teamId || `team_${submission.userId}` : submission.userId;
      const displayName = submission.battleType === 'team' ? 
        `チーム ${submission.teamId?.split('_')[1] || submission.username}` : 
        submission.username;
      
      if (!stats.has(key)) {
        stats.set(key, {
          userId: key,
          username: displayName,
          totalBattles: 0,
          wins: 0,
          losses: 0,
          accuracies: [],
          totalScore: 0,
          lastBattleAt: submission.submittedAt,
          isPrivate: submission.isPrivate || false,
          battleType: submission.battleType,
          teamId: submission.teamId,
          teamMembers: submission.teamMembers
        });
      }

      const stat = stats.get(key)!;
      stat.totalBattles++;
      if (submission.accuracy > 0.8) {
        stat.wins++;
      } else {
        stat.losses++;
      }
      stat.accuracies.push(submission.accuracy);
      stat.totalScore += submission.accuracy * 1000;
      stat.lastBattleAt = submission.submittedAt;
    });

    const leaderboard = Array.from(stats.values())
      .map(stat => ({
        userId: stat.userId,
        username: stat.username,
        totalBattles: stat.totalBattles,
        wins: stat.wins,
        losses: stat.losses,
        winRate: stat.totalBattles > 0 ? stat.wins / stat.totalBattles : 0,
        averageAccuracy: stat.accuracies.reduce((sum, acc) => sum + acc, 0) / stat.accuracies.length,
        bestAccuracy: Math.max(...stat.accuracies),
        totalScore: stat.totalScore,
        lastBattleAt: stat.lastBattleAt,
        isPrivate: stat.isPrivate,
        battleType: stat.battleType,
        teamId: stat.teamId,
        teamMembers: stat.teamMembers,
        level: 1,
        streak: 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return leaderboard;
  }

  // チームリーダーボードを取得
  static getTeamLeaderboard(submissions: BattleSubmission[], limit: number): BattleLeaderboardEntry[] {
    const teamStats = new Map<string, {
      teamId: string;
      teamName: string;
      teamMembers: string[];
      totalBattles: number;
      wins: number;
      losses: number;
      accuracies: number[];
      totalScore: number;
      lastBattleAt: string;
      isPrivate: boolean;
    }>();

    submissions.forEach((submission: BattleSubmission) => {
      const teamId = submission.teamId || `team_${submission.userId}`;
      const teamName = `チーム ${teamId.split('_')[1] || submission.username}`;
      
      if (!teamStats.has(teamId)) {
        teamStats.set(teamId, {
          teamId,
          teamName,
          teamMembers: submission.teamMembers || [submission.username],
          totalBattles: 0,
          wins: 0,
          losses: 0,
          accuracies: [],
          totalScore: 0,
          lastBattleAt: submission.submittedAt,
          isPrivate: submission.isPrivate || false
        });
      }

      const stats = teamStats.get(teamId)!;
      stats.totalBattles++;
      if (submission.accuracy > 0.8) {
        stats.wins++;
      } else {
        stats.losses++;
      }
      stats.accuracies.push(submission.accuracy);
      stats.totalScore += submission.accuracy * 1000;
      stats.lastBattleAt = submission.submittedAt;
    });

    const leaderboard = Array.from(teamStats.values())
      .map(stats => ({
        userId: stats.teamId,
        username: stats.teamName,
        totalBattles: stats.totalBattles,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.totalBattles > 0 ? stats.wins / stats.totalBattles : 0,
        averageAccuracy: stats.accuracies.reduce((sum, acc) => sum + acc, 0) / stats.accuracies.length,
        bestAccuracy: Math.max(...stats.accuracies),
        totalScore: stats.totalScore,
        lastBattleAt: stats.lastBattleAt,
        isPrivate: stats.isPrivate,
        teamId: stats.teamId,
        teamMembers: stats.teamMembers,
        level: 1, // チームのレベル
        streak: 0,
        battleType: 'team' as const
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return leaderboard;
  }

  // ユーザーの統計を取得
  static async getUserStats(userId: string): Promise<BattleLeaderboardEntry | null> {
    const leaderboard = await this.getLeaderboard(100);
    return leaderboard.find(entry => entry.userId === userId) || null;
  }

  // バトル履歴を取得
  static async getBattleHistory(userId: string, limit: number = 20): Promise<BattleSubmission[]> {
    // 開発環境では常にローカルストレージから取得
    const submissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    return submissions
      .filter((sub: BattleSubmission) => sub.userId === userId)
      .sort((a: BattleSubmission, b: BattleSubmission) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, limit);
  }

  // 問題別のリーダーボードを取得（Private/Public分離）
  static async getProblemLeaderboard(
    problemId: string, 
    limit: number = 10,
    isPrivate: boolean = false,
    battleType?: 'individual' | 'team'
  ): Promise<ProblemLeaderboardEntry[]> {
    // 複数のソースからデータを取得
    const submissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    const offlineData = JSON.parse(localStorage.getItem('offline_data_battle_result') || '[]');
    
    console.log('リーダーボード取得:', {
      problemId,
      submissions: submissions.length,
      offlineData: offlineData.length,
      isPrivate,
      battleType
    });
    
    // 両方のデータを結合
    const allSubmissions = [...submissions, ...offlineData];
    
    // 問題ID、Private/Public、バトルタイプでフィルタリング
    const filteredSubmissions = allSubmissions.filter((sub: BattleSubmission) => {
      const problemMatch = sub.problemId === problemId;
      const privateMatch = isPrivate ? sub.isPrivate === true : sub.isPrivate !== true;
      const typeMatch = !battleType || sub.battleType === battleType;
      return problemMatch && privateMatch && typeMatch;
    });

    console.log('フィルタリング後:', {
      filteredSubmissions: filteredSubmissions.length,
      submissions: filteredSubmissions
    });

    if (filteredSubmissions.length === 0) {
      // データがない場合はサンプルデータを生成（デバッグ用）
      console.log('データなし - サンプルデータを生成');
      const sampleData: ProblemLeaderboardEntry[] = [
        {
          userId: 'sample_user_1',
          username: 'サンプルプレイヤー1',
          accuracy: 0.85,
          score: 850,
          rank: 1,
          submittedAt: new Date().toISOString(),
          modelType: 'logistic_regression',
          trainingTime: 45,
          isPrivate: false,
          battleType: 'individual'
        },
        {
          userId: 'sample_user_2',
          username: 'サンプルプレイヤー2',
          accuracy: 0.78,
          score: 780,
          rank: 2,
          submittedAt: new Date().toISOString(),
          modelType: 'neural_network',
          trainingTime: 120,
          isPrivate: false,
          battleType: 'individual'
        }
      ];
      return sampleData;
    }

    // スコア計算（精度のみに依存）
    const scoredSubmissions = filteredSubmissions.map((sub: BattleSubmission) => {
      // データの検証とデフォルト値の設定
      const accuracy = typeof sub.accuracy === 'number' && !isNaN(sub.accuracy) ? sub.accuracy : 0;
      const trainingTime = typeof sub.trainingTime === 'number' && !isNaN(sub.trainingTime) ? sub.trainingTime : 0;
      const modelType = sub.modelType || 'logistic_regression';
      
      // 精度のみでスコア計算
      const totalScore = Math.round(accuracy * 1000);
      
      return {
        ...sub,
        accuracy,
        trainingTime,
        modelType,
        score: totalScore
      };
    });

    // スコア順でソートしてランク付け
    const leaderboard = scoredSubmissions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((sub, index) => ({
        userId: sub.userId || `user_${index + 1}`,
        username: sub.username || 'プレイヤー',
        accuracy: sub.accuracy || 0,
        score: sub.score || 0,
        rank: index + 1,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        modelType: sub.modelType || 'logistic_regression',
        trainingTime: sub.trainingTime || 120,
        isPrivate: sub.isPrivate || false,
        battleType: sub.battleType || 'individual'
      }));

    return leaderboard;
  }

  // 問題別の統計を取得
  static async getProblemStats(problemId: string): Promise<{
    totalSubmissions: number;
    averageAccuracy: number;
    bestAccuracy: number;
    topParticipants: Array<{ username: string; accuracy: number; submittedAt: string }>;
  }> {
    const submissions = JSON.parse(localStorage.getItem('battle_submissions') || '[]');
    const problemSubmissions = submissions.filter((sub: BattleSubmission) => sub.problemId === problemId);
    
    if (problemSubmissions.length === 0) {
      return {
        totalSubmissions: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
        topParticipants: []
      };
    }

    const accuracies = problemSubmissions.map((sub: BattleSubmission) => sub.accuracy);
    const averageAccuracy = accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length;
    const bestAccuracy = Math.max(...accuracies);

    const topParticipants = problemSubmissions
      .sort((a: BattleSubmission, b: BattleSubmission) => b.accuracy - a.accuracy)
      .slice(0, 10)
      .map((sub: BattleSubmission) => ({
        username: sub.username,
        accuracy: sub.accuracy,
        submittedAt: sub.submittedAt
      }));

    return {
      totalSubmissions: problemSubmissions.length,
      averageAccuracy,
      bestAccuracy,
      topParticipants
    };
  }

}
