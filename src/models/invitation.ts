// Invitation and group joining models

export interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  expiresAt?: number;
}

export interface InviteLink {
  id: string;
  groupId: string;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  maxUses?: number;
  usedCount: number;
}
