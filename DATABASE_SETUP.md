# Database Setup Guide - Phase 2

## Overview

This guide will help you set up the complete database schema for the Multi-Vendor E-Commerce Platform.

## Prerequisites

1. ✅ Supabase project created
2. ✅ `.env.local` file configured with Supabase credentials
3. ✅ Supabase project is active (not paused)

## Step 1: Verify Supabase Connection

Before running migrations, ensure your Supabase credentials are configured:

```bash
# Check if .env.local exists and has credentials
cat .env.local
```

Your `.env.local` should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Execute Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Migration**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy the entire SQL content
   - Paste it into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Verify Execution**
   - Check for any errors in the output
   - All tables should be created successfully

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Option C: Using MCP Supabase Server

If you have the MCP Supabase server configured, you can execute the migration through it.

## Step 3: Verify Schema Creation

After running the migration, verify all tables were created:

### Using Supabase Dashboard

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ profiles
   - ✅ vendors
   - ✅ categories
   - ✅ products
   - ✅ customers
   - ✅ orders
   - ✅ order_items

### Using SQL Query

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output should include all 7 tables.

## Step 4: Verify RLS Policies

Check that Row Level Security is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

## Step 5: Test Database Connection from Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the connection:**
   - The application should now be able to connect to Supabase
   - Try creating an account - it should automatically create a profile
   - Check Supabase Dashboard → Authentication → Users to see the new user
   - Check Table Editor → profiles to see the profile record

## What Gets Created

### Tables
1. **profiles** - User profiles extending auth.users
2. **vendors** - Seller/vendor information
3. **categories** - Product categories
4. **products** - Product catalog
5. **customers** - Customer information
6. **orders** - Order records
7. **order_items** - Order line items

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies for Admin, Seller, and Customer access
- ✅ Public read access for active products and categories

### Functions
- ✅ `generate_order_number()` - Auto-generates order numbers
- ✅ `update_updated_at_column()` - Auto-updates timestamps
- ✅ `handle_new_user()` - Auto-creates profile on signup

### Triggers
- ✅ Auto-create profile when user signs up
- ✅ Auto-update `updated_at` timestamp on all tables

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist
- The migration uses `CREATE TABLE IF NOT EXISTS` to handle this
- You can safely re-run the migration

### Error: "permission denied"
- Check that you're using the correct Supabase credentials
- Verify your Supabase project is active
- Check if you have the necessary permissions

### Error: "function does not exist"
- Make sure you run the entire migration file
- Functions are created before triggers that use them

### Tables not appearing
- Refresh the Supabase Dashboard
- Check the SQL Editor output for errors
- Verify the migration completed successfully

## Next Steps

After successful migration:

1. ✅ Database schema is ready
2. ✅ TypeScript types are defined
3. ✅ Database utility functions are available
4. ✅ Ready for Phase 3: Admin Dashboard & Product Management

## Verification Checklist

- [ ] All 7 tables created
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] Functions created (generate_order_number, update_updated_at_column, handle_new_user)
- [ ] Triggers created (profile creation, updated_at updates)
- [ ] Can query tables from application
- [ ] Test user signup creates profile automatically

---

**Need Help?**
- Check Supabase documentation: https://supabase.com/docs
- Review migration file: `supabase/migrations/001_initial_schema.sql`
- Check application logs for connection errors

