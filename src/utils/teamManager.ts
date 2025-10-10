// チーム管理システム
import { OfflineFirstManager } from './offlineFirstManager';

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  createdAt: string;
  isActive: boolean;
  problemId: string;
  maxMembers: number;
}

export interface TeamMember {
  userId: string;
  username: string;
  joinedAt: string;
  isReady: boolean;
  progress: number;
  currentStep: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export class TeamManager {
  private static readonly TEAMS_KEY = 'teams';
  private static readonly INVITES_KEY = 'team_invites';
  
  // チームを作成
  static createTeam(leaderId: string, leaderName: string, teamName: string, problemId: string): Team {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const team: Team = {
      id: teamId,
      name: teamName,
      leaderId,
      leaderName,
      members: [{
        userId: leaderId,
        username: leaderName,
        joinedAt: new Date().toISOString(),
        isReady: false,
        progress: 0,
        currentStep: 'data'
      }],
      createdAt: new Date().toISOString(),
      isActive: true,
      problemId,
      maxMembers: 5
    };
    
    // ローカルストレージに保存
    this.saveTeam(team);
    
    // オフラインファーストで保存
    OfflineFirstManager.saveData('team', team);
    
    console.log('チームを作成しました:', team);
    return team;
  }
  
  // チームに参加
  static joinTeam(teamId: string, userId: string, username: string): boolean {
    const team = this.getTeam(teamId);
    if (!team) {
      console.error('チームが見つかりません:', teamId);
      return false;
    }
    
    if (team.members.length >= team.maxMembers) {
      console.error('チームが満員です');
      return false;
    }
    
    if (team.members.some(member => member.userId === userId)) {
      console.error('既にチームに参加しています');
      return false;
    }
    
    const newMember: TeamMember = {
      userId,
      username,
      joinedAt: new Date().toISOString(),
      isReady: false,
      progress: 0,
      currentStep: 'data'
    };
    
    team.members.push(newMember);
    this.saveTeam(team);
    
    // オフラインファーストで更新
    OfflineFirstManager.saveData('team', team);
    
    console.log('チームに参加しました:', newMember);
    return true;
  }
  
  // チームから退出
  static leaveTeam(teamId: string, userId: string): boolean {
    const team = this.getTeam(teamId);
    if (!team) {
      console.error('チームが見つかりません:', teamId);
      return false;
    }
    
    const memberIndex = team.members.findIndex(member => member.userId === userId);
    if (memberIndex === -1) {
      console.error('チームメンバーではありません');
      return false;
    }
    
    team.members.splice(memberIndex, 1);
    
    // リーダーが退出した場合、新しいリーダーを選出
    if (team.leaderId === userId && team.members.length > 0) {
      team.leaderId = team.members[0].userId;
      team.leaderName = team.members[0].username;
    }
    
    // メンバーがいなくなった場合はチームを非アクティブに
    if (team.members.length === 0) {
      team.isActive = false;
    }
    
    this.saveTeam(team);
    
    // オフラインファーストで更新
    OfflineFirstManager.saveData('team', team);
    
    console.log('チームから退出しました:', userId);
    return true;
  }
  
  // チームを取得
  static getTeam(teamId: string): Team | null {
    const teams = this.getAllTeams();
    return teams.find(team => team.id === teamId) || null;
  }
  
  // ユーザーのチームを取得
  static getUserTeam(userId: string): Team | null {
    const teams = this.getAllTeams();
    return teams.find(team => 
      team.isActive && team.members.some(member => member.userId === userId)
    ) || null;
  }
  
  // 全チームを取得
  static getAllTeams(): Team[] {
    const stored = localStorage.getItem(this.TEAMS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  // チームを保存
  private static saveTeam(team: Team): void {
    const teams = this.getAllTeams();
    const existingIndex = teams.findIndex(t => t.id === team.id);
    
    if (existingIndex >= 0) {
      teams[existingIndex] = team;
    } else {
      teams.push(team);
    }
    
    localStorage.setItem(this.TEAMS_KEY, JSON.stringify(teams));
  }
  
  // チームメンバーの進捗を更新
  static updateMemberProgress(teamId: string, userId: string, progress: number, currentStep: string): void {
    const team = this.getTeam(teamId);
    if (!team) return;
    
    const member = team.members.find(m => m.userId === userId);
    if (member) {
      member.progress = progress;
      member.currentStep = currentStep;
      this.saveTeam(team);
      
      // オフラインファーストで更新
      OfflineFirstManager.saveData('team', team);
    }
  }
  
  // チームメンバーの準備状態を更新
  static updateMemberReady(teamId: string, userId: string, isReady: boolean): void {
    const team = this.getTeam(teamId);
    if (!team) return;
    
    const member = team.members.find(m => m.userId === userId);
    if (member) {
      member.isReady = isReady;
      this.saveTeam(team);
      
      // オフラインファーストで更新
      OfflineFirstManager.saveData('team', team);
    }
  }
  
  // チームの準備状態をチェック
  static isTeamReady(teamId: string): boolean {
    const team = this.getTeam(teamId);
    if (!team || team.members.length === 0) return false;
    
    return team.members.every(member => member.isReady);
  }
  
  // チーム招待を作成
  static createInvite(teamId: string, inviterId: string, inviterName: string, inviteeId: string, inviteeName: string): TeamInvite {
    const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24時間で期限切れ
    
    const invite: TeamInvite = {
      id: inviteId,
      teamId,
      inviterId,
      inviterName,
      inviteeId,
      inviteeName,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending'
    };
    
    // ローカルストレージに保存
    this.saveInvite(invite);
    
    // オフラインファーストで保存
    OfflineFirstManager.saveData('team_invite', invite);
    
    console.log('チーム招待を作成しました:', invite);
    return invite;
  }
  
  // チーム招待を取得
  static getInvites(userId: string): TeamInvite[] {
    const invites = this.getAllInvites();
    return invites.filter(invite => 
      invite.inviteeId === userId && 
      invite.status === 'pending' &&
      new Date(invite.expiresAt) > new Date()
    );
  }
  
  // チーム招待に応答
  static respondToInvite(inviteId: string, response: 'accepted' | 'declined'): boolean {
    const invites = this.getAllInvites();
    const invite = invites.find(i => i.id === inviteId);
    
    if (!invite) {
      console.error('招待が見つかりません:', inviteId);
      return false;
    }
    
    if (invite.status !== 'pending') {
      console.error('既に応答済みの招待です');
      return false;
    }
    
    if (new Date(invite.expiresAt) <= new Date()) {
      invite.status = 'expired';
      this.saveInvite(invite);
      console.error('招待の期限が切れています');
      return false;
    }
    
    invite.status = response;
    this.saveInvite(invite);
    
    if (response === 'accepted') {
      const success = this.joinTeam(invite.teamId, invite.inviteeId, invite.inviteeName);
      if (!success) {
        invite.status = 'pending'; // 失敗時は元に戻す
        this.saveInvite(invite);
        return false;
      }
    }
    
    console.log('チーム招待に応答しました:', response);
    return true;
  }
  
  // 全招待を取得
  private static getAllInvites(): TeamInvite[] {
    const stored = localStorage.getItem(this.INVITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  // 招待を保存
  private static saveInvite(invite: TeamInvite): void {
    const invites = this.getAllInvites();
    const existingIndex = invites.findIndex(i => i.id === invite.id);
    
    if (existingIndex >= 0) {
      invites[existingIndex] = invite;
    } else {
      invites.push(invite);
    }
    
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
  }
  
  // チーム統計を取得
  static getTeamStats(teamId: string): {
    totalMembers: number;
    readyMembers: number;
    averageProgress: number;
    teamProgress: number;
  } {
    const team = this.getTeam(teamId);
    if (!team) {
      return {
        totalMembers: 0,
        readyMembers: 0,
        averageProgress: 0,
        teamProgress: 0
      };
    }
    
    const totalMembers = team.members.length;
    const readyMembers = team.members.filter(m => m.isReady).length;
    const averageProgress = team.members.length > 0 
      ? team.members.reduce((sum, m) => sum + m.progress, 0) / team.members.length 
      : 0;
    const teamProgress = Math.min(averageProgress, 100);
    
    return {
      totalMembers,
      readyMembers,
      averageProgress,
      teamProgress
    };
  }
}



