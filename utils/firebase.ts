// Import Firebase web SDK
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, updateProfile as firebaseUpdateProfile, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
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
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  console.log("Initializing Firebase with config:", JSON.stringify(firebaseConfig));
  firebaseApp = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  
  // Initialize Firebase services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw new Error(`Failed to initialize Firebase: ${error}`);
}

// Helper for profile updates
const updateProfile = async (user: User, data: { displayName?: string; photoURL?: string }) => {
  if (!user) {
    console.error("updateProfile: No user provided");
    return Promise.reject(new Error("No user provided"));
  }
  
  return firebaseUpdateProfile(user, data);
};

// Helper functions to get auth and firestore
const getAuthFunc = (): Auth => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  return auth;
};

const getFirestoreFunc = (): Firestore => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }
  return db;
};

// Create firebase object for compatibility with existing code
const firebase = {
  auth: { currentUser: auth?.currentUser },
  app: firebaseApp
};

// Export everything needed
export { 
  firebase, 
  firebaseApp as app, 
  auth, 
  db, 
  getAuthFunc as getAuth, 
  getFirestoreFunc as getFirestore, 
  updateProfile 
}; 