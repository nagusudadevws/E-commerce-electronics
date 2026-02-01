# Category INSERT Policy Fix

## Problem

When trying to add a category, you get the error:
```
new row violates row-level security policy for table "categories"
```

## Root Cause

The RLS policy for categories uses `FOR ALL` which covers INSERT, UPDATE, DELETE, and SELECT operations. However, when using `FOR ALL`, you need:
- `USING` clause - for SELECT, UPDATE, DELETE operations
- `WITH CHECK` clause - for INSERT and UPDATE operations

The original policy only had `USING`, so INSERT operations were being blocked.

## Quick Fix

Run this SQL in your Supabase Dashboard:

### Option 1: Quick Fix (Recommended)

Run the quick fix file: `supabase/migrations/004_fix_category_insert.sql`

1. Go to Supabase Dashboard → SQL Editor
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/004_fix_category_insert.sql`
4. Click **Run**

### Option 2: Manual Fix

Run this SQL directly:

```sql
-- Drop and recreate the categories policy with WITH CHECK clause
DROP POLICY IF EXISTS "Admins and sellers can manage categories" ON categories;

CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (public.is_admin_or_seller())
  WITH CHECK (public.is_admin_or_seller());
```

### Option 3: Complete Fix (If you haven't run migration 003 yet)

Run the complete migration: `supabase/migrations/003_fix_rls_recursion.sql`

This fixes all RLS policies including categories, products, vendors, etc.

## Verification

After running the fix:

1. Go to Admin Dashboard → Categories
2. Click "Add Category"
3. Fill in the form:
   - Category Name: Test Category
   - Description: Test description
   - Active: ✓
4. Click "Create Category"
5. Should work without the RLS error

## Technical Details

### RLS Policy Clauses

- **USING**: Evaluates existing rows (for SELECT, UPDATE, DELETE)
- **WITH CHECK**: Evaluates new/modified rows (for INSERT, UPDATE)

When using `FOR ALL`, you typically need both clauses to cover all operations.

### Example

```sql
-- This works for SELECT/UPDATE/DELETE but NOT INSERT
CREATE POLICY "example"
  ON table_name FOR ALL
  USING (condition);

-- This works for ALL operations including INSERT
CREATE POLICY "example"
  ON table_name FOR ALL
  USING (condition)
  WITH CHECK (condition);
```

## Related Files

- `supabase/migrations/003_fix_rls_recursion.sql` - Complete fix for all RLS policies
- `supabase/migrations/004_fix_category_insert.sql` - Quick fix for categories only

## Notes

- If you've already run migration 003, you may need to run it again (it's been updated)
- The fix uses the `is_admin_or_seller()` function which bypasses RLS recursion
- All admin and seller users should now be able to create categories

