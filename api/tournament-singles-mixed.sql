-- =============================================================================
-- TSPC Tournament Tables and Data - Singles & Mixed Doubles
-- Run this SQL script directly in Supabase SQL Editor
-- =============================================================================

-- Create Men's Singles Results Table
CREATE TABLE IF NOT EXISTS tspc_mens_singles_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
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

-- Create Women's Singles Results Table
CREATE TABLE IF NOT EXISTS tspc_womens_singles_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
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

-- Create Mixed Doubles Results Table
CREATE TABLE IF NOT EXISTS tspc_mixed_doubles_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
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

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_mens_singles_member_id ON tspc_mens_singles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_mens_singles_rank ON tspc_mens_singles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_mens_singles_points ON tspc_mens_singles_results(points DESC);

CREATE INDEX IF NOT EXISTS idx_womens_singles_member_id ON tspc_womens_singles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_womens_singles_rank ON tspc_womens_singles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_womens_singles_points ON tspc_womens_singles_results(points DESC);

CREATE INDEX IF NOT EXISTS idx_mixed_doubles_member_id ON tspc_mixed_doubles_results(member_id);
CREATE INDEX IF NOT EXISTS idx_mixed_doubles_rank ON tspc_mixed_doubles_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_mixed_doubles_points ON tspc_mixed_doubles_results(points DESC);

-- Insert Tournament Registry Entries
INSERT INTO tournament_tables (tournament_id, table_name, tournament_name, tournament_category) VALUES
('d4fc8133-1c30-4133-b6ed-ba4545e1f08e', 'tspc_mens_singles_results', 'TSPC Men''s Singles Championship', 'Singles'),
('debf25dc-b1bb-4ecf-a194-9f1ddf063bb0', 'tspc_womens_singles_results', 'TSPC Women''s Singles Championship', 'Singles'),
('aa176926-38a3-4f1e-9a51-d269195a4220', 'tspc_mixed_doubles_results', 'TSPC Mixed Doubles Championship', 'Mixed')
ON CONFLICT (table_name) DO NOTHING;

-- =============================================================================
-- Insert Men's Singles Tournament Data
-- =============================================================================

INSERT INTO tspc_mens_singles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
('59dba60a-96bb-44de-b3ed-359b0ace823a', 'Ahron Villa', 12, 2, 0, 2, 1),
('a555f109-ad34-4e37-b458-ca3e14091c37', 'Christian Entredicho', 6, 1, 0, 1, 3),
('ca5c2baa-8660-4ab5-8217-c417d1903012', 'Jayson Pacres', 6, 0, 2, 2, 3),
('4b2937c1-b3bb-487c-9184-7fca2cfcdcf1', 'Molly Gulfan', 6, 1, 0, 1, 3),
('833e6b18-93e0-466b-9631-281f921e7ea9', 'Kurt Tristan Asuncion', 3, 0, 1, 1, 6),
('5ba81f8f-96ad-4b7a-843e-1247d7ad8ca6', 'James Villareal', 3, 0, 1, 1, 6),
('c236b36d-1838-409a-b20c-3c70832e2333', 'RD Trabado', 3, 0, 1, 1, 6),
('75c8921c-2e58-4af5-999e-0670a4f7f8c7', 'Norman Sarao', 3, 0, 1, 1, 6)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- Insert Women's Singles Tournament Data
-- =============================================================================

INSERT INTO tspc_womens_singles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
('6098af2f-6f1f-488f-870d-3e85cb798846', 'Jo-an Sumagaysay', 6, 1, 0, 1, 1),
('de05686a-7bf7-49c2-ba71-6054347bfdc1', 'Nice Lomboy', 3, 0, 1, 1, 2)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- Insert Mixed Doubles Tournament Data
-- =============================================================================

INSERT INTO tspc_mixed_doubles_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
-- Women's Rankings in Mixed Doubles
('de05686a-7bf7-49c2-ba71-6054347bfdc1', 'Nice Lomboy', 84, 10, 8, 18, 1),
('6098af2f-6f1f-488f-870d-3e85cb798846', 'Jo-an Sumagaysay', 78, 9, 8, 17, 2),
('561ce648-56ea-4058-922f-267416d7019c', 'Marivic Cariňo', 75, 10, 5, 15, 3),
('4118100f-2507-46ba-8a59-bf25e3eb0978', 'Gly Mariano-Trabado', 75, 9, 7, 16, 3),
('9719e21e-2a6a-4ba2-9a7a-57defe9b6aba', 'Divine Dumalag', 69, 5, 13, 18, 5),
('6c4efc3b-7670-4e78-80b5-7520822bd905', 'PPJ Cepeda', 45, 2, 11, 13, 6),
('bcb9a58d-9c9e-43f6-990e-6dcfcdef3376', 'Ella Mae Aguilar', 45, 4, 7, 11, 6),
('72ca21af-0a0a-44e0-a46a-026b97bfd483', 'Khyla Cariňo', 39, 3, 7, 10, 8),
('4c4bb35b-09af-4604-b147-431572622f6a', 'Ammi Saldivia', 39, 5, 3, 8, 8),
('2cd9469d-a032-409b-813a-7ab5f2b9a2aa', 'Jing Eborde', 18, 2, 2, 4, 11),
('00ddfb0a-5d82-4bba-b0fd-0b567992c24e', 'Dolly Bantawig', 15, 1, 3, 4, 13),
('7f05b24f-e2e2-4bc8-b1bd-df039caa0170', 'Aya Reyes', 9, 1, 1, 2, 14),
('9cbac8b3-baf8-4cac-b644-3be37a9e19a0', 'Gigi Bagares', 6, 0, 2, 2, 15),
('8e062c00-f13a-4151-afdb-a2835058ae6a', 'Shaine Belaza', 6, 1, 0, 1, 15),
('758c16dd-8f91-4eea-a8e4-127aa3e47ced', 'Joy Serra', 6, 1, 0, 1, 15),

-- Men's Rankings in Mixed Doubles
('ca5c2baa-8660-4ab5-8217-c417d1903012', 'Jayson Pacres', 60, 7, 6, 13, 1),
('a555f109-ad34-4e37-b458-ca3e14091c37', 'Christian Entredicho', 54, 7, 4, 11, 2),
('59dba60a-96bb-44de-b3ed-359b0ace823a', 'Ahron Villa', 45, 6, 3, 9, 3),
('c236b36d-1838-409a-b20c-3c70832e2333', 'RD Trabado', 45, 4, 7, 11, 3),
('fd360272-d61c-477e-b12c-7da7a38a8da5', 'Clint Harry Halasan', 42, 6, 2, 8, 5),
('833e6b18-93e0-466b-9631-281f921e7ea9', 'Kurt Tristan Asuncion', 42, 6, 2, 8, 5),
('4b2937c1-b3bb-487c-9184-7fca2cfcdcf1', 'Molly Gulfan', 39, 6, 1, 7, 7),
('46175b44-a5d0-4227-a632-bda5e3a7ab20', 'Daniel Avergonzado', 39, 3, 7, 10, 7),
('5359cda4-236e-4f3c-96a5-ebc2cea0879a', 'Sanry Hatulan', 39, 1, 11, 12, 7),
('5ba81f8f-96ad-4b7a-843e-1247d7ad8ca6', 'James Villareal', 36, 5, 2, 7, 10),
('450337dc-566d-4a74-96bc-f2ec8240d3c9', 'Tibot Balleza', 30, 4, 2, 6, 11),
('dd059b18-ffc9-416b-9ea3-38f467f2771f', 'Ruel Tomayao', 21, 0, 7, 7, 12),
('1f48faab-19cd-4858-9d0b-b40e77127cea', 'Alfred Bolasa', 21, 2, 3, 5, 12),
('19cbbcfc-71dd-422c-b6cf-ebac14111332', 'Arnold John', 18, 2, 2, 4, 14),
('f3e9d039-6588-4e89-8472-b39b70fd3661', 'Kit Sales', 18, 3, 0, 3, 14),
('9e170686-3d9a-46ea-9c1a-229435d6585d', 'Jojo Serra', 18, 3, 0, 3, 14),
('75c8921c-2e58-4af5-999e-0670a4f7f8c7', 'Norman Sarao', 15, 2, 1, 3, 17),
('533edd4e-5796-441a-b87e-2394c46b3606', 'Billy Sumande', 15, 1, 3, 4, 17),
('86c12922-b834-4201-829f-02a979aa20b8', 'Jasper Solilapsi', 12, 1, 2, 3, 19),
('52a9faad-6f89-4e0d-8f39-e8301ebde5c6', 'Spencer Magbanua', 6, 0, 2, 2, 20),
('b37b6940-9669-424e-a70e-9ffb8914e90b', 'Dhyn Hurter Balanon', 6, 1, 0, 1, 20),
('501dbf50-955a-433a-99b8-64755ec63f88', 'Percival Lasaca', 6, 1, 0, 1, 20),
('1d74616e-6af8-481a-a5af-036e13c7b5b1', 'Leo Watin', 6, 0, 2, 2, 20),
('ab959e95-f747-4a97-8470-c3645ed52636', 'Suysuy Suyom', 3, 0, 1, 1, 25),
('5171f54a-5dfc-415e-b7f5-088d1a805ac1', 'Rex Bazar', 3, 0, 1, 1, 25)
ON CONFLICT (member_id) DO NOTHING;

-- =============================================================================
-- Verification Queries (Run after the inserts to confirm data)
-- =============================================================================

-- Check Men's Singles Results
-- SELECT COUNT(*) as mens_singles_count FROM tspc_mens_singles_results;

-- Check Women's Singles Results  
-- SELECT COUNT(*) as womens_singles_count FROM tspc_womens_singles_results;

-- Check Mixed Doubles Results
-- SELECT COUNT(*) as mixed_doubles_count FROM tspc_mixed_doubles_results;

-- Check Tournament Registry
-- SELECT * FROM tournament_tables WHERE tournament_category IN ('Singles', 'Mixed');

-- =============================================================================
-- End of Script
-- =============================================================================