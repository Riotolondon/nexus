-- Advanced Database Functions for Solus Nexus
-- These functions provide powerful features that would be difficult/expensive with Firebase

-- 1. Full-text search across all content
CREATE OR REPLACE FUNCTION search_all_content(search_query TEXT)
RETURNS TABLE (
    result_type TEXT,
    result_id UUID,
    title TEXT,
    description TEXT,
    relevance REAL,
    university_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Search collaboration spaces
    SELECT 
        'collaboration_space'::TEXT as result_type,
        cs.id as result_id,
        cs.title,
        cs.description,
        ts_rank(to_tsvector('english', cs.title || ' ' || cs.description), plainto_tsquery('english', search_query)) as relevance,
        'Multiple Universities'::TEXT as university_name
    FROM collaboration_spaces cs
    WHERE to_tsvector('english', cs.title || ' ' || cs.description) @@ plainto_tsquery('english', search_query)
    AND cs.is_active = true
    
    UNION ALL
    
    -- Search career opportunities
    SELECT 
        'career_opportunity'::TEXT as result_type,
        co.id as result_id,
        co.title,
        co.description,
        ts_rank(to_tsvector('english', co.title || ' ' || co.description || ' ' || co.company), plainto_tsquery('english', search_query)) as relevance,
        co.company as university_name
    FROM career_opportunities co
    WHERE to_tsvector('english', co.title || ' ' || co.description || ' ' || co.company) @@ plainto_tsquery('english', search_query)
    AND co.is_active = true
    
    UNION ALL
    
    -- Search academic resources
    SELECT 
        'academic_resource'::TEXT as result_type,
        ar.id as result_id,
        ar.title,
        COALESCE(ar.description, ar.subject || ' - ' || ar.course_code) as description,
        ts_rank(to_tsvector('english', ar.title || ' ' || COALESCE(ar.description, '') || ' ' || COALESCE(ar.subject, '')), plainto_tsquery('english', search_query)) as relevance,
        u.name as university_name
    FROM academic_resources ar
    LEFT JOIN universities u ON ar.university_id = u.id
    WHERE to_tsvector('english', ar.title || ' ' || COALESCE(ar.description, '') || ' ' || COALESCE(ar.subject, '')) @@ plainto_tsquery('english', search_query)
    AND ar.is_public = true
    
    ORDER BY relevance DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Get personalized recommendations for a user
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_uuid UUID)
RETURNS TABLE (
    recommendation_type TEXT,
    item_id UUID,
    title TEXT,
    description TEXT,
    score INTEGER,
    reason TEXT
) AS $$
DECLARE
    user_interests TEXT[];
    user_university_id UUID;
    user_field TEXT;
BEGIN
    -- Get user data
    SELECT interests, university_id, field_of_study 
    INTO user_interests, user_university_id, user_field
    FROM users WHERE id = user_uuid;
    
    RETURN QUERY
    -- Recommend collaboration spaces based on interests and university
    SELECT 
        'collaboration_space'::TEXT as recommendation_type,
        cs.id as item_id,
        cs.title,
        cs.description,
        (
            -- Score based on common interests
            (SELECT COUNT(*) FROM unnest(cs.tags) as tag WHERE tag = ANY(user_interests)) * 10 +
            -- Bonus for same university
            CASE WHEN user_university_id = ANY(cs.university_ids) THEN 20 ELSE 0 END +
            -- Bonus for active spaces
            CASE WHEN cs.is_active THEN 5 ELSE 0 END
        )::INTEGER as score,
        CASE 
            WHEN user_university_id = ANY(cs.university_ids) AND 
                 (SELECT COUNT(*) FROM unnest(cs.tags) as tag WHERE tag = ANY(user_interests)) > 0
            THEN 'Matches your interests and university'
            WHEN user_university_id = ANY(cs.university_ids)
            THEN 'Students from your university'
            WHEN (SELECT COUNT(*) FROM unnest(cs.tags) as tag WHERE tag = ANY(user_interests)) > 0
            THEN 'Matches your interests'
            ELSE 'Popular collaboration space'
        END as reason
    FROM collaboration_spaces cs
    WHERE cs.is_active = true
    AND cs.id NOT IN (
        SELECT space_id FROM collaboration_participants WHERE user_id = user_uuid
    )
    
    UNION ALL
    
    -- Recommend career opportunities
    SELECT 
        'career_opportunity'::TEXT as recommendation_type,
        co.id as item_id,
        co.title,
        co.description,
        (
            -- Score based on field match
            CASE WHEN user_field IS NOT NULL AND position(LOWER(user_field) in LOWER(co.title || ' ' || co.description)) > 0 THEN 30 ELSE 0 END +
            -- Score based on university eligibility
            CASE WHEN user_university_id = ANY(co.university_ids) OR array_length(co.university_ids, 1) IS NULL THEN 15 ELSE 0 END +
            -- Bonus for recent postings
            CASE WHEN co.created_at > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END
        )::INTEGER as score,
        CASE 
            WHEN user_field IS NOT NULL AND position(LOWER(user_field) in LOWER(co.title || ' ' || co.description)) > 0
            THEN 'Matches your field of study'
            WHEN user_university_id = ANY(co.university_ids)
            THEN 'Available to your university'
            ELSE 'Popular opportunity'
        END as reason
    FROM career_opportunities co
    WHERE co.is_active = true
    AND (co.application_deadline IS NULL OR co.application_deadline > CURRENT_DATE)
    
    ORDER BY score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Get trending content (most active in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_content()
RETURNS TABLE (
    content_type TEXT,
    content_id UUID,
    title TEXT,
    activity_score BIGINT,
    recent_activity TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Trending collaboration spaces (by recent messages)
    SELECT 
        'collaboration_space'::TEXT as content_type,
        cs.id as content_id,
        cs.title,
        COUNT(m.id) as activity_score,
        'messages in last 7 days'::TEXT as recent_activity
    FROM collaboration_spaces cs
    LEFT JOIN messages m ON cs.id = m.space_id 
        AND m.created_at > NOW() - INTERVAL '7 days'
    WHERE cs.is_active = true
    GROUP BY cs.id, cs.title
    HAVING COUNT(m.id) > 0
    
    UNION ALL
    
    -- Trending career opportunities (by views/applications)
    SELECT 
        'career_opportunity'::TEXT as content_type,
        co.id as content_id,
        co.title,
        (co.view_count + co.application_count * 5)::BIGINT as activity_score,
        'views and applications'::TEXT as recent_activity
    FROM career_opportunities co
    WHERE co.is_active = true
    AND co.created_at > NOW() - INTERVAL '30 days'
    
    UNION ALL
    
    -- Trending academic resources (by downloads and ratings)
    SELECT 
        'academic_resource'::TEXT as content_type,
        ar.id as content_id,
        ar.title,
        (ar.download_count + COALESCE(ar.rating, 0) * 10)::BIGINT as activity_score,
        'downloads and ratings'::TEXT as recent_activity
    FROM academic_resources ar
    WHERE ar.is_public = true
    AND ar.created_at > NOW() - INTERVAL '30 days'
    
    ORDER BY activity_score DESC
    LIMIT 15;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get university statistics and insights
CREATE OR REPLACE FUNCTION get_university_insights(university_uuid UUID)
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    metric_description TEXT
) AS $$
DECLARE
    university_name TEXT;
BEGIN
    SELECT name INTO university_name FROM universities WHERE id = university_uuid;
    
    RETURN QUERY
    SELECT 
        'Total Students'::TEXT as metric_name,
        COUNT(*)::TEXT as metric_value,
        'Registered students from ' || university_name as metric_description
    FROM users WHERE university_id = university_uuid
    
    UNION ALL
    
    SELECT 
        'Active Collaborations'::TEXT as metric_name,
        COUNT(*)::TEXT as metric_value,
        'Active collaboration spaces involving ' || university_name as metric_description
    FROM collaboration_spaces cs
    WHERE university_uuid = ANY(cs.university_ids) AND cs.is_active = true
    
    UNION ALL
    
    SELECT 
        'Career Opportunities'::TEXT as metric_name,
        COUNT(*)::TEXT as metric_value,
        'Current career opportunities for ' || university_name as metric_description
    FROM career_opportunities co
    WHERE (university_uuid = ANY(co.university_ids) OR array_length(co.university_ids, 1) IS NULL)
    AND co.is_active = true
    AND (co.application_deadline IS NULL OR co.application_deadline > CURRENT_DATE)
    
    UNION ALL
    
    SELECT 
        'Shared Resources'::TEXT as metric_name,
        COUNT(*)::TEXT as metric_value,
        'Academic resources shared by ' || university_name || ' students' as metric_description
    FROM academic_resources ar
    WHERE ar.university_id = university_uuid AND ar.is_public = true
    
    UNION ALL
    
    SELECT 
        'Top Study Field'::TEXT as metric_name,
        field_of_study as metric_value,
        'Most popular field of study at ' || university_name as metric_description
    FROM (
        SELECT field_of_study, COUNT(*) as student_count
        FROM users 
        WHERE university_id = university_uuid AND field_of_study IS NOT NULL
        GROUP BY field_of_study
        ORDER BY student_count DESC
        LIMIT 1
    ) top_field;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Advanced collaboration matching (find potential study partners)
CREATE OR REPLACE FUNCTION find_study_partners(user_uuid UUID)
RETURNS TABLE (
    partner_id UUID,
    partner_name TEXT,
    university_name TEXT,
    common_interests TEXT[],
    compatibility_score INTEGER,
    field_match BOOLEAN
) AS $$
DECLARE
    user_interests TEXT[];
    user_university_id UUID;
    user_field TEXT;
BEGIN
    -- Get user data
    SELECT interests, university_id, field_of_study 
    INTO user_interests, user_university_id, user_field
    FROM users WHERE id = user_uuid;
    
    RETURN QUERY
    SELECT 
        u.id as partner_id,
        u.name as partner_name,
        uni.name as university_name,
        (SELECT array_agg(interest) FROM unnest(u.interests) as interest WHERE interest = ANY(user_interests)) as common_interests,
        (
            -- Base score for same university
            CASE WHEN u.university_id = user_university_id THEN 20 ELSE 5 END +
            -- Score for common interests (5 points each)
            (SELECT COUNT(*) FROM unnest(u.interests) as interest WHERE interest = ANY(user_interests)) * 5 +
            -- Bonus for same field of study
            CASE WHEN u.field_of_study = user_field THEN 15 ELSE 0 END +
            -- Bonus for being verified
            CASE WHEN u.is_verified THEN 5 ELSE 0 END
        )::INTEGER as compatibility_score,
        (u.field_of_study = user_field) as field_match
    FROM users u
    JOIN universities uni ON u.university_id = uni.id
    WHERE u.id != user_uuid
    AND (
        -- Same university OR at least 2 common interests
        u.university_id = user_university_id OR
        (SELECT COUNT(*) FROM unnest(u.interests) as interest WHERE interest = ANY(user_interests)) >= 2
    )
    ORDER BY compatibility_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Content moderation and reporting
CREATE OR REPLACE FUNCTION report_content(
    user_uuid UUID,
    content_type TEXT,
    content_id UUID,
    report_reason TEXT,
    report_details TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO content_reports (
        reporter_id,
        content_type,
        content_id,
        reason,
        details,
        created_at
    ) VALUES (
        user_uuid,
        content_type,
        content_id,
        report_reason,
        report_details,
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the content_reports table for the function above
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

-- 7. Analytics function for admin dashboard
CREATE OR REPLACE FUNCTION get_platform_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    metric_name TEXT,
    current_value BIGINT,
    previous_value BIGINT,
    change_percentage DECIMAL(5,2)
) AS $$
DECLARE
    current_period_start DATE := CURRENT_DATE - days_back;
    previous_period_start DATE := CURRENT_DATE - (days_back * 2);
    previous_period_end DATE := CURRENT_DATE - days_back;
BEGIN
    RETURN QUERY
    -- User registrations
    SELECT 
        'New Users'::TEXT as metric_name,
        (SELECT COUNT(*) FROM users WHERE created_at::DATE >= current_period_start) as current_value,
        (SELECT COUNT(*) FROM users WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) as previous_value,
        CASE 
            WHEN (SELECT COUNT(*) FROM users WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) = 0 THEN 100.0
            ELSE ROUND(
                ((SELECT COUNT(*) FROM users WHERE created_at::DATE >= current_period_start)::DECIMAL - 
                 (SELECT COUNT(*) FROM users WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL) / 
                (SELECT COUNT(*) FROM users WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL * 100, 2
            )
        END as change_percentage
    
    UNION ALL
    
    -- Collaboration spaces created
    SELECT 
        'New Collaboration Spaces'::TEXT as metric_name,
        (SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= current_period_start) as current_value,
        (SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) as previous_value,
        CASE 
            WHEN (SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) = 0 THEN 100.0
            ELSE ROUND(
                ((SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= current_period_start)::DECIMAL - 
                 (SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL) / 
                (SELECT COUNT(*) FROM collaboration_spaces WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL * 100, 2
            )
        END as change_percentage
    
    UNION ALL
    
    -- Messages sent
    SELECT 
        'Messages Sent'::TEXT as metric_name,
        (SELECT COUNT(*) FROM messages WHERE created_at::DATE >= current_period_start) as current_value,
        (SELECT COUNT(*) FROM messages WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) as previous_value,
        CASE 
            WHEN (SELECT COUNT(*) FROM messages WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end) = 0 THEN 100.0
            ELSE ROUND(
                ((SELECT COUNT(*) FROM messages WHERE created_at::DATE >= current_period_start)::DECIMAL - 
                 (SELECT COUNT(*) FROM messages WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL) / 
                (SELECT COUNT(*) FROM messages WHERE created_at::DATE >= previous_period_start AND created_at::DATE < previous_period_end)::DECIMAL * 100, 2
            )
        END as change_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Notification trigger function
CREATE OR REPLACE FUNCTION create_notification_on_message()
RETURNS TRIGGER AS $$
DECLARE
    space_title TEXT;
    participant_ids UUID[];
BEGIN
    -- Get space title and participants
    SELECT title INTO space_title FROM collaboration_spaces WHERE id = NEW.space_id;
    SELECT array_agg(user_id) INTO participant_ids 
    FROM collaboration_participants 
    WHERE space_id = NEW.space_id AND user_id != NEW.user_id;
    
    -- Create notifications for all participants except the sender
    INSERT INTO notifications (user_id, title, message, type, related_id)
    SELECT 
        unnest(participant_ids),
        'New message in ' || space_title,
        'You have a new message in your collaboration space',
        'collaboration',
        NEW.space_id
    WHERE array_length(participant_ids, 1) > 0;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
DROP TRIGGER IF EXISTS notify_on_new_message ON messages;
CREATE TRIGGER notify_on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_message();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON users USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_tags_gin ON collaboration_spaces USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_university_ids_gin ON collaboration_spaces USING GIN(university_ids);
CREATE INDEX IF NOT EXISTS idx_career_opportunities_tags_gin ON career_opportunities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_career_opportunities_university_ids_gin ON career_opportunities USING GIN(university_ids);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_desc ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_fts ON collaboration_spaces USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_career_opportunities_fts ON career_opportunities USING GIN(to_tsvector('english', title || ' ' || description || ' ' || company));
CREATE INDEX IF NOT EXISTS idx_academic_resources_fts ON academic_resources USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(subject, ''))); 