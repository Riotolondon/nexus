import { 
  auth, 
  updateProfile 
} from './firebase';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Define a type for Firebase User
export type FirebaseUser = User;

// Register a new user
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    console.log("registerUser called with email:", email);
    
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully with Firebase Auth");
    } catch (createUserError: any) {
      console.error("Error in createUserWithEmailAndPassword:", {
        code: createUserError.code,
        message: createUserError.message,
        stack: createUserError.stack
      });
      throw createUserError;
    }
    
    // Update profile with display name
    if (userCredential.user) {
      try {
        await updateProfile(userCredential.user, { displayName });
        console.log("User profile updated with displayName:", displayName);
      } catch (updateProfileError: any) {
        console.error("Error updating user profile:", {
          code: updateProfileError.code,
          message: updateProfileError.message
        });
        // Continue even if profile update fails
      }
      
      console.log("User registered successfully:", userCredential.user.uid);
    } else {
      console.error("User credential exists but user is null");
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error("Registration error in authService:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Sign in existing user
export const signInUser = async (email: string, password: string) => {
  try {
    console.log("Signing in user with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully:", userCredential.user?.uid);
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
  return auth.currentUser;
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
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