import { realtimeManager } from './realtimeManager';
import { unifiedDataManager } from './unifiedDataManager';
import { errorRecovery } from './errorRecovery';
import type { CompetitionSubmission } from '../types/competition';

export interface TeamMember {
  userId: string;
  username: string;
  role: 'leader' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface TeamBattle {
  id: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  problemId: string;
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results: TeamBattleResult[];
}

export interface TeamBattleResult {
  teamId: string;
  teamName: string;
  totalScore: number;
  memberResults: {
    userId: string;
    username: string;
    score: number;
    contribution: number; // 貢献度（0-1）
  }[];
  completedAt: Date;
}

/**
 * チーム戦システム
 * チーム作成、参加、進捗共有、結果集計を管理
 */
export class TeamBattleSystem {
  private static instance: TeamBattleSystem;
  private teams: Map<string, TeamBattle> = new Map();
  private userTeams: Map<string, string> = new Map(); // userId -> teamId

  static getInstance(): TeamBattleSystem {
    if (!this.instance) {
      this.instance = new TeamBattleSystem();
    }
    return this.instance;
  }

  /**
   * チーム作成
   */
  async createTeam(
    leaderId: string,
    leaderUsername: string,
    teamName: string,
    problemId: string
  ): Promise<string> {
    try {
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const team: TeamBattle = {
        id: teamId,
        name: teamName,
        leaderId,
        members: [{
          userId: leaderId,
          username: leaderUsername,
          role: 'leader',
          joinedAt: new Date(),
          isActive: true
        }],
        problemId,
        status: 'waiting',
        createdAt: new Date(),
        results: []
      };

      this.teams.set(teamId, team);
      this.userTeams.set(leaderId, teamId);

      // リアルタイムでチーム作成を通知
      this.broadcastTeamUpdate('team_created', team);

      console.log(`チーム作成完了: ${teamName} (${teamId})`);
      return teamId;
    } catch (error) {
      console.error('チーム作成エラー:', error);
      throw error;
    }
  }

  /**
   * チーム参加
   */
  async joinTeam(
    teamId: string,
    userId: string,
    username: string
  ): Promise<boolean> {
    try {
      const team = this.teams.get(teamId);
      if (!team) {
        throw new Error('チームが見つかりません');
      }

      if (team.status !== 'waiting') {
        throw new Error('チームは既に開始されています');
      }

      if (team.members.some(member => member.userId === userId)) {
        throw new Error('既にチームに参加しています');
      }

      if (team.members.length >= 4) { // 最大4人
        throw new Error('チームの定員に達しています');
      }

      // メンバーを追加
      team.members.push({
        userId,
        username,
        role: 'member',
        joinedAt: new Date(),
        isActive: true
      });

      this.userTeams.set(userId, teamId);

      // リアルタイムでチーム更新を通知
      this.broadcastTeamUpdate('member_joined', team);

      console.log(`${username}がチーム ${team.name} に参加しました`);
      return true;
    } catch (error) {
      console.error('チーム参加エラー:', error);
      throw error;
    }
  }

  /**
   * チーム離脱
   */
  async leaveTeam(userId: string): Promise<boolean> {
    try {
      const teamId = this.userTeams.get(userId);
      if (!teamId) {
        return false;
      }

      const team = this.teams.get(teamId);
      if (!team) {
        return false;
      }

      // リーダーの場合はチームを解散
      if (team.leaderId === userId) {
        await this.disbandTeam(teamId);
        return true;
      }

      // メンバーを削除
      team.members = team.members.filter(member => member.userId !== userId);
      this.userTeams.delete(userId);

      // リアルタイムでチーム更新を通知
      this.broadcastTeamUpdate('member_left', team);

      console.log(`ユーザー ${userId} がチーム ${team.name} から離脱しました`);
      return true;
    } catch (error) {
      console.error('チーム離脱エラー:', error);
      throw error;
    }
  }

  /**
   * チーム解散
   */
  async disbandTeam(teamId: string): Promise<boolean> {
    try {
      const team = this.teams.get(teamId);
      if (!team) {
        return false;
      }

      // 全メンバーのチーム情報をクリア
      team.members.forEach(member => {
        this.userTeams.delete(member.userId);
      });

      // チームを削除
      this.teams.delete(teamId);

      // リアルタイムでチーム解散を通知
      this.broadcastTeamUpdate('team_disbanded', team);

      console.log(`チーム ${team.name} が解散されました`);
      return true;
    } catch (error) {
      console.error('チーム解散エラー:', error);
      throw error;
    }
  }

  /**
   * チーム戦開始
   */
  async startTeamBattle(teamId: string): Promise<boolean> {
    try {
      const team = this.teams.get(teamId);
      if (!team) {
        throw new Error('チームが見つかりません');
      }

      if (team.status !== 'waiting') {
        throw new Error('チーム戦は既に開始されています');
      }

      if (team.members.length < 2) {
        throw new Error('チームメンバーが不足しています（最低2人必要）');
      }

      team.status = 'active';
      team.startedAt = new Date();

      // リアルタイムでチーム戦開始を通知
      this.broadcastTeamUpdate('battle_started', team);

      console.log(`チーム戦開始: ${team.name}`);
      return true;
    } catch (error) {
      console.error('チーム戦開始エラー:', error);
      throw error;
    }
  }

  /**
   * チーム戦結果の提出
   */
  async submitTeamResult(
    teamId: string,
    userId: string,
    submission: CompetitionSubmission
  ): Promise<boolean> {
    try {
      const team = this.teams.get(teamId);
      if (!team) {
        throw new Error('チームが見つかりません');
      }

      if (team.status !== 'active') {
        throw new Error('チーム戦が開始されていません');
      }

      // メンバーの結果を記録
      const member = team.members.find(m => m.userId === userId);
      if (!member) {
        throw new Error('チームメンバーではありません');
      }

      // 既存の結果を更新または新規作成
      let result = team.results.find(r => r.teamId === teamId);
      if (!result) {
        result = {
          teamId,
          teamName: team.name,
          totalScore: 0,
          memberResults: [],
          completedAt: new Date()
        };
        team.results.push(result);
      }

      // メンバー結果を更新
      const existingMemberResult = result.memberResults.find(mr => mr.userId === userId);
      if (existingMemberResult) {
        existingMemberResult.score = submission.score;
      } else {
        result.memberResults.push({
          userId,
          username: member.username,
          score: submission.score,
          contribution: 0 // 後で計算
        });
      }

      // チームスコアを再計算
      result.totalScore = this.calculateTeamScore(result.memberResults);
      
      // 貢献度を計算
      this.calculateContributions(result.memberResults);

      // 全メンバーが完了したかチェック
      const allCompleted = team.members.every(member => 
        result!.memberResults.some(mr => mr.userId === member.userId)
      );

      if (allCompleted) {
        team.status = 'completed';
        team.completedAt = new Date();
        
        // リアルタイムでチーム戦完了を通知
        this.broadcastTeamUpdate('battle_completed', team);
      } else {
        // リアルタイムで進捗更新を通知
        this.broadcastTeamUpdate('progress_updated', team);
      }

      console.log(`チーム戦結果提出: ${team.name} - ${member.username} (${submission.score})`);
      return true;
    } catch (error) {
      console.error('チーム戦結果提出エラー:', error);
      throw error;
    }
  }

  /**
   * チームスコアの計算
   */
  private calculateTeamScore(memberResults: any[]): number {
    if (memberResults.length === 0) return 0;
    
    // 平均スコアをチームスコアとする
    const totalScore = memberResults.reduce((sum, result) => sum + result.score, 0);
    return totalScore / memberResults.length;
  }

  /**
   * 貢献度の計算
   */
  private calculateContributions(memberResults: any[]): void {
    if (memberResults.length === 0) return;

    const totalScore = memberResults.reduce((sum, result) => sum + result.score, 0);
    
    memberResults.forEach(result => {
      result.contribution = totalScore > 0 ? result.score / totalScore : 1 / memberResults.length;
    });
  }

  /**
   * チーム情報の取得
   */
  getTeam(teamId: string): TeamBattle | null {
    return this.teams.get(teamId) || null;
  }

  /**
   * ユーザーのチーム取得
   */
  getUserTeam(userId: string): TeamBattle | null {
    const teamId = this.userTeams.get(userId);
    return teamId ? this.teams.get(teamId) || null : null;
  }

  /**
   * 利用可能なチーム一覧取得
   */
  getAvailableTeams(problemId: string): TeamBattle[] {
    return Array.from(this.teams.values()).filter(team => 
      team.problemId === problemId && 
      team.status === 'waiting' && 
      team.members.length < 4
    );
  }

  /**
   * チーム更新のブロードキャスト
   */
  private broadcastTeamUpdate(eventType: string, team: TeamBattle) {
    try {
      realtimeManager.broadcastUpdate({
        type: 'team_update',
        data: {
          eventType,
          team: {
            id: team.id,
            name: team.name,
            leaderId: team.leaderId,
            members: team.members,
            problemId: team.problemId,
            status: team.status,
            createdAt: team.createdAt,
            startedAt: team.startedAt,
            completedAt: team.completedAt
          }
        },
        timestamp: new Date().toISOString(),
        userId: 'system',
        roomId: 'global'
      });
    } catch (error) {
      console.error('チーム更新ブロードキャストエラー:', error);
    }
  }

  /**
   * チーム戦統計の取得
   */
  getTeamBattleStats(problemId: string): {
    totalTeams: number;
    activeTeams: number;
    completedTeams: number;
    totalParticipants: number;
  } {
    const teams = Array.from(this.teams.values()).filter(team => team.problemId === problemId);
    
    return {
      totalTeams: teams.length,
      activeTeams: teams.filter(team => team.status === 'active').length,
      completedTeams: teams.filter(team => team.status === 'completed').length,
      totalParticipants: teams.reduce((sum, team) => sum + team.members.length, 0)
    };
  }
}

export const teamBattleSystem = TeamBattleSystem.getInstance();


