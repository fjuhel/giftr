// Firebase Cloud Messaging Service Worker
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

// Initialize Firebase in the service worker
// These values are injected at build time from environment variables
firebase.initializeApp({
  apiKey: '__FIREBASE_API_KEY__',
  authDomain: '__FIREBASE_AUTH_DOMAIN__',
  projectId: '__FIREBASE_PROJECT_ID__',
  storageBucket: '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId: '__FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

// Track recently shown notifications to prevent duplicates
const recentNotifications = new Map();
const DUPLICATE_WINDOW_MS = 2000; // 2 seconds

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Background message received:', payload);
  console.log('[FCM-SW] Notification permission:', Notification.permission);

  const messageId = payload.data?.messageId || payload.messageId;

  // Check if we already showed this notification recently
  if (messageId && recentNotifications.has(messageId)) {
    const lastShown = recentNotifications.get(messageId);
    const timeSinceLastShown = Date.now() - lastShown;

    if (timeSinceLastShown < DUPLICATE_WINDOW_MS) {
      console.log(
        `[FCM-SW] Skipping duplicate notification (shown ${timeSinceLastShown}ms ago)`
      );
      return Promise.resolve();
    }
  }

  // Check if any window is currently focused
  // If so, let the foreground handler deal with it
  return clients
    .matchAll({ type: 'window', includeUnaffected: true })
    .then((windowClients) => {
      const hasFocusedWindow = windowClients.some((client) => client.focused);

      if (hasFocusedWindow) {
        console.log(
          '[FCM-SW] Window is focused, skipping background notification'
        );
        return Promise.resolve();
      }

      console.log('[FCM-SW] No focused window, showing notification');

      // Mark this notification as shown
      if (messageId) {
        recentNotifications.set(messageId, Date.now());

        // Clean up old entries after the duplicate window
        setTimeout(() => {
          recentNotifications.delete(messageId);
        }, DUPLICATE_WINDOW_MS + 1000);
      }

      const notificationTitle =
        payload.notification?.title || 'Nouvelle notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: messageId || 'default-tag',
        requireInteraction: false,
        data: {
          url: payload.data?.url || '/',
          messageId: messageId,
        },
      };

      return self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM-SW] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUnaffected: true })
      .then((windowClients) => {
        // Check if there's already a window open with our app
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((client) => {
              if (urlToOpen !== '/') {
                return client.navigate(urlToOpen);
              }
              return client;
            });
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[FCM-SW] Service worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[FCM-SW] Service worker installed');
  self.skipWaiting();
});

// Handle push events (backup for onBackgroundMessage)
self.addEventListener('push', (event) => {
  console.log('[FCM-SW] Push event received:', event);

  if (!event.data) {
    console.log('[FCM-SW] Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('[FCM-SW] Push payload:', payload);
  } catch (error) {
    console.error('[FCM-SW] Error parsing push data:', error);
  }
});
