import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage keys
const USER_KEY = 'solus-nexus-user';
const AUTH_STATE_KEY = 'solus-nexus-auth-state';

// Auth state listeners
let authListeners: ((user: any) => void)[] = [];

// Current user
let currentUser: any = null;

// Initialize local auth
export const initLocalAuth = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (userJson) {
      currentUser = JSON.parse(userJson);
      notifyListeners(currentUser);
    }
    return true;
  } catch (error) {
    console.error('Error initializing local auth:', error);
    return false;
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    // Create a user object
    const user = {
      uid: Date.now().toString(),
      email,
      displayName,
      createdAt: new Date().toISOString(),
    };
    
    // Store user in AsyncStorage
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Update current user
    currentUser = user;
    
    // Notify listeners
    notifyListeners(currentUser);
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in user
export const signInUser = async (email: string, password: string) => {
  try {
    // In a real app, we would validate credentials
    // For now, just simulate a successful login
    const user = {
      uid: '123456789',
      email,
      displayName: 'Test User',
      createdAt: new Date().toISOString(),
    };
    
    // Store user in AsyncStorage
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Update current user
    currentUser = user;
    
    // Notify listeners
    notifyListeners(currentUser);
    
    return user;
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    // Remove user from AsyncStorage
    await AsyncStorage.removeItem(USER_KEY);
    
    // Clear current user
    currentUser = null;
    
    // Notify listeners
    notifyListeners(null);
    
    return true;
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return currentUser;
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (user: any) => void) => {
  // Add listener
  authListeners.push(callback);
  
  // Initial callback with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
};

// Notify all listeners
const notifyListeners = (user: any) => {
  authListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error('Error in auth listener:', error);
    }
  });
};

// Reset password (simulated)
export const resetPassword = async (email: string) => {
  // Simulate password reset
  console.log(`Password reset email sent to ${email}`);
  return true;
};

// Initialize on import
initLocalAuth().catch(console.error); 