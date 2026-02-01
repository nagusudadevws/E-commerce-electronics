# RLS Infinite Recursion Fix

## Problem

When trying to add a category (or perform other admin operations), you get the error:
```
infinite recursion detected in policy for relation "profiles"
```

## Root Cause

The RLS (Row Level Security) policies on the `profiles` table and other tables were checking if a user is an admin by querying the `profiles` table itself. This created infinite recursion:

1. Policy checks: "Is this user an admin?"
2. To check, it queries the `profiles` table
3. That query triggers the RLS policy again
4. Which queries `profiles` again
5. Infinite loop!

## Solution

Created SECURITY DEFINER functions that bypass RLS to check user roles without triggering recursion.

## Migration File

Run the migration: `supabase/migrations/003_fix_rls_recursion.sql`

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file: `supabase/migrations/003_fix_rls_recursion.sql`
6. Copy the entire SQL content
7. Paste it into the SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)
9. Verify there are no errors

### Option 2: Using Supabase CLI

```bash
supabase db push
```

## What the Fix Does

1. **Creates helper functions** that bypass RLS:
   - `is_admin()` - Checks if current user is admin
   - `is_admin_or_seller()` - Checks if current user is admin or seller
   - `get_user_role()` - Gets the current user's role

2. **Updates all policies** that query `profiles` to use these functions instead:
   - Profiles: "Admins can view all profiles"
   - Categories: "Admins and sellers can manage categories"
   - Products: "Admins can manage all products"
   - Vendors: "Vendors can view own vendor profile" and "Admins can manage all vendors"
   - Customers: "Admins can view all customers"
   - Orders: "Admins can view all orders" and "Admins can update all orders"

## Verification

After running the migration, test by:

1. **Adding a category:**
   - Go to Admin Dashboard → Categories
   - Click "Add Category"
   - Fill in the form and submit
   - Should work without recursion error

2. **Check functions exist:**
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname IN ('is_admin', 'is_admin_or_seller', 'get_user_role');
   ```

3. **Test the function:**
   ```sql
   SELECT public.is_admin();
   ```

## Technical Details

### SECURITY DEFINER Functions

These functions run with the privileges of the function owner (postgres), not the caller. This allows them to:
- Bypass RLS policies
- Query the `profiles` table directly
- Return results without triggering recursion

### Function Properties

- `SECURITY DEFINER` - Runs with owner's privileges
- `STABLE` - Function doesn't modify database, can be optimized
- `SET search_path = public` - Ensures correct schema

## Troubleshooting

### If migration fails:

1. **Check if policies exist:**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('profiles', 'categories', 'products', 'vendors', 'customers', 'orders');
   ```

2. **Manually drop problematic policies:**
   ```sql
   DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
   ```

3. **Re-run the migration**

### If still getting recursion:

1. Check browser console for specific error
2. Verify functions were created:
   ```sql
   \df public.is_admin
   ```
3. Check if policies are using the functions:
   ```sql
   SELECT pg_get_functiondef(oid) 
   FROM pg_proc 
   WHERE proname = 'is_admin';
   ```

## Related Files

- `supabase/migrations/001_initial_schema.sql` - Original schema (has the problematic policies)
- `supabase/migrations/003_fix_rls_recursion.sql` - This fix

## Notes

- This fix maintains all security - it just changes HOW we check permissions
- The functions are safe because they only READ from profiles, never modify
- All existing functionality should work the same, just without recursion errors

