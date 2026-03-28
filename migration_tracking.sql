-- Migration Script: Add Tracking Number and Cancellation Reason
ALTER TABLE public.orders 
ADD COLUMN tracking_number TEXT,
ADD COLUMN cancellation_reason TEXT;
