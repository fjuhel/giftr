# Group Creation Feature

## Overview

Users can now create Secret Santa groups and they are persisted in Firestore!

## What Was Implemented

### 1. **Data Models** (`src/models/group.ts`)

- `Group` - Main group interface with all properties
- `CreateGroupData` - Form data for creating new groups
- `Participant` - Participant information (ready for future use)
- `Draw` - Draw results structure (ready for future use)

### 2. **Firestore Service** (`src/services/group-service.ts`)

Provides all CRUD operations for groups:

- ✅ `createGroup()` - Create new group
- ✅ `getUserGroups()` - Get all groups for a user
- ✅ `getGroup()` - Get single group by ID
- ✅ `updateGroup()` - Update group details
- ✅ `addParticipant()` - Add user to group
- ✅ `removeParticipant()` - Remove user from group
- ✅ `markAsDrawn()` - Mark group as drawn
- ✅ `markAsCompleted()` - Mark group as completed
- ✅ `deleteGroup()` - Delete a group
- ✅ `isCreator()` - Check if user created the group

### 3. **Create Group Modal** (`src/components/gr-create-group-modal.ts`)

Beautiful modal for creating groups with:

- Form fields: Name, Description, Budget, Event Date
- Real-time validation
- Loading states
- Error handling
- Responsive design
- Accessible keyboard navigation

### 4. **Updated Dashboard** (`src/components/gr-dashboard.ts`)

Now loads real groups from Firestore:

- Loads groups on mount
- Shows loading state
- Displays actual group data
- Opens modal to create new groups
- Refreshes list after creation

## Firestore Structure

```
groups/
  {groupId}/
    name: string
    description: string (optional)
    budget: number
    eventDate: string (ISO date)
    createdBy: string (user UID)
    createdAt: number (timestamp)
    participants: string[] (array of user UIDs)
    isDrawn: boolean
    status: 'pending' | 'active' | 'completed'
```

## Usage Flow

1. **User clicks "Créer un nouveau groupe"**
2. **Modal appears** with form
3. **User fills** name, budget, date (description optional)
4. **Validation** runs on submit
5. **Group created** in Firestore
6. **Modal closes**, groups list refreshes
7. **New group appears** in dashboard

## Features

### ✅ Implemented

- Create groups
- Load user's groups
- Display groups with stats
- Validation (name, budget, future date)
- Auto-add creator as participant
- Responsive design
- Loading states
- Error handling

### 🔄 Ready for Next Steps

- View group details (click handler exists)
- Invite participants
- Draw mechanism
- Wishlist feature
- Delete/edit groups
- Share group links

## Firestore Security Rules Needed

Add these to your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Groups collection
    match /groups/{groupId} {
      // Anyone can read groups they're a participant in
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.participants;

      // Authenticated users can create groups
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.createdBy &&
                       request.auth.uid in request.resource.data.participants;

      // Only creator can update or delete
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## Testing

1. **Run the app**: `npm run dev`
2. **Login/Register** with Firebase auth
3. **Click "Créer un nouveau groupe"**
4. **Fill the form** and submit
5. **Check Firestore** in Firebase console - group should appear
6. **Refresh page** - group should still be there

## Next Steps

1. **Group Detail Page** - Click on group to view details
2. **Invite System** - Add invite links or email invites
3. **Draw Algorithm** - Random assignment with exclusions
4. **Participant Management** - Add/remove participants
5. **Wishlist** - Personal wishlists for each participant
6. **Notifications** - Email notifications for events

## File Structure

```
src/
├── models/
│   └── group.ts                    # Data models
├── services/
│   └── group-service.ts            # Firestore operations
├── components/
│   ├── gr-dashboard.ts             # Main dashboard (updated)
│   └── gr-create-group-modal.ts    # Create group modal (new)
└── firebase.ts                      # Firebase config (already had db export)
```

## Common Issues

### "Permission denied" error

- Make sure Firestore security rules are set (see above)
- Check that user is authenticated

### Groups not loading

- Check Firebase console for data
- Check browser console for errors
- Verify Firestore is enabled in Firebase project

### Modal not appearing

- Check that `@query` decorator is working
- Ensure modal is in the render output
- Check browser console for errors

Enjoy creating groups! 🎁
