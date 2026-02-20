-- TSPC Complete Tournament Schema
-- Each tournament gets its own results table for specific leaderboards
-- Overall rankings will aggregate from all tournament tables
--
-- DYNAMIC TOURNAMENT SYSTEM:
-- The rankings API now automatically detects new tournaments via the tournament_tables registry.
-- To add new tournaments, use create-tournament-with-table.js or follow TOURNAMENT_GUIDE.md
-- No code changes required for new tournaments!

-- =============================================================================
-- 1. TSPC Men's Doubles Championship Results Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS tspc_mens_doubles_results (
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

-- =============================================================================
-- 2. TSPC Women's Doubles Championship Results Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS tspc_womens_doubles_results (
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

-- =============================================================================
-- 3. TSPC Men's Singles Championship Results Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS tspc_mens_singles_results (
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

-- =============================================================================
-- 4. TSPC Women's Singles Championship Results Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS tspc_womens_singles_results (
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

-- =============================================================================
-- 5. TSPC Mixed Doubles Championship Results Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS tspc_mixed_doubles_results (
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

-- =============================================================================
-- 6. Create Indexes for Performance
-- =============================================================================

-- Men's Doubles Indexes
CREATE INDEX IF NOT EXISTS idx_mens_doubles_member_id ON tspc_mens_doubles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_mens_doubles_rank ON tspc_mens_doubles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_mens_doubles_points ON tspc_mens_doubles_results(points DESC);

-- Women's Doubles Indexes
CREATE INDEX IF NOT EXISTS idx_womens_doubles_member_id ON tspc_womens_doubles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_womens_doubles_rank ON tspc_womens_doubles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_womens_doubles_points ON tspc_womens_doubles_results(points DESC);

-- Men's Singles Indexes
CREATE INDEX IF NOT EXISTS idx_mens_singles_member_id ON tspc_mens_singles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_mens_singles_rank ON tspc_mens_singles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_mens_singles_points ON tspc_mens_singles_results(points DESC);

-- Women's Singles Indexes
CREATE INDEX IF NOT EXISTS idx_womens_singles_member_id ON tspc_womens_singles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_womens_singles_rank ON tspc_womens_singles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_womens_singles_points ON tspc_womens_singles_results(points DESC);

-- Mixed Doubles Indexes
CREATE INDEX IF NOT EXISTS idx_mixed_doubles_member_id ON tspc_mixed_doubles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_mixed_doubles_rank ON tspc_mixed_doubles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_mixed_doubles_points ON tspc_mixed_doubles_results(points DESC);

-- =============================================================================
-- 7. Tournament Registry Table (to keep track of all tournament tables)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tournament_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL UNIQUE,
    tournament_name TEXT NOT NULL,
    tournament_category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 8. Register All Tournament Tables
-- =============================================================================

INSERT INTO tournament_tables (tournament_id, table_name, tournament_name, tournament_category) VALUES
('d9af477a-a257-499b-bf34-61015dcc90b6', 'tspc_mens_doubles_results', 'TSPC Men''s Doubles Championship', 'Doubles'),
('bad83357-7ca8-4527-9cfb-885ff0f9abc0', 'tspc_womens_doubles_results', 'TSPC Women''s Doubles Championship', 'Doubles'),
('d4fc8133-1c30-4133-b6ed-ba4545e1f08e', 'tspc_mens_singles_results', 'TSPC Men''s Singles Championship', 'Singles'),
('debf25dc-b1bb-4ecf-a194-9f1ddf063bb0', 'tspc_womens_singles_results', 'TSPC Women''s Singles Championship', 'Singles'),
('aa176926-38a3-4f1e-9a51-d269195a4220', 'tspc_mixed_doubles_results', 'TSPC Mixed Doubles Championship', 'Mixed Doubles')
ON CONFLICT (table_name) DO NOTHING;

-- =============================================================================
-- 9. Men's Doubles Results Data (Existing)
-- =============================================================================

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
((SELECT id FROM members WHERE full_name = 'Rex Bazar'), 'Rex Bazar', 3, 0, 1, 1, 28)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- 10. Women's Doubles Results Data (Existing)
-- =============================================================================

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
((SELECT id FROM members WHERE full_name = 'Jenica Leoncio'), 'Jenica Leoncio', 3, 0, 1, 1, 16)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- 11. Men's Singles Results Data (Sample Data)
-- =============================================================================

INSERT INTO tspc_mens_singles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Top singles players with different performance from doubles
-- Rank 1: Kurt - 15 games, 84 points (6 per win, 3 per loss)
((SELECT id FROM members WHERE full_name = 'Kurt Tristan Asuncion'), 'Kurt Tristan Asuncion', 84, 12, 3, 15, 1),
-- Rank 2: James - 13 games, 69 points
((SELECT id FROM members WHERE full_name = 'James Villareal'), 'James Villareal', 69, 9, 4, 13, 2),
-- Rank 3: Tibot - 12 games, 66 points
((SELECT id FROM members WHERE full_name = 'Tibot Balleza'), 'Tibot Balleza', 66, 9, 3, 12, 3),
-- Rank 4: Daniel - 14 games, 63 points
((SELECT id FROM members WHERE full_name = 'Daniel Avergonzado'), 'Daniel Avergonzado', 63, 8, 6, 14, 4),
-- Rank 5: Christian - 11 games, 60 points
((SELECT id FROM members WHERE full_name = 'Christian Entredicho'), 'Christian Entredicho', 60, 8, 3, 11, 5),
-- Rank 6: Clint - 10 games, 57 points
((SELECT id FROM members WHERE full_name = 'Clint Harry Halasan'), 'Clint Harry Halasan', 57, 8, 2, 10, 6),
-- Rank 7: Billy - 12 games, 54 points
((SELECT id FROM members WHERE full_name = 'Billy Sumande'), 'Billy Sumande', 54, 6, 6, 12, 7),
-- Rank 8: Arnold - 11 games, 51 points
((SELECT id FROM members WHERE full_name = 'Arnold John'), 'Arnold John', 51, 6, 5, 11, 8),
-- Rank 9: Jasper - 9 games, 48 points
((SELECT id FROM members WHERE full_name = 'Jasper Solilapsi'), 'Jasper Solilapsi', 48, 6, 3, 9, 9),
-- Rank 10: RD - 10 games, 45 points
((SELECT id FROM members WHERE full_name = 'RD Trabado'), 'RD Trabado', 45, 5, 5, 10, 10),
-- Rank 11: Sanry - 9 games, 42 points
((SELECT id FROM members WHERE full_name = 'Sanry Hatulan'), 'Sanry Hatulan', 42, 5, 4, 9, 11),
-- Rank 12: Ahron - 8 games, 39 points
((SELECT id FROM members WHERE full_name = 'Ahron Villa'), 'Ahron Villa', 39, 5, 3, 8, 12),
-- Rank 13: Jayson - 10 games, 36 points
((SELECT id FROM members WHERE full_name = 'Jayson Pacres'), 'Jayson Pacres', 36, 4, 6, 10, 13),
-- Rank 14: Spencer - 7 games, 33 points
((SELECT id FROM members WHERE full_name = 'Spencer Magbanua'), 'Spencer Magbanua', 33, 4, 3, 7, 14),
-- Rank 15: Kit - 6 games, 30 points
((SELECT id FROM members WHERE full_name = 'Kit Sales'), 'Kit Sales', 30, 4, 2, 6, 15)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- 12. Women's Singles Results Data (Sample Data)
-- =============================================================================

INSERT INTO tspc_womens_singles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Top female singles players
-- Rank 1: Nice - 14 games, 72 points (10W, 4L)
((SELECT id FROM members WHERE full_name = 'Nice Lomboy'), 'Nice Lomboy', 72, 10, 4, 14, 1),
-- Rank 2: Jo-an - 13 games, 69 points (9W, 4L)
((SELECT id FROM members WHERE full_name = 'Jo-an Sumagaysay'), 'Jo-an Sumagaysay', 69, 9, 4, 13, 2),
-- Rank 3: Marivic - 12 games, 63 points (8W, 4L)
((SELECT id FROM members WHERE full_name = 'Marivic Cariňo'), 'Marivic Cariňo', 63, 8, 4, 12, 3),
-- Rank 4: Gly - 11 games, 60 points (8W, 3L)
((SELECT id FROM members WHERE full_name = 'Gly Mariano-Trabado'), 'Gly Mariano-Trabado', 60, 8, 3, 11, 4),
-- Rank 5: Dolly - 10 games, 51 points (6W, 4L)
((SELECT id FROM members WHERE full_name = 'Dolly Bantawig'), 'Dolly Bantawig', 51, 6, 4, 10, 5),
-- Rank 6: Khyla - 9 games, 48 points (6W, 3L)
((SELECT id FROM members WHERE full_name = 'Khyla Cariňo'), 'Khyla Cariňo', 48, 6, 3, 9, 6),
-- Rank 7: Divine - 10 games, 45 points (5W, 5L)
((SELECT id FROM members WHERE full_name = 'Divine Dumalag'), 'Divine Dumalag', 45, 5, 5, 10, 7),
-- Rank 8: Ella - 8 games, 42 points (5W, 3L)
((SELECT id FROM members WHERE full_name = 'Ella Mae Aguilar'), 'Ella Mae Aguilar', 42, 5, 3, 8, 8),
-- Rank 9: Joy - 8 games, 39 points (5W, 3L)
((SELECT id FROM members WHERE full_name = 'Joy Serra'), 'Joy Serra', 39, 4, 4, 8, 9),
-- Rank 10: Ammi - 7 games, 36 points (4W, 3L)
((SELECT id FROM members WHERE full_name = 'Ammi Saldivia'), 'Ammi Saldivia', 36, 4, 3, 7, 10),
-- Rank 11: PPJ - 8 games, 33 points (3W, 5L)
((SELECT id FROM members WHERE full_name = 'PPJ Cepeda'), 'PPJ Cepeda', 33, 3, 5, 8, 11),
-- Rank 12: Aya - 5 games, 27 points (3W, 2L)
((SELECT id FROM members WHERE full_name = 'Aya Reyes'), 'Aya Reyes', 27, 3, 2, 5, 12)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- 13. Mixed Doubles Results Data (Sample Data)
-- =============================================================================

INSERT INTO tspc_mixed_doubles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Mixed doubles - all players regardless of gender can participate
-- Rank 1: Kurt - 12 games, 66 points (9W, 3L)
((SELECT id FROM members WHERE full_name = 'Kurt Tristan Asuncion'), 'Kurt Tristan Asuncion', 66, 9, 3, 12, 1),
-- Rank 2: Nice - 12 games, 63 points (8W, 4L)
((SELECT id FROM members WHERE full_name = 'Nice Lomboy'), 'Nice Lomboy', 63, 8, 4, 12, 2),
-- Rank 3: James - 11 games, 60 points (8W, 3L)
((SELECT id FROM members WHERE full_name = 'James Villareal'), 'James Villareal', 60, 8, 3, 11, 3),
-- Rank 4: Jo-an - 11 games, 57 points (7W, 4L)
((SELECT id FROM members WHERE full_name = 'Jo-an Sumagaysay'), 'Jo-an Sumagaysay', 57, 7, 4, 11, 4),
-- Rank 5: Tibot - 10 games, 54 points (7W, 3L)
((SELECT id FROM members WHERE full_name = 'Tibot Balleza'), 'Tibot Balleza', 54, 7, 3, 10, 5),
-- Rank 6: Marivic - 10 games, 51 points (6W, 4L)
((SELECT id FROM members WHERE full_name = 'Marivic Cariňo'), 'Marivic Cariňo', 51, 6, 4, 10, 6),
-- Rank 7: Daniel - 9 games, 48 points (6W, 3L)
((SELECT id FROM members WHERE full_name = 'Daniel Avergonzado'), 'Daniel Avergonzado', 48, 6, 3, 9, 7),
-- Rank 8: Gly - 9 games, 45 points (5W, 4L)
((SELECT id FROM members WHERE full_name = 'Gly Mariano-Trabado'), 'Gly Mariano-Trabado', 45, 5, 4, 9, 8),
-- Rank 9: Billy - 9 games, 42 points (4W, 5L)
((SELECT id FROM members WHERE full_name = 'Billy Sumande'), 'Billy Sumande', 42, 4, 5, 9, 9),
-- Rank 10: Christian - 8 games, 39 points (5W, 3L)
((SELECT id FROM members WHERE full_name = 'Christian Entredicho'), 'Christian Entredicho', 39, 5, 3, 8, 10),
-- Rank 11: Dolly - 8 games, 36 points (4W, 4L)
((SELECT id FROM members WHERE full_name = 'Dolly Bantawig'), 'Dolly Bantawig', 36, 4, 4, 8, 11),
-- Rank 12: Clint - 7 games, 33 points (4W, 3L)
((SELECT id FROM members WHERE full_name = 'Clint Harry Halasan'), 'Clint Harry Halasan', 33, 4, 3, 7, 12),
-- Rank 13: Khyla - 7 games, 30 points (3W, 4L)
((SELECT id FROM members WHERE full_name = 'Khyla Cariňo'), 'Khyla Cariňo', 30, 3, 4, 7, 13),
-- Rank 14: RD - 6 games, 27 points (3W, 3L)
((SELECT id FROM members WHERE full_name = 'RD Trabado'), 'RD Trabado', 27, 3, 3, 6, 14),
-- Rank 15: Arnold - 6 games, 24 points (2W, 4L)
((SELECT id FROM members WHERE full_name = 'Arnold John'), 'Arnold John', 24, 2, 4, 6, 15)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- 14. Update Overall Member Rankings (Aggregate from all tournaments)
-- =============================================================================

UPDATE members SET 
  points = COALESCE(
    (SELECT SUM(points) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(points) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(points) FROM tspc_mens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(points) FROM tspc_womens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(points) FROM tspc_mixed_doubles_results WHERE member_id = members.id), 0
  ),
  wins = COALESCE(
    (SELECT SUM(wins) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(wins) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(wins) FROM tspc_mens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(wins) FROM tspc_womens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(wins) FROM tspc_mixed_doubles_results WHERE member_id = members.id), 0
  ),
  losses = COALESCE(
    (SELECT SUM(losses) FROM tspc_mens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(losses) FROM tspc_womens_doubles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(losses) FROM tspc_mens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(losses) FROM tspc_womens_singles_results WHERE member_id = members.id), 0
  ) + COALESCE(
    (SELECT SUM(losses) FROM tspc_mixed_doubles_results WHERE member_id = members.id), 0
  )
WHERE EXISTS (
  SELECT 1 FROM tspc_mens_doubles_results WHERE member_id = members.id
  UNION
  SELECT 1 FROM tspc_womens_doubles_results WHERE member_id = members.id
  UNION
  SELECT 1 FROM tspc_mens_singles_results WHERE member_id = members.id
  UNION
  SELECT 1 FROM tspc_womens_singles_results WHERE member_id = members.id
  UNION
  SELECT 1 FROM tspc_mixed_doubles_results WHERE member_id = members.id
);

-- =============================================================================
-- 15. Verification Queries (Optional - uncomment to run)
-- =============================================================================

-- SELECT 'Men''s Doubles Results' as Tournament, COUNT(*) as Players FROM tspc_mens_doubles_results;
-- SELECT 'Women''s Doubles Results' as Tournament, COUNT(*) as Players FROM tspc_womens_doubles_results;
-- SELECT 'Men''s Singles Results' as Tournament, COUNT(*) as Players FROM tspc_mens_singles_results;
-- SELECT 'Women''s Singles Results' as Tournament, COUNT(*) as Players FROM tspc_womens_singles_results;
-- SELECT 'Mixed Doubles Results' as Tournament, COUNT(*) as Players FROM tspc_mixed_doubles_results;

-- SELECT tt.table_name, tt.tournament_name, t.name as actual_tournament_name
-- FROM tournament_tables tt
-- JOIN tournaments t ON tt.tournament_id = t.id
-- ORDER BY tt.tournament_category;