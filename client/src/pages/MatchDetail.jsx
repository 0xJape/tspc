import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Share2, ArrowLeft, Calendar, Trophy, Users } from 'lucide-react'
import api from '../services/api'

function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    fetchMatchDetails()
  }, [id])

  useEffect(() => {
    if (match) {
      // Update meta tags for social sharing
      updateMetaTags()
    }
  }, [match, tournament])

  const fetchMatchDetails = async () => {
    try {
      setLoading(true)
      const matchResponse = await api.get(`/matches/${id}`)
      const matchData = matchResponse.data
      setMatch(matchData)

      if (matchData.tournament_id) {
        const tournamentResponse = await api.get(`/tournaments/${matchData.tournament_id}`)
        const tournamentData = tournamentResponse.data
        setTournament(tournamentData)
      }
    } catch (err) {
      console.error('Error fetching match details:', err)
      setError('Failed to load match details')
    } finally {
      setLoading(false)
    }
  }

  const updateMetaTags = () => {
    const title = `${getTeamName(1)} vs ${getTeamName(2)} - ${tournament?.name || 'Match'}`
    const description = `${getScoreDisplay()} - ${tournament?.name || 'Pickleball Match'}`
    const url = window.location.href

    // Update title
    document.title = title

    // Update or create meta tags
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', description)
    updateMetaTag('og:url', url)
    updateMetaTag('og:type', 'article')
    updateMetaTag('twitter:card', 'summary_large_card')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
  }

  const updateMetaTag = (property, content) => {
    let element = document.querySelector(`meta[property="${property}"]`)
    if (!element && property.startsWith('twitter:')) {
      element = document.querySelector(`meta[name="${property}"]`)
    }
    
    if (element) {
      element.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      if (property.startsWith('twitter:')) {
        meta.setAttribute('name', property)
      } else {
        meta.setAttribute('property', property)
      }
      meta.setAttribute('content', content)
      document.head.appendChild(meta)
    }
  }

  const getTeamName = (teamNumber) => {
    if (!match) return ''
    
    if (teamNumber === 1) {
      if (match.match_type === 'Doubles' && match.team1_partner) {
        return `${match.player1?.full_name || 'Team 1'} / ${match.team1_partner?.full_name || 'Partner'}`
      }
      return match.player1?.full_name || 'Player 1'
    } else {
      if (match.match_type === 'Doubles' && match.team2_partner) {
        return `${match.player2?.full_name || 'Team 2'} / ${match.team2_partner?.full_name || 'Partner'}`
      }
      return match.player2?.full_name || 'Player 2'
    }
  }

  const getScoreDisplay = () => {
    if (!match) return ''
    
    const scores = []
    scores.push(`${match.set1_team1_score}-${match.set1_team2_score}`)
    scores.push(`${match.set2_team1_score}-${match.set2_team2_score}`)
    if (match.set3_team1_score !== null && match.set3_team2_score !== null) {
      scores.push(`${match.set3_team1_score}-${match.set3_team2_score}`)
    }
    return scores.join(', ')
  }

  const handleShare = async () => {
    // Use the preview URL for social media sharing (with meta tags)
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/api/match-preview/${id}`
    const title = `${getTeamName(1)} vs ${getTeamName(2)}`
    const text = `Check out this match: ${getScoreDisplay()}`

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
          copyToClipboard(shareUrl)
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 3000)
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  const isWinningTeam = (teamNumber) => {
    if (!match || !match.winner_id) return false
    if (teamNumber === 1) {
      return match.winner_id === match.player1_id
    } else {
      return match.winner_id === match.player2_id
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Match not found'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {shareSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Link copied to clipboard!
        </div>
      )}

      {/* Tournament Info */}
      {tournament && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Tournament</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{tournament.name}</h1>
          {tournament.category && (
            <p className="text-blue-100">{tournament.category}</p>
          )}
        </div>
      )}

      {/* Match Info Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Match Type & Date */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">{match.match_type}</span>
              {match.round && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {match.round}
                </span>
              )}
            </div>
            {match.match_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(match.match_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="p-6">
          {/* Team 1 */}
          <div className={`flex items-center justify-between p-4 rounded-lg mb-3 ${
            isWinningTeam(1) ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 flex-1">
              {isWinningTeam(1) && (
                <Trophy className="w-5 h-5 text-green-600" />
              )}
              <div>
                {match.player1 && (
                  <div className="font-bold text-lg">{match.player1.full_name}</div>
                )}
                {match.match_type === 'Doubles' && match.team1_partner && (
                  <div className="text-gray-600">{match.team1_partner.full_name}</div>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-2xl font-bold">
              <span className={isWinningTeam(1) ? 'text-green-600' : 'text-gray-700'}>
                {match.set1_team1_score}
              </span>
              <span className={isWinningTeam(1) ? 'text-green-600' : 'text-gray-700'}>
                {match.set2_team1_score}
              </span>
              {match.set3_team1_score !== null && (
                <span className={isWinningTeam(1) ? 'text-green-600' : 'text-gray-700'}>
                  {match.set3_team1_score}
                </span>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            isWinningTeam(2) ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3 flex-1">
              {isWinningTeam(2) && (
                <Trophy className="w-5 h-5 text-green-600" />
              )}
              <div>
                {match.player2 && (
                  <div className="font-bold text-lg">{match.player2.full_name}</div>
                )}
                {match.match_type === 'Doubles' && match.team2_partner && (
                  <div className="text-gray-600">{match.team2_partner.full_name}</div>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-2xl font-bold">
              <span className={isWinningTeam(2) ? 'text-green-600' : 'text-gray-700'}>
                {match.set1_team2_score}
              </span>
              <span className={isWinningTeam(2) ? 'text-green-600' : 'text-gray-700'}>
                {match.set2_team2_score}
              </span>
              {match.set3_team2_score !== null && (
                <span className={isWinningTeam(2) ? 'text-green-600' : 'text-gray-700'}>
                  {match.set3_team2_score}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {match.winner && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-t border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Winner: {match.winner.full_name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchDetail
