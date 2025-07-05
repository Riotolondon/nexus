import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService, dbService } from "../utils/supabaseService";

export interface University {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  short_name: string;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  university_id?: string;
  university?: University;
  interests: string[];
  profile_image_url?: string | null;
  bio?: string | null;
  study_level?: string | null;
  field_of_study?: string | null;
  graduation_year?: number | null;
  skills: string[];
  is_verified: boolean;
  created_at: string;
}

interface UserState {
  // User data
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Actions
  signUp: (userData: {
    email: string;
    password: string;
    name: string;
    university_id: string;
    study_level?: string;
    field_of_study?: string;
    interests?: string[];
    bio?: string;
  }) => Promise<boolean>;
  
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loadUserProfile: (userId: string, userEmail?: string) => Promise<void>;
  
  // Helper methods
  getUser: () => User | null;
  isUserLoggedIn: () => boolean;
  
  // Initialize auth state
  initializeAuth: () => Promise<void>;
}

export const useSupabaseUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoggedIn: false,
      isLoading: false,

      // Sign up with Supabase
      signUp: async (userData) => {
        try {
          set({ isLoading: true });
          console.log("Signing up with Supabase:", userData.email);
          
          const { email, password, ...profileData } = userData;
          
          // Convert string university_id to UUID format if needed
          // This is needed because our database expects UUIDs but our constants use string IDs
          let universityId = profileData.university_id;
          
          // Check if the university_id is already a UUID or needs conversion
          if (universityId && !universityId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Fetch the actual UUID from the database based on the short name
            try {
              const { data: universityData } = await dbService.getUniversityByShortId(universityId);
              if (universityData && universityData.id) {
                universityId = universityData.id;
              } else {
                console.warn(`Could not find UUID for university with short ID: ${universityId}`);
                // Fall back to empty string if we can't find a matching university
                universityId = "";
              }
            } catch (err) {
              console.error("Error fetching university UUID:", err);
              // Fall back to empty string if there's an error
              universityId = "";
            }
          }
          
          const response = await authService.signUp(email, password, {
            name: profileData.name,
            university_id: universityId,
            study_level: profileData.study_level || 'undergraduate',
            field_of_study: profileData.field_of_study || '',
            interests: profileData.interests || [],
            bio: profileData.bio || '',
            skills: [],
            is_verified: false,
          });
          
          if (response.user) {
            // Load the complete user profile
            await get().loadUserProfile(response.user.id);
            set({ isLoggedIn: true });
            console.log("Sign up successful");
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error("Sign up error:", error.message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign in with Supabase
      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          console.log("Signing in with Supabase:", email);
          
          const response = await authService.signIn(email, password);
          
          if (response.user) {
            // Load the complete user profile
            await get().loadUserProfile(response.user.id, response.user.email);
            set({ isLoggedIn: true });
            console.log("Sign in successful");
            return true;
          }
          
          return false;
        } catch (error: any) {
          console.error("Sign in error:", error.message);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sign out
      signOut: async () => {
        try {
          console.log("Signing out user");
          
          await authService.signOut();
          
          // Clear local storage
          try {
            await AsyncStorage.removeItem("solus-nexus-supabase-user-storage");
            console.log("Local storage cleared");
          } catch (e) {
            console.error("Error clearing local storage:", e);
          }

          // Reset state
          set({
            user: null,
            isLoggedIn: false,
            isLoading: false,
          });

          console.log("Sign out completed");
        } catch (error: any) {
          console.error("Sign out error:", error.message);
          throw error;
        }
      },

      // Load user profile from Supabase
      loadUserProfile: async (userId: string, userEmail?: string) => {
        try {
          if (!userId) {
            console.error("Cannot load user profile: userId is undefined or null");
            throw new Error("User ID is required");
          }
          
          console.log("Loading user profile for:", userId);
          
          // Get email from auth user if not provided
          let email = userEmail;
          if (!email) {
            try {
              const { data: authData } = await authService.getCurrentUser();
              email = authData?.user?.email;
            } catch (authError) {
              console.warn("Could not get email from auth user:", authError);
            }
          }
          
          // Try to get or create user profile
          const userData = await dbService.getOrCreateUser(userId, email || '', {});
          
          if (userData) {
            const user: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              university_id: userData.university_id,
              university: userData.universities ? {
                id: userData.universities.id,
                name: userData.universities.name,
                logo_url: userData.universities.logo_url,
                primary_color: userData.universities.primary_color,
                short_name: userData.universities.short_name,
                location: userData.universities.location,
              } : undefined,
              interests: userData.interests || [],
              profile_image_url: userData.profile_image_url,
              bio: userData.bio,
              study_level: userData.study_level,
              field_of_study: userData.field_of_study,
              graduation_year: userData.graduation_year,
              skills: userData.skills || [],
              is_verified: userData.is_verified || false,
              created_at: userData.created_at,
            };
            
            set({ user });
            console.log("User profile loaded successfully");
          } else {
            console.warn("Failed to load or create user profile for ID:", userId);
            throw new Error("User profile could not be loaded or created");
          }
        } catch (error: any) {
          console.error("Error loading user profile:", error.message);
          throw error;
        }
      },

      // Update user profile
      updateProfile: async (updates) => {
        try {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }

          console.log("Updating user profile:", updates);
          
          // Update in Supabase
          const updatedData = await dbService.updateUser(currentUser.id, updates);
          
          // Update local state
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));

          console.log("Profile updated successfully");
        } catch (error: any) {
          console.error("Error updating profile:", error.message);
          throw error;
        }
      },

      // Initialize authentication state
      initializeAuth: async () => {
        try {
          console.log("Initializing auth state");
          
          const { data: authData } = await authService.getCurrentUser();
          
          if (authData?.user?.id) {
            try {
              await get().loadUserProfile(authData.user.id);
              set({ isLoggedIn: true });
              console.log("User already authenticated");
            } catch (profileError) {
              console.error("Error loading user profile:", profileError);
              // If we can't load the profile, reset the auth state
              set({ user: null, isLoggedIn: false });
            }
          } else {
            set({ user: null, isLoggedIn: false });
            console.log("No authenticated user");
          }
        } catch (error: any) {
          console.error("Error initializing auth:", error.message);
          set({ user: null, isLoggedIn: false });
        }
      },

      // Helper methods
      getUser: () => {
        return get().user;
      },

      isUserLoggedIn: () => {
        return get().isLoggedIn && get().user !== null;
      },
    }),
    {
      name: "solus-nexus-supabase-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

// Set up auth state listener
authService.onAuthStateChange((user) => {
  const store = useSupabaseUserStore.getState();
  
  if (user) {
    // User is signed in
    if (!store.isLoggedIn) {
      store.loadUserProfile(user.id, user.email);
      useSupabaseUserStore.setState({ isLoggedIn: true });
    }
  } else {
    // User is signed out
    if (store.isLoggedIn) {
      useSupabaseUserStore.setState({
        user: null,
        isLoggedIn: false,
        isLoading: false,
      });
    }
  }
});

// Auto-initialize auth state when the store is created
useSupabaseUserStore.getState().initializeAuth();

export default useSupabaseUserStore; 