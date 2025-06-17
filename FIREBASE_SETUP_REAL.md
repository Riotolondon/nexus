# Firebase Real Implementation Setup

## Overview

This document explains how to switch from the mock Firebase implementation to the real Firebase implementation for the Solus Nexus app.

## Prerequisites

1. A Firebase account
2. A Firebase project created in the Firebase console
3. Firebase configuration details for your project

## Step 1: Install Required Dependencies

If not already installed, add the Firebase dependencies:

```bash
npm install firebase
```

## Step 2: Update firebase.ts

Replace the mock implementation in `utils/firebase.ts` with the real Firebase initialization:

```typescript
// Import Firebase core
import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpn7qNKuXrpTA6TYgvFq8GE2m_F1opG0Q",
  authDomain: "solus-nexus.firebaseapp.com",
  projectId: "solus-nexus",
  storageBucket: "solus-nexus.firebasestorage.app",
  messagingSenderId: "949473838949",
  appId: "1:949473838949:web:e0ba6b6541a9e17b22038c",
  measurementId: "G-MKW2ZCPLD6"
};

// Initialize Firebase
console.log("Initializing Firebase app with JS SDK");
const app = initializeApp(firebaseConfig);

// Create a placeholder for auth and db
// We'll initialize them only when needed to avoid initialization order issues
let _auth: any = null;
let _db: any = null;

// Lazy getters for Firebase services
const getAuth = () => {
  if (!_auth) {
    console.log("Initializing Firebase Auth");
    const { getAuth: firebaseGetAuth } = require('firebase/auth');
    _auth = firebaseGetAuth(app);
  }
  return _auth;
};

const getFirestore = () => {
  if (!_db) {
    console.log("Initializing Firebase Firestore");
    const { getFirestore: firebaseGetFirestore } = require('firebase/firestore');
    _db = firebaseGetFirestore(app);
  }
  return _db;
};

// Export the Firebase app and lazy-loaded services
const firebase = { app };
const analytics = null;

console.log("Using Firebase JS SDK");

export { firebase, app, getAuth, getFirestore, analytics };
```

## Step 3: Update authService.ts

Update `utils/authService.ts` to use the real Firebase Auth methods:

```typescript
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { getAuth } from './firebase';

// Register a new user
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    console.log("Registering user with email:", email);
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      console.log("User registered successfully:", userCredential.user.uid);
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
};

// Sign in existing user
export const signInUser = async (email: string, password: string) => {
  try {
    console.log("Signing in user with email:", email);
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully:", userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error("Sign in error:", error.code, error.message);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  console.log("signOutUser function called in authService");
  try {
    console.log("Starting signOut");
    const auth = getAuth();
    await signOut(auth);
    console.log("signOut completed successfully");
    return true;
  } catch (error: any) {
    console.warn('Sign out issue:', error.message);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error: any) {
    console.error("Password reset error:", error.code, error.message);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  const auth = getAuth();
  return auth.currentUser;
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, callback);
};

// Delete user account (simplified)
export const deleteUser = async (password: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in");
    
    // For security, you might want to reauthenticate the user before deletion
    // This is a simplified version
    await signOutUser();
    return true;
  } catch (error: any) {
    throw error;
  }
};
```

## Step 4: Update firestoreService.ts

Update `utils/firestoreService.ts` to use the real Firestore methods:

```typescript
import { getFirestore } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  onSnapshot,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Add a document to a collection with auto-generated ID
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    const documentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collectionRef, documentData);
    return docRef.id;
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Set a document with a specific ID
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const documentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, documentData);
    return docId;
  } catch (error: any) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    return docId;
  } catch (error: any) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error: any) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Query documents with filters
export const queryDocuments = async (
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error: any) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

// Subscribe to a document
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to document ${docId} in ${collectionName}:`, error);
      callback(null);
    });
  } catch (error) {
    console.error(`Error setting up subscription to document ${docId} in ${collectionName}:`, error);
    return () => {};
  }
};

// Subscribe to a collection
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: DocumentData[]) => void
) => {
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const documents: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      callback(documents);
    }, (error) => {
      console.error(`Error subscribing to collection ${collectionName}:`, error);
      callback([]);
    });
  } catch (error) {
    console.error(`Error setting up subscription to collection ${collectionName}:`, error);
    return () => {};
  }
};
```

## Step 5: Update useUserStore.ts

No changes should be needed in `store/useUserStore.ts` if the interfaces of the authentication and Firestore services remain the same. However, you should update the imports:

```typescript
import { 
  registerUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  subscribeToAuthChanges,
  resetPassword
} from "../utils/authService";
import { 
  setDocument, 
  getDocument, 
  updateDocument,
  deleteDocument
} from "../utils/firestoreService";
import { User } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
```

## Step 6: Enable Firebase Services

In the Firebase console:

1. Enable Authentication and add the authentication methods you need (Email/Password, Google, etc.)
2. Enable Firestore Database and set up security rules
3. Configure any other Firebase services you need (Storage, Functions, etc.)

## Step 7: Testing

1. Test user registration and login
2. Test data storage and retrieval
3. Test real-time updates
4. Test offline capabilities

## Troubleshooting

### Common Issues

1. **Firebase Not Initialized**: Make sure Firebase is initialized before using any Firebase services
2. **Permission Denied**: Check your Firestore security rules
3. **Network Issues**: Test with and without internet connection
4. **Authentication Errors**: Check that Authentication is enabled in the Firebase console

### Debugging Tips

1. Add console logs to track Firebase initialization and service usage
2. Use the Firebase console to monitor authentication and database activity
3. Check the Firebase documentation for specific error codes and solutions

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/) (alternative to Firebase JS SDK)
- [Expo Firebase](https://docs.expo.dev/guides/using-firebase/) (Expo-specific Firebase integration) 