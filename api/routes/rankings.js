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

    // Tournament-specific rankings
    // Get all matches for this tournament
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

    // Calculate tournament points for each player
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
