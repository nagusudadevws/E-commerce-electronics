# Database Migrations

## Migration Files

- `001_initial_schema.sql` - Initial database schema with all tables, RLS policies, functions, and triggers

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/001_initial_schema.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Option 3: Using MCP Supabase Server

The migration can be executed through the MCP Supabase server if configured.

## Verification

After running the migration, verify the schema:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- - profiles
-- - vendors
-- - categories
-- - products
-- - customers
-- - orders
-- - order_items
```

## Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test Environment**: Test migrations in a development environment first
3. **RLS Policies**: All tables have Row Level Security enabled
4. **Triggers**: Automatic profile creation and updated_at timestamps are set up

## Troubleshooting

If you encounter errors:

1. Check if tables already exist (use `CREATE TABLE IF NOT EXISTS`)
2. Verify RLS policies are correctly applied
3. Ensure all foreign key relationships are valid
4. Check Supabase logs for detailed error messages

