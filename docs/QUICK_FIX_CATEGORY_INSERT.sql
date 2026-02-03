-- =====================================================
-- QUICK FIX: Run this in Supabase SQL Editor
-- =====================================================
-- This script will fix the category INSERT issue immediately

-- Step 1: Ensure your user has admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
   OR id = auth.uid();

-- If you don't have a profile, create one
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 2: Create the helper function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin_or_seller()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  );
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_seller() TO authenticated, anon, service_role;

-- Step 4: Drop and recreate the policy with WITH CHECK
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (public.is_admin_or_seller() = true)
  WITH CHECK (public.is_admin_or_seller() = true);

-- Step 5: Verify everything
SELECT 
  'Your role:' as check_type,
  role as result
FROM profiles 
WHERE id = auth.uid()
UNION ALL
SELECT 
  'Function exists:' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin_or_seller'
  ) THEN 'YES' ELSE 'NO' END as result
UNION ALL
SELECT 
  'Function returns:' as check_type,
  CASE WHEN public.is_admin_or_seller() THEN 'TRUE' ELSE 'FALSE' END as result
UNION ALL
SELECT 
  'Policy exists:' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Admins and sellers can manage categories'
  ) THEN 'YES' ELSE 'NO' END as result;



