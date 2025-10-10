import { SimpleTeam, SimpleTeamMember } from '../types/simpleBattle';
import { userManager } from './userManager';

export class SimpleTeamManager {
  private static teams: Map<string, SimpleTeam> = new Map();
  private static userTeams: Map<string, string> = new Map(); // userId -> teamId

  // チーム作成
  static createTeam(name: string, description: string, maxMembers: number = 5): SimpleTeam {
    const user = userManager.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const team: SimpleTeam = {
      id: teamId,
      name,
      leaderId: user.id,
      leaderName: user.username,
      members: [{
        userId: user.id,
        username: user.username,
        joinedAt: now,
        isReady: false,
        role: 'leader'
      }],
      maxMembers,
      description,
      createdAt: now
    };

    this.teams.set(teamId, team);
    this.userTeams.set(user.id, teamId);

    console.log('チームを作成しました:', team);
    return team;
  }

  // チーム参加
  static joinTeam(teamId: string): SimpleTeam {
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
    const newMember: SimpleTeamMember = {
      userId: user.id,
      username: user.username,
      joinedAt: now,
      isReady: false,
      role: 'member'
    };

    team.members.push(newMember);
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
          team.leaderId = nextLeader.userId;
          team.leaderName = nextLeader.username;
        }
      }
    }

    team.members.splice(memberIndex, 1);
    this.userTeams.delete(user.id);

    console.log('チームから脱退しました:', teamId);
  }

  // チーム取得
  static getTeam(teamId: string): SimpleTeam | null {
    return this.teams.get(teamId) || null;
  }

  // ユーザーのチーム取得
  static getUserTeam(userId: string): SimpleTeam | null {
    const teamId = this.userTeams.get(userId);
    if (!teamId) return null;
    return this.teams.get(teamId) || null;
  }

  // 利用可能なチーム一覧取得
  static getAvailableTeams(): SimpleTeam[] {
    return Array.from(this.teams.values()).filter(team => 
      team.members.length < team.maxMembers
    );
  }

  // チームメンバー更新
  static updateTeamMember(teamId: string, userId: string, updates: Partial<SimpleTeamMember>): void {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error('チームが見つかりません');
    }

    const memberIndex = team.members.findIndex(member => member.userId === userId);
    if (memberIndex === -1) {
      throw new Error('メンバーが見つかりません');
    }

    team.members[memberIndex] = { ...team.members[memberIndex], ...updates };
    console.log('チームメンバーを更新しました:', team.members[memberIndex]);
  }

  // チーム検索
  static searchTeams(query: string): SimpleTeam[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.teams.values()).filter(team =>
      team.name.toLowerCase().includes(searchTerm) ||
      team.description.toLowerCase().includes(searchTerm) ||
      team.leaderName.toLowerCase().includes(searchTerm)
    );
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
}

