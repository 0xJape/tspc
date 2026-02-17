-- 🔧 ADD MISSING COLUMNS TO EXISTING SUPABASE TABLE
-- Run this in Supabase SQL Editor if your members table is missing age and/or gender columns

-- Add age column (if missing)
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add gender column (if missing)
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('Male', 'Female'));

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;
