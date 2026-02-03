-- =====================================================
-- Fix Profile Creation - Ensure trigger and policies work
-- =====================================================

-- Add INSERT policy for profiles (though SECURITY DEFINER should handle this)
-- This ensures the trigger function can insert profiles
CREATE POLICY IF NOT EXISTS "Allow profile creation via trigger"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Ensure the trigger function has proper permissions
-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

-- Recreate the trigger function to ensure it's correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Add a policy to allow users to insert their own profile (fallback)
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);



