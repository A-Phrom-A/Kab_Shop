-- kabshop Database Migration: Adding Cost Fields for Analytics

-- 1. Add cost to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- 2. Add cost_at_purchase to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_at_purchase DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Optional: If you want to backfill existing order_items with a 0 cost so they don't break old calculations
UPDATE order_items SET cost_at_purchase = 0 WHERE cost_at_purchase IS NULL;
