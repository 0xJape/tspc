# Adding New Tournaments to TSPC System

## Automatic Tournament Creation

The TSPC system now supports **dynamic tournament creation** with dedicated leaderboard tables. Here's how to add new tournaments:

### Method 1: Using the Tournament Creator Script

```bash
# 1. Edit the script with your tournament details
node create-tournament-with-table.js

# 2. The script will:
#    - Create the tournament in the database
#    - Generate a dedicated result table 
#    - Register it in the tournament_tables registry
#    - Provide API test URLs
```

### Method 2: Manual Database Setup

```sql
-- 1. Create the tournament
INSERT INTO tournaments (name, description, date, location, category, skill_level, registration_deadline, max_participants, status) VALUES 
('Your Tournament Name', 'Description', '2026-03-15', 'Location', 'Category', 'Open', '2026-03-14', 32, 'Upcoming');

-- 2. Create the result table (replace 'your_tournament' with appropriate name)
CREATE TABLE IF NOT EXISTS tspc_your_tournament_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER NOT NULL,
    tournament_date DATE DEFAULT '2026-03-15',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_your_tournament_member_id ON tspc_your_tournament_results(member_id);
CREATE INDEX IF NOT EXISTS idx_your_tournament_rank ON tspc_your_tournament_results(rank_position);
CREATE INDEX IF NOT EXISTS idx_your_tournament_points ON tspc_your_tournament_results(points DESC);

-- 4. Register the table (use actual tournament ID from step 1)
INSERT INTO tournament_tables (tournament_id, table_name, tournament_name, tournament_category) VALUES 
('YOUR_TOURNAMENT_ID', 'tspc_your_tournament_results', 'Your Tournament Name', 'Category');
```

## Tournament Categories

| Category | Description | Table Prefix Example |
|----------|-------------|---------------------|
| `Singles` | Individual player tournaments | `tspc_seniors_singles` |
| `Doubles` | Two-player team tournaments | `tspc_mixed_doubles` |
| `Mixed Doubles` | Male-female partnerships | `tspc_corporate_mixed` |
| `Juniors` | Youth tournaments | `tspc_juniors_doubles` |
| `Seniors` | Older age group tournaments | `tspc_seniors_singles` |
| `Corporate` | Company-based tournaments | `tspc_corporate_league` |

## Table Naming Convention

- **Prefix**: Always start with `tspc_`
- **Category**: Use descriptive category (juniors, seniors, corporate, etc.)
- **Type**: singles, doubles, mixed
- **Suffix**: Always end with `_results`

Examples:
- `tspc_juniors_singles_results`
- `tspc_seniors_doubles_results`  
- `tspc_corporate_mixed_results`
- `tspc_summer_league_results`

## API Integration

The rankings API automatically detects new tournaments through the `tournament_tables` registry:

```javascript
// No code changes needed! 
// API automatically works with any registered tournament
GET /api/rankings?tournament={tournament_id}
```

## Frontend Integration

The frontend automatically shows new tournaments in:
- **Tournaments page** - Lists all tournaments
- **Rankings page** - Tournament filter dropdown
- **Tournament Detail pages** - Individual leaderboards

## Adding Sample Data

After creating a tournament table, you can add sample ranking data:

```sql
INSERT INTO tspc_your_tournament_results (member_id, full_name, points, wins, losses, games_played, rank_position) VALUES
((SELECT id FROM members WHERE full_name = 'Player Name'), 'Player Name', 100, 10, 2, 12, 1),
((SELECT id FROM members WHERE full_name = 'Another Player'), 'Another Player', 85, 8, 4, 12, 2);
```

## Benefits of This System

✅ **No Code Changes Required** - Add tournaments without updating API code  
✅ **Automatic API Support** - Rankings endpoint works immediately  
✅ **Scalable Database Design** - Each tournament has its own optimized table  
✅ **Flexible Categories** - Support any tournament type or format  
✅ **Easy Management** - Simple SQL operations to add/modify tournaments  

## Current TSPC Tournaments

1. **Men's Doubles Championship** (`tspc_mens_doubles_results`)
2. **Women's Doubles Championship** (`tspc_womens_doubles_results`) 
3. **Men's Singles Championship** (`tspc_mens_singles_results`)
4. **Women's Singles Championship** (`tspc_womens_singles_results`)
5. **Mixed Doubles Championship** (`tspc_mixed_doubles_results`)