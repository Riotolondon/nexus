-- Fix for Row Level Security policy on users table
-- This allows new users to be created during signup

-- First, check if the policy already exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'Service role can insert users'
    ) THEN
        DROP POLICY "Service role can insert users" ON users;
    END IF;
END
$$;

-- Create policy to allow service role to insert users
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT
    WITH CHECK (true);

-- Enable the service role to bypass RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Grant permissions to the authenticated and service_role
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE users TO service_role;

-- Alternatively, if you want to temporarily disable RLS for testing
-- Uncomment the following line:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- You can re-enable it later with:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY; 