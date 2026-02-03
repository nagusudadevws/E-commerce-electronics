# Signup Functionality Troubleshooting Guide

## Common Issues and Solutions

### 1. Supabase Configuration Issues

**Problem**: Signup fails with "Supabase is not configured" or "Failed to fetch"

**Solution**:
1. Check your `.env.local` file exists in the project root
2. Verify it contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Restart your development server after adding/updating `.env.local`:
   ```bash
   npm run dev
   ```

### 2. Email Confirmation Required

**Problem**: Signup appears to succeed but user can't sign in

**Solution**:
- Supabase may have email confirmation enabled
- Check your Supabase Dashboard → Authentication → Settings
- If "Enable email confirmations" is ON:
  - Users must click the confirmation link in their email before signing in
  - Or disable it for development: Settings → Auth → Email Auth → Disable "Enable email confirmations"

### 3. Database/Profile Creation Issues

**Problem**: User is created but profile is not

**Solution**:
1. Run the profile fix migration:
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/002_fix_profile_creation.sql`
2. The code now includes a fallback that creates profiles manually if the trigger fails

### 4. Network/Connection Issues

**Problem**: "Network error" or "Failed to fetch"

**Solutions**:
- Check your internet connection
- Verify Supabase project is not paused (check Supabase Dashboard)
- Verify the Supabase URL is correct (no typos)
- Check browser console for CORS errors
- Try accessing Supabase Dashboard to ensure project is active

### 5. Password Requirements

**Problem**: "Password does not meet requirements"

**Solution**:
- Password must be at least 6 characters
- Check Supabase Auth settings for additional requirements
- Use a stronger password if Supabase has stricter rules

### 6. User Already Exists

**Problem**: "User already registered"

**Solution**:
- The email is already in use
- Try signing in instead
- Or use a different email address

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up
4. Look for any error messages
5. Check Network tab for failed requests

### Step 2: Verify Supabase Configuration

```bash
# Check if .env.local exists
cat .env.local

# Verify variables are set (should not be empty)
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Step 3: Test Supabase Connection

Create a test file `test-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test connection
supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
}).then(({ data, error }) => {
  console.log('Data:', data)
  console.log('Error:', error)
})
```

### Step 4: Check Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Check:
   - **Authentication → Users**: See if user was created
   - **Table Editor → profiles**: See if profile was created
   - **Logs**: Check for any errors

### Step 5: Verify Database Setup

1. Check if tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'profiles';
   ```

2. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

## Testing Signup

### Manual Test

1. Go to `/signup` page
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
   - Account Type: Customer
3. Click "Create Account"
4. Check for:
   - Success message or redirect
   - Error message (if any)
   - Browser console for errors
   - Network tab for failed requests

### Expected Behavior

**If email confirmation is DISABLED:**
- User should be redirected to `/{role}` dashboard immediately
- Profile should be created automatically

**If email confirmation is ENABLED:**
- User should see message to check email
- User should be redirected to login page
- User must confirm email before signing in

## Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Supabase is not configured" | Missing env variables | Add `.env.local` with Supabase credentials |
| "Network error" | Connection issue | Check internet, verify Supabase URL |
| "User already registered" | Email exists | Use different email or sign in |
| "Password does not meet requirements" | Weak password | Use stronger password (6+ chars) |
| "Failed to create account" | Various | Check console and Supabase logs |

## Getting Help

If signup still doesn't work:

1. **Check Browser Console** for detailed error messages
2. **Check Supabase Logs** in Dashboard → Logs
3. **Verify Environment Variables** are correct
4. **Test with a simple curl request** to Supabase API
5. **Check Supabase Status** at https://status.supabase.com

## Quick Fixes

### Reset Everything

1. Delete test users from Supabase Dashboard
2. Clear browser cache and cookies
3. Restart dev server: `npm run dev`
4. Try signup again

### Disable Email Confirmation (Development)

1. Supabase Dashboard → Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle OFF
4. Save changes

### Manual Profile Creation

If user exists but profile doesn't:

```sql
-- Get user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Create profile manually
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-id-from-above',
  'user@example.com',
  'User Name',
  'customer'
);
```



