# Match System Update - Singles/Doubles with Set-Based Scoring

## Overview
Updated the match recording system to support both Singles and Doubles matches with a best-of-3 sets scoring format.

## Changes Made

### 1. Database Migration (`UPDATE_MATCHES_SCHEMA.sql`)
**Run this file in your Supabase SQL Editor AFTER `SETUP_ADMIN.sql`**

Added the following columns to the `matches` table:
- `match_type` - VARCHAR(20): 'Singles' or 'Doubles'
- `team1_partner_id` - UUID: Partner for Team 1 in doubles matches (nullable)
- `team2_partner_id` - UUID: Partner for Team 2 in doubles matches (nullable)
- `set1_team1_score` - INTEGER: Team 1 score for Set 1
- `set1_team2_score` - INTEGER: Team 2 score for Set 1
- `set2_team1_score` - INTEGER: Team 1 score for Set 2
- `set2_team2_score` - INTEGER: Team 2 score for Set 2
- `set3_team1_score` - INTEGER: Team 1 score for Set 3 (optional/nullable)
- `set3_team2_score` - INTEGER: Team 2 score for Set 3 (optional/nullable)

### 2. Frontend Updates (`TournamentDetail.jsx`)

**Match Recording Form:**
- Added match type selector (Singles/Doubles)
- For Singles: Select 2 players (one from each team)
- For Doubles: Select 2 players + 2 partners (team of 2 vs team of 2)
- Partner dropdowns only show when Doubles is selected
- Players must be registered participants with 'approved' status
- Set-based scoring inputs:
  - Set 1 scores (required)
  - Set 2 scores (required)
  - Set 3 scores (optional)
  - Min: 0, Max: 30 points per set

**Match Display:**
- Shows match type badge (Singles/Doubles)
- Displays team composition:
  - Singles: Player name only
  - Doubles: Player name + partner name
- Shows sets won (e.g., "2 sets" vs "1 set")
- Displays individual set scores with winner highlighting:
  - Set 1: 11-7 (winner's score in green)
  - Set 2: 9-11
  - Set 3: 11-8 (if played)
- Status badge (Scheduled/In Progress/Finished)
- Round indicator (QF, SF, Final, etc.)

### 3. Backend Updates

**`server/routes/matches.js`:**
- Updated POST / endpoint to accept new match structure
- Added `calculateWinner()` helper function to determine winner based on sets won
- Updated GET endpoints to fetch partner information separately
- Updated PUT /:id endpoint to support set-based score updates
- Maintains backward compatibility with old `player1_score`/`player2_score` columns

**`server/routes/tournaments.js`:**
- Updated POST /:id/matches to create matches with new structure
- Updated GET /:id/matches to return partner information
- Calculates winner based on sets won (best of 3)

## How to Use

### Step 1: Run Database Migration
Open Supabase SQL Editor and run:
```bash
UPDATE_MATCHES_SCHEMA.sql
```

### Step 2: Create a Match (Admin Only)

**For Singles Match:**
1. Go to a tournament detail page
2. Click "Add Match"
3. Select "Singles (1 vs 1)"
4. Select Player 1 from Team 1
5. Select Player 1 from Team 2
6. Enter Set 1 scores (required): e.g., 11-7
7. Enter Set 2 scores (required): e.g., 9-11
8. Enter Set 3 scores (optional): e.g., 11-8
9. Optionally add Round (QF, SF, Final)
10. Click "Create Match"

**For Doubles Match:**
1. Go to a tournament detail page
2. Click "Add Match"
3. Select "Doubles (2 vs 2)"
4. Select Player 1 from Team 1
5. Select Partner from Team 1
6. Select Player 1 from Team 2
7. Select Partner from Team 2
8. Enter Set 1 scores (required)
9. Enter Set 2 scores (required)
10. Enter Set 3 scores (optional)
11. Optionally add Round
12. Click "Create Match"

### Step 3: View Match Results
- Matches display team compositions
- Shows sets won by each team
- Individual set scores shown with winner highlighting
- Winner automatically calculated based on sets won

## Match Rules

### Singles
- 1 player vs 1 player
- Best of 3 sets
- Set 1 and Set 2 are required
- Set 3 is optional (played if tied 1-1)
- Winner is the team that wins 2 sets

### Doubles
- 2 players vs 2 players
- All 4 players must be approved tournament participants
- Best of 3 sets
- Set 1 and Set 2 are required
- Set 3 is optional (played if tied 1-1)
- Winner is the team that wins 2 sets

## Example Match Data

### Singles Match (2-1)
```
Team 1: John Doe
Team 2: Jane Smith

Set 1: 11-7 (Team 1 wins)
Set 2: 9-11 (Team 2 wins)
Set 3: 11-8 (Team 1 wins)

Result: Team 1 wins 2-1
```

### Doubles Match (2-0)
```
Team 1: John Doe & Mike Johnson
Team 2: Jane Smith & Sarah Lee

Set 1: 11-5 (Team 1 wins)
Set 2: 11-9 (Team 1 wins)

Result: Team 1 wins 2-0 (no Set 3 needed)
```

## Notes
- Only approved tournament participants can be selected for matches
- Partner selection automatically excludes already-selected players
- Set 3 scores are optional and only required if the match goes to a third set
- Winner is automatically calculated based on sets won
- Old matches will be converted to Singles format with scores in Set 1 during migration
