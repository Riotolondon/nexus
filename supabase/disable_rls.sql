-- Simple script to disable Row Level Security on the users table
-- Copy and paste this directly into your Supabase SQL Editor

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create an INSERT policy for the users table (will be used when RLS is re-enabled)
CREATE POLICY "Allow all inserts to users table" ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO anon;

-- To re-enable RLS later (after testing), run:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 