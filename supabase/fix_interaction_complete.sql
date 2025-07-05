-- Complete fix for toggle_post_interaction function
-- This eliminates all ambiguity by using different parameter names

-- Drop the existing function completely
DROP FUNCTION IF EXISTS toggle_post_interaction(uuid, uuid, varchar);
DROP FUNCTION IF EXISTS toggle_post_interaction(uuid, uuid, text);

-- Create the function with unambiguous parameter names
CREATE OR REPLACE FUNCTION toggle_post_interaction(
    p_post_id UUID, 
    p_user_id UUID, 
    p_interaction_type TEXT
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
        WHERE post_id = p_post_id 
        AND user_id = p_user_id 
        AND interaction_type = p_interaction_type
    ) INTO interaction_exists;
    
    IF interaction_exists THEN
        -- Remove interaction
        DELETE FROM post_interactions 
        WHERE post_id = p_post_id 
        AND user_id = p_user_id 
        AND interaction_type = p_interaction_type;
        
        -- Update count in community_posts
        IF p_interaction_type = 'like' THEN
            UPDATE community_posts 
            SET like_count = GREATEST(like_count - 1, 0) 
            WHERE id = p_post_id;
            
            SELECT like_count INTO new_count 
            FROM community_posts 
            WHERE id = p_post_id;
            
        ELSIF p_interaction_type = 'share' THEN
            UPDATE community_posts 
            SET share_count = GREATEST(share_count - 1, 0) 
            WHERE id = p_post_id;
            
            SELECT share_count INTO new_count 
            FROM community_posts 
            WHERE id = p_post_id;
            
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object(
            'action', 'removed', 
            'interaction_type', p_interaction_type,
            'count', COALESCE(new_count, 0)
        );
        
    ELSE
        -- Add interaction
        INSERT INTO post_interactions (post_id, user_id, interaction_type)
        VALUES (p_post_id, p_user_id, p_interaction_type);
        
        -- Update count in community_posts
        IF p_interaction_type = 'like' THEN
            UPDATE community_posts 
            SET like_count = like_count + 1 
            WHERE id = p_post_id;
            
            SELECT like_count INTO new_count 
            FROM community_posts 
            WHERE id = p_post_id;
            
        ELSIF p_interaction_type = 'share' THEN
            UPDATE community_posts 
            SET share_count = share_count + 1 
            WHERE id = p_post_id;
            
            SELECT share_count INTO new_count 
            FROM community_posts 
            WHERE id = p_post_id;
            
        ELSE
            -- For bookmark, we don't update a count in community_posts
            new_count := 0;
        END IF;
        
        result := json_build_object(
            'action', 'added', 
            'interaction_type', p_interaction_type,
            'count', COALESCE(new_count, 0)
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the add_post_comment function while we're at it
DROP FUNCTION IF EXISTS add_post_comment(uuid, uuid, text, uuid);

CREATE OR REPLACE FUNCTION add_post_comment(
    p_post_id UUID, 
    p_user_id UUID, 
    p_content TEXT, 
    p_reply_to_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_comment_id UUID;
    comment_result JSON;
    user_name TEXT;
BEGIN
    -- Get user name
    SELECT name INTO user_name FROM users WHERE id = p_user_id;
    
    -- Insert the comment
    INSERT INTO post_comments (post_id, user_id, content, reply_to_id)
    VALUES (p_post_id, p_user_id, p_content, p_reply_to_id)
    RETURNING id INTO new_comment_id;
    
    -- Update comment count in community_posts
    UPDATE community_posts 
    SET comment_count = comment_count + 1 
    WHERE id = p_post_id;
    
    -- Return the comment details
    SELECT json_build_object(
        'id', new_comment_id,
        'content', p_content,
        'created_at', NOW(),
        'user_id', p_user_id,
        'user_name', COALESCE(user_name, 'Anonymous'),
        'reply_to_id', p_reply_to_id,
        'post_id', p_post_id
    ) INTO comment_result;
    
    RETURN comment_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'All interaction functions fixed successfully! No more ambiguous references.' as message; 