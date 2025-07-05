-- Fix Home Feed Function Types
-- This script drops and recreates the get_home_feed function with correct types

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_home_feed(uuid, integer);

-- Create the corrected function with proper return types
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

-- Success message
SELECT 'Home feed function fixed successfully! The function now returns correct types.' as message; 