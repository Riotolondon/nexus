import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://rrmrspnzyeqjoegrilqe.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXJzcG56eWVxam9lZ3JpbHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTczOTAsImV4cCI6MjA2NzIzMzM5MH0.0XRUd_1WFncBvIQRvqlV8FCYVsT2SzOosjPjSzzSSZY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Authentication Services
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: any) => {
    // Step 1: Sign up the user with auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass user metadata during signup
        data: {
          name: userData.name,
          university_id: userData.university_id,
          study_level: userData.study_level || 'undergraduate',
          field_of_study: userData.field_of_study || '',
          interests: userData.interests || [],
          bio: userData.bio || '',
          skills: [],
          is_verified: false,
        }
      }
    })
    
    if (error) throw error
    
    // Step 2: Create user profile with proper error handling
    if (data.user) {
      try {
        // Use raw SQL to bypass RLS
        const { error: sqlError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: data.user.email,
          user_name: userData.name,
          user_university_id: userData.university_id,
          user_study_level: userData.study_level || 'undergraduate',
          user_field_of_study: userData.field_of_study || '',
          user_bio: userData.bio || '',
        })
        
        if (sqlError) {
          console.error("Error creating user profile:", sqlError);
          
          // Fallback: Try direct insert (may still fail due to RLS)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: userData.name,
              university_id: userData.university_id,
              study_level: userData.study_level || 'undergraduate',
              field_of_study: userData.field_of_study || '',
              interests: userData.interests || [],
              bio: userData.bio || '',
              skills: [],
              is_verified: false,
            })
          
          if (insertError) {
            console.error("Fallback insert failed:", insertError);
            console.warn("Failed to create user profile. The auth user may need to be cleaned up manually.");
            console.warn("Please run the RLS fix script or disable RLS in Supabase dashboard.");
            throw insertError;
          }
        }
      } catch (err) {
        console.error("Unexpected error during profile creation:", err);
        throw err;
      }
    }
    
    return data
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      callback(session?.user || null)
    })
  },
}

// Database Services
export const dbService = {
  // Users
  getUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*, universities(*)')
      .eq('id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Create user profile if it doesn't exist
  createUserProfile: async (userId: string, email: string, additionalData: any = {}) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: additionalData.name || email.split('@')[0],
        university_id: additionalData.university_id || null,
        study_level: additionalData.study_level || 'undergraduate',
        field_of_study: additionalData.field_of_study || '',
        interests: additionalData.interests || [],
        bio: additionalData.bio || '',
        skills: additionalData.skills || [],
        is_verified: false,
      })
      .select('*, universities(*)')
      .single()
    
    if (error) throw error
    return data
  },

  // Get or create user profile using database function
  getOrCreateUser: async (userId: string, email: string, additionalData: any = {}) => {
    try {
      console.log('Getting or creating user profile for:', userId);
      
      const { data, error } = await supabase
        .rpc('get_or_create_user_profile', {
          user_id: userId,
          user_email: email
        })
        .single()
      
      if (error) {
        console.error('Database function error:', error);
        
        // Fallback to client-side logic if database function fails
        console.log('Falling back to client-side user creation');
        
        // First try to get existing user
        const existingUser = await dbService.getUser(userId);
        if (existingUser) {
          return existingUser;
        }

        // If user doesn't exist, create one
        console.log('User profile not found, creating new profile for:', userId);
        return await dbService.createUserProfile(userId, email, additionalData);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in getOrCreateUser:', error.message);
      throw error;
    }
  },

  updateUser: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Universities
  getUniversityByShortId: async (shortId: string) => {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name, short_name')
      .eq('short_name', shortId)
      .single()
    
    if (error) throw error
    return { data }
  },

  // Collaboration Spaces
  getCollaborationSpaces: async (filters: any = {}) => {
    // First get basic collaboration spaces data
    let query = supabase
      .from('collaboration_spaces')
      .select('*')
      .eq('is_active', true)
    
    if (filters.university_id) {
      query = query.contains('university_ids', [filters.university_id])
    }
    
    if (filters.tags) {
      query = query.overlaps('tags', filters.tags)
    }
    
    const { data: spaces, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    
    // If we have spaces, get participant counts separately
    if (spaces && spaces.length > 0) {
      for (let space of spaces) {
        try {
          const { data: participants, error: participantError } = await supabase
            .from('collaboration_participants')
            .select('user_id')
            .eq('space_id', space.id)
          
          if (!participantError && participants) {
            space.participants = participants
          } else {
            space.participants = []
          }
        } catch (err) {
          console.error('Error fetching participants for space:', space.id, err)
          space.participants = []
        }
      }
    }
    
    return spaces
  },

  createCollaborationSpace: async (spaceData: any) => {
    const { data, error } = await supabase
      .from('collaboration_spaces')
      .insert(spaceData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  joinCollaborationSpace: async (spaceId: string, userId: string) => {
    console.log("Database joinCollaborationSpace called with:", { spaceId, userId });
    
    const { data, error } = await supabase
      .from('collaboration_participants')
      .insert({
        space_id: spaceId,
        user_id: userId,
      })
      .select()
    
    if (error) {
      console.error("Database join error:", error);
      throw error;
    }
    
    console.log("Database join success:", data);
    return data;
  },

  leaveCollaborationSpace: async (spaceId: string, userId: string) => {
    console.log("Database leaveCollaborationSpace called with:", { spaceId, userId });
    
    const { data, error } = await supabase
      .from('collaboration_participants')
      .delete()
      .eq('space_id', spaceId)
      .eq('user_id', userId)
    
    if (error) {
      console.error("Database leave error:", error);
      throw error;
    }
    
    console.log("Database leave success:", data);
    return data;
  },

  // Career Opportunities
  getCareerOpportunities: async (filters: any = {}) => {
    let query = supabase
      .from('career_opportunities')
      .select('*')
      .gt('deadline', new Date().toISOString())
    
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    
    if (filters.tags) {
      query = query.overlaps('tags', filters.tags)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  createCareerOpportunity: async (opportunityData: any) => {
    const { data, error } = await supabase
      .from('career_opportunities')
      .insert(opportunityData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Academic Resources
  getAcademicResources: async (filters: any = {}) => {
    let query = supabase
      .from('academic_resources')
      .select(`
        *,
        users(name, university_id),
        universities(name)
      `)
    
    if (filters.university_id) {
      query = query.eq('university_id', filters.university_id)
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.tags) {
      query = query.overlaps('tags', filters.tags)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToCollaborationSpaces: (callback: (payload: any) => void) => {
    return supabase
      .channel('collaboration_spaces')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaboration_spaces'
      }, callback)
      .subscribe()
  },

  subscribeToMessages: (spaceId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`messages:${spaceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `space_id=eq.${spaceId}`
      }, callback)
      .subscribe()
  },

  // Messages
  sendMessage: async (spaceId: string, message: string, userId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        space_id: spaceId,
        user_id: userId,
        content: message,
      })
      .select(`
        *,
        users(name, university_id, universities(name))
      `)
      .single()
    
    if (error) throw error
    return data
  },

  getMessages: async (spaceId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users(name, university_id, universities(name))
      `)
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data.reverse() // Show oldest first
  },

  // Home Feed
  getHomeFeed: async (userId: string, limit: number = 20) => {
    const { data, error } = await supabase
      .rpc('get_home_feed', {
        user_uuid: userId,
        limit_count: limit
      })
    
    if (error) throw error
    return data
  },

  // Community Posts
  getCommunityPosts: async (filters: any = {}) => {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        universities(name),
        users(name, university_id)
      `)
      .eq('is_active', true)
    
    if (filters.post_type) {
      query = query.eq('post_type', filters.post_type)
    }
    
    if (filters.university_id) {
      query = query.contains('university_ids', [filters.university_id])
    }
    
    if (filters.tags) {
      query = query.overlaps('tags', filters.tags)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  createCommunityPost: async (postData: any) => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert(postData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateCommunityPost: async (postId: string, updates: any) => {
    const { data, error } = await supabase
      .from('community_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteCommunityPost: async (postId: string) => {
    const { error } = await supabase
      .from('community_posts')
      .update({ is_active: false })
      .eq('id', postId)
    
    if (error) throw error
  },

  // Events
  getEvents: async (filters: any = {}) => {
    let query = supabase
      .from('events')
      .select(`
        *,
        universities(name),
        users(name, university_id)
      `)
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
    
    if (filters.university_id) {
      query = query.contains('university_ids', [filters.university_id])
    }
    
    if (filters.tags) {
      query = query.overlaps('tags', filters.tags)
    }
    
    const { data, error } = await query.order('event_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  createEvent: async (eventData: any) => {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateEvent: async (eventId: string, updates: any) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deleteEvent: async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', eventId)
    
    if (error) throw error
  },

  // Event Attendees
  registerForEvent: async (eventId: string, userId: string) => {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update attendee count
    await supabase
      .rpc('increment_event_attendees', { event_id: eventId })
    
    return data
  },

  unregisterFromEvent: async (eventId: string, userId: string) => {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
    
    if (error) throw error
    
    // Update attendee count
    await supabase
      .rpc('decrement_event_attendees', { event_id: eventId })
  },

  getEventAttendees: async (eventId: string) => {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        *,
        users(name, university_id, universities(name))
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Post Interactions
  togglePostInteraction: async (postId: string, userId: string, interactionType: string) => {
    const { data, error } = await supabase
      .rpc('toggle_post_interaction', {
        post_uuid: postId,
        user_uuid: userId,
        interaction_type: interactionType
      })
    
    if (error) throw error
    return data // Returns true if added, false if removed
  },

  // Post Comments
  addPostComment: async (postId: string, userId: string, content: string, replyToId?: string) => {
    const { data, error } = await supabase
      .rpc('add_post_comment', {
        post_uuid: postId,
        user_uuid: userId,
        comment_content: content,
        reply_to_uuid: replyToId || null
      })
    
    if (error) throw error
    return data
  },

  getPostComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        users(name, university_id, universities(name))
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  updatePostComment: async (commentId: string, content: string) => {
    const { data, error } = await supabase
      .from('post_comments')
      .update({ content, is_edited: true })
      .eq('id', commentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  deletePostComment: async (commentId: string) => {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
    
    if (error) throw error
  },
}

// Utility functions
export const supabaseUtils = {
  // Upload file to storage
  uploadFile: async (bucket: string, path: string, file: any) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  },

  // Get public URL for file
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  },
} 