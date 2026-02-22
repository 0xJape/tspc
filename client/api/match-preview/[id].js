// Vercel Serverless Function to handle social media previews
export default async function handler(req, res) {
  const { id } = req.query
  
  if (!id) {
    return res.status(400).json({ error: 'Match ID is required' })
  }

  try {
    // Fetch match data from the API
    const apiUrl = process.env.VITE_API_URL || 'https://tspc-api.vercel.app'
    const response = await fetch(`${apiUrl}/api/share/match/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch match data')
    }
    
    const data = await response.json()
    const clientUrl = process.env.VITE_CLIENT_URL || 'https://tspc.vercel.app'
    const matchUrl = `${clientUrl}/matches/${id}`
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${matchUrl}" />
    <meta property="og:site_name" content="Tupi Smash Pickleball Club" />
    <meta property="og:image" content="${clientUrl}/tspc.svg" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_card" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    <meta name="twitter:image" content="${clientUrl}/tspc.svg" />
    
    <!-- Redirect to the actual app -->
    <meta http-equiv="refresh" content="0; url=${matchUrl}" />
    <script>
        window.location.replace('${matchUrl}');
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        .match-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 30px;
            margin: 20px 0;
        }
        h1 { color: #1a1a1a; }
        .score { 
            font-size: 24px; 
            font-weight: bold; 
            color: #059669; 
            margin: 15px 0;
        }
        a {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="match-card">
        <h1>${data.title}</h1>
        <div class="score">${data.score}</div>
        ${data.tournament ? `<p><strong>${data.tournament}</strong></p>` : ''}
        ${data.date ? `<p>${data.date}</p>` : ''}
    </div>
    <p>Redirecting to match details...</p>
    <p>If you are not redirected, <a href="${matchUrl}">click here</a>.</p>
</body>
</html>
`
    
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error generating match preview:', error)
    res.status(500).send(`
<!DOCTYPE html>
<html>
<head><title>Match Not Found</title></head>
<body>
    <h1>Match Not Found</h1>
    <p>Sorry, we couldn't load this match.</p>
</body>
</html>
    `)
  }
}
