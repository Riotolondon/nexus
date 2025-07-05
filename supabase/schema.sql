-- Supabase Database Schema for Solus Nexus
-- This file creates all necessary tables, relationships, and policies

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#5B7FFF',
    location VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    university_id UUID REFERENCES universities(id),
    study_level VARCHAR(50), -- undergraduate, postgraduate, etc.
    field_of_study VARCHAR(255),
    bio TEXT,
    profile_image_url TEXT,
    interests TEXT[] DEFAULT '{}',
    graduation_year INTEGER,
    skills TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration Spaces table
CREATE TABLE collaboration_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    university_ids UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    max_participants INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    meeting_type VARCHAR(50) DEFAULT 'online', -- online, in-person, hybrid
    meeting_link TEXT,
    meeting_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration Participants (many-to-many)
CREATE TABLE collaboration_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES collaboration_spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- creator, moderator, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(space_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES collaboration_spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, system
    file_url TEXT,
    reply_to_id UUID REFERENCES messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Opportunities table
CREATE TABLE career_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- internship, part-time, full-time, graduate-program
    salary_range VARCHAR(100),
    application_url TEXT,
    application_deadline DATE,
    tags TEXT[] DEFAULT '{}',
    university_ids UUID[] DEFAULT '{}', -- which universities can apply
    posted_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Resources table
CREATE TABLE academic_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- notes, textbooks, papers, videos, etc.
    subject VARCHAR(100),
    course_code VARCHAR(50),
    university_id UUID REFERENCES universities(id),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Ratings table
CREATE TABLE resource_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES academic_resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- academic, career, collaboration, system
    related_id UUID, -- ID of related resource/space/opportunity
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Bookmarks table
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- career_opportunity, academic_resource, collaboration_space
    resource_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_type, resource_id)
);

-- Events table
CREATE TABLE events (
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
    university_ids UUID[] DEFAULT '{}', -- which universities can attend
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees table
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered', -- registered, approved, declined, cancelled
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Community Posts table (for announcements, achievements, etc.)
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_university_id UUID REFERENCES universities(id),
    post_type VARCHAR(50) DEFAULT 'announcement', -- announcement, achievement, news, general
    tags TEXT[] DEFAULT '{}',
    university_ids UUID[] DEFAULT '{}', -- which universities can see this
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Interactions table (likes, bookmarks, shares)
CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL, -- like, bookmark, share
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, interaction_type)
);

-- Post Comments table
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id UUID REFERENCES post_comments(id),
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_collaboration_spaces_creator ON collaboration_spaces(creator_id);
CREATE INDEX idx_collaboration_spaces_active ON collaboration_spaces(is_active);
CREATE INDEX idx_collaboration_participants_space ON collaboration_participants(space_id);
CREATE INDEX idx_collaboration_participants_user ON collaboration_participants(user_id);
CREATE INDEX idx_messages_space_id ON messages(space_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_career_opportunities_type ON career_opportunities(type);
CREATE INDEX idx_career_opportunities_location ON career_opportunities(location);
CREATE INDEX idx_career_opportunities_deadline ON career_opportunities(application_deadline);
CREATE INDEX idx_career_opportunities_active ON career_opportunities(is_active);
CREATE INDEX idx_academic_resources_category ON academic_resources(category);
CREATE INDEX idx_academic_resources_university ON academic_resources(university_id);
CREATE INDEX idx_academic_resources_author ON academic_resources(author_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_universities ON events USING GIN(university_ids);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_pinned ON community_posts(is_pinned);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_posts_universities ON community_posts USING GIN(university_ids);
CREATE INDEX idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_spaces_updated_at BEFORE UPDATE ON collaboration_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_opportunities_updated_at BEFORE UPDATE ON career_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_resources_updated_at BEFORE UPDATE ON academic_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other users' public profiles" ON users
    FOR SELECT USING (true);

-- Collaboration spaces policies
CREATE POLICY "Anyone can view public collaboration spaces" ON collaboration_spaces
    FOR SELECT USING (NOT is_private OR creator_id = auth.uid());

CREATE POLICY "Users can create collaboration spaces" ON collaboration_spaces
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their spaces" ON collaboration_spaces
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their spaces" ON collaboration_spaces
    FOR DELETE USING (auth.uid() = creator_id);

-- Collaboration participants policies
CREATE POLICY "Participants can view space membership" ON collaboration_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join spaces" ON collaboration_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave spaces" ON collaboration_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Space participants can view messages" ON messages
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM collaboration_participants cp
            WHERE cp.space_id = messages.space_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Space participants can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS(
            SELECT 1 FROM collaboration_participants cp
            WHERE cp.space_id = messages.space_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- Career opportunities policies
CREATE POLICY "Anyone can view active career opportunities" ON career_opportunities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create career opportunities" ON career_opportunities
    FOR INSERT WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Posters can update their opportunities" ON career_opportunities
    FOR UPDATE USING (auth.uid() = posted_by);

-- Academic resources policies
CREATE POLICY "Anyone can view public academic resources" ON academic_resources
    FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Users can create academic resources" ON academic_resources
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their resources" ON academic_resources
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their resources" ON academic_resources
    FOR DELETE USING (auth.uid() = author_id);

-- Resource ratings policies
CREATE POLICY "Anyone can view ratings" ON resource_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can rate resources" ON resource_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON resource_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Anyone can view active events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events" ON events
    FOR DELETE USING (auth.uid() = organizer_id);

-- Event attendees policies
CREATE POLICY "Anyone can view event attendees" ON event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own event registrations" ON event_attendees
    FOR ALL USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view active community posts" ON community_posts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create community posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts" ON community_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts" ON community_posts
    FOR DELETE USING (auth.uid() = author_id);

-- Post interactions policies
CREATE POLICY "Anyone can view post interactions" ON post_interactions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own interactions" ON post_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Anyone can view post comments" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default universities data
INSERT INTO universities (name, short_name, logo_url, primary_color, location, website) VALUES
    ('University of Cape Town', 'UCT', 'https://example.com/uct-logo.png', '#003B71', 'Cape Town', 'https://www.uct.ac.za'),
    ('University of the Witwatersrand', 'Wits', 'https://example.com/wits-logo.png', '#005BBB', 'Johannesburg', 'https://www.wits.ac.za'),
    ('University of Pretoria', 'UP', 'https://example.com/up-logo.png', '#7C225E', 'Pretoria', 'https://www.up.ac.za'),
    ('University of KwaZulu-Natal', 'UKZN', 'https://example.com/ukzn-logo.png', '#F7941D', 'Durban', 'https://www.ukzn.ac.za'),
    ('University of the Free State', 'UFS', 'https://example.com/ufs-logo.png', '#003366', 'Bloemfontein', 'https://www.ufs.ac.za');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_collaboration_spaces(user_uuid UUID)
RETURNS TABLE (
    space_id UUID,
    title VARCHAR,
    description TEXT,
    participant_count BIGINT,
    is_creator BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id as space_id,
        cs.title,
        cs.description,
        COUNT(cp.user_id) as participant_count,
        (cs.creator_id = user_uuid) as is_creator
    FROM collaboration_spaces cs
    LEFT JOIN collaboration_participants cp ON cs.id = cp.space_id
    WHERE cs.id IN (
        SELECT space_id FROM collaboration_participants WHERE user_id = user_uuid
    )
    GROUP BY cs.id, cs.title, cs.description, cs.creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_collaboration_space_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the collaboration space's updated_at when a new message is added
    UPDATE collaboration_spaces 
    SET updated_at = NOW() 
    WHERE id = NEW.space_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_space_activity_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_collaboration_space_activity();

-- Create function to get recommended collaboration spaces for a user
CREATE OR REPLACE FUNCTION get_recommended_spaces(user_uuid UUID)
RETURNS TABLE (
    space_id UUID,
    title VARCHAR,
    description TEXT,
    participant_count BIGINT,
    common_tags TEXT[],
    university_match BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id as space_id,
        cs.title,
        cs.description,
        COUNT(cp.user_id) as participant_count,
        (SELECT array_agg(DISTINCT tag) FROM unnest(cs.tags) as tag 
         WHERE tag = ANY((SELECT interests FROM users WHERE id = user_uuid))) as common_tags,
        (SELECT university_id FROM users WHERE id = user_uuid) = ANY(cs.university_ids) as university_match
    FROM collaboration_spaces cs
    LEFT JOIN collaboration_participants cp ON cs.id = cp.space_id
    WHERE cs.is_active = true
    AND cs.id NOT IN (
        SELECT space_id FROM collaboration_participants WHERE user_id = user_uuid
    )
    GROUP BY cs.id, cs.title, cs.description, cs.tags, cs.university_ids
    ORDER BY university_match DESC, participant_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feed items for home page
CREATE OR REPLACE FUNCTION get_home_feed(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    item_id UUID,
    item_type VARCHAR,
    title VARCHAR,
    content TEXT,
    author_name VARCHAR,
    author_university VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    like_count INTEGER,
    comment_count INTEGER,
    share_count INTEGER,
    is_liked BOOLEAN,
    is_bookmarked BOOLEAN,
    event_data JSON,
    space_data JSON
) AS $$
BEGIN
    RETURN QUERY
    -- Get community posts
    SELECT 
        cp.id as item_id,
        cp.post_type as item_type,
        cp.title,
        cp.content,
        cp.author_name,
        COALESCE(u.name, 'Unknown University') as author_university,
        cp.created_at,
        cp.like_count,
        cp.comment_count,
        cp.share_count,
        EXISTS(SELECT 1 FROM post_interactions pi WHERE pi.post_id = cp.id AND pi.user_id = user_uuid AND pi.interaction_type = 'like') as is_liked,
        EXISTS(SELECT 1 FROM post_interactions pi WHERE pi.post_id = cp.id AND pi.user_id = user_uuid AND pi.interaction_type = 'bookmark') as is_bookmarked,
        NULL::JSON as event_data,
        NULL::JSON as space_data
    FROM community_posts cp
    LEFT JOIN universities u ON cp.author_university_id = u.id
    WHERE cp.is_active = true
    
    UNION ALL
    
    -- Get events
    SELECT 
        e.id as item_id,
        'event' as item_type,
        e.title,
        e.description as content,
        e.organizer_name as author_name,
        COALESCE(u.name, 'Unknown University') as author_university,
        e.created_at,
        0 as like_count,
        0 as comment_count,
        0 as share_count,
        false as is_liked,
        false as is_bookmarked,
        JSON_BUILD_OBJECT(
            'event_date', e.event_date,
            'event_time', e.event_time,
            'location', e.location,
            'is_online', e.is_online,
            'meeting_link', e.meeting_link,
            'current_attendees', e.current_attendees,
            'max_attendees', e.max_attendees,
            'tags', e.tags
        ) as event_data,
        NULL::JSON as space_data
    FROM events e
    LEFT JOIN universities u ON e.organizer_university_id = u.id
    WHERE e.is_active = true
    AND e.event_date >= CURRENT_DATE
    
    UNION ALL
    
    -- Get recent collaboration spaces
    SELECT 
        cs.id as item_id,
        'space' as item_type,
        'New Collaboration Space: ' || cs.title as title,
        cs.description as content,
        'Student Community' as author_name,
        'Multiple Universities' as author_university,
        cs.created_at,
        0 as like_count,
        0 as comment_count,
        0 as share_count,
        false as is_liked,
        false as is_bookmarked,
        NULL::JSON as event_data,
        JSON_BUILD_OBJECT(
            'space_id', cs.id,
            'space_title', cs.title,
            'space_description', cs.description,
            'participant_count', (SELECT COUNT(*) FROM collaboration_participants WHERE space_id = cs.id),
            'tags', cs.tags
        ) as space_data
    FROM collaboration_spaces cs
    WHERE cs.is_active = true
    AND cs.created_at >= CURRENT_DATE - INTERVAL '30 days'
    
    ORDER BY created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle post interaction (like, bookmark, share)
CREATE OR REPLACE FUNCTION toggle_post_interaction(post_uuid UUID, user_uuid UUID, interaction_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    interaction_exists BOOLEAN;
BEGIN
    -- Check if interaction exists
    SELECT EXISTS(
        SELECT 1 FROM post_interactions 
        WHERE post_id = post_uuid AND user_id = user_uuid AND interaction_type = toggle_post_interaction.interaction_type
    ) INTO interaction_exists;
    
    IF interaction_exists THEN
        -- Remove interaction
        DELETE FROM post_interactions 
        WHERE post_id = post_uuid AND user_id = user_uuid AND interaction_type = toggle_post_interaction.interaction_type;
        
        -- Update counter
        IF interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count - 1 WHERE id = post_uuid;
        ELSIF interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count - 1 WHERE id = post_uuid;
        END IF;
        
        RETURN false;
    ELSE
        -- Add interaction
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (post_uuid, user_uuid, toggle_post_interaction.interaction_type);
        
        -- Update counter
        IF interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count + 1 WHERE id = post_uuid;
        ELSIF interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count + 1 WHERE id = post_uuid;
        END IF;
        
        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add comment to post
CREATE OR REPLACE FUNCTION add_post_comment(post_uuid UUID, user_uuid UUID, comment_content TEXT, reply_to_uuid UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    comment_id UUID;
BEGIN
    -- Insert comment
    INSERT INTO post_comments (post_id, user_id, content, reply_to_id)
    VALUES (post_uuid, user_uuid, comment_content, reply_to_uuid)
    RETURNING id INTO comment_id;
    
    -- Update comment count
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = post_uuid;
    
    RETURN comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment event attendees
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events SET current_attendees = current_attendees + 1 WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement event attendees
CREATE OR REPLACE FUNCTION decrement_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events SET current_attendees = GREATEST(current_attendees - 1, 0) WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 