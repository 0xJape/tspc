-- Setup script to add authentication columns and create admin account
-- Run this in your Supabase SQL Editor

-- ADMIN CREDENTIALS:
-- Email: admin@pickleclub.com
-- Password: admin123

-- DEFAULT MEMBER PASSWORD:
-- Password: password123
-- (Users can change this later in their profile)

-- 1. Add authentication columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Add status column to tournament_participants for registration approval
ALTER TABLE tournament_participants 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Update existing participants to 'approved' status
UPDATE tournament_participants 
SET status = 'approved' 
WHERE status IS NULL;

-- 3. Fix any members without emails by adding placeholder emails
UPDATE members 
SET email = 'member_' || id || '@pickleclub.com'
WHERE email IS NULL OR email = '';

-- 4. Make email column NOT NULL
ALTER TABLE members
ALTER COLUMN email SET NOT NULL;

-- 5. Create admin user
-- Password hash is bcrypt hash of "admin123"
INSERT INTO members (full_name, email, password_hash, is_admin, skill_level)
VALUES (
  'Admin User', 
  'admin@pickleclub.com', 
  '$2b$10$FD7CYYNpCX3gyw3OVUKjlOe7BY94mSYFslwnYjoou8hSH7LOKp9Fq', 
  TRUE, 
  'Advanced'
)
ON CONFLICT (email) DO UPDATE 
SET 
  is_admin = TRUE,
  password_hash = '$2b$10$FD7CYYNpCX3gyw3OVUKjlOe7BY94mSYFslwnYjoou8hSH7LOKp9Fq';

-- 6. Set default password for all existing members without passwords
-- Password: password123 (they can change this later)
UPDATE members
SET password_hash = '$2b$10$FD7CYYNpCX3gyw3OVUKjlOdQvvP3Zr/F6YwA5Plqa152SIxrDNjUK'
WHERE password_hash IS NULL;

-- 7. Verify setup
SELECT 
  id,
  full_name, 
  email, 
  is_admin,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✓ Password set' 
    ELSE '✗ No password' 
  END as password_status
FROM members 
WHERE email = 'admin@pickleclub.com';

-- 8. List all members to see their status
SELECT 
  id,
  full_name,
  email,
  is_admin,
  CASE 
    WHEN password_hash IS NOT NULL THEN '✓' 
    ELSE '✗ Needs password' 
  END as has_password
FROM members
ORDER BY is_admin DESC, full_name;
