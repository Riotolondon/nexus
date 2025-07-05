import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { universities } from "@/constants/universities";
import { useSupabaseUserStore } from "./useSupabaseUserStore";
import { dbService } from "../utils/supabaseService";

export type Message = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorUniversity: string;
  timestamp: string;
};

export type CollaborationSpace = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  members: number;
  universities: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  messages: Message[];
  participants: string[]; // user IDs
};

type CollaborationState = {
  spaces: CollaborationSpace[];
  userSpaces: string[]; // IDs of spaces the user has joined
  isJoining: boolean; // Loading state for join operations
  // Actions
  createSpace: (spaceData: {
    title: string;
    description: string;
    universities: string[];
    tags: string[];
  }) => string; // Returns the ID of the created space
  joinSpace: (spaceId: string) => Promise<void>;
  leaveSpace: (spaceId: string) => Promise<void>;
  sendMessage: (spaceId: string, text: string) => void;
  getSpace: (spaceId: string) => CollaborationSpace | undefined;
  getUserSpaces: () => CollaborationSpace[];
  getAllSpaces: () => CollaborationSpace[];
  isUserInSpace: (spaceId: string) => boolean;
  setSpaces: (spaces: CollaborationSpace[]) => void;
};

// Helper to get university name from ID
const getUniversityName = (id: string): string => {
  const university = universities.find(u => u.id === id);
  return university ? university.name : "Unknown University";
};

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      spaces: [],
      userSpaces: [],
      isJoining: false,
      
      createSpace: (spaceData) => {
        const user = useSupabaseUserStore.getState().user;
        if (!user?.id) {
          throw new Error("User must be logged in to create a space");
        }
        
        const newSpaceId = Date.now().toString();
        
        // Handle university information safely
        let userUniversity = "Unknown University";
        if (user.university?.name) {
          userUniversity = user.university.name;
        }
        
        // Ensure universities array has unique values
        const spaceUniversities = [...new Set([...spaceData.universities])];
        
        // Add user's university if not already included
        if (userUniversity !== "Unknown University" && !spaceUniversities.includes(userUniversity)) {
          spaceUniversities.push(userUniversity);
        }
        
        const newSpace: CollaborationSpace = {
          id: newSpaceId,
          title: spaceData.title,
          description: spaceData.description,
          creatorId: user.id,
          members: 1, // Creator is the first member
          universities: spaceUniversities,
          tags: spaceData.tags,
          isActive: true,
          createdAt: new Date().toISOString(),
          messages: [],
          participants: [user.id],
        };
        
        set((state) => ({
          spaces: [...state.spaces, newSpace],
          userSpaces: [...state.userSpaces, newSpaceId],
        }));
        
        return newSpaceId;
      },
      
      joinSpace: async (spaceId) => {
        const user = useSupabaseUserStore.getState().user;
        console.log("joinSpace called with spaceId:", spaceId);
        console.log("Current user:", user);
        
        if (!user?.id) {
          console.error("User is not logged in or has no ID");
          throw new Error("User must be logged in to join a space");
        }
        
        set({ isJoining: true });
        
        try {
          console.log("Attempting to join space in database...");
          // Join in database
          await dbService.joinCollaborationSpace(spaceId, user.id);
          console.log("Successfully joined space in database");
          
          set((state) => {
            console.log("Current userSpaces:", state.userSpaces);
            // Check if user already joined this space
            if (state.userSpaces.includes(spaceId)) {
              console.log("User already in space, skipping local state update");
              return { ...state, isJoining: false };
            }
            
            // Find the space and update it
            const updatedSpaces = state.spaces.map((space) => {
              if (space.id === spaceId) {
                console.log("Found space to update:", space.title);
                // Only add the user if they're not already a participant
                if (!space.participants.includes(user.id)) {
                  console.log("Adding user to space participants");
                  return {
                    ...space,
                    members: space.members + 1,
                    participants: [...space.participants, user.id],
                  };
                } else {
                  console.log("User already in participants list");
                }
              }
              return space;
            });
            
            console.log("Updated userSpaces will be:", [...state.userSpaces, spaceId]);
            return {
              spaces: updatedSpaces,
              userSpaces: [...state.userSpaces, spaceId],
              isJoining: false,
            };
          });
        } catch (error) {
          console.error('Error joining space:', error);
          set({ isJoining: false });
          throw error;
        }
      },
      
      leaveSpace: async (spaceId) => {
        const user = useSupabaseUserStore.getState().user;
        console.log("leaveSpace called with spaceId:", spaceId);
        console.log("Current user:", user);
        
        if (!user?.id) {
          console.error("User is not logged in or has no ID");
          throw new Error("User must be logged in to leave a space");
        }
        
        set({ isJoining: true });
        
        try {
          console.log("Attempting to leave space in database...");
          // Leave in database
          await dbService.leaveCollaborationSpace(spaceId, user.id);
          console.log("Successfully left space in database");
          
          set((state) => {
            console.log("Current userSpaces:", state.userSpaces);
            // Update the space
            const updatedSpaces = state.spaces.map((space) => {
              if (space.id === spaceId) {
                console.log("Found space to update:", space.title);
                return {
                  ...space,
                  members: Math.max(0, space.members - 1),
                  participants: space.participants.filter(id => id !== user.id),
                };
              }
              return space;
            });
            
            // Remove from user spaces
            const updatedUserSpaces = state.userSpaces.filter(id => id !== spaceId);
            console.log("Updated userSpaces will be:", updatedUserSpaces);
            
            return {
              spaces: updatedSpaces,
              userSpaces: updatedUserSpaces,
              isJoining: false,
            };
          });
        } catch (error) {
          console.error('Error leaving space:', error);
          set({ isJoining: false });
          throw error;
        }
      },
      
      sendMessage: (spaceId, text) => {
        const user = useSupabaseUserStore.getState().user;
        if (!user?.id) {
          throw new Error("User must be logged in to send a message");
        }
        
        // Handle university information safely
        let userUniversity = "Unknown University";
        if (user.university?.name) {
          userUniversity = user.university.name;
        }
        
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          authorId: user.id,
          authorName: user.name || "Anonymous",
          authorUniversity: userUniversity,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => {
          const updatedSpaces = state.spaces.map((space) => {
            if (space.id === spaceId) {
              return {
                ...space,
                messages: [...space.messages, newMessage],
              };
            }
            return space;
          });
          
          return { spaces: updatedSpaces };
        });
      },
      
      getSpace: (spaceId) => {
        return get().spaces.find(space => space.id === spaceId);
      },
      
      getUserSpaces: () => {
        const userSpaceIds = get().userSpaces;
        return get().spaces.filter(space => userSpaceIds.includes(space.id));
      },
      
      getAllSpaces: () => {
        return get().spaces;
      },

      isUserInSpace: (spaceId) => {
        const userSpaces = get().userSpaces;
        const isInSpace = userSpaces.includes(spaceId);
        console.log("isUserInSpace check:", { spaceId, userSpaces, isInSpace });
        return isInSpace;
      },

      setSpaces: (spaces) => {
        set({ spaces });
      },
    }),
    {
      name: "solus-nexus-collaboration-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 