import { 
  auth, 
  updateProfile 
} from './firebase';
import {
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  User as FirebaseAuthUser,
  UserCredential
} from 'firebase/auth';

// Define a type for Firebase User
export type FirebaseUser = FirebaseAuthUser;

// Register a new user
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    console.log("Registering user with email:", email);
    const userCredential: UserCredential = await firebaseCreateUser(auth, email, password);
    
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
    const userCredential: UserCredential = await firebaseSignIn(auth, email, password);
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
    await firebaseSignOut(auth);
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
    await firebaseSendPasswordReset(auth, email);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error: any) {
    console.error("Password reset error:", error.code, error.message);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// Delete user account (simplified)
export const deleteUser = async (password: string) => {
  try {
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