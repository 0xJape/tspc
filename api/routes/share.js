const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// Get match metadata for social sharing (GET /api/share/match/:id)
router.get('/match/:id', async (req, res) => {
  try {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (matchError) throw matchError

    // Fetch related data
    const [player1Res, player2Res, team1PartnerRes, team2PartnerRes, tournamentRes] = await Promise.all([
      match.player1_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player1_id).single() : Promise.resolve({ data: null }),
      match.player2_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player2_id).single() : Promise.resolve({ data: null }),
      match.team1_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team1_partner_id).single() : Promise.resolve({ data: null }),
      match.team2_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team2_partner_id).single() : Promise.resolve({ data: null }),
      match.tournament_id ? supabase.from('tournaments').select('id, name, category').eq('id', match.tournament_id).single() : Promise.resolve({ data: null })
    ])

    const player1 = player1Res.data
    const player2 = player2Res.data
    const team1Partner = team1PartnerRes.data
    const team2Partner = team2PartnerRes.data
    const tournament = tournamentRes.data

    // Build team names
    let team1Name = player1?.full_name || 'Team 1'
    let team2Name = player2?.full_name || 'Team 2'
    
    if (match.match_type === 'Doubles') {
      if (team1Partner) team1Name += ` / ${team1Partner.full_name}`
      if (team2Partner) team2Name += ` / ${team2Partner.full_name}`
    }

    // Build score display
    const scores = [
      `${match.set1_team1_score}-${match.set1_team2_score}`,
      `${match.set2_team1_score}-${match.set2_team2_score}`
    ]
    if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
      scores.push(`${match.set3_team1_score}-${match.set3_team2_score}`)
    }
    const scoreDisplay = scores.join(', ')

    const title = `${team1Name} vs ${team2Name}`
    const description = `${scoreDisplay}${tournament ? ' - ' + tournament.name : ''}`
    const matchDate = match.match_date ? new Date(match.match_date).toLocaleDateString() : ''

    res.json({
      title,
      description,
      tournament: tournament?.name || null,
      category: tournament?.category || match.match_type,
      date: matchDate,
      team1Name,
      team2Name,
      score: scoreDisplay
    })
  } catch (error) {
    console.error('Error fetching match metadata:', error)
    res.status(500).json({ error: error.message })
  }
})

// Generate HTML with OG meta tags for social media crawlers
router.get('/match/:id/html', async (req, res) => {
  try {
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (matchError) throw matchError

    // Fetch related data
    const [player1Res, player2Res, team1PartnerRes, team2PartnerRes, tournamentRes] = await Promise.all([
      match.player1_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player1_id).single() : Promise.resolve({ data: null }),
      match.player2_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.player2_id).single() : Promise.resolve({ data: null }),
      match.team1_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team1_partner_id).single() : Promise.resolve({ data: null }),
      match.team2_partner_id ? supabase.from('members').select('id, full_name, profile_photo').eq('id', match.team2_partner_id).single() : Promise.resolve({ data: null }),
      match.tournament_id ? supabase.from('tournaments').select('id, name, category').eq('id', match.tournament_id).single() : Promise.resolve({ data: null })
    ])

    const player1 = player1Res.data
    const player2 = player2Res.data
    const team1Partner = team1PartnerRes.data
    const team2Partner = team2PartnerRes.data
    const tournament = tournamentRes.data

    // Build team names
    let team1Name = player1?.full_name || 'Team 1'
    let team2Name = player2?.full_name || 'Team 2'
    
    if (match.match_type === 'Doubles') {
      if (team1Partner) team1Name += ` / ${team1Partner.full_name}`
      if (team2Partner) team2Name += ` / ${team2Partner.full_name}`
    }

    // Build score display
    const scores = [
      `${match.set1_team1_score}-${match.set1_team2_score}`,
      `${match.set2_team1_score}-${match.set2_team2_score}`
    ]
    if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
      scores.push(`${match.set3_team1_score}-${match.set3_team2_score}`)
    }
    const scoreDisplay = scores.join(', ')

    const title = `${team1Name} vs ${team2Name}`
    const description = `${scoreDisplay}${tournament ? ' - ' + tournament.name : ''}`
    const url = `${req.protocol}://${req.get('host')}/matches/${req.params.id}`

    // Generate HTML with OG meta tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Tupi Smash Pickleball Club" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_card" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    
    <!-- Redirect to the actual app -->
    <meta http-equiv="refresh" content="0; url=${url}" />
    <script>
        // Immediate redirect for browsers that don't support meta refresh
        window.location.replace('${url}');
    </script>
</head>
<body>
    <p>Redirecting to match details...</p>
    <p>If you are not redirected, <a href="${url}">click here</a>.</p>
</body>
</html>
`
    
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (error) {
    console.error('Error generating match HTML:', error)
    res.status(500).send('<html><body>Error loading match</body></html>')
  }
})

module.exports = router
