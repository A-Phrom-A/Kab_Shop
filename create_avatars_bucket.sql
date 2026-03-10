-- 1. Create avatars bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to prevent conflict errors
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "User Insert Avatars" ON storage.objects;
DROP POLICY IF EXISTS "User Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Avatars" ON storage.objects;

-- 3. Create correct policies for the avatars bucket
-- Allow anyone to view the avatars
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow logged in users to upload their own avatars
CREATE POLICY "User Insert Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Allow logged in users to update their own avatars
CREATE POLICY "User Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Allow logged in users to delete their own avatars
CREATE POLICY "User Delete Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
