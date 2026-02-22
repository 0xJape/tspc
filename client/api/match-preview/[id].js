// Vercel Serverless Function to handle social media previews
export default async function handler(req, res) {
  const { id } = req.query
  
  if (!id) {
    return res.status(400).json({ error: 'Match ID is required' })
  }

  try {
    // Fetch match data from the API
    const apiUrl = process.env.VITE_API_URL || 'https://tspc-api.vercel.app'
    const response = await fetch(`${apiUrl}/api/matches/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch match data')
    }
    
    const match = await response.json()
    
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
        const tournamentResponse = await fetch(`${apiUrl}/api/tournaments/${match.tournament_id}`)
        if (tournamentResponse.ok) {
          const tournament = await tournamentResponse.json()
          tournamentName = tournament.name || ''
        }
      } catch (err) {
        console.error('Error fetching tournament:', err)
      }
    }

    const title = `${team1Name} vs ${team2Name}`
    const description = `${scoreDisplay}${tournamentName ? ' - ' + tournamentName : ' - Tupi Smash Pickleball Club'}`
    
    // Use the request's host for URLs
    const host = req.headers.host || 'tspc.vercel.app'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const matchUrl = `${protocol}://${host}/matches/${id}`
    const imageUrl = `${protocol}://${host}/tspc.svg`
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph Meta Tags for Facebook/Messenger -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${matchUrl}" />
    <meta property="og:site_name" content="Tupi Smash Pickleball Club" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Tupi Smash Pickleball Club Logo" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Redirect to the actual app -->
    <meta http-equiv="refresh" content="0; url=${matchUrl}" />
    <script>
        // Immediate redirect for browsers
        setTimeout(function() {
            window.location.replace('${matchUrl}');
        }, 100);
    </script>
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
    </div>
    <p class="loading">Loading match details...</p>
    <p style="font-size: 13px; color: #9ca3af; margin-top: 16px;">
        If you are not redirected, <a href="${matchUrl}">click here</a>
    </p>
</body>
</html>
`
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error generating match preview:', error)
    
    // Provide a more user-friendly error page
    const host = req.headers.host || 'tspc.vercel.app'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const homeUrl = `${protocol}://${host}`
    
    res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match Not Found - Tupi Smash Pickleball Club</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 500px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #ef4444; }
        a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <h1>⚠️ Match Not Found</h1>
    <p>Sorry, we couldn't load this match. It may have been removed or the ID is invalid.</p>
    <p><a href="${homeUrl}">← Return to Home</a></p>
</body>
</html>
    `)
  }
}
