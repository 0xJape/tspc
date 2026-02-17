-- Add status column to tournament_participants table for registration approval workflow
-- Run this in Supabase SQL Editor

ALTER TABLE tournament_participants 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Update existing participants to 'approved' status
UPDATE tournament_participants 
SET status = 'approved' 
WHERE status IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tournament_participants' 
AND column_name = 'status';
