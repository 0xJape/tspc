-- TSPC Tournament Schema
-- Each tournament gets its own results table for specific leaderboards
-- Overall rankings will aggregate from all tournament tables

-- =============================================================================
-- 1. TSPC Men's Doubles Championship Results Table
-- =============================================================================

CREATE TABLE tspc_mens_doubles_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER NOT NULL,
    tournament_date DATE DEFAULT '2026-02-15',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mens_doubles_member_id ON tspc_mens_doubles_results(member_id);
CREATE INDEX idx_mens_doubles_rank ON tspc_mens_doubles_results(rank_position);
CREATE INDEX idx_mens_doubles_points ON tspc_mens_doubles_results(points DESC);

-- =============================================================================
-- 2. TSPC Women's Doubles Championship Results Table
-- =============================================================================

CREATE TABLE tspc_womens_doubles_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER NOT NULL,
    tournament_date DATE DEFAULT '2026-02-15',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_womens_doubles_member_id ON tspc_womens_doubles_results(member_id);
CREATE INDEX idx_womens_doubles_rank ON tspc_womens_doubles_results(rank_position);
CREATE INDEX idx_womens_doubles_points ON tspc_womens_doubles_results(points DESC);

-- =============================================================================
-- 3. Tournament Registry Table (to keep track of all tournament tables)
-- =============================================================================

CREATE TABLE tournament_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL UNIQUE,
    tournament_name TEXT NOT NULL,
    tournament_category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. Data Population Queries
-- =============================================================================

-- First, get the tournament IDs (run these to get the IDs)
-- SELECT id, name FROM tournaments WHERE name LIKE '%Men%Doubles%';
-- SELECT id, name FROM tournaments WHERE name LIKE '%Women%Doubles%';

-- Register tournament tables in the registry
-- Using actual tournament IDs from the database
INSERT INTO tournament_tables (tournament_id, table_name, tournament_name, tournament_category) VALUES
('d9af477a-a257-499b-bf34-61015dcc90b6', 'tspc_mens_doubles_results', 'TSPC Men''s Doubles Championship', 'Doubles'),
('bad83357-7ca8-4527-9cfb-885ff0f9abc0', 'tspc_womens_doubles_results', 'TSPC Women''s Doubles Championship', 'Doubles');

-- =============================================================================
-- 5. Men's Doubles Results Data
-- =============================================================================

-- Get member IDs first (these queries help find the member IDs)
/*
SELECT id, full_name FROM members WHERE 
full_name IN (
    'Kurt Tristan Asuncion', 'Tibot Balleza', 'James Villareal', 'Billy Sumande',
    'Daniel Avergonzado', 'Molly Gulfan', 'Arnold John', 'RD Trabado',
    'Sanry Hatulan', 'Jayson Pacres', 'Clint Harry Halasan', 'Ruel Tomayao',
    'Christian Entredicho', 'Ahron Villa', 'Jasper Solilapsi', 'Percival Lasaca',
    'Kit Sales', 'Spencer Magbanua', 'Jojo Serra', 'Dhyn Hurter Balanon',
    'Leo Watin', 'Rynor Bonjoc', 'Alfred Bolasa', 'Jalel Prince Gayo',
    'Norman Sarao', 'Suysuy Suyom', 'Jamin Gayo', 'Rex Bazar'
) ORDER BY full_name;
*/

-- Men's Doubles Results Insert (replace member IDs with actual values)
INSERT INTO tspc_mens_doubles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Rank 1: Kurt - 21 games, 108 points
((SELECT id FROM members WHERE full_name = 'Kurt Tristan Asuncion'), 'Kurt Tristan Asuncion', 108, 15, 6, 21, 1),
-- Rank 2: Tibot - 17 games, 90 points  
((SELECT id FROM members WHERE full_name = 'Tibot Balleza'), 'Tibot Balleza', 90, 13, 4, 17, 2),
-- Rank 3: James - 18 games, 81 points
((SELECT id FROM members WHERE full_name = 'James Villareal'), 'James Villareal', 81, 9, 9, 18, 3),
-- Rank 3: Billy - 20 games, 81 points (tied)
((SELECT id FROM members WHERE full_name = 'Billy Sumande'), 'Billy Sumande', 81, 7, 13, 20, 3),
-- Rank 5: Daniel - 16 games, 72 points
((SELECT id FROM members WHERE full_name = 'Daniel Avergonzado'), 'Daniel Avergonzado', 72, 8, 8, 16, 5),
-- Rank 6: Molly - 14 games, 66 points
((SELECT id FROM members WHERE full_name = 'Molly Gulfan'), 'Molly Gulfan', 66, 8, 6, 14, 6),
-- Rank 7: Arnold John - 14 games, 63 points
((SELECT id FROM members WHERE full_name = 'Arnold John'), 'Arnold John', 63, 7, 7, 14, 7),
-- Rank 7: RD - 14 games, 63 points (tied)
((SELECT id FROM members WHERE full_name = 'RD Trabado'), 'RD Trabado', 63, 7, 7, 14, 7),
-- Rank 9: Sanry - 14 games, 57 points
((SELECT id FROM members WHERE full_name = 'Sanry Hatulan'), 'Sanry Hatulan', 57, 5, 9, 14, 9),
-- Rank 10: Jayson - 12 games, 51 points
((SELECT id FROM members WHERE full_name = 'Jayson Pacres'), 'Jayson Pacres', 51, 5, 7, 12, 10),
-- Rank 11: Clint - 9 games, 48 points
((SELECT id FROM members WHERE full_name = 'Clint Harry Halasan'), 'Clint Harry Halasan', 48, 7, 2, 9, 11),
-- Rank 12: Ruel - 12 games, 45 points
((SELECT id FROM members WHERE full_name = 'Ruel Tomayao'), 'Ruel Tomayao', 45, 3, 9, 12, 12),
-- Rank 13: Christian - 8 games, 39 points
((SELECT id FROM members WHERE full_name = 'Christian Entredicho'), 'Christian Entredicho', 39, 5, 3, 8, 13),
-- Rank 14: Ahron - 8 games, 36 points
((SELECT id FROM members WHERE full_name = 'Ahron Villa'), 'Ahron Villa', 36, 4, 4, 8, 14),
-- Rank 15: Jasper - 5 games, 27 points
((SELECT id FROM members WHERE full_name = 'Jasper Solilapsi'), 'Jasper Solilapsi', 27, 4, 1, 5, 15),
-- Rank 16: Percival - 7 games, 24 points
((SELECT id FROM members WHERE full_name = 'Percival Lasaca'), 'Percival Lasaca', 24, 1, 6, 7, 16),
-- Rank 16: Kit - 5 games, 24 points (tied)
((SELECT id FROM members WHERE full_name = 'Kit Sales'), 'Kit Sales', 24, 3, 2, 5, 16),
-- Rank 18: Spencer - 5 games, 21 points
((SELECT id FROM members WHERE full_name = 'Spencer Magbanua'), 'Spencer Magbanua', 21, 2, 3, 5, 18),
-- Rank 18: Jojo - 5 games, 21 points (tied)
((SELECT id FROM members WHERE full_name = 'Jojo Serra'), 'Jojo Serra', 21, 2, 3, 5, 18),
-- Rank 20: Dhyn - 4 games, 18 points
((SELECT id FROM members WHERE full_name = 'Dhyn Hurter Balanon'), 'Dhyn Hurter Balanon', 18, 2, 2, 4, 20),
-- Rank 21: Leo - 5 games, 15 points
((SELECT id FROM members WHERE full_name = 'Leo Watin'), 'Leo Watin', 15, 0, 5, 5, 21),
-- Rank 21: Rynor - 3 games, 15 points (tied)
((SELECT id FROM members WHERE full_name = 'Rynor Bonjoc'), 'Rynor Bonjoc', 15, 2, 1, 3, 21),
-- Rank 23: Alfred - 2 games, 12 points
((SELECT id FROM members WHERE full_name = 'Alfred Bolasa'), 'Alfred Bolasa', 12, 2, 0, 2, 23),
-- Rank 23: Jalel - 3 games, 12 points (tied)
((SELECT id FROM members WHERE full_name = 'Jalel Prince Gayo'), 'Jalel Prince Gayo', 12, 1, 2, 3, 23),
-- Rank 25: Norman - 3 games, 9 points
((SELECT id FROM members WHERE full_name = 'Norman Sarao'), 'Norman Sarao', 9, 0, 3, 3, 25),
-- Rank 25: Suysuy - 2 games, 9 points (tied)
((SELECT id FROM members WHERE full_name = 'Suysuy Suyom'), 'Suysuy Suyom', 9, 1, 1, 2, 25),
-- Rank 27: Jamin - 1 games, 6 points
((SELECT id FROM members WHERE full_name = 'Jamin Gayo'), 'Jamin Gayo', 6, 1, 0, 1, 27),
-- Rank 28: Rex - 1 games, 3 points
((SELECT id FROM members WHERE full_name = 'Rex Bazar'), 'Rex Bazar', 3, 0, 1, 1, 28);

-- =============================================================================
-- 6. Women's Doubles Results Data
-- =============================================================================

-- Women's Doubles Results Insert
INSERT INTO tspc_womens_doubles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Rank 1: Nice - 18 games, 93 points
((SELECT id FROM members WHERE full_name = 'Nice Lomboy'), 'Nice Lomboy', 93, 13, 5, 18, 1),
-- Rank 2: Jo-an - 18 games, 90 points
((SELECT id FROM members WHERE full_name = 'Jo-an Sumagaysay'), 'Jo-an Sumagaysay', 90, 12, 6, 18, 2),
-- Rank 3: Marivic - 19 games, 87 points
((SELECT id FROM members WHERE full_name = 'Marivic Cariňo'), 'Marivic Cariňo', 87, 11, 8, 19, 3),
-- Rank 4: Divine - 10 games, 39 points
((SELECT id FROM members WHERE full_name = 'Divine Dumalag'), 'Divine Dumalag', 39, 3, 7, 10, 4),
-- Rank 5: Gly - 7 games, 36 points
((SELECT id FROM members WHERE full_name = 'Gly Mariano-Trabado'), 'Gly Mariano-Trabado', 36, 4, 3, 7, 5),
-- Rank 6: PPJ - 9 games, 30 points
((SELECT id FROM members WHERE full_name = 'PPJ Cepeda'), 'PPJ Cepeda', 30, 1, 8, 9, 6),
-- Rank 6: Ammi - 7 games, 30 points (tied)
((SELECT id FROM members WHERE full_name = 'Ammi Saldivia'), 'Ammi Saldivia', 30, 3, 4, 7, 6),
-- Rank 8: Dolly - 6 games, 27 points
((SELECT id FROM members WHERE full_name = 'Dolly Bantawig'), 'Dolly Bantawig', 27, 3, 3, 6, 8),
-- Rank 9: Khyla - 5 games, 24 points
((SELECT id FROM members WHERE full_name = 'Khyla Cariňo'), 'Khyla Cariňo', 24, 3, 2, 5, 9),
-- Rank 10: Joy - 5 games, 21 points
((SELECT id FROM members WHERE full_name = 'Joy Serra'), 'Joy Serra', 21, 2, 3, 5, 10),
-- Rank 11: Ella - 4 games, 15 points
((SELECT id FROM members WHERE full_name = 'Ella Mae Aguilar'), 'Ella Mae Aguilar', 15, 2, 2, 4, 11),
-- Rank 12: Gigi - 3 games, 12 points
((SELECT id FROM members WHERE full_name = 'Gigi Bagares'), 'Gigi Bagares', 12, 1, 2, 3, 12),
-- Rank 12: Shaine - 3 games, 12 points (tied)
((SELECT id FROM members WHERE full_name = 'Shaine Belaza'), 'Shaine Belaza', 12, 1, 2, 3, 12),
-- Rank 12: Jing - 3 games, 12 points (tied)
((SELECT id FROM members WHERE full_name = 'Jing Eborde'), 'Jing Eborde', 12, 1, 2, 3, 12),
-- Rank 15: Aya - 1 games, 6 points
((SELECT id FROM members WHERE full_name = 'Aya Reyes'), 'Aya Reyes', 6, 1, 0, 1, 15),
-- Rank 16: Lucky - 1 games, 3 points
((SELECT id FROM members WHERE full_name = 'Lucky Nicole'), 'Lucky Nicole', 3, 0, 1, 1, 16),
-- Rank 16: Jenica - 1 games, 3 points (tied)
((SELECT id FROM members WHERE full_name = 'Jenica Leoncio'), 'Jenica Leoncio', 3, 0, 1, 1, 16);

-- =============================================================================
-- 7. Update Overall Member Rankings (Aggregate from all tournaments)
-- =============================================================================

-- Update members table with aggregated tournament data
-- This will calculate total points, wins, and losses across all tournaments

UPDATE members SET 
  points = COALESCE(
    (SELECT SUM(points) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(points) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  ),
  wins = COALESCE(
    (SELECT SUM(wins) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(wins) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  ),
  losses = COALESCE(
    (SELECT SUM(losses) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(losses) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  )
WHERE EXISTS (
  SELECT 1 FROM tspc_mens_doubles_results WHERE member_id = members.id
  UNION
  SELECT 1 FROM tspc_womens_doubles_results WHERE member_id = members.id
);

-- =============================================================================
-- 8. Verification Queries
-- =============================================================================

-- Verify Men's Doubles Results
-- SELECT rank_position, full_name, points, wins, losses, games_played 
-- FROM tspc_mens_doubles_results 
-- ORDER BY rank_position;

-- Verify Women's Doubles Results  
-- SELECT rank_position, full_name, points, wins, losses, games_played 
-- FROM tspc_womens_doubles_results 
-- ORDER BY rank_position;

-- Verify Overall Rankings
-- SELECT full_name, points, wins, losses, gender 
-- FROM members 
-- WHERE points > 0 
-- ORDER BY points DESC;

-- Check Tournament Registry
-- SELECT tt.table_name, tt.tournament_name, t.name as actual_tournament_name
-- FROM tournament_tables tt
-- JOIN tournaments t ON tt.tournament_id = t.id;