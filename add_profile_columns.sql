-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_id TEXT;

-- 2. Notify Supabase PostgREST to reload the schema cache so it recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';
