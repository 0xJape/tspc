// Vercel Serverless Function to handle social media previews
export default async function handler(req, res) {
  // Always set headers first
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  
  const { id } = req.query
  
  if (!id) {
    console.error('No match ID provided')
    return res.status(200).send(generateErrorPage('Invalid match ID', 'No match ID was provided in the URL.'))
  }

  // Detect if this is a bot/crawler (for social media preview)
  const userAgent = req.headers['user-agent'] || ''
  const isBot = /bot|crawler|spider|crawling|facebook|twitter|whatsapp|telegram|slack|discord|pinterest|linkedin/i.test(userAgent)
  console.log('User agent:', userAgent)
  console.log('Is bot:', isBot)

  try {
    // Fetch match data from the API
    const apiUrl = process.env.API_URL || 'https://tspc-iota.vercel.app/api'
    console.log('Fetching match from:', `${apiUrl}/matches/${id}`)
    
    const response = await fetch(`${apiUrl}/matches/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText)
      return res.status(200).send(generateErrorPage('Match not found', `Could not load match data (Status: ${response.status})`))
    }
    
    const match = await response.json()
    console.log('Match fetched successfully:', match.id)
    
    // Build team names
    let team1Name = match.player1?.full_name || 'Team 1'
    let team2Name = match.player2?.full_name || 'Team 2'
    
    if (match.match_type === 'Doubles') {
      if (match.team1_partner) team1Name += ` / ${match.team1_partner.full_name}`
      if (match.team2_partner) team2Name += ` / ${match.team2_partner.full_name}`
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

    // Fetch tournament data if available
    let tournamentName = ''
    if (match.tournament_id) {
      try {
        const tournamentResponse = await fetch(`${apiUrl}/tournaments/${match.tournament_id}`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        if (tournamentResponse.ok) {
          const tournament = await tournamentResponse.json()
          tournamentName = tournament.name || ''
          console.log('Tournament fetched:', tournamentName)
        }
      } catch (err) {
        console.error('Error fetching tournament:', err)
        // Continue without tournament name
      }
    }

    const html = generateMatchPage(match, tournamentName, id, req.headers.host, isBot)
    
    return res.status(200).send(html)
  } catch (error) {
    console.error('Error generating match preview:', error)
    console.error('Error details:', error.message)
    
    // Always return 200 with error page for better social media compatibility
    return res.status(200).send(generateErrorPage('Match Unavailable', 'This match could not be loaded. Please try again later.'))
  }
}

// Helper function to generate error page
function generateErrorPage(title, message) {
  return `
<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Tupi Smash Pickleball Club</title>
    
    <!-- Required Open Graph Meta Tags -->
    <meta property="og:title" content="Tupi Smash Pickleball Club" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://tspc-v1.vercel.app/tspc.svg" />
    <meta property="og:url" content="https://tspc-v1.vercel.app" />
    
    <!-- Recommended Open Graph Meta Tags -->
    <meta property="og:description" content="Pickleball matches and tournaments" />
    <meta property="og:site_name" content="Tupi Smash Pickleball Club" />
    <meta property="og:locale" content="en_US" />
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 500px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #ef4444; }
    </style>
</head>
<body>
    <h1>⚠️ ${title}</h1>
    <p>${message}</p>
</body>
</html>
  `
}

// Helper function to generate match page
function generateMatchPage(match, tournamentName, matchId, host, isBot = false) {
  // Build team names
  let team1Name = match.player1?.full_name || 'Team 1'
  let team2Name = match.player2?.full_name || 'Team 2'
  
  if (match.match_type === 'Doubles') {
    if (match.team1_partner) team1Name += ` / ${match.team1_partner.full_name}`
    if (match.team2_partner) team2Name += ` / ${match.team2_partner.full_name}`
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
  const description = `${scoreDisplay}${tournamentName ? ' - ' + tournamentName : ' - Tupi Smash Pickleball Club'}`
  
  // Use the request's host for URLs
  const protocol = (host && host.includes('localhost')) ? 'http' : 'https'
  const matchUrl = `${protocol}://${host || 'tspc-v1.vercel.app'}/matches/${matchId}`
  const imageUrl = `${protocol}://${host || 'tspc-v1.vercel.app'}/tspc.png`
  
  // Format match date for OGP
  const matchDate = match.match_date ? new Date(match.match_date).toISOString() : new Date().toISOString()
  
  return `
<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Required Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${matchUrl}" />
    
    <!-- Recommended Open Graph Meta Tags -->
    <meta property="og:description" content="${description}" />
    <meta property="og:site_name" content="Tupi Smash Pickleball Club" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:determiner" content="" />
    
    <!-- Structured Image Properties -->
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title} - ${scoreDisplay}" />
    
    <!-- Article Structured Properties -->
    <meta property="article:published_time" content="${matchDate}" />
    <meta property="article:section" content="Sports" />
    <meta property="article:tag" content="Pickleball" />
    <meta property="article:tag" content="${match.match_type}" />
    ${tournamentName ? `<meta property="article:tag" content="${tournamentName}" />` : ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    ${!isBot ? `
    <!-- Redirect to the actual app (only for real users, not bots) -->
    <meta http-equiv="refresh" content="0; url=${matchUrl}" />
    <script>
        // Immediate redirect for browsers
        setTimeout(function() {
            window.location.replace('${matchUrl}');
        }, 100);
    </script>
    ` : '<!-- Bot detected: Skipping redirect for proper preview card generation -->'}
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background: #f3f4f6;
        }
        .match-card {
            background: white;
            border-radius: 16px;
            padding: 40px 30px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 { 
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 16px;
            line-height: 1.4;
        }
        .score { 
            font-size: 32px; 
            font-weight: bold; 
            color: #059669; 
            margin: 20px 0;
            letter-spacing: 0.5px;
        }
        .tournament {
            color: #6b7280;
            font-size: 16px;
            margin: 12px 0;
            font-weight: 500;
        }
        .date {
            color: #9ca3af;
            font-size: 14px;
            margin-top: 16px;
        }
        a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        .loading {
            color: #6b7280;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="match-card">
        <h1>${team1Name}<br/>vs<br/>${team2Name}</h1>
        <div class="score">${scoreDisplay}</div>
        ${tournamentName ? `<p class="tournament">${tournamentName}</p>` : ''}
        ${match.match_date ? `<p class="date">${new Date(match.match_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
    ${!isBot ? `
    <p class="loading">Loading match details...</p>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        If you are not redirected, <a href="${matchUrl}">click here</a>
    </p>
    ` : `
    <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        <a href="${matchUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Match Details</a>
    </p>
    `}If you are not redirected, <a href="${matchUrl}">click here</a>
    </p>
</body>
</html>
`
}
