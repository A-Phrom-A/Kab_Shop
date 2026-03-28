-- Run this on your Supabase SQL Editor to support the 3 new AI chat roles

-- 1. Drop the old strict check constraint on chat_rooms
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_type_check;

-- 2. Add the new flexible check constraint for all 5 room types
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_type_check
CHECK (type IN ('direct', 'support', 'ai_recommender', 'ai_support', 'ai_admin'));

-- 3. Add sender_role column to track AI messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'user' CHECK (sender_role IN ('user', 'admin', 'ai'));

-- 4. FIX: Allow the server (or Anon key) to insert AI messages without failing the RLS constraint
-- Since the server uses an anonymous key (without service role) the previous policy blocked "auth.uid() = sender_id" for AI messages (where sender_id is null).
DROP POLICY IF EXISTS "Allow AI to send messages" ON chat_messages;
CREATE POLICY "Allow AI to send messages" ON chat_messages
FOR INSERT WITH CHECK (
    sender_role = 'ai' AND sender_id IS NULL
);
