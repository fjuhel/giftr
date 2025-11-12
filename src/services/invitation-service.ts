import {
  collection,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { InviteLink } from '../models/invitation';

const INVITE_LINKS_COLLECTION = 'inviteLinks';

export class InvitationService {
  /**
   * Create a shareable invite link for a group
   */
  static async createInviteLink(
    groupId: string,
    userId: string,
    options?: {
      expiresInDays?: number;
      maxUses?: number;
    }
  ): Promise<string> {
    const linkData: Partial<Omit<InviteLink, 'id'>> = {
      groupId,
      createdBy: userId,
      createdAt: Date.now(),
      usedCount: 0,
    };

    // Only add optional fields if they are defined
    if (options?.expiresInDays) {
      linkData.expiresAt =
        Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000;
    }
    if (options?.maxUses !== undefined) {
      linkData.maxUses = options.maxUses;
    }

    const docRef = await addDoc(
      collection(db, INVITE_LINKS_COLLECTION),
      linkData
    );
    return docRef.id;
  }

  /**
   * Get invite link by ID
   */
  static async getInviteLink(linkId: string): Promise<InviteLink | null> {
    const docRef = doc(db, INVITE_LINKS_COLLECTION, linkId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as InviteLink;
  }

  /**
   * Validate and use an invite link
   */
  static async validateInviteLink(linkId: string): Promise<{
    valid: boolean;
    groupId?: string;
    reason?: string;
  }> {
    const link = await this.getInviteLink(linkId);

    if (!link) {
      return { valid: false, reason: 'Lien invalide' };
    }

    // Check expiration
    if (link.expiresAt && link.expiresAt < Date.now()) {
      return { valid: false, reason: 'Lien expiré' };
    }

    // Check max uses
    if (link.maxUses && link.usedCount >= link.maxUses) {
      return { valid: false, reason: 'Lien utilisé au maximum' };
    }

    return { valid: true, groupId: link.groupId };
  }

  /**
   * Increment invite link usage count
   */
  static async useInviteLink(linkId: string): Promise<void> {
    const docRef = doc(db, INVITE_LINKS_COLLECTION, linkId);
    const link = await this.getInviteLink(linkId);

    if (!link) {
      throw new Error('Invite link not found');
    }

    await updateDoc(docRef, {
      usedCount: link.usedCount + 1,
    });
  }

  /**
   * Get all invite links for a group
   */
  static async getGroupInviteLinks(groupId: string): Promise<InviteLink[]> {
    const q = query(
      collection(db, INVITE_LINKS_COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InviteLink[];
  }

  /**
   * Generate shareable URL for invite link
   */
  static generateInviteUrl(linkId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${linkId}`;
  }

  /**
   * Send email invitation (placeholder - implement with your email service)
   */
  static async sendEmailInvitation(
    email: string,
    groupName: string,
    inviterName: string,
    inviteUrl: string
  ): Promise<void> {
    // TODO: Implement with SendGrid, Firebase Functions, or your email service
    console.log('Send email to:', email);
    console.log('Group:', groupName);
    console.log('Inviter:', inviterName);
    console.log('URL:', inviteUrl);

    // For now, just copy to clipboard
    await navigator.clipboard.writeText(inviteUrl);
  }
}
