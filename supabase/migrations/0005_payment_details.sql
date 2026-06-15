-- Add Razorpay payment details and UPI ID for payouts to teams table
ALTER TABLE public.teams 
ADD COLUMN razorpay_order_id VARCHAR(100),
ADD COLUMN razorpay_payment_id VARCHAR(100),
ADD COLUMN upi_id VARCHAR(100) CHECK (upi_id IS NULL OR upi_id ~ '^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$');
