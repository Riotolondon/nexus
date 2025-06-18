import { initializeApp, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

// Firebase configuration
// In a real app, these would come from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-messaging-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "mock-measurement-id"
};

// Check if we should use the real Firebase or the mock
const shouldUseMockFirebase = !firebaseConfig.apiKey || firebaseConfig.apiKey === "mock-api-key";

let app: any;
let auth: any;
let db: any;
let analytics = null;

// Define types for our mock implementation
export type MockUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
};

// For the mock implementation
let currentUser: MockUser | null = null;
let authListeners: Array<(user: MockUser | null) => void> = [];

if (shouldUseMockFirebase) {
  console.log("Using mock Firebase implementation");
  
  // Mock user data
  const mockUser: MockUser = {
    uid: "mock-user-123",
    email: "test@example.com",
    displayName: "Test User",
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  };

  // Helper to notify all auth listeners
  const notifyAuthListeners = (user: MockUser | null) => {
    authListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error("Error in auth listener:", error);
      }
    });
  };

  // Mock auth service
  auth = {
    currentUser,
    
    // Mock sign in
    signInWithEmailAndPassword: async (email: string, password: string) => {
      console.log(`Mock sign in with email: ${email}`);
      currentUser = { ...mockUser, email };
      notifyAuthListeners(currentUser);
      return { user: currentUser };
    },
    
    // Mock sign up
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      console.log(`Mock sign up with email: ${email}`);
      currentUser = { ...mockUser, email };
      notifyAuthListeners(currentUser);
      return { user: currentUser };
    },
    
    // Mock sign out
    signOut: async () => {
      console.log("Mock sign out");
      currentUser = null;
      notifyAuthListeners(null);
      return Promise.resolve();
    },
    
    // Mock password reset
    sendPasswordResetEmail: async (email: string) => {
      console.log(`Mock password reset email sent to: ${email}`);
      return Promise.resolve();
    },
    
    // Mock auth state change listener
    onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
      console.log("Adding auth state listener");
      authListeners.push(callback);
      // Call with current state immediately
      callback(currentUser);
      // Return unsubscribe function
      return () => {
        console.log("Removing auth state listener");
        authListeners = authListeners.filter(listener => listener !== callback);
      };
    }
  };

  // Types for Firestore mock
  type MockDocumentData = Record<string, any>;

  // Mock Firestore data
  const mockData: Record<string, Record<string, MockDocumentData>> = {
    users: {},
    academicResources: {},
    collaborationSpaces: {},
    careerOpportunities: {}
  };

  // Mock document reference
  const createDocRef = (collection: string, id: string) => ({
    id,
    collection: collection,
    get: async () => ({
      exists: !!mockData[collection][id],
      id,
      data: () => mockData[collection][id] || null
    }),
    set: async (data: MockDocumentData) => {
      mockData[collection][id] = { ...data };
      return Promise.resolve();
    },
    update: async (data: MockDocumentData) => {
      mockData[collection][id] = { ...mockData[collection][id], ...data };
      return Promise.resolve();
    },
    delete: async () => {
      delete mockData[collection][id];
      return Promise.resolve();
    }
  });

  // Mock collection reference
  const createCollectionRef = (collection: string) => ({
    doc: (id: string) => createDocRef(collection, id),
    add: async (data: MockDocumentData) => {
      const id = `mock-${Date.now()}`;
      mockData[collection][id] = { ...data };
      return { id };
    },
    where: () => createCollectionRef(collection),
    orderBy: () => createCollectionRef(collection),
    limit: () => createCollectionRef(collection),
    get: async () => ({
      docs: Object.keys(mockData[collection]).map(id => ({
        id,
        exists: true,
        data: () => mockData[collection][id]
      }))
    })
  });

  // Mock Firestore service
  db = {
    collection: (name: string) => createCollectionRef(name)
  };

  // Mock Firebase app
  app = {};
} else {
  // Initialize the real Firebase
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Using real Firebase implementation");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
}

// Export a unified API regardless of whether we're using mock or real Firebase
const firebase = { app };

// Helper for profile updates that works with both real and mock Firebase
const updateProfile = async (user: any, data: any) => {
  if (shouldUseMockFirebase) {
    // Mock implementation
    currentUser = { ...currentUser, ...data } as MockUser;
    return Promise.resolve();
  } else {
    // Real Firebase implementation
    return firebaseUpdateProfile(user, data);
  }
};

// Helper functions to get auth and firestore
const getAuthFunc = () => auth;
const getFirestoreFunc = () => db;

export { 
  firebase, 
  app, 
  auth, 
  db, 
  analytics, 
  getAuthFunc as getAuth, 
  getFirestoreFunc as getFirestore, 
  updateProfile 
}; 