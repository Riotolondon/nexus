-- Safe Home Page Functionality Migration
-- This adds only the missing functions and tables needed for Home page
-- Uses IF NOT EXISTS to avoid conflicts with existing tables

-- Create Events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organizer_name VARCHAR(255) NOT NULL,
    organizer_university_id UUID REFERENCES universities(id),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    meeting_link TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    registration_deadline DATE,
    tags TEXT[] DEFAULT '{}',
    university_ids UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Event Attendees table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create Community Posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_university_id UUID REFERENCES universities(id),
    post_type VARCHAR(50) DEFAULT 'announcement',
    tags TEXT[] DEFAULT '{}',
    university_ids UUID[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Post Interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'bookmark', 'share'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, interaction_type)
);

-- Create Post Comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id UUID REFERENCES post_comments(id),
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- Create or replace the main Home Feed function
CREATE OR REPLACE FUNCTION get_home_feed(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    item_id UUID,
    item_type TEXT,
    title TEXT,
    description TEXT,
    content TEXT,
    author_id UUID,
    author_name TEXT,
    author_university_id UUID,
    organizer_id UUID,
    organizer_name TEXT,
    organizer_university_id UUID,
    creator_id UUID,
    creator_name TEXT,
    creator_university_id UUID,
    event_date DATE,
    event_time TIME,
    location TEXT,
    is_online BOOLEAN,
    meeting_link TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER,
    max_participants INTEGER,
    current_participants INTEGER,
    meeting_type TEXT,
    tags TEXT[],
    university_ids UUID[],
    like_count INTEGER,
    comment_count INTEGER,
    share_count INTEGER,
    is_pinned BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Return a unified feed with events, community posts, and collaboration spaces
    RETURN QUERY
    WITH feed_items AS (
        -- Events
        SELECT 
            e.id as item_id,
            'event'::TEXT as item_type,
            e.title::TEXT,
            e.description::TEXT,
            e.description::TEXT as content,
            NULL::UUID as author_id,
            NULL::TEXT as author_name,
            NULL::UUID as author_university_id,
            e.organizer_id,
            e.organizer_name::TEXT,
            e.organizer_university_id,
            NULL::UUID as creator_id,
            NULL::TEXT as creator_name,
            NULL::UUID as creator_university_id,
            e.event_date,
            e.event_time,
            e.location::TEXT,
            e.is_online,
            e.meeting_link::TEXT,
            e.max_attendees,
            e.current_attendees,
            NULL::INTEGER as max_participants,
            NULL::INTEGER as current_participants,
            CASE WHEN e.is_online THEN 'online'::TEXT ELSE 'in-person'::TEXT END as meeting_type,
            e.tags,
            e.university_ids,
            0 as like_count,
            0 as comment_count,
            0 as share_count,
            false as is_pinned,
            e.is_active,
            e.created_at
        FROM events e
        WHERE e.is_active = true
        
        UNION ALL
        
        -- Community Posts
        SELECT 
            cp.id as item_id,
            'community_post'::TEXT as item_type,
            cp.title::TEXT,
            cp.content::TEXT as description,
            cp.content::TEXT,
            cp.author_id,
            cp.author_name::TEXT,
            cp.author_university_id,
            NULL::UUID as organizer_id,
            NULL::TEXT as organizer_name,
            NULL::UUID as organizer_university_id,
            NULL::UUID as creator_id,
            NULL::TEXT as creator_name,
            NULL::UUID as creator_university_id,
            NULL::DATE as event_date,
            NULL::TIME as event_time,
            NULL::TEXT as location,
            NULL::BOOLEAN as is_online,
            NULL::TEXT as meeting_link,
            NULL::INTEGER as max_attendees,
            NULL::INTEGER as current_attendees,
            NULL::INTEGER as max_participants,
            NULL::INTEGER as current_participants,
            NULL::TEXT as meeting_type,
            cp.tags,
            cp.university_ids,
            cp.like_count,
            cp.comment_count,
            cp.share_count,
            cp.is_pinned,
            cp.is_active,
            cp.created_at
        FROM community_posts cp
        WHERE cp.is_active = true
        
        UNION ALL
        
        -- Collaboration Spaces
        SELECT 
            cs.id as item_id,
            'collaboration_space'::TEXT as item_type,
            cs.title::TEXT,
            cs.description::TEXT,
            cs.description::TEXT as content,
            NULL::UUID as author_id,
            NULL::TEXT as author_name,
            NULL::UUID as author_university_id,
            NULL::UUID as organizer_id,
            NULL::TEXT as organizer_name,
            NULL::UUID as organizer_university_id,
            cs.creator_id,
            u.name::TEXT as creator_name,
            u.university_id as creator_university_id,
            NULL::DATE as event_date,
            NULL::TIME as event_time,
            cs.meeting_location::TEXT as location,
            CASE WHEN cs.meeting_type = 'online' THEN true ELSE false END as is_online,
            cs.meeting_link::TEXT,
            NULL::INTEGER as max_attendees,
            NULL::INTEGER as current_attendees,
            cs.max_participants,
            (SELECT COUNT(*) FROM collaboration_participants cp WHERE cp.space_id = cs.id)::INTEGER as current_participants,
            cs.meeting_type::TEXT,
            cs.tags,
            cs.university_ids,
            0 as like_count,
            0 as comment_count,
            0 as share_count,
            false as is_pinned,
            cs.is_active,
            cs.created_at
        FROM collaboration_spaces cs
        LEFT JOIN users u ON cs.creator_id = u.id
        WHERE cs.is_active = true AND cs.is_private = false
    )
    SELECT * FROM feed_items 
    ORDER BY 
        is_pinned DESC,
        created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the post interaction function
CREATE OR REPLACE FUNCTION toggle_post_interaction(post_uuid UUID, user_uuid UUID, interaction_type VARCHAR)
RETURNS JSON AS $$
DECLARE
    interaction_exists BOOLEAN;
    new_count INTEGER;
    result JSON;
BEGIN
    -- Check if interaction already exists
    SELECT EXISTS(
        SELECT 1 FROM post_interactions 
        WHERE post_id = post_uuid AND user_id = user_uuid AND interaction_type = toggle_post_interaction.interaction_type
    ) INTO interaction_exists;
    
    IF interaction_exists THEN
        -- Remove interaction
        DELETE FROM post_interactions 
        WHERE post_id = post_uuid AND user_id = user_uuid AND interaction_type = toggle_post_interaction.interaction_type;
        
        -- Update count in community_posts
        IF interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count - 1 WHERE id = post_uuid;
            SELECT like_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSIF interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count - 1 WHERE id = post_uuid;
            SELECT share_count INTO new_count FROM community_posts WHERE id = post_uuid;
        END IF;
        
        result := json_build_object('action', 'removed', 'count', new_count);
    ELSE
        -- Add interaction
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (post_uuid, user_uuid, toggle_post_interaction.interaction_type);
        
        -- Update count in community_posts
        IF interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count + 1 WHERE id = post_uuid;
            SELECT like_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSIF interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count + 1 WHERE id = post_uuid;
            SELECT share_count INTO new_count FROM community_posts WHERE id = post_uuid;
        END IF;
        
        result := json_build_object('action', 'added', 'count', new_count);
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the add comment function
CREATE OR REPLACE FUNCTION add_post_comment(post_uuid UUID, user_uuid UUID, comment_content TEXT, reply_to_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    new_comment_id UUID;
    comment_result JSON;
BEGIN
    -- Insert the comment
    INSERT INTO post_comments (post_id, user_id, content, reply_to_id)
    VALUES (post_uuid, user_uuid, comment_content, reply_to_uuid)
    RETURNING id INTO new_comment_id;
    
    -- Update comment count in community_posts
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = post_uuid;
    
    -- Return the comment details
    SELECT json_build_object(
        'id', new_comment_id,
        'content', comment_content,
        'created_at', NOW(),
        'user_id', user_uuid,
        'reply_to_id', reply_to_uuid
    ) INTO comment_result;
    
    RETURN comment_result;
END;
$$ LANGUAGE plpgsql;

-- Create or replace event attendee functions
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events SET current_attendees = current_attendees + 1 WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events SET current_attendees = GREATEST(current_attendees - 1, 0) WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = organizer_id);

-- Create RLS policies for event_attendees
CREATE POLICY "Event attendees viewable by everyone" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registration" ON event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel their own registration" ON event_attendees FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_posts
CREATE POLICY "Community posts viewable by everyone" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create community posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = author_id);

-- Create RLS policies for post_interactions
CREATE POLICY "Post interactions viewable by everyone" ON post_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own interactions" ON post_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON post_interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON post_interactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for post_comments
CREATE POLICY "Post comments viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Create the missing get_or_create_user_profile function
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_email TEXT, user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_profile JSON;
BEGIN
    -- Try to get existing user profile
    SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'university_id', u.university_id,
        'study_level', u.study_level,
        'field_of_study', u.field_of_study,
        'bio', u.bio,
        'profile_image_url', u.profile_image_url,
        'interests', u.interests,
        'graduation_year', u.graduation_year,
        'skills', u.skills,
        'is_verified', u.is_verified,
        'created_at', u.created_at,
        'updated_at', u.updated_at
    ) INTO user_profile
    FROM users u
    WHERE u.id = user_id;
    
    -- If user doesn't exist, create a new profile
    IF user_profile IS NULL THEN
        INSERT INTO users (id, email, name)
        VALUES (user_id, user_email, COALESCE(split_part(user_email, '@', 1), 'User'))
        RETURNING json_build_object(
            'id', id,
            'email', email,
            'name', name,
            'university_id', university_id,
            'study_level', study_level,
            'field_of_study', field_of_study,
            'bio', bio,
            'profile_image_url', profile_image_url,
            'interests', interests,
            'graduation_year', graduation_year,
            'skills', skills,
            'is_verified', is_verified,
            'created_at', created_at,
            'updated_at', updated_at
        ) INTO user_profile;
    END IF;
    
    RETURN user_profile;
END;
$$ LANGUAGE plpgsql; 