-- Drop the existing constraint if it was implicitly named
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;

-- Add the new constraint including 'sticker'
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'video', 'audio', 'sticker'));

-- Reload schema just in case
NOTIFY pgrst, 'reload schema';
