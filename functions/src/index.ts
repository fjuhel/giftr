import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Cloud Function triggered when a new message is created
 * Sends push notifications to all group members except the sender
 */
export const sendMessageNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    if (!message) {
      console.log('No message data found');
      return null;
    }

    // Skip notifications for anonymous messages (future feature)
    if (message.isAnonymous) {
      console.log('Skipping notification for anonymous message');
      return null;
    }

    try {
      // Get group data
      const groupDoc = await admin
        .firestore()
        .collection('groups')
        .doc(message.groupId)
        .get();

      if (!groupDoc.exists) {
        console.log(`Group ${message.groupId} not found`);
        return null;
      }

      const groupData = groupDoc.data();
      const participants = groupData?.participants || [];

      console.log(
        `Processing notification for group ${groupData?.name} with ${participants.length} participants`
      );

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
        .map((doc) => doc.data()!.fcmToken)
        .filter((token): token is string => !!token);

      if (tokens.length === 0) {
        console.log('No FCM tokens found for group members');
        return null;
      }

      console.log(`Sending notification to ${tokens.length} devices`);

      // Prepare notification payload
      const messageText = message.text || '';
      const truncatedText =
        messageText.length > 100
          ? messageText.substring(0, 100) + '...'
          : messageText;

      // Send notifications using FCM v1 API (send to each token individually)
      // Use data-only messages to prevent Firebase from auto-showing notifications
      // This gives our service worker full control over notification display
      const sendPromises = tokens.map(async (token) => {
        try {
          await admin.messaging().send({
            token: token,
            // NO notification field - this prevents automatic display
            data: {
              // Move notification content to data
              title: `${message.senderName} in ${groupData?.name || 'group'}`,
              body: truncatedText,
              icon: '/icons/icon-192x192.png',
              // Message metadata
              groupId: message.groupId,
              messageId: context.params.messageId,
              type: 'group_message',
            },
            webpush: {
              fcmOptions: {
                link: `https://giftr.juhelfleury.fr/group/${message.groupId}`,
              },
            },
          });
          return { success: true, token };
        } catch (error: any) {
          console.error(`Failed to send to token ${token}:`, error.message);
          return { success: false, token, error };
        }
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `Notification sent: ${successCount} success, ${failureCount} failures`
      );

      // Clean up invalid tokens
      if (failureCount > 0) {
        const tokensToRemove: Promise<any>[] = [];

        results.forEach((result) => {
          if (!result.success && result.error) {
            console.error(
              'Failure sending notification to',
              result.token,
              result.error
            );

            // If the error is invalid token, remove it from Firestore
            if (
              result.error.code === 'messaging/invalid-registration-token' ||
              result.error.code ===
                'messaging/registration-token-not-registered'
            ) {
              // Find the user with this token
              const removePromise = admin
                .firestore()
                .collection('users')
                .where('fcmToken', '==', result.token)
                .get()
                .then((snapshot) => {
                  const batch = admin.firestore().batch();
                  snapshot.docs.forEach((doc) => {
                    batch.update(doc.ref, {
                      fcmToken: admin.firestore.FieldValue.delete(),
                    });
                  });
                  return batch.commit();
                });
              tokensToRemove.push(removePromise);
            }
          }
        });

        await Promise.all(tokensToRemove);
        console.log(`Removed ${tokensToRemove.length} invalid tokens`);
      }

      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

/**
 * Cloud Function to handle anonymous pairing messages (future)
 */
export const sendPairingNotification = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();

    // Only process anonymous pairing messages
    if (!message?.isAnonymous || !message?.pairingId) {
      return null;
    }

    // TODO: Implement anonymous notification logic
    // - Find the recipient in the pairing
    // - Send anonymous notification
    // - Don't reveal sender identity

    console.log('Anonymous pairing notification not yet implemented');
    return null;
  });
