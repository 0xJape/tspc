const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// GET /api/rankings - Get all rankings (sorted by points)
router.get('/', async (req, res) => {
  try {
    const { tournament, gender } = req.query

    // Overall rankings (all tournaments)
    if (!tournament || tournament === 'All') {
      let query = supabase
        .from('members')
        .select('*')
        .order('points', { ascending: false })

      if (gender && gender !== 'All') {
        query = query.eq('gender', gender)
      }

      const { data, error } = await query
      if (error) throw error
      return res.json(data)
    }

    // Tournament-specific rankings using dedicated tournament tables
    // Map tournament IDs to their specific result tables
    const tournamentTableMap = {
      // Actual tournament IDs mapped to their tables
      'd9af477a-a257-499b-bf34-61015dcc90b6': 'tspc_mens_doubles_results',
      'bad83357-7ca8-4527-9cfb-885ff0f9abc0': 'tspc_womens_doubles_results'
    };

    // First, try to get tournament table mapping
    const { data: tournamentTables, error: tableError } = await supabase
      .from('tournament_tables')
      .select('tournament_id, table_name')
      .eq('tournament_id', tournament)

    let tournamentTableName = null;
    if (!tableError && tournamentTables && tournamentTables.length > 0) {
      tournamentTableName = tournamentTables[0].table_name;
    }

    // If we have a dedicated tournament table, use it
    if (tournamentTableName) {
      console.log(`Using tournament table: ${tournamentTableName}`);
      
      const { data: tournamentResults, error: resultsError } = await supabase
        .from(tournamentTableName)
        .select('*')
        .order('rank_position', { ascending: true });

      if (resultsError) throw resultsError;

      // Transform the tournament results to match the expected format
      let rankings = tournamentResults.map(result => ({
        id: result.member_id,
        full_name: result.full_name,
        points: result.points,
        wins: result.wins,
        losses: result.losses,
        games_played: result.games_played,
        rank_position: result.rank_position,
        // We need to get gender info by joining with members
        gender: null, // Will be filled by a separate query if needed
        email: null,
        profile_photo: null
      }));

      // Apply gender filter if specified and get additional member info
      if (gender && gender !== 'All') {
        const memberIds = rankings.map(r => r.id);
        const { data: memberInfo } = await supabase
          .from('members')
          .select('id, gender, email, profile_photo')
          .in('id', memberIds);

        // Merge member info and filter by gender
        rankings = rankings
          .map(ranking => {
            const member = memberInfo?.find(m => m.id === ranking.id);
            return {
              ...ranking,
              gender: member?.gender,
              email: member?.email,
              profile_photo: member?.profile_photo
            };
          })
          .filter(ranking => ranking.gender === gender);
      } else if (rankings.length > 0) {
        // Get member info for all players (for display purposes)
        const memberIds = rankings.map(r => r.id);
        const { data: memberInfo } = await supabase
          .from('members')
          .select('id, gender, email, profile_photo')
          .in('id', memberIds);

        rankings = rankings.map(ranking => {
          const member = memberInfo?.find(m => m.id === ranking.id);
          return {
            ...ranking,
            gender: member?.gender,
            email: member?.email,
            profile_photo: member?.profile_photo
          };
        });
      }

      return res.json(rankings);
    }

    // Fallback: Check if there are any matches for this tournament
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(id, full_name, email, gender, profile_photo),
        player2:player2_id(id, full_name, email, gender, profile_photo),
        team1_partner:team1_partner_id(id, full_name, email, gender, profile_photo),
        team2_partner:team2_partner_id(id, full_name, email, gender, profile_photo)
      `)
      .eq('tournament_id', tournament)

    if (matchError) throw matchError

    // If no matches exist and no tournament table, get tournament participants with their overall ranking
    if (!matches || matches.length === 0) {
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select(`
          members!tournament_participants_member_id_fkey(
            id, full_name, email, gender, profile_photo, points, wins, losses
          )
        `)
        .eq('tournament_id', tournament)

      if (participantsError) throw participantsError

      // Extract member data and sort by points
      let rankings = participants
        .map(p => p.members)
        .filter(member => member)
        .sort((a, b) => b.points - a.points)

      // Apply gender filter if specified
      if (gender && gender !== 'All') {
        rankings = rankings.filter(player => player.gender === gender)
      }

      return res.json(rankings)
    }

    // Calculate tournament points for each player from matches
    const playerStats = {}

    matches.forEach(match => {
      // Determine winner based on sets won
      let team1SetsWon = 0
      let team2SetsWon = 0
      
      // Set 1
      if (match.set1_team1_score !== null && match.set1_team2_score !== null) {
        if (match.set1_team1_score > match.set1_team2_score) team1SetsWon++
        else if (match.set1_team2_score > match.set1_team1_score) team2SetsWon++
      }
      
      // Set 2
      if (match.set2_team1_score !== null && match.set2_team2_score !== null) {
        if (match.set2_team1_score > match.set2_team2_score) team1SetsWon++
        else if (match.set2_team2_score > match.set2_team1_score) team2SetsWon++
      }
      
      // Set 3
      if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
        if (match.set3_team1_score > match.set3_team2_score) team1SetsWon++
        else if (match.set3_team2_score > match.set3_team1_score) team2SetsWon++
      }

      const team1Won = team1SetsWon > team2SetsWon

      // Team 1 players
      const team1Players = [match.player1, match.team1_partner].filter(p => p)
      const team2Players = [match.player2, match.team2_partner].filter(p => p)

      team1Players.forEach(player => {
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            ...player,
            wins: 0,
            losses: 0,
            points: 0
          }
        }
        if (team1Won) {
          playerStats[player.id].wins++
          playerStats[player.id].points += 6
        } else {
          playerStats[player.id].losses++
          playerStats[player.id].points += 3
        }
      })

      team2Players.forEach(player => {
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            ...player,
            wins: 0,
            losses: 0,
            points: 0
          }
        }
        if (!team1Won) {
          playerStats[player.id].wins++
          playerStats[player.id].points += 6
        } else {
          playerStats[player.id].losses++
          playerStats[player.id].points += 3
        }
      })
    })

    // Convert to array and sort by points
    let rankings = Object.values(playerStats).sort((a, b) => b.points - a.points)

    // Apply gender filter if specified
    if (gender && gender !== 'All') {
      rankings = rankings.filter(player => player.gender === gender)
    }

    res.json(rankings)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
