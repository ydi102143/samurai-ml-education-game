import { Team, TeamMember, TeamBattleStats, TeamPermissions } from '../types/onlineBattle';
import { userManager } from './userManager';

export class TeamManager {
  private static teams: Map<string, Team> = new Map();
  private static userTeams: Map<string, string> = new Map(); // userId -> teamId

  // チーム作成
  static createTeam(
    name: string,
    description: string,
    maxMembers: number = 5,
    isPrivate: boolean = false
  ): Team {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const team: Team = {
      id: teamId,
      name,
      leaderId: user.id,
      leaderName: user.username,
      members: [{
        userId: user.id,
        username: user.username,
        joinedAt: now,
        isReady: false,
        progress: 0,
        currentStep: 'data',
        lastActivity: now,
        role: 'leader',
        permissions: {
          canInvite: true,
          canKick: true,
          canEditTeam: true,
          canStartBattle: true
        }
      }],
      maxMembers,
      isPrivate,
      description,
      createdAt: now,
      updatedAt: now,
      battleStats: {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    };

    this.teams.set(teamId, team);
    this.userTeams.set(user.id, teamId);

    console.log('チームを作成しました:', team);
    return team;
  }

  // チーム参加
  static joinTeam(teamId: string): Team {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('チームの定員に達しています');
    }

    if (team.members.some(member => member.userId === user.id)) {
      throw new Error('既にチームに参加しています');
    }

    const now = new Date().toISOString();
    const newMember: TeamMember = {
      userId: user.id,
      username: user.username,
      joinedAt: now,
      isReady: false,
      progress: 0,
      currentStep: 'data',
      lastActivity: now,
      role: 'member',
      permissions: {
        canInvite: false,
        canKick: false,
        canEditTeam: false,
        canStartBattle: false
      }
    };

    team.members.push(newMember);
    team.updatedAt = now;
    this.userTeams.set(user.id, teamId);

    console.log('チームに参加しました:', team);
    return team;
  }

  // チーム脱退
  static leaveTeam(teamId: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const memberIndex = team.members.findIndex(member => member.userId === user.id);
    if (memberIndex === -1) {
      throw new Error('チームに参加していません');
    }

    // リーダーの場合はチームを解散またはリーダーを変更
    if (team.members[memberIndex].role === 'leader') {
      if (team.members.length === 1) {
        // チーム解散
        this.teams.delete(teamId);
        this.userTeams.delete(user.id);
        console.log('チームを解散しました:', teamId);
        return;
      } else {
        // リーダーを次のメンバーに変更
        const nextLeader = team.members.find(member => member.userId !== user.id);
        if (nextLeader) {
          nextLeader.role = 'leader';
          nextLeader.permissions = {
            canInvite: true,
            canKick: true,
            canEditTeam: true,
            canStartBattle: true
          };
          team.leaderId = nextLeader.userId;
          team.leaderName = nextLeader.username;
        }
      }
    }

    team.members.splice(memberIndex, 1);
    team.updatedAt = new Date().toISOString();
    this.userTeams.delete(user.id);

    console.log('チームから脱退しました:', teamId);
  }

  // チーム取得
  static getTeam(teamId: string): Team | null {
    return this.teams.get(teamId) || null;
  }

  // ユーザーのチーム取得
  static getUserTeam(userId: string): Team | null {
    const teamId = this.userTeams.get(userId);
    if (!teamId) return null;
    return this.teams.get(teamId) || null;
  }

  // 利用可能なチーム一覧取得
  static getAvailableTeams(): Team[] {
    return Array.from(this.teams.values()).filter(team => 
      !team.isPrivate && team.members.length < team.maxMembers
    );
  }

  // チーム更新
  static updateTeam(teamId: string, updates: Partial<Team>): Team {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const updatedTeam = { ...team, ...updates, updatedAt: new Date().toISOString() };
    this.teams.set(teamId, updatedTeam);

    console.log('チームを更新しました:', updatedTeam);
    return updatedTeam;
  }

  // チームメンバー更新
  static updateTeamMember(teamId: string, userId: string, updates: Partial<TeamMember>): void {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const memberIndex = team.members.findIndex(member => member.userId === userId);
    if (memberIndex === -1) {
      throw new Error('メンバーが見つかりません');
    }

    team.members[memberIndex] = { ...team.members[memberIndex], ...updates };
    team.updatedAt = new Date().toISOString();

    console.log('チームメンバーを更新しました:', team.members[memberIndex]);
  }

  // チーム統計更新
  static updateTeamStats(teamId: string, battleResult: any): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const stats = team.battleStats;
    stats.totalBattles++;
    
    if (battleResult.won) {
      stats.wins++;
      stats.currentStreak++;
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    } else {
      stats.losses++;
      stats.currentStreak = 0;
    }

    stats.winRate = stats.totalBattles > 0 ? stats.wins / stats.totalBattles : 0;
    
    const newScore = battleResult.score || 0;
    stats.averageScore = (stats.averageScore * (stats.totalBattles - 1) + newScore) / stats.totalBattles;
    stats.bestScore = Math.max(stats.bestScore, newScore);

    team.updatedAt = new Date().toISOString();
    console.log('チーム統計を更新しました:', stats);
  }

  // チーム検索
  static searchTeams(query: string): Team[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.teams.values()).filter(team =>
      team.name.toLowerCase().includes(searchTerm) ||
      team.description.toLowerCase().includes(searchTerm) ||
      team.leaderName.toLowerCase().includes(searchTerm)
    );
  }

  // チーム一覧取得（ページネーション対応）
  static getTeams(page: number = 1, limit: number = 20): { teams: Team[]; total: number; hasMore: boolean } {
    const allTeams = Array.from(this.teams.values());
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      teams: allTeams.slice(startIndex, endIndex),
      total: allTeams.length,
      hasMore: endIndex < allTeams.length
    };
  }

  // チーム削除
  static deleteTeam(teamId: string): void {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    // 全メンバーのユーザーチーム情報を削除
    team.members.forEach(member => {
      this.userTeams.delete(member.userId);
    });

    this.teams.delete(teamId);
    console.log('チームを削除しました:', teamId);
  }

  // チームメンバーをキック
  static kickMember(teamId: string, userId: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const currentMember = team.members.find(member => member.userId === user.id);
    if (!currentMember || !currentMember.permissions.canKick) {
      throw new Error('メンバーをキックする権限がありません');
    }

    const memberIndex = team.members.findIndex(member => member.userId === userId);
    if (memberIndex === -1) {
      throw new Error('メンバーが見つかりません');
    }

    if (team.members[memberIndex].role === 'leader') {
      throw new Error('リーダーをキックすることはできません');
    }

    team.members.splice(memberIndex, 1);
    team.updatedAt = new Date().toISOString();
    this.userTeams.delete(userId);

    console.log('メンバーをキックしました:', userId);
  }

  // チーム招待
  static inviteToTeam(teamId: string, targetUserId: string): void {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const currentMember = team.members.find(member => member.userId === user.id);
    if (!currentMember || !currentMember.permissions.canInvite) {
      throw new Error('チームに招待する権限がありません');
    }

    if (team.members.length >= team.maxMembers) {
      throw new Error('チームの定員に達しています');
    }

    if (team.members.some(member => member.userId === targetUserId)) {
      throw new Error('既にチームに参加しています');
    }

    // 実際の実装では、ここで招待通知を送信
    console.log('チームに招待しました:', { teamId, targetUserId, invitedBy: user.id });
  }
}