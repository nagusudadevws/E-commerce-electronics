# Setup Guide - Supabase Configuration

## Issue: "Failed to fetch" Error

If you're seeing a "Failed to fetch" error when trying to create an account, it means Supabase is not configured properly.

## Quick Fix

### Step 1: Create .env.local file

Create a `.env.local` file in the root directory of your project:

```bash
touch .env.local
```

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Step 3: Add Credentials to .env.local

Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace `your-project-ref` and `your-anon-key-here` with your actual values from Supabase.

### Step 4: Restart Development Server

After adding the credentials:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Configure Supabase Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates (optional)
4. Set up redirect URLs:
   - Go to **Authentication** → **URL Configuration**
   - Add `http://localhost:3000` to **Site URL**
   - Add `http://localhost:3000/**` to **Redirect URLs**

## Verify Configuration

After setup, try creating an account again. The error should be resolved.

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Verify .env.local** file is in the root directory (same level as package.json)
3. **Check Supabase project** is active and not paused
4. **Verify credentials** are correct (no extra spaces, correct format)
5. **Restart dev server** after changing .env.local

## Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Verify your project status in Supabase Dashboard
- Check network tab in browser DevTools for detailed error messages


