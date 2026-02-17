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
