import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Message, CreateMessageData } from '../models/message';

const MESSAGES_COLLECTION = 'messages';

export class MessageService {
  /**
   * Send a message to a group chat
   */
  static async sendMessage(data: CreateMessageData): Promise<string> {
    const messageData = {
      groupId: data.groupId,
      senderId: data.senderId,
      senderName: data.senderName,
      text: data.text.trim(),
      createdAt: Date.now(),
      isAnonymous: data.isAnonymous || false,
      ...(data.pairingId && { pairingId: data.pairingId }),
    };

    const docRef = await addDoc(
      collection(db, MESSAGES_COLLECTION),
      messageData
    );
    return docRef.id;
  }

  /**
   * Subscribe to group messages in real-time
   */
  static subscribeToGroupMessages(
    groupId: string,
    callback: (messages: Message[]) => void,
    messageLimit: number = 100
  ): Unsubscribe {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('groupId', '==', groupId),
      where('isAnonymous', '==', false),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      // Reverse to show oldest first
      callback(messages.reverse());
    });
  }

  /**
   * Subscribe to pairing messages (for future anonymous chat)
   */
  static subscribeToPairingMessages(
    pairingId: string,
    callback: (messages: Message[]) => void,
    messageLimit: number = 100
  ): Unsubscribe {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('pairingId', '==', pairingId),
      where('isAnonymous', '==', true),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      callback(messages.reverse());
    });
  }

  /**
   * Format timestamp for display
   */
  static formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }
}
