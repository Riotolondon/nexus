-- Fix function signature to match client expectations
-- The client is calling: toggle_post_interaction(interaction_type, post_uuid, user_uuid)

-- Drop any existing versions
DROP FUNCTION IF EXISTS toggle_post_interaction(uuid, uuid, varchar);
DROP FUNCTION IF EXISTS toggle_post_interaction(uuid, uuid, text);
DROP FUNCTION IF EXISTS toggle_post_interaction(text, uuid, uuid);

-- Create function with the exact signature the client expects
CREATE OR REPLACE FUNCTION toggle_post_interaction(
    interaction_type TEXT,
    post_uuid UUID, 
    user_uuid UUID
)
RETURNS JSON AS $$
DECLARE
    interaction_exists BOOLEAN;
    new_count INTEGER;
    result JSON;
BEGIN
    -- Check if interaction already exists
    SELECT EXISTS(
        SELECT 1 FROM post_interactions 
        WHERE post_id = post_uuid 
        AND user_id = user_uuid 
        AND post_interactions.interaction_type = toggle_post_interaction.interaction_type
    ) INTO interaction_exists;
    
    IF interaction_exists THEN
        -- Remove interaction
        DELETE FROM post_interactions 
        WHERE post_id = post_uuid 
        AND user_id = user_uuid 
        AND post_interactions.interaction_type = toggle_post_interaction.interaction_type;
        
        -- Update count in community_posts
        IF toggle_post_interaction.interaction_type = 'like' THEN
            UPDATE community_posts 
            SET like_count = GREATEST(like_count - 1, 0) 
            WHERE id = post_uuid;
            
            SELECT like_count INTO new_count 
            FROM community_posts 
            WHERE id = post_uuid;
            
        ELSIF toggle_post_interaction.interaction_type = 'share' THEN
            UPDATE community_posts 
            SET share_count = GREATEST(share_count - 1, 0) 
            WHERE id = post_uuid;
            
            SELECT share_count INTO new_count 
            FROM community_posts 
            WHERE id = post_uuid;
            
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object(
            'action', 'removed', 
            'interaction_type', toggle_post_interaction.interaction_type,
            'count', COALESCE(new_count, 0)
        );
        
    ELSE
        -- Add interaction
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (post_uuid, user_uuid, toggle_post_interaction.interaction_type);
        
        -- Update count in community_posts
        IF toggle_post_interaction.interaction_type = 'like' THEN
            UPDATE community_posts 
            SET like_count = like_count + 1 
            WHERE id = post_uuid;
            
            SELECT like_count INTO new_count 
            FROM community_posts 
            WHERE id = post_uuid;
            
        ELSIF toggle_post_interaction.interaction_type = 'share' THEN
            UPDATE community_posts 
            SET share_count = share_count + 1 
            WHERE id = post_uuid;
            
            SELECT share_count INTO new_count 
            FROM community_posts 
            WHERE id = post_uuid;
            
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object(
            'action', 'added', 
            'interaction_type', toggle_post_interaction.interaction_type,
            'count', COALESCE(new_count, 0)
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the add_post_comment function signature if needed
DROP FUNCTION IF EXISTS add_post_comment(uuid, uuid, text, uuid);
DROP FUNCTION IF EXISTS add_post_comment(uuid, uuid, text);

CREATE OR REPLACE FUNCTION add_post_comment(
    post_uuid UUID, 
    user_uuid UUID, 
    comment_content TEXT, 
    reply_to_uuid UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_comment_id UUID;
    comment_result JSON;
    user_name TEXT;
BEGIN
    -- Get user name
    SELECT name INTO user_name FROM users WHERE id = user_uuid;
    
    -- Insert the comment
    INSERT INTO post_comments (post_id, user_id, content, reply_to_id)
    VALUES (post_uuid, user_uuid, comment_content, reply_to_uuid)
    RETURNING id INTO new_comment_id;
    
    -- Update comment count in community_posts
    UPDATE community_posts 
    SET comment_count = comment_count + 1 
    WHERE id = post_uuid;
    
    -- Return the comment details
    SELECT json_build_object(
        'id', new_comment_id,
        'content', comment_content,
        'created_at', NOW(),
        'user_id', user_uuid,
        'user_name', COALESCE(user_name, 'Anonymous'),
        'reply_to_id', reply_to_uuid,
        'post_id', post_uuid
    ) INTO comment_result;
    
    RETURN comment_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Function signatures fixed to match client expectations!' as message; 