-- Create a stored procedure to bypass RLS when creating user profiles
-- Copy and paste this directly into your Supabase SQL Editor

-- Create the function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_university_id UUID,
    user_study_level TEXT DEFAULT 'undergraduate',
    user_field_of_study TEXT DEFAULT '',
    user_bio TEXT DEFAULT ''
) RETURNS void AS $$
BEGIN
    -- Insert directly into the users table, bypassing RLS
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        university_id, 
        study_level, 
        field_of_study, 
        bio, 
        interests, 
        skills, 
        is_verified, 
        created_at, 
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_name,
        user_university_id,
        user_study_level,
        user_field_of_study,
        user_bio,
        '{}',  -- empty interests array
        '{}',  -- empty skills array
        false, -- not verified
        NOW(),
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 