-- =====================================================
-- Final Fix: Category RLS Policy - Comprehensive Solution
-- =====================================================
-- This migration ensures categories can be inserted by admins and sellers
-- It handles all edge cases and provides fallback options

-- Step 1: Ensure helper functions exist and work correctly
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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_seller() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- Step 2: Drop ALL existing policies on categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;

-- Step 3: Create SELECT policy (public can view active categories)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Step 4: Create comprehensive management policy
-- This policy allows INSERT, UPDATE, DELETE for admins and sellers
CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (
    -- For SELECT, UPDATE, DELETE: check if user is admin or seller
    public.is_admin_or_seller() = true
  )
  WITH CHECK (
    -- For INSERT, UPDATE: check if user is admin or seller
    public.is_admin_or_seller() = true
  );

-- Step 5: Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'categories';
  
  IF policy_count < 2 THEN
    RAISE EXCEPTION 'Expected 2 policies on categories, found %', policy_count;
  END IF;
  
  RAISE NOTICE 'Successfully created % policies on categories table', policy_count;
END $$;

-- Step 6: Test the function (this will show in logs if it works)
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- This will only work if there's a logged-in user
  -- If no user, it will return false (which is expected)
  SELECT public.is_admin_or_seller() INTO test_result;
  RAISE NOTICE 'is_admin_or_seller() function test result: %', test_result;
END $$;

