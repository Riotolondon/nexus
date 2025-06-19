import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { universities } from "@/constants/universities";
import { useUserStore } from "./useUserStore";

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
  // Actions
  createSpace: (spaceData: {
    title: string;
    description: string;
    universities: string[];
    tags: string[];
  }) => string; // Returns the ID of the created space
  joinSpace: (spaceId: string) => void;
  leaveSpace: (spaceId: string) => void;
  sendMessage: (spaceId: string, text: string) => void;
  getSpace: (spaceId: string) => CollaborationSpace | undefined;
  getUserSpaces: () => CollaborationSpace[];
  getAllSpaces: () => CollaborationSpace[];
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
      
      createSpace: (spaceData) => {
        const user = useUserStore.getState();
        if (!user.isLoggedIn || !user.userId) {
          throw new Error("User must be logged in to create a space");
        }
        
        const newSpaceId = Date.now().toString();
        
        // Handle university information safely
        let userUniversity = "Unknown University";
        if (user.university && typeof user.university === 'object' && user.university.name) {
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
          creatorId: user.userId,
          members: 1, // Creator is the first member
          universities: spaceUniversities,
          tags: spaceData.tags,
          isActive: true,
          createdAt: new Date().toISOString(),
          messages: [],
          participants: [user.userId],
        };
        
        set((state) => ({
          spaces: [...state.spaces, newSpace],
          userSpaces: [...state.userSpaces, newSpaceId],
        }));
        
        return newSpaceId;
      },
      
      joinSpace: (spaceId) => {
        const user = useUserStore.getState();
        if (!user.isLoggedIn || !user.userId) {
          throw new Error("User must be logged in to join a space");
        }
        
        set((state) => {
          // Check if user already joined this space
          if (state.userSpaces.includes(spaceId)) {
            return state;
          }
          
          // Find the space and update it
          const updatedSpaces = state.spaces.map((space) => {
            if (space.id === spaceId) {
              // Only add the user if they're not already a participant
              if (!space.participants.includes(user.userId!)) {
                return {
                  ...space,
                  members: space.members + 1,
                  participants: [...space.participants, user.userId!],
                };
              }
            }
            return space;
          });
          
          return {
            spaces: updatedSpaces,
            userSpaces: [...state.userSpaces, spaceId],
          };
        });
      },
      
      leaveSpace: (spaceId) => {
        const user = useUserStore.getState();
        if (!user.isLoggedIn || !user.userId) {
          throw new Error("User must be logged in to leave a space");
        }
        
        set((state) => {
          // Update the space
          const updatedSpaces = state.spaces.map((space) => {
            if (space.id === spaceId) {
              return {
                ...space,
                members: Math.max(0, space.members - 1),
                participants: space.participants.filter(id => id !== user.userId),
              };
            }
            return space;
          });
          
          // Remove from user spaces
          const updatedUserSpaces = state.userSpaces.filter(id => id !== spaceId);
          
          return {
            spaces: updatedSpaces,
            userSpaces: updatedUserSpaces,
          };
        });
      },
      
      sendMessage: (spaceId, text) => {
        const user = useUserStore.getState();
        if (!user.isLoggedIn || !user.userId) {
          throw new Error("User must be logged in to send a message");
        }
        
        // Handle university information safely
        let userUniversity = "Unknown University";
        if (user.university && typeof user.university === 'object' && user.university.name) {
          userUniversity = user.university.name;
        }
        
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          authorId: user.userId,
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
    }),
    {
      name: "solus-nexus-collaboration-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 