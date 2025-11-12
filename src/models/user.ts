export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  fcmToken?: string | null;
  fcmTokenUpdatedAt?: Date;
}

export interface CreateUserProfileData {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  fcmToken?: string | null;
}

export interface UpdateUserProfileData {
  displayName?: string | null;
  photoURL?: string | null;
  fcmToken?: string | null;
}
