# Push Notifications Setup - Giftr

## Overview

Giftr uses Firebase Cloud Messaging (FCM) to send push notifications to users when:

- New messages are posted in group chats
- Future: Anonymous messages in Secret Santa pairings
- Future: Draw results, event reminders

Notifications work on:

- **PWA (Mobile)**: Full notification support with badge, vibration
- **Desktop browsers**: Chrome, Firefox, Safari (with permission)
- **Background**: Notifications appear even when app is closed

## Architecture

### Components

1. **NotificationService** (`src/services/notification-service.ts`)

   - Manages FCM token registration
   - Requests notification permissions
   - Handles foreground messages
   - Shows local notifications

2. **Firebase Messaging Service Worker** (`public/firebase-messaging-sw.js`)

   - Receives background push notifications
   - Shows notifications when app is closed
   - Handles notification clicks (navigates to group)

3. **UserService** (`src/services/user-service.ts`)

   - Saves FCM tokens to Firestore (`users` collection)
   - Associates tokens with user profiles

4. **Cloud Function** (Future - see below)
   - Sends push notifications to group members
   - Triggered when new message is created

## Setup Instructions

### 1. Get Firebase VAPID Key

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a new key pair
3. Copy the "Key pair" value (starts with `B...`)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
VITE_FIREBASE_VAPID_KEY=BAbcd1234567890...your_vapid_key_here
```

### 3. Update Service Worker

Edit `public/firebase-messaging-sw.js` with your Firebase config:

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
});
```

### 4. Deploy Firestore Rules

The `users` collection rules are already configured:

```bash
firebase deploy --only firestore:rules
```

### 5. Test Notifications

1. Start the app: `yarn dev`
2. Log in (notification permission will be requested)
3. Check browser console for "FCM token saved successfully"
4. Open a group and send a message
5. Currently: No push sent (need Cloud Function)

## Firebase Cloud Function (Required for Production)

Push notifications can't be sent directly from the frontend for security. You need a Cloud Function:

### Install Firebase Functions

```bash
cd functions  # or create this directory
yarn add firebase-functions firebase-admin
yarn add -D typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-google
```

### Create Cloud Function

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    // Get group data
    const groupDoc = await admin
      .firestore()
      .collection('groups')
      .doc(message.groupId)
      .get();

    if (!groupDoc.exists) return null;

    const groupData = groupDoc.data();
    const participants = groupData?.participants || [];

    // Get FCM tokens for all participants except sender
    const userDocs = await Promise.all(
      participants
        .filter((uid: string) => uid !== message.senderId)
        .map((uid: string) =>
          admin.firestore().collection('users').doc(uid).get()
        )
    );

    const tokens = userDocs
      .filter((doc) => doc.exists && doc.data()?.fcmToken)
      .map((doc) => doc.data()!.fcmToken);

    if (tokens.length === 0) return null;

    // Send notification
    const payload = {
      notification: {
        title: `${message.senderName} in ${groupData?.name}`,
        body: message.text.substring(0, 100),
        icon: '/icons/icon-192x192.png',
      },
      data: {
        groupId: message.groupId,
        messageId: context.params.messageId,
      },
    };

    return admin.messaging().sendToDevice(tokens, payload);
  });
```

### Deploy Cloud Function

```bash
firebase deploy --only functions
```

## How It Works

### 1. User Login Flow

1. User logs in
2. `gr-app-component.ts` calls `setupNotifications()`
3. Permission is requested (if not already granted)
4. FCM token is retrieved from Firebase
5. Token is saved to Firestore `users/{uid}` collection

### 2. Message Sent Flow

1. User sends message in group chat
2. Message created in Firestore `messages` collection
3. Cloud Function triggered by `onCreate`
4. Function fetches all group participants' FCM tokens
5. Function sends push notification to all tokens (except sender)

### 3. Notification Received

**App in Foreground:**

- `onMessage()` in `notification-service.ts` receives notification
- Shows local notification using `showNotification()`

**App in Background/Closed:**

- `firebase-messaging-sw.js` receives push
- Service Worker shows notification
- User clicks notification → navigates to group page

## Permission States

- **default**: Permission not yet requested
- **granted**: User allowed notifications ✅
- **denied**: User blocked notifications ❌

The app handles all three states gracefully.

## Testing

### Test Foreground Notifications

1. Open app, log in
2. Keep app window focused
3. Send a message from another user/device
4. Notification should appear (requires Cloud Function)

### Test Background Notifications

1. Open app, log in
2. Minimize or close browser tab
3. Send a message from another user/device
4. System notification should appear
5. Click notification → app opens to group

### Test Permission Flow

1. Open app in incognito mode
2. Log in
3. Browser should request notification permission
4. Accept → FCM token saved
5. Deny → No token, graceful fallback

## Browser Compatibility

| Browser | Desktop | Mobile | Notes              |
| ------- | ------- | ------ | ------------------ |
| Chrome  | ✅      | ✅     | Full support       |
| Firefox | ✅      | ✅     | Full support       |
| Safari  | ✅      | ✅     | iOS 16.4+ required |
| Edge    | ✅      | ✅     | Chromium-based     |

## Security

- **FCM tokens** are stored in Firestore with proper security rules
- Only authenticated users can save tokens
- Users can only read/write their own tokens
- Cloud Functions validate group membership before sending
- No user can send notifications directly (server-side only)

## Troubleshooting

### "Messaging is not supported in this browser"

- Check if running on HTTPS (required for notifications)
- Localhost is allowed for development

### "Permission denied"

- User must manually enable in browser settings
- Chrome: Settings → Privacy → Notifications
- Firefox: Preferences → Privacy → Notifications

### "No FCM token"

- Check VAPID key is set in `.env`
- Verify Service Worker is registered
- Check browser console for errors

### Notifications not received

- Verify Cloud Function is deployed
- Check Cloud Function logs: `firebase functions:log`
- Ensure users have FCM tokens saved in Firestore
- Test with Firebase Console → Cloud Messaging → Send test message

## Future Enhancements

- [ ] Anonymous pairing notifications
- [ ] Draw complete notifications
- [ ] Event reminder notifications
- [ ] Notification preferences in user settings
- [ ] Rich notifications with images
- [ ] Action buttons in notifications
- [ ] Notification history/inbox

## Deployment Checklist

- [ ] Set `VITE_FIREBASE_VAPID_KEY` in production `.env`
- [ ] Update `firebase-messaging-sw.js` with production Firebase config
- [ ] Deploy Firestore rules: `yarn deploy:rules`
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Test notifications in production
- [ ] Monitor Cloud Function logs for errors

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
