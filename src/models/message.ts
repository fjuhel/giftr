export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  isAnonymous?: boolean; // For future anonymous pairing chat
  pairingId?: string; // For future pairing-specific messages
}

export interface CreateMessageData {
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  isAnonymous?: boolean;
  pairingId?: string;
}
