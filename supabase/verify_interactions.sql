-- Verify Interactions are Saving to Database
-- This script checks that likes, bookmarks, comments are properly stored

-- 1. Check post_interactions table structure and data
SELECT 'POST INTERACTIONS TABLE:' as section;
SELECT 
    pi.id,
    pi.post_id,
    pi.user_id,
    pi.interaction_type,
    pi.created_at,
    u.name as user_name,
    cp.title as post_title
FROM post_interactions pi
LEFT JOIN users u ON pi.user_id = u.id
LEFT JOIN community_posts cp ON pi.post_id = cp.id
ORDER BY pi.created_at DESC
LIMIT 20;

-- 2. Check post_comments table structure and data
SELECT 'POST COMMENTS TABLE:' as section;
SELECT 
    pc.id,
    pc.post_id,
    pc.user_id,
    pc.content,
    pc.reply_to_id,
    pc.created_at,
    u.name as user_name,
    cp.title as post_title
FROM post_comments pc
LEFT JOIN users u ON pc.user_id = u.id
LEFT JOIN community_posts cp ON pc.post_id = cp.id
ORDER BY pc.created_at DESC
LIMIT 20;

-- 3. Check community_posts counts are updating correctly
SELECT 'COMMUNITY POSTS WITH COUNTS:' as section;
SELECT 
    cp.id,
    cp.title,
    cp.like_count,
    cp.comment_count,
    cp.share_count,
    -- Count actual interactions from post_interactions table
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'like') as actual_likes,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'bookmark') as actual_bookmarks,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'share') as actual_shares,
    -- Count actual comments
    (SELECT COUNT(*) FROM post_comments WHERE post_id = cp.id) as actual_comments
FROM community_posts cp
ORDER BY cp.created_at DESC;

-- 4. Test the toggle_post_interaction function with a sample
-- (This will test if the function works and saves data)
DO $$
DECLARE
    test_post_id UUID;
    test_user_id UUID;
    test_result JSON;
BEGIN
    -- Get a sample post and user
    SELECT id INTO test_post_id FROM community_posts LIMIT 1;
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_post_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Test like interaction
        SELECT toggle_post_interaction('like', test_post_id, test_user_id) INTO test_result;
        RAISE NOTICE 'Test like result: %', test_result;
        
        -- Test bookmark interaction
        SELECT toggle_post_interaction('bookmark', test_post_id, test_user_id) INTO test_result;
        RAISE NOTICE 'Test bookmark result: %', test_result;
        
        -- Test share interaction
        SELECT toggle_post_interaction('share', test_post_id, test_user_id) INTO test_result;
        RAISE NOTICE 'Test share result: %', test_result;
    ELSE
        RAISE NOTICE 'No test data available - need posts and users';
    END IF;
END $$;

-- 5. Test the add_post_comment function
DO $$
DECLARE
    test_post_id UUID;
    test_user_id UUID;
    test_result JSON;
BEGIN
    -- Get a sample post and user
    SELECT id INTO test_post_id FROM community_posts LIMIT 1;
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_post_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Test comment
        SELECT add_post_comment(test_post_id, test_user_id, 'Test comment from verification script', NULL) INTO test_result;
        RAISE NOTICE 'Test comment result: %', test_result;
    ELSE
        RAISE NOTICE 'No test data available for comment test';
    END IF;
END $$;

-- 6. Show interaction summary by user
SELECT 'USER INTERACTION SUMMARY:' as section;
SELECT 
    u.name as user_name,
    u.email,
    COUNT(CASE WHEN pi.interaction_type = 'like' THEN 1 END) as total_likes,
    COUNT(CASE WHEN pi.interaction_type = 'bookmark' THEN 1 END) as total_bookmarks,
    COUNT(CASE WHEN pi.interaction_type = 'share' THEN 1 END) as total_shares,
    (SELECT COUNT(*) FROM post_comments WHERE user_id = u.id) as total_comments
FROM users u
LEFT JOIN post_interactions pi ON u.id = pi.user_id
GROUP BY u.id, u.name, u.email
ORDER BY (COUNT(pi.id) + (SELECT COUNT(*) FROM post_comments WHERE user_id = u.id)) DESC;

-- 7. Check for any data inconsistencies
SELECT 'DATA CONSISTENCY CHECK:' as section;
SELECT 
    cp.title,
    cp.like_count as stored_likes,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'like') as actual_likes,
    cp.comment_count as stored_comments,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = cp.id) as actual_comments,
    cp.share_count as stored_shares,
    (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'share') as actual_shares,
    CASE 
        WHEN cp.like_count != (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'like') 
        THEN 'LIKE COUNT MISMATCH'
        WHEN cp.comment_count != (SELECT COUNT(*) FROM post_comments WHERE post_id = cp.id) 
        THEN 'COMMENT COUNT MISMATCH'
        WHEN cp.share_count != (SELECT COUNT(*) FROM post_interactions WHERE post_id = cp.id AND interaction_type = 'share') 
        THEN 'SHARE COUNT MISMATCH'
        ELSE 'COUNTS OK'
    END as status
FROM community_posts cp;

SELECT 'Verification complete! Check the results above to ensure all interactions are saving properly.' as message; 