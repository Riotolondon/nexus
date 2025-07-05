-- Fix User Authentication Issues
-- This script addresses the "JSON object requested, multiple (or no) rows returned" error
-- by ensuring proper RLS policies and handling missing user profiles

-- First, check if the users INSERT policy exists and create it if not
DO $$
BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        -- Create the missing INSERT policy
        EXECUTE 'CREATE POLICY "Users can create their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id)';
        RAISE NOTICE 'Created INSERT policy for users table';
    ELSE
        RAISE NOTICE 'INSERT policy for users table already exists';
    END IF;
END $$;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create or replace function to safely get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_id UUID, user_email TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    university_id UUID,
    interests TEXT[],
    profile_image_url TEXT,
    bio TEXT,
    study_level VARCHAR,
    field_of_study VARCHAR,
    graduation_year INTEGER,
    skills TEXT[],
    is_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    universities JSON
) AS $$
DECLARE
    user_exists BOOLEAN;
    user_record RECORD;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM users WHERE users.id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Create basic user profile
        INSERT INTO users (
            id, 
            email, 
            name, 
            university_id, 
            study_level, 
            field_of_study, 
            interests, 
            bio, 
            skills, 
            is_verified
        ) VALUES (
            user_id,
            user_email,
            COALESCE(SPLIT_PART(user_email, '@', 1), 'User'),
            NULL,
            'undergraduate',
            '',
            '{}',
            '',
            '{}',
            false
        );
        
        RAISE NOTICE 'Created new user profile for %', user_id;
    END IF;
    
    -- Return user data with university info
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.university_id,
        u.interests,
        u.profile_image_url,
        u.bio,
        u.study_level,
        u.field_of_study,
        u.graduation_year,
        u.skills,
        u.is_verified,
        u.created_at,
        u.updated_at,
        CASE 
            WHEN univ.id IS NOT NULL THEN 
                JSON_BUILD_OBJECT(
                    'id', univ.id,
                    'name', univ.name,
                    'short_name', univ.short_name,
                    'logo_url', univ.logo_url,
                    'primary_color', univ.primary_color,
                    'location', univ.location
                )
            ELSE NULL
        END as universities
    FROM users u
    LEFT JOIN universities univ ON u.university_id = univ.id
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION get_or_create_user_profile IS 'Safely gets existing user profile or creates a new one if it does not exist';

-- Test the function (optional - remove in production)
-- SELECT * FROM get_or_create_user_profile('00000000-0000-0000-0000-000000000000'::UUID, 'test@example.com');

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE '✅ User authentication fix completed successfully!';
    RAISE NOTICE 'Users can now sign in and their profiles will be created automatically if missing.';
END $$; 