import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return new Response('Missing match ID', { status: 400 })
    }

    // Fetch match data
    const apiUrl = 'https://tspc-iota.vercel.app/api'
    const response = await fetch(`${apiUrl}/matches/${id}`)
    
    if (!response.ok) {
      // Return a generic image on error
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e3a5f',
              padding: 40,
            }}
          >
            <div style={{ fontSize: 60, color: 'white', fontWeight: 'bold' }}>
              🏓 TSPC Match
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      )
    }

    const match = await response.json()
    
    // Build team names
    let team1Name = match.player1?.full_name || 'Team 1'
    let team2Name = match.player2?.full_name || 'Team 2'
    
    if (match.match_type === 'Doubles') {
      if (match.team1_partner) team1Name += ` / ${match.team1_partner.full_name}`
      if (match.team2_partner) team2Name += ` / ${match.team2_partner.full_name}`
    }

    // Build scores
    const set1 = `${match.set1_team1_score}-${match.set1_team2_score}`
    const set2 = `${match.set2_team1_score}-${match.set2_team2_score}`
    const set3 = match.set3_team1_score !== null && match.set3_team2_score !== null 
      ? `${match.set3_team1_score}-${match.set3_team2_score}` 
      : null

    // Determine winner
    const team1Won = match.winner_id === match.player1_id
    const team2Won = match.winner_id === match.player2_id

    // Fetch tournament name
    let tournamentName = 'Tupi Smash Pickleball Club'
    if (match.tournament_id) {
      try {
        const tournamentRes = await fetch(`${apiUrl}/tournaments/${match.tournament_id}`)
        if (tournamentRes.ok) {
          const tournament = await tournamentRes.json()
          tournamentName = tournament.name || tournamentName
        }
      } catch (e) {
        // Continue with default
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: 50,
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 36, color: '#94a3b8' }}>
              🏓 {tournamentName}
            </span>
          </div>

          {/* Match Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: 20,
              padding: 40,
              justifyContent: 'center',
            }}
          >
            {/* VS Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 40,
              }}
            >
              {/* Team 1 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: team1Won ? '#22c55e' : '#f8fafc',
                    textAlign: 'center',
                  }}
                >
                  {team1Name}
                </span>
                {team1Won && (
                  <span style={{ fontSize: 24, color: '#22c55e', marginTop: 10 }}>
                    🏆 WINNER
                  </span>
                )}
              </div>

              {/* VS */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 30px',
                }}
              >
                <span style={{ fontSize: 40, color: '#64748b', fontWeight: 'bold' }}>
                  VS
                </span>
              </div>

              {/* Team 2 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: team2Won ? '#22c55e' : '#f8fafc',
                    textAlign: 'center',
                  }}
                >
                  {team2Name}
                </span>
                {team2Won && (
                  <span style={{ fontSize: 24, color: '#22c55e', marginTop: 10 }}>
                    🏆 WINNER
                  </span>
                )}
              </div>
            </div>

            {/* Scores */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 30,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  padding: '20px 40px',
                }}
              >
                <span style={{ fontSize: 20, color: '#94a3b8' }}>Set 1</span>
                <span style={{ fontSize: 48, fontWeight: 'bold', color: '#f8fafc' }}>
                  {set1}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#334155',
                  borderRadius: 12,
                  padding: '20px 40px',
                }}
              >
                <span style={{ fontSize: 20, color: '#94a3b8' }}>Set 2</span>
                <span style={{ fontSize: 48, fontWeight: 'bold', color: '#f8fafc' }}>
                  {set2}
                </span>
              </div>
              {set3 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#334155',
                    borderRadius: 12,
                    padding: '20px 40px',
                  }}
                >
                  <span style={{ fontSize: 20, color: '#94a3b8' }}>Set 3</span>
                  <span style={{ fontSize: 48, fontWeight: 'bold', color: '#f8fafc' }}>
                    {set3}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <span style={{ fontSize: 24, color: '#64748b' }}>
              tspc-v1.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}
