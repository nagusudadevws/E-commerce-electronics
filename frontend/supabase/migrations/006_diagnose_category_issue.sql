-- =====================================================
-- Diagnostic Queries for Category INSERT Issue
-- =====================================================
-- Run these queries to diagnose why category insertion is failing

-- 1. Check if the helper function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_admin_or_seller';

-- 2. Check current user's role in profiles table
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 3. Test if the helper function returns true for current user
SELECT 
  auth.uid() as current_user_id,
  public.is_admin_or_seller() as is_admin_or_seller;

-- 4. Check all policies on categories table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;

-- 5. Check if RLS is enabled on categories
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'categories';

-- 6. Check if current user has a profile
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
    THEN 'Profile exists'
    ELSE 'No profile found'
  END as profile_status;

-- 7. Check all users and their roles (if you're admin)
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;




