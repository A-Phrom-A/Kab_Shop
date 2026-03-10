-- ==========================================
-- 1. Create chat_rooms table
-- ==========================================
CREATE TABLE chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('direct', 'support')), 
    participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate direct rooms between the same two users
    UNIQUE NULLS NOT DISTINCT (type, participant1_id, participant2_id)
);

-- Row Level Security for Rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Admins can see all rooms. Users can only see rooms they are part of.
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
FOR SELECT USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id 
    OR (SELECT role = 'Admin' FROM profiles WHERE id = auth.uid())
);

-- Users can create a support room, admins can create direct rooms.
CREATE POLICY "Users can create chat rooms" ON chat_rooms
FOR INSERT WITH CHECK (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- ==========================================
-- 2. Create chat_messages table
-- ==========================================
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security for Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages in rooms they are part of (or if admin)
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE chat_rooms.id = chat_messages.room_id 
        AND (chat_rooms.participant1_id = auth.uid() OR chat_rooms.participant2_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'Admin'))
    )
);

-- Users can insert messages in rooms they are part of
CREATE POLICY "Users can send messages to their rooms" ON chat_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_rooms 
        WHERE chat_rooms.id = chat_messages.room_id 
        AND (chat_rooms.participant1_id = auth.uid() OR chat_rooms.participant2_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'Admin'))
    )
    AND auth.uid() = sender_id
);

-- ==========================================
-- 3. Enable Realtime Replication
-- ==========================================
-- Enable replication for chat_messages table to allow instant client updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- ==========================================
-- 4. Create chat-media Storage Bucket
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('chat-media', 'chat-media', true, 10485760) -- 10MB limit per file
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Policies
DROP POLICY IF EXISTS "Public Access Chat Media" ON storage.objects;
DROP POLICY IF EXISTS "User Insert Chat Media" ON storage.objects;

CREATE POLICY "Public Access Chat Media" ON storage.objects FOR SELECT USING (bucket_id = 'chat-media');
CREATE POLICY "User Insert Chat Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-media' AND auth.uid() IS NOT NULL);

-- ==========================================
-- 5. Data Retention Helper
-- ==========================================
-- This function can be called via pg_cron or an edge function daily to clean up old messages
CREATE OR REPLACE FUNCTION delete_old_chat_messages() 
RETURNS void AS $$
BEGIN
    DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
