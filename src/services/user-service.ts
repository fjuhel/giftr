import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '../models/user';

// Re-export UserProfile for convenience
export type { UserProfile };

export class UserService {
  /**
   * Save or update FCM token for current user in Firestore
   */
  static async saveFCMToken(token: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      await setDoc(
        userRef,
        {
          fcmToken: token,
          fcmTokenUpdatedAt: serverTimestamp(),
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  /**
   * Get user profile by UID from Firestore (if available) or Auth
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    // Try to get from Firestore first
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          fcmToken: data.fcmToken,
          fcmTokenUpdatedAt: data.fcmTokenUpdatedAt?.toDate(),
        };
      }
    } catch (error) {
      console.error('Error fetching user from Firestore:', error);
    }

    // Fallback to current user from Auth
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      };
    }

    // Return basic info if not found
    return {
      uid,
      email: null,
      displayName: `User ${uid.slice(0, 6)}`,
      photoURL: null,
    };
  }

  /**
   * Get multiple user profiles by UIDs
   */
  static async getUserProfiles(
    uids: string[]
  ): Promise<Map<string, UserProfile>> {
    const profiles = new Map<string, UserProfile>();

    await Promise.all(
      uids.map(async (uid) => {
        const profile = await this.getUserProfile(uid);
        if (profile) {
          profiles.set(uid, profile);
        }
      })
    );

    return profiles;
  }

  /**
   * Get display name for a user (email or displayName or fallback)
   */
  static getDisplayName(profile: UserProfile): string {
    return (
      profile.displayName || profile.email || `User ${profile.uid.slice(0, 6)}`
    );
  }

  /**
   * Get initials from name or email
   */
  static getInitials(profile: UserProfile): string {
    const name = profile.displayName || profile.email || 'U';
    return name
      .split(/[\s@]/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
