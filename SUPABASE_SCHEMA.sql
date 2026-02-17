-- 🏓 PICKLEBALL CLUB DATABASE SCHEMA
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. MEMBERS TABLE
-- =============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  age INTEGER,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
  skill_level VARCHAR(50) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  profile_photo TEXT,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  ranking_position INTEGER,
  is_admin BOOLEAN DEFAULT FALSE,
  date_joined TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. RANKINGS TABLE (Optional - can be derived from members)
-- =============================================
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id)
);

-- =============================================
-- 3. SCHEDULE TABLE
-- =============================================
CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('Training', 'Match', 'Tournament')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  status VARCHAR(50) CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')) DEFAULT 'Upcoming',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. TOURNAMENTS TABLE
-- =============================================
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('Singles', 'Doubles', 'Mixed Doubles')),
  skill_level VARCHAR(50) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Open')),
  registration_deadline DATE,
  status VARCHAR(50) CHECK (status IN ('Upcoming', 'Ongoing', 'Finished')) DEFAULT 'Upcoming',
  max_participants INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 5. TOURNAMENT PARTICIPANTS TABLE
-- =============================================
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES members(id) ON DELETE SET NULL, -- For doubles
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, member_id)
);

-- =============================================
-- 6. MATCHES TABLE
-- =============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES members(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES members(id) ON DELETE CASCADE,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES members(id),
  match_date TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('Scheduled', 'In Progress', 'Finished')) DEFAULT 'Scheduled',
  round VARCHAR(50), -- QF, SF, Final, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 7. ADMINS TABLE (Optional)
-- =============================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_members_ranking ON members(ranking_position);
CREATE INDEX idx_members_skill ON members(skill_level);
CREATE INDEX idx_schedule_date ON schedule(date);
CREATE INDEX idx_tournaments_date ON tournaments(date);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view)
CREATE POLICY "Public members read" ON members FOR SELECT USING (true);
CREATE POLICY "Public rankings read" ON rankings FOR SELECT USING (true);
CREATE POLICY "Public schedule read" ON schedule FOR SELECT USING (true);
CREATE POLICY "Public tournaments read" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public matches read" ON matches FOR SELECT USING (true);

-- Admin write access (configure based on auth)
-- You'll need to set up authentication and modify these policies

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

INSERT INTO members (full_name, age, gender, skill_level, wins, losses, points, ranking_position) VALUES
('Anna Clarice Patrimonio', 25, 'Female', 'Advanced', 15, 3, 1500, 1),
('Arianne Gajasan', 38, 'Female', 'Advanced', 12, 5, 1200, 2),
('Sophia P. Anh', 28, 'Female', 'Advanced', 10, 6, 1000, 3),
('John Doe', 22, 'Male', 'Intermediate', 8, 8, 800, 4),
('Jane Smith', 30, 'Female', 'Beginner', 5, 10, 500, 5);

INSERT INTO tournaments (name, date, location, category, skill_level, status) VALUES
('PPL Luzon Open 2026', '2026-03-15', 'Manila Sports Complex', 'Singles', 'Advanced', 'Upcoming'),
('Mindanao Pickleball League', '2026-04-20', 'Davao Convention Center', 'Doubles', 'Open', 'Upcoming');

INSERT INTO schedule (title, type, date, time, location, description) VALUES
('Weekly Training', 'Training', '2026-02-20', '18:00', 'Club Court A', 'Regular training session'),
('Practice Match', 'Match', '2026-02-22', '15:00', 'Club Court B', 'Friendly match day');

-- =============================================
-- FUNCTIONS (Optional)
-- =============================================

-- Function to update rankings automatically
CREATE OR REPLACE FUNCTION update_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate rankings based on points
  WITH ranked_members AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC) as new_rank
    FROM members
  )
  UPDATE members m
  SET ranking_position = rm.new_rank
  FROM ranked_members rm
  WHERE m.id = rm.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rankings when member stats change
CREATE TRIGGER update_member_rankings
AFTER UPDATE OF points, wins, losses ON members
FOR EACH ROW
EXECUTE FUNCTION update_rankings();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
