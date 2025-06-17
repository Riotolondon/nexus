# Firebase Mock Implementation

## Overview

This document explains the mock Firebase implementation used in the Solus Nexus app. This mock implementation allows you to test the app's functionality without requiring a real Firebase connection.

## Why Use a Mock Implementation?

1. **Faster Development**: No need to wait for network requests
2. **Offline Testing**: Test the app without an internet connection
3. **Consistent Data**: Predictable data for testing UI and functionality
4. **No Firebase Costs**: No usage of Firebase quotas during development
5. **Troubleshooting**: Isolate app issues from Firebase-specific issues

## Files Using the Mock Implementation

The mock implementation is spread across several files:

1. `utils/firebase.ts` - Core mock Firebase implementation
2. `utils/authService.ts` - Authentication service using mock Firebase
3. `utils/firestoreService.ts` - Firestore database service using mock Firebase
4. `store/useUserStore.ts` - User state management using mock services

## How the Mock Works

### Firebase Core (firebase.ts)

The mock implementation provides:

- Mock Firebase app instance
- Mock authentication service with user management
- Mock Firestore database with basic CRUD operations
- Helper functions that mimic Firebase SDK behavior

### Authentication (authService.ts)

Supports:
- User registration
- User login/logout
- Password reset
- Auth state change listeners
- Current user retrieval

### Firestore Database (firestoreService.ts)

Supports:
- Adding documents
- Setting documents with specific IDs
- Updating documents
- Deleting documents
- Querying documents
- Document and collection subscriptions

## Mock Data

The mock implementation includes a default user:

```javascript
{
  uid: "mock-user-123",
  email: "test@example.com",
  displayName: "Test User",
  emailVerified: true,
  isAnonymous: false
}
```

## Switching to Real Firebase

When you're ready to switch to a real Firebase implementation:

1. Replace the mock implementation in `utils/firebase.ts` with real Firebase initialization
2. Update `utils/authService.ts` to use Firebase Auth methods
3. Update `utils/firestoreService.ts` to use Firestore methods
4. No changes should be needed in components or the user store

## Limitations

The mock implementation has some limitations:

1. Limited query capabilities compared to real Firestore
2. No real-time updates for subscriptions
3. No persistence between app restarts
4. No security rules implementation
5. No Firebase Storage or other Firebase services

## Debugging

The mock implementation includes console logs to help track:

- Authentication actions (login, logout, etc.)
- Database operations (create, read, update, delete)
- Auth state changes

Check the console logs to see what's happening with the mock Firebase implementation. 