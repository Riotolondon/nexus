import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface University {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  university: University | null;
  interests: string[];
  profileImage?: string | null;
  bio?: string | null;
  studyLevel?: string | null;
  fieldOfStudy?: string | null;
  joinedAt: string;
}

interface UserState {
  // User data
  userId: string | null;
  name: string | null;
  email: string | null;
  university: University | null;
  interests: string[];
  profileImage: string | null;
  bio: string | null;
  studyLevel: string | null;
  fieldOfStudy: string | null;
  joinedAt: string | null;
  isLoggedIn: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    university: University;
    interests: string[];
    studyLevel?: string;
    fieldOfStudy?: string;
    bio?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setInterests: (interests: string[]) => void;
  deleteAccount: (password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  
  // Helper methods
  getUser: () => User | null;
  isUserLoggedIn: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      name: null,
      email: null,
      university: null,
      interests: [],
      profileImage: null,
      bio: null,
      studyLevel: null,
      fieldOfStudy: null,
      joinedAt: null,
      isLoggedIn: false,

      // Mock login - always succeeds
      login: async (email: string, password: string) => {
        console.log("Mock login with:", email);
        
        // Create mock user
        const mockUser = {
          userId: `mock-${Date.now()}`,
          name: "Test User",
          email: email,
          university: {
            id: "1",
            name: "University of Cape Town",
            logo: "https://example.com/logo.png",
            color: "#007bff"
          },
          interests: ["Computer Science", "Technology"],
          profileImage: null,
          bio: "Test user for development",
          studyLevel: "Undergraduate",
          fieldOfStudy: "Computer Science",
          joinedAt: new Date().toISOString()
        };

        set({
          userId: mockUser.userId,
          name: mockUser.name,
          email: mockUser.email,
          university: mockUser.university,
          interests: mockUser.interests,
          profileImage: mockUser.profileImage,
          bio: mockUser.bio,
          studyLevel: mockUser.studyLevel,
          fieldOfStudy: mockUser.fieldOfStudy,
          joinedAt: mockUser.joinedAt,
          isLoggedIn: true,
        });

        console.log("Mock login successful");
        return true;
      },

      // Mock registration - always succeeds
      register: async (userData) => {
        console.log("Mock registration with:", userData.email);
        
        const mockUser = {
          userId: `mock-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          university: userData.university,
          interests: userData.interests,
          profileImage: null,
          bio: userData.bio || "New user",
          studyLevel: userData.studyLevel || "Undergraduate",
          fieldOfStudy: userData.fieldOfStudy || "General",
          joinedAt: new Date().toISOString()
        };

        set({
          userId: mockUser.userId,
          name: mockUser.name,
          email: mockUser.email,
          university: mockUser.university,
          interests: mockUser.interests,
          profileImage: mockUser.profileImage,
          bio: mockUser.bio,
          studyLevel: mockUser.studyLevel,
          fieldOfStudy: mockUser.fieldOfStudy,
          joinedAt: mockUser.joinedAt,
          isLoggedIn: true,
        });

        console.log("Mock registration successful");
        return true;
      },

      // Logout
      logout: async () => {
        console.log("Logging out user");
        
        try {
          // Clear AsyncStorage
          console.log("Clearing local storage");
          AsyncStorage.removeItem("solus-nexus-user-storage");
          console.log("Local storage cleared");
        } catch (e) {
          console.error("Error clearing local storage:", e);
        }

        // Reset state
        set({
          userId: null,
          name: null,
          email: null,
          university: null,
          interests: [],
          profileImage: null,
          bio: null,
          studyLevel: null,
          fieldOfStudy: null,
          joinedAt: null,
          isLoggedIn: false,
        });

        console.log("Logout completed");
      },

      // Update profile
      updateProfile: async (updates) => {
        console.log("Updating profile with:", updates);
        
        set((state) => ({
          ...state,
          ...updates,
        }));

        console.log("Profile updated successfully");
      },

      // Set interests
      setInterests: (interests) => {
        set({ interests });
      },

      // Mock delete account - always succeeds
      deleteAccount: async (password: string) => {
        console.log("Mock delete account");
        
        // Clear storage
        try {
          AsyncStorage.removeItem("solus-nexus-user-storage");
        } catch (e) {
          console.error("Error clearing storage:", e);
        }

        // Reset state
        set({
          userId: null,
          name: null,
          email: null,
          university: null,
          interests: [],
          profileImage: null,
          bio: null,
          studyLevel: null,
          fieldOfStudy: null,
          joinedAt: null,
          isLoggedIn: false,
        });

        return true;
      },

      // Mock reset password - always succeeds
      resetPassword: async (email: string) => {
        console.log("Mock reset password for:", email);
        return true;
      },

      // Helper methods
      getUser: () => {
        const state = get();
        if (!state.isLoggedIn || !state.userId) {
          return null;
        }
        
        return {
          userId: state.userId,
          name: state.name || "",
          email: state.email || "",
          university: state.university,
          interests: state.interests,
          profileImage: state.profileImage,
          bio: state.bio,
          studyLevel: state.studyLevel,
          fieldOfStudy: state.fieldOfStudy,
          joinedAt: state.joinedAt || new Date().toISOString(),
        };
      },

      isUserLoggedIn: () => {
        return get().isLoggedIn;
      },
    }),
    {
      name: "solus-nexus-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);