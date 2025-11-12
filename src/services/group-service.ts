import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Group, CreateGroupData } from '../models/group';

const GROUPS_COLLECTION = 'groups';

export class GroupService {
  /**
   * Create a new Secret Santa group
   */
  static async createGroup(
    userId: string,
    data: CreateGroupData
  ): Promise<string> {
    const groupData = {
      name: data.name,
      description: data.description || '',
      budget: data.budget,
      eventDate: data.eventDate,
      createdBy: userId,
      createdAt: Date.now(),
      participants: [userId], // Creator is automatically a participant
      isDrawn: false,
      status: 'pending' as const,
    };

    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);
    return docRef.id;
  }

  /**
   * Get all groups where user is a participant
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Group[];
  }

  /**
   * Get a single group by ID
   */
  static async getGroup(groupId: string): Promise<Group | null> {
    const docRef = doc(db, GROUPS_COLLECTION, groupId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Group;
  }

  /**
   * Update group details
   */
  static async updateGroup(
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'createdBy' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(db, GROUPS_COLLECTION, groupId);
    await updateDoc(docRef, updates);
  }

  /**
   * Add a participant to a group
   */
  static async addParticipant(groupId: string, userId: string): Promise<void> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.participants.includes(userId)) {
      throw new Error('User already in group');
    }

    const participants = [...group.participants, userId];
    await this.updateGroup(groupId, { participants });
  }

  /**
   * Remove a participant from a group
   */
  static async removeParticipant(
    groupId: string,
    userId: string
  ): Promise<void> {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const participants = group.participants.filter((id) => id !== userId);
    await this.updateGroup(groupId, { participants });
  }

  /**
   * Mark group as drawn
   */
  static async markAsDrawn(groupId: string): Promise<void> {
    await this.updateGroup(groupId, {
      isDrawn: true,
      status: 'active',
    });
  }

  /**
   * Mark group as completed
   */
  static async markAsCompleted(groupId: string): Promise<void> {
    await this.updateGroup(groupId, {
      status: 'completed',
    });
  }

  /**
   * Delete a group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    const docRef = doc(db, GROUPS_COLLECTION, groupId);
    await deleteDoc(docRef);
  }

  /**
   * Check if user is the creator of a group
   */
  static async isCreator(groupId: string, userId: string): Promise<boolean> {
    const group = await this.getGroup(groupId);
    return group?.createdBy === userId;
  }
}
