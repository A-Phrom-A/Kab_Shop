-- Run this in your Supabase SQL Editor to create the missing storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'payment-proofs'
-- If you get an error that a policy already exists, you can safely ignore it.
-- This script uses an alternative syntax to drop them first if they exist contextually.

DROP POLICY IF EXISTS "Public Access Payment Proofs" ON storage.objects;
DROP POLICY IF EXISTS "User Insert Proofs" ON storage.objects;

-- Recreate Policies properly for anyone to insert and view
CREATE POLICY "Public Access Payment Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "User Insert Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
