-- =====================================================
-- Fix RLS Infinite Recursion Issue
-- =====================================================
-- This migration fixes the infinite recursion error in RLS policies
-- by creating a SECURITY DEFINER function that can check user roles
-- without triggering RLS policies

-- Create a function to check if current user is admin (bypasses RLS)
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

-- Create a function to check if current user is admin or seller
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

-- Create a function to get user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Drop and recreate the "Admins can view all profiles" policy to avoid recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Fix categories policy to use the function
-- FOR ALL requires both USING (for SELECT/UPDATE/DELETE) and WITH CHECK (for INSERT/UPDATE)
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (public.is_admin_or_seller())
  WITH CHECK (public.is_admin_or_seller());

-- Fix products policy to use the function
DROP POLICY IF EXISTS "Admins can manage all products" ON products;

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Fix vendors policies to use the function
DROP POLICY IF EXISTS "Vendors can view own vendor profile" ON vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON vendors;

CREATE POLICY "Vendors can view own vendor profile"
  ON vendors FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "Admins can manage all vendors"
  ON vendors FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Fix customers policy to use the function
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (public.is_admin());

-- Fix orders policies to use the function
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_seller() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;

