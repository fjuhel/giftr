// Firestore data models

export interface Group {
  id: string;
  name: string;
  description?: string;
  budget: number;
  eventDate: string;
  createdBy: string;
  createdAt: number;
  participants: string[]; // Array of user IDs
  isDrawn: boolean;
  status: 'pending' | 'active' | 'completed';
}

export interface CreateGroupData {
  name: string;
  description?: string;
  budget: number;
  eventDate: string;
}

export interface Participant {
  userId: string;
  email: string;
  displayName?: string;
  joinedAt: number;
  assignedTo?: string; // User ID of person they're giving to (after draw)
  wishlist?: string;
}

export interface Draw {
  groupId: string;
  drawnAt: number;
  drawnBy: string;
  assignments: Record<string, string>; // { giverId: receiverId }
}
