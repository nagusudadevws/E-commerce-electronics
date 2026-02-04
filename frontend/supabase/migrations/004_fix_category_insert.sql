-- =====================================================
-- Quick Fix: Category INSERT Policy
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- when adding categories by adding the missing WITH CHECK clause

-- Drop and recreate the categories policy with WITH CHECK clause
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (public.is_admin_or_seller())
  WITH CHECK (public.is_admin_or_seller());

-- If the helper function doesn't exist yet, create it
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




