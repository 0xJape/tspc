-- Migration script to update matches table for Singles/Doubles with set-based scoring
-- Run this in your Supabase SQL Editor after SETUP_ADMIN.sql

-- 1. Add match_type column (Singles or Doubles)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS match_type VARCHAR(20) CHECK (match_type IN ('Singles', 'Doubles')) DEFAULT 'Singles';

-- 2. Add partner columns for doubles matches (nullable)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS team1_partner_id UUID REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS team2_partner_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- 3. Rename player columns to team for clarity
-- Note: We'll keep player1_id and player2_id as the primary players of each team
-- For singles: only player1_id and player2_id are used
-- For doubles: player1_id + team1_partner_id vs player2_id + team2_partner_id

-- 4. Add set-based scoring columns (replacing old score columns)
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set1_team1_score INTEGER DEFAULT 0;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set1_team2_score INTEGER DEFAULT 0;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set2_team1_score INTEGER DEFAULT 0;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set2_team2_score INTEGER DEFAULT 0;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set3_team1_score INTEGER;

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS set3_team2_score INTEGER;

-- 5. Keep old score columns for backward compatibility (they can be removed later)
-- player1_score and player2_score will be calculated as total sets won

-- 6. Update existing matches to use set-based scoring
-- Convert old scores to first set scores
UPDATE matches 
SET 
  set1_team1_score = COALESCE(player1_score, 0),
  set1_team2_score = COALESCE(player2_score, 0),
  match_type = 'Singles'
WHERE set1_team1_score IS NULL OR set1_team1_score = 0;

-- 7. Verify the changes
SELECT 
  id,
  match_type,
  player1_id,
  team1_partner_id,
  player2_id,
  team2_partner_id,
  set1_team1_score,
  set1_team2_score,
  set2_team1_score,
  set2_team2_score,
  set3_team1_score,
  set3_team2_score,
  round,
  status
FROM matches
ORDER BY created_at DESC
LIMIT 10;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_team1_partner ON matches(team1_partner_id);
CREATE INDEX IF NOT EXISTS idx_matches_team2_partner ON matches(team2_partner_id);
CREATE INDEX IF NOT EXISTS idx_matches_type ON matches(match_type);

-- Success message
SELECT 'Matches table updated successfully! Ready for Singles/Doubles with set-based scoring.' as message;
