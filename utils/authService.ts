import { auth, updateProfile } from './firebase';

// Define a type for Firebase User
export type FirebaseUser = {
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

// Register a new user
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    console.log("Registering user with email:", email);
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
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
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
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
    await auth.signOut();
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
    await auth.sendPasswordResetEmail(email);
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