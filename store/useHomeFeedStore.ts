import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dbService } from "../utils/supabaseService";

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  organizer_university_id?: string;
  event_date: string;
  event_time: string;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  max_attendees?: number;
  current_attendees: number;
  registration_deadline?: string;
  tags: string[];
  university_ids: string[];
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_university_id?: string;
  post_type: 'announcement' | 'achievement' | 'news' | 'general';
  tags: string[];
  university_ids: string[];
  is_pinned: boolean;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  reply_to_id?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    university_id?: string;
    universities?: {
      name: string;
    };
  };
}

export interface FeedItem {
  item_id: string;
  item_type: 'announcement' | 'achievement' | 'news' | 'general' | 'event' | 'space';
  title: string;
  content: string;
  author_name: string;
  author_university: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  event_data?: any;
  space_data?: any;
}

interface HomeFeedState {
  // State
  feedItems: FeedItem[];
  events: Event[];
  communityPosts: CommunityPost[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
  
  // Actions
  loadHomeFeed: (userId: string, limit?: number) => Promise<void>;
  refreshHomeFeed: (userId: string) => Promise<void>;
  
  // Events
  loadEvents: (filters?: any) => Promise<void>;
  createEvent: (eventData: any) => Promise<Event>;
  updateEvent: (eventId: string, updates: any) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  registerForEvent: (eventId: string, userId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<void>;
  
  // Community Posts
  loadCommunityPosts: (filters?: any) => Promise<void>;
  createCommunityPost: (postData: any) => Promise<CommunityPost>;
  updateCommunityPost: (postId: string, updates: any) => Promise<CommunityPost>;
  deleteCommunityPost: (postId: string) => Promise<void>;
  
  // Post Interactions
  toggleLike: (postId: string, userId: string) => Promise<void>;
  toggleBookmark: (postId: string, userId: string) => Promise<void>;
  sharePost: (postId: string, userId: string) => Promise<void>;
  
  // Comments
  addComment: (postId: string, userId: string, content: string, replyToId?: string) => Promise<void>;
  loadComments: (postId: string) => Promise<PostComment[]>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

export const useHomeFeedStore = create<HomeFeedState>()(
  persist(
    (set, get) => ({
      // Initial State
      feedItems: [],
      events: [],
      communityPosts: [],
      isLoading: false,
      error: null,
      refreshing: false,

      // Load Home Feed
      loadHomeFeed: async (userId: string, limit: number = 20) => {
        try {
          set({ isLoading: true, error: null });
          
          const feedData = await dbService.getHomeFeed(userId, limit);
          
          set({ 
            feedItems: feedData || [],
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error loading home feed:', error);
          set({ 
            error: error.message || 'Failed to load home feed',
            isLoading: false 
          });
        }
      },

      // Refresh Home Feed
      refreshHomeFeed: async (userId: string) => {
        try {
          set({ refreshing: true, error: null });
          
          const feedData = await dbService.getHomeFeed(userId, 20);
          
          set({ 
            feedItems: feedData || [],
            refreshing: false 
          });
        } catch (error: any) {
          console.error('Error refreshing home feed:', error);
          set({ 
            error: error.message || 'Failed to refresh home feed',
            refreshing: false 
          });
        }
      },

      // Load Events
      loadEvents: async (filters: any = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          const events = await dbService.getEvents(filters);
          
          set({ 
            events: events || [],
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error loading events:', error);
          set({ 
            error: error.message || 'Failed to load events',
            isLoading: false 
          });
        }
      },

      // Create Event
      createEvent: async (eventData: any) => {
        try {
          const newEvent = await dbService.createEvent(eventData);
          
          set((state) => ({
            events: [newEvent, ...state.events]
          }));
          
          return newEvent;
        } catch (error: any) {
          console.error('Error creating event:', error);
          set({ error: error.message || 'Failed to create event' });
          throw error;
        }
      },

      // Update Event
      updateEvent: async (eventId: string, updates: any) => {
        try {
          const updatedEvent = await dbService.updateEvent(eventId, updates);
          
          set((state) => ({
            events: state.events.map(event => 
              event.id === eventId ? updatedEvent : event
            )
          }));
          
          return updatedEvent;
        } catch (error: any) {
          console.error('Error updating event:', error);
          set({ error: error.message || 'Failed to update event' });
          throw error;
        }
      },

      // Delete Event
      deleteEvent: async (eventId: string) => {
        try {
          await dbService.deleteEvent(eventId);
          
          set((state) => ({
            events: state.events.filter(event => event.id !== eventId)
          }));
        } catch (error: any) {
          console.error('Error deleting event:', error);
          set({ error: error.message || 'Failed to delete event' });
          throw error;
        }
      },

      // Register for Event
      registerForEvent: async (eventId: string, userId: string) => {
        try {
          await dbService.registerForEvent(eventId, userId);
          
          // Update local state
          set((state) => ({
            events: state.events.map(event => 
              event.id === eventId 
                ? { ...event, current_attendees: event.current_attendees + 1 }
                : event
            )
          }));
        } catch (error: any) {
          console.error('Error registering for event:', error);
          set({ error: error.message || 'Failed to register for event' });
          throw error;
        }
      },

      // Unregister from Event
      unregisterFromEvent: async (eventId: string, userId: string) => {
        try {
          await dbService.unregisterFromEvent(eventId, userId);
          
          // Update local state
          set((state) => ({
            events: state.events.map(event => 
              event.id === eventId 
                ? { ...event, current_attendees: Math.max(0, event.current_attendees - 1) }
                : event
            )
          }));
        } catch (error: any) {
          console.error('Error unregistering from event:', error);
          set({ error: error.message || 'Failed to unregister from event' });
          throw error;
        }
      },

      // Load Community Posts
      loadCommunityPosts: async (filters: any = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          const posts = await dbService.getCommunityPosts(filters);
          
          set({ 
            communityPosts: posts || [],
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error loading community posts:', error);
          set({ 
            error: error.message || 'Failed to load community posts',
            isLoading: false 
          });
        }
      },

      // Create Community Post
      createCommunityPost: async (postData: any) => {
        try {
          const newPost = await dbService.createCommunityPost(postData);
          
          // Update both communityPosts and feedItems
          set((state) => {
            // Create a feed item from the new post
            const feedItem = {
              item_id: newPost.id,
              item_type: newPost.post_type,
              title: newPost.title,
              content: newPost.content,
              author_name: newPost.author_name,
              author_university: 'Your University', // Will be updated when feed refreshes
              created_at: newPost.created_at,
              like_count: 0,
              comment_count: 0,
              share_count: 0,
              is_liked: false,
              is_bookmarked: false,
              event_data: null,
              space_data: null,
            };

            return {
              communityPosts: [newPost, ...state.communityPosts],
              feedItems: [feedItem, ...state.feedItems]
            };
          });
          
          return newPost;
        } catch (error: any) {
          console.error('Error creating community post:', error);
          set({ error: error.message || 'Failed to create community post' });
          throw error;
        }
      },

      // Update Community Post
      updateCommunityPost: async (postId: string, updates: any) => {
        try {
          const updatedPost = await dbService.updateCommunityPost(postId, updates);
          
          set((state) => ({
            communityPosts: state.communityPosts.map(post => 
              post.id === postId ? updatedPost : post
            )
          }));
          
          return updatedPost;
        } catch (error: any) {
          console.error('Error updating community post:', error);
          set({ error: error.message || 'Failed to update community post' });
          throw error;
        }
      },

      // Delete Community Post
      deleteCommunityPost: async (postId: string) => {
        try {
          await dbService.deleteCommunityPost(postId);
          
          set((state) => ({
            communityPosts: state.communityPosts.filter(post => post.id !== postId)
          }));
        } catch (error: any) {
          console.error('Error deleting community post:', error);
          set({ error: error.message || 'Failed to delete community post' });
          throw error;
        }
      },

      // Toggle Like
      toggleLike: async (postId: string, userId: string) => {
        try {
          const isLiked = await dbService.togglePostInteraction(postId, userId, 'like');
          
          // Update local state
          set((state) => ({
            feedItems: state.feedItems.map(item => 
              item.item_id === postId 
                ? { 
                    ...item, 
                    is_liked: isLiked,
                    like_count: isLiked ? item.like_count + 1 : item.like_count - 1
                  }
                : item
            )
          }));
        } catch (error: any) {
          console.error('Error toggling like:', error);
          set({ error: error.message || 'Failed to toggle like' });
          throw error;
        }
      },

      // Toggle Bookmark
      toggleBookmark: async (postId: string, userId: string) => {
        try {
          const isBookmarked = await dbService.togglePostInteraction(postId, userId, 'bookmark');
          
          // Update local state
          set((state) => ({
            feedItems: state.feedItems.map(item => 
              item.item_id === postId 
                ? { ...item, is_bookmarked: isBookmarked }
                : item
            )
          }));
        } catch (error: any) {
          console.error('Error toggling bookmark:', error);
          set({ error: error.message || 'Failed to toggle bookmark' });
          throw error;
        }
      },

      // Share Post
      sharePost: async (postId: string, userId: string) => {
        try {
          await dbService.togglePostInteraction(postId, userId, 'share');
          
          // Update local state
          set((state) => ({
            feedItems: state.feedItems.map(item => 
              item.item_id === postId 
                ? { ...item, share_count: item.share_count + 1 }
                : item
            )
          }));
        } catch (error: any) {
          console.error('Error sharing post:', error);
          set({ error: error.message || 'Failed to share post' });
          throw error;
        }
      },

      // Add Comment
      addComment: async (postId: string, userId: string, content: string, replyToId?: string) => {
        try {
          await dbService.addPostComment(postId, userId, content, replyToId);
          
          // Update local state
          set((state) => ({
            feedItems: state.feedItems.map(item => 
              item.item_id === postId 
                ? { ...item, comment_count: item.comment_count + 1 }
                : item
            )
          }));
        } catch (error: any) {
          console.error('Error adding comment:', error);
          set({ error: error.message || 'Failed to add comment' });
          throw error;
        }
      },

      // Load Comments
      loadComments: async (postId: string) => {
        try {
          const comments = await dbService.getPostComments(postId);
          return comments || [];
        } catch (error: any) {
          console.error('Error loading comments:', error);
          set({ error: error.message || 'Failed to load comments' });
          throw error;
        }
      },

      // Update Comment
      updateComment: async (commentId: string, content: string) => {
        try {
          await dbService.updatePostComment(commentId, content);
        } catch (error: any) {
          console.error('Error updating comment:', error);
          set({ error: error.message || 'Failed to update comment' });
          throw error;
        }
      },

      // Delete Comment
      deleteComment: async (commentId: string) => {
        try {
          await dbService.deletePostComment(commentId);
        } catch (error: any) {
          console.error('Error deleting comment:', error);
          set({ error: error.message || 'Failed to delete comment' });
          throw error;
        }
      },

      // Clear Error
      clearError: () => set({ error: null }),

      // Reset State
      resetState: () => set({
        feedItems: [],
        events: [],
        communityPosts: [],
        isLoading: false,
        error: null,
        refreshing: false,
      }),
    }),
    {
      name: "solus-nexus-home-feed-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        feedItems: state.feedItems.slice(0, 10), // Only persist first 10 items
        events: state.events.slice(0, 5), // Only persist first 5 events
        communityPosts: state.communityPosts.slice(0, 5), // Only persist first 5 posts
      }),
    }
  )
); 