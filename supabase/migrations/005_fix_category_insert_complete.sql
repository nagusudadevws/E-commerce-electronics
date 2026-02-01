-- =====================================================
-- Complete Fix: Category INSERT Policy
-- =====================================================
-- This is a comprehensive fix that ensures categories can be inserted
-- by checking multiple conditions and ensuring the helper function exists

-- First, ensure the helper function exists
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin_or_seller() TO authenticated, anon;

-- Drop ALL existing policies on categories to start fresh
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

-- Recreate the SELECT policy (public can view active categories)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Recreate the management policy with both USING and WITH CHECK
-- This policy allows admins and sellers to INSERT, UPDATE, DELETE
CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (
    public.is_admin_or_seller() = true
  )
  WITH CHECK (
    public.is_admin_or_seller() = true
  );

-- Verify the policy was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Admins and sellers can manage categories'
  ) THEN
    RAISE EXCEPTION 'Policy creation failed';
  END IF;
END $$;

