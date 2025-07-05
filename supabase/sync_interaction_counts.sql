-- Sync Interaction Counts in Database
-- This script ensures all counts in community_posts match actual data

-- 1. Update like_count to match actual likes in post_interactions
UPDATE community_posts 
SET like_count = (
    SELECT COUNT(*) 
    FROM post_interactions 
    WHERE post_id = community_posts.id 
    AND interaction_type = 'like'
);

-- 2. Update share_count to match actual shares in post_interactions  
UPDATE community_posts 
SET share_count = (
    SELECT COUNT(*) 
    FROM post_interactions 
    WHERE post_id = community_posts.id 
    AND interaction_type = 'share'
);

-- 3. Update comment_count to match actual comments in post_comments
UPDATE community_posts 
SET comment_count = (
    SELECT COUNT(*) 
    FROM post_comments 
    WHERE post_id = community_posts.id
);

-- 4. Create a function to get user interactions for a post (for UI state)
CREATE OR REPLACE FUNCTION get_user_post_interactions(p_post_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    interactions JSON;
BEGIN
    SELECT json_build_object(
        'has_liked', EXISTS(
            SELECT 1 FROM post_interactions 
            WHERE post_id = p_post_id 
            AND user_id = p_user_id 
            AND interaction_type = 'like'
        ),
        'has_bookmarked', EXISTS(
            SELECT 1 FROM post_interactions 
            WHERE post_id = p_post_id 
            AND user_id = p_user_id 
            AND interaction_type = 'bookmark'
        ),
        'has_shared', EXISTS(
            SELECT 1 FROM post_interactions 
            WHERE post_id = p_post_id 
            AND user_id = p_user_id 
            AND interaction_type = 'share'
        )
    ) INTO interactions;
    
    RETURN interactions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to get post comments with user info
CREATE OR REPLACE FUNCTION get_post_comments(p_post_id UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    user_id UUID,
    user_name TEXT,
    reply_to_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    is_edited BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id,
        pc.content,
        pc.user_id,
        COALESCE(u.name, 'Anonymous') as user_name,
        pc.reply_to_id,
        pc.created_at,
        pc.is_edited
    FROM post_comments pc
    LEFT JOIN users u ON pc.user_id = u.id
    WHERE pc.post_id = p_post_id
    ORDER BY pc.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create triggers to automatically update counts when interactions change
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update counts for the affected post
    IF TG_TABLE_NAME = 'post_interactions' THEN
        -- Handle post_interactions changes
        IF TG_OP = 'INSERT' THEN
            -- Increment count
            IF NEW.interaction_type = 'like' THEN
                UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
            ELSIF NEW.interaction_type = 'share' THEN
                UPDATE community_posts SET share_count = share_count + 1 WHERE id = NEW.post_id;
            END IF;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            -- Decrement count
            IF OLD.interaction_type = 'like' THEN
                UPDATE community_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
            ELSIF OLD.interaction_type = 'share' THEN
                UPDATE community_posts SET share_count = GREATEST(share_count - 1, 0) WHERE id = OLD.post_id;
            END IF;
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        -- Handle post_comments changes
        IF TG_OP = 'INSERT' THEN
            UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_post_interaction_counts ON post_interactions;
DROP TRIGGER IF EXISTS trigger_update_post_comment_counts ON post_comments;

-- Create triggers for automatic count updates
CREATE TRIGGER trigger_update_post_interaction_counts
    AFTER INSERT OR DELETE ON post_interactions
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER trigger_update_post_comment_counts
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- 7. Show the current state after sync
SELECT 'COUNTS AFTER SYNC:' as section;
SELECT 
    cp.title,
    cp.like_count,
    cp.comment_count,
    cp.share_count,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'like') as actual_likes,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'bookmark') as actual_bookmarks,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'share') as actual_shares,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = cp.id) as actual_comments
FROM community_posts cp
ORDER BY cp.created_at DESC;

SELECT 'Database interaction counts synchronized successfully! Triggers added for automatic updates.' as message; 