-- Run this in your Supabase SQL Editor to add the missing column
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS cost_at_purchase DECIMAL(10, 2) NOT NULL DEFAULT 0;
