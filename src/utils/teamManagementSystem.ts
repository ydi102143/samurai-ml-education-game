// チーム管理システム

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  createdAt: Date;
  isActive: boolean;
  maxMembers: number;
  currentMembers: number;
  teamCode: string; // 招待用コード
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'leader' | 'member';
  joinedAt: Date;
  isOnline: boolean;
  lastActivity: Date;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface TeamChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'achievement';
}

export class TeamManagementSystem {
  private static teams: Map<string, Team> = new Map();
  private static invitations: Map<string, TeamInvitation> = new Map();
  private static chatMessages: Map<string, TeamChatMessage[]> = new Map();

  // チーム作成
  static createTeam(
    leaderId: string,
    leaderName: string,
    teamName: string,
    description: string,
    maxMembers: number = 5
  ): Team {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const teamCode = this.generateTeamCode();
    
    const team: Team = {
      id: teamId,
      name: teamName,
      description,
      leaderId,
      leaderName,
      members: [{
        id: leaderId,
        name: leaderName,
        role: 'leader',
        joinedAt: new Date(),
        isOnline: true,
        lastActivity: new Date()
      }],
      createdAt: new Date(),
      isActive: true,
      maxMembers,
      currentMembers: 1,
      teamCode
    };

    this.teams.set(teamId, team);
    this.chatMessages.set(teamId, []);
    
    // システムメッセージを追加
    this.addSystemMessage(teamId, `${leaderName}がチーム「${teamName}」を作成しました`);
    
    return team;
  }

  // チーム参加
  static joinTeam(teamCode: string, userId: string, userName: string): { success: boolean; team?: Team; message: string } {
    const team = Array.from(this.teams.values()).find(t => t.teamCode === teamCode);
    
    if (!team) {
      return { success: false, message: 'チームコードが無効です' };
    }
    
    if (!team.isActive) {
      return { success: false, message: 'チームが無効です' };
    }
    
    if (team.currentMembers >= team.maxMembers) {
      return { success: false, message: 'チームが満員です' };
    }
    
    if (team.members.some(m => m.id === userId)) {
      return { success: false, message: '既にチームのメンバーです' };
    }

    const newMember: TeamMember = {
      id: userId,
      name: userName,
      role: 'member',
      joinedAt: new Date(),
      isOnline: true,
      lastActivity: new Date()
    };

    team.members.push(newMember);
    team.currentMembers++;
    
    this.addSystemMessage(team.id, `${userName}がチームに参加しました`);
    
    return { success: true, team, message: 'チームに参加しました' };
  }

  // チーム脱退
  static leaveTeam(teamId: string, userId: string): { success: boolean; message: string } {
    const team = this.teams.get(teamId);
    
    if (!team) {
      return { success: false, message: 'チームが見つかりません' };
    }
    
    const member = team.members.find(m => m.id === userId);
    if (!member) {
      return { success: false, message: 'チームのメンバーではありません' };
    }
    
    if (member.role === 'leader') {
      // リーダーの場合、チームを解散するか新しいリーダーを選ぶ
      if (team.members.length === 1) {
        this.teams.delete(teamId);
        this.chatMessages.delete(teamId);
        return { success: true, message: 'チームを解散しました' };
      } else {
        // 最初のメンバーを新しいリーダーにする
        const newLeader = team.members.find(m => m.id !== userId);
        if (newLeader) {
          newLeader.role = 'leader';
          team.leaderId = newLeader.id;
          team.leaderName = newLeader.name;
        }
      }
    }
    
    team.members = team.members.filter(m => m.id !== userId);
    team.currentMembers--;
    
    this.addSystemMessage(teamId, `${member.name}がチームを脱退しました`);
    
    return { success: true, message: 'チームを脱退しました' };
  }

  // チーム取得
  static getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  // ユーザーのチーム取得
  static getUserTeam(userId: string): Team | undefined {
    return Array.from(this.teams.values()).find(team => 
      team.members.some(member => member.id === userId)
    );
  }

  // 利用可能なチーム一覧取得
  static getAvailableTeams(): Team[] {
    return Array.from(this.teams.values())
      .filter(team => team.isActive && team.currentMembers < team.maxMembers)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // チーム招待作成
  static createInvitation(
    teamId: string,
    inviterId: string,
    inviterName: string,
    inviteeId: string,
    inviteeName: string
  ): TeamInvitation {
    const invitation: TeamInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      teamName: this.teams.get(teamId)?.name || '',
      inviterId,
      inviterName,
      inviteeId,
      inviteeName,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
    };

    this.invitations.set(invitation.id, invitation);
    return invitation;
  }

  // 招待応答
  static respondToInvitation(
    invitationId: string,
    response: 'accepted' | 'declined'
  ): { success: boolean; message: string; team?: Team } {
    const invitation = this.invitations.get(invitationId);
    
    if (!invitation) {
      return { success: false, message: '招待が見つかりません' };
    }
    
    if (invitation.status !== 'pending') {
      return { success: false, message: '既に応答済みです' };
    }
    
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      return { success: false, message: '招待が期限切れです' };
    }
    
    invitation.status = response;
    
    if (response === 'accepted') {
      const result = this.joinTeam(
        this.teams.get(invitation.teamId)?.teamCode || '',
        invitation.inviteeId,
        invitation.inviteeName
      );
      
      if (result.success) {
        return { success: true, message: 'チームに参加しました', team: result.team };
      } else {
        return { success: false, message: result.message };
      }
    }
    
    return { success: true, message: '招待を辞退しました' };
  }

  // チームチャットメッセージ送信
  static sendTeamMessage(
    teamId: string,
    senderId: string,
    senderName: string,
    message: string
  ): { success: boolean; message: string } {
    const team = this.teams.get(teamId);
    
    if (!team) {
      return { success: false, message: 'チームが見つかりません' };
    }
    
    if (!team.members.some(m => m.id === senderId)) {
      return { success: false, message: 'チームのメンバーではありません' };
    }
    
    const chatMessage: TeamChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      senderId,
      senderName,
      message,
      timestamp: new Date(),
      type: 'text'
    };
    
    const messages = this.chatMessages.get(teamId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(teamId, messages);
    
    return { success: true, message: 'メッセージを送信しました' };
  }

  // チームチャットメッセージ取得
  static getTeamMessages(teamId: string, limit: number = 50): TeamChatMessage[] {
    const messages = this.chatMessages.get(teamId) || [];
    return messages.slice(-limit);
  }

  // システムメッセージ追加
  private static addSystemMessage(teamId: string, message: string): void {
    const systemMessage: TeamChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      senderId: 'system',
      senderName: 'システム',
      message,
      timestamp: new Date(),
      type: 'system'
    };
    
    const messages = this.chatMessages.get(teamId) || [];
    messages.push(systemMessage);
    this.chatMessages.set(teamId, messages);
  }

  // チームコード生成
  private static generateTeamCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // メンバーオンライン状態更新
  static updateMemberStatus(teamId: string, userId: string, isOnline: boolean): void {
    const team = this.teams.get(teamId);
    if (team) {
      const member = team.members.find(m => m.id === userId);
      if (member) {
        member.isOnline = isOnline;
        member.lastActivity = new Date();
      }
    }
  }

  // チーム統計取得
  static getTeamStats(teamId: string): {
    totalMembers: number;
    onlineMembers: number;
    totalMessages: number;
    teamAge: number; // 日数
  } {
    const team = this.teams.get(teamId);
    const messages = this.chatMessages.get(teamId) || [];
    
    if (!team) {
      return { totalMembers: 0, onlineMembers: 0, totalMessages: 0, teamAge: 0 };
    }
    
    const onlineMembers = team.members.filter(m => m.isOnline).length;
    const teamAge = Math.floor((Date.now() - team.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalMembers: team.currentMembers,
      onlineMembers,
      totalMessages: messages.length,
      teamAge
    };
  }
}
