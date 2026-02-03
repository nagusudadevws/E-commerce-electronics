# Profile Creation Fix

## Issue
User profiles are not being automatically created in the `profiles` table when users sign up.

## Solution

Two fixes have been implemented:

### 1. Code Fix (Already Applied)
The `signUp` function in `lib/auth/auth-utils.ts` now includes a fallback that manually creates a profile if the database trigger doesn't fire. This ensures profiles are created even if the trigger is not set up correctly.

### 2. Database Fix (Migration Required)
A new migration file has been created to fix the database trigger and policies. You need to run this migration in your Supabase project.

## Steps to Fix

### Step 1: Run the Migration

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file: `supabase/migrations/002_fix_profile_creation.sql`
6. Copy the entire SQL content
7. Paste it into the SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)
9. Verify there are no errors

**Option B: Using MCP Server**

If you have the Supabase MCP server configured, you can run:

```bash
# The migration will be executed via the MCP server
```

### Step 2: Verify the Fix

1. **Check if the trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check if the function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Test profile creation:**
   - Sign up a new user through the application
   - Check if a profile was created in the `profiles` table:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```

### Step 3: Fix Existing Users (Optional)

If you have existing users without profiles, you can create them manually:

```sql
-- Create profiles for existing users who don't have one
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'customer')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## What Was Fixed

1. **Added INSERT policy** for profiles to allow the trigger function to insert records
2. **Improved the trigger function** with better error handling and conflict resolution
3. **Added fallback in code** to manually create profiles if the trigger fails
4. **Added user INSERT policy** as an additional fallback

## Verification

After running the migration, test by:

1. Creating a new account through the signup page
2. Checking the `profiles` table in Supabase to confirm the profile was created
3. Verifying the profile has the correct role and email

## Troubleshooting

If profiles are still not being created:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for any errors related to profile creation

2. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Check trigger status:**
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   Should show `tgenabled = 'O'` (enabled)

4. **Test the function manually:**
   ```sql
   -- This should not return an error
   SELECT public.handle_new_user();
   ```

## Notes

- The code fix ensures profiles are created even without the trigger
- The database fix ensures the trigger works correctly for future signups
- Both fixes work together to provide redundancy



