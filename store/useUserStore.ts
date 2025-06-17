import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  registerUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  subscribeToAuthChanges,
  resetPassword,
  FirebaseUser
} from "../utils/authService";
import { 
  setDocument, 
  getDocument, 
  updateDocument,
  deleteDocument,
  DocumentData
} from "../utils/firestoreService";
import { Platform } from "react-native";

type University = {
  id: string;
  name: string;
};

interface UserData extends DocumentData {
  name?: string;
  email?: string;
  university?: University;
  studyField?: string;
  yearOfStudy?: number;
  profilePicture?: string;
  interests?: string[];
}

type UserState = {
  isLoggedIn: boolean;
  userId: string | null;
  name: string | null;
  email: string | null;
  university: University | null;
  studyField: string | null;
  yearOfStudy: number | null;
  profilePicture: string | null;
  interests: string[];
  
  // Authentication methods
  register: (email: string, password: string, name: string, university: University) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  
  // Profile methods
  updateProfile: (profileData: Partial<Omit<UserState, "isLoggedIn" | "login" | "logout" | "updateProfile" | "addInterest" | "removeInterest" | "register" | "deleteAccount">>) => Promise<void>;
  addInterest: (interest: string) => Promise<void>;
  removeInterest: (interest: string) => Promise<void>;
  
  // Auth state
  initializeAuthListener: () => () => void;
  loadUserData: (userId: string) => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userId: null,
      name: null,
      email: null,
      university: null,
      studyField: null,
      yearOfStudy: null,
      profilePicture: null,
      interests: [],
      
      // Register a new user
      register: async (email, password, name, university) => {
        try {
          // Register with Firebase Auth
          const user = await registerUser(email, password, name);
          if (user) {
            // Create user profile in Firestore
            await setDocument('users', user.uid, {
              name,
              email,
              university,
              createdAt: new Date(),
            });
            
            // Update local state
            set({
              isLoggedIn: true,
              userId: user.uid,
              name,
              email,
              university,
              studyField: null,
              yearOfStudy: null,
              profilePicture: null,
              interests: [],
            });
          }
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },
      
      // Login existing user
      login: async (email, password) => {
        try {
          const user = await signInUser(email, password);
          if (user) {
            // Load user data from Firestore
            await get().loadUserData(user.uid);
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      
      // Load user data from Firestore
      loadUserData: async (userId) => {
        try {
          console.log("Loading user data for:", userId);
          const userData = await getDocument('users', userId) as UserData;
          
          if (userData) {
            console.log("User data found in Firestore");
            set({
              isLoggedIn: true,
              userId,
              name: userData.name || null,
              email: userData.email || null,
              university: userData.university || null,
              studyField: userData.studyField || null,
              yearOfStudy: userData.yearOfStudy || null,
              profilePicture: userData.profilePicture || null,
              interests: userData.interests || [],
            });
          } else {
            // User exists in Auth but not in Firestore
            console.log("User exists in Auth but not in Firestore, creating basic profile");
            const authUser = getCurrentUser();
            if (authUser) {
              // Create a basic profile for the user
              await setDocument('users', userId, {
                name: authUser.displayName || null,
                email: authUser.email || null,
                createdAt: new Date(),
              });
              
              // Set basic user data in state
              set({
                isLoggedIn: true,
                userId,
                name: authUser.displayName || null,
                email: authUser.email || null,
                university: null,
                studyField: null,
                yearOfStudy: null,
                profilePicture: null,
                interests: [],
              });
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          throw error;
        }
      },
      
      // Logout user
      logout: async () => {
        try {
          console.log("Logout function called in user store");
          // Attempt to sign out from Firebase
          console.log("Attempting to sign out from Firebase");
          await signOutUser();
          console.log("Firebase sign out successful");
        } catch (error) {
          console.error('Logout error in store:', error);
          // Continue with logout even if Firebase logout fails
        } finally {
          // Always clear the local state
          console.log("Clearing local state");
          set({
            isLoggedIn: false,
            userId: null,
            name: null,
            email: null,
            university: null,
            studyField: null,
            yearOfStudy: null,
            profilePicture: null,
            interests: [],
          });
          console.log("Local state cleared");
          
          // Clear AsyncStorage to ensure complete logout
          try {
            AsyncStorage.removeItem("solus-nexus-user-storage");
            console.log("AsyncStorage cleared");
          } catch (e) {
            console.error("Error clearing AsyncStorage:", e);
          }
          
          console.log("Logout complete - navigation should be handled by component");
        }
      },
      
      // Delete user account
      deleteAccount: async (password) => {
        try {
          const { userId } = get();
          if (!userId) throw new Error('User not authenticated');
          
          // Delete user data from Firestore
          await deleteDocument('users', userId);
          
          // Delete Firebase Auth user
          await resetPassword(password);
          
          // Clear local state
          set({
            isLoggedIn: false,
            userId: null,
            name: null,
            email: null,
            university: null,
            studyField: null,
            yearOfStudy: null,
            profilePicture: null,
            interests: [],
          });
        } catch (error) {
          console.error('Delete account error:', error);
          throw error;
        }
      },
      
      // Update user profile
      updateProfile: async (profileData) => {
        const { userId } = get();
        if (!userId) return;
        
        try {
          await updateDocument('users', userId, profileData);
          set((state) => ({ ...state, ...profileData }));
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      },
      
      // Add interest
      addInterest: async (interest) => {
        const { userId, interests } = get();
        if (!userId) return;
        
        try {
          const updatedInterests = [...interests, interest];
          await updateDocument('users', userId, { interests: updatedInterests });
          set((state) => ({
            interests: updatedInterests,
          }));
        } catch (error) {
          console.error('Add interest error:', error);
          throw error;
        }
      },
      
      // Remove interest
      removeInterest: async (interest) => {
        const { userId, interests } = get();
        if (!userId) return;
        
        try {
          const updatedInterests = interests.filter((i) => i !== interest);
          await updateDocument('users', userId, { interests: updatedInterests });
          set((state) => ({
            interests: updatedInterests,
          }));
        } catch (error) {
          console.error('Remove interest error:', error);
          throw error;
        }
      },
      
      // Initialize auth state listener
      initializeAuthListener: () => {
        const unsubscribe = subscribeToAuthChanges(async (user) => {
          if (user) {
            await get().loadUserData(user.uid);
          } else {
            set({
              isLoggedIn: false,
              userId: null,
              name: null,
              email: null,
              university: null,
              studyField: null,
              yearOfStudy: null,
              profilePicture: null,
              interests: [],
            });
          }
        });
        
        return unsubscribe;
      },
    }),
    {
      name: "solus-nexus-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);