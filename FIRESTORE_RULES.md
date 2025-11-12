# Firestore Security Rules

This file contains the security rules for the Firestore database.

## Rules Overview

### Groups Collection

- **Read (get)**: Any authenticated user can read a single group (needed for invite flow)
- **Read (list)**: Only participants can list groups they're part of
- **Create**: Authenticated users can create groups (must add themselves as participant)
- **Update**: Participants can update, OR users can add themselves via invite
- **Delete**: Only the group creator can delete

### Invite Links Collection

- **Read**: Public (anyone can read to validate links)
- **Create**: Only authenticated users who are the creator
- **Update**: Public (needed to increment usage count)
- **Delete**: Only the creator

### Messages Collection

- **Read**: Only group members can read messages
- **Create**: Authenticated group members can send messages (senderId must match auth.uid)
- **Update/Delete**: Not allowed (messages are immutable)

## Required Indexes

Firestore requires composite indexes for complex queries. These are defined in `firestore.indexes.json`:

### Groups Collection

- **Index 1**: `participants` (array-contains) + `createdAt` (descending)

### Messages Collection

- **Index 1**: `groupId` (ascending) + `isAnonymous` (ascending) + `createdAt` (descending)
- **Index 2** (for future pairing chat): `pairingId` (ascending) + `isAnonymous` (ascending) + `createdAt` (descending)

**Deploying indexes:**

```bash
firebase deploy --only firestore:indexes
```

Indexes are now version controlled in `firestore.indexes.json` and deploy automatically with your code!

## Deploying Rules

Deploy rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

Deploy everything (hosting + rules):

```bash
firebase deploy
```

## Testing Rules Locally

You can test rules locally before deploying:

```bash
firebase emulators:start --only firestore
```

## Common Issues

### "Missing or insufficient permissions"

- Check that the user is authenticated
- Verify the user has the required role (participant, creator, etc.)
- Make sure the data structure matches what the rules expect

### Rules not updating

- Wait a few seconds after deployment
- Clear browser cache
- Check Firebase Console to verify rules were deployed
