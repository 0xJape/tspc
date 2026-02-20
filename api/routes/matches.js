const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Helper function to update tournament result tables when matches are recorded
async function updateTournamentResults(tournamentId, match) {
  try {
    console.log(`🏆 Updating tournament results for match:`, match.id);

    // Get tournament details to determine the correct result table
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name, category')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) throw tournamentError;

    // Determine which tournament result table to update
    let tableName = null;
    if (tournament.category === 'Singles' && tournament.name.includes('Men')) {
      tableName = 'tspc_mens_singles_results';
    } else if (tournament.category === 'Singles' && tournament.name.includes('Women')) {
      tableName = 'tspc_womens_singles_results';
    } else if (tournament.category === 'Doubles' && tournament.name.includes('Men')) {
      tableName = 'tspc_mens_doubles_results';
    } else if (tournament.category === 'Doubles' && tournament.name.includes('Women')) {
      tableName = 'tspc_womens_doubles_results';
    } else if (tournament.category === 'Mixed Doubles' || tournament.name.includes('Mixed')) {
      tableName = 'tspc_mixed_doubles_results';
    }

    if (!tableName) {
      console.log(`⚠️  Could not determine result table for tournament: ${tournament.name}`);
      return;
    }

    console.log(`📊 Updating table: ${tableName}`);

    // Point system: Winner gets 6 points, loser gets 3 points
    const winnerPoints = 6;
    const loserPoints = 3;

    // Get member details for both participants
    const memberIds = [match.player1_id, match.player2_id];
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, full_name')
      .in('id', memberIds);

    if (membersError) throw membersError;

    // Update results for both participants
    for (const memberId of memberIds) {
      const member = members.find(m => m.id === memberId);
      if (!member) continue;

      const isWinner = match.winner_id === memberId;
      const points = isWinner ? winnerPoints : loserPoints;
      const wins = isWinner ? 1 : 0;
      const losses = isWinner ? 0 : 1;

      // Check if member already has a record in this tournament result table
      const { data: existing, error: existingError } = await supabase
        .from(tableName)
        .select('*')
        .eq('member_id', memberId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from(tableName)
          .update({
            points: existing.points + points,
            wins: existing.wins + wins,
            losses: existing.losses + losses,
            games_played: existing.games_played + 1
          })
          .eq('member_id', memberId);

        if (updateError) throw updateError;
        console.log(`✅ Updated ${member.full_name}: +${points} points, +${wins} wins, +${losses} losses`);
      } else {
        // Insert new record - rank_position will be calculated but we set it to 999 initially
        const { error: insertError } = await supabase
          .from(tableName)
          .insert({
            member_id: memberId,
            full_name: member.full_name,
            points: points,
            wins: wins,
            losses: losses,
            games_played: 1,
            rank_position: 999  // Temporary rank, will be recalculated when rankings are queried
          });

        if (insertError) throw insertError;
        console.log(`🆕 Created new record for ${member.full_name}: ${points} points, ${wins} wins, ${losses} losses`);
      }
    }

    console.log(`🎯 Tournament results updated successfully for ${tournament.name}`);
  } catch (error) {
    console.error('❌ Error updating tournament results:', error.message);
    // Don't throw error to prevent match recording from failing
  }
}

// Helper function to calculate winner based on sets
function calculateWinner(set1_team1, set1_team2, set2_team1, set2_team2, set3_team1, set3_team2, player1_id, player2_id) {
  let team1Sets = 0
  let team2Sets = 0
  
  // Count sets won by each team
  if (set1_team1 > set1_team2) team1Sets++
  else if (set1_team2 > set1_team1) team2Sets++
  
  if (set2_team1 > set2_team2) team1Sets++
  else if (set2_team2 > set2_team1) team2Sets++
  
  if (set3_team1 !== null && set3_team2 !== null) {
    if (set3_team1 > set3_team2) team1Sets++
    else if (set3_team2 > set3_team1) team2Sets++
  }
  
  // Return winner_id and sets won
  return {
    winner_id: team1Sets > team2Sets ? player1_id : (team2Sets > team1Sets ? player2_id : null),
    team1_sets: team1Sets,
    team2_sets: team2Sets
  }
}

// Record a new match (POST /api/matches)
router.post('/', async (req, res) => {
  try {
    const { 
      tournament_id, 
      match_type = 'Singles',
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
      match_date 
    } = req.body

    // Calculate winner based on sets
    const { winner_id, team1_sets, team2_sets } = calculateWinner(
      parseInt(set1_team1_score || 0),
      parseInt(set1_team2_score || 0),
      parseInt(set2_team1_score || 0),
      parseInt(set2_team2_score || 0),
      set3_team1_score ? parseInt(set3_team1_score) : null,
      set3_team2_score ? parseInt(set3_team2_score) : null,
      player1_id,
      player2_id
    )

    // Insert match record
    const matchData = {
      tournament_id,
      match_type,
      player1_id,
      player2_id,
      set1_team1_score: parseInt(set1_team1_score || 0),
      set1_team2_score: parseInt(set1_team2_score || 0),
      set2_team1_score: parseInt(set2_team1_score || 0),
      set2_team2_score: parseInt(set2_team2_score || 0),
      winner_id,
      match_date,
      status: 'Finished',
      ...(round && { round })
    }

    // Add partner IDs if doubles match
    if (match_type === 'Doubles') {
      if (team1_partner_id) matchData.team1_partner_id = team1_partner_id
      if (team2_partner_id) matchData.team2_partner_id = team2_partner_id
    }

    // Add set 3 scores if provided
    if (set3_team1_score !== undefined && set3_team1_score !== null && set3_team1_score !== '') {
      matchData.set3_team1_score = parseInt(set3_team1_score)
    }
    if (set3_team2_score !== undefined && set3_team2_score !== null && set3_team2_score !== '') {
      matchData.set3_team2_score = parseInt(set3_team2_score)
    }

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert([matchData])
      .select()

    if (matchError) throw matchError

    // Update tournament result tables if this is a tournament match
    if (tournament_id) {
      await updateTournamentResults(tournament_id, match[0])
    }

    res.json({ 
      success: true, 
      match: match[0],
      message: 'Match recorded successfully and tournament results updated' 
    })
  } catch (error) {
    console.error('Error creating match:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all matches (GET /api/matches)
router.get('/', async (req, res) => {
  try {
    // Fetch matches first
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false })

    if (matchesError) throw matchesError

    // Fetch related data separately to avoid nested query issues
    const matchesWithDetails = await Promise.all(matches.map(async (match) => {
      const [player1Res, player2Res, winnerRes, team1PartnerRes, team2PartnerRes, tournamentRes] = await Promise.all([
        match.player1_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player1_id).single() : Promise.resolve({ data: null }),
        match.player2_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player2_id).single() : Promise.resolve({ data: null }),
        match.winner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.winner_id).single() : Promise.resolve({ data: null }),
        match.team1_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team1_partner_id).single() : Promise.resolve({ data: null }),
        match.team2_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team2_partner_id).single() : Promise.resolve({ data: null }),
        match.tournament_id ? supabase.from('tournaments').select('id, name').eq('id', match.tournament_id).single() : Promise.resolve({ data: null })
      ])

      return {
        ...match,
        player1: player1Res.data,
        player2: player2Res.data,
        winner: winnerRes.data,
        team1_partner: team1PartnerRes.data,
        team2_partner: team2PartnerRes.data,
        tournament: tournamentRes.data
      }
    }))

    res.json(matchesWithDetails)
  } catch (error) {
    console.error('Error fetching matches:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get match by ID (GET /api/matches/:id)
router.get('/:id', async (req, res) => {
  try {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (matchError) throw matchError

    // Fetch related data
    const [player1Res, player2Res, winnerRes, team1PartnerRes, team2PartnerRes] = await Promise.all([
      match.player1_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player1_id).single() : Promise.resolve({ data: null }),
      match.player2_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player2_id).single() : Promise.resolve({ data: null }),
      match.winner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.winner_id).single() : Promise.resolve({ data: null }),
      match.team1_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team1_partner_id).single() : Promise.resolve({ data: null }),
      match.team2_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team2_partner_id).single() : Promise.resolve({ data: null })
    ])

    const matchWithDetails = {
      ...match,
      player1: player1Res.data,
      player2: player2Res.data,
      winner: winnerRes.data,
      team1_partner: team1PartnerRes.data,
      team2_partner: team2PartnerRes.data
    }

    res.json(matchWithDetails)
  } catch (error) {
    console.error('Error fetching match:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update match scores (PUT /api/matches/:id)
router.put('/:id', async (req, res) => {
  try {
    const { 
      set1_team1_score,
      set1_team2_score,
      set2_team1_score,
      set2_team2_score,
      set3_team1_score,
      set3_team2_score,
      status, 
      round 
    } = req.body

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (matchError) throw matchError

    const updateData = {}

    // If set scores provided, use them
    if (set1_team1_score !== undefined) {
      updateData.set1_team1_score = parseInt(set1_team1_score) || 0
      updateData.set1_team2_score = parseInt(set1_team2_score) || 0
      updateData.set2_team1_score = parseInt(set2_team1_score) || 0
      updateData.set2_team2_score = parseInt(set2_team2_score) || 0
      
      // Handle optional set 3
      if (set3_team1_score !== undefined && set3_team1_score !== null && set3_team1_score !== '') {
        updateData.set3_team1_score = parseInt(set3_team1_score)
      } else {
        updateData.set3_team1_score = null
      }
      
      if (set3_team2_score !== undefined && set3_team2_score !== null && set3_team2_score !== '') {
        updateData.set3_team2_score = parseInt(set3_team2_score)
      } else {
        updateData.set3_team2_score = null
      }

      // Calculate winner from sets
      const { winner_id, team1_sets, team2_sets } = calculateWinner(
        updateData.set1_team1_score,
        updateData.set1_team2_score,
        updateData.set2_team1_score,
        updateData.set2_team2_score,
        updateData.set3_team1_score,
        updateData.set3_team2_score,
        match.player1_id,
        match.player2_id
      )
      
      updateData.winner_id = winner_id
    }

    if (status !== undefined) updateData.status = status
    if (round !== undefined) {
      updateData.round = round || null
    }

    console.log('Updating match with data:', updateData)

    // Update match
    const { data, error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    // Note: Point adjustments when editing existing match scores are not currently supported
    // to avoid complex reversal logic. Points are awarded only when matches are initially created.

    res.json(data)
  } catch (error) {
    console.error('Error updating match:', error)
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
