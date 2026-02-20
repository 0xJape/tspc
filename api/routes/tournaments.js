const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// GET /api/tournaments - Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/tournaments/upcoming - Get upcoming tournaments
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .gte('date', today)
      .in('status', ['Upcoming', 'Ongoing'])
      .order('date', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/tournaments/:id/participants - Get tournament participants
router.get('/:id/participants', async (req, res) => {
  try {
    const { status } = req.query // Allow filtering by status
    let query = supabase
      .from('tournament_participants')
      .select(`
        id,
        status,
        registered_at,
        member_id,
        partner_id
      `)
      .eq('tournament_id', req.params.id)

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('registered_at', { ascending: true })

    if (error) {
      console.error('Error fetching participants:', error)
      throw error
    }

    // Fetch member details for each participant
    const participantsWithMembers = await Promise.all(
      data.map(async (participant) => {
        const memberPromise = supabase
          .from('members')
          .select('id, full_name, email, skill_level, profile_photo')
          .eq('id', participant.member_id)
          .single()

        const partnerPromise = participant.partner_id
          ? supabase
              .from('members')
              .select('id, full_name, email, skill_level, profile_photo')
              .eq('id', participant.partner_id)
              .single()
          : Promise.resolve({ data: null })

        const [memberRes, partnerRes] = await Promise.all([memberPromise, partnerPromise])

        return {
          id: participant.id,
          status: participant.status,
          registered_at: participant.registered_at,
          member: memberRes.data,
          partner: partnerRes.data,
        }
      })
    )

    res.json(participantsWithMembers)
  } catch (error) {
    console.error('Participants route error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/tournaments/:id/matches - Get tournament matches
router.get('/:id/matches', async (req, res) => {
  try {
    // Fetch matches first
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', req.params.id)
      .order('match_date', { ascending: true })

    if (matchesError) throw matchesError

    // Fetch related member data separately to avoid nested query issues
    const matchesWithDetails = await Promise.all(matches.map(async (match) => {
      const [player1Res, player2Res, winnerRes, team1PartnerRes, team2PartnerRes] = await Promise.all([
        match.player1_id ? supabase.from('members').select('id, full_name, skill_level, profile_photo').eq('id', match.player1_id).single() : Promise.resolve({ data: null }),
        match.player2_id ? supabase.from('members').select('id, full_name, skill_level, profile_photo').eq('id', match.player2_id).single() : Promise.resolve({ data: null }),
        match.winner_id ? supabase.from('members').select('id, full_name').eq('id', match.winner_id).single() : Promise.resolve({ data: null }),
        match.team1_partner_id ? supabase.from('members').select('id, full_name, skill_level, profile_photo').eq('id', match.team1_partner_id).single() : Promise.resolve({ data: null }),
        match.team2_partner_id ? supabase.from('members').select('id, full_name, skill_level, profile_photo').eq('id', match.team2_partner_id).single() : Promise.resolve({ data: null })
      ])

      return {
        ...match,
        player1: player1Res.data,
        player2: player2Res.data,
        winner: winnerRes.data,
        team1_partner: team1PartnerRes.data,
        team2_partner: team2PartnerRes.data
      }
    }))

    res.json(matchesWithDetails)
  } catch (error) {
    console.error('Error fetching tournament matches:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/tournaments/:id/register - Register for tournament
router.post('/:id/register', async (req, res) => {
  try {
    const { memberId, partnerId } = req.body

    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([{
        tournament_id: req.params.id,
        member_id: memberId,
        partner_id: partnerId || null,
        status: 'pending' // Always start as pending
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /api/tournaments/:id/participants/:participantId - Approve/reject registration
router.put('/:id/participants/:participantId', async (req, res) => {
  try {
    const { status } = req.body // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' })
    }

    const { data, error } = await supabase
      .from('tournament_participants')
      .update({ status })
      .eq('id', req.params.participantId)
      .eq('tournament_id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// POST /api/tournaments/:id/matches - Create match for tournament
router.post('/:id/matches', async (req, res) => {
  try {
    const { 
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
    
    // Helper function to calculate winner based on sets
    function calculateWinner(s1_t1, s1_t2, s2_t1, s2_t2, s3_t1, s3_t2) {
      let team1Sets = 0
      let team2Sets = 0
      
      if (s1_t1 !== undefined && s1_t2 !== undefined) {
        if (parseInt(s1_t1) > parseInt(s1_t2)) team1Sets++
        else if (parseInt(s1_t2) > parseInt(s1_t1)) team2Sets++
      }
      
      if (s2_t1 !== undefined && s2_t2 !== undefined) {
        if (parseInt(s2_t1) > parseInt(s2_t2)) team1Sets++
        else if (parseInt(s2_t2) > parseInt(s2_t1)) team2Sets++
      }
      
      if (s3_t1 !== undefined && s3_t1 !== null && s3_t1 !== '' &&
          s3_t2 !== undefined && s3_t2 !== null && s3_t2 !== '') {
        if (parseInt(s3_t1) > parseInt(s3_t2)) team1Sets++
        else if (parseInt(s3_t2) > parseInt(s3_t1)) team2Sets++
      }
      
      return { team1Sets, team2Sets }
    }
    
    // Calculate winner and sets if scores are provided
    let winner_id = null
    let status = 'Scheduled'
    let team1_sets_won = 0
    let team2_sets_won = 0
    
    if (set1_team1_score !== undefined && set1_team2_score !== undefined &&
        set2_team1_score !== undefined && set2_team2_score !== undefined) {
      const { team1Sets, team2Sets } = calculateWinner(
        set1_team1_score, set1_team2_score,
        set2_team1_score, set2_team2_score,
        set3_team1_score, set3_team2_score
      )
      team1_sets_won = team1Sets
      team2_sets_won = team2Sets
      winner_id = team1Sets > team2Sets ? player1_id : (team2Sets > team1Sets ? player2_id : null)
      status = 'Finished'
    }

    const matchData = {
      tournament_id: req.params.id,
      match_type,
      player1_id,
      player2_id,
      match_date: match_date || new Date().toISOString(),
      status,
      ...(round && { round })
    }

    // Add partner IDs if doubles match
    if (match_type === 'Doubles') {
      if (team1_partner_id) matchData.team1_partner_id = team1_partner_id
      if (team2_partner_id) matchData.team2_partner_id = team2_partner_id
    }

    // Add set scores if provided
    if (set1_team1_score !== undefined && set1_team1_score !== '') {
      matchData.set1_team1_score = parseInt(set1_team1_score)
      matchData.set1_team2_score = parseInt(set1_team2_score)
      matchData.set2_team1_score = parseInt(set2_team1_score)
      matchData.set2_team2_score = parseInt(set2_team2_score)
      
      if (set3_team1_score !== undefined && set3_team1_score !== null && set3_team1_score !== '') {
        matchData.set3_team1_score = parseInt(set3_team1_score)
        matchData.set3_team2_score = parseInt(set3_team2_score)
      }
      
      if (winner_id) matchData.winner_id = winner_id
    }

    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single()

    if (error) throw error

    // Award points if match is finished with a winner
    if (winner_id && status === 'Finished') {
      console.log(`🏆 Match finished! winner_id=${winner_id}, tournamentId=${req.params.id}`)
      try {
        // Determine winning and losing teams
        const winningTeam = winner_id === player1_id 
          ? [player1_id, team1_partner_id].filter(Boolean)
          : [player2_id, team2_partner_id].filter(Boolean)
        
        const losingTeam = winner_id === player1_id
          ? [player2_id, team2_partner_id].filter(Boolean)
          : [player1_id, team1_partner_id].filter(Boolean)

        // Award 6 points to each winning team member
        for (const memberId of winningTeam) {
          const { data: member } = await supabase
            .from('members')
            .select('wins, points')
            .eq('id', memberId)
            .single()

          if (member) {
            await supabase
              .from('members')
              .update({
                wins: member.wins + 1,
                points: member.points + 6
              })
              .eq('id', memberId)
          }
        }

        // Award 3 points to each losing team member
        for (const memberId of losingTeam) {
          const { data: member } = await supabase
            .from('members')
            .select('losses, points')
            .eq('id', memberId)
            .single()

          if (member) {
            await supabase
              .from('members')
              .update({
                losses: member.losses + 1,
                points: member.points + 3
              })
              .eq('id', memberId)
          }
        }

        // Update tournament leaderboard table (tspc_*_results)
        try {
          const tournamentId = req.params.id

          // Use same ID-based logic as rankings.js GET endpoint
          // First check tournament_tables registry, then fallback to hardcoded map
          let tableName = null

          const { data: registryEntry } = await supabase
            .from('tournament_tables')
            .select('table_name')
            .eq('tournament_id', tournamentId)
            .maybeSingle()

          if (registryEntry?.table_name) {
            tableName = registryEntry.table_name
          } else {
            // Same hardcoded map as rankings.js
            const tournamentTableMap = {
              'd9af477a-a257-499b-bf34-61015dcc90b6': 'tspc_mens_doubles_results',
              'bad83357-7ca8-4527-9cfb-885ff0f9abc0': 'tspc_womens_doubles_results',
              'd4fc8133-1c30-4133-b6ed-ba4545e1f08e': 'tspc_mens_singles_results',
              'debf25dc-b1bb-4ecf-a194-9f1ddf063bb0': 'tspc_womens_singles_results',
              'aa176926-38a3-4f1e-9a51-d269195a4220': 'tspc_mixed_doubles_results'
            }
            tableName = tournamentTableMap[tournamentId] || null

            // If still not found, try name/category as last resort
            if (!tableName) {
              const { data: tournament } = await supabase
                .from('tournaments')
                .select('name, category')
                .eq('id', tournamentId)
                .single()

              if (tournament) {
                const name = tournament.name || ''
                const cat = tournament.category || ''
                if (cat === 'Singles' && name.toLowerCase().includes('men') && !name.toLowerCase().includes('women')) {
                  tableName = 'tspc_mens_singles_results'
                } else if (cat === 'Singles' && name.toLowerCase().includes('women')) {
                  tableName = 'tspc_womens_singles_results'
                } else if (cat === 'Doubles' && name.toLowerCase().includes('men') && !name.toLowerCase().includes('women') && !name.toLowerCase().includes('mixed')) {
                  tableName = 'tspc_mens_doubles_results'
                } else if (cat === 'Doubles' && name.toLowerCase().includes('women')) {
                  tableName = 'tspc_womens_doubles_results'
                } else if (cat === 'Mixed Doubles' || name.toLowerCase().includes('mixed')) {
                  tableName = 'tspc_mixed_doubles_results'
                }
              }
            }
          }

          console.log(`📋 Tournament leaderboard table: ${tableName || 'NONE FOUND - skipping'}`)

          if (tableName) {
            const updateLeaderboard = async (memberId, pts, isWin) => {
              const { data: memberInfo } = await supabase
                .from('members')
                .select('full_name')
                .eq('id', memberId)
                .single()

              const { data: existing, error: fetchErr } = await supabase
                .from(tableName)
                .select('*')
                .eq('member_id', memberId)
                .maybeSingle()

              if (fetchErr) {
                console.error(`Error fetching existing record from ${tableName}:`, fetchErr.message)
                return
              }

              if (existing) {
                const { error: updateErr } = await supabase
                  .from(tableName)
                  .update({
                    points: (existing.points || 0) + pts,
                    wins: (existing.wins || 0) + (isWin ? 1 : 0),
                    losses: (existing.losses || 0) + (isWin ? 0 : 1),
                    games_played: (existing.games_played || 0) + 1
                  })
                  .eq('member_id', memberId)
                if (updateErr) {
                  console.error(`Error updating ${tableName} for ${memberId}:`, updateErr.message)
                } else {
                  console.log(`✅ Updated ${tableName}: member=${memberInfo?.full_name}, +${pts}pts, isWin=${isWin}`)
                }
              } else {
                const { error: insertErr } = await supabase
                  .from(tableName)
                  .insert([{
                    member_id: memberId,
                    full_name: memberInfo?.full_name || '',
                    points: pts,
                    wins: isWin ? 1 : 0,
                    losses: isWin ? 0 : 1,
                    games_played: 1,
                    rank_position: 999
                  }])
                if (insertErr) {
                  console.error(`Error inserting into ${tableName} for ${memberId}:`, insertErr.message)
                } else {
                  console.log(`✅ Inserted into ${tableName}: member=${memberInfo?.full_name}, ${pts}pts, isWin=${isWin}`)
                }
              }
            }

            for (const memberId of winningTeam) {
              await updateLeaderboard(memberId, 6, true)
            }
            for (const memberId of losingTeam) {
              await updateLeaderboard(memberId, 3, false)
            }
          }
        } catch (leaderboardError) {
          console.error('Error updating tournament leaderboard:', leaderboardError)
        }
      } catch (statsError) {
        console.error('Error updating player stats:', statsError)
        // Don't fail the match creation if stats update fails
      }
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Error creating match:', error)
    res.status(400).json({ error: error.message })
  }
})

// GET /api/tournaments/:id - Get tournament by ID (MUST come after specific routes)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: 'Tournament not found' })
  }
})

// POST /api/tournaments - Create tournament
router.post('/', async (req, res) => {
  try {
    const {
      name, date, location, category, skill_level,
      registration_deadline, status, max_participants, description
    } = req.body

    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        name, date, location, category, skill_level,
        registration_deadline, status: status || 'Upcoming',
        max_participants, description
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT /api/tournaments/:id - Update tournament
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Tournament deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
