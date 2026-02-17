-- Add password_hash and is_admin columns to members table
-- Run this in Supabase SQL Editor

-- Add password_hash column (required for authentication)
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add is_admin column to identify admin users
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make email NOT NULL
ALTER TABLE members
ALTER COLUMN email SET NOT NULL;

-- Create admin user (email: admin@pickleclub.com, password: admin123)
-- Password hash is bcrypt hash of "admin123"
INSERT INTO members (full_name, email, password_hash, is_admin, skill_level)
VALUES ('Admin User', 'admin@pickleclub.com', '$2b$10$YourHashHere', TRUE, 'Advanced')
ON CONFLICT (email) DO UPDATE SET is_admin = TRUE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'members' 
AND column_name IN ('password_hash', 'is_admin')
ORDER BY ordinal_position;
