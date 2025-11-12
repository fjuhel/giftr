# Testing Push Notifications (FCM)

## ✅ System Status

- **Cloud Functions**: ✅ Deployed and active
- **Hosting**: ✅ Deployed (latest version)
- **Firebase Plan**: ✅ Blaze (pay-as-you-go)
- **Service Worker**: ✅ FCM service worker active (`firebase-messaging-sw.js`)

## 📱 Testing Steps

### Prerequisites

1. **IMPORTANT**: **Clear all browser data** for the app before testing:

   - Open browser DevTools (F12)
   - Application tab → Clear storage → Clear site data
   - This ensures fresh FCM token registration

2. Use two different browsers/devices or two incognito windows

### Test 1: Desktop Browser (Chrome/Firefox/Edge)

#### Device 1 (Sender):

1. Go to https://giftr.juhelfleury.fr/
2. **Open browser console** (F12 → Console tab)
3. Log in with User A
4. Look for these console logs:
   ```
   [App] Setting up FCM notifications...
   [App] Current notification permission: default
   [App] Requesting notification permission...
   ```
5. **Click "Allow" on the notification permission popup**
6. Verify console shows:
   ```
   [App] Notification permission granted!
   FCM Token: <token>
   [App] FCM token saved successfully ✅
   ```
7. Navigate to a group chat

#### Device 2 (Receiver):

1. Go to https://giftr.juhelfleury.fr/
2. **Open browser console** (F12 → Console tab)
3. Log in with User B
4. **Click "Allow" on notification permission**
5. Verify console: `[App] FCM token saved successfully ✅`
6. Navigate to the **SAME group chat** as User A

#### Test the notification:

1. On Device 1, send a message in the group chat
2. **On Device 2**, you should see:
   - **If browser tab is active**: Foreground notification (top right)
   - **If browser tab is inactive/background**: System notification
   - Console log: `Foreground message received: ...`
3. Click the notification → should navigate to the group chat

### Test 2: Mobile PWA (Android)

#### Setup:

1. Open https://giftr.juhelfleury.fr/ in Chrome (Android)
2. Tap "Install app" or menu → "Add to Home Screen"
3. Open the installed PWA
4. Log in
5. **Grant notification permission** when prompted
6. Verify console (use remote debugging): `[App] FCM token saved successfully ✅`

#### Test:

1. Send a message from another device/browser
2. **Close the PWA completely** (swipe away from recent apps)
3. Send another message
4. **Should receive notification even when app is closed** ✅
5. Tap notification → app opens to the group chat

### Test 3: Mobile PWA (iOS) - **CRITICAL**

#### iOS Limitations:

- **iOS 16.4+** supports web push notifications (finally!)
- Requires **PWA installed** to Home Screen
- Only works with **APNS** through Firebase

#### Setup:

1. Open https://giftr.juhelfleury.fr/ in Safari (iOS)
2. Tap Share → "Add to Home Screen"
3. Open the installed app from Home Screen
4. Log in
5. **Grant notification permission**

#### Test:

1. Send message from another device
2. **Lock iPhone** or go to home screen
3. Should receive notification ✅

**Note**: iOS web push is finnicky. If it doesn't work:

- Make sure iOS is 16.4+
- Try uninstalling and reinstalling the PWA
- Check Safari settings → Notifications → Allow notifications

### Test 4: Background Notifications

1. Log in and grant permission
2. **Close the browser tab/window**
3. Send a message from another device
4. **Should receive OS-level notification** ✅
5. Click notification → opens browser to the group chat

## 🔍 Debugging

### Check FCM Tokens in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/project/giftr-15e74/firestore)
2. Navigate to `users` collection
3. Click on a user document
4. Verify fields:
   - `fcmToken`: Should have a long token string
   - `fcmTokenUpdatedAt`: Should have a recent timestamp

### Check Cloud Function Logs

```bash
cd /Users/fjuhel/projects/private/giftr
firebase functions:log
```

Look for:

- ✅ `Processing notification for group <name> with <N> participants`
- ✅ `Sent notification to <N> users`
- ❌ `No FCM tokens found for group members` (means users haven't granted permission)
- ❌ `Error sending notification` (check error details)

### Common Issues

#### "No FCM tokens found"

- **Cause**: User hasn't logged in or granted permission
- **Fix**: Log in, click "Allow" on notification popup, check console for success

#### "Permission denied"

- **Cause**: User clicked "Block" on notification popup
- **Fix**:
  - Chrome: Settings → Privacy → Site Settings → Notifications → Find site → Allow
  - Firefox: URL bar → 🔒 → Permissions → Notifications → Allow

#### "Service worker not registered"

- **Cause**: Service worker failed to register
- **Fix**: Hard refresh (Ctrl+Shift+R), check console for errors

#### Notifications not showing on iOS

- **Cause**: Multiple possibilities
  - iOS < 16.4 (not supported)
  - Not installed as PWA
  - Safari notification settings disabled
- **Fix**:
  - Update iOS to 16.4+
  - Install to Home Screen
  - Settings → Safari → Advanced → Web Inspector (for debugging)

## 📊 Success Criteria

✅ Console shows "FCM token saved successfully"
✅ Firestore user document has `fcmToken` field
✅ Cloud Function logs show "Sent notification to X users"
✅ Notification appears on receiver's device
✅ Clicking notification navigates to correct group
✅ Notifications work when app is closed (background)
✅ Notifications work on mobile PWA (Android)
✅ Notifications work on iOS 16.4+ PWA

## 🎯 Next Steps After Testing

Once notifications work:

1. **Optimize**: Batch notifications, debounce rapid messages
2. **User Settings**: Allow users to mute specific groups
3. **Rich Notifications**: Add images, actions (Reply, Mark as Read)
4. **Draw Notification**: Implement `sendPairingNotification` for Secret Santa draws
5. **Analytics**: Track notification delivery rates

## 💡 Tips

- Always test with **console open** for debugging
- Use **two different user accounts** for accurate testing
- Test on **real mobile devices** (not just desktop responsive mode)
- **Clear browser data** between test runs to ensure fresh state
- Monitor **Firebase billing** (Blaze plan usage)

---

**Current Status**: All infrastructure deployed and ready for testing! 🚀
