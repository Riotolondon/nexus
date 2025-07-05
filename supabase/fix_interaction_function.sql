-- Fix the toggle_post_interaction function to resolve ambiguous column reference
-- This script fixes the ambiguous column reference issue

-- Drop and recreate the toggle_post_interaction function with proper column qualification
DROP FUNCTION IF EXISTS toggle_post_interaction(uuid, uuid, varchar);

CREATE OR REPLACE FUNCTION toggle_post_interaction(post_uuid UUID, user_uuid UUID, interaction_type VARCHAR)
RETURNS JSON AS $$
DECLARE
    interaction_exists BOOLEAN;
    new_count INTEGER;
    result JSON;
BEGIN
    -- Check if interaction already exists (qualify the column names)
    SELECT EXISTS(
        SELECT 1 FROM post_interactions pi
        WHERE pi.post_id = post_uuid 
        AND pi.user_id = user_uuid 
        AND pi.interaction_type = toggle_post_interaction.interaction_type
    ) INTO interaction_exists;
    
    IF interaction_exists THEN
        -- Remove interaction (qualify the column names)
        DELETE FROM post_interactions 
        WHERE post_id = post_uuid 
        AND user_id = user_uuid 
        AND post_interactions.interaction_type = toggle_post_interaction.interaction_type;
        
        -- Update count in community_posts
        IF toggle_post_interaction.interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count - 1 WHERE id = post_uuid;
            SELECT like_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSIF toggle_post_interaction.interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count - 1 WHERE id = post_uuid;
            SELECT share_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object('action', 'removed', 'count', new_count);
    ELSE
        -- Add interaction
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (post_uuid, user_uuid, toggle_post_interaction.interaction_type);
        
        -- Update count in community_posts
        IF toggle_post_interaction.interaction_type = 'like' THEN
            UPDATE community_posts SET like_count = like_count + 1 WHERE id = post_uuid;
            SELECT like_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSIF toggle_post_interaction.interaction_type = 'share' THEN
            UPDATE community_posts SET share_count = share_count + 1 WHERE id = post_uuid;
            SELECT share_count INTO new_count FROM community_posts WHERE id = post_uuid;
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object('action', 'added', 'count', new_count);
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Post interaction function fixed successfully! Ambiguous column reference resolved.' as message; 