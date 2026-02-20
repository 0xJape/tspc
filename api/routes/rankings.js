const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// PUT /api/rankings/member/:memberId/tournament/:tournamentId - Update member stats for a specific tournament
router.put('/member/:memberId/tournament/:tournamentId', async (req, res) => {
  try {
    const { memberId, tournamentId } = req.params
    const { points, wins, losses } = req.body

    // Get tournament details to determine which result table to update
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('name, category')
      .eq('id', tournamentId)
      .single()

    if (tournamentError || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' })
    }

    // Determine which table to update based on tournament name/category
    let tableName
    if (tournament.name.includes("Men's Singles") || (tournament.category === 'Singles' && tournament.name.includes('Men'))) {
      tableName = 'tspc_mens_singles_results'
    } else if (tournament.name.includes("Women's Singles") || (tournament.category === 'Singles' && tournament.name.includes('Women'))) {
      tableName = 'tspc_womens_singles_results'
    } else if (tournament.name.includes("Men's Doubles") || (tournament.category === 'Doubles' && tournament.name.includes('Men'))) {
      tableName = 'tspc_mens_doubles_results'
    } else if (tournament.name.includes("Women's Doubles") || (tournament.category === 'Doubles' && tournament.name.includes('Women'))) {
      tableName = 'tspc_womens_doubles_results'
    } else if (tournament.name.includes('Mixed') || tournament.category === 'Mixed Doubles') {
      tableName = 'tspc_mixed_doubles_results'
    } else {
      return res.status(400).json({ error: 'Cannot determine tournament type' })
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('full_name')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    const games_played = wins + losses

    // Update or insert the record
    const { data: existing, error: checkError } = await supabase
      .from(tableName)
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from(tableName)
        .update({
          points: points,
          wins: wins,
          losses: losses,
          games_played: games_played,
          rank_position: 999 // Will be recalculated dynamically
        })
        .eq('member_id', memberId)
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'Stats updated successfully', data: data[0] })
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from(tableName)
        .insert({
          member_id: memberId,
          full_name: member.full_name,
          points: points,
          wins: wins,
          losses: losses,
          games_played: games_played,
          rank_position: 999
        })
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'Stats created successfully', data: data[0] })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/rankings/overall - Get overall rankings across all tournaments  
router.get('/overall', async (req, res) => {
  try {
    const { gender } = req.query

    // List of all tournament result tables
    const tournamentTables = [
      'tspc_mens_doubles_results',
      'tspc_womens_doubles_results', 
      'tspc_mens_singles_results',
      'tspc_womens_singles_results',
      'tspc_mixed_doubles_results'
    ]

    // Aggregate stats for each member across all tournaments
    const memberStats = {}

    // Query each tournament table
    for (const tableName of tournamentTables) {
      try {
        const { data: results, error } = await supabase
          .from(tableName)
          .select('member_id, full_name, points, wins, losses, games_played')

        if (error) {
          console.log(`Warning: Could not query table ${tableName}:`, error.message)
          continue
        }

        // Aggregate stats for each member
        results?.forEach(result => {
          if (!memberStats[result.member_id]) {
            memberStats[result.member_id] = {
              id: result.member_id,
              full_name: result.full_name,
              total_points: 0,
              total_wins: 0,
              total_losses: 0,
              total_games: 0,
              tournaments_played: 0
            }
          }

          memberStats[result.member_id].total_points += result.points || 0
          memberStats[result.member_id].total_wins += result.wins || 0
          memberStats[result.member_id].total_losses += result.losses || 0
          memberStats[result.member_id].total_games += result.games_played || 0
          memberStats[result.member_id].tournaments_played += 1
        })
      } catch (tableError) {
        console.log(`Warning: Error querying table ${tableName}:`, tableError.message)
      }
    }

    // Convert to array and sort by total points
    let overallRankings = Object.values(memberStats)
      .sort((a, b) => b.total_points - a.total_points)
      .map((member, index) => ({
        ...member,
        rank_position: index + 1,
        win_rate: member.total_games > 0 ? (member.total_wins / member.total_games * 100).toFixed(1) : '0.0'
      }))

    // Get member info for gender filtering and additional details
    if (overallRankings.length > 0) {
      const memberIds = overallRankings.map(r => r.id)
      const { data: memberInfo } = await supabase
        .from('members')
        .select('id, gender, email, profile_photo')
        .in('id', memberIds)

      // Merge member info
      overallRankings = overallRankings.map(ranking => {
        const member = memberInfo?.find(m => m.id === ranking.id)
        return {
          ...ranking,
          gender: member?.gender,
          email: member?.email, 
          profile_photo: member?.profile_photo
        }
      })

      // Apply gender filter if specified
      if (gender && gender !== 'All') {
        overallRankings = overallRankings
          .filter(ranking => ranking.gender === gender)
          .map((member, index) => ({
            ...member,
            rank_position: index + 1 // Recalculate rank after filtering  
          }))
      }
    }

    res.json(overallRankings)
  } catch (error) {
    console.error('Overall rankings error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/rankings - Get all rankings (sorted by points)
router.get('/', async (req, res) => {
  try {
    const { tournament, gender } = req.query
    console.log(`🔍 Rankings request: tournament=${tournament}, gender=${gender}`);

    // Overall rankings (all tournaments) - aggregate from all tournament tables
    if (!tournament || tournament === 'All') {
      console.log('🎯 Executing overall rankings aggregation logic');
      // List of all tournament result tables
      const tournamentTables = [
        'tspc_mens_doubles_results',
        'tspc_womens_doubles_results', 
        'tspc_mens_singles_results',
        'tspc_womens_singles_results',
        'tspc_mixed_doubles_results'
      ]

      // Aggregate stats for each member across all tournaments
      const memberStats = {}

      // Query each tournament table
      for (const tableName of tournamentTables) {
        try {
          console.log(`📊 Querying table: ${tableName}`);
          const { data: results, error } = await supabase
            .from(tableName)
            .select('member_id, full_name, points, wins, losses, games_played')

          if (error) {
            console.log(`Warning: Could not query table ${tableName}:`, error.message)
            continue
          }

          console.log(`✅ Found ${results?.length || 0} results in ${tableName}`);
          // Aggregate stats for each member
          results?.forEach(result => {
            if (!memberStats[result.member_id]) {
              memberStats[result.member_id] = {
                id: result.member_id,
                full_name: result.full_name,
                total_points: 0,
                total_wins: 0,
                total_losses: 0,
                total_games: 0,
                tournaments_played: 0
              }
            }

            memberStats[result.member_id].total_points += result.points || 0
            memberStats[result.member_id].total_wins += result.wins || 0
            memberStats[result.member_id].total_losses += result.losses || 0
            memberStats[result.member_id].total_games += result.games_played || 0
            memberStats[result.member_id].tournaments_played += 1
          })
        } catch (tableError) {
          console.log(`Warning: Error querying table ${tableName}:`, tableError.message)
        }
      }

      console.log(`📈 Aggregated stats for ${Object.keys(memberStats).length} members`);
      // Convert to array and sort by total points
      let overallRankings = Object.values(memberStats)
        .sort((a, b) => b.total_points - a.total_points)
        .map((member, index) => ({
          ...member,
          rank_position: index + 1,
          win_rate: member.total_games > 0 ? (member.total_wins / member.total_games * 100).toFixed(1) : '0.0'
        }))

      // Get member info for gender filtering and additional details
      if (overallRankings.length > 0) {
        const memberIds = overallRankings.map(r => r.id)
        const { data: memberInfo } = await supabase
          .from('members')
          .select('id, gender, email, profile_photo')
          .in('id', memberIds)

        // Merge member info
        overallRankings = overallRankings.map(ranking => {
          const member = memberInfo?.find(m => m.id === ranking.id)
          return {
            ...ranking,
            gender: member?.gender,
            email: member?.email, 
            profile_photo: member?.profile_photo
          }
        })

        // Apply gender filter if specified
        if (gender && gender !== 'All') {
          overallRankings = overallRankings
            .filter(ranking => ranking.gender === gender)
            .map((member, index) => ({
              ...member,
              rank_position: index + 1 // Recalculate rank after filtering  
            }))
        }
      }

      console.log(`🏆 Returning ${overallRankings.length} overall rankings`);
      return res.json(overallRankings)
    }

    // Tournament-specific rankings using dedicated tournament tables
    // First try to get the table mapping from the tournament_tables registry
    const { data: tournamentTables, error: tableError } = await supabase
      .from('tournament_tables')
      .select('tournament_id, table_name')
      .eq('tournament_id', tournament)

    let tournamentTableName = null;

    // If found in registry, use that table
    if (!tableError && tournamentTables && tournamentTables.length > 0) {
      tournamentTableName = tournamentTables[0].table_name;
      console.log(`Found tournament table in registry: ${tournamentTableName}`);
    } else {
      // Fallback to hardcoded mapping for existing tournaments
      const tournamentTableMap = {
        // Men's Doubles Championship
        'd9af477a-a257-499b-bf34-61015dcc90b6': 'tspc_mens_doubles_results',
        // Women's Doubles Championship  
        'bad83357-7ca8-4527-9cfb-885ff0f9abc0': 'tspc_womens_doubles_results',
        // Men's Singles Championship
        'd4fc8133-1c30-4133-b6ed-ba4545e1f08e': 'tspc_mens_singles_results',
        // Women's Singles Championship
        'debf25dc-b1bb-4ecf-a194-9f1ddf063bb0': 'tspc_womens_singles_results',
        // Mixed Doubles Championship
        'aa176926-38a3-4f1e-9a51-d269195a4220': 'tspc_mixed_doubles_results'
      };
      
      tournamentTableName = tournamentTableMap[tournament];
      if (tournamentTableName) {
        console.log(`Using hardcoded mapping: ${tournamentTableName}`);
      }
    }

    // If we have a dedicated tournament table, use it
    if (tournamentTableName) {
      console.log(`Using tournament table: ${tournamentTableName}`);
      
      const { data: tournamentResults, error: resultsError } = await supabase
        .from(tournamentTableName)
        .select('*')
        .order('points', { ascending: false });

      if (resultsError) throw resultsError;

      // Transform the tournament results to match the overall rankings format
      // Use same field names (total_points, total_wins, etc.) for consistency
      let rankings = tournamentResults
        .map((result, index) => ({
          id: result.member_id,
          full_name: result.full_name,
          total_points: result.points,  // Map to total_points for consistency
          total_wins: result.wins,      // Map to total_wins for consistency
          total_losses: result.losses,  // Map to total_losses for consistency
          total_games: result.games_played,  // Map to total_games for consistency
          tournaments_played: 1,  // Single tournament context
          rank_position: index + 1,  // Dynamically calculated rank
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
          .filter(ranking => ranking.gender === gender)
          .map((ranking, index) => ({
            ...ranking,
            rank_position: index + 1  // Recalculate rank after filtering
          }));
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
