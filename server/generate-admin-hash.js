// Generate bcrypt hash for admin password
// Run: node generate-admin-hash.js

const bcrypt = require('bcryptjs');

async function generateHash() {
  const adminPassword = 'admin123';
  const memberPassword = 'password123';
  
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, salt);
  const memberHash = await bcrypt.hash(memberPassword, salt);
  
  console.log('\n=== Admin Account Setup ===');
  console.log('Email: admin@pickleclub.com');
  console.log('Password: admin123');
  console.log('\nBcrypt Hash:');
  console.log(adminHash);
  
  console.log('\n=== Default Member Password ===');
  console.log('Password: password123');
  console.log('\nBcrypt Hash:');
  console.log(memberHash);
  
  console.log('\n=== SQL to run in Supabase ===');
  console.log(`
-- Add authentication columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Fix members without emails
UPDATE members 
SET email = 'member_' || id || '@pickleclub.com'
WHERE email IS NULL OR email = '';

ALTER TABLE members ALTER COLUMN email SET NOT NULL;

-- Create admin user
INSERT INTO members (full_name, email, password_hash, is_admin, skill_level)
VALUES ('Admin User', 'admin@pickleclub.com', '${adminHash}', TRUE, 'Advanced')
ON CONFLICT (email) DO UPDATE SET is_admin = TRUE, password_hash = '${adminHash}';

-- Set default password for existing members without passwords
UPDATE members
SET password_hash = '${memberHash}'
WHERE password_hash IS NULL;
`);
}

generateHash().catch(console.error);
