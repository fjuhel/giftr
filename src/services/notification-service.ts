import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from 'firebase/messaging';
import { app } from '../firebase';

class NotificationService {
  private messaging: Messaging | null = null;
  private vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  async initialize(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.messaging = getMessaging(app);

      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('[Notification] Foreground message received:', payload);

        // Don't show notification if we're in the group chat (user is actively viewing)
        // The message will appear in real-time via Firestore listener
        // Also prevents duplicate notifications when user is looking at the chat
        const currentPath = window.location.pathname;
        const groupId = payload.data?.groupId;

        if (groupId && currentPath.includes(`/group/${groupId}`)) {
          console.log(
            '[Notification] Skipping - user is viewing this group chat'
          );
          return;
        }

        // Get notification content from data field (data-only message)
        const title =
          payload.data?.title || payload.notification?.title || 'New message';
        const body = payload.data?.body || payload.notification?.body || '';

        // Show notification when app is in foreground but user is on different page
        this.showNotification(title, body, payload.data);
      });
    } catch (error) {
      console.error('Error initializing messaging:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async getNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize();
    }

    if (!this.messaging || !this.vapidKey) {
      console.error('Messaging not initialized or VAPID key missing');
      return null;
    }

    const permission = await this.getNotificationPermission();
    if (permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return null;
      }
    }

    try {
      const currentToken = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  private showNotification(title: string, body: string, data?: any): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: data?.groupId || 'giftr-notification',
      data,
      requireInteraction: false,
    };

    // Use Service Worker notification if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      // Fallback to regular notification
      new Notification(title, options);
    }
  }

  async sendNotificationToGroup(
    groupId: string,
    senderName: string,
    messageText: string,
    excludeUserId: string
  ): Promise<void> {
    // This would be called from a Cloud Function
    // Frontend can't send notifications directly for security
    console.log('Notification would be sent via Cloud Function:', {
      groupId,
      senderName,
      messageText,
      excludeUserId,
    });
  }
}

export const notificationService = new NotificationService();
