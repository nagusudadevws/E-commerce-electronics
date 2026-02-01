# Category RLS Policy Troubleshooting Guide

## Problem
Still getting "new row violates row-level security policy for table 'categories'" when adding a category.

## Step-by-Step Diagnosis

### Step 1: Run Diagnostic Queries

Run the diagnostic queries in `supabase/migrations/006_diagnose_category_issue.sql` to check:

1. **If helper function exists:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'is_admin_or_seller';
   ```

2. **Check your user's role:**
   ```sql
   SELECT id, email, role FROM profiles WHERE id = auth.uid();
   ```

3. **Test if function returns true:**
   ```sql
   SELECT public.is_admin_or_seller();
   ```

4. **Check all policies on categories:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'categories';
   ```

### Step 2: Verify Your User Has Admin/Seller Role

**If your user doesn't have admin role:**

```sql
-- Update your user's role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- Verify it was updated
SELECT id, email, role FROM profiles WHERE id = auth.uid();
```

**If you don't have a profile:**

```sql
-- Create a profile for your user
INSERT INTO profiles (id, email, role)
VALUES (
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Step 3: Run the Complete Fix

Run `supabase/migrations/007_fix_category_rls_final.sql` which:
- Ensures helper functions exist
- Drops and recreates all policies
- Adds proper WITH CHECK clauses
- Verifies everything was created correctly

### Step 4: Test Category Insertion

After running the fix, test by:

1. **In Supabase Dashboard SQL Editor:**
   ```sql
   -- Test insert (replace with your actual values)
   INSERT INTO categories (name, slug, description, is_active)
   VALUES ('Test Category', 'test-category', 'Test description', true);
   ```

2. **In the Application:**
   - Go to Admin Dashboard → Categories
   - Click "Add Category"
   - Fill in the form and submit

## Common Issues and Solutions

### Issue 1: User doesn't have admin/seller role

**Solution:**
```sql
-- Check your role
SELECT role FROM profiles WHERE id = auth.uid();

-- If not admin, update it
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

### Issue 2: Helper function doesn't exist

**Solution:**
Run the complete fix migration which creates the function.

### Issue 3: Multiple conflicting policies

**Solution:**
The fix migration drops all existing policies and recreates them cleanly.

### Issue 4: RLS is too restrictive

**Temporary workaround (for testing only):**
```sql
-- Temporarily disable RLS (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Test your insert
-- Then re-enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

## Quick Fix Script

If you need to quickly fix your user's role and test:

```sql
-- 1. Ensure you have a profile with admin role
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Verify
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- 3. Test the function
SELECT public.is_admin_or_seller();

-- 4. Test insert
INSERT INTO categories (name, slug, is_active)
VALUES ('Quick Test', 'quick-test', true);
```

## Manual Policy Creation

If migrations aren't working, create the policy manually:

```sql
-- Drop existing
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

-- Create new with explicit WITH CHECK
CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (public.is_admin_or_seller())
  WITH CHECK (public.is_admin_or_seller());
```

## Verification Checklist

- [ ] Helper function `is_admin_or_seller()` exists
- [ ] User has a profile in the `profiles` table
- [ ] User's role is 'admin' or 'seller' in profiles table
- [ ] Function returns `true` when tested
- [ ] Policy exists with both `USING` and `WITH CHECK` clauses
- [ ] RLS is enabled on categories table
- [ ] No conflicting policies exist

## Still Not Working?

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for RLS policy errors

2. **Check Browser Console:**
   - Open DevTools → Console
   - Look for error messages

3. **Test Direct SQL:**
   ```sql
   -- Try inserting directly in SQL Editor
   INSERT INTO categories (name, slug, is_active)
   VALUES ('Direct Test', 'direct-test', true);
   ```

4. **Verify Authentication:**
   ```sql
   -- Check if you're authenticated
   SELECT auth.uid();
   ```

If `auth.uid()` returns NULL, you're not authenticated in the SQL editor context.

